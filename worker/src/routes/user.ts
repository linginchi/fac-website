// User profile routes
import type { Env } from '../types';
import { Database } from '../utils/db';
import { generateId } from '../utils/jwt';
import type { AuthenticatedRequest } from '../middleware/auth';

export async function handleUserRoutes(request: AuthenticatedRequest, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
  
  // Get current user profile
  if (path === '/api/user/profile' && request.method === 'GET') {
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
    
    // Get user skills
    const skills = await db.getUserSkills(user.id);
    
    // Get referral stats
    const referralStats = await db.getReferralStats(user.id);
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        linkedinSynced: !!user.linkedin_id,
        userRole: user.user_role,
        membershipTier: user.membership_tier,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        hourlyRate: user.hourly_rate,
        yearsExperience: user.years_experience,
        availability: user.availability ? JSON.parse(user.availability) : [],
        companyName: user.company_name,
        companySize: user.company_size,
        industry: user.industry,
        walletAddress: user.wallet_address,
        referralCode: user.referral_code,
        facBalance: user.fac_balance,
        facLifetimeEarned: user.fac_lifetime_earned,
        facLifetimeSpent: user.fac_lifetime_spent,
        skills,
        referralStats,
        createdAt: user.created_at,
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Update user profile
  if (path === '/api/user/profile' && request.method === 'PUT') {
    if (!request.user) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    try {
      const body = await request.json() as Record<string, unknown>;
      const updates: Record<string, unknown> = {};
      
      // Allowed fields to update
      const allowedFields = [
        'display_name', 'avatar_url', 'user_role', 'phone', 'location', 'bio',
        'hourly_rate', 'years_experience', 'availability', 'company_name',
        'company_size', 'industry', 'cv_url'
      ];
      
      for (const field of allowedFields) {
        if (body[field] !== undefined) {
          if (field === 'availability' && Array.isArray(body[field])) {
            updates[field] = JSON.stringify(body[field]);
          } else {
            updates[field] = body[field];
          }
        }
      }
      
      // Check if this is first profile completion
      const currentUser = await db.getUserById(request.user.id);
      const isFirstCompletion = currentUser && !currentUser.bio && updates.bio;
      
      await db.updateUser(request.user.id, updates);
      
      // Award bonus for profile completion
      if (isFirstCompletion && currentUser) {
        const newBalance = currentUser.fac_balance + 20;
        await db.updateUserBalance(request.user.id, newBalance, currentUser.fac_lifetime_earned + 20);
        await db.createTransaction({
          id: generateId('tx_'),
          user_id: request.user.id,
          type: 'reward_profile_complete',
          amount: 20,
          balance_after: newBalance,
          description: 'Profile completion reward',
          related_user_id: null,
          related_task_id: null,
          metadata: null,
        });
      }
      
      return new Response(JSON.stringify({
        success: true,
        data: { message: 'Profile updated successfully' }
      }), { headers: { 'Content-Type': 'application/json' } });
    } catch (error) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'INVALID_REQUEST', message: 'Invalid request body' }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
  }
  
  // Create wallet
  if (path === '/api/user/wallet' && request.method === 'POST') {
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
    
    if (user.wallet_address) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'WALLET_EXISTS', message: 'Wallet already created' }
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Generate wallet address
    const walletAddress = '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const now = new Date().toISOString();
    await db.updateUser(user.id, {
      wallet_address: walletAddress,
      wallet_created_at: now,
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: {
        walletAddress,
        createdAt: now,
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Get user transactions
  if (path === '/api/user/transactions' && request.method === 'GET') {
    if (!request.user) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' }
      }), { status: 401, headers: { 'Content-Type': 'application/json' } });
    }
    
    const limit = parseInt(url.searchParams.get('limit') || '50');
    const transactions = await db.getUserTransactions(request.user.id, limit);
    
    return new Response(JSON.stringify({
      success: true,
      data: transactions.map(tx => ({
        id: tx.id,
        type: tx.type,
        amount: tx.amount,
        balanceAfter: tx.balance_after,
        description: tx.description,
        createdAt: tx.created_at,
      }))
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  // Get public user profile (for viewing other users)
  if (path.startsWith('/api/user/public/') && request.method === 'GET') {
    const userId = path.replace('/api/user/public/', '');
    const user = await db.getUserById(userId);
    
    if (!user) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User not found' }
      }), { status: 404, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Return limited public info
    return new Response(JSON.stringify({
      success: true,
      data: {
        id: user.id,
        displayName: user.display_name,
        avatarUrl: user.avatar_url,
        userRole: user.user_role,
        bio: user.bio,
        location: user.location,
        membershipTier: user.membership_tier,
      }
    }), { headers: { 'Content-Type': 'application/json' } });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}
