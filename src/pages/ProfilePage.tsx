import { useState, useCallback, useEffect, useRef } from 'react';
import {
  ArrowLeft, Shield, Download, Lock, Cloud, CheckCircle, X,
  Copy, Users, TrendingUp, Vote, ChevronRight, Coins, Gift,
  Star
} from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import type { PricingTiers } from '../sections/AdminPanel';

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const STORAGE_VAULT    = 'fac_vault_status';
const STORAGE_TIER     = 'fac_user_tier';
const STORAGE_PRICING  = 'fac_pricing_tiers';
const STORAGE_PARTNER  = 'fac_partner_data';

// ─── Types ────────────────────────────────────────────────────────────────────
type VaultStatus = 'none' | 'cloud' | 'cold';
type UserTier    = 'basic' | 'professional' | 'executive';

interface DividendRecord {
  id: string;
  date: string;
  source: string;
  amountHKD: number;
  amountFAC: number;
  payoutType: 'FAC' | 'stablecoin';
}

interface GovernanceProposal {
  id: string;
  title: string;
  description: string;
  options: string[];
  endDate: string;
  votesA: number;
  votesB: number;
}

interface PartnerData {
  referralCode: string;
  referredUsers: string[];
  dividendBalanceHKD: number;
  dividendHistory: DividendRecord[];
  votes: Record<string, string>; // proposalId → choice
}

// ─── Mock governance proposals ────────────────────────────────────────────────
const MOCK_PROPOSALS: GovernanceProposal[] = [
  {
    id: 'p1',
    title: '開啟第九智慧支柱：新能源與 ESG',
    description: '投票決定是否將「新能源與 ESG 合規」列為第九大智慧支柱，優先招募相關領域專家。',
    options: ['支持開啟', '暫緩，先鞏固現有八大'],
    endDate: '2025-06-30',
    votesA: 78,
    votesB: 24,
  },
  {
    id: 'p2',
    title: '調整全平台最低基礎解碼費',
    description: '當前最低基礎解碼費為 10 $FAC。為防止市場惡性低價競爭，討論是否調整至 15 $FAC。',
    options: ['維持 10 $FAC', '調整至 15 $FAC'],
    endDate: '2025-07-15',
    votesA: 55,
    votesB: 61,
  },
  {
    id: 'p3',
    title: '是否新增「生命科學與醫療合規」支柱？',
    description: '提案新增第十智慧支柱，涵蓋藥事法規、醫療器械合規、生物科技 IPO 咨詢等領域，優先對接持牌醫療合規顧問。',
    options: ['支持新增', '暫緩，待市場調研'],
    endDate: '2025-09-01',
    votesA: 45,
    votesB: 22,
  },
];

// ─── Mock dividend history ────────────────────────────────────────────────────
const MOCK_DIVIDENDS: DividendRecord[] = [
  { id: 'd0', date: '2025-06-01', source: '來自受邀專家 A 的智慧撮合分紅', amountHKD: 300, amountFAC: 200, payoutType: 'FAC' },
  { id: 'd1', date: '2025-05-20', source: '成功撮合 · SFC RO 合規顧問', amountHKD: 480, amountFAC: 320, payoutType: 'FAC' },
  { id: 'd2', date: '2025-05-14', source: '邀請入駐 · 跨境貿易專家（user_ref_7a2e）', amountHKD: 120, amountFAC: 80, payoutType: 'FAC' },
  { id: 'd3', date: '2025-04-30', source: '成功撮合 · 家族信託架構設計', amountHKD: 750, amountFAC: 500, payoutType: 'stablecoin' },
];
const TOTAL_EARNINGS_FAC = MOCK_DIVIDENDS.reduce((s, d) => s + (d.amountFAC ?? 0), 0);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadPricing(): PricingTiers | null {
  try {
    const raw = localStorage.getItem(STORAGE_PRICING);
    if (raw) return JSON.parse(raw) as PricingTiers;
  } catch (_) {}
  return null;
}

function getVaultStatus(): VaultStatus {
  const v = localStorage.getItem(STORAGE_VAULT);
  if (v === 'cloud' || v === 'cold') return v;
  return 'none';
}

function getUserTier(): UserTier {
  const t = localStorage.getItem(STORAGE_TIER);
  if (t === 'professional' || t === 'executive') return t;
  return 'basic';
}

function generateReferralCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'FAC-';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function loadPartnerData(): PartnerData {
  try {
    const raw = localStorage.getItem(STORAGE_PARTNER);
    if (raw) return JSON.parse(raw) as PartnerData;
  } catch (_) {}
  const code = generateReferralCode();
  const data: PartnerData = {
    referralCode: code,
    referredUsers: ['user_ref_7a2e', 'user_ref_3b9c'],
    dividendBalanceHKD: 1350,
    dividendHistory: MOCK_DIVIDENDS,
    votes: {},
  };
  localStorage.setItem(STORAGE_PARTNER, JSON.stringify(data));
  return data;
}

