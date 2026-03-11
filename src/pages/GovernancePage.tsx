/**
 * FAC Platform V5.1 - Governance Page
 * 去中心化治理：提案列表、投票、创建提案
 */

import { useState } from 'react';
import { useGovernance } from '../contexts/GovernanceContext';
import { useFac } from '../contexts/FacContext';
import type { ProposalCategory, Proposal } from '../types/web3';
import type { MembershipTier } from '../types/user';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import BottomNav from '../components/BottomNav';
import {
  Vote, Plus, Clock, CheckCircle, XCircle, Users, TrendingUp,
  ChevronRight, Shield, AlertCircle, FileText, BarChart3,
  Calendar, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

// ==================== Components ====================

function ProposalCard({ 
  proposal, 
  hasVoted, 
  myVote,
  onVote 
}: { 
  proposal: Proposal; 
  hasVoted: boolean;
  myVote?: { choice: 'for' | 'against' | 'abstain'; votingPower: number };
  onVote: (proposalId: string, choice: 'for' | 'against' | 'abstain') => void;
}) {
  const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
  const forPercent = totalVotes > 0 ? (proposal.votesFor / totalVotes) * 100 : 0;
  const againstPercent = totalVotes > 0 ? (proposal.votesAgainst / totalVotes) * 100 : 0;
  const abstainPercent = totalVotes > 0 ? (proposal.votesAbstain / totalVotes) * 100 : 0;
  
  const isActive = proposal.status === 'active';
  const isEnded = new Date() > new Date(proposal.votingEnd);
  
  const categoryLabels: Record<ProposalCategory, string> = {
    platform_fee: '平台费用',
    skill_category: '智慧支柱',
    treasury: '国库管理',
    partnership: '合作伙伴',
    technical: '技术升级',
  };
  
  const statusConfig = {
    draft: { icon: FileText, color: 'text-gray-400', bg: 'bg-gray-500/10', label: '草稿' },
    active: { icon: Vote, color: 'text-[#C9A96E]', bg: 'bg-[#C9A96E]/10', label: '投票中' },
    passed: { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/10', label: '已通过' },
    rejected: { icon: XCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: '已拒绝' },
    executed: { icon: Shield, color: 'text-blue-400', bg: 'bg-blue-500/10', label: '已执行' },
    cancelled: { icon: AlertCircle, color: 'text-gray-400', bg: 'bg-gray-500/10', label: '已取消' },
  };
  
  const StatusIcon = statusConfig[proposal.status].icon;
  
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 hover:border-[#C9A96E]/30 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 rounded text-xs font-medium ${statusConfig[proposal.status].bg} ${statusConfig[proposal.status].color}`}>
              {categoryLabels[proposal.category]}
            </span>
            <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${statusConfig[proposal.status].bg} ${statusConfig[proposal.status].color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig[proposal.status].label}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{proposal.title}</h3>
          <p className="text-sm text-gray-400 line-clamp-2">{proposal.description}</p>
        </div>
      </div>
      
      {/* Voting Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
          <span>投票进度</span>
          <span>{totalVotes.toLocaleString()} $FAC 参与</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500" style={{ width: `${forPercent}%` }} />
          <div className="h-full bg-red-500" style={{ width: `${againstPercent}%` }} />
          <div className="h-full bg-gray-500" style={{ width: `${abstainPercent}%` }} />
        </div>
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-green-400">赞同 {forPercent.toFixed(1)}%</span>
          <span className="text-red-400">反对 {againstPercent.toFixed(1)}%</span>
          <span className="text-gray-400">弃权 {abstainPercent.toFixed(1)}%</span>
        </div>
      </div>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {isEnded ? '已结束' : `截止 ${new Date(proposal.votingEnd).toLocaleDateString('zh-HK')}`}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            参与率 {((totalVotes / proposal.totalVotingPower) * 100).toFixed(1)}%
          </span>
        </div>
        
        {isActive && !hasVoted && !isEnded && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onVote(proposal.id, 'for')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
              赞同
            </button>
            <button
              onClick={() => onVote(proposal.id, 'against')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
            >
              <ArrowDown className="w-4 h-4" />
              反对
            </button>
            <button
              onClick={() => onVote(proposal.id, 'abstain')}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 transition-colors"
            >
              <Minus className="w-4 h-4" />
              弃权
            </button>
          </div>
        )}
        
        {hasVoted && (
          <span className={`text-xs px-3 py-1.5 rounded-lg ${
            myVote?.choice === 'for' ? 'bg-green-500/20 text-green-400' :
            myVote?.choice === 'against' ? 'bg-red-500/20 text-red-400' :
            'bg-gray-500/20 text-gray-400'
          }`}>
            已投票 · {myVote?.choice === 'for' ? '赞同' : myVote?.choice === 'against' ? '反对' : '弃权'} · {myVote?.votingPower} $FAC
          </span>
        )}
      </div>
    </div>
  );
}

function CreateProposalModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  userTier,
  facBalance
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (title: string, description: string, category: ProposalCategory) => void;
  userTier: MembershipTier;
  facBalance: number;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ProposalCategory>('platform_fee');
  
  if (!isOpen) return null;
  
  const canCreate = userTier === 'executive' && facBalance >= 1000;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0A1628] rounded-2xl border border-[#C9A96E]/30 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">创建治理提案</h2>
          <p className="text-sm text-gray-400 mt-1">Executive 专属权益 · 需持有 1000 $FAC</p>
        </div>
        
        {!canCreate ? (
          <div className="p-8 text-center">
            <Shield className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">权限不足</h3>
            <p className="text-gray-400 mb-4">
              {userTier !== 'executive' 
                ? '只有 Executive 合夥人可以创建治理提案' 
                : `需要至少 1000 $FAC 才能创建提案（当前 ${facBalance} $FAC）`}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              关闭
            </button>
          </div>
        ) : (
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">提案类别</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProposalCategory)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A96E]"
              >
                <option value="platform_fee">平台费用</option>
                <option value="skill_category">智慧支柱</option>
                <option value="treasury">国库管理</option>
                <option value="partnership">合作伙伴</option>
                <option value="technical">技术升级</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">提案标题</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="简要描述提案内容"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A96E]"
              />
            </div>
            
            <div>
              <label className="block text-sm text-gray-400 mb-2">详细描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="详细说明提案的背景、理由和预期效果..."
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-[#C9A96E] resize-none"
              />
            </div>
            
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => {
                  onSubmit(title, description, category);
                  setTitle('');
                  setDescription('');
                  onClose();
                }}
                disabled={!title.trim() || !description.trim()}
                className="flex-1 py-3 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                创建提案
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== Main Page ====================

export default function GovernancePage() {
  const { 
    proposals, 
    myVotes, 
    hasVoted, 
    castVote, 
    createProposal,
    getStats,
    isLoading
  } = useGovernance();
  const { wallet } = useFac();
  
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'mine'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Demo: 模拟当前用户是 executive
  const [userTier] = useState<MembershipTier>('executive');
  
  const stats = getStats();
  
  const filteredProposals = proposals.filter(p => {
    if (filter === 'active') return p.status === 'active';
    if (filter === 'passed') return p.status === 'passed' || p.status === 'executed';
    if (filter === 'mine') return p.proposerId === 'current_user';
    return true;
  });
  
  const handleVote = async (proposalId: string, choice: 'for' | 'against' | 'abstain') => {
    try {
      await castVote(proposalId, choice);
    } catch (err) {
      alert(err instanceof Error ? err.message : '投票失败');
    }
  };
  
  const handleCreateProposal = async (title: string, description: string, category: ProposalCategory) => {
    try {
      await createProposal(title, description, category);
      alert('提案创建成功！');
    } catch (err) {
      alert(err instanceof Error ? err.message : '创建失败');
    }
  };

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">去中心化治理</h1>
            <p className="text-gray-400">Executive 合夥人共同决策平台发展方向</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#C9A96E]">{stats.totalProposals}</p>
              <p className="text-xs text-gray-400">总提案</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">{stats.activeProposals}</p>
              <p className="text-xs text-gray-400">进行中</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{(stats.participationRate * 100).toFixed(1)}%</p>
              <p className="text-xs text-gray-400">参与率</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#C9A96E]">{stats.memberCount.toLocaleString()}</p>
              <p className="text-xs text-gray-400">治理成员</p>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              {(['all', 'active', 'passed', 'mine'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === f 
                      ? 'bg-[#C9A96E] text-[#0A1628]' 
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {f === 'all' && '全部'}
                  {f === 'active' && '进行中'}
                  {f === 'passed' && '已通过'}
                  {f === 'mine' && '我的'}
                </button>
              ))}
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              创建提案
            </button>
          </div>
          
          {/* Proposals List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                <div className="w-8 h-8 border-2 border-[#C9A96E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                加载中...
              </div>
            ) : filteredProposals.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Vote className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>暂无提案</p>
              </div>
            ) : (
              filteredProposals.map(proposal => (
                <ProposalCard
                  key={proposal.id}
                  proposal={proposal}
                  hasVoted={hasVoted(proposal.id)}
                  myVote={myVotes[proposal.id]}
                  onVote={handleVote}
                />
              ))
            )}
          </div>
          
          {/* Treasury Info */}
          <div className="mt-8 p-6 bg-gradient-to-br from-[#C9A96E]/10 to-transparent rounded-2xl border border-[#C9A96E]/20">
            <div className="flex items-center gap-3 mb-4">
              <BarChart3 className="w-6 h-6 text-[#C9A96E]" />
              <h3 className="text-lg font-bold text-white">国库概览</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">国库余额</p>
                <p className="text-2xl font-bold text-[#C9A96E]">{stats.treasuryBalance.toLocaleString()} $FAC</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">本月支出</p>
                <p className="text-2xl font-bold text-white">45,000 $FAC</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              所有法币收费余额全数拨入「香港专业人才传承基金」
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateProposal}
        userTier={userTier}
        facBalance={wallet.balance}
      />
    </div>
  );
}
