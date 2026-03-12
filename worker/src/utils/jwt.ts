// JWT Utilities for FAC Platform
import type { JWTPayload, Env } from '../types';

export async function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, env: Env): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 30 * 24 * 60 * 60; // 30 days
  
  const header = { alg: 'HS256', typ: 'JWT' };
  const fullPayload = { ...payload, iat: now, exp };
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(fullPayload));
  
  const signature = await crypto.subtle.sign(
    { name: 'HMAC', hash: 'SHA-256' },
    await getSigningKey(env.JWT_SECRET_KEY),
    new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
  );
  
  const encodedSignature = btoa(String.fromCharCode(...new Uint8Array(signature)));
  
  return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
}

export async function verifyJWT(token: string, env: Env): Promise<JWTPayload | null> {
  try {
    const [encodedHeader, encodedPayload, encodedSignature] = token.split('.');
    
    if (!encodedHeader || !encodedPayload || !encodedSignature) {
      return null;
    }
    
    const signature = Uint8Array.from(atob(encodedSignature), c => c.charCodeAt(0));
    
    const isValid = await crypto.subtle.verify(
      { name: 'HMAC', hash: 'SHA-256' },
      await getSigningKey(env.JWT_SECRET_KEY),
      signature,
      new TextEncoder().encode(`${encodedHeader}.${encodedPayload}`)
    );
    
    if (!isValid) {
      return null;
    }
    
    const payload: JWTPayload = JSON.parse(atob(encodedPayload));
    
    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }
    
    // Check issuer and audience
    if (payload.iss !== env.FAC_TOKEN_ISSUER || payload.aud !== env.FAC_TOKEN_AUDIENCE) {
      return null;
    }
    
    return payload;
  } catch {
    return null;
  }
}

async function getSigningKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Generate a secure random ID
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${random}`;
}

// Generate referral code
export function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FAC-';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Generate wallet address (simulated - in production use proper crypto)
export function generateWalletAddress(): string {
  return '0x' + Array.from({ length: 40 }, () => 
    Math.floor(Math.random() * 16).toString(16)
  ).join('');
}
