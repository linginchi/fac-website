import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle, Send } from 'lucide-react';
import { useContactKB } from '../hooks/useContactKB';

const OUT_OF_SCOPE_ZH = '此問題已記錄，我將轉交實驗室管理員處理。';
const OUT_OF_SCOPE_EN = 'This has been recorded and will be forwarded to the laboratory administrator.';

export default function ContactBot() {
  const { t, i18n } = useTranslation();
  const { matchKB, addSubmission } = useContactKB();
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'bot'; text: string }>>([]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const lang = i18n.language === 'en' ? 'en' : 'zh';

  useEffect(() => {
    listRef.current?.scrollTo(0, listRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);
    setIsSending(true);

    const answer = matchKB(text, lang);
    if (answer) {
      setTimeout(() => {
        setMessages((prev) => [...prev, { role: 'bot', text: answer }]);
        setIsSending(false);
      }, 400);
      return;
    }

    addSubmission(text);
    const outOfScope = lang === 'en' ? OUT_OF_SCOPE_EN : OUT_OF_SCOPE_ZH;
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text: outOfScope }]);
      setIsSending(false);
    }, 600);
  };

  return (
    <div
      className="rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(145deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
        border: '1px solid rgba(201,169,110,0.25)',
        boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
        minHeight: '420px',
        maxHeight: '70vh'
      }}
    >
      <div
        className="flex items-center gap-3 px-5 py-4 border-b"
        style={{ borderColor: 'rgba(201,169,110,0.2)' }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)' }}>
          <MessageCircle className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
        </div>
        <div>
          <div className="font-semibold" style={{ color: 'var(--champagne)' }}>FAC 智慧管家</div>
          <div className="text-xs" style={{ color: 'rgba(237,232,223,0.45)' }}>{lang === 'en' ? 'Charter, non-profit, Web3 & compliance' : '章程 · 非盈利 · Web3 · 合規'}</div>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ minHeight: '240px' }}
      >
        {messages.length === 0 && (
          <div className="text-center py-8 text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>
            {t('contact.botPlaceholder')}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
              style={
                m.role === 'user'
                  ? { background: 'rgba(201,169,110,0.2)', border: '1px solid rgba(201,169,110,0.35)', color: 'var(--off-white)' }
                  : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,110,0.15)', color: 'rgba(237,232,223,0.9)' }
              }
            >
              {m.text}
            </div>
          </div>
        ))}
        {isSending && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm flex gap-1" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}>
              <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" style={{ animationDelay: '0.2s' }} />
              <span className="w-2 h-2 rounded-full bg-[#C9A96E] animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t flex gap-2" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
          placeholder={lang === 'en' ? 'Type your question...' : '輸入您的問題…'}
          className="flex-1 px-4 py-3 rounded-xl outline-none text-sm"
          style={{
            background: 'rgba(201,169,110,0.08)',
            border: '1px solid rgba(201,169,110,0.2)',
            color: 'var(--off-white)',
            caretColor: 'var(--champagne)'
          }}
        />
        <button
          type="button"
          onClick={handleSend}
          disabled={!input.trim() || isSending}
          className="flex items-center justify-center w-12 h-12 rounded-xl transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
