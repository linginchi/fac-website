/**
 * FAC Platform V5.1 - Governance (DAO) Context
 * 去中心化治理：提案、投票、执行
 */

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Proposal, Vote, ProposalStatus, ProposalCategory, GovernanceStats } from '../types/web3';
import { GOVERNANCE_CONSTANTS } from '../types/web3';
import { useFac } from './FacContext';
import type { MembershipTier } from '../types/user';

// ==================== Constants ====================

const PROPOSALS_STORAGE_KEY = 'fac_governance_proposals_v51';
const VOTES_STORAGE_KEY = 'fac_governance_votes_v51';

// ==================== Mock Proposals ====================

const MOCK_PROPOSALS: Proposal[] = [
  {
    id: 'prop_001',
    proposerId: 'user_executive_001',
    title: '调整深度解码 $FAC 消耗费用',
    description: '建议将深度解码的费用从 50 $FAC 调整至 40 $FAC，以提高平台活跃度。此调整预计将使平台交易量提升 15%。',
    category: 'platform_fee',
    status: 'active',
    votingStart: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    votingEnd: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: GOVERNANCE_CONSTANTS.QUORUM_PERCENTAGE,
    threshold: GOVERNANCE_CONSTANTS.PASS_THRESHOLD,
    votesFor: 12500,
    votesAgainst: 3200,
    votesAbstain: 800,
    totalVotingPower: 50000,
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prop_002',
    proposerId: 'user_executive_002',
    title: '新增「ESG 咨询」智慧支柱',
    description: '建议新增 ESG（环境、社会、治理）咨询作为第九大智慧支柱，涵盖碳足迹评估、可持续发展策略、社会责任报告等专业领域。',
    category: 'skill_category',
    status: 'active',
    votingStart: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votingEnd: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: GOVERNANCE_CONSTANTS.QUORUM_PERCENTAGE,
    threshold: GOVERNANCE_CONSTANTS.PASS_THRESHOLD,
    votesFor: 8500,
    votesAgainst: 1200,
    votesAbstain: 300,
    totalVotingPower: 50000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'prop_003',
    proposerId: 'user_executive_003',
    title: '将平台维护费拨入传承基金',
    description: '提案将平台收取的固定维护费（HKD 50/笔）在扣除云服务器成本后，全数拨入「香港专业人才传承基金」。',
    category: 'treasury',
    status: 'passed',
    votingStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    votingEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    quorum: GOVERNANCE_CONSTANTS.QUORUM_PERCENTAGE,
    threshold: GOVERNANCE_CONSTANTS.PASS_THRESHOLD,
    votesFor: 35000,
    votesAgainst: 2000,
    votesAbstain: 1500,
    totalVotingPower: 50000,
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    executionData: '0x...',
  },
];

// ==================== Types ====================

interface GovernanceContextValue {
  // 状态
  proposals: Proposal[];
  myVotes: Record<string, Vote>; // proposalId -> Vote
  isLoading: boolean;
  
  // 查询
  getProposal: (id: string) => Proposal | undefined;
  getActiveProposals: () => Proposal[];
  getProposalVotes: (proposalId: string) => Vote[];
  hasVoted: (proposalId: string) => boolean;
  getVotingPower: (userTier: MembershipTier, facBalance: number) => number;
  getStats: () => GovernanceStats;
  
  // 操作
  createProposal: (title: string, description: string, category: ProposalCategory) => Promise<Proposal>;
  castVote: (proposalId: string, choice: 'for' | 'against' | 'abstain', reason?: string) => Promise<void>;
  executeProposal: (proposalId: string) => Promise<void>;
  
  // 计算投票结果
  calculateResult: (proposal: Proposal) => { passed: boolean; turnout: number };
}

// ==================== Helper Functions ====================

