import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Mail, Lock, Key, ArrowRight, Eye, EyeOff, CheckCircle } from 'lucide-react';

interface AdminLoginProps {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: AdminLoginProps) {
  const { sendLoginCode, verifyCode, loginWithPassword, setPassword, hasPassword, forgotPassword, resetPassword } = useAuth();
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [step, setStep] = useState<'email' | 'code' | 'password' | 'setPassword' | 'forgot'>('email');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [demoCode, setDemoCode] = useState('');

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const result = sendLoginCode(email);
    setIsLoading(false);

    if (result.success) {
      setMessage(result.message);
      if (result.code) {
        setDemoCode(result.code); // For demo only
      }
      setStep('code');
    } else {
      setError(result.message);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const result = verifyCode(email, code);
    setIsLoading(false);

    if (result.success) {
      // Check if user has password set
      if (hasPassword(email)) {
        onLogin();
      } else {
        setStep('setPassword');
        setMessage('首次登录，请设置密码');
      }
    } else {
      setError(result.message);
    }
  };

  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const result = loginWithPassword(email, password);
    setIsLoading(false);

    if (result.success) {
      onLogin();
    } else {
      setError(result.message);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    setIsLoading(true);
    const result = setPassword(email, password);
    setIsLoading(false);

    if (result.success) {
      setMessage('密码设置成功，正在登录...');
      setTimeout(() => onLogin(), 1000);
    } else {
      setError(result.message);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    const result = forgotPassword(email);
    setIsLoading(false);

    if (result.success) {
      setMessage(result.message);
      if (result.code) {
        setDemoCode(result.code);
      }
      setStep('forgot');
    } else {
      setError(result.message);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    if (password.length < 6) {
      setError('密码至少需要6位');
      return;
    }

    setIsLoading(true);
    const result = resetPassword(email, code, password);
    setIsLoading(false);

    if (result.success) {
      setMessage('密码重置成功，正在登录...');
      setTimeout(() => onLogin(), 1000);
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-4xl font-bold text-white mb-2">
            F<span className="text-[#FFD700]">A</span>C
          </div>
          <p className="text-white/50">后台管理系统</p>
        </div>

        {/* Login Card */}
        <div className="bg-white/5 rounded-2xl p-8 border border-white/10">
          {/* Step 1: Email */}
          {step === 'email' && (
            <form onSubmit={handleSendCode} className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                </div>
                <p className="text-white/40 text-xs mt-2">
                  允许登录的邮箱：mark@hkfac.com, markgclin@gmail.com
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  <>
                    发送验证码
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('password')}
                  className="text-[#FFD700] text-sm hover:underline"
                >
                  已有密码？直接登录
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Code Verification */}
          {step === 'code' && (
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h3 className="text-white font-medium mb-1">输入验证码</h3>
                <p className="text-white/50 text-sm">验证码已发送至 {email}</p>
                {demoCode && (
                  <p className="text-[#FFD700] text-sm mt-2">
                    演示模式验证码：{demoCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 placeholder:text-base placeholder:tracking-normal focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  '验证'
                )}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  返回
                </button>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={isLoading}
                  className="text-[#FFD700] hover:underline"
                >
                  重新发送
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Password Login */}
          {step === 'password' && (
            <form onSubmit={handleLoginWithPassword} className="space-y-6">
              <div>
                <label className="block text-sm text-white/60 mb-2">邮箱地址</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPasswordState(e.target.value)}
                    placeholder="请输入密码"
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  '登录'
                )}
              </button>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="text-white/50 hover:text-white transition-colors"
                >
                  使用验证码登录
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!email) {
                      setError('请先输入邮箱');
                      return;
                    }
                    handleForgotPassword({ preventDefault: () => {} } as React.FormEvent);
                  }}
                  className="text-[#FFD700] hover:underline"
                >
                  忘记密码
                </button>
              </div>
            </form>
          )}

          {/* Step 4: Set Password */}
          {step === 'setPassword' && (
            <form onSubmit={handleSetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h3 className="text-white font-medium mb-1">设置密码</h3>
                <p className="text-white/50 text-sm">首次登录，请设置您的密码</p>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPasswordState(e.target.value)}
                    placeholder="至少6位"
                    minLength={6}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">确认密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    minLength={6}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-green-400 text-sm">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  '设置密码'
                )}
              </button>
            </form>
          )}

          {/* Step 5: Forgot Password */}
          {step === 'forgot' && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-[#FFD700]/10 flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-[#FFD700]" />
                </div>
                <h3 className="text-white font-medium mb-1">重置密码</h3>
                <p className="text-white/50 text-sm">验证码已发送至 {email}</p>
                {demoCode && (
                  <p className="text-[#FFD700] text-sm mt-2">
                    演示模式验证码：{demoCode}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">验证码</label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="请输入6位验证码"
                  maxLength={6}
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-center text-2xl tracking-[0.5em] placeholder:text-white/30 placeholder:text-base placeholder:tracking-normal focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">新密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPasswordState(e.target.value)}
                    placeholder="至少6位"
                    minLength={6}
                    required
                    className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-white/60 mb-2">确认新密码</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="再次输入密码"
                    minLength={6}
                    required
                    className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading || code.length !== 6}
                className="w-full btn-gold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                ) : (
                  '重置密码'
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-sm mt-8">
          © 2024 FAC (Hong Kong) Ltd. All rights reserved.
        </p>
      </div>
    </div>
  );
}
