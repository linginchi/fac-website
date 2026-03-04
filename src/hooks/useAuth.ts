import { useState, useEffect, useCallback } from 'react';

const ALLOWED_EMAILS = ['mark@hkfac.com', 'markgclin@gmail.com'];
const AUTH_STORAGE_KEY = 'fac_admin_auth';
const CODE_STORAGE_KEY = 'fac_login_code';
const CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes

interface AuthState {
  isAuthenticated: boolean;
  email: string | null;
}

interface LoginCode {
  email: string;
  code: string;
  expiry: number;
}

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, email: null });
  const [isLoaded, setIsLoaded] = useState(false);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Check if session is still valid (24 hours)
        if (parsed.timestamp && Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
          setAuth({ isAuthenticated: true, email: parsed.email });
        } else {
          localStorage.removeItem(AUTH_STORAGE_KEY);
        }
      } catch (e) {
        console.error('Failed to parse auth:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Check if email is allowed
  const isAllowedEmail = useCallback((email: string): boolean => {
    return ALLOWED_EMAILS.includes(email.toLowerCase().trim());
  }, []);

  // Send login code (simulated - in production this would send an email)
  const sendLoginCode = useCallback((email: string): { success: boolean; message: string; code?: string } => {
    if (!isAllowedEmail(email)) {
      return { success: false, message: '此邮箱没有访问权限' };
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store code with expiry
    const loginCode: LoginCode = {
      email: email.toLowerCase().trim(),
      code,
      expiry: Date.now() + CODE_EXPIRY
    };
    
    localStorage.setItem(CODE_STORAGE_KEY, JSON.stringify(loginCode));
    
    // In production, this would send an email
    // For demo purposes, we return the code
    console.log(`Login code for ${email}: ${code}`);
    
    return { 
      success: true, 
      message: '验证码已发送（演示模式：请查看控制台）',
      code // Remove this in production!
    };
  }, [isAllowedEmail]);

  // Verify login code
  const verifyCode = useCallback((email: string, code: string): { success: boolean; message: string } => {
    const stored = localStorage.getItem(CODE_STORAGE_KEY);
    if (!stored) {
      return { success: false, message: '验证码已过期，请重新获取' };
    }

    try {
      const loginCode: LoginCode = JSON.parse(stored);
      
      if (loginCode.email !== email.toLowerCase().trim()) {
        return { success: false, message: '邮箱不匹配' };
      }
      
      if (Date.now() > loginCode.expiry) {
        localStorage.removeItem(CODE_STORAGE_KEY);
        return { success: false, message: '验证码已过期，请重新获取' };
      }
      
      if (loginCode.code !== code) {
        return { success: false, message: '验证码错误' };
      }

      // Clear used code
      localStorage.removeItem(CODE_STORAGE_KEY);
      
      // Set authenticated state
      const authData = { email: email.toLowerCase().trim(), timestamp: Date.now() };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
      setAuth({ isAuthenticated: true, email: email.toLowerCase().trim() });
      
      return { success: true, message: '登录成功' };
    } catch (e) {
      return { success: false, message: '验证失败' };
    }
  }, []);

  // Login with password (after first login with code)
  const loginWithPassword = useCallback((email: string, password: string): { success: boolean; message: string } => {
    if (!isAllowedEmail(email)) {
      return { success: false, message: '此邮箱没有访问权限' };
    }

    const passwordKey = `fac_password_${email.toLowerCase().trim()}`;
    const storedPassword = localStorage.getItem(passwordKey);
    
    if (!storedPassword) {
      return { success: false, message: '请先使用验证码登录并设置密码' };
    }

    if (storedPassword !== password) {
      return { success: false, message: '密码错误' };
    }

    // Set authenticated state
    const authData = { email: email.toLowerCase().trim(), timestamp: Date.now() };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setAuth({ isAuthenticated: true, email: email.toLowerCase().trim() });
    
    return { success: true, message: '登录成功' };
  }, [isAllowedEmail]);

  // Set password (after first login with code)
  const setPassword = useCallback((email: string, password: string): { success: boolean; message: string } => {
    if (!isAllowedEmail(email)) {
      return { success: false, message: '此邮箱没有访问权限' };
    }

    if (password.length < 6) {
      return { success: false, message: '密码至少需要6位' };
    }

    const passwordKey = `fac_password_${email.toLowerCase().trim()}`;
    localStorage.setItem(passwordKey, password);
    
    return { success: true, message: '密码设置成功' };
  }, [isAllowedEmail]);

  // Check if user has password set
  const hasPassword = useCallback((email: string): boolean => {
    const passwordKey = `fac_password_${email.toLowerCase().trim()}`;
    return !!localStorage.getItem(passwordKey);
  }, []);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth({ isAuthenticated: false, email: null });
  }, []);

  // Forgot password - send code
  const forgotPassword = useCallback((email: string): { success: boolean; message: string; code?: string } => {
    if (!isAllowedEmail(email)) {
      return { success: false, message: '此邮箱没有访问权限' };
    }

    if (!hasPassword(email)) {
      return { success: false, message: '此邮箱尚未设置密码，请直接使用验证码登录' };
    }

    return sendLoginCode(email);
  }, [isAllowedEmail, hasPassword, sendLoginCode]);

  // Reset password with code
  const resetPassword = useCallback((email: string, code: string, newPassword: string): { success: boolean; message: string } => {
    // First verify the code
    const verifyResult = verifyCode(email, code);
    if (!verifyResult.success) {
      return verifyResult;
    }

    // Set new password
    const passwordKey = `fac_password_${email.toLowerCase().trim()}`;
    localStorage.setItem(passwordKey, newPassword);
    
    // Keep user logged in
    const authData = { email: email.toLowerCase().trim(), timestamp: Date.now() };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authData));
    setAuth({ isAuthenticated: true, email: email.toLowerCase().trim() });
    
    return { success: true, message: '密码重置成功' };
  }, [verifyCode]);

  return {
    auth,
    isLoaded,
    isAllowedEmail,
    sendLoginCode,
    verifyCode,
    loginWithPassword,
    setPassword,
    hasPassword,
    logout,
    forgotPassword,
    resetPassword
  };
}
