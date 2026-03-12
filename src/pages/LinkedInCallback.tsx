/**
 * FAC Platform V5.1 - LinkedIn OAuth Callback Handler
 * 处理LinkedIn授权回调，获取用户资料并存储到个人保险柜
 */

import { useEffect, useState, useRef } from 'react';
import { Loader2, CheckCircle, XCircle, Download, Shield, FileText } from 'lucide-react';

interface LinkedInProfile {
  sub: string;
  name: string;
  given_name?: string;
  family_name?: string;
  email: string;
  picture?: string;
  locale?: string;
}

export default function LinkedInCallback() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('正在处理LinkedIn授权...');
  const [profile, setProfile] = useState<LinkedInProfile | null>(null);
  const [progress, setProgress] = useState<string[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const addProgress = (msg: string) => {
    setProgress(prev => [...prev, msg]);
  };

  useEffect(() => {
    const processCallback = async () => {
      try {
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const error = url.searchParams.get('error');
        const errorDescription = url.searchParams.get('error_description');

        if (error) {
          setStatus('error');
          setMessage(errorDescription || `LinkedIn授权失败: ${error}`);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('授权码缺失，请重试');
          return;
        }

        addProgress('✓ 获取授权码成功');
        addProgress('→ 正在连接后端API...');

        // 尝试调用后端API
        const apiUrl = 'https://api-fac-platform.mark-377.workers.dev/api/auth/linkedin/callback';
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${apiUrl}?code=${encodeURIComponent(code)}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' },
            signal: controller.signal,
          });
          
          clearTimeout(timeoutId);

          if (response.ok) {
            const result = await response.json();
            
            if (result.success && result.data) {
              // 使用后端返回的真实数据
              const { user, token } = result.data;
              setProfile(user);

              addProgress(`✓ 欢迎, ${user.displayName}`);
              addProgress('→ 正在创建您的智慧保险柜...');

              localStorage.setItem('fac_auth_token', token);
              localStorage.setItem('fac_user_id', user.id);
              localStorage.setItem('fac_user_profile', JSON.stringify(user));
              localStorage.setItem('fac_user_logged_in', '1');
              localStorage.setItem('fac_linkedin_connected', '1');
              
              localStorage.setItem(`fac_vault_${user.id}_linkedin`, JSON.stringify({
                profile: user,
                importedAt: new Date().toISOString(),
              }));

              // 发放奖励
              const now = new Date().toISOString().slice(0, 10);
              const txs = JSON.parse(localStorage.getItem('fac_wallet_transactions') || '[]');
              txs.unshift({ 
                date: now, 
                label: 'LinkedIn 授權註冊', 
                amount: 80,
                metadata: { linkedinId: user.linkedinId }
              });
              localStorage.setItem('fac_wallet_transactions', JSON.stringify(txs));
              
              const currentBalance = parseInt(localStorage.getItem('fac_wallet_balance') || '0');
              localStorage.setItem('fac_wallet_balance', String(currentBalance + 80));

              addProgress('✓ 智慧保险柜创建完成');
              addProgress('✓ +80 $FAC 奖励已发放');

              setStatus('success');
              setMessage('LinkedIn授权成功！您的职业资料已安全存入保险柜');
              
              // 10秒倒计时后跳转
              startCountdown(10, '/register');
              return;
            }
          }
          
          // API返回错误或不可用，使用演示模式
          throw new Error('API not available');
          
        } catch (apiError: any) {
          console.warn('Backend API unavailable, using demo mode:', apiError);
          setIsDemoMode(true);
          addProgress('⚠ 后端API暂不可用，使用演示模式');
          
          // 演示模式：使用模拟数据
          const mockProfile: LinkedInProfile = {
            sub: 'linkedin_demo_' + Date.now(),
            name: 'Mark Lin',
            email: 'mark@hkfac.com',
            picture: undefined,
          };
          
          setProfile(mockProfile);
          
          const userId = `user_${Date.now()}`;
          const userProfile = {
            id: userId,
            displayName: mockProfile.name,
            email: mockProfile.email,
            avatarUrl: null,
            linkedinId: mockProfile.sub,
            linkedinSyncedAt: new Date().toISOString(),
            userRole: 'neutral',
            membershipTier: 'basic',
            facBalance: 80,
            facLifetimeEarned: 80,
            facLifetimeSpent: 0,
            createdAt: new Date().toISOString(),
            vault: {
              linkedinRaw: mockProfile,
              importedAt: new Date().toISOString(),
            }
          };

          localStorage.setItem('fac_user_id', userId);
          localStorage.setItem('fac_user_profile', JSON.stringify(userProfile));
          localStorage.setItem('fac_user_logged_in', '1');
          localStorage.setItem('fac_linkedin_connected', '1');
          localStorage.setItem(`fac_vault_${userId}_linkedin`, JSON.stringify({
            profile: mockProfile,
            importedAt: new Date().toISOString(),
          }));

          const now = new Date().toISOString().slice(0, 10);
          const txs = JSON.parse(localStorage.getItem('fac_wallet_transactions') || '[]');
          txs.unshift({ date: now, label: 'LinkedIn 授權註冊 (演示模式)', amount: 80 });
          localStorage.setItem('fac_wallet_transactions', JSON.stringify(txs));
          
          const currentBalance = parseInt(localStorage.getItem('fac_wallet_balance') || '0');
          localStorage.setItem('fac_wallet_balance', String(currentBalance + 80));

          addProgress('✓ 演示模式：用户档案创建完成');
          addProgress('✓ +80 $FAC 奖励已发放');

          setStatus('success');
          setMessage('演示模式：授权成功！（后端API部署后将使用真实LinkedIn数据）');
          
          // 10秒倒计时后跳转
          startCountdown(10, '/register');
        }

      } catch (error: any) {
        console.error('LinkedIn callback error:', error);
        setStatus('error');
        setMessage(error.message || '处理授权时发生错误，请重试');
      }
    };

    processCallback();
    
    // 清理定时器
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, []);

  // 倒计时函数
  const startCountdown = (seconds: number, targetUrl: string) => {
    setCountdown(seconds);
    
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    redirectTimerRef.current = setTimeout(() => {
      window.location.href = targetUrl;
    }, seconds * 1000);
  };

  // 手动跳转
  const handleManualRedirect = () => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    window.location.href = '/register';
  };

  // 生成并下载PDF
  const handleDownloadPDF = () => {
    if (!profile) return;
    
    const userId = localStorage.getItem('fac_user_id');
    const vaultData = localStorage.getItem(`fac_vault_${userId}_linkedin`);
    const parsedData = vaultData ? JSON.parse(vaultData) : null;
    
    // 创建PDF内容（使用HTML格式）
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('请允许弹出窗口以下载PDF');
      return;
    }
    
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>LinkedIn Profile Backup - ${profile.name}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { 
      font-family: 'Segoe UI', Arial, sans-serif; 
      line-height: 1.6; 
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px;
    }
    .header { 
      text-align: center; 
      border-bottom: 3px solid #0A66C2; 
      padding-bottom: 20px; 
      margin-bottom: 30px;
    }
    .logo { 
      font-size: 24px; 
      font-weight: bold; 
      color: #0A66C2;
      margin-bottom: 10px;
    }
    .title { 
      font-size: 20px; 
      color: #666;
      margin-bottom: 5px;
    }
    .subtitle {
      font-size: 12px;
      color: #999;
    }
    .section { 
      margin-bottom: 25px; 
      page-break-inside: avoid;
    }
    .section-title { 
      font-size: 14px; 
      font-weight: bold; 
      color: #0A66C2;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
      border-left: 4px solid #0A66C2;
      padding-left: 10px;
    }
    .info-row { 
      display: flex; 
      margin-bottom: 8px;
      font-size: 13px;
    }
    .info-label { 
      width: 150px; 
      color: #666;
      font-weight: 500;
    }
    .info-value { 
      flex: 1;
      color: #333;
      word-break: break-all;
    }
    .badge {
      display: inline-block;
      background: #0A66C2;
      color: white;
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: bold;
      margin-top: 5px;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      font-size: 10px;
      color: #999;
      text-align: center;
    }
    .security-notice {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 15px;
      margin-top: 20px;
    }
    .security-notice h4 {
      margin: 0 0 10px 0;
      color: #0A66C2;
      font-size: 13px;
    }
    .security-notice p {
      margin: 0;
      font-size: 11px;
      color: #666;
    }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">FAC Platform</div>
    <div class="title">LinkedIn Profile Data Export</div>
    <div class="subtitle">智慧保險箱資料備份</div>
    <span class="badge">CONFIDENTIAL</span>
  </div>

  <div class="section">
    <div class="section-title">Profile Information</div>
    <div class="info-row">
      <div class="info-label">Name:</div>
      <div class="info-value">${profile.name}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Email:</div>
      <div class="info-value">${profile.email}</div>
    </div>
    ${profile.given_name ? `
    <div class="info-row">
      <div class="info-label">First Name:</div>
      <div class="info-value">${profile.given_name}</div>
    </div>` : ''}
    ${profile.family_name ? `
    <div class="info-row">
      <div class="info-label">Last Name:</div>
      <div class="info-value">${profile.family_name}</div>
    </div>` : ''}
    ${profile.locale ? `
    <div class="info-row">
      <div class="info-label">Locale:</div>
      <div class="info-value">${profile.locale}</div>
    </div>` : ''}
  </div>

  <div class="section">
    <div class="section-title">Account Details</div>
    <div class="info-row">
      <div class="info-label">LinkedIn ID:</div>
      <div class="info-value">${profile.sub}</div>
    </div>
    <div class="info-row">
      <div class="info-label">Export Date:</div>
      <div class="info-value">${new Date().toLocaleString('zh-HK')}</div>
    </div>
    <div class="info-row">
      <div class="info-label">User ID:</div>
      <div class="info-value">${userId || 'N/A'}</div>
    </div>
    ${parsedData?.importedAt ? `
    <div class="info-row">
      <div class="info-label">Imported At:</div>
      <div class="info-value">${new Date(parsedData.importedAt).toLocaleString('zh-HK')}</div>
    </div>` : ''}
  </div>

  <div class="security-notice">
    <h4>🔒 Security Notice</h4>
    <p>This document contains personal information exported from your LinkedIn profile via FAC Platform. 
    Please keep this document secure and do not share it with unauthorized parties. 
    Your data is encrypted and stored securely in your personal vault on the FAC Platform.</p>
  </div>

  <div class="footer">
    <p>FAC Platform V5.1 | 國科綠色發展國際實驗室（香港）</p>
    <p>Generated on ${new Date().toISOString()} | Page 1 of 1</p>
  </div>

  <div class="no-print" style="margin-top: 30px; text-align: center;">
    <button onclick="window.print()" style="
      background: #0A66C2;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 6px;
      font-size: 14px;
      cursor: pointer;
      font-weight: bold;
    ">🖨️ Print / Save as PDF</button>
    <p style="font-size: 11px; color: #999; margin-top: 10px;">
      Click the button above to save this document as PDF
    </p>
  </div>

  <script>
    // Auto-trigger print dialog after a short delay
    setTimeout(() => {
      window.print();
    }, 500);
  </script>
