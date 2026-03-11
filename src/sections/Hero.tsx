import { useEffect, useRef, useState, useCallback } from 'react';
import {
  ChevronDown, Mic, Coins, X,
  BrainCircuit, ShieldCheck, Send, Calendar
} from 'lucide-react';
import gsap from 'gsap';
import { useWallet } from '../context/WalletContext';
import { useTranslation } from 'react-i18next';
import { useIdentity } from '../contexts/IdentityContext';
import OmniBox from '../components/OmniBox';
import VoiceUniversalBox from '../components/VoiceUniversalBox';

// ─── Constants ────────────────────────────────────────────────────────────────
const DECODE_COST = 10;
const STORAGE_NEW_USER = 'fac_voice_identity_seen';
const STORAGE_LOGGED_IN = 'fac_user_logged_in';
const STORAGE_TIER = 'fac_user_tier';

function isExecutiveUser(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(STORAGE_TIER) === 'executive';
}

function isUserLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_LOGGED_IN) || (() => {
    try {
      const txs = localStorage.getItem('fac_wallet_transactions');
      const balance = localStorage.getItem('fac_wallet_balance');
      if (txs && JSON.parse(txs).length > 0) return true;
      if (balance && parseInt(balance, 10) > 0) return true;
    } catch (_) {}
    return false;
  })();
}

/** 需求方：雇主模式 */
const DEMAND_KEYWORDS = ['我想搵人', '需要顧問', '項目外判', '搵人', '找專家', '聘請', '外判', '想找', '尋找'];
/** 供應方：專家模式 */
const SUPPLY_KEYWORDS = ['我是專家', '想接 Job', '過兩招', '接 job', '接job', '接案', '可以提供', '想接', '我是顧問'];
/** 匹配專家用 */
const KEYWORDS = ['SFC', 'RO', '工程', '貿易', '老師', '專家', '信託', '融資', '製造', '合規', '律師', '銀行', '教育'];

/** ─── 智慧過濾協議 (System Prompt Guardrails) ───────────────────────────────── */
const STORAGE_AI_FILTERED = 'fac_ai_filtered';
const FILTER_REJECT_MESSAGE = '閣下好，身為 FAC 港匠匯，我致力於提供專業智慧對接與合規諮詢。閣下的查詢似乎超出了本平台的專業服務範疇，請專注於專業與智慧的分享。';
/** 核心業務相關（至少需沾邊其一，否則視為閒聊） */
const ALLOWED_SCOPE_KEYWORDS = ['專業', '對接', '專家', '諮詢', '合規', '章程', 'Web3', '錢包', '退休', '顧問', '匹配', 'SFC', 'RO', '雇主', '智慧', '傳承', '保險箱', '解碼', 'FAC', '合夥', '邀請', '註冊', 'LinkedIn', '導師', '領域', '支柱', '平台', '服務', '項目', '搵人', '找', '聘', '接案', '融資', '信託', '貿易', '工程', '律師', '銀行', '教育', '製造'];
/** 超出範疇：政治、非法、廣告騷擾、無關閒聊 */
const DISALLOWED_KEYWORDS = ['政治', '選舉', '投票', '政黨', '非法', '毒品', '槍械', '廣告', '推銷', '騷擾', '今天天氣', '你好嗎', '在嗎', '無關', '閒聊', '隨便', '測試'];

function isQueryInScope(text: string): boolean {
  const t = text.trim().toLowerCase();
  if (!t) return true;
  const hasDisallowed = DISALLOWED_KEYWORDS.some((k) => t.includes(k.toLowerCase()));
  if (hasDisallowed) return false;
  const hasAllowed = ALLOWED_SCOPE_KEYWORDS.some((k) => t.includes(k.toLowerCase()));
  if (t.length >= 4 && !hasAllowed) return false;
  return true;
}

function recordFiltered(query: string): void {
  try {
    const raw = localStorage.getItem(STORAGE_AI_FILTERED);
    const list: Array<{ text: string; at: string }> = raw ? JSON.parse(raw) : [];
    list.unshift({ text: query.trim().slice(0, 200), at: new Date().toISOString() });
    if (list.length > 500) list.length = 500;
    localStorage.setItem(STORAGE_AI_FILTERED, JSON.stringify(list));
  } catch (_) {}
}

