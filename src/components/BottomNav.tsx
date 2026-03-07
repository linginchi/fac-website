/**
 * BottomNav — Mobile-first PWA sticky bottom navigation
 * Only visible on small screens (md:hidden applied in App.tsx wrapper)
 * Four tabs: 智慧庫 | 錢包 | [AI 萬能框 center] | 我的
 */
import { Layers, Coins, Mic, User } from 'lucide-react';

type Tab = 'vault' | 'wallet' | 'ai' | 'me';

function getActiveTab(): Tab {
  if (typeof window === 'undefined') return 'ai';
  const p = window.location.pathname;
  if (p === '/vault') return 'vault';
  if (p === '/wallet') return 'wallet';
  if (p === '/profile') return 'me';
  return 'ai';
}

export default function BottomNav() {
  const active = getActiveTab();

  const navigate = (path: string) => {
    if (path === '/' || path === '#ai') {
      // scroll to hero command box
      const el = document.querySelector('#hero');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        // focus the command input if possible
        setTimeout(() => {
          const input = document.querySelector<HTMLTextAreaElement>('textarea[placeholder]');
          input?.focus();
        }, 600);
      } else {
        window.location.href = '/';
      }
      return;
    }
    window.location.href = path;
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden safe-bottom"
      style={{
        background: 'linear-gradient(180deg, rgba(7,14,31,0.96) 0%, rgba(10,22,40,0.99) 100%)',
        borderTop: '1px solid rgba(201,169,110,0.2)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-end justify-around px-2 pt-2 pb-3 relative">

        {/* 智慧庫 */}
        <button
          onClick={() => navigate('/vault')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
          style={{ color: active === 'vault' ? '#C9A96E' : 'rgba(237,232,223,0.45)' }}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium">智慧庫</span>
          {active === 'vault' && <span className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: '#C9A96E' }} />}
        </button>

        {/* 錢包 */}
        <button
          onClick={() => navigate('/wallet')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
          style={{ color: active === 'wallet' ? '#C9A96E' : 'rgba(237,232,223,0.45)' }}
        >
          <Coins className="w-5 h-5" />
          <span className="text-[10px] font-medium">錢包</span>
          {active === 'wallet' && <span className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: '#C9A96E' }} />}
        </button>

        {/* AI 萬能框 — Centre Hero Button */}
        <button
          onClick={() => navigate('#ai')}
          className="flex flex-col items-center flex-shrink-0 -mt-5"
          style={{ outline: 'none' }}
          aria-label="開啟 AI 萬能框"
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)',
              boxShadow: '0 0 0 3px rgba(201,169,110,0.18), 0 8px 24px rgba(201,169,110,0.35)',
            }}
          >
            <Mic className="w-7 h-7" style={{ color: '#0A1628' }} />
          </div>
          <span className="text-[10px] font-semibold mt-1.5" style={{ color: active === 'ai' ? '#C9A96E' : 'rgba(237,232,223,0.6)' }}>
            萬能框
          </span>
          {active === 'ai' && <span className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: '#C9A96E' }} />}
        </button>

        {/* 我的 */}
        <button
          onClick={() => navigate('/profile')}
          className="flex flex-col items-center gap-1 flex-1 py-1 transition-all"
          style={{ color: active === 'me' ? '#C9A96E' : 'rgba(237,232,223,0.45)' }}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-medium">我的</span>
          {active === 'me' && <span className="w-4 h-0.5 rounded-full mt-0.5" style={{ background: '#C9A96E' }} />}
        </button>

      </div>
    </nav>
  );
}
