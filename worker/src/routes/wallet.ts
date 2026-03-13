/**
 * FAC Platform V5.1 - Wallet & Skills API
 * 本地錢包數據同步端點
 */

import type { Env } from '../types';
import { Database } from '../utils/db';
import { verifyJWT } from '../utils/crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleWalletRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 驗證 JWT
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing authorization token' }
    }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  
  const token = authHeader.slice(7);
  const payload = await verifyJWT(token, env);
  
  if (!payload) {
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' }
    }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  
  const userId = payload.sub;
  
  // 獲取用戶完整資料
  if (path === '/api/v2/user/profile' && request.method === 'GET') {
    try {
      const user = await db.getUserById(userId);
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const skills = await db.getUserSkills(userId);
      const transactions = await db.getUserTransactions(userId, 50);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            phone: user.phone,
            location: user.location,
            bio: user.bio,
            userRole: user.user_role,
            membershipTier: user.membership_tier,
            walletAddress: user.wallet_address,
            facBalance: user.fac_balance,
            facLifetimeEarned: user.fac_lifetime_earned,
            facLifetimeSpent: user.fac_lifetime_spent,
            createdAt: user.created_at,
            updatedAt: user.updated_at,
          },
          skills,
          transactions,
        }
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 更新用戶資料
  if (path === '/api/v2/user/profile' && request.method === 'PUT') {
    try {
      const updates = await request.json() as any;
      
      await db.updateUser(userId, {
        display_name: updates.displayName,
        phone: updates.phone,
        location: updates.location,
        bio: updates.bio,
        hourly_rate: updates.hourlyRate,
        years_experience: updates.yearsExperience,
        company_name: updates.companyName,
        company_size: updates.companySize,
        industry: updates.industry,
        updated_at: new Date().toISOString(),
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Profile updated successfully'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'UPDATE_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 獲取技能列表
  if (path === '/api/v2/user/skills' && request.method === 'GET') {
    try {
      const skills = await db.getUserSkills(userId);
      return new Response(JSON.stringify({
        success: true,
        data: { skills }
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 添加技能
  if (path === '/api/v2/user/skills' && request.method === 'POST') {
    try {
      const skill = await request.json() as any;
      await db.addUserSkill({
        id: skill.id || `skill_${Date.now()}`,
        user_id: userId,
        skill_label: skill.label,
        skill_category: skill.category,
        weight: skill.weight || 80,
        verified: skill.verified || false,
        source: skill.source || 'manual',
        created_at: new Date().toISOString(),
      });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Skill added successfully'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'ADD_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 刪除技能
  if (path.match(/^\/api\/v2\/user\/skills\/[^/]+$/) && request.method === 'DELETE') {
    try {
      const skillId = path.split('/').pop()!;
      await db.removeUserSkill(skillId);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Skill removed successfully'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'DELETE_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 獲取交易記錄
  if (path === '/api/v2/user/transactions' && request.method === 'GET') {
    try {
      const limit = parseInt(url.searchParams.get('limit') || '50');
      const transactions = await db.getUserTransactions(userId, limit);
      
      return new Response(JSON.stringify({
        success: true,
        data: { transactions }
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'FETCH_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 錢包同步端點
  if (path === '/api/v2/wallet/sync' && request.method === 'POST') {
    try {
      const { localBalance, localTransactions } = await request.json() as any;
      
      const user = await db.getUserById(userId);
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 返回後端最新數據
      const transactions = await db.getUserTransactions(userId, 50);
      const skills = await db.getUserSkills(userId);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          balance: user.fac_balance,
          transactions,
          skills,
          serverTime: new Date().toISOString(),
        }
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'SYNC_ERROR', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}
