/**
 * FAC Platform V5.1 - LinkedIn OAuth Callback Handler
 * 处理LinkedIn授权回调
 */

import { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export default function LinkedInCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('正在处理LinkedIn授权...');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || 'LinkedIn授权失败: ' + error);
          return;
        }

        if (!code || !state) {
          setStatus('error');
          setMessage('授权参数缺失');
          return;
        }

        // 验证state防止CSRF攻击
        const savedState = sessionStorage.getItem('linkedin_oauth_state');
        if (state !== savedState) {
          setStatus('error');
          setMessage('安全验证失败，请重试');
          return;
        }

        // 调用后端API交换code获取token
        const response = await fetch('/api/auth/linkedin/callback?code=' + encodeURIComponent(code));
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || 'LinkedIn登录失败');
        }

        // 登录成功
        const { user, token } = data;

        // 存储token
        localStorage.setItem('fac_auth_token', token);
        localStorage.setItem('fac_user_logged_in', '1');
        if (user.id) {
          localStorage.setItem('fac_user_id', user.id);
        }

        // 存储用户信息
        localStorage.setItem('fac_user_profile', JSON.stringify(user));

        // 发放LinkedIn登录奖励
        const now = new Date().toISOString().slice(0, 10);
        const txs = JSON.parse(localStorage.getItem('fac_wallet_transactions') || '[]');
        txs.unshift({ date: now, label: 'LinkedIn 授權註冊', amount: 80 });
        localStorage.setItem('fac_wallet_transactions', JSON.stringify(txs));
        
        const currentBalance = parseInt(localStorage.getItem('fac_wallet_balance') || '0');
        localStorage.setItem('fac_wallet_balance', String(currentBalance + 80));

        setStatus('success');
        setMessage('LinkedIn授权成功！正在跳转...');

        // 清除state
        sessionStorage.removeItem('linkedin_oauth_state');

        // 跳转到注册向导（步骤2：身份选择）
        setTimeout(() => {
          window.location.href = '/register?step=2';
        }, 1500);

      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || '处理授权时发生错误');
      }
    };

    processCallback();
  }, []);

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <>
            <Loader2 className="w-16 h-16 text-[#C9A96E] animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">正在处理LinkedIn授权</h1>
            <p className="text-gray-400">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">授权成功</h1>
            <p className="text-gray-400">{message}</p>
            <div className="mt-4 p-3 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20">
              <p className="text-sm text-[#C9A96E]">+80 $FAC 已发放</p>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">授权失败</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] hover:opacity-90 transition-opacity"
            >
              返回注册页面
            </a>
          </>
        )}
      </div>
    </div>
  );
}
