/**
 * MessagesPage — 平台消息 / 我的消息
 * Route: /me/messages
 * Shows replies from FAC 港匠匯 (admin replies to contact submissions).
 */
import { useEffect, useState, useCallback } from 'react';
import { MessageCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { useContactKB } from '../hooks/useContactKB';

const STORAGE_USER_ID = 'fac_user_id';
const STORAGE_LOGGED_IN = 'fac_user_logged_in';
const STORAGE_PLATFORM_MESSAGES = 'fac_platform_messages';

interface PlatformMessage {
  id: string;
  from: string;
  text: string;
  at: string;
  read?: boolean;
}

function loadMessagesForUser(uid: string): PlatformMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_PLATFORM_MESSAGES);
    if (!raw) return [];
    const data: Record<string, PlatformMessage[]> = JSON.parse(raw);
    return data[uid] ?? [];
  } catch {
    return [];
  }
}

export default function MessagesPage({ onBack }: { onBack: () => void }) {
  const { markMessageRead } = useContactKB();
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<PlatformMessage[]>([]);

  const refresh = useCallback(() => {
    const uid = localStorage.getItem(STORAGE_USER_ID);
    setUserId(uid);
    if (uid) setMessages(loadMessagesForUser(uid));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const loggedIn = typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_LOGGED_IN);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--midnight)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(160deg, #070E1F 0%, #0D1F3C 55%, #070E1F 100%)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
        <div className="flex items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center justify-center w-10 h-10 rounded-xl transition-colors"
              style={{ color: 'var(--champagne)', border: '1px solid rgba(201,169,110,0.3)' }}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'var(--off-white)' }}>
                我的消息
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(237,232,223,0.5)' }}>
                Messages · 來自 FAC 港匠匯 的專業答覆
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={refresh}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--champagne)', border: '1px solid rgba(201,169,110,0.3)' }}
            title="重新載入"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {!loggedIn || !userId ? (
          <div className="rounded-2xl p-8 text-center border" style={{ borderColor: 'rgba(201,169,110,0.2)', background: 'rgba(255,255,255,0.02)' }}>
            <p className="text-sm mb-4" style={{ color: 'rgba(237,232,223,0.6)' }}>
              請先登入以查看平台消息。
            </p>
            <a
              href="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}
            >
              登入 / 註冊
            </a>
          </div>
        ) : messages.length === 0 ? (
          <div className="rounded-2xl p-10 text-center border" style={{ borderColor: 'rgba(201,169,110,0.15)', background: 'rgba(255,255,255,0.02)' }}>
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-40" style={{ color: 'var(--champagne)' }} />
            <p className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>
              尚無消息。諮詢回覆將顯示於此。
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="rounded-2xl p-5 border transition-colors"
                style={{
                  borderColor: msg.read ? 'rgba(201,169,110,0.12)' : 'rgba(201,169,110,0.28)',
                  background: msg.read ? 'rgba(255,255,255,0.02)' : 'rgba(201,169,110,0.06)',
                }}
                onClick={() => {
                  if (msg.read || !userId) return;
                  markMessageRead(userId, msg.id);
                  setMessages((prev) => prev.map((m) => (m.id === msg.id ? { ...m, read: true } : m)));
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--champagne)' }}>
                    來自 FAC 港匠匯 的專業答覆
                  </span>
                  {!msg.read && (
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: 'var(--champagne)' }} />
                  )}
                </div>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'rgba(237,232,223,0.9)' }}>
                  {msg.text}
                </p>
                <p className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>
                  {new Date(msg.at).toLocaleString('zh-HK')}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
