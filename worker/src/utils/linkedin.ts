// LinkedIn OAuth Utilities
import type { LinkedInTokenResponse, LinkedInProfile, Env } from '../types';

export async function exchangeCodeForToken(code: string, env: Env): Promise<LinkedInTokenResponse | null> {
  try {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: env.LINKEDIN_CLIENT_ID,
      client_secret: env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: env.LINKEDIN_REDIRECT_URI,
    });
    
    const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });
    
    if (!response.ok) {
      console.error('LinkedIn token exchange failed:', await response.text());
      return null;
    }
    
    return await response.json() as LinkedInTokenResponse;
  } catch (error) {
    console.error('LinkedIn token exchange error:', error);
    return null;
  }
}

export async function getLinkedInProfile(accessToken: string): Promise<LinkedInProfile | null> {
  try {
    // Get basic profile using OpenID Connect
    const response = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    
    if (!response.ok) {
      console.error('LinkedIn profile fetch failed:', await response.text());
      return null;
    }
    
    const data = await response.json();
    
    return {
      sub: data.sub,
      name: data.name,
      email: data.email,
      picture: data.picture,
      given_name: data.given_name,
      family_name: data.family_name,
    };
  } catch (error) {
    console.error('LinkedIn profile fetch error:', error);
    return null;
  }
}

// Build LinkedIn OAuth URL
export function buildLinkedInAuthUrl(env: Env, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: env.LINKEDIN_CLIENT_ID,
    redirect_uri: env.LINKEDIN_REDIRECT_URI,
    state,
    scope: 'openid profile email',
  });
  
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}
