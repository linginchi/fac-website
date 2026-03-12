// Authentication routes
import type { Env, User } from '../types';
import { Database } from '../utils/db';
import { signJWT, generateId, generateReferralCode, generateWalletAddress } from '../utils/jwt';
import { exchangeCodeForToken, getLinkedInProfile, buildLinkedInAuthUrl } from '../utils/linkedin';

export async function handleAuthRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // LinkedIn OAuth login URL
  if (path === '/auth/linkedin' && request.method === 'GET') {
    const state = generateId('state_');
    const authUrl = buildLinkedInAuthUrl(env, state);
    
    return new Response(JSON.stringify({
      success: true,
      data: { authUrl, state }
    }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }
  
  // LinkedIn OAuth callback
  if (path === '/auth/linkedin/callback' && request.method === 'GET') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');
    
    if (error) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'OAUTH_ERROR', message: error }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!code) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'MISSING_CODE', message: 'Authorization code is required' }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Exchange code for token
    const tokenData = await exchangeCodeForToken(code, env);
    if (!tokenData) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'TOKEN_EXCHANGE_FAILED', message: 'Failed to exchange authorization code' }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Get LinkedIn profile
    const profile = await getLinkedInProfile(tokenData.access_token);
    if (!profile) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'PROFILE_FETCH_FAILED', message: 'Failed to fetch LinkedIn profile' }
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }
    
    // Check if user exists
    const db = new Database(env.DB);
    let user = await db.getUserByLinkedInId(profile.sub);
    const isNewUser = !user;
    
    if (!user) {
      // Check if email already exists
      const existingUser = await db.getUserByEmail(profile.email);
      if (existingUser) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already registered with another account' }
        }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      
      // Create new user
      const now = new Date().toISOString();
      user = {
        id: generateId('user_'),
        email: profile.email,
        display_name: profile.name,
        avatar_url: profile.picture || null,
        linkedin_id: profile.sub,
        linkedin_profile_url: null,
        linkedin_headline: null,
        linkedin_synced_at: now,
        user_role: 'neutral',
        membership_tier: 'basic',
        membership_expires_at: null,
        phone: null,
        location: null,
        bio: null,
        hourly_rate: null,
        years_experience: null,
        availability: null,
        company_name: null,
        company_size: null,
        industry: null,
        cv_url: null,
        wallet_address: null,
        wallet_created_at: null,
        referral_code: generateReferralCode(),
        referred_by: null,
        fac_balance: 80, // Initial reward for LinkedIn auth
        fac_lifetime_earned: 80,
        fac_lifetime_spent: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now,
      };
      
      await db.createUser(user);
      
      // Record the reward transaction
      await db.createTransaction({
        id: generateId('tx_'),
        user_id: user.id,
        type: 'reward_linkedin_auth',
        amount: 80,
        balance_after: 80,
        description: 'LinkedIn authorization reward',
        related_user_id: null,
        related_task_id: null,
        metadata: JSON.stringify({ linkedin_id: profile.sub }),
      });
      
      // Handle referral if exists
      const referralCode = url.searchParams.get('ref');
      if (referralCode) {
        const referrer = await db.getUserByReferralCode(referralCode);
        if (referrer) {
          await db.updateUser(user.id, { referred_by: referrer.id });
          await db.createReferral({
            id: generateId('ref_'),
            referrer_id: referrer.id,
            referee_id: user.id,
            referral_code: referralCode,
            channel: 'link',
            status: 'pending',
            reward_amount: 100,
            created_at: now,
            completed_at: null,
            tier: 'direct',
          });
        }
      }
    } else {
      // Update last login
      await db.updateUser(user.id, { last_login_at: new Date().toISOString() });
    }
    
    // Generate JWT
    const jwt = await signJWT({
      sub: user.id,
      email: user.email,
      role: user.user_role,
      tier: user.membership_tier,
    }, env);
    
    // Redirect to frontend with token
    const redirectUrl = new URL('/auth/callback', env.LINKEDIN_REDIRECT_URI);
    redirectUrl.searchParams.set('token', jwt);
    redirectUrl.searchParams.set('isNewUser', isNewUser ? 'true' : 'false');
    
    return Response.redirect(redirectUrl.toString(), 302);
  }
  
  // Refresh token
  if (path === '/auth/refresh' && request.method === 'POST') {
    // This would require a refresh token mechanism
    // For now, just return error
    return new Response(JSON.stringify({
      success: false,
      error: { code: 'NOT_IMPLEMENTED', message: 'Token refresh not yet implemented' }
    }), { status: 501, headers: { 'Content-Type': 'application/json' } });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json' } });
}
