// Authentication routes
import type { Env, User } from '../types';
import { Database } from '../utils/db';
import { signJWT, generateId, generateReferralCode, generateWalletAddress } from '../utils/jwt';
import { exchangeCodeForToken, getLinkedInProfile, buildLinkedInAuthUrl } from '../utils/linkedin';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handleAuthRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
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
  
  // LinkedIn OAuth callback - API endpoint for frontend
  if (path === '/api/auth/linkedin/callback' && request.method === 'GET') {
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'MISSING_CODE', message: 'Authorization code is required' }
      }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
    
    try {
      // Exchange code for token using client_secret from env
      const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code: code,
          client_id: env.LINKEDIN_CLIENT_ID,
          client_secret: env.LINKEDIN_CLIENT_SECRET,
          redirect_uri: env.LINKEDIN_REDIRECT_URI,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('LinkedIn token error:', errorText);
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'TOKEN_EXCHANGE_FAILED', message: 'Failed to exchange authorization code' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const tokenData = await tokenResponse.json();
      
      // Get LinkedIn profile using OpenID Connect
      const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
        },
      });

      if (!profileResponse.ok) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'PROFILE_FETCH_FAILED', message: 'Failed to fetch LinkedIn profile' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }

      const profile = await profileResponse.json();
      
      // Get or create user
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
          }), { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
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
          fac_balance: 80,
          fac_lifetime_earned: 80,
          fac_lifetime_spent: 0,
          created_at: now,
          updated_at: now,
          last_login_at: now,
        };
        
        await db.createUser(user);
        
        // Record transaction
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
      } else {
        await db.updateUser(user.id, { last_login_at: new Date().toISOString() });
      }
      
      // Generate JWT
      const jwt = await signJWT({
        sub: user.id,
        email: user.email,
        role: user.user_role,
        tier: user.membership_tier,
      }, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          token: jwt,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name,
            avatarUrl: user.avatar_url,
            linkedinId: user.linkedin_id,
            linkedinSyncedAt: user.linkedin_synced_at,
            userRole: user.user_role,
            membershipTier: user.membership_tier,
            facBalance: user.fac_balance,
            facLifetimeEarned: user.fac_lifetime_earned,
            facLifetimeSpent: user.fac_lifetime_spent,
            createdAt: user.created_at,
          },
          isNewUser: isNewUser,
        }
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      console.error('LinkedIn callback error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: error.message || 'Internal server error' }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
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
