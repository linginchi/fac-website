/**
 * FAC Platform V5.1 - 新版認證系統
 * 支持手機號+密碼註冊、登入、忘記密碼
 */

import type { Env } from '../types';
import { Database } from '../utils/db';
import { signJWT, verifyJWT, generateId, hashPassword, verifyPassword, generateOTP } from '../utils/crypto';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 發送驗證碼（目前使用模擬，實際可接 SMS 或 Email）
async function sendVerificationCode(phone: string, code: string, env: Env): Promise<boolean> {
  console.log(`[OTP] Sending code ${code} to ${phone}`);
  
  // 實際部署時，這裡可以接：
  // 1. 阿里雲短信服務
  // 2. Twilio SMS
  // 3. SendGrid Email
  // 4. AWS SES
  
  // 將驗證碼存入 KV（5分鐘過期）
  if (env.KV) {
    await env.KV.put(`otp:${phone}`, code, { expirationTtl: 300 });
  }
  
  return true;
}

// 驗證驗證碼
async function verifyCode(phone: string, code: string, env: Env): Promise<boolean> {
  if (!env.KV) return code === '123456'; // 測試模式
  
  const storedCode = await env.KV.get(`otp:${phone}`);
  return storedCode === code;
}

export async function handleAuthV2Routes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 發送驗證碼
  if (path === '/api/v2/auth/send-code' && request.method === 'POST') {
    try {
      const { phone } = await request.json() as { phone: string };
      
      if (!phone || !/^\+?[\d\s-]{8,20}$/.test(phone)) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_PHONE', message: 'Invalid phone number' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const code = generateOTP(6);
      await sendVerificationCode(phone, code, env);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Verification code sent',
        // 測試環境返回驗證碼，生產環境移除
        code: env.NODE_ENV === 'production' ? undefined : code,
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'SEND_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 註冊（手機號 + 密碼）
  if (path === '/api/v2/auth/register' && request.method === 'POST') {
    try {
      const { phone, password, email, code, displayName } = await request.json() as {
        phone: string;
        password: string;
        email?: string;
        code: string;
        displayName: string;
      };
      
      // 驗證手機號
      if (!phone || !/^\+?[\d\s-]{8,20}$/.test(phone)) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_PHONE', message: 'Invalid phone number' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 驗證密碼強度
      if (!password || password.length < 8) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 驗證驗證碼
      const isValidCode = await verifyCode(phone, code, env);
      if (!isValidCode) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CODE', message: 'Invalid or expired verification code' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 檢查手機號是否已註冊
      const existingUser = await db.getUserByPhone(phone);
      if (existingUser) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'PHONE_EXISTS', message: 'Phone number already registered' }
        }), { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 創建用戶
      const passwordHash = await hashPassword(password);
      const userId = generateId('user_');
      const now = new Date().toISOString();
      
      const user = {
        id: userId,
        email: email || null,
        display_name: displayName,
        avatar_url: null,
        phone: phone,
        password_hash: passwordHash,
        linkedin_id: null,
        linkedin_profile_url: null,
        linkedin_headline: null,
        linkedin_synced_at: null,
        user_role: 'neutral' as const,
        membership_tier: 'basic' as const,
        membership_expires_at: null,
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
        referral_code: generateId('ref_'),
        referred_by: null,
        fac_balance: 50, // 註冊獎勵
        fac_lifetime_earned: 50,
        fac_lifetime_spent: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now,
      };
      
      await db.createUser(user);
      
      // 生成 JWT
      const token = await signJWT({
        sub: user.id,
        phone: user.phone,
        email: user.email,
        role: user.user_role,
        tier: user.membership_tier,
      }, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.display_name,
            role: user.user_role,
            facBalance: user.fac_balance,
          }
        },
        message: 'Registration successful'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      console.error('Registration error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'REGISTRATION_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 登入
  if (path === '/api/v2/auth/login' && request.method === 'POST') {
    try {
      const { phone, password } = await request.json() as { phone: string; password: string };
      
      // 查找用戶
      const user = await db.getUserByPhone(phone);
      if (!user || !user.password_hash) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' }
        }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 驗證密碼
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid phone or password' }
        }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 更新最後登入時間
      await db.updateUser(user.id, { last_login_at: new Date().toISOString() });
      
      // 生成 JWT
      const token = await signJWT({
        sub: user.id,
        phone: user.phone,
        email: user.email,
        role: user.user_role,
        tier: user.membership_tier,
      }, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            phone: user.phone,
            email: user.email,
            name: user.display_name,
            role: user.user_role,
            facBalance: user.fac_balance,
            walletAddress: user.wallet_address,
          }
        },
        message: 'Login successful'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'LOGIN_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 忘記密碼 - 發送重設碼
  if (path === '/api/v2/auth/forgot-password' && request.method === 'POST') {
    try {
      const { phone } = await request.json() as { phone: string };
      
      const user = await db.getUserByPhone(phone);
      if (!user) {
        // 為安全起見，不透露手機號是否存在
        return new Response(JSON.stringify({
          success: true,
          message: 'If the phone number exists, a reset code has been sent'
        }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const code = generateOTP(6);
      await sendVerificationCode(phone, code, env);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Reset code sent',
        code: env.NODE_ENV === 'production' ? undefined : code,
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'SEND_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 重設密碼
  if (path === '/api/v2/auth/reset-password' && request.method === 'POST') {
    try {
      const { phone, code, newPassword } = await request.json() as {
        phone: string;
        code: string;
        newPassword: string;
      };
      
      // 驗證驗證碼
      const isValidCode = await verifyCode(phone, code, env);
      if (!isValidCode) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CODE', message: 'Invalid or expired verification code' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 驗證密碼強度
      if (!newPassword || newPassword.length < 8) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const user = await db.getUserByPhone(phone);
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 更新密碼
      const passwordHash = await hashPassword(newPassword);
      await db.updateUser(user.id, { password_hash: passwordHash });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Password reset successful'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'RESET_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}
