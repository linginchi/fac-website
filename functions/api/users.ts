/**
 * FAC Platform V5.1 - Users API
 * Cloudflare Workers + D1 Database
 * 
 * 核心原则：API 返回的数据必须已脱敏，严禁泄露真实联系信息
 */

export interface Env {
  DB: D1Database;
}

// 响应工具函数
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

// 验证用户 ID 格式
function isValidUserId(id: string): boolean {
  return /^[a-zA-Z0-9_-]{8,64}$/.test(id);
}

export default async function usersHandler(context: PagesFunction<Env>) {
  const { request, env } = context;
  const { pathname, searchParams } = new URL(request.url);
  
  // CORS 预检
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
    // GET /api/users - 列表查询 (支持按能力标签筛选)
    if (request.method === 'GET' && pathname === '/api/users') {
      const skillFilter = searchParams.get('skill');
      const categoryFilter = searchParams.get('category');
      const role = searchParams.get('role'); // 'A' | 'B'
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
      const offset = (page - 1) * limit;

      let sql = `
        SELECT 
          u.id, u.display_name, u.bio, u.current_role, 
          u.membership_tier, u.vault_visibility, u.linkedin_headline,
          u.created_at,
          c.phone_masked as phone, c.email_masked as email, c.wechat_masked as wechat
        FROM users u
        LEFT JOIN contact_info c ON u.id = c.user_id
        WHERE 1=1
      `;
      const params: (string | number)[] = [];

      // 角色筛选
      if (role) {
        sql += ` AND u.current_role = ?`;
        params.push(role);
      }

      // 能力标签筛选
      if (skillFilter) {
        sql += ` AND u.id IN (
          SELECT user_id FROM skill_tags 
          WHERE label LIKE ? OR category = ?
        )`;
        params.push(`%${skillFilter}%`, skillFilter);
      }

      // 分类筛选
      if (categoryFilter) {
        sql += ` AND u.id IN (
          SELECT user_id FROM skill_tags WHERE category = ?
        )`;
        params.push(categoryFilter);
      }

      // 计数
      const countSql = sql.replace(/SELECT.*?FROM/s, 'SELECT COUNT(*) as total FROM');
      const countResult = await env.DB.prepare(countSql).bind(...params).first();
      const total = countResult?.total as number || 0;

      // 分页
      sql += ` ORDER BY u.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const { results } = await env.DB.prepare(sql).bind(...params).all();

      return json({
        success: true,
        data: results,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    }

    // GET /api/users/:id - 详情
    if (request.method === 'GET' && pathname.match(/^\/api\/users\/[^/]+$/)) {
      const userId = pathname.split('/').pop();
      if (!userId || !isValidUserId(userId)) {
        return error('Invalid user ID');
      }

      // 查询用户基本信息 (已脱敏)
      const user = await env.DB.prepare(`
        SELECT 
          u.id, u.display_name, u.bio, u.current_role,
          u.membership_tier, u.vault_visibility, u.linkedin_headline,
          u.created_at,
          c.phone_masked as phone, c.email_masked as email, c.wechat_masked as wechat
        FROM users u
        LEFT JOIN contact_info c ON u.id = c.user_id
        WHERE u.id = ?
      `).bind(userId).first();

      if (!user) {
        return error('User not found', 404);
      }

      // 查询能力矩阵
      const { results: skills } = await env.DB.prepare(`
        SELECT id, label, weight, category, verified, source, created_at
        FROM skill_tags
        WHERE user_id = ?
        ORDER BY weight DESC, created_at DESC
      `).bind(userId).all();

      return json({
        success: true,
        data: {
          ...user,
          skill_matrix: skills,
        },
      });
    }

    // POST /api/users - 创建用户
    if (request.method === 'POST' && pathname === '/api/users') {
      const body = await request.json<{
        id: string;
        email?: string;
        display_name?: string;
        current_role?: 'A' | 'B' | 'neutral';
      }>();

      if (!body.id || !isValidUserId(body.id)) {
        return error('Invalid user ID');
      }

      // 检查是否已存在
      const existing = await env.DB.prepare('SELECT id FROM users WHERE id = ?')
        .bind(body.id)
        .first();
      
      if (existing) {
        return error('User already exists', 409);
      }

      const maskedName = body.display_name ? maskName(body.display_name) : '匿名用户';

      await env.DB.prepare(`
        INSERT INTO users (id, email, display_name, current_role, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
      `).bind(
        body.id,
        body.email || null,
        maskedName,
        body.current_role || 'neutral'
      ).run();

      return json({ success: true, data: { id: body.id } }, 201);
    }

    // PUT /api/users/:id/role - 切换身份 (Party A/B)
    if (request.method === 'PUT' && pathname.match(/^\/api\/users\/[^/]+\/role$/)) {
      const userId = pathname.split('/')[3];
      const body = await request.json<{ role: 'A' | 'B' | 'neutral' }>();

      if (!['A', 'B', 'neutral'].includes(body.role)) {
        return error('Invalid role');
      }

      await env.DB.prepare(`
        UPDATE users SET current_role = ?, updated_at = datetime('now') WHERE id = ?
      `).bind(body.role, userId).run();

      return json({ success: true });
    }

    // GET /api/users/:id/skills - 获取用户能力矩阵
    if (request.method === 'GET' && pathname.match(/^\/api\/users\/[^/]+\/skills$/)) {
      const userId = pathname.split('/')[3];
      
      const { results } = await env.DB.prepare(`
        SELECT id, label, weight, category, verified, source, created_at
        FROM skill_tags
        WHERE user_id = ?
        ORDER BY weight DESC, created_at DESC
      `).bind(userId).all();

      return json({ success: true, data: results });
    }

    // POST /api/users/:id/skills - 添加能力标签
    if (request.method === 'POST' && pathname.match(/^\/api\/users\/[^/]+\/skills$/)) {
      const userId = pathname.split('/')[3];
      const body = await request.json<{
        label: string;
        category: string;
        weight?: number;
        source?: 'linkedin' | 'manual' | 'ai-extracted';
      }>();

      if (!body.label || !body.category) {
        return error('Label and category are required');
      }

      const skillId = `skill_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await env.DB.prepare(`
        INSERT INTO skill_tags (id, user_id, label, weight, category, source)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        skillId,
        userId,
        body.label,
        body.weight || 50,
        body.category,
        body.source || 'manual'
      ).run();

      return json({ success: true, data: { id: skillId } }, 201);
    }

    return error('Not found', 404);

  } catch (err) {
    console.error('API Error:', err);
    return error('Internal server error', 500);
  }
}
