/**
 * FAC Platform V5.1 - Web3 Types
 * 去中心化存储、区块链钱包、治理投票类型定义
 */

// ==================== Decentralized Storage (IPFS/Arweave) ====================

export type StorageProvider = 'ipfs' | 'arweave' | 'local';

export interface VaultItem {
  id: string;
  userId: string;
  type: 'credential' | 'experience' | 'portfolio' | 'certificate' | 'contact';
  title: string;
  content: string;
  encrypted: boolean;
  encryptionMethod?: 'aes-256-gcm' | 'rsa-4096';
  storageProvider: StorageProvider;
  cid?: string; // IPFS Content Identifier
  arweaveTxId?: string; // Arweave Transaction ID
  createdAt: string;
  updatedAt: string;
  accessLog: AccessRecord[];
}

export interface AccessRecord {
  id: string;
  accessorId: string;
  accessorType: 'owner' | 'authorized' | 'system';
  action: 'read' | 'write' | 'delete' | 'share';
  timestamp: string;
  txHash?: string; // 区块链存证哈希
}

export interface ColdWalletExport {
  version: string;
  exportedAt: string;
  userId: string;
  encryptedData: string; // RSA加密后的JSON
  checksum: string;
  signature?: string; // 数字签名
}

// ==================== Blockchain Wallet ====================

export type ChainType = 'ethereum' | 'solana' | 'bitcoin' | 'fac-chain';
export type WalletType = 'metamask' | 'walletconnect' | 'phantom' | 'hardware';

export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrl: 'https://etherscan.io',
  },
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://eth-sepolia.g.alchemy.com/v2/demo',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    blockExplorerUrl: 'https://sepolia.etherscan.io',
  },
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    blockExplorerUrl: 'https://polygonscan.com',
  },
};

export interface WalletConnection {
  address: string;
  chainType: ChainType;
  walletType: WalletType;
  connectedAt: string;
  isConnected: boolean;
  balance: Record<string, string>; // token symbol -> balance
}

export interface Web3Transaction {
  id: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  gasUsed?: string;
  gasPrice?: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: string;
  type: 'transfer' | 'contract_call' | 'token_approve' | 'vault_store';
  description: string;
}

// ==================== Governance (DAO) ====================

export type ProposalStatus = 'draft' | 'active' | 'passed' | 'rejected' | 'executed' | 'cancelled';
export type ProposalCategory = 'platform_fee' | 'skill_category' | 'treasury' | 'partnership' | 'technical';

export interface Proposal {
  id: string;
  proposerId: string;
  title: string;
  description: string;
  category: ProposalCategory;
  status: ProposalStatus;
  
  // 投票参数
  votingStart: string;
  votingEnd: string;
  quorum: number; // 最低参与率 (如 0.1 = 10%)
  threshold: number; // 通过门槛 (如 0.5 = 50%)
  
  // 投票结果
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  totalVotingPower: number;
  
  // 执行参数
  executionData?: string; // 链上执行数据
  executedAt?: string;
  executedTxHash?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  voterId: string;
  voterAddress: string;
  choice: 'for' | 'against' | 'abstain';
  votingPower: number; // 基于 $FAC 持仓和 Executive 等级
  reason?: string;
  timestamp: string;
  txHash?: string;
}

export interface GovernanceStats {
  totalProposals: number;
  activeProposals: number;
  participationRate: number;
  treasuryBalance: number;
  memberCount: number;
}

// ==================== Smart Contract Interfaces ====================

export interface VaultContract {
  // 存储凭证到链上
  storeCredential: (hash: string, metadata: string) => Promise<string>;
  // 授权访问
  grantAccess: (to: string, itemId: string, expiry: number) => Promise<string>;
  // 撤销授权
  revokeAccess: (to: string, itemId: string) => Promise<string>;
  // 验证访问权限
  verifyAccess: (accessor: string, itemId: string) => Promise<boolean>;
}

export interface GovernanceContract {
  // 创建提案
  createProposal: (title: string, description: string, category: ProposalCategory, executionData: string) => Promise<string>;
  // 投票
  castVote: (proposalId: string, choice: 'for' | 'against' | 'abstain', reason?: string) => Promise<string>;
  // 执行通过的提案
  executeProposal: (proposalId: string) => Promise<string>;
  // 委托投票权
  delegate: (to: string) => Promise<string>;
}

export interface TokenContract {
  // 查询余额
  balanceOf: (address: string) => Promise<string>;
  // 转账
  transfer: (to: string, amount: string) => Promise<string>;
  // 授权
  approve: (spender: string, amount: string) => Promise<string>;
  // 查询授权额度
  allowance: (owner: string, spender: string) => Promise<string>;
}

// ==================== ZKP (Zero Knowledge Proof) ====================

export interface ZKPProof {
  proof: string;
  publicSignals: string[];
  verified: boolean;
}

export interface CredentialVerification {
  credentialHash: string;
  proof: ZKPProof;
  verifier: string;
  timestamp: string;
}

// ==================== Constants ====================

export const VAULT_CONSTANTS = {
  ENCRYPTION_ALGORITHM: 'AES-256-GCM',
  KEY_DERIVATION: 'PBKDF2',
  ITERATIONS: 100000,
  MAX_VAULT_ITEMS: 100,
  MAX_ITEM_SIZE: 1024 * 1024, // 1MB
};

export const GOVERNANCE_CONSTANTS = {
  VOTING_PERIOD_DAYS: 7,
  EXECUTION_DELAY_HOURS: 48,
  MIN_PROPOSAL_THRESHOLD: 1000, // 最少需要 1000 $FAC 才能发起提案
  QUORUM_PERCENTAGE: 0.1, // 10% 参与率
  PASS_THRESHOLD: 0.5, // 50% 通过率
};

export const STORAGE_CONSTANTS = {
  IPFS_GATEWAY: 'https://ipfs.io/ipfs/',
  ARWEAVE_GATEWAY: 'https://arweave.net/',
  PINNING_SERVICE: 'pinata', // 或 'nft.storage'
};