function savePartnerData(data: PartnerData) {
  localStorage.setItem(STORAGE_PARTNER, JSON.stringify(data));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl overflow-hidden border mb-6 ${className}`}
      style={{
        background: 'linear-gradient(145deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
        borderColor: 'rgba(201,169,110,0.3)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, subtitle, badge }: {
  icon: React.ElementType; title: string; subtitle: string; badge?: React.ReactNode;
}) {
  return (
    <div className="px-6 py-5 border-b flex items-center justify-between" style={{ borderColor: 'rgba(201,169,110,0.18)' }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
          <Icon className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
        </div>
        <div>
          <h2 className="text-base font-semibold" style={{ color: 'var(--off-white)' }}>{title}</h2>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.6)' }}>{subtitle}</p>
        </div>
      </div>
      {badge && badge}
    </div>
  );
}

// ─── CAS Laboratory Declaration ───────────────────────────────────────────────
function CasDeclarationBlock() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      className="rounded-2xl overflow-hidden border mb-6"
      style={{
        background: 'linear-gradient(145deg, rgba(7,14,31,0.98) 0%, rgba(10,22,40,0.99) 100%)',
        borderColor: 'rgba(201,169,110,0.28)',
      }}
    >
      {/* Header */}
      <button
        className="w-full flex items-start gap-4 px-5 py-4 text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
          style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.25)' }}>
          <span className="text-base">🏛️</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(201,169,110,0.7)', letterSpacing: '0.05em' }}>
            關於運營方 · CAS Laboratory
          </p>
          <p className="text-sm font-bold" style={{ color: 'var(--off-white)' }}>
            國科綠色發展國際實驗室（香港）有限公司
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span className="text-[10px] px-2 py-0.5 rounded-md"
              style={{ background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', color: '#81C784' }}>
              香港非盈利擔保有限公司
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(237,232,223,0.4)' }}>編號 2828258</span>
          </div>
        </div>
        <span className="text-xs mt-1 flex-shrink-0 transition-transform duration-300"
          style={{ color: 'rgba(201,169,110,0.55)', transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
      </button>

      {/* Expandable pledge */}
      {expanded && (
        <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(201,169,110,0.12)' }}>
          <p className="text-xs font-semibold pt-4" style={{ color: 'var(--champagne)' }}>
            《非盈利運營承諾書》
          </p>
          {[
            { title: '董事義務職', desc: '本實驗室全體董事以無薪義務形式履行職責，不從平台運營中獲取個人薪酬或紅利。' },
            { title: '利潤不分配', desc: '所有法幣收費在扣除雲端服務器與區塊鏈節點維護成本後，餘額全數撥入「香港專業人才傳承基金」，用於支持退休專家的公益傳承活動。' },
            { title: '技術去中心化', desc: '用戶的智慧資產（資歷、案例、合規記錄）存儲於用戶專屬加密節點，非經本人授權，連實驗室管理人員亦無法讀取。' },
            { title: '公正撮合', desc: '平台匹配算法以技能相關性為唯一標準，不因付費等級影響撮合公正性。' },
          ].map(({ title, desc }) => (
            <div key={title} className="flex gap-3">
              <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2" style={{ background: 'var(--champagne)' }} />
              <div>
                <span className="text-xs font-semibold" style={{ color: 'rgba(237,232,223,0.85)' }}>{title}：</span>
                <span className="text-xs" style={{ color: 'rgba(237,232,223,0.55)', lineHeight: 1.7 }}>{desc}</span>
              </div>
            </div>
          ))}
          <div className="pt-2 flex items-center gap-2">
            <span className="text-[10px] px-2.5 py-1 rounded-md"
              style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: 'rgba(201,169,110,0.65)' }}>
              香港公司條例第 622 章擔保有限公司
            </span>
            <span className="text-[10px]" style={{ color: 'rgba(237,232,223,0.3)' }}>版本 V3.0 · 2025</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const STORAGE_DIVIDEND_CREDITED = 'fac_dividend_credited_v2';

// ─── Invitation Card Component ────────────────────────────────────────────────
function InvitationCardPanel({ referralCode, onCopied, copied }: { referralCode: string; onCopied: () => void; copied: boolean }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shortCode = referralCode.replace('FAC-', '');
  const inviteLink = `${typeof window !== 'undefined' ? window.location.origin : 'https://fac-platform.pages.dev'}/register?ref=${referralCode}`;

  const handleDownloadPNG = () => {
    const W = 900, H = 500;
    const canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    const c = canvas.getContext('2d');
    if (!c) return;

    // Background gradient
    const bg = c.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#070E1F');
    bg.addColorStop(0.5, '#0D1F3C');
    bg.addColorStop(1, '#070E1F');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);

    // Noise texture via tiny dots
    c.fillStyle = 'rgba(255,255,255,0.02)';
    for (let i = 0; i < 1500; i++) {
      c.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }

    // Outer gold border
    c.strokeStyle = '#C9A96E'; c.lineWidth = 2;
    roundRect(c, 18, 18, W - 36, H - 36, 16);
    c.stroke();

    // Inner subtle border
    c.strokeStyle = 'rgba(201,169,110,0.28)'; c.lineWidth = 1;
    roundRect(c, 30, 30, W - 60, H - 60, 10);
    c.stroke();

    // Top decorative line
    const lineGrad = c.createLinearGradient(100, 0, W - 100, 0);
    lineGrad.addColorStop(0, 'transparent');
    lineGrad.addColorStop(0.5, 'rgba(201,169,110,0.6)');
    lineGrad.addColorStop(1, 'transparent');
    c.strokeStyle = lineGrad; c.lineWidth = 1;
    c.beginPath(); c.moveTo(100, 98); c.lineTo(W - 100, 98); c.stroke();

    // Corner diamonds
    [[50, 50], [W - 50, 50], [50, H - 50], [W - 50, H - 50]].forEach(([x, y]) => {
      c.save(); c.translate(x, y); c.rotate(Math.PI / 4);
      c.strokeStyle = 'rgba(201,169,110,0.5)'; c.lineWidth = 1;
      c.strokeRect(-4, -4, 8, 8); c.restore();
    });

    // FAC wordmark (small)
    c.fillStyle = 'rgba(201,169,110,0.5)';
    c.font = '500 13px Arial, sans-serif';
    c.textAlign = 'center';
    c.fillText('FACILITATING ARTISAN COLLECTIVE', W / 2, 76);

    // Main title
    const titleGrad = c.createLinearGradient(0, 130, 0, 200);
    titleGrad.addColorStop(0, '#E8C97A');
    titleGrad.addColorStop(1, '#A8883A');
    c.fillStyle = titleGrad;
    c.font = 'bold 46px Arial, sans-serif';
    c.textAlign = 'center';
    c.fillText('智慧合夥人 專屬邀請', W / 2, 175);

    // Subtitle
    c.fillStyle = 'rgba(201,169,110,0.65)';
    c.font = '16px Arial, sans-serif';
    c.fillText('FAC Partner Tier · Exclusive Invitation', W / 2, 210);

    // Divider
    c.strokeStyle = 'rgba(201,169,110,0.2)'; c.lineWidth = 1;
    c.beginPath(); c.moveTo(120, 240); c.lineTo(W - 120, 240); c.stroke();

    // Quote
    c.fillStyle = 'rgba(237,232,223,0.8)';
    c.font = '18px Arial, sans-serif';
    c.textAlign = 'center';
    c.fillText('有些智慧，值得存入保險箱；有些朋友，值得共同傳承。', W / 2, 290);

    // Code label
    c.fillStyle = 'rgba(201,169,110,0.5)';
    c.font = '12px Arial, sans-serif';
    c.fillText('— EXCLUSIVE INVITATION CODE —', W / 2, 340);

    // Code value (monospace style)
    c.fillStyle = '#C9A96E';
    c.font = 'bold 36px Courier New, monospace';
    c.fillText(referralCode, W / 2, 390);

    // Bottom note
    c.fillStyle = 'rgba(237,232,223,0.35)';
    c.font = '11px Arial, sans-serif';
    c.fillText('被邀請者首月享 8 折優惠 · 邀請者獲永久分紅權', W / 2, 448);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `FAC-Partner-Invitation-${shortCode}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  return (
    <div className="space-y-5">
      {/* Preview Card */}
      <div ref={cardRef} className="relative rounded-2xl overflow-hidden select-none" style={{
        background: 'linear-gradient(135deg, #070E1F 0%, #0D1F3C 50%, #070E1F 100%)',
        border: '2px solid #C9A96E',
        boxShadow: '0 0 0 1px rgba(201,169,110,0.15) inset, 0 12px 40px rgba(0,0,0,0.6)',
        padding: '2px',
        minHeight: '200px',
      }}>
        {/* Inner border */}
        <div className="absolute inset-3 rounded-xl pointer-events-none" style={{ border: '1px solid rgba(201,169,110,0.25)' }} />
        {/* Corner accents */}
        {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos) => (
          <div key={pos} className={`absolute ${pos} w-2 h-2 rotate-45`} style={{ border: '1px solid rgba(201,169,110,0.5)' }} />
        ))}
        <div className="relative z-10 px-8 py-7 text-center space-y-3">
          <p className="text-xs tracking-widest uppercase" style={{ color: 'rgba(201,169,110,0.55)', letterSpacing: '0.2em' }}>
            Facilitating Artisan Collective
          </p>
          <div>
            <h2 className="text-2xl font-bold leading-tight" style={{
              background: 'linear-gradient(135deg, #E8C97A 0%, #C9A96E 50%, #A8883A 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              智慧合夥人 專屬邀請
            </h2>
            <p className="text-xs mt-1" style={{ color: 'rgba(201,169,110,0.55)' }}>FAC Partner Tier · Exclusive Invitation</p>
          </div>
          {/* Divider */}
          <div className="h-px my-1" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)' }} />
          <p className="text-sm" style={{ color: 'rgba(237,232,223,0.75)', lineHeight: 1.75, fontStyle: 'italic' }}>
            「有些智慧，值得存入保險箱；<br />有些朋友，值得共同傳承。」
          </p>
          {/* Divider */}
          <div className="h-px my-1" style={{ background: 'linear-gradient(90deg,transparent,rgba(201,169,110,0.3),transparent)' }} />
          <div>
            <p className="text-xs mb-2" style={{ color: 'rgba(201,169,110,0.45)', letterSpacing: '0.15em' }}>— EXCLUSIVE INVITATION CODE —</p>
            <p className="text-2xl font-bold tracking-widest font-mono" style={{ color: '#C9A96E', textShadow: '0 0 20px rgba(201,169,110,0.4)' }}>
              {referralCode}
            </p>
          </div>
          <p className="text-xs" style={{ color: 'rgba(237,232,223,0.3)' }}>
            被邀請者首月享 8 折優惠 · 邀請者獲永久分紅權
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="space-y-2">
        <button
          onClick={handleDownloadPNG}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
          style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
        >
          <Download className="w-4 h-4" />
          下載電子邀請函 (PNG)
        </button>
        <button
          onClick={() => { navigator.clipboard.writeText(inviteLink).catch(() => {}); onCopied(); }}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{ border: '1px solid rgba(201,169,110,0.45)', color: copied ? '#4CAF7D' : 'var(--champagne)' }}
        >
          <Copy className="w-4 h-4" />
          {copied ? '已複製邀請連結 ✓' : '複製專屬邀請連結'}
        </button>
      </div>
      <p className="text-xs text-center" style={{ color: 'rgba(237,232,223,0.3)' }}>
        每位合夥人的邀請碼具鏈上唯一性，永久追蹤信任網絡。
      </p>
    </div>
  );
}

