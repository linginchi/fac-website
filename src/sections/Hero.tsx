import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ChevronDown, Mic, Paperclip, ArrowRight, Sparkles, Coins, X,
  BrainCircuit, ShieldCheck, Send, Calendar
} from 'lucide-react';
import gsap from 'gsap';
import { useWallet } from '../context/WalletContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const DECODE_COST = 10;

const KEYWORDS = ['SFC', 'RO', '工程', '貿易', '老師', '專家', '信託', '融資', '製造', '合規', '律師', '銀行', '教育'];

const MOCK_EXPERTS = [
  { id: 'A', anon: '專家 A', credential: '前美資銀行 MD，擁有 SFC 1、4、9 號牌 RO 實務經驗，主導過逾 30 宗跨境融資案。' },
  { id: 'B', anon: '專家 B', credential: '前港府工務局高級工程師，基建監理資歷 28 年，主責大型公共工程項目驗收。' },
  { id: 'C', anon: '專家 C', credential: '大灣區跨境貿易合規顧問，深耕出口管制與關稅架構優化，曾任職世界 500 強物流企業。' },
];

const THINKING_STEPS = [
  'AI Agent 正在分析需求…',
  '正在掃描「個人智慧錢包」網絡…',
  '正在比對八大智慧支柱資料庫…',
  '加密通道已建立，準備解鎖匹配結果…',
];

const suggestions = [
  '幫我找跨境貿易合規專家',
  '家族信託架構如何設計？',
  '尋找 SFC 持牌 RO 顧問',
  '企業融資談判老江湖',
];

// ─── Types ────────────────────────────────────────────────────────────────────
type AgentPhase = 'idle' | 'thinking' | 'matched' | 'decoded' | 'action';

