// Buyback transparency routes
import type { Env } from '../types';
import { Database } from '../utils/db';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function handleBuybackRoutes(request: AuthenticatedRequest, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
  
  // Get buyback history
  if (path === '/api/buyback/history' && request.method === 'GET') {
    const records = await db.getBuybackHistory();
    
    return new Response(JSON.stringify({
      success: true,
      data: records.map(r => ({
        id: r.id,
        quarter: r.quarter,
        totalRevenue: r.total_revenue,
        buybackPool: r.buyback_pool,
        facPrice: r.fac_price,
        totalBuyback: r.total_buyback,
        totalBurned: r.total_burned,
        status: r.status,
        executedAt: r.executed_at,
        txHash: r.tx_hash,
        createdAt: r.created_at,
      }))
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Get latest buyback
  if (path === '/api/buyback/latest' && request.method === 'GET') {
    const record = await db.getLatestBuyback();
    
    if (!record) {
      return new Response(JSON.stringify({
        success: true,
        data: null,
      }), { headers: { 'Content-Type': 'application/json' } });
    }
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: record.id,
        quarter: record.quarter,
        totalRevenue: record.total_revenue,
        buybackPool: record.buyback_pool,
        facPrice: record.fac_price,
        totalBuyback: record.total_buyback,
        totalBurned: record.total_burned,
        status: record.status,
        executedAt: record.executed_at,
        txHash: record.tx_hash,
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Get platform metrics
  if (path === '/api/buyback/metrics' && request.method === 'GET') {
    // Get stats from database
    const result = await env.DB.prepare(`
      SELECT 
        SUM(total_revenue) as total_revenue,
        SUM(total_buyback) as total_buyback,
        SUM(total_burned) as total_burned
      FROM buyback_records
      WHERE status = 'executed'
    `).first<{ total_revenue: number; total_buyback: number; total_burned: number }>();
    
    const userCount = await env.DB.prepare(`
      SELECT COUNT(*) as count FROM users
    `).first<{ count: number }>();
    
    const totalSupply = 1000000000;
    const circulatingSupply = 850000000;
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        totalSupply,
        circulatingSupply,
        burnedSupply: result?.total_burned || 17908737, // From mock data
        totalRevenue: result?.total_revenue || 1100000,
        totalBuyback: result?.total_buyback || 35812475,
        totalBurned: result?.total_burned || 17906237,
        activeUsers: userCount?.count || 45231,
        averagePrice: 0.01,
        lastBuybackDate: '2025-01-15',
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Get next buyback preview
  if (path === '/api/buyback/next' && request.method === 'GET') {
    // Calculate next quarter
    const now = new Date();
    const currentQuarter = Math.floor(now.getMonth() / 3) + 1;
    const nextQuarter = currentQuarter === 4 ? 1 : currentQuarter + 1;
    const nextYear = currentQuarter === 4 ? now.getFullYear() + 1 : now.getFullYear();
    const scheduledDate = `${nextYear}-${String(nextQuarter * 3 - 2).padStart(2, '0')}-15`;
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        scheduledDate,
        estimatedPool: 95000,
        projectedPrice: 0.014,
        daysRemaining: Math.floor((new Date(scheduledDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Get user's buyback holdings
  if (path === '/api/buyback/my-holdings' && request.method === 'GET') {
    if (!request.user) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    const user = await db.getUserById(request.user.id);
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    const latestBuyback = await db.getLatestBuyback();
    const price = latestBuyback?.fac_price || 0.01;
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        balance: user.fac_balance,
        estimatedValue: user.fac_balance * price,
        participationEligible: user.fac_balance >= 1000,
        rank: user.fac_balance > 5000 ? 'Top 5%' : user.fac_balance > 1000 ? 'Top 20%' : 'Standard',
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}
