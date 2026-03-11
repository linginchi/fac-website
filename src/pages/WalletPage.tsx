/**
 * FAC Platform V5.1 - Wallet Page
 * $FAC Token 钱包：余额、交易记录、分级权益
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFac } from '../contexts/FacContext';
import { useInvitation } from '../contexts/InvitationContext';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import BottomNav from '../components/BottomNav';
import { 
  Coins, ArrowUpRight, ArrowDownRight, Gift, Users, 
  Crown, Star, Zap, ChevronRight, Copy, CheckCircle,
  Wallet, TrendingUp, History
} from 'lucide-react';
import type { MembershipTier, FacTransaction } from '../types/user';
import { TIER_CONFIG, REFERRAL_REVENUE_SHARE } from '../types/user';

// ==================== Components ====================

function TierCard({ 
  tier, 
  isCurrent, 
  onSelect 
}: { 
  tier: MembershipTier; 
  isCurrent: boolean;
  onSelect: () => void;
}) {
  const config = TIER_CONFIG[tier];
  const isExecutive = tier === 'executive';
  const isProfessional = tier === 'professional';

  return (
    <div 
      onClick={onSelect}
      className={`
        relative rounded-xl p-5 cursor-pointer transition-all duration-300
        ${isCurrent 
          ? 'bg-gradient-to-br from-[#C9A96E]/20 to-[#C9A96E]/5 border-2 border-[#C9A96E]' 
          : 'bg-white/5 border border-white/10 hover:bg-white/10'
        }
        ${isExecutive ? 'col-span-full md:col-span-1' : ''}
      `}
    >
      {isCurrent && (
        <div className="absolute -top-3 left-4 px-3 py-1 bg-[#C9A96E] text-[#0A1628] text-xs font-bold rounded-full">
          当前等级
        </div>
      )}
      
      <div className="flex items-center gap-3 mb-4">
        <div className={`
          w-12 h-12 rounded-xl flex items-center justify-center
          ${isExecutive ? 'bg-gradient-to-br from-[#C9A96E] to-[#D4AF37]' : ''}
          ${isProfessional ? 'bg-gradient-to-br from-[#64B5F6] to-[#2196F3]' : ''}
          ${tier === 'basic' ? 'bg-white/10' : ''}
        `}>
          {isExecutive && <Crown className="w-6 h-6 text-[#0A1628]" />}
          {isProfessional && <Star className="w-6 h-6 text-white" />}
          {tier === 'basic' && <Zap className="w-6 h-6 text-white/60" />}
        </div>
        <div>
          <h3 className="font-bold text-white">{config.name}</h3>
          <p className="text-sm text-gray-400">
            {config.monthlyFee === 0 ? '免费' : `HKD ${config.monthlyFee}/月`}
          </p>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-400">基础解码</span>
          <span className="text-white">{config.facCosts.basicDecode} $FAC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">深度解码</span>
          <span className="text-white">{config.facCosts.deepDecode} $FAC</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">私密对话</span>
          <span className="text-white">{config.facCosts.privateChat} $FAC</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10">
        <div className="flex flex-wrap gap-2">
          {config.features.priorityMatching && (
            <span className="px-2 py-1 bg-[#C9A96E]/20 text-[#C9A96E] text-xs rounded">优先匹配</span>
          )}
          {config.features.coldWalletExport && (
            <span className="px-2 py-1 bg-[#C9A96E]/20 text-[#C9A96E] text-xs rounded">冷钱包导出</span>
          )}
          {config.features.governanceVote && (
            <span className="px-2 py-1 bg-[#C9A96E]/20 text-[#C9A96E] text-xs rounded">治理投票</span>
          )}
          {config.features.revenueShare && (
            <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded">分紅权益</span>
          )}
        </div>
      </div>
    </div>
  );
}

function TransactionItem({ tx }: { tx: FacTransaction }) {
  const isReward = tx.amount > 0;
  
  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`
          w-10 h-10 rounded-lg flex items-center justify-center
          ${isReward ? 'bg-green-500/20' : 'bg-red-500/20'}
        `}>
          {isReward ? (
            <ArrowDownRight className="w-5 h-5 text-green-400" />
          ) : (
            <ArrowUpRight className="w-5 h-5 text-red-400" />
          )}
        </div>
        <div>
          <p className="text-white font-medium">{tx.description}</p>
          <p className="text-xs text-gray-400">
            {new Date(tx.createdAt).toLocaleDateString('zh-HK')}
          </p>
        </div>
      </div>
      <span className={`font-bold ${isReward ? 'text-green-400' : 'text-red-400'}`}>
        {isReward ? '+' : ''}{tx.amount} $FAC
      </span>
    </div>
  );
}

function InviteCodeGenerator() {
  const { generateInviteCode, myInvites, getStats } = useInvitation();
  const [justCopied, setJustCopied] = useState<string | null>(null);
  
  const stats = getStats('current_user');
  
  const handleGenerate = () => {
    generateInviteCode('current_user', 20);
  };
  
  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setJustCopied(code);
    setTimeout(() => setJustCopied(null), 2000);
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#C9A96E]" />
            我的邀请码
          </h3>
          <p className="text-sm text-gray-400 mt-1">
            邀请好友首月享 8 折优惠，您获得永久分紅权
          </p>
        </div>
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-[#C9A96E] text-[#0A1628] font-medium rounded-lg hover:bg-[#D4AF37] transition-colors"
        >
          生成邀请码
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-2xl font-bold text-[#C9A96E]">{stats.totalGenerated}</p>
          <p className="text-xs text-gray-400">已生成</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-2xl font-bold text-green-400">{stats.totalUsed}</p>
          <p className="text-xs text-gray-400">已使用</p>
        </div>
        <div className="text-center p-3 bg-white/5 rounded-lg">
          <p className="text-2xl font-bold text-white">{stats.totalRevenue}</p>
          <p className="text-xs text-gray-400">分紅收益 ($FAC)</p>
        </div>
      </div>

      {myInvites.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {myInvites.filter(inv => inv.status === 'active').map(invite => (
            <div key={invite.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <code className="text-[#C9A96E] font-mono text-lg">{invite.code}</code>
                <p className="text-xs text-gray-400">
                  有效期至 {new Date(new Date(invite.createdAt).getTime() + 90 * 24 * 60 * 60 * 1000).toLocaleDateString('zh-HK')}
                </p>
              </div>
              <button
                onClick={() => copyCode(invite.code)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                {justCopied === invite.code ? (
                  <CheckCircle className="w-5 h-5 text-green-400" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400" />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==================== Main Page ====================

export default function WalletPage() {
  const { t } = useTranslation();
  const { wallet, getTransactionHistory, getLifetimeStats } = useFac();
  const [currentTier, setCurrentTier] = useState<MembershipTier>('basic');
  const [activeTab, setActiveTab] = useState<'overview' | 'tiers' | 'history'>('overview');
  
  const transactions = getTransactionHistory(20);
  const stats = getLifetimeStats();

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">$FAC 钱包</h1>
            <p className="text-gray-400">生态激励点数 · 非金融资产</p>
          </div>

          {/* Balance Card */}
          <div className="bg-gradient-to-br from-[#C9A96E]/20 to-[#0A1628] border border-[#C9A96E]/30 rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#C9A96E] to-[#D4AF37] flex items-center justify-center">
                  <Coins className="w-8 h-8 text-[#0A1628]" />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">当前余额</p>
                  <p className="text-4xl font-bold text-white">{wallet.balance.toLocaleString()}</p>
                  <p className="text-[#C9A96E] text-sm">$FAC</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">+{stats.net.toLocaleString()}</span>
                </div>
                <p className="text-xs text-gray-400">净收益</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-green-400">{stats.earned.toLocaleString()}</p>
                <p className="text-xs text-gray-400">累计获得</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-red-400">{stats.consumed.toLocaleString()}</p>
                <p className="text-xs text-gray-400">累计消耗</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#C9A96E]">{wallet.referralRevenue.toLocaleString()}</p>
                <p className="text-xs text-gray-400">推荐分紅</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['overview', 'tiers', 'history'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
                  flex-1 py-3 rounded-xl font-medium transition-all
                  ${activeTab === tab 
                    ? 'bg-[#C9A96E] text-[#0A1628]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }
                `}
              >
                {tab === 'overview' && '概览'}
                {tab === 'tiers' && '会员等级'}
                {tab === 'history' && '交易记录'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Current Tier Info */}
              <div className="bg-white/5 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">当前权益</h3>
                  <span className="px-3 py-1 bg-[#C9A96E]/20 text-[#C9A96E] rounded-full text-sm">
                    {TIER_CONFIG[currentTier].name}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <Gift className="w-6 h-6 text-[#C9A96E] mb-2" />
                    <p className="text-white font-medium">LinkedIn 授权</p>
                    <p className="text-2xl font-bold text-[#C9A96E]">+{TIER_CONFIG[currentTier].facRewards.linkedinAuth}</p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <Wallet className="w-6 h-6 text-[#C9A96E] mb-2" />
                    <p className="text-white font-medium">深度解码</p>
                    <p className="text-2xl font-bold text-white">{TIER_CONFIG[currentTier].facCosts.deepDecode} $FAC</p>
                  </div>
                </div>
              </div>

              {/* Invite Codes (Executive only) */}
              {currentTier === 'executive' && <InviteCodeGenerator />}
            </div>
          )}

          {activeTab === 'tiers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['basic', 'professional', 'executive'] as MembershipTier[]).map(tier => (
                <TierCard
                  key={tier}
                  tier={tier}
                  isCurrent={currentTier === tier}
                  onSelect={() => setCurrentTier(tier)}
                />
              ))}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>暂无交易记录</p>
                </div>
              ) : (
                transactions.map(tx => (
                  <TransactionItem key={tx.id} tx={tx} />
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
