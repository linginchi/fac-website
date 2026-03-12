// Authentication middleware
import type { Env } from '../types';
import { verifyJWT } from '../utils/jwt';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'A' | 'B' | 'neutral';
    tier: 'basic' | 'professional' | 'executive';
  };
}

export async function authMiddleware(request: AuthenticatedRequest, env: Env): Promise<Response | null> {
  // Skip auth for public routes
  const publicPaths = ['/auth/', '/health', '/api/public/'];
  if (publicPaths.some(path => request.url.includes(path))) {
    return null;
  }
  
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' }
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  
  const token = authHeader.substring(7);
  const payload = await verifyJWT(token, env);
  
  if (!payload) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  
  // Attach user info to request
  request.user = {
    id: payload.sub,
    email: payload.email,
    role: payload.role,
    tier: payload.tier,
  };
  
  return null; // Continue to handler
}

// CORS middleware
export function corsMiddleware(request: Request): Response | null {
  const origin = request.headers.get('Origin') || '*';
  
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  
  return null; // Continue to handler
}

// Rate limiting middleware (simple in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function rateLimitMiddleware(request: Request, maxRequests: number = 100, windowMs: number = 60000): Promise<Response | null> {
  const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
  const now = Date.now();
  
  const record = rateLimitMap.get(clientIP);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs });
    return null;
  }
  
  if (record.count >= maxRequests) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' }
    }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  }
  
  record.count++;
  return null;
}
