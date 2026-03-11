/**
 * FAC Platform V5.1 - Privacy API
 * 隐私授权机制 (Privacy Guard)
 * 原则：API 返回的数据必须已脱敏，真实信息仅在授权后通过独立接口获取
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
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });

const error = (message: string, status = 400) => 
  json({ success: false, error: message }, status);

// 授权有效期 (30天)
const AUTH_EXPIRY_DAYS = 30;

export default async function privacyHandler(context: PagesFunction<Env>) {
  const { request, env } = context;
  const { pathname } = new URL(request.url);

  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    // GET /api/privacy/contact/:userId - 获取用户联系信息 (脱敏)
    if (request.method === 'GET' && pathname.match(/^\/api\/privacy\/contact\/[^/]+$/)) {
      const userId = pathname.split('/').pop();

      const contact = await env.DB.prepare(`
        SELECT phone_masked as phone, email_masked as email, wechat_masked as wechat
        FROM contact_info
        WHERE user_id = ?
      `).bind(userId).first();

      if (!contact) {
        return json({ 
          success: true, 
          data: { phone: null, email: null, wechat: null }
        });
      }

      return json({ success: true, data: contact });
    }

    // POST /api/privacy/contact - 设置/更新联系信息
    if (request.method === 'POST' && pathname === '/api/privacy/contact') {
      const body = await request.json<{
        user_id: string;
        phone?: string;
        email?: string;
        wechat?: string;
      }>();

      if (!body.user_id) {
        return error('User ID is required');
      }

      // 使用 UPSERT 语法
      await env.DB.prepare(`
        INSERT INTO contact_info (id, user_id, phone_real, email_real, wechat_real, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          phone_real = excluded.phone_real,
          email_real = excluded.email_real,
          wechat_real = excluded.wechat_real,
          updated_at = datetime('now')
      `).bind(
        `contact_${body.user_id}`,
        body.user_id,
        body.phone || null,
        body.email || null,
        body.wechat || null
      ).run();

      return json({ 
        success: true, 
        message: 'Contact info updated',
        data: {
          phone: body.phone ? body.phone.replace(/(\d{4})$/, '****') : null,
          email: body.email ? body.email.replace(/^(.)(.*)(@.*)$/, '$1***$3') : null,
          wechat: body.wechat ? 'wxid_****' : null,
        }
      });
    }

    // GET /api/privacy/authorizations - 获取授权列表
    if (request.method === 'GET' && pathname === '/api/privacy/authorizations') {
      const url = new URL(request.url);
      const grantorId = url.searchParams.get('grantor'); // 授权方 (乙方)
      const granteeId = url.searchParams.get('grantee'); // 被授权方 (甲方)

      let sql = `
        SELECT 
          pa.id, pa.grantor_id, pa.grantee_id, pa.scope,
          pa.authorized_at, pa.expires_at,
          u1.display_name as grantor_name,
          u2.display_name as grantee_name
        FROM privacy_authorizations pa
        JOIN users u1 ON pa.grantor_id = u1.id
        JOIN users u2 ON pa.grantee_id = u2.id
        WHERE pa.revoked_at IS NULL AND pa.expires_at > datetime('now')
      `;
      const params: string[] = [];

      if (grantorId) {
        sql += ` AND pa.grantor_id = ?`;
        params.push(grantorId);
      }
      if (granteeId) {
        sql += ` AND pa.grantee_id = ?`;
        params.push(granteeId);
      }

      sql += ` ORDER BY pa.authorized_at DESC`;

      const { results } = await env.DB.prepare(sql).bind(...params).all();

      return json({ success: true, data: results });
    }

    // POST /api/privacy/authorize - 乙方授权给甲方
    if (request.method === 'POST' && pathname === '/api/privacy/authorize') {
      const body = await request.json<{
        grantor_id: string;    // 乙方 (授权方)
        grantee_id: string;    // 甲方 (被授权方)
        scope: ('phone' | 'email' | 'wechat')[];
      }>();

      if (!body.grantor_id || !body.grantee_id || !body.scope?.length) {
        return error('Missing required fields');
      }

      // 检查是否已有有效授权
      const existing = await env.DB.prepare(`
        SELECT id FROM privacy_authorizations
        WHERE grantor_id = ? AND grantee_id = ?
        AND revoked_at IS NULL AND expires_at > datetime('now')
      `).bind(body.grantor_id, body.grantee_id).first();

      if (existing) {
        // 更新现有授权
        await env.DB.prepare(`
          UPDATE privacy_authorizations
          SET scope = ?, authorized_at = datetime('now'),
              expires_at = datetime('now', '+${AUTH_EXPIRY_DAYS} days')
          WHERE id = ?
        `).bind(JSON.stringify(body.scope), existing.id).run();

        return json({ success: true, message: 'Authorization updated' });
      }

      // 创建新授权
      const authId = `auth_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      await env.DB.prepare(`
        INSERT INTO privacy_authorizations (
          id, grantor_id, grantee_id, scope, 
          authorized_at, expires_at
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now', '+${AUTH_EXPIRY_DAYS} days'))
      `).bind(
        authId,
        body.grantor_id,
        body.grantee_id,
        JSON.stringify(body.scope)
      ).run();

      return json({ 
        success: true, 
        data: { id: authId },
        message: `隐私授权成功，有效期 ${AUTH_EXPIRY_DAYS} 天`
      }, 201);
    }

    // DELETE /api/privacy/authorize/:id - 撤销授权
    if (request.method === 'DELETE' && pathname.match(/^\/api\/privacy\/authorize\/[^/]+$/)) {
      const authId = pathname.split('/').pop();

      await env.DB.prepare(`
        UPDATE privacy_authorizations
        SET revoked_at = datetime('now')
        WHERE id = ?
      `).bind(authId).run();

      return json({ success: true, message: 'Authorization revoked' });
    }

    // GET /api/privacy/reveal/:userId - 获取真实联系信息 (需验证授权)
    if (request.method === 'GET' && pathname.match(/^\/api\/privacy\/reveal\/[^/]+$/)) {
      const url = new URL(request.url);
      const targetUserId = pathname.split('/').pop(); // 目标用户 (乙方)
      const requesterId = url.searchParams.get('requester'); // 请求者 (甲方)

      if (!requesterId) {
        return error('Requester ID is required', 401);
      }

      // 验证授权
      const auth = await env.DB.prepare(`
        SELECT scope FROM privacy_authorizations
        WHERE grantor_id = ? AND grantee_id = ?
        AND revoked_at IS NULL AND expires_at > datetime('now')
      `).bind(targetUserId, requesterId).first();

      if (!auth) {
        return error('No valid authorization found', 403);
      }

      const authorizedScope = JSON.parse(auth.scope as string) as string[];

      // 根据授权范围返回真实信息
      const contact = await env.DB.prepare(`
        SELECT phone_real, email_real, wechat_real
        FROM contact_info
        WHERE user_id = ?
      `).bind(targetUserId).first();

      if (!contact) {
        return error('Contact info not found', 404);
      }

      const result: Record<string, string | null> = {};
      if (authorizedScope.includes('phone')) result.phone = contact.phone_real as string;
      if (authorizedScope.includes('email')) result.email = contact.email_real as string;
      if (authorizedScope.includes('wechat')) result.wechat = contact.wechat_real as string;

      // 记录访问日志 (生产环境应添加)
      // await logPrivacyAccess(targetUserId, requesterId, authorizedScope);

      return json({
        success: true,
        data: result,
        authorized_scope: authorizedScope,
        expires_at: auth.expires_at,
      });
    }

    return error('Not found', 404);

  } catch (err) {
    console.error('Privacy API Error:', err);
    return error('Internal server error', 500);
  }
}