function loadProposalsFromStorage(): Proposal[] {
  try {
    const stored = localStorage.getItem(PROPOSALS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return MOCK_PROPOSALS;
}

function loadVotesFromStorage(): Record<string, Vote> {
  try {
    const stored = localStorage.getItem(VOTES_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // Ignore
  }
  return {};
}

function generateId(): string {
  return `prop_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// ==================== Context ====================

const GovernanceContext = createContext<GovernanceContextValue | null>(null);

// ==================== Provider ====================

interface GovernanceProviderProps {
  children: React.ReactNode;
  userId?: string;
  userTier?: MembershipTier;
}

export function GovernanceProvider({ 
  children, 
  userId = 'anonymous',
  userTier = 'basic'
}: GovernanceProviderProps) {
  const { wallet, getBalance } = useFac();
  const [proposals, setProposals] = useState<Proposal[]>(() => loadProposalsFromStorage());
  const [myVotes, setMyVotes] = useState<Record<string, Vote>>(() => loadVotesFromStorage());
  const [isLoading, setIsLoading] = useState(false);

  // Persist to storage
  useEffect(() => {
    localStorage.setItem(PROPOSALS_STORAGE_KEY, JSON.stringify(proposals));
  }, [proposals]);

  useEffect(() => {
    localStorage.setItem(VOTES_STORAGE_KEY, JSON.stringify(myVotes));
  }, [myVotes]);

  // Get proposal by ID
  const getProposal = useCallback((id: string): Proposal | undefined => {
    return proposals.find(p => p.id === id);
  }, [proposals]);

  // Get active proposals
  const getActiveProposals = useCallback((): Proposal[] => {
    return proposals.filter(p => p.status === 'active');
  }, [proposals]);

  // Get votes for a proposal (mock)
  const getProposalVotes = useCallback((proposalId: string): Vote[] => {
    // 模拟返回一些投票
    return Object.values(myVotes).filter(v => v.proposalId === proposalId);
  }, [myVotes]);

  // Check if user has voted
  const hasVoted = useCallback((proposalId: string): boolean => {
    return !!myVotes[proposalId];
  }, [myVotes]);

  // Calculate voting power
  const getVotingPower = useCallback((tier: MembershipTier, facBalance: number): number => {
    // Executive: 1 $FAC = 1.5 票
    // Professional: 1 $FAC = 1.2 票
    // Basic: 1 $FAC = 1 票
    const multiplier = tier === 'executive' ? 1.5 : tier === 'professional' ? 1.2 : 1;
    return Math.floor(facBalance * multiplier);
  }, []);

  // Get governance stats
  const getStats = useCallback((): GovernanceStats => {
    const activeProposals = proposals.filter(p => p.status === 'active').length;
    const totalProposals = proposals.length;
    
    // 计算参与率
    const totalVotes = proposals.reduce((acc, p) => acc + p.votesFor + p.votesAgainst + p.votesAbstain, 0);
    const participationRate = totalProposals > 0 ? totalVotes / (totalProposals * 50000) : 0;
    
    return {
      totalProposals,
      activeProposals,
      participationRate: Math.min(participationRate, 1),
      treasuryBalance: 1250000, // 模拟国库余额
      memberCount: 2847, // 模拟成员数
    };
  }, [proposals]);

  // Create proposal (Executive only)
  const createProposal = useCallback(async (
    title: string,
    description: string,
    category: ProposalCategory
  ): Promise<Proposal> => {
    if (userTier !== 'executive') {
      throw new Error('Only Executive members can create proposals');
    }
    
    const minBalance = GOVERNANCE_CONSTANTS.MIN_PROPOSAL_THRESHOLD;
    if (wallet.balance < minBalance) {
      throw new Error(`Minimum ${minBalance} $FAC required to create proposal`);
    }
    
    setIsLoading(true);
    
    try {
      const now = new Date();
      const votingStart = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1天后开始
      const votingEnd = new Date(votingStart.getTime() + GOVERNANCE_CONSTANTS.VOTING_PERIOD_DAYS * 24 * 60 * 60 * 1000);
      
      const newProposal: Proposal = {
        id: generateId(),
        proposerId: userId,
        title,
        description,
        category,
        status: 'active',
        votingStart: votingStart.toISOString(),
        votingEnd: votingEnd.toISOString(),
        quorum: GOVERNANCE_CONSTANTS.QUORUM_PERCENTAGE,
        threshold: GOVERNANCE_CONSTANTS.PASS_THRESHOLD,
        votesFor: 0,
        votesAgainst: 0,
        votesAbstain: 0,
        totalVotingPower: 0,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      
      setProposals(prev => [newProposal, ...prev]);
      return newProposal;
    } finally {
      setIsLoading(false);
    }
  }, [userTier, userId, wallet.balance]);

  // Cast vote
  const castVote = useCallback(async (
    proposalId: string,
    choice: 'for' | 'against' | 'abstain',
    reason?: string
  ): Promise<void> => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    if (proposal.status !== 'active') {
      throw new Error('Voting is closed for this proposal');
    }
    
    if (new Date() > new Date(proposal.votingEnd)) {
      throw new Error('Voting period has ended');
    }
    
    if (hasVoted(proposalId)) {
      throw new Error('You have already voted on this proposal');
    }
    
    setIsLoading(true);
    
    try {
      const votingPower = getVotingPower(userTier, wallet.balance);
      
      const vote: Vote = {
        id: `vote_${Date.now()}`,
        proposalId,
        voterId: userId,
        voterAddress: `0x${userId}`,
        choice,
        votingPower,
        reason,
        timestamp: new Date().toISOString(),
        txHash: `0x${Array(64).fill(0).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')}`,
      };
      
      setMyVotes(prev => ({ ...prev, [proposalId]: vote }));
      
      // 更新提案投票数
      setProposals(prev => prev.map(p => {
        if (p.id !== proposalId) return p;
        return {
          ...p,
          votesFor: choice === 'for' ? p.votesFor + votingPower : p.votesFor,
          votesAgainst: choice === 'against' ? p.votesAgainst + votingPower : p.votesAgainst,
          votesAbstain: choice === 'abstain' ? p.votesAbstain + votingPower : p.votesAbstain,
          totalVotingPower: p.totalVotingPower + votingPower,
          updatedAt: new Date().toISOString(),
        };
      }));
    } finally {
      setIsLoading(false);
    }
  }, [proposals, userTier, wallet.balance, userId, getVotingPower, hasVoted]);

  // Execute proposal
  const executeProposal = useCallback(async (proposalId: string): Promise<void> => {
    const proposal = proposals.find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error('Proposal not found');
    }
    
    if (proposal.status !== 'active') {
      throw new Error('Proposal is not active');
    }
    
    const result = calculateResult(proposal);
    if (!result.passed) {
      throw new Error('Proposal did not pass');
    }
    
    setIsLoading(true);
    
    try {
      // 模拟执行延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setProposals(prev => prev.map(p => {
        if (p.id !== proposalId) return p;
        return {
          ...p,
          status: 'executed',
          executedAt: new Date().toISOString(),
          executedTxHash: `0x${Array(64).fill(0).map(() => '0123456789ABCDEF'[Math.floor(Math.random() * 16)]).join('')}`,
          updatedAt: new Date().toISOString(),
        };
      }));
    } finally {
      setIsLoading(false);
    }
  }, [proposals]);

  // Calculate result
  const calculateResult = useCallback((proposal: Proposal): { passed: boolean; turnout: number } => {
    const totalVotes = proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain;
    const turnout = totalVotes / proposal.totalVotingPower;
    
    // 检查参与率
    if (turnout < proposal.quorum) {
      return { passed: false, turnout };
    }
    
    // 检查通过率
    const forPercentage = proposal.votesFor / (proposal.votesFor + proposal.votesAgainst);
    return { passed: forPercentage >= proposal.threshold, turnout };
  }, []);

  const value: GovernanceContextValue = {
    proposals,
    myVotes,
    isLoading,
    getProposal,
    getActiveProposals,
    getProposalVotes,
    hasVoted,
    getVotingPower,
    getStats,
    createProposal,
    castVote,
    executeProposal,
    calculateResult,
  };

  return (
    <GovernanceContext.Provider value={value}>
      {children}
    </GovernanceContext.Provider>
  );
}

// ==================== Hook ====================

export function useGovernance() {
  const context = useContext(GovernanceContext);
  if (!context) {
    throw new Error('useGovernance must be used within GovernanceProvider');
  }
  return context;
}
