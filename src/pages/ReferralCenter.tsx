/**
 * FAC Platform V5.1 - 推荐中心
 * 用户扩散激励机制界面
 */

import { useState } from 'react';
import { useReferral } from '../contexts/ReferralContext';
import { useFac } from '../contexts/FacContext';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import BottomNav from '../components/BottomNav';
import {
  Share2, QrCode, Link2, Users, Gift, TrendingUp,
  Copy, CheckCircle, Mail, MessageCircle, ChevronRight,
  Award, Star, Zap
} from 'lucide-react';

export default function ReferralCenter() {
  const { 
    myReferralCode, 
    referralLink, 
    stats,
    generateReferralCode 
  } = useReferral();
  const { wallet } = useFac();
  
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'rewards' | 'network'>('share');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 奖励配置说明
  const rewardTiers = [
    {
      title: '直接推荐',
      reward: 100,
      description: '成功推荐新用户注册',
      icon: Users,
      color: '#64B5F6',
    },
    {
      title: '间接推荐',
      reward: 30,
      description: '您推荐的用户再推荐他人',
      icon: Share2,
      color: '#81C784',
    },
    {
      title: '首单奖励',
      reward: 50,
      description: '被推荐人完成首笔交易',
      icon: Gift,
      color: '#C9A96E',
    },
    {
      title: '发布需求',
      reward: 50,
      description: '发布真实招聘需求',
      icon: Star,
      color: '#FFB74D',
    },
    {
      title: '完善资料',
      reward: 80,
      description: '完善专家/企业资料',
      icon: Award,
      color: '#9575CD',
    },
    {
      title: '招聘成功',
      reward: 200,
      description: '成功匹配并完成交易',
      icon: Zap,
      color: '#4CAF50',
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">推荐中心</h1>
            <p className="text-gray-400">邀请好友，赚取 $FAC 积分</p>
          </div>

          {/* 我的推荐码卡片 */}
          <div className="bg-gradient-to-br from-[#C9A96E]/20 to-[#0A1628] rounded-2xl p-6 border border-[#C9A96E]/30 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#C9A96E]" />
                我的专属推荐码
              </h2>
              <button
                onClick={generateReferralCode}
                className="text-xs text-[#C9A96E] hover:underline"
              >
                更换推荐码
              </button>
            </div>

            <div className="bg-black/30 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <code className="text-2xl font-mono text-[#C9A96E] tracking-wider">
                  {myReferralCode}
                </code>
                <button
                  onClick={() => copyToClipboard(myReferralCode)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg text-sm hover:bg-[#C9A96E]/20 transition-colors"
                >
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? '已复制' : '复制'}
                </button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">推荐链接</span>
                  <button
                    onClick={() => copyToClipboard(referralLink)}
                    className="flex items-center gap-1 text-[#C9A96E] hover:underline"
                  >
                    <Link2 className="w-4 h-4" />
                    复制链接
                  </button>
                </div>
                <code className="block text-xs text-gray-500 truncate">
                  {referralLink}
                </code>
              </div>
            </div>

            {/* 快捷分享按钮 */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { icon: MessageCircle, label: '微信', color: '#07C160' },
                { icon: Mail, label: '邮件', color: '#EA4335' },
                { icon: QrCode, label: '二维码', color: '#C9A96E' },
                { icon: Share2, label: '更多', color: '#64B5F6' },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                  <span className="text-xs text-gray-400">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 统计卡片 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#C9A96E]">{stats.totalReferrals}</p>
              <p className="text-xs text-gray-400">总推荐</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.completedReferrals}</p>
              <p className="text-xs text-gray-400">成功注册</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">{stats.pendingReferrals}</p>
              <p className="text-xs text-gray-400">待完成</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.totalEarned}</p>
              <p className="text-xs text-gray-400">已获得 $FAC</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['share', 'rewards', 'network'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-[#C9A96E] text-[#0A1628]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tab === 'share' && '邀请好友'}
                {tab === 'rewards' && '奖励明细'}
                {tab === 'network' && '我的网络'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'share' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">如何获得奖励</h3>
              <div className="grid gap-3">
                {rewardTiers.map((tier) => (
                  <div 
                    key={tier.title}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-colors"
                  >
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: `${tier.color}20` }}
                    >
                      <tier.icon className="w-6 h-6" style={{ color: tier.color }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-white">{tier.title}</h4>
                        <span className="text-lg font-bold" style={{ color: tier.color }}>
                          +{tier.reward} $FAC
                        </span>
                      </div>
                      <p className="text-sm text-gray-400">{tier.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="text-center py-12 text-gray-400">
              <Gift className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>奖励记录功能即将上线</p>
              <p className="text-sm mt-2">您的推荐奖励将自动发放到钱包</p>
            </div>
          )}

          {activeTab === 'network' && (
            <div className="text-center py-12 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p>推荐网络功能即将上线</p>
              <p className="text-sm mt-2">查看您的二级分销网络</p>
            </div>
          )}

          {/* 说明 */}
          <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
            <h4 className="text-sm font-medium text-blue-400 mb-2">关于 $FAC 积分</h4>
            <ul className="text-xs text-gray-400 space-y-1">
              <li>• $FAC 为平台积分，仅限平台内使用，不可提现或转账</li>
              <li>• 平台每季度将使用 30% 收入回购 $FAC 并销毁</li>
              <li>• 积分有效期为 365 天，请及时使用</li>
              <li>• 详细规则请查看《$FAC 经济白皮书》</li>
            </ul>
          </div>
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
