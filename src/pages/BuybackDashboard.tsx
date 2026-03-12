/**
 * FAC Platform V5.1 - 回购透明度仪表板
 * 公开透明的 $FAC 回购与销毁数据
 */

import { useState } from 'react';
import { useBuyback } from '../contexts/BuybackContext';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import BottomNav from '../components/BottomNav';
import {
  TrendingDown, Flame, Wallet, Calendar, ArrowUpRight,
  ExternalLink, Info, ChevronDown, ChevronUp, Shield,
  BarChart3, PieChart, Activity
} from 'lucide-react';
import type { BuybackRecord } from '../types/economy';

function BuybackCard({ record }: { record: BuybackRecord }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
      <div 
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#C9A96E]/10 flex items-center justify-center">
            <TrendingDown className="w-5 h-5 text-[#C9A96E]" />
          </div>
          <div>
            <h3 className="font-bold text-white">{record.quarter} 回购</h3>
            <p className="text-xs text-gray-400">
              执行日期: {new Date(record.executedAt).toLocaleDateString('zh-HK')}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-lg font-bold text-[#C9A96E]">
              HKD {record.facPrice.toFixed(3)}
            </p>
            <p className="text-xs text-gray-400">回购价格</p>
          </div>
          {expanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/10">
          <div className="grid grid-cols-2 gap-4 py-4">
            <div>
              <p className="text-xs text-gray-400 mb-1">平台收入</p>
              <p className="text-white font-medium">HKD {record.totalRevenue.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">回购池 (30%)</p>
              <p className="text-[#C9A96E] font-medium">HKD {record.buybackPool.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">回购数量</p>
              <p className="text-white font-medium">{record.totalBuyback.toLocaleString()} $FAC</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">销毁数量</p>
              <p className="text-red-400 font-medium">{record.totalBurned.toLocaleString()} $FAC</p>
            </div>
          </div>
          
          {record.txHash && (
            <a
              href={`https://etherscan.io/tx/${record.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-xs text-[#C9A96E] hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              查看链上交易: {record.txHash.slice(0, 20)}...
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function BuybackDashboard() {
  const { 
    buybackHistory, 
    metrics, 
    nextBuyback, 
    userHoldings,
    getTransparencyReport 
  } = useBuyback();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'mechanism'>('overview');
  const report = getTransparencyReport();

  // 计算市值
  const marketCap = metrics.circulatingSupply * (metrics.buybackReserve / metrics.circulatingSupply);

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#C9A96E]/10 rounded-full text-[#C9A96E] text-sm mb-4">
              <Shield className="w-4 h-4" />
              100% 透明可验证
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">$FAC 回购透明度</h1>
            <p className="text-gray-400">平台收入的 30% 用于回购并销毁 $FAC</p>
          </div>

          {/* 下一次回购预告 */}
          <div className="bg-gradient-to-r from-[#C9A96E]/20 to-transparent rounded-2xl p-6 border border-[#C9A96E]/30 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#C9A96E]" />
                下一次回购预告
              </h2>
              <span className="text-sm text-[#C9A96E]">{nextBuyback.scheduledDate}</span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">预计回购池</p>
                <p className="text-xl font-bold text-[#C9A96E]">
                  HKD {nextBuyback.estimatedPool.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">预计回购价</p>
                <p className="text-xl font-bold text-white">
                  HKD {nextBuyback.projectedPrice.toFixed(3)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">距回购还有</p>
                <p className="text-xl font-bold text-white">约 30 天</p>
              </div>
            </div>
          </div>

          {/* 我的持仓 */}
          <div className="bg-white/5 rounded-2xl p-6 border border-white/10 mb-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-[#C9A96E]" />
              我的 $FAC 持仓
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-1">当前余额</p>
                <p className="text-2xl font-bold text-white">{userHoldings.balance.toLocaleString()}</p>
                <p className="text-xs text-[#C9A96E]">$FAC</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">预估价值</p>
                <p className="text-2xl font-bold text-[#C9A96E]">
                  HKD {userHoldings.estimatedValue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-400">基于最新回购价</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">持仓排名</p>
                <p className="text-2xl font-bold text-white">Top 5%</p>
                <p className="text-xs text-gray-400">超越 95% 用户</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">参与资格</p>
                <p className={`text-2xl font-bold ${userHoldings.participationEligible ? 'text-green-400' : 'text-gray-400'}`}>
                  {userHoldings.participationEligible ? '已达标' : '未达标'}
                </p>
                <p className="text-xs text-gray-400">需 ≥ 1000 $FAC</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            {(['overview', 'history', 'mechanism'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-[#C9A96E] text-[#0A1628]' 
                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                }`}
              >
                {tab === 'overview' && '总览'}
                {tab === 'history' && '回购历史'}
                {tab === 'mechanism' && '回购机制'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* 经济指标 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <BarChart3 className="w-6 h-6 text-[#C9A96E] mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(metrics.totalSupply / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-400">总供应量</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Activity className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(metrics.circulatingSupply / 1000000).toFixed(1)}M</p>
                  <p className="text-xs text-gray-400">流通量</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <Flame className="w-6 h-6 text-red-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{(metrics.burnedSupply / 1000).toFixed(0)}K</p>
                  <p className="text-xs text-gray-400">已销毁</p>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center">
                  <PieChart className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{metrics.activeUsers.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">活跃用户</p>
                </div>
              </div>

              {/* 累计统计 */}
              <div className="bg-gradient-to-br from-white/5 to-transparent rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold text-white mb-4">累计透明度报告</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">平台累计收入</p>
                    <p className="text-2xl font-bold text-[#C9A96E]">
                      HKD {report.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">累计回购 $FAC</p>
                    <p className="text-2xl font-bold text-white">
                      {report.totalBuyback.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">累计销毁 $FAC</p>
                    <p className="text-2xl font-bold text-red-400">
                      {report.totalBurned.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">平均回购价格</p>
                    <p className="text-2xl font-bold text-white">
                      HKD {report.averagePrice.toFixed(3)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-white mb-4">历史回购记录</h3>
              {buybackHistory.map(record => (
                <BuybackCard key={record.id} record={record} />
              ))}
            </div>
          )}

          {activeTab === 'mechanism' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white mb-4">回购机制说明</h3>
              
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-medium text-[#C9A96E] mb-2">1. 回购资金来源</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• 平台手续费收入: 40%</li>
                  <li>• 会员订阅收入: 35%</li>
                  <li>• 托管利息收入: 25%</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-medium text-[#C9A96E] mb-2">2. 回购执行规则</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• 每季度执行一次（1月/4月/7月/10月）</li>
                  <li>• 回购金额为季度收入的 30%</li>
                  <li>• 价格基于市场供需动态调整</li>
                  <li>• 波动上限为 ±20%</li>
                </ul>
              </div>

              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="font-medium text-[#C9A96E] mb-2">3. 销毁机制</h4>
                <ul className="text-sm text-gray-400 space-y-2">
                  <li>• 回购的 $FAC 50% 销毁，50% 进入储备池</li>
                  <li>• 销毁交易在以太坊主网公开可查</li>
                  <li>• 销毁后总供应量永久减少</li>
                </ul>
              </div>

              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  透明度承诺
                </h4>
                <p className="text-sm text-gray-400">
                  FAC Platform 承诺所有回购操作公开透明。每笔回购交易都会在以太坊区块链上记录，
                  任何人都可以通过交易哈希验证。季度财务报告将由第三方审计机构审核并公布。
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
      <BottomNav />
    </div>
  );
}