// ─── Typewriter Hook ──────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 28, active = false) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setDisplayed(''); setDone(false); return; }
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed, active]);

  return { displayed, done };
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function Hero() {
  const heroRef    = useRef<HTMLDivElement>(null);
  const tagRef     = useRef<HTMLSpanElement>(null);
  const titleRef   = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const ctaRef     = useRef<HTMLDivElement>(null);
  const bubbleRef  = useRef<HTMLDivElement>(null);

  const { facBalance, addTransaction } = useWallet();

  const [commandValue, setCommandValue]     = useState('');
  const [isFocused, setIsFocused]           = useState(false);
  const [isMicPulsing, setIsMicPulsing]     = useState(false);
  const [agentPhase, setAgentPhase]         = useState<AgentPhase>('idle');
  const [thinkingStep, setThinkingStep]     = useState(0);
  const [decodeError, setDecodeError]       = useState('');
  const [jobOfferSent, setJobOfferSent]     = useState(false);

  const matchText = '已成功從「個人智慧錢包」網絡中匹配到 3-5 位符合條件的隱世專家，正在等待您解碼深度資歷。';
  const { displayed: matchDisplayed, done: matchDone } = useTypewriter(matchText, 22, agentPhase === 'matched');

  // ─── GSAP entrance ──────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      tl.fromTo(tagRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.7 }, 0.3);
      titleRef.current?.querySelectorAll('.title-line').forEach((line, i) => {
        tl.fromTo(line, { rotateX: -90, y: 60, opacity: 0 }, { rotateX: 0, y: 0, opacity: 1, duration: 0.9 }, 0.6 + i * 0.18);
      });
      tl.fromTo(subtitleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.1);
      tl.fromTo(commandRef.current, { y: 44, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1 }, 1.35);
      tl.fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 1.8);
    }, heroRef);
    return () => ctx.revert();
  }, []);

  // ─── Bubble slide-in ────────────────────────────────────────────────────────
  useEffect(() => {
    if (agentPhase !== 'idle' && bubbleRef.current) {
      gsap.fromTo(bubbleRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.55, ease: 'expo.out' });
    }
  }, [agentPhase]);

  // ─── Thinking stepper ───────────────────────────────────────────────────────
  useEffect(() => {
    if (agentPhase !== 'thinking') return;
    setThinkingStep(0);
    let step = 0;
    const id = setInterval(() => {
      step++;
      if (step < THINKING_STEPS.length) {
        setThinkingStep(step);
      } else {
        clearInterval(id);
        setAgentPhase('matched');
      }
    }, 900);
    return () => clearInterval(id);
  }, [agentPhase]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const hasKeyword = useCallback((q: string) =>
    KEYWORDS.some((k) => q.includes(k)), []);

  const handleSubmit = useCallback(() => {
    if (!commandValue.trim()) return;
    setDecodeError('');
    setJobOfferSent(false);
    setAgentPhase('thinking');
  }, [commandValue]);

  const handleDecode = useCallback(() => {
    setDecodeError('');
    if (facBalance < DECODE_COST) {
      setDecodeError('錢包餘額不足，請前往 LinkedIn 同步以獲取更多獎勵。');
      return;
    }
    addTransaction({ date: new Date().toISOString().slice(0, 10), label: '智慧資訊解碼支出', amount: -DECODE_COST });
    setAgentPhase('decoded');
  }, [facBalance, addTransaction]);

  const handleMic = useCallback(() => {
    setIsMicPulsing(true);
    setTimeout(() => setIsMicPulsing(false), 3000);
  }, []);

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAgent = () => {
    setAgentPhase('idle');
    setCommandValue('');
    setDecodeError('');
    setJobOfferSent(false);
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      {/* ── Background layers ─────────────────────────────────────────── */}
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }} />
      <div className="absolute pointer-events-none" style={{
        top: '10%', right: '8%', width: '520px', height: '520px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)', filter: 'blur(50px)'
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: '15%', left: '3%', width: '380px', height: '380px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)', filter: 'blur(60px)'
      }} />
      <div className="absolute pointer-events-none transition-opacity duration-700" style={{
        top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
        width: '900px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 70%)',
        filter: 'blur(40px)', opacity: isFocused ? 1 : 0
      }} />
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(rgba(201,169,110,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.035) 1px, transparent 1px)',
        backgroundSize: '60px 60px'
      }} />

      {/* ── Content ───────────────────────────────────────────────────── */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-12 py-32 text-center">

        <span ref={tagRef} className="section-tag opacity-0 inline-flex items-center gap-2 mb-8">
          <Sparkles className="w-3 h-3" />
          FAC &nbsp;·&nbsp; Web3 去中心化智慧對接平台
        </span>

        <div ref={titleRef} className="space-y-1 mb-6" style={{ perspective: '1000px' }}>
          <h1 className="title-line font-bold leading-tight opacity-0" style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: 'var(--off-white)',
            fontFamily: "'PingFang HK','Noto Sans TC',sans-serif", letterSpacing: '0.04em'
          }}>智慧沈澱，</h1>
          <h1 className="title-line font-bold leading-tight opacity-0 text-gold-gradient" style={{
            fontSize: 'clamp(2.4rem, 5vw, 4rem)',
            fontFamily: "'PingFang HK','Noto Sans TC',sans-serif", letterSpacing: '0.04em'
          }}>在此相遇。</h1>
        </div>

        <p ref={subtitleRef} className="opacity-0 mb-10 mx-auto" style={{
          color: 'rgba(237,232,223,0.7)', fontSize: 'clamp(0.9rem,2vw,1.05rem)',
          lineHeight: '1.9', maxWidth: '560px'
        }}>
          香港首個 Web3 去中心化對接平台。有些答案，不在數據庫，
          <br className="hidden sm:block" />
          <span style={{ color: 'rgba(201,169,110,0.9)', fontStyle: 'italic' }}>在老江湖的腦袋中。</span>
        </p>

        {/* ════════════════════════════════════════════════════════════════
            萬能指揮框 Command Box  +  $FAC 餘額
        ═══════════════════════════════════════════════════════════════════ */}
        <div ref={commandRef} className="opacity-0 mb-8 flex flex-col sm:flex-row items-start justify-center gap-4 sm:gap-5">

          {/* Command Box wrapper */}
          <div className="relative w-full" style={{ maxWidth: '740px' }}>

            {/* Box itself */}
            <div
              className="relative transition-all duration-500"
              style={{
                borderRadius: '18px',
                background: 'linear-gradient(135deg,rgba(13,31,60,0.96) 0%,rgba(10,22,40,0.99) 100%)',
                border: isMicPulsing
                  ? '1px solid rgba(201,169,110,0.7)'
                  : isFocused
                    ? '1px solid rgba(201,169,110,0.55)'
                    : '1px solid rgba(201,169,110,0.2)',
                boxShadow: isMicPulsing
                  ? '0 0 0 4px rgba(201,169,110,0.12), 0 0 0 8px rgba(201,169,110,0.06), 0 0 48px rgba(201,169,110,0.2)'
                  : isFocused
                    ? '0 0 48px rgba(201,169,110,0.13), 0 12px 40px rgba(0,0,0,0.45)'
                    : '0 6px 28px rgba(0,0,0,0.35)',
                backdropFilter: 'blur(24px)',
                transition: 'box-shadow 0.4s, border 0.4s'
              }}
            >
              {/* Mic pulse rings */}
              {isMicPulsing && (
                <>
                  <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{
                    border: '1px solid rgba(201,169,110,0.35)',
                    animation: 'mic-ring 1.2s ease-out infinite'
                  }} />
                  <div className="absolute inset-0 rounded-[18px] pointer-events-none" style={{
                    border: '1px solid rgba(201,169,110,0.2)',
                    animation: 'mic-ring 1.2s ease-out 0.4s infinite'
                  }} />
                </>
              )}

              {/* $FAC badge */}
              <div className="absolute -top-3.5 right-5">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium" style={{
                  background: 'linear-gradient(135deg,rgba(10,22,40,0.99) 0%,rgba(13,31,60,0.96) 100%)',
                  border: '1px solid rgba(201,169,110,0.35)', color: 'var(--champagne)'
                }}>
                  $FAC &nbsp;<span style={{ opacity: 0.55 }}>· Token to Decode</span>
                </span>
              </div>

              {/* Input row */}
              <div className="flex items-center px-5 py-4 gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center" style={{
                  background: 'linear-gradient(135deg,rgba(201,169,110,0.18) 0%,rgba(201,169,110,0.07) 100%)',
                  border: '1px solid rgba(201,169,110,0.28)'
                }}>
                  <span className="text-xs font-bold" style={{ color: 'var(--champagne)', fontFamily: "'PingFang HK',sans-serif" }}>匠</span>
                </div>

                <input
                  type="text"
                  value={commandValue}
                  onChange={(e) => setCommandValue(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(); }}
                  placeholder="請描述您的需求，AI Agent 將為您配對最合適的智慧顧問…"
                  className="flex-1 bg-transparent outline-none text-sm lg:text-base min-w-0"
                  style={{ color: 'var(--off-white)', caretColor: 'var(--champagne)' }}
                />

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Mic button */}
                  <button
                    title="語音輸入"
                    onClick={handleMic}
                    className="relative w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10"
                    style={{ color: isMicPulsing ? 'var(--champagne)' : 'rgba(201,169,110,0.45)' }}
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  {/* Paperclip */}
                  <button
                    title="上傳文件"
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10"
                    style={{ color: 'rgba(201,169,110,0.45)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--champagne)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(201,169,110,0.45)'; }}
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleSubmit}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 group"
                    style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                  >
                    配對
                    <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(201,169,110,0.15),transparent)', margin: '0 20px' }} />

              {/* Suggestion chips */}
              <div className="flex flex-wrap items-center gap-2 px-5 py-3">
                <span className="text-xs flex-shrink-0" style={{ color: 'rgba(201,169,110,0.45)' }}>快速提問：</span>
                {suggestions.map((s) => (
                  <button key={s} onClick={() => setCommandValue(s)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{ background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.14)', color: 'rgba(237,232,223,0.65)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.42)'; (e.currentTarget as HTMLElement).style.color = 'var(--champagne)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.14)'; (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,223,0.65)'; }}
                  >{s}</button>
                ))}
              </div>

              <p className="mt-3 text-xs text-center pb-1" style={{ color: 'rgba(201,169,110,0.35)' }}>
                支持文字 · 語音 · 多模態文件上傳 &nbsp;|&nbsp; Powered by AI Agent (Sonnet 4.6)
              </p>
            </div>

            {/* ════ Agent Chat Bubble ════════════════════════════════════════ */}
            {agentPhase !== 'idle' && (
              <div
                ref={bubbleRef}
                className="mt-4 text-left rounded-2xl overflow-hidden"
                style={{
                  background: 'linear-gradient(145deg,rgba(13,31,60,0.97) 0%,rgba(10,22,40,0.99) 100%)',
                  border: '1px solid rgba(201,169,110,0.28)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.45)'
                }}
              >
                {/* Bubble header */}
                <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.14)', border: '1px solid rgba(201,169,110,0.28)' }}>
                      <BrainCircuit className="w-3.5 h-3.5" style={{ color: 'var(--champagne)' }} />
                    </div>
                    <span className="text-xs font-semibold" style={{ color: 'var(--champagne)' }}>FAC AI Agent</span>
                    {agentPhase === 'thinking' && (
                      <span className="flex gap-1">
                        {[0, 1, 2].map((i) => (
                          <span key={i} className="w-1.5 h-1.5 rounded-full" style={{
                            background: 'rgba(201,169,110,0.7)',
                            animation: `dot-bounce 1.2s ease-in-out ${i * 0.2}s infinite`
                          }} />
                        ))}
                      </span>
                    )}
                  </div>
                  <button onClick={resetAgent} className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-white/10 transition-colors" style={{ color: 'rgba(237,232,223,0.5)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="px-5 py-4 space-y-4">
                  {/* ─ Thinking phase ─ */}
                  {agentPhase === 'thinking' && (
                    <p className="text-sm" style={{ color: 'rgba(237,232,223,0.75)', lineHeight: 1.7 }}>
                      {THINKING_STEPS[thinkingStep]}
                    </p>
                  )}

                  {/* ─ Matched phase ─ */}
                  {(agentPhase === 'matched' || agentPhase === 'decoded' || agentPhase === 'action') && (
                    <>
                      {/* Query echo */}
                      <div className="flex gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--champagne)' }}>你</div>
                        <p className="text-sm py-0.5" style={{ color: 'rgba(237,232,223,0.85)' }}>{commandValue}</p>
                      </div>
                      {/* Agent reply */}
                      <div className="flex gap-2">
                        <div className="flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.14)', border: '1px solid rgba(201,169,110,0.28)' }}>
                          <BrainCircuit className="w-3.5 h-3.5" style={{ color: 'var(--champagne)' }} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm" style={{ color: 'rgba(237,232,223,0.85)', lineHeight: 1.8 }}>
                            {hasKeyword(commandValue)
                              ? <>{matchDisplayed}<span style={{ opacity: 0.5 }}>{!matchDone ? '▌' : ''}</span></>
                              : '需求已接收。建議您在搜索中加入更多關鍵字（如專業領域或證書），以提升匹配精準度。'
                            }
                          </p>

                          {/* Decode button */}
                          {hasKeyword(commandValue) && matchDone && agentPhase === 'matched' && (
                            <div className="mt-4 space-y-2">
                              <button
                                onClick={handleDecode}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
                                style={{
                                  background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)',
                                  color: '#0A1628',
                                  boxShadow: '0 4px 16px rgba(201,169,110,0.25)'
                                }}
                                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                              >
                                <Coins className="w-4 h-4" />
                                解碼專家深度資歷（消耗 {DECODE_COST} $FAC）
                              </button>
                              {decodeError && (
                                <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)' }}>
                                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(239,68,68,0.9)' }} />
                                  <p className="text-xs" style={{ color: 'rgba(239,68,68,0.9)', lineHeight: 1.6 }}>
                                    {decodeError}{' '}
                                    <a href="/register" className="underline font-medium" style={{ color: 'rgba(201,169,110,0.9)' }}>前往 LinkedIn 同步</a>
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* ─ Decoded: expert profiles ─ */}
                  {(agentPhase === 'decoded' || agentPhase === 'action') && (
                    <>
                      <div className="border-t pt-4" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <ShieldCheck className="w-4 h-4" style={{ color: '#4CAF7D' }} />
                          <span className="text-xs font-semibold" style={{ color: '#4CAF7D' }}>已解碼 · 消耗 10 $FAC · 脫敏資歷如下</span>
                        </div>
                        <ul className="space-y-3">
                          {MOCK_EXPERTS.map((ex) => (
                            <li key={ex.id} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.14)' }}>
                              <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(201,169,110,0.18)', color: 'var(--champagne)' }}>
                                {ex.anon.replace('專家 ', '')}
                              </div>
                              <div>
                                <div className="text-xs font-semibold mb-0.5" style={{ color: 'var(--off-white)' }}>{ex.anon}</div>
                                <div className="text-xs" style={{ color: 'rgba(237,232,223,0.65)', lineHeight: 1.6 }}>{ex.credential}</div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Action buttons */}
                      {agentPhase === 'decoded' && (
                        <div className="flex flex-col sm:flex-row gap-3 pt-2">
                          <button
                            onClick={() => { setJobOfferSent(true); setAgentPhase('action'); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                          >
                            <Send className="w-3.5 h-3.5" />
                            發佈正式 Job Offer
                          </button>
                          <button
                            onClick={() => setAgentPhase('action')}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                            style={{ border: '1px solid rgba(201,169,110,0.45)', color: 'var(--champagne)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,110,0.08)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            預約私密對話（100 $FAC）
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ─ Action sent ─ */}
                  {agentPhase === 'action' && (
                    <div className="border-t pt-4 flex items-start gap-3" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
                      <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4CAF7D' }} />
                      <p className="text-xs" style={{ color: 'rgba(237,232,223,0.7)', lineHeight: 1.7 }}>
                        {jobOfferSent
                          ? 'Job Offer 已透過加密通道傳送至匹配專家，系統將在 24 小時內回覆。所有通訊受銀行級私人保險箱保護。'
                          : '私密對話預約已提交，Agent 將優先處理您的需求。請確保 $FAC 餘額充足以開啟加密通道。'
                        }
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* $FAC 餘額 */}
          <a
            href="/wallet"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background: 'linear-gradient(135deg,rgba(13,31,60,0.95) 0%,rgba(10,22,40,0.98) 100%)',
              border: '1px solid rgba(201,169,110,0.25)', color: 'var(--champagne)'
            }}
            title="查看流水賬"
          >
            <Coins className="w-4 h-4" />
            <span className="font-semibold tabular-nums">{facBalance}</span>
            <span className="text-xs opacity-80">$FAC</span>
          </a>
        </div>

        <p className="text-xs text-center mt-4" style={{ color: 'rgba(201,169,110,0.45)' }}>
          已有 500+ 位資深工程師、SFC RO 透過 LinkedIn 加入。
        </p>

        {/* CTA Buttons */}
        <div ref={ctaRef} className="opacity-0 flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <button onClick={() => scrollToSection('#contact')} className="btn-outline" style={{ whiteSpace: 'nowrap' }}>成為智慧導師</button>
          <button onClick={() => scrollToSection('#about')} className="btn-gold" style={{ whiteSpace: 'nowrap' }}>了解 FAC 平台</button>
        </div>

        <p className="mt-10 text-xs tracking-widest uppercase" style={{ color: 'rgba(201,169,110,0.3)' }}>
          Facilitating Artisan Collective &nbsp;·&nbsp; Web3 · Decentralized · Est. Hong Kong
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => scrollToSection('#about')}
          className="flex flex-col items-center gap-2 transition-colors duration-300"
          style={{ color: 'rgba(201,169,110,0.5)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--champagne)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(201,169,110,0.5)')}
        >
          <span className="text-xs tracking-wider">向下滾動</span>
          <ChevronDown className="w-5 h-5 animate-bounce-gentle" />
        </button>
      </div>
    </section>
  );
}
