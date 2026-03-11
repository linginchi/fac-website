/**
 * FAC Platform V5.1 - Tasks API
 * Smart Escrow 30% 订金托管机制
 */

export interface Env {
  DB: D1Database;
}

const json = (data: unknown, status = 200) => 
  new Response(JSON.stringify(data), {
    status,
    headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

const error = (message: string, status = 400) => 
  json({ success: false, error: message }, status);

// 生成脱敏名称
function maskName(name: string): string {
  if (!name || name.length < 2) return '**';
  return name[0] + '*'.repeat(Math.min(name.length - 1, 3));
}

// 30% 订金计算
function calculateDeposit(totalAmount: number): number {
  return Math.floor(totalAmount * 0.3);
}

export default async function tasksHandler(context: PagesFunction<Env>) {
  const { request, env } = context;
  const { pathname, searchParams } = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    // GET /api/tasks - 任务列表
    if (request.method === 'GET' && pathname === '/api/tasks') {
      const status = searchParams.get('status');
      const partyA = searchParams.get('party_a');
      const partyB = searchParams.get('party_b');
      const skill = searchParams.get('skill');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
      const offset = (page - 1) * limit;

      let sql = `
        SELECT 
          t.id, t.title, t.description, t.required_skills,
          t.total_amount, t.deposit_amount, t.platform_fee, t.status,
          t.party_a_id, t.party_a_masked_name,
          t.party_b_id, t.party_b_masked_name,
          t.created_at, t.published_at, t.deposit_locked_at, t.started_at
        FROM tasks t
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      if (status) {
        sql += ` AND t.status = ?`;
        params.push(status);
      }
      if (partyA) {
        sql += ` AND t.party_a_id = ?`;
        params.push(partyA);
      }
      if (partyB) {
        sql += ` AND t.party_b_id = ?`;
        params.push(partyB);
      }
      if (skill) {
        sql += ` AND t.required_skills LIKE ?`;
        params.push(`%${skill}%`);
      }

      // 计数
      const countSql = sql.replace(/SELECT.*?FROM/s, 'SELECT COUNT(*) as total FROM');
      const countResult = await env.DB.prepare(countSql).bind(...params).first();
      const total = countResult?.total as number || 0;

      sql += ` ORDER BY t.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const { results } = await env.DB.prepare(sql).bind(...params).all();

      return json({
        success: true,
        data: results,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // GET /api/tasks/:id - 任务详情
    if (request.method === 'GET' && pathname.match(/^\/api\/tasks\/[^/]+$/)) {
      const taskId = pathname.split('/').pop();

      const task = await env.DB.prepare(`
        SELECT 
          t.*,
          (SELECT json_group_array(json_object(
            'id', s.id, 'label', s.label, 'weight', s.weight,
            'category', s.category, 'verified', s.verified
          )) FROM skill_tags s 
          WHERE s.user_id = t.party_b_id 
          AND s.label IN (SELECT value FROM json_each(t.required_skills))
          ) as matched_skills
        FROM tasks t
        WHERE t.id = ?
      `).bind(taskId).first();

      if (!task) {
        return error('Task not found', 404);
      }

      return json({ success: true, data: task });
    }

    // POST /api/tasks - 创建任务 (甲方)
    if (request.method === 'POST' && pathname === '/api/tasks') {
      const body = await request.json<{
        party_a_id: string;
        title: string;
        description: string;
        required_skills: string[];
        total_amount: number;
      }>();

      if (!body.party_a_id || !body.title || !body.total_amount) {
        return error('Missing required fields');
      }

      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const depositAmount = calculateDeposit(body.total_amount);

      // 获取甲方脱敏名称
      const partyA = await env.DB.prepare('SELECT display_name FROM users WHERE id = ?')
        .bind(body.party_a_id)
        .first();
      const maskedName = partyA ? maskName(partyA.display_name as string) : '甲方 ***';

      await env.DB.prepare(`
        INSERT INTO tasks (
          id, party_a_id, party_a_masked_name, title, description,
          required_skills, total_amount, deposit_amount, platform_fee, status, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', datetime('now'))
      `).bind(
        taskId,
        body.party_a_id,
        maskedName,
        body.title,
        body.description || '',
        JSON.stringify(body.required_skills || []),
        body.total_amount,
        depositAmount,
        50 // 固定平台费
      ).run();

      return json({ 
        success: true, 
        data: { 
          id: taskId, 
          deposit_amount: depositAmount,
          message: '任务已创建，请锁定 30% 订金后发布'
        } 
      }, 201);
    }

    // PUT /api/tasks/:id/lock-deposit - 锁定 30% 订金
    if (request.method === 'PUT' && pathname.match(/^\/api\/tasks\/[^/]+\/lock-deposit$/)) {
      const taskId = pathname.split('/')[3];

      const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?')
        .bind(taskId)
        .first();

      if (!task) {
        return error('Task not found', 404);
      }

      if (task.status !== 'draft' && task.status !== 'published') {
        return error('Task cannot lock deposit at current status');
      }

      await env.DB.prepare(`
        UPDATE tasks 
        SET status = 'deposit_locked', deposit_locked_at = datetime('now')
        WHERE id = ?
      `).bind(taskId).run();

      return json({ 
        success: true, 
        message: '30% 订金已锁定，乙方确认后可开始工作' 
      });
    }

    // PUT /api/tasks/:id/accept - 乙方接受任务
    if (request.method === 'PUT' && pathname.match(/^\/api\/tasks\/[^/]+\/accept$/)) {
      const taskId = pathname.split('/')[3];
      const body = await request.json<{ party_b_id: string }>();

      const task = await env.DB.prepare('SELECT * FROM tasks WHERE id = ?')
        .bind(taskId)
        .first();

      if (!task) {
        return error('Task not found', 404);
      }

      if (task.status !== 'deposit_locked') {
        return error('Deposit must be locked before accepting');
      }

      // 获取乙方脱敏名称
      const partyB = await env.DB.prepare('SELECT display_name FROM users WHERE id = ?')
        .bind(body.party_b_id)
        .first();
      const maskedName = partyB ? maskName(partyB.display_name as string) : '乙方 ***';

      await env.DB.prepare(`
        UPDATE tasks 
        SET 
          party_b_id = ?, 
          party_b_masked_name = ?,
          status = 'in_progress',
          started_at = datetime('now')
        WHERE id = ?
      `).bind(body.party_b_id, maskedName, taskId).run();

      return json({ 
        success: true, 
        message: '任务已开始，请按约定完成交付' 
      });
    }

    // PUT /api/tasks/:id/deliver - 乙方提交交付
    if (request.method === 'PUT' && pathname.match(/^\/api\/tasks\/[^/]+\/deliver$/)) {
      const taskId = pathname.split('/')[3];
      const body = await request.json<{ deliverables: string[] }>();

      await env.DB.prepare(`
        UPDATE tasks 
        SET 
          status = 'delivered',
          delivered_at = datetime('now'),
          deliverables = ?
        WHERE id = ? AND status = 'in_progress'
      `).bind(JSON.stringify(body.deliverables || []), taskId).run();

      return json({ success: true, message: '交付已提交，等待甲方验收' });
    }

    // PUT /api/tasks/:id/complete - 甲方验收完成
    if (request.method === 'PUT' && pathname.match(/^\/api\/tasks\/[^/]+\/complete$/)) {
      const taskId = pathname.split('/')[3];
      const body = await request.json<{
        rating: number;
        review?: string;
      }>();

      await env.DB.prepare(`
        UPDATE tasks 
        SET 
          status = 'completed',
          completed_at = datetime('now'),
          party_a_rating = ?,
          party_a_review = ?
        WHERE id = ? AND status = 'delivered'
      `).bind(body.rating, body.review || null, taskId).run();

      return json({ 
        success: true, 
        message: '任务已完成，剩余款项已释放给乙方' 
      });
    }

    return error('Not found', 404);

  } catch (err) {
    console.error('API Error:', err);
    return error('Internal server error', 500);
  }
}
