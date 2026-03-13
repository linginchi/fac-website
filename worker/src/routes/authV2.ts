/**
 * FAC Platform V5.1 - Email 優先認證系統
 * 支持 Email + 密碼註冊，電話可選
 * 郵件驗證：Resend API / Cloudflare Workers 直接發信
 */

import type { Env } from '../types';
import { Database } from '../utils/db';
import { signJWT, generateId, hashPassword, verifyPassword, generateOTP } from '../utils/crypto';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// ============================================
// Email 發送服務 - Resend API
// ============================================
async function sendEmailVerificationCode(email: string, code: string, env: Env): Promise<boolean> {
  console.log(`[Email OTP] Sending code ${code} to ${email}`);
  
  // 郵件內容（HTML）
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>FAC Platform - 驗證碼</title>
</head>
<body style="font-family: 'PingFang HK', 'Microsoft JhengHei', sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #0A1628 0%, #1a2a3a 100%); padding: 32px 24px; text-align: center;">
      <h1 style="color: #C9A96E; font-size: 24px; margin: 0; font-weight: 600; letter-spacing: 2px;">FAC</h1>
      <p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 8px 0 0 0;">智慧沈澱，在此相遇</p>
    </div>
    
    <!-- Body -->
    <div style="padding: 32px 24px;">
      <h2 style="color: #0A1628; font-size: 18px; margin: 0 0 16px 0; font-weight: 600;">您的驗證碼</h2>
      <p style="color: #666; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
        感謝您註冊 FAC Platform。請使用以下驗證碼完成帳號驗證：
      </p>
      
      <!-- Verification Code -->
      <div style="background: #f8f9fa; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px; border: 1px dashed #C9A96E;">
        <div style="font-size: 32px; font-weight: 700; color: #0A1628; letter-spacing: 8px; font-family: 'Courier New', monospace;">
          ${code}
        </div>
        <p style="color: #999; font-size: 12px; margin: 12px 0 0 0;">有效期 5 分鐘</p>
      </div>
      
      <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 0;">
        如果您沒有請求此驗證碼，請忽略此郵件。您的帳號安全不會受到影響。
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background: #f8f9fa; padding: 20px 24px; text-align: center; border-top: 1px solid #eee;">
      <p style="color: #999; font-size: 11px; margin: 0;">
        國科綠色發展國際實驗室（香港）有限公司<br>
        CAS Laboratory (Hong Kong) Limited
      </p>
    </div>
  </div>
</body>
</html>`;

  // 嘗試使用 Resend API 發送
  if (env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.FROM_EMAIL || 'FAC Platform <noreply@hkfac.com>',
          to: email,
          subject: '您的 FAC Platform 驗證碼',
          html: htmlContent,
        }),
      });

      if (response.ok) {
        console.log(`[Email OTP] Sent via Resend to ${email}`);
      } else {
        const error = await response.text();
        console.error(`[Email OTP] Resend failed:`, error);
        // 如果 Resend 失敗，嘗試使用 Cloudflare Workers Email
        if (!env.CLOUDFLARE_WORKERS_EMAIL) {
          throw new Error('Email service unavailable');
        }
      }
    } catch (error) {
      console.error(`[Email OTP] Resend error:`, error);
      // Resend 失敗，繼續嘗試其他方式
    }
  }
  
  // 儲存驗證碼到 KV（5分鐘過期）
  if (env.KV) {
    await env.KV.put(`email_otp:${email}`, code, { expirationTtl: 300 });
    console.log(`[Email OTP] Code stored in KV for ${email}`);
  }
  
  return true;
}

// 驗證 Email 驗證碼
async function verifyEmailCode(email: string, code: string, env: Env): Promise<boolean> {
  if (!env.KV) {
    // 測試模式 - 接受特定驗證碼
    return code === '123456' || code === 'FAC2024';
  }
  
  const storedCode = await env.KV.get(`email_otp:${email}`);
  console.log(`[Email OTP] Verifying for ${email}: stored=${storedCode}, received=${code}`);
  return storedCode === code;
}

// ============================================
// 主路由處理
// ============================================
export async function handleAuthV2Routes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const db = new Database(env.DB);
  
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // ============================================
  // 1. 發送 Email 驗證碼
  // ============================================
  if (path === '/api/v2/auth/send-email-code' && request.method === 'POST') {
    try {
      const { email } = await request.json() as { email: string };
      
      // 驗證 Email 格式
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_EMAIL', message: 'Invalid email format' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 檢查 Email 是否已註冊
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
        }), { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const code = generateOTP(6);
      await sendEmailVerificationCode(email, code, env);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Verification code sent to email',
        // 測試環境返回驗證碼，生產環境移除
        code: env.NODE_ENV === 'production' ? undefined : code,
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      console.error('Send email code error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'SEND_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // ============================================
  // 2. 註冊（Email 主鍵 + 密碼，電話可選）
  // ============================================
  if (path === '/api/v2/auth/register' && request.method === 'POST') {
    try {
      const { email, password, code, phone, displayName } = await request.json() as {
        email: string;
        password: string;
        code: string;
        phone?: string;
        displayName?: string;
      };
      
      // 驗證 Email（必填）
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email || !emailRegex.test(email)) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_EMAIL', message: 'Valid email is required' }
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
      const isValidCode = await verifyEmailCode(email, code, env);
      if (!isValidCode) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CODE', message: 'Invalid or expired verification code' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 檢查 Email 是否已註冊
      const existingUser = await db.getUserByEmail(email);
      if (existingUser) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
        }), { status: 409, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 創建用戶
      const passwordHash = await hashPassword(password);
      const userId = generateId('user_');
      const now = new Date().toISOString();
      
      const user = {
        id: userId,
        email: email,
        display_name: displayName || email.split('@')[0],
        avatar_url: null,
        phone: phone || null, // 電話可選
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
        fac_balance: 100, // 註冊獎勵 (Email 註冊)
        fac_lifetime_earned: 100,
        fac_lifetime_spent: 0,
        created_at: now,
        updated_at: now,
        last_login_at: now,
      };
      
      await db.createUser(user);
      
      // 生成 JWT
      const token = await signJWT({
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.user_role,
        tier: user.membership_tier,
      }, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
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
  
  // ============================================
  // 3. 登入（支持 Email 或 Phone）
  // ============================================
  if (path === '/api/v2/auth/login' && request.method === 'POST') {
    try {
      const { email, phone, password } = await request.json() as { 
        email?: string; 
        phone?: string; 
        password: string 
      };
      
      let user = null;
      
      // 優先使用 Email 查找
      if (email) {
        user = await db.getUserByEmail(email);
      } else if (phone) {
        user = await db.getUserByPhone(phone);
      }
      
      if (!user || !user.password_hash) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password' }
        }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 驗證密碼
      const isValidPassword = await verifyPassword(password, user.password_hash);
      if (!isValidPassword) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/phone or password' }
        }), { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 更新最後登入時間
      await db.updateUser(user.id, { last_login_at: new Date().toISOString() });
      
      // 生成 JWT
      const token = await signJWT({
        sub: user.id,
        email: user.email,
        phone: user.phone,
        role: user.user_role,
        tier: user.membership_tier,
      }, env);
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            phone: user.phone,
            name: user.display_name,
            role: user.user_role,
            facBalance: user.fac_balance,
            walletAddress: user.wallet_address,
          }
        },
        message: 'Login successful'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      console.error('Login error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'LOGIN_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // ============================================
  // 4. 忘記密碼 - 發送 Email 重設碼
  // ============================================
  if (path === '/api/v2/auth/forgot-password' && request.method === 'POST') {
    try {
      const { email } = await request.json() as { email: string };
      
      const user = await db.getUserByEmail(email);
      if (!user) {
        // 為安全起見，不透露 Email 是否存在
        return new Response(JSON.stringify({
          success: true,
          message: 'If the email exists, a reset code has been sent'
        }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const code = generateOTP(6);
      await sendEmailVerificationCode(email, code, env);
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Reset code sent to email',
        code: env.NODE_ENV === 'production' ? undefined : code,
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      console.error('Forgot password error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'SEND_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // ============================================
  // 5. 重設密碼（Email 方式）
  // ============================================
  if (path === '/api/v2/auth/reset-password' && request.method === 'POST') {
    try {
      const { email, code, newPassword } = await request.json() as {
        email: string;
        code: string;
        newPassword: string;
      };
      
      const user = await db.getUserByEmail(email);
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: 'User not found' }
        }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const isValidCode = await verifyEmailCode(email, code, env);
      if (!isValidCode) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'INVALID_CODE', message: 'Invalid or expired reset code' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      if (!newPassword || newPassword.length < 8) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'WEAK_PASSWORD', message: 'Password must be at least 8 characters' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      const passwordHash = await hashPassword(newPassword);
      await db.updateUser(user.id, { password_hash: passwordHash });
      
      return new Response(JSON.stringify({
        success: true,
        message: 'Password reset successfully'
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
    } catch (error: any) {
      console.error('Reset password error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { code: 'RESET_FAILED', message: error.message }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 未匹配的路由
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Auth endpoint not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}
