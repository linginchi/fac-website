/**
 * FAC Platform V5.1 - Cloudflare Workers API Router
 * 统一入口，处理所有 /api/* 请求
 */

import usersHandler from './users';
import tasksHandler from './tasks';
import privacyHandler from './privacy';

export interface Env {
  DB: D1Database;
  CACHE: KVNamespace;
  PLATFORM_VERSION: string;
  PLATFORM_NAME: string;
  DEPOSIT_RATE: string;
  PLATFORM_FEE: string;
}

// CORS 响应头
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 处理 CORS 预检请求
function handleCORS(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// 统一错误响应
function errorResponse(message: string, status = 400): Response {
  return new Response(
    JSON.stringify({ success: false, error: message }),
    {
      status,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

// 统一成功响应
function successResponse(data: unknown): Response {
  return new Response(
    JSON.stringify({ success: true, data }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    }
  );
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 处理 CORS 预检
  if (request.method === 'OPTIONS') {
    return handleCORS();
  }

  try {
    // 路由分发
    if (pathname.startsWith('/api/users')) {
      return await usersHandler(context);
    }
    
    if (pathname.startsWith('/api/tasks')) {
      return await tasksHandler(context);
    }
    
    if (pathname.startsWith('/api/privacy')) {
      return await privacyHandler(context);
    }

    // 健康检查端点
    if (pathname === '/api/health') {
      return successResponse({
        status: 'ok',
        version: env.PLATFORM_VERSION,
        name: env.PLATFORM_NAME,
        timestamp: new Date().toISOString(),
      });
    }

    // 404
    return errorResponse('Not found', 404);

  } catch (err) {
    console.error('API Error:', err);
    return errorResponse(
      err instanceof Error ? err.message : 'Internal server error',
      500
    );
  }
};

export default onRequest;