const MOCK_EXPERTS = [
  { id: 'A', anon: '專家 A', credential: '前美資銀行 MD，擁有 SFC 1、4、9 號牌 RO 實務經驗，主導過逾 30 宗跨境融資案。' },
  { id: 'B', anon: '專家 B', credential: '前港府工務局高級工程師，基建監理資歷 28 年，主責大型公共工程項目驗收。' },
  { id: 'C', anon: '專家 C', credential: '大灣區跨境貿易合規顧問，深耕出口管制與關稅架構優化，曾任職世界 500 強物流企業。' },
];

const THINKING_STEPS = [
  '正在為您辨識身份與意圖（雇主／專家）…',
  '正在掃描「個人智慧錢包」網絡…',
  '正在比對八大智慧支柱資料庫…',
  '加密通道已建立，準備解鎖匹配結果。',
];


// ─── Types ────────────────────────────────────────────────────────────────────
type AgentPhase = 'idle' | 'new_user_greeting' | 'login_prompt' | 'partner_welcome' | 'thinking' | 'draft_confirm' | 'matched' | 'decoded' | 'action' | 'filtered';
type UserMode = 'employer' | 'expert' | null;

// ─── Success beep (語音確認成功回饋) ───────────────────────────────────────────
function playSuccessBeep() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.12);
  } catch (_) {}
}

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
  const waveformCanvasRef = useRef<HTMLCanvasElement>(null);

  const { facBalance, addTransaction } = useWallet();
  const { t } = useTranslation();
  const { identityContext, getIdentityLabel: _getIdentityLabel } = useIdentity();

  const [commandValue, setCommandValue]     = useState('');
  const [isFocused, _setIsFocused]          = useState(false);
  const [isMicPulsing, setIsMicPulsing]     = useState(false);
  const [isVoiceBoxOpen, setIsVoiceBoxOpen] = useState(false);
  const [agentPhase, setAgentPhase]         = useState<AgentPhase>('idle');
  const [thinkingStep, setThinkingStep]     = useState(0);
  const [userMode, setUserMode]             = useState<UserMode>(null);
  const [draftSummary, setDraftSummary]     = useState('');
  const [decodeError, setDecodeError]       = useState('');
  const [jobOfferSent, setJobOfferSent]     = useState(false);
  const [isPartnerUser]                     = useState(() => isExecutiveUser());

  const matchText = '已為您從「個人智慧錢包」網絡中匹配到 3–5 位符合條件的隱世專家，請解碼深度資歷以查看脫敏介紹。';
  const { displayed: matchDisplayed, done: matchDone } = useTypewriter(matchText, 22, agentPhase === 'matched');

  // ─── GSAP entrance ──────────────────────────────────────────────────────────
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
      /* tagRef & subtitleRef are visually hidden; skip their animation */
      titleRef.current?.querySelectorAll('.title-line').forEach((line, i) => {
        tl.fromTo(line, { rotateX: -90, y: 60, opacity: 0 }, { rotateX: 0, y: 0, opacity: 1, duration: 0.9 }, 0.45 + i * 0.18);
      });
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

  // ─── Canvas 高級波形動畫（麥克風開啟時）────────────────────────────────────
  useEffect(() => {
    if (!isMicPulsing || !waveformCanvasRef.current) return;
    const canvas = waveformCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const updateSize = () => {
      const w = canvas.parentElement?.clientWidth ?? 400;
      const h = 140;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    const barCount = 32;
    let phase = 0;
    let raf = 0;
    const draw = () => {
      const w = canvas.width / dpr;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      const barW = Math.max(2, (w - (barCount - 1) * 4) / barCount);
      const gap = 4;
      const centerY = h / 2;
      for (let i = 0; i < barCount; i++) {
        const t = (i / barCount) * Math.PI * 2 + phase;
        const height = (Math.sin(t) * 0.5 + 0.5) * 28 + 8;
        const x = i * (barW + gap) + gap * 0.5;
        const grd = ctx.createLinearGradient(0, centerY + height, 0, centerY - height);
        grd.addColorStop(0, 'rgba(201,169,110,0.25)');
        grd.addColorStop(0.5, 'rgba(201,169,110,0.7)');
        grd.addColorStop(1, 'rgba(201,169,110,0.4)');
        ctx.fillStyle = grd;
        ctx.fillRect(x, centerY - height / 2, barW, height);
      }
      phase += 0.12;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(raf);
    };
  }, [isMicPulsing]);

  // ─── Partner welcome → thinking (2.5 秒後自動進入分析流程) ────────────────
  useEffect(() => {
    if (agentPhase !== 'partner_welcome') return;
    const id = setTimeout(() => setAgentPhase('thinking'), 2500);
    return () => clearTimeout(id);
  }, [agentPhase]);

  // ─── Thinking stepper → draft_confirm ─────────────────────────────────────
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
        setDraftSummary(`【結構化摘要】意圖：${userMode === 'employer' ? '需求方（雇主）' : userMode === 'expert' ? '供應方（專家）' : '一般查詢'}。內容：${commandValue.trim().slice(0, 80)}${commandValue.trim().length > 80 ? '…' : ''}`);
        setAgentPhase('draft_confirm');
      }
    }, 900);
    return () => clearInterval(id);
  }, [agentPhase, commandValue, userMode]);

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const hasKeyword = useCallback((q: string) =>
    KEYWORDS.some((k) => q.includes(k)), []);

  const classifyIntent = useCallback((q: string): UserMode => {
    const t = q.trim();
    if (DEMAND_KEYWORDS.some((k) => t.includes(k))) return 'employer';
    if (SUPPLY_KEYWORDS.some((k) => t.includes(k))) return 'expert';
    return null;
  }, []);

  const _handleSubmit = useCallback(() => {
    const loggedIn = isUserLoggedIn();
    const isFirstVisit = !localStorage.getItem(STORAGE_NEW_USER);

    if (!loggedIn) {
      setDecodeError('');
      setJobOfferSent(false);
      setDraftSummary(commandValue.trim() ? `【您的輸入】${commandValue.trim().slice(0, 120)}${commandValue.trim().length > 120 ? '…' : ''}` : '');
      setAgentPhase('login_prompt');
      return;
    }
    if (isFirstVisit) {
      localStorage.setItem(STORAGE_NEW_USER, '1');
      setDecodeError('');
      setJobOfferSent(false);
      setAgentPhase('new_user_greeting');
      return;
    }
    if (!commandValue.trim()) return;
    if (!isQueryInScope(commandValue)) {
      recordFiltered(commandValue);
      setDecodeError('');
      setJobOfferSent(false);
      setAgentPhase('filtered');
      return;
    }
    setDecodeError('');
    setJobOfferSent(false);
    setUserMode(classifyIntent(commandValue));
    // 合夥人（Executive）優先顯示專屬問候，再進入分析流程
    if (isExecutiveUser()) {
      setAgentPhase('partner_welcome');
    } else {
      setAgentPhase('thinking');
    }
  }, [commandValue, classifyIntent]);

  const handleDecode = useCallback(() => {
    setDecodeError('');
    if (facBalance < DECODE_COST) {
      setDecodeError('錢包餘額不足，請前往 LinkedIn 同步以獲取更多獎勵。');
      return;
    }
    addTransaction({ date: new Date().toISOString().slice(0, 10), label: '智慧資訊解碼支出', amount: -DECODE_COST });
    setAgentPhase('decoded');
  }, [facBalance, addTransaction]);

  const handleDraftConfirm = useCallback(() => {
    playSuccessBeep();
    setAgentPhase('matched');
  }, []);

  const _handleMic = useCallback(() => {
    setIsMicPulsing(true);
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const Win = window as unknown as { webkitSpeechRecognition: new () => { start: () => void; stop: () => void; lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: { 0?: { 0?: { transcript?: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null } };
      const recognition = new Win.webkitSpeechRecognition();
      recognition.lang = 'zh-HK';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (e: { results: { 0?: { 0?: { transcript?: string } } } }) => {
        const r = e.results[0]?.[0];
        const t = (r?.transcript ?? '').trim();
        if (t) setCommandValue((prev) => (prev ? `${prev} ${t}` : t));
        playSuccessBeep();
        setIsMicPulsing(false);
      };
      recognition.onend = () => setIsMicPulsing(false);
      recognition.onerror = () => setIsMicPulsing(false);
      recognition.start();
    } else {
      setTimeout(() => setIsMicPulsing(false), 3000);
    }
  }, []);

  const scrollToSection = (href: string) => {
    document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
  };

  const resetAgent = () => {
    setAgentPhase('idle');
    setCommandValue('');
    setDecodeError('');
    setJobOfferSent(false);
    setUserMode(null);
    setDraftSummary('');
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

        {/* Invisible refs — needed for GSAP entrance but content removed */}
        <span ref={tagRef} className="opacity-0 block h-0 overflow-hidden" />

        <div ref={titleRef} className="space-y-1 mb-6" style={{ perspective: '1000px' }}>
          <h1 className="title-line font-bold leading-tight opacity-0" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)', color: 'var(--off-white)',
            fontFamily: "'PingFang HK','Noto Sans TC',sans-serif", letterSpacing: '0.04em'
          }}>智慧沈澱，</h1>
          <h1 className="title-line font-bold leading-tight opacity-0 text-gold-gradient" style={{
            fontSize: 'clamp(2.2rem, 4.5vw, 3.6rem)',
            fontFamily: "'PingFang HK','Noto Sans TC',sans-serif", letterSpacing: '0.04em'
          }}>在此相遇。</h1>
        </div>

        {/* Subtitle hidden — guidance text moved below command box */}
        <p ref={subtitleRef} className="opacity-0 hidden" aria-hidden="true" />

        {/* ════════════════════════════════════════════════════════════════
            萬能框 OmniBox (S-001)  +  身份指示  +  $FAC 餘額
        ═══════════════════════════════════════════════════════════════════ */}
        <div ref={commandRef} className="opacity-0 mb-8 flex flex-col sm:flex-row items-start justify-center gap-4 sm:gap-5">
          {/* 身份狀態指示器 S-001 */}
          {identityContext !== 'neutral' && (
            <div className="w-full flex justify-center mb-2 order-first">
              <span className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ color: '#C9A96E', border: '1px solid rgba(201,169,110,0.5)', background: 'rgba(201,169,110,0.08)' }}>
                {identityContext === 'A' ? '委託方模式 | Client Mode' : '服務方模式 | Provider Mode'}
              </span>
            </div>
          )}
          <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-4" style={{ maxWidth: '740px' }}>
            <OmniBox />
            <button
              onClick={() => setIsVoiceBoxOpen(true)}
              className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #C9A96E 0%, #D4AF37 100%)',
                boxShadow: '0 4px 16px rgba(201,169,110,0.3)',
              }}
              title="语音输入"
            >
              <Mic className="w-5 h-5 text-[#0A1628]" />
            </button>
          </div>
          {/* Placeholder for removed Agent Bubble - keep ref to avoid GSAP issues */}
          {false && (
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
                    <span className="text-xs font-semibold" style={{ color: 'var(--champagne)' }}>
                      FAC 港匠匯 · {isPartnerUser ? '合夥人管家' : '紳士管家'}
                    </span>
                    {userMode && agentPhase !== 'new_user_greeting' && (
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{
                        background: userMode === 'employer' ? 'rgba(76,175,80,0.15)' : 'rgba(33,150,243,0.15)',
                        color: userMode === 'employer' ? '#81C784' : '#64B5F6',
                        border: `1px solid ${userMode === 'employer' ? 'rgba(76,175,80,0.35)' : 'rgba(33,150,243,0.35)'}`
                      }}>
                        {userMode === 'employer' ? '雇主模式' : '專家模式'}
                      </span>
                    )}
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
                  {/* ─ 合夥人專屬問候 (V2.1) ─ */}
                  {agentPhase === 'partner_welcome' && (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(201,169,110,0.18)', border: '1px solid rgba(201,169,110,0.45)', color: '#C9A96E' }}>
                          ◆ 合夥人專屬
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,232,223,0.92)', lineHeight: 1.85 }}>
                        尊敬的<strong style={{ color: 'var(--champagne)' }}>合夥人</strong>，目前您的圈子內有 <strong style={{ color: '#4CAF7D' }}>3 個新動態</strong>，需要您參與決策或查看分紅嗎？
                      </p>
                      <div className="grid grid-cols-3 gap-2 mt-2">
                        {[
                          { label: '新撮合分紅', val: '+200 $FAC', color: '#4CAF7D' },
                          { label: '待投票提案', val: '1 個', color: '#C9A96E' },
                          { label: '信任網絡', val: '2 人', color: 'rgba(237,232,223,0.7)' },
                        ].map(({ label, val, color }) => (
                          <div key={label} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.15)' }}>
                            <p className="text-xs mb-1" style={{ color: 'rgba(201,169,110,0.55)' }}>{label}</p>
                            <p className="text-sm font-bold tabular-nums" style={{ color }}>{val}</p>
                          </div>
                        ))}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <a href="/profile" className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}>
                          查看合夥人中心
                        </a>
                        <button type="button" onClick={() => setAgentPhase('thinking')} className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(201,169,110,0.4)', color: 'var(--champagne)' }}>
                          繼續智慧匹配
                        </button>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.35)' }}>正在準備分析流程，稍後自動進入匹配…</p>
                    </>
                  )}

                  {/* ─ 未登入引導：語音/文字提示 + Summary Card + 語音確認 ─ */}
                  {agentPhase === 'login_prompt' && (
                    <>
                      <p className="text-sm" style={{ color: 'rgba(237,232,223,0.9)', lineHeight: 1.85 }}>
                        偵測到您尚未登入。請問您的用戶名是？或者需要我為您開設新賬號嗎？本平台為智慧傳承對接，登入後即可辨識您為雇主或專家並提供專屬服務。
                      </p>
                      {draftSummary && (
                        <div className="mt-4 p-4 rounded-xl border" style={{ background: 'rgba(201,169,110,0.06)', borderColor: 'rgba(201,169,110,0.25)' }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: 'rgba(201,169,110,0.9)' }}>結構化摘要</p>
                          <p className="text-sm mb-4" style={{ color: 'rgba(237,232,223,0.85)', lineHeight: 1.7 }}>{draftSummary}</p>
                          <button
                            onClick={() => { playSuccessBeep(); setAgentPhase('idle'); }}
                            className="voice-confirm-btn flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium"
                            style={{ border: '1px solid rgba(201,169,110,0.5)', color: 'var(--champagne)' }}
                          >
                            <Mic className="w-4 h-4" />
                            語音確認
                          </button>
                        </div>
                      )}
                      <div className="flex flex-wrap gap-3 mt-4">
                        <a href="/register" className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}>
                          開設新賬號（LinkedIn 即領 80 $FAC）
                        </a>
                        <button type="button" onClick={resetAgent} className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-medium" style={{ border: '1px solid rgba(201,169,110,0.4)', color: 'var(--champagne)' }}>
                          稍後再說
                        </button>
                      </div>
                    </>
                  )}

                  {/* ─ 新用戶引導 (V1.9) ─ */}
                  {agentPhase === 'new_user_greeting' && (
                    <>
                      <p className="text-sm" style={{ color: 'rgba(237,232,223,0.85)', lineHeight: 1.8 }}>
                        歡迎光臨 FAC 港匠匯。我是您的專屬管家，請告訴我您的稱呼，或直接授權 LinkedIn 註冊，以便為您提供銀行級私人管家式服務。
                      </p>
                      <a
                        href="/register"
                        className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-sm font-semibold transition-all voice-confirm-btn"
                        style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}
                      >
                        使用 LinkedIn 註冊即領 80 $FAC
                      </a>
                    </>
                  )}

                  {/* ─ AI 已過濾：超出專業範疇之優雅拒絕 ─ */}
                  {agentPhase === 'filtered' && (
                    <>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(237,232,223,0.9)', lineHeight: 1.85 }}>
                        {FILTER_REJECT_MESSAGE}
                      </p>
                      <button
                        type="button"
                        onClick={resetAgent}
                        className="mt-4 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={{ border: '1px solid rgba(201,169,110,0.45)', color: 'var(--champagne)' }}
                      >
                        重新輸入
                      </button>
                    </>
                  )}

                  {/* ─ Thinking phase ─ */}
                  {agentPhase === 'thinking' && (
                    <p className="text-sm" style={{ color: 'rgba(237,232,223,0.75)', lineHeight: 1.7 }}>
                      {THINKING_STEPS[thinkingStep]}
                    </p>
                  )}

                  {/* ─ 語音確認：Draft 摘要 + 係/正確/沒問題 + 自動導出確認 (V2.0) ─ */}
                  {agentPhase === 'draft_confirm' && (
                    <>
                      <p className="text-xs font-semibold mb-1" style={{ color: 'rgba(201,169,110,0.9)' }}>結構化摘要</p>
                      <p className="text-sm mb-4 p-3 rounded-xl" style={{ background: 'rgba(201,169,110,0.06)', color: 'rgba(237,232,223,0.85)', lineHeight: 1.7, border: '1px solid rgba(201,169,110,0.15)' }}>
                        {draftSummary}
                      </p>
                      <p className="text-xs mb-3" style={{ color: 'rgba(201,169,110,0.6)' }}>
                        語音或點擊確認後，將自動導出此摘要至您的個人智慧錢包（保險箱），並進入匹配流程。
                      </p>
                      <p className="text-sm mb-3" style={{ color: 'rgba(237,232,223,0.8)' }}>以上資訊是否正確？</p>
                      <p className="text-xs mb-2" style={{ color: 'rgba(201,169,110,0.55)' }}>支援語音感應確認</p>
                      <div className="flex flex-wrap gap-2">
                        {['係', '正確', '沒問題'].map((label) => (
                          <button
                            key={label}
                            onClick={handleDraftConfirm}
                            className="voice-confirm-btn px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5"
                            style={{ border: '1px solid rgba(201,169,110,0.45)', color: 'var(--champagne)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,110,0.12)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            <Mic className="w-3.5 h-3.5 opacity-70" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </>
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
                              : '已收到您的需求。建議加入更多關鍵字（如專業領域或證書），以便為您精準匹配智慧傳承網絡。'
                            }
                          </p>

                          {/* Decode button */}
                          {hasKeyword(commandValue) && matchDone && agentPhase === 'matched' && (
                            <div className="mt-4 space-y-2">
                              <button
                                onClick={handleDecode}
                                className="voice-confirm-btn w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-300"
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
                                <span className="text-[10px] opacity-75 ml-1">· 語音感應</span>
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
                            className="voice-confirm-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
                            style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}
                          >
                            <Send className="w-3.5 h-3.5" />
                            發佈正式 Job Offer
                            <Mic className="w-3 h-3 opacity-60" />
                          </button>
                          <button
                            onClick={() => setAgentPhase('action')}
                            className="voice-confirm-btn flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                            style={{ border: '1px solid rgba(201,169,110,0.45)', color: 'var(--champagne)' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,110,0.08)'; }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                          >
                            <Calendar className="w-3.5 h-3.5" />
                            預約私密對話（100 $FAC）
                            <Mic className="w-3 h-3 opacity-60" />
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* ─ Action sent ─ */}
                  {agentPhase === 'action' && (
                    <div className="border-t pt-4 space-y-4" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4CAF7D' }} />
                        <p className="text-xs" style={{ color: 'rgba(237,232,223,0.7)', lineHeight: 1.7 }}>
                          {jobOfferSent
                            ? 'Job Offer 已透過加密通道傳送至匹配專家，系統將在 24 小時內回覆。所有通訊受銀行級私人保險箱保護。'
                            : '私密對話預約已提交，Agent 將優先處理您的需求。請確保 $FAC 餘額充足以開啟加密通道。'
                          }
                        </p>
                      </div>
                      {/* 升級邀請 - 非 Executive 用戶 */}
                      {!isPartnerUser && (
                        <div className="p-4 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.1) 0%, rgba(201,169,110,0.04) 100%)', border: '1px solid rgba(201,169,110,0.3)' }}>
                          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--champagne)' }}>◆ 升級為合夥人，解鎖更多權益</p>
                          <p className="text-xs mb-3" style={{ color: 'rgba(237,232,223,0.65)', lineHeight: 1.65 }}>
                            作為 Executive 合夥人，您可享有智慧撮合分紅（5–10%）、去中心化治理投票權，以及專屬「邀請函保險箱」。
                          </p>
                          <a href="/profile" className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}>
                            前往個人中心升級
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ─ 專家身份引導（matched/decoded/action 相位，supply 模式）─ */}
                  {(agentPhase === 'matched' || agentPhase === 'decoded' || agentPhase === 'action') && userMode === 'expert' && (
                    <div className="mt-2 p-4 rounded-xl border" style={{ background: 'rgba(33,150,243,0.06)', borderColor: 'rgba(33,150,243,0.25)' }}>
                      <p className="text-xs font-semibold mb-1.5" style={{ color: '#64B5F6' }}>偵測到您的專家身份 · 建議路徑</p>
                      <p className="text-xs mb-3" style={{ color: 'rgba(237,232,223,0.75)', lineHeight: 1.7 }}>
                        建議您同步 LinkedIn 並開通「去中心化保險箱」，將您的傳奇資歷安全鎖入鏈上私密空間，讓平台為您精準配對 Job Offer。
                      </p>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {[
                          { label: '① 同步 LinkedIn', done: true },
                          { label: '② 開通保險箱', done: false },
                          { label: '③ 升級為合夥人', done: false },
                        ].map(({ label, done }) => (
                          <span key={label} className="text-xs px-2.5 py-1 rounded-md" style={{
                            background: done ? 'rgba(76,175,80,0.12)' : 'rgba(255,255,255,0.05)',
                            border: `1px solid ${done ? 'rgba(76,175,80,0.35)' : 'rgba(201,169,110,0.2)'}`,
                            color: done ? '#81C784' : 'rgba(237,232,223,0.65)'
                          }}>
                            {label}
                          </span>
                        ))}
                      </div>
                      <a href="/register" className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg text-xs font-semibold" style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}>
                        立即同步 LinkedIn · 領 80 $FAC
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}
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

        {/* ── 萬能框下方引導語（全語系）──────────────────────────────────── */}
        <div
          className="mt-5 px-4 text-center transition-all duration-500"
          style={{ opacity: isFocused ? 0.35 : 1, transform: isFocused ? 'translateY(4px)' : 'translateY(0)' }}
        >
          <p
            style={{
              fontFamily: "'PingFang HK','Noto Sans TC','Microsoft JhengHei',sans-serif",
              fontSize: 'clamp(0.82rem, 2vw, 0.95rem)',
              color: 'rgba(201,169,110,0.72)',
              lineHeight: 1.85,
              letterSpacing: '0.03em',
            }}
          >
            {t('hero.commandGuidance')}
          </p>
          <p className="mt-2 text-xs" style={{ color: 'rgba(201,169,110,0.28)', letterSpacing: '0.06em' }}>
            {t('hero.commandSubline')}
          </p>
        </div>

        {/* ctaRef kept as invisible anchor for GSAP; no visible buttons */}
        <div ref={ctaRef} className="opacity-0 h-0 overflow-hidden" aria-hidden="true" />
      </div>

      {/* Voice Universal Box Modal */}
      <VoiceUniversalBox
        isOpen={isVoiceBoxOpen}
        onClose={() => setIsVoiceBoxOpen(false)}
        onSubmit={(text, isVoice) => {
          setCommandValue(text);
          if (isVoice) {
            playSuccessBeep();
          }
        }}
      />

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
