// FAC Platform V5.1 - Cloudflare Workers API
// Main entry point

import type { Env } from './types';
import { corsMiddleware, authMiddleware, rateLimitMiddleware } from './middleware/auth';
import { handleAuthRoutes } from './routes/auth';
import { handleUserRoutes } from './routes/user';
import { handleReferralRoutes } from './routes/referral';
import { handleBuybackRoutes } from './routes/buyback';
import { handleParseRoutes } from './routes/parse';
import { handleAuthV2Routes } from './routes/authV2';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Apply CORS middleware
    const corsResponse = corsMiddleware(request);
    if (corsResponse) return corsResponse;
    
    // Apply rate limiting (100 requests per minute per IP)
    const rateLimitResponse = await rateLimitMiddleware(request, 100, 60000);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Route handling
    const path = url.pathname;
    
    // Skip auth for public routes
    const publicRoutes = ['/health', '/api/parse/', '/api/public/'];
    const isPublicRoute = publicRoutes.some(route => path.startsWith(route) || path === route);
    
    if (!isPublicRoute) {
      // Apply auth middleware
      const authResponse = await authMiddleware(request, env);
      if (authResponse) return authResponse;
    }
    
    try {
      // Health check
      if (path === '/health' && request.method === 'GET') {
        return new Response(JSON.stringify({
          success: true,
          data: {
            status: 'healthy',
            version: '5.1.0',
            timestamp: new Date().toISOString(),
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      // Auth routes (includes /auth/ and /api/auth/)
      if (path.startsWith('/auth/') || path.startsWith('/api/auth/')) {
        const response = await handleAuthRoutes(request, env);
        return addCorsHeaders(response, request);
      }
      
      // AI Parse routes
      if (path.startsWith('/api/parse/')) {
        const response = await handleParseRoutes(request, env);
        return addCorsHeaders(response, request);
      }
      
      // Auth V2 routes (phone + password)
      if (path.startsWith('/api/v2/auth/')) {
        const response = await handleAuthV2Routes(request, env);
        return addCorsHeaders(response, request);
      }
      
      // User routes
      if (path.startsWith('/api/user/')) {
        const response = await handleUserRoutes(request, env);
        return addCorsHeaders(response, request);
      }
      
      // Referral routes
      if (path.startsWith('/api/referral/')) {
        const response = await handleReferralRoutes(request, env);
        return addCorsHeaders(response, request);
      }
      
      // Buyback routes
      if (path.startsWith('/api/buyback/')) {
        const response = await handleBuybackRoutes(request, env);
        return addCorsHeaders(response, request);
      }
      
      // Public API routes (no auth required)
      if (path === '/api/public/config') {
        return new Response(JSON.stringify({
          success: true,
          data: {
            platformName: 'FAC Platform',
            version: '5.1.0',
            features: {
              linkedinAuth: true,
              referrals: true,
              buyback: true,
              wallet: true,
            },
            facConfig: {
              totalSupply: 1000000000,
              rewardLinkedInAuth: 80,
              rewardProfileComplete: 20,
              rewardReferral: 100,
            }
          }
        }), { headers: { 'Content-Type': 'application/json' } });
      }
      
      // 404 Not Found
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Route ${path} not found`
        }
      }), { status: 404, headers: { 'Content-Type': 'application/json' } }), request);
      
    } catch (error) {
      console.error('Unhandled error:', error);
      return addCorsHeaders(new Response(JSON.stringify({
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred'
        }
      }), { status: 500, headers: { 'Content-Type': 'application/json' } }), request);
    }
  },
};

// Helper to add CORS headers to any response
function addCorsHeaders(response: Response, request: Request): Response {
  const origin = request.headers.get('Origin') || '*';
  const newHeaders = new Headers(response.headers);
  newHeaders.set('Access-Control-Allow-Origin', origin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  });
}