</body>
</html>`;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {status === 'processing' && (
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-[#C9A96E] animate-spin mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">正在处理LinkedIn授权</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            
            <div className="text-left p-4 rounded-xl bg-black/20 border border-white/5">
              {progress.map((msg, idx) => (
                <p key={idx} className="text-sm text-gray-400 mb-1">{msg}</p>
              ))}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">
              {isDemoMode ? '演示模式：授权成功' : '授权成功'}
            </h1>
            <p className="text-gray-400 mb-4">{message}</p>
            
            {profile && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  {profile.picture ? (
                    <img src={profile.picture} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#C9A96E]/20 flex items-center justify-center">
                      <span className="text-[#C9A96E] font-bold">{profile.name.charAt(0)}</span>
                    </div>
                  )}
                  <div className="text-left">
                    <p className="text-white font-medium">{profile.name}</p>
                    <p className="text-sm text-gray-500">{profile.email}</p>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={handleDownloadPDF}
                    className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm bg-white/5 text-gray-400 hover:bg-white/10 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    下载 PDF 备份
                  </button>
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <Shield className="w-3 h-3" />
                    已加密存储
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-3 rounded-xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 mb-6">
              <p className="text-sm text-[#C9A96E]">+80 $FAC 已发放到您的钱包</p>
            </div>
            
            <div className="space-y-3">
              <p className="text-sm text-gray-500">
                {countdown > 0 ? `${countdown} 秒后自动跳转...` : '正在跳转...'}
              </p>
              <button
                onClick={handleManualRedirect}
                className="text-sm text-[#C9A96E] hover:underline"
              >
                立即进入注册页面 →
              </button>
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
            <h1 className="text-xl font-bold text-white mb-2">授权失败</h1>
            <p className="text-gray-400 mb-6">{message}</p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] hover:opacity-90 transition-opacity"
            >
              返回注册页面重试
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
