// Referral system routes
import type { Env } from '../types';
import { Database } from '../utils/db';
import { generateId } from '../utils/jwt';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function handleReferralRoutes(request: AuthenticatedRequest, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
  
  // Get my referral code and stats
  if (path === '/api/referral/my' && request.method === 'GET') {
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
    
    const stats = await db.getReferralStats(request.user.id);
    const referrals = await db.getReferralsByReferrer(request.user.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        referralCode: user.referral_code,
        referralLink: `https://www.hkfac.com/register?ref=${user.referral_code}`,
        stats: {
          totalReferrals: stats.total,
          completedReferrals: stats.completed,
          pendingReferrals: stats.pending,
        },
        referrals: referrals.map(r => ({
          id: r.id,
          status: r.status,
          rewardAmount: r.reward_amount,
          createdAt: r.created_at,
          completedAt: r.completed_at,
          tier: r.tier,
        })),
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Track referral (called when someone clicks referral link)
  if (path === '/api/referral/track' && request.method === 'POST') {
    try {
      const body = await request.json() as { code: string; channel?: string };
      const { code, channel = 'link' } = body;
      
      if (!code) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'MISSING_CODE', message: 'Referral code is required' }
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Verify code exists
      const referrer = await db.getUserByReferralCode(code);
      if (!referrer) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CODE', message: 'Invalid referral code' }
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Store tracking info in cookie/session (simplified for now)
      return new Response(JSON.stringify({
        success: true,
        data: {
          code,
          referrerName: referrer.display_name,
          valid: true,
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid request body' }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
  
  // Complete referral (called when referred user completes registration)
  // This is handled in auth.ts LinkedIn callback
  
  // Get referral rewards config
  if (path === '/api/referral/config' && request.method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      data: {
        directReferral: {
          reward: 100,
          description: '成功推荐新用户注册',
        },
        indirectReferral: {
          reward: 30,
          description: '被推荐人再推荐新用户',
        },
        firstTransaction: {
          reward: 50,
          description: '被推荐人完成首笔交易',
        },
        contentRewards: {
          jobPost: 50,
          expertProfile: 80,
          review: 20,
          feedback: 30,
        },
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Claim referral reward (for completed referrals)
  if (path === '/api/referral/claim' && request.method === 'POST') {
    if (!request.user) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    try {
      const body = await request.json() as { referralId: string };
      const { referralId } = body;
      
      // Get pending referrals for this user
      const referrals = await db.getReferralsByReferrer(request.user.id);
      const referral = referrals.find(r => r.id === referralId && r.status === 'pending');
      
      if (!referral) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'REFERRAL_NOT_FOUND', message: 'Pending referral not found' }
        }), { status: 404, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Mark as completed and award reward
      await db.completeReferral(referral.referee_id);
      
      const user = await db.getUserById(request.user.id);
      if (user) {
        const newBalance = user.fac_balance + referral.reward_amount;
        const newLifetimeEarned = user.fac_lifetime_earned + referral.reward_amount;
        await db.updateUserBalance(request.user.id, newBalance, newLifetimeEarned);
        
        await db.createTransaction({
          id: generateId('tx_'),
          user_id: request.user.id,
          type: 'reward_referral',
          amount: referral.reward_amount,
          balance_after: newBalance,
          description: `Referral reward for ${referral.referee_id}`,
          related_user_id: referral.referee_id,
          related_task_id: null,
          metadata: JSON.stringify({ referral_id: referral.id }),
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          message: 'Reward claimed successfully',
          amount: referral.reward_amount,
        }
      }), { headers: { 'Content-Type': 'application/json' } });
    } catch {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid request body' }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}
