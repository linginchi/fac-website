/**
 * MePage — 「我的」頁面 (V5.1 Mobile-First)
 * Route: /me
 * Features: User profile, tier badge, $FAC entry, CAS Laboratory declaration,
 *           quick actions menu, platform mission, invitation card generation.
 */
import { useState } from 'react';
import {
  ArrowLeft, Shield, Coins, Star, ChevronRight,
  Building2, Users, Vote, Download, Gift, Layers,
  LogIn, CheckCircle, MessageCircle, Crown,
  Share2, TrendingDown
} from 'lucide-react';
import { useFac } from '../contexts/FacContext';
import { useInvitation } from '../contexts/InvitationContext';
import { useUser } from '../contexts/UserContext';
import InvitationCardGenerator from '../components/InvitationCardGenerator';
import type { MembershipTier } from '../types/user';
import { TIER_CONFIG } from '../types/user';

const STORAGE_TIER     = 'fac_user_tier_v51';
const STORAGE_LOGGED_IN = 'fac_user_logged_in_v51';
const STORAGE_VAULT    = 'fac_vault_status_v51';

function getUserTier(): MembershipTier {
  if (typeof window === 'undefined') return 'basic';
  const stored = localStorage.getItem(STORAGE_TIER) as MembershipTier;
  return stored && TIER_CONFIG[stored] ? stored : 'basic';
}

function setUserTier(tier: MembershipTier) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_TIER, tier);
  }
}

function isLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem(STORAGE_LOGGED_IN);
}

function getVaultStatus(): string {
  if (typeof window === 'undefined') return 'none';
  return localStorage.getItem(STORAGE_VAULT) ?? 'none';
}

const TIER_LABEL: Record<MembershipTier, string> = {
  basic: 'Basic · 標準版',
  professional: 'Professional · 專業版',
  executive: 'Executive · 合夥人',
};

const TIER_STYLE: Record<MembershipTier, { bg: string; border: string; color: string }> = {
  basic: { bg: 'rgba(255,255,255,0.06)', border: 'rgba(255,255,255,0.12)', color: 'rgba(237,232,223,0.6)' },
  professional: { bg: 'rgba(33,150,243,0.1)', border: 'rgba(33,150,243,0.3)', color: '#64B5F6' },
  executive: { bg: 'rgba(201,169,110,0.14)', border: 'rgba(201,169,110,0.45)', color: '#C9A96E' },
};

