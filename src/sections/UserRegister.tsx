import { useState } from 'react';
import { Linkedin, Mail, Coins, Lock } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface UserRegisterProps {
  onBack?: () => void;
}

export default function UserRegister({ onBack }: UserRegisterProps) {
  const [linkedInSynced, setLinkedInSynced] = useState(false);
  const { addTransaction } = useWallet();

  const handleLinkedInLogin = () => {
    // 預留：實際接 LinkedIn OAuth
    window.open('https://www.linkedin.com/oauth/v2/authorization', '_blank', 'noopener,noreferrer');
  };

  const handleSyncLinkedIn = () => {
    // 一鍵同步：更新全域錢包狀態，餘額即時跳動至 130 $FAC (80 + 50)，並標記已登入
    const now = new Date().toISOString().slice(0, 10);
    addTransaction({ date: now, label: 'LinkedIn 註冊獎勵', amount: 80 });
    addTransaction({ date: now, label: 'LinkedIn 數據同步', amount: 50 });
    try {
      localStorage.setItem('fac_user_logged_in', '1');
      if (!localStorage.getItem('fac_user_id')) {
        localStorage.setItem('fac_user_id', 'user_' + Date.now());
      }
    } catch (_) {}
    setLinkedInSynced(true);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)'
        }}
      />
      <div
        className="absolute top-1/4 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo & Back */}
        <div className="text-center mb-8">
          {onBack && (
            <button
              onClick={onBack}
              className="absolute left-0 top-0 flex items-center gap-1 text-sm transition-colors"
              style={{ color: 'rgba(201,169,110,0.7)' }}
            >
              ← 返回首頁
            </button>
          )}
          <div className="text-3xl font-bold mb-1" style={{ color: 'var(--off-white)' }}>
            F<span style={{ color: 'var(--champagne)' }}>A</span>C
          </div>
          <p className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>
            智慧沈澱，在此相遇
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-8 border"
          style={{
            background: 'linear-gradient(145deg, rgba(13,31,60,0.95) 0%, rgba(10,22,40,0.98) 100%)',
            borderColor: 'rgba(201,169,110,0.2)'
          }}
        >
          <h1 className="text-xl font-bold text-center mb-2" style={{ color: 'var(--off-white)', fontFamily: "'PingFang HK', sans-serif" }}>
            註冊 / 登入
          </h1>
          <p className="text-center text-sm mb-6" style={{ color: 'rgba(237,232,223,0.6)' }}>
            使用 LinkedIn 一鍵註冊，即領 80 $FAC
          </p>

          {/* LinkedIn 登入 — 最醒目 */}
          <button
            type="button"
            onClick={handleLinkedInLogin}
            className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl font-semibold text-base transition-all duration-300 hover:opacity-95 hover:scale-[1.01]"
            style={{
              background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: '0 4px 20px rgba(10,102,194,0.35)'
            }}
          >
            <Linkedin className="w-6 h-6" />
            <span>使用 LinkedIn 登入</span>
          </button>
          <div
            className="mt-3 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-medium"
            style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)', color: 'var(--champagne)' }}
          >
            <Coins className="w-4 h-4" />
            <span>使用 LinkedIn 註冊即領 80 $FAC</span>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="flex-1 h-px" style={{ background: 'rgba(201,169,110,0.2)' }} />
            <span className="text-xs" style={{ color: 'rgba(201,169,110,0.5)' }}>或</span>
            <div className="flex-1 h-px" style={{ background: 'rgba(201,169,110,0.2)' }} />
          </div>

          {/* 一鍵同步 LinkedIn 資歷（錢包同步功能） */}
          <div
            className="rounded-xl p-5 mb-6"
            style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.18)' }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.22)' }}
              >
                <Lock className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium mb-2" style={{ color: 'var(--off-white)' }}>
                  一鍵同步 LinkedIn 資歷
                </p>
                <p className="text-xs mb-4" style={{ color: 'rgba(237,232,223,0.65)', lineHeight: 1.6 }}>
                  將您的傳奇資歷安全存入銀行級私人保險箱。
                </p>
                <p className="text-xs mb-4" style={{ color: 'rgba(237,232,223,0.5)', lineHeight: 1.5 }}>
                  經歷、技能、職稱經授權後自動寫入個人智慧錢包，僅供 Agent 匹配使用；同步即領 50 $FAC。
                </p>
                <button
                  type="button"
                  onClick={handleSyncLinkedIn}
                  disabled={linkedInSynced}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: linkedInSynced ? 'rgba(201,169,110,0.15)' : 'rgba(201,169,110,0.15)',
                    border: '1px solid rgba(201,169,110,0.35)',
                    color: 'var(--champagne)'
                  }}
                >
                  {linkedInSynced ? (
                    <>已同步 · 同步即領 50 $FAC</>
                  ) : (
                    <>
                      <Linkedin className="w-4 h-4" />
                      一鍵同步 LinkedIn 資歷
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* 其他登入方式 */}
          <button
            type="button"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors"
            style={{ border: '1px solid rgba(201,169,110,0.25)', color: 'rgba(237,232,223,0.7)' }}
          >
            <Mail className="w-4 h-4" />
            使用信箱註冊 / 登入
          </button>
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'rgba(237,232,223,0.35)' }}>
          註冊即表示您同意我們的服務條款與隱私政策。FAC 不會未經授權公開您的錢包數據。
        </p>
      </div>
    </div>
  );
}