export default function ProfilePage({ onBack }: { onBack: () => void }) {
  const { facBalance, transactions, addTransaction } = useWallet();

  const [vaultStatus, setVaultStatus]     = useState<VaultStatus>(getVaultStatus);
  const [userTier, setUserTier]           = useState<UserTier>(getUserTier);
  const [partnerData, setPartnerData]     = useState<PartnerData>(loadPartnerData);
  const [showPaymentModal, setShowPaymentModal]   = useState(false);
  const [paymentConfirming, setPaymentConfirming] = useState(false);
  const [copied, setCopied]               = useState(false);
  const [activePartnerTab, setActivePartnerTab]   = useState<'dividends' | 'referral' | 'governance' | 'invite'>('referral');
  const [isExporting, setIsExporting]             = useState(false);
  const [exportProgress, setExportProgress]       = useState(0);
  const [exportDone, setExportDone]               = useState(false);

  const pricing = loadPricing();
  const executivePrice = pricing?.executive?.priceMonthly ?? '299';
  const isPartner = userTier === 'executive';

  // 首次進入合夥人頁面時，將最新撮合分紅 +200 $FAC 入帳至主錢包
  useEffect(() => {
    if (!isPartner) return;
    if (localStorage.getItem(STORAGE_DIVIDEND_CREDITED)) return;
    localStorage.setItem(STORAGE_DIVIDEND_CREDITED, '1');
    addTransaction({ date: '2025-06-01', label: '來自受邀專家 A 的智慧撮合分紅', amount: 200 });
  }, [isPartner, addTransaction]);

  const vaultLabel =
    vaultStatus === 'none' ? '未開通'
    : vaultStatus === 'cloud' ? '已開通（雲端）'
    : '已備份至冷錢包';

  // ── Vault ──────────────────────────────────────────────────────────────────
  const handlePaymentConfirm = useCallback(() => {
    setPaymentConfirming(true);
    setTimeout(() => {
      localStorage.setItem(STORAGE_VAULT, 'cloud');
      setVaultStatus('cloud');
      setShowPaymentModal(false);
      setPaymentConfirming(false);
    }, 800);
  }, []);

  const handleExportToColdWallet = useCallback(() => {
    if (isExporting) return;
    setIsExporting(true);
    setExportProgress(0);
    setExportDone(false);

    // Animate progress bar 0 → 100
    const steps = [
      { pct: 15, delay: 150 }, { pct: 35, delay: 350 },
      { pct: 58, delay: 600 }, { pct: 80, delay: 900 },
      { pct: 95, delay: 1100 }, { pct: 100, delay: 1350 },
    ];
    steps.forEach(({ pct, delay }) => {
      setTimeout(() => setExportProgress(pct), delay);
    });

    setTimeout(() => {
      setExportDone(true);
      const payload = {
        exportedAt: new Date().toISOString(),
        version: '2.1',
        vaultStatus, tier: userTier,
        balance: facBalance,
        transactions: transactions.slice(0, 50),
        partnerReferralCode: partnerData.referralCode,
        note: '此檔案為加密備份，請妥善保管於冷錢包或離線儲存。'
      };
      const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(payload, null, 2))));
      const blob = new Blob([JSON.stringify({ encrypted: true, version: '2.1', payload: encoded })], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `fac-cold-wallet-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      localStorage.setItem(STORAGE_VAULT, 'cold');
      setVaultStatus('cold');
      setTimeout(() => { setIsExporting(false); setExportProgress(0); setExportDone(false); }, 2200);
    }, 1600);
  }, [isExporting, vaultStatus, userTier, facBalance, transactions, partnerData.referralCode]);

  // ── Referral copy ──────────────────────────────────────────────────────────
  const handleCopyCode = useCallback(() => {
    const link = `${window.location.origin}/register?ref=${partnerData.referralCode}`;
    navigator.clipboard.writeText(link).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [partnerData.referralCode]);

  // ── Governance vote ────────────────────────────────────────────────────────
  const handleVote = useCallback((proposalId: string, choice: string) => {
    const updated = { ...partnerData, votes: { ...partnerData.votes, [proposalId]: choice } };
    setPartnerData(updated);
    savePartnerData(updated);
  }, [partnerData]);

  // ── Dividend payout type toggle ────────────────────────────────────────────
  const [dividendPayType, setDividendPayType] = useState<'FAC' | 'stablecoin'>('FAC');

  // ── Auto-persist tier ──────────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_TIER, userTier);
  }, [userTier]);

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--midnight)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-28 md:pb-12">

        {/* Header */}
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'rgba(201,169,110,0.8)' }}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold" style={{ color: 'var(--off-white)' }}>個人中心</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold" style={{
            background: isPartner ? 'rgba(201,169,110,0.15)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isPartner ? 'rgba(201,169,110,0.5)' : 'rgba(255,255,255,0.1)'}`,
            color: isPartner ? 'var(--champagne)' : 'rgba(237,232,223,0.6)'
          }}>
            {isPartner && <Star className="w-3.5 h-3.5" />}
            {isPartner ? 'Executive · 合夥人 (Partner)' : userTier === 'professional' ? 'Professional' : 'Basic'}
          </div>
        </div>

        {/* ═══ CAS Laboratory 機構聲明 ════════════════════════════════════════ */}
        <CasDeclarationBlock />

        {/* ═══ 保險箱模塊 ══════════════════════════════════════════════════════ */}
        <SectionCard>
          <CardHeader icon={Shield} title="去中心化保險箱" subtitle="鏈上加密空間 · 智慧資產托管" />
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(237,232,223,0.7)' }}>保險箱狀態</span>
              <span
                className="flex items-center gap-2 text-sm font-medium px-3 py-1.5 rounded-lg"
                style={{
                  color: vaultStatus === 'none' ? 'rgba(237,232,223,0.8)' : '#4CAF7D',
                  background: vaultStatus === 'none' ? 'rgba(255,255,255,0.06)' : 'rgba(76,175,80,0.12)',
                  border: `1px solid ${vaultStatus === 'none' ? 'rgba(201,169,110,0.2)' : 'rgba(76,175,80,0.3)'}`
                }}
              >
                {vaultStatus === 'cloud' && <Cloud className="w-4 h-4" />}
                {vaultStatus === 'cold' && <CheckCircle className="w-4 h-4" />}
                {vaultLabel}
              </span>
            </div>
            {vaultStatus === 'none' && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
              >
                <Lock className="w-4 h-4" />
                開通保險箱（建庫費 HKD {executivePrice}）
              </button>
            )}
            {isPartner && vaultStatus !== 'none' && (
              <div className="space-y-2">
                <button
                  onClick={handleExportToColdWallet}
                  disabled={isExporting}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    border: '1px solid rgba(201,169,110,0.5)',
                    color: isExporting ? 'rgba(201,169,110,0.5)' : 'var(--champagne)',
                    cursor: isExporting ? 'not-allowed' : 'pointer'
                  }}
                >
                  <Download className="w-4 h-4" />
                  導出智慧資產至冷錢包
                </button>
                {isExporting && (
                  <div className="p-4 rounded-xl space-y-3" style={{ background: 'rgba(13,31,60,0.9)', border: '1px solid rgba(201,169,110,0.25)' }}>
                    <p className="text-xs font-semibold" style={{ color: exportDone ? '#4CAF7D' : 'var(--champagne)' }}>
                      {exportDone ? '✓ 密鑰已生成 · 智慧資產封裝完成' : `數據封裝中… ${exportProgress < 60 ? '正在加密您的智慧資產' : exportProgress < 95 ? '密鑰生成中' : '完成封裝'}`}
                    </p>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress}%`, background: exportDone ? 'linear-gradient(90deg,#4CAF7D,#81C784)' : 'linear-gradient(90deg,#C9A96E,#a8883a)' }}
                      />
                    </div>
                    <div className="flex justify-between text-xs" style={{ color: 'rgba(237,232,223,0.45)' }}>
                      <span>{exportProgress < 40 ? '初始化加密環境' : exportProgress < 80 ? '序列化鏈上資料' : '生成 RSA 密鑰對'}</span>
                      <span>{exportProgress}%</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </SectionCard>

        {/* ═══ Partner 合夥人模塊（僅 Executive 可見） ═══════════════════════ */}
        {isPartner ? (
          <SectionCard>
            <CardHeader
              icon={Star}
              title="合夥人中心 · Partner Tier"
              subtitle="智慧分紅 · 邀請碼 · 治理投票"
              badge={
                <span className="text-xs px-2 py-1 rounded-md font-medium" style={{ background: 'rgba(201,169,110,0.15)', color: 'var(--champagne)', border: '1px solid rgba(201,169,110,0.35)' }}>
                  董事會成員
                </span>
              }
            />

            {/* Tab strip */}
            <div className="flex border-b" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
              {(['referral', 'dividends', 'governance', 'invite'] as const).map((tab) => {
                const labels = { referral: '邀請碼', dividends: '智慧分紅', governance: '治理投票', invite: '邀請函' };
                return (
                  <button
                    key={tab}
                    onClick={() => setActivePartnerTab(tab)}
                    className="flex-1 py-3 text-xs font-medium transition-colors"
                    style={{
                      color: activePartnerTab === tab ? 'var(--champagne)' : 'rgba(237,232,223,0.45)',
                      borderBottom: activePartnerTab === tab ? '2px solid var(--champagne)' : '2px solid transparent'
                    }}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            <div className="px-6 py-5">
              {/* ── 邀請碼 & 信任網絡 ── */}
              {activePartnerTab === 'referral' && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs mb-2" style={{ color: 'rgba(237,232,223,0.5)' }}>您的專屬邀請碼保險箱</p>
                    <div
                      className="flex items-center gap-3 p-4 rounded-xl"
                      style={{ background: 'rgba(201,169,110,0.07)', border: '1px solid rgba(201,169,110,0.25)' }}
                    >
                      <span className="flex-1 font-mono text-lg font-bold tracking-widest" style={{ color: 'var(--champagne)' }}>
                        {partnerData.referralCode}
                      </span>
                      <button
                        onClick={handleCopyCode}
                        className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all"
                        style={{
                          background: copied ? 'rgba(76,175,80,0.15)' : 'rgba(201,169,110,0.12)',
                          border: `1px solid ${copied ? 'rgba(76,175,80,0.4)' : 'rgba(201,169,110,0.3)'}`,
                          color: copied ? '#4CAF7D' : 'var(--champagne)'
                        }}
                      >
                        {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copied ? '已複製' : '複製鏈接'}
                      </button>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'rgba(201,169,110,0.45)' }}>
                      被邀請者享首月 8 折 · 您獲得永久分紅權
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium" style={{ color: 'rgba(237,232,223,0.8)' }}>信任網絡成員</p>
                      <span className="text-xs px-2 py-0.5 rounded-md" style={{ background: 'rgba(201,169,110,0.1)', color: 'var(--champagne)', border: '1px solid rgba(201,169,110,0.25)' }}>
                        {partnerData.referredUsers.length} 位
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {partnerData.referredUsers.map((uid, i) => (
                        <li key={uid} className="flex items-center gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,110,0.1)' }}>
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'rgba(201,169,110,0.18)', color: 'var(--champagne)' }}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          <span className="text-xs font-mono" style={{ color: 'rgba(237,232,223,0.7)' }}>{uid}</span>
                          <span className="ml-auto text-xs" style={{ color: '#4CAF7D' }}>永久分紅中</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl" style={{ background: 'rgba(33,150,243,0.07)', border: '1px solid rgba(33,150,243,0.2)' }}>
                    <p className="text-xs" style={{ color: 'rgba(237,232,223,0.65)', lineHeight: 1.7 }}>
                      每當您的信任網絡成員在平台完成智慧撮合，平台手續費的 <strong style={{ color: 'var(--champagne)' }}>5%–10%</strong> 將作為「智慧分紅」撥回您的合夥人帳戶。
                    </p>
                  </div>
                </div>
              )}

              {/* ── 智慧分紅 ── */}
              {activePartnerTab === 'dividends' && (
                <div className="space-y-5">
                  {/* 餘額卡 + 合夥人收益看板 */}
                  <div className="p-5 rounded-xl" style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.12) 0%, rgba(201,169,110,0.05) 100%)', border: '1px solid rgba(201,169,110,0.3)' }}>
                    <p className="text-xs mb-1" style={{ color: 'rgba(201,169,110,0.7)' }}>合夥人收益看板</p>
                    <div className="flex items-end gap-3">
                      <span className="text-3xl font-bold tabular-nums" style={{ color: 'var(--champagne)' }}>
                        HKD {partnerData.dividendBalanceHKD.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs mt-2" style={{ color: 'rgba(237,232,223,0.45)' }}>來自 {partnerData.referredUsers.length} 位信任網絡成員的撮合收益</p>
                    <div className="mt-4 pt-4 grid grid-cols-2 gap-3" style={{ borderTop: '1px solid rgba(201,169,110,0.15)' }}>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: 'rgba(201,169,110,0.55)' }}>累積 $FAC 分紅</p>
                        <p className="text-xl font-bold tabular-nums" style={{ color: '#4CAF7D' }}>+{TOTAL_EARNINGS_FAC} $FAC</p>
                      </div>
                      <div>
                        <p className="text-xs mb-0.5" style={{ color: 'rgba(201,169,110,0.55)' }}>分紅筆數</p>
                        <p className="text-xl font-bold tabular-nums text-white">{MOCK_DIVIDENDS.length} 筆</p>
                      </div>
                    </div>
                  </div>

                  {/* 提現方式 */}
                  <div>
                    <p className="text-xs mb-2" style={{ color: 'rgba(237,232,223,0.5)' }}>選擇提現方式</p>
                    <div className="flex gap-2">
                      {(['FAC', 'stablecoin'] as const).map((t) => (
                        <button
                          key={t}
                          onClick={() => setDividendPayType(t)}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                          style={{
                            background: dividendPayType === t ? 'rgba(201,169,110,0.18)' : 'rgba(255,255,255,0.04)',
                            border: `1px solid ${dividendPayType === t ? 'rgba(201,169,110,0.55)' : 'rgba(201,169,110,0.15)'}`,
                            color: dividendPayType === t ? 'var(--champagne)' : 'rgba(237,232,223,0.55)'
                          }}
                        >
                          {t === 'FAC' ? <Coins className="w-4 h-4" /> : <Gift className="w-4 h-4" />}
                          {t === 'FAC' ? '$FAC Token' : '穩定幣 (USDT)'}
                        </button>
                      ))}
                    </div>
                    <button
                      className="w-full mt-3 py-3 rounded-xl font-semibold text-sm"
                      style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
                    >
                      申請提現 · {dividendPayType === 'FAC' ? '$FAC 模式' : '穩定幣模式'}
                    </button>
                  </div>

                  {/* 分紅流水 */}
                  <div>
                    <p className="text-sm font-medium mb-3" style={{ color: 'rgba(237,232,223,0.8)' }}>分紅流水紀錄</p>
                    <ul className="space-y-2">
                      {partnerData.dividendHistory.map((d) => (
                        <li key={d.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,110,0.1)' }}>
                          <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: '#4CAF7D' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs" style={{ color: 'rgba(237,232,223,0.8)' }}>{d.source}</p>
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(237,232,223,0.4)' }}>{d.date}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold tabular-nums" style={{ color: '#4CAF7D' }}>+HKD {d.amountHKD}</p>
                            <p className="text-xs tabular-nums" style={{ color: 'rgba(201,169,110,0.65)' }}>+{d.amountFAC} $FAC</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── 治理投票 ── */}
              {activePartnerTab === 'governance' && (
                <div className="space-y-5">
                  <div className="flex items-center gap-2 mb-1">
                    <Vote className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
                    <p className="text-sm" style={{ color: 'rgba(237,232,223,0.8)' }}>董事會決議投票</p>
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(237,232,223,0.45)', lineHeight: 1.7 }}>
                    作為合夥人，您的每一票直接影響平台戰略走向。一票代表信任，一票塑造行業標準。
                  </p>

                  {MOCK_PROPOSALS.map((p) => {
                    const voted = partnerData.votes[p.id];
                    const total = p.votesA + p.votesB + (voted ? 0 : 0);
                    const ratioA = Math.round((p.votesA / (p.votesA + p.votesB)) * 100);
                    return (
                      <div
                        key={p.id}
                        className="p-5 rounded-xl space-y-4"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,110,0.18)' }}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-3 mb-1">
                            <p className="text-sm font-semibold" style={{ color: 'var(--off-white)' }}>{p.title}</p>
                            <span className="text-xs flex-shrink-0" style={{ color: 'rgba(237,232,223,0.4)' }}>截止 {p.endDate}</span>
                          </div>
                          <p className="text-xs" style={{ color: 'rgba(237,232,223,0.6)', lineHeight: 1.65 }}>{p.description}</p>
                        </div>

                        {/* 投票進度條 */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs" style={{ color: 'rgba(237,232,223,0.5)' }}>
                            <span>{p.options[0]}</span>
                            <span>{ratioA}%</span>
                          </div>
                          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${ratioA}%`, background: 'linear-gradient(90deg, #C9A96E, #a8883a)' }}
                            />
                          </div>
                          <div className="flex justify-between text-xs" style={{ color: 'rgba(237,232,223,0.5)' }}>
                            <span>{p.options[1]}</span>
                            <span>{100 - ratioA}%</span>
                          </div>
                        </div>

                        <p className="text-xs" style={{ color: 'rgba(237,232,223,0.35)' }}>
                          {total} 位合夥人已投票
                        </p>

                        {/* 投票按鈕 */}
                        {!voted ? (
                          <div className="flex gap-2">
                            {p.options.map((opt, idx) => (
                              <button
                                key={opt}
                                onClick={() => handleVote(p.id, opt)}
                                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-medium transition-all"
                                style={{
                                  background: idx === 0 ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.04)',
                                  border: `1px solid ${idx === 0 ? 'rgba(201,169,110,0.4)' : 'rgba(255,255,255,0.1)'}`,
                                  color: idx === 0 ? 'var(--champagne)' : 'rgba(237,232,223,0.7)'
                                }}
                              >
                                <Vote className="w-3.5 h-3.5" />
                                {opt}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 py-2 px-3 rounded-lg" style={{ background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)' }}>
                            <CheckCircle className="w-4 h-4" style={{ color: '#4CAF7D' }} />
                            <span className="text-xs" style={{ color: '#4CAF7D' }}>您已投票：「{voted}」</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* ── 黑金邀請函 ── */}
              {activePartnerTab === 'invite' && (
                <InvitationCardPanel
                  referralCode={partnerData.referralCode}
                  onCopied={() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }}
                  copied={copied}
                />
              )}
            </div>
          </SectionCard>
        ) : (
          /* 非 Executive：升級邀請卡 */
          <div
            className="rounded-2xl p-6 mb-6 border text-center"
            style={{
              background: 'linear-gradient(145deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
              borderColor: 'rgba(201,169,110,0.25)'
            }}
          >
            <Star className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--champagne)' }} />
            <p className="text-sm font-semibold mb-2" style={{ color: 'var(--off-white)' }}>升級為合夥人 (Executive)</p>
            <p className="text-xs mb-4" style={{ color: 'rgba(237,232,223,0.55)', lineHeight: 1.7 }}>
              智慧分紅、專屬邀請碼、去中心化治理投票。成為「智慧銀行」的董事會成員。
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a href="/register" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}>
                <ChevronRight className="w-4 h-4" />
                立即升級
              </a>
              <button
                type="button"
                onClick={() => { localStorage.setItem(STORAGE_TIER, 'executive'); setUserTier('executive'); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-medium"
                style={{ border: '1px solid rgba(201,169,110,0.35)', color: 'rgba(201,169,110,0.8)' }}
              >
                體驗 Partner 模式（模擬）
              </button>
            </div>
          </div>
        )}

        {/* 帳號資訊條 */}
        <div className="flex items-center justify-between flex-wrap gap-2 mt-2">
          <div className="flex items-center gap-3">
            <Coins className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
            <span className="text-xs" style={{ color: 'rgba(201,169,110,0.6)' }}>
              $FAC 餘額：{facBalance}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Users className="w-4 h-4" style={{ color: 'rgba(237,232,223,0.4)' }} />
            <span className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>
              信任網絡 {partnerData.referredUsers.length} 人
            </span>
          </div>
        </div>
      </div>

      {/* ── 支付彈窗 ───────────────────────────────────────────────────────── */}
      {showPaymentModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          onClick={() => !paymentConfirming && setShowPaymentModal(false)}
        >
          <div
            className="rounded-2xl p-6 w-full max-w-md shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, var(--navy) 0%, #0A1628 100%)',
              border: '1px solid rgba(201,169,110,0.35)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-semibold" style={{ color: 'var(--off-white)' }}>開通鏈上保險箱</span>
              <button
                onClick={() => !paymentConfirming && setShowPaymentModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
                style={{ color: 'rgba(237,232,223,0.7)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'rgba(237,232,223,0.85)', lineHeight: 1.7 }}>
              此費用用於建立您的鏈上私密空間。支付完成後，您的資歷與核心數據將存儲於去中心化保險箱中。
            </p>
            <div className="flex items-center justify-between py-3 px-4 rounded-xl mb-6" style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
              <span className="text-sm" style={{ color: 'rgba(237,232,223,0.8)' }}>建庫費（一次性）</span>
              <span className="font-bold" style={{ color: 'var(--champagne)' }}>HKD {executivePrice}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => !paymentConfirming && setShowPaymentModal(false)}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium"
                style={{ border: '1px solid rgba(201,169,110,0.4)', color: 'var(--champagne)' }}
              >
                取消
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={paymentConfirming}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold"
                style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
              >
                {paymentConfirming ? '處理中…' : '確認支付'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