export default function MePage({ onBack }: { onBack: () => void }) {
  const { wallet, getLifetimeStats } = useFac();
  const { getStats } = useInvitation();
  const { currentUser, userRole } = useUser();
  const [declarationOpen, setDeclarationOpen] = useState(false);
  const [showInviteGenerator, setShowInviteGenerator] = useState(false);
  const [tier, setTier] = useState<MembershipTier>(() => getUserTier());
  const loggedIn = isLoggedIn();
  const vaultStatus = getVaultStatus();
  const isPartner = tier === 'executive';
  const isProfessional = tier === 'professional';
  const tierStyle = TIER_STYLE[tier];
  
  const stats = getLifetimeStats();
  const inviteStats = getStats('current_user');

  // Quick tier switcher for demo
  const cycleTier = () => {
    const tiers: MembershipTier[] = ['basic', 'professional', 'executive'];
    const currentIndex = tiers.indexOf(tier);
    const nextTier = tiers[(currentIndex + 1) % tiers.length];
    setTier(nextTier);
    setUserTier(nextTier);
  };

  const quickActions = [
    {
      icon: Shield,
      label: '我的智慧保險箱',
      sub: vaultStatus === 'none' ? '未開通' : vaultStatus === 'cloud' ? '已開通（雲端）' : '已備份至冷錢包',
      href: '/profile',
      highlight: true,
      status: vaultStatus !== 'none' ? 'active' : 'inactive',
      onClick: undefined,
    },
    {
      icon: Coins,
      label: '$FAC 流水賬',
      sub: `餘額：${wallet.balance.toLocaleString()} $FAC · 淨收益 ${stats.net.toLocaleString()}`,
      href: '/wallet',
      highlight: false,
      status: wallet.balance > 0 ? 'active' : 'neutral',
      onClick: undefined,
    },
    {
      icon: MessageCircle,
      label: '平台消息',
      sub: '來自 FAC 港匠匯 的專業答覆',
      href: '/me/messages',
      highlight: false,
      status: 'neutral',
      onClick: undefined,
    },
    {
      icon: Layers,
      label: '智慧庫',
      sub: '查看已解碼的專家與項目',
      href: '/vault',
      highlight: false,
      status: 'neutral',
      onClick: undefined,
    },
    {
      icon: Share2,
      label: '推薦中心',
      sub: '邀請好友，賺取 $FAC 積分',
      href: '/referral',
      highlight: false,
      status: 'active' as const,
      onClick: undefined,
    },
    {
      icon: TrendingDown,
      label: '回購透明度',
      sub: '查看平台回購與銷毀數據',
      href: '/buyback',
      highlight: false,
      status: 'active' as const,
      onClick: undefined,
    },
    ...(isPartner ? [
      {
        icon: Gift,
        label: '邀請摯友',
        sub: `已邀請 ${inviteStats.totalUsed} 人 · 分紅 ${inviteStats.totalRevenue} $FAC`,
        href: '#',
        highlight: false,
        status: 'partner' as const,
        onClick: () => setShowInviteGenerator(true),
      },
      {
        icon: Download,
        label: '導出至冷錢包',
        sub: '僅限 Executive 合夥人',
        href: '/profile',
        highlight: false,
        status: 'partner' as const,
        onClick: undefined,
      },
      {
        icon: Vote,
        label: '治理投票',
        sub: '參與實驗室決策',
        href: '/profile',
        highlight: false,
        status: 'partner' as const,
        onClick: undefined,
      },
    ] : [
      {
        icon: Star,
        label: '升級為合夥人',
        sub: '解鎖分紅 · 治理 · 邀請函 · 冷錢包導出',
        href: '/wallet',
        highlight: false,
        status: 'upgrade' as const,
        onClick: undefined,
      },
    ]),
  ];

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--midnight)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(160deg, #070E1F 0%, #0D1F3C 55%, #070E1F 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent)' }} />

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8 pb-32 md:pb-12">

        {/* Header */}
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: 'rgba(201,169,110,0.8)' }}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* ── User Profile Card ── */}
        <div
          className="rounded-2xl p-5 mb-5"
          style={{
            background: 'linear-gradient(145deg, rgba(13,31,60,0.97) 0%, rgba(10,22,40,0.99) 100%)',
            border: `1px solid ${tierStyle.border}`,
            boxShadow: isPartner ? `0 0 20px rgba(201,169,110,0.1)` : 'none',
          }}
        >
          <div className="flex items-start justify-between gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.06) 100%)', border: `1px solid ${tierStyle.border}` }}>
              {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : isPartner ? (
                <Crown className="w-7 h-7" style={{ color: '#C9A96E' }} />
              ) : isProfessional ? (
                <Star className="w-7 h-7" style={{ color: '#64B5F6' }} />
              ) : (
                <Users className="w-7 h-7" style={{ color: 'rgba(201,169,110,0.55)' }} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-bold" style={{ color: 'var(--off-white)' }}>
                  {currentUser?.displayName || (loggedIn ? '用戶（已登入）' : '未登入')}
                </span>
                {userRole !== 'neutral' && (
                  <span 
                    className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ 
                      background: userRole === 'A' ? 'rgba(33,150,243,0.12)' : 'rgba(76,175,80,0.12)',
                      border: `1px solid ${userRole === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`,
                      color: userRole === 'A' ? '#64B5F6' : '#81C784'
                    }}
                  >
                    {userRole === 'A' ? '甲方' : '乙方'}
                  </span>
                )}
                {loggedIn && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', color: '#81C784' }}>
                    <CheckCircle className="w-2.5 h-2.5 inline mr-0.5" />
                    LinkedIn 已認證
                  </span>
                )}
              </div>

              {/* Tier badge - clickable for demo */}
              <button 
                onClick={cycleTier}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all hover:scale-105"
                style={{ background: tierStyle.bg, border: `1px solid ${tierStyle.border}`, color: tierStyle.color }}
              >
                {isPartner && <Crown className="w-3 h-3" />}
                {isProfessional && <Star className="w-3 h-3" />}
                {TIER_LABEL[tier]}
                <span className="text-[8px] opacity-50 ml-1">(點擊切換)</span>
              </button>
            </div>
          </div>

          {/* $FAC Balance */}
          <div className="mt-4 pt-4 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(201,169,110,0.12)' }}>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
              <span className="text-xs" style={{ color: 'rgba(201,169,110,0.7)' }}>$FAC 餘額</span>
            </div>
            <a href="/wallet" className="flex items-center gap-2 text-sm font-bold tabular-nums wallet-balance-shimmer">
              {wallet.balance.toLocaleString()}
              <span className="text-xs font-normal" style={{ color: 'rgba(201,169,110,0.6)' }}>$FAC</span>
              <ChevronRight className="w-3.5 h-3.5" style={{ color: 'rgba(201,169,110,0.5)' }} />
            </a>
          </div>

          {/* Tier Benefits Summary */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">解碼折扣</p>
              <p className="text-sm font-bold text-[#C9A96E]">
                {TIER_CONFIG[tier].features.decodeDiscount > 0 
                  ? `${(TIER_CONFIG[tier].features.decodeDiscount * 100).toFixed(0)}%` 
                  : '—'}
              </p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">深度解碼</p>
              <p className="text-sm font-bold text-white">{TIER_CONFIG[tier].facCosts.deepDecode}</p>
            </div>
            <div className="text-center p-2 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">LinkedIn獎勵</p>
              <p className="text-sm font-bold text-[#C9A96E]">+{TIER_CONFIG[tier].facRewards.linkedinAuth}</p>
            </div>
          </div>

          {/* Login CTA if not logged in */}
          {!loggedIn && (
            <a href="/register"
              className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}>
              <LogIn className="w-4 h-4" />
              LinkedIn 登入，即領 {TIER_CONFIG[tier].facRewards.linkedinAuth} $FAC
            </a>
          )}
        </div>

        {/* ── Quick Actions Menu ── */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{
          background: 'linear-gradient(145deg, rgba(13,31,60,0.96) 0%, rgba(10,22,40,0.99) 100%)',
          border: '1px solid rgba(201,169,110,0.2)',
        }}>
          <div className="px-5 py-3 border-b" style={{ borderColor: 'rgba(201,169,110,0.12)' }}>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'rgba(201,169,110,0.6)' }}>功能菜單</p>
          </div>
          {quickActions.map(({ icon: Icon, label, sub, href, status, onClick }, idx) => (
            <a
              key={label}
              href={href}
              onClick={(e) => {
                if (onClick) {
                  e.preventDefault();
                  onClick();
                }
              }}
              className="flex items-center gap-4 px-5 py-4 transition-colors"
              style={{
                borderBottom: idx < quickActions.length - 1 ? '1px solid rgba(201,169,110,0.07)' : 'none',
                background: 'transparent',
              }}
              onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,110,0.05)'; }}
              onTouchEnd={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(201,169,110,0.05)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: status === 'partner' ? 'rgba(201,169,110,0.14)' : status === 'upgrade' ? 'rgba(201,169,110,0.08)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${status === 'partner' || status === 'upgrade' ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.1)'}`,
                }}>
                <Icon className="w-4 h-4" style={{
                  color: status === 'partner' || status === 'upgrade' ? 'var(--champagne)' : status === 'active' ? '#4CAF7D' : 'rgba(237,232,223,0.5)'
                }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium" style={{ color: 'var(--off-white)' }}>{label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(237,232,223,0.4)' }}>{sub}</p>
              </div>
              <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(201,169,110,0.35)' }} />
            </a>
          ))}
        </div>

        {/* ── CAS Laboratory 機構正式聲明 ── */}
        <div className="rounded-2xl overflow-hidden mb-5" style={{
          background: 'linear-gradient(145deg, rgba(7,14,31,0.98) 0%, rgba(10,22,40,0.99) 100%)',
          border: '1px solid rgba(201,169,110,0.25)',
        }}>
          <button
            className="w-full flex items-start gap-4 px-5 py-4 text-left"
            onClick={() => setDeclarationOpen((v) => !v)}
          >
            <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5"
              style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.28)' }}>
              <Building2 className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold mb-0.5" style={{ color: 'rgba(201,169,110,0.75)', letterSpacing: '0.05em' }}>
                關於運營方 · CAS Laboratory
              </p>
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--off-white)' }}>
                國科綠色發展國際實驗室<br />（香港）有限公司
              </p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-md"
                  style={{ background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', color: '#81C784' }}>
                  非盈利擔保有限公司
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(237,232,223,0.38)' }}>編號 2828258</span>
              </div>
            </div>
            <span className="text-xs mt-2 flex-shrink-0 transition-transform duration-300"
              style={{ color: 'rgba(201,169,110,0.5)', transform: declarationOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
          </button>

          {/* Platform mission (always visible) */}
          <div className="px-5 pb-4" style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}>
            <p className="text-xs pt-4 leading-relaxed" style={{ color: 'rgba(237,232,223,0.65)' }}>
              服務香港退休專家，打造<strong style={{ color: 'rgba(237,232,223,0.85)' }}>公正、專業、去中心化</strong>的智慧對接平台。讓每一位退休的行業老將，在安全、不以盈利為目的的環境中，繼續貢獻專業價值，實現「智慧永續」。
            </p>
          </div>

          {/* Expandable pledge */}
          {declarationOpen && (
            <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}>
              <p className="text-xs font-semibold pt-4" style={{ color: 'var(--champagne)' }}>
                《非盈利運營承諾書》
              </p>
              {[
                { title: '董事義務職', desc: '全體董事以無薪義務形式履行職責，不從平台運營中獲取個人薪酬或紅利。' },
                { title: '利潤不分配', desc: '所有法幣收費餘額全數撥入「香港專業人才傳承基金」，支持退休專家公益傳承活動。' },
                { title: '技術去中心化', desc: '用戶資歷存儲於專屬加密節點，非經本人授權，連實驗室管理人員亦無法讀取。' },
                { title: '公正撮合', desc: '匹配算法以技能相關性為唯一標準，不因付費等級影響撮合公正性。' },
              ].map(({ title, desc }) => (
                <div key={title} className="flex gap-3">
                  <span className="w-1 h-1 rounded-full flex-shrink-0 mt-2" style={{ background: 'var(--champagne)' }} />
                  <div>
                    <span className="text-xs font-semibold" style={{ color: 'rgba(237,232,223,0.85)' }}>{title}：</span>
                    <span className="text-xs" style={{ color: 'rgba(237,232,223,0.55)', lineHeight: 1.7 }}>{desc}</span>
                  </div>
                </div>
              ))}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <span className="text-[10px] px-2.5 py-1 rounded-md"
                  style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)', color: 'rgba(201,169,110,0.6)' }}>
                  香港公司條例第 622 章擔保有限公司
                </span>
                <span className="text-[10px]" style={{ color: 'rgba(237,232,223,0.3)' }}>版本 V5.1 · 2026</span>
              </div>
            </div>
          )}
        </div>

        {/* ── 版本資訊 ── */}
        <div className="text-center space-y-1 mt-2">
          <p className="text-xs" style={{ color: 'rgba(237,232,223,0.25)' }}>
            FAC · 港匠匯 · 智慧傳承平台 V5.1-ALPHA
          </p>
          <p className="text-[10px]" style={{ color: 'rgba(237,232,223,0.18)' }}>
            CAS Laboratory · 非盈利 · 數據主權歸用戶
          </p>
        </div>
      </div>

      {/* Invitation Card Generator Modal */}
      <InvitationCardGenerator
        isOpen={showInviteGenerator}
        onClose={() => setShowInviteGenerator(false)}
        userName="FAC Member"
        userTier={tier}
      />
    </div>
  );
}
