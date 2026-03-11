/**
 * FAC Platform V5.1 - Vault Page (Decentralized Storage)
 * 去中心化保险柜：IPFS/Arweave 存储 + 冷钱包导出
 */

import { useState } from 'react';
import { useVault } from '../contexts/VaultContext';
import { useWeb3Wallet } from '../contexts/WalletContext';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import BottomNav from '../components/BottomNav';
import {
  Shield, Lock, Cloud, Database, Download, Upload,
  CheckCircle, AlertCircle, FileText, Briefcase, Award,
  Users, ExternalLink, Copy, Check, Loader2, HardDrive,
  Wallet, Key
} from 'lucide-react';
import type { VaultItem, StorageProvider } from '../types/web3';

// ==================== Components ====================

function StorageProviderBadge({ provider }: { provider: StorageProvider }) {
  const config = {
    ipfs: { icon: Cloud, label: 'IPFS', color: 'text-blue-400', bg: 'bg-blue-500/10' },
    arweave: { icon: Database, label: 'Arweave', color: 'text-green-400', bg: 'bg-green-500/10' },
    local: { icon: HardDrive, label: '本地加密', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  };
  
  const { icon: Icon, label, color, bg } = config[provider];
  
  return (
    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${bg} ${color}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function VaultItemCard({ item, onGrantAccess }: { item: VaultItem; onGrantAccess: (id: string) => void }) {
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const typeConfig = {
    credential: { icon: Award, label: '资质证明' },
    experience: { icon: Briefcase, label: '工作经历' },
    portfolio: { icon: FileText, label: '项目案例' },
    certificate: { icon: Shield, label: '证书' },
    contact: { icon: Users, label: '联系方式' },
  };
  
  const TypeIcon = typeConfig[item.type].icon;
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white/5 rounded-2xl p-5 border border-white/10 hover:border-[#C9A96E]/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
            <TypeIcon className="w-5 h-5 text-[#C9A96E]" />
          </div>
          <div>
            <h3 className="font-bold text-white">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <StorageProviderBadge provider={item.storageProvider} />
              {item.encrypted && (
                <span className="flex items-center gap-1 px-2 py-1 rounded text-xs bg-green-500/10 text-green-400">
                  <Lock className="w-3 h-3" />
                  已加密
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-sm text-[#C9A96E] hover:underline"
        >
          {showDetails ? '收起' : '查看'}
        </button>
      </div>
      
      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="p-4 bg-black/30 rounded-xl">
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{item.content}</p>
          </div>
          
          {/* Storage Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            {item.cid && (
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-500 mb-1">IPFS CID</p>
                <div className="flex items-center gap-2">
                  <code className="text-blue-400 font-mono truncate">{item.cid.slice(0, 20)}...</code>
                  <button
                    onClick={() => copyToClipboard(item.cid!)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
              </div>
            )}
            {item.arweaveTxId && (
              <div className="p-3 bg-white/5 rounded-lg">
                <p className="text-gray-500 mb-1">Arweave TX</p>
                <div className="flex items-center gap-2">
                  <code className="text-green-400 font-mono truncate">{item.arweaveTxId.slice(0, 20)}...</code>
                  <button
                    onClick={() => copyToClipboard(item.arweaveTxId!)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-gray-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => onGrantAccess(item.id)}
              className="flex-1 py-2 bg-[#C9A96E]/10 text-[#C9A96E] rounded-lg text-sm hover:bg-[#C9A96E]/20 transition-colors"
            >
              授权访问
            </button>
            {item.cid && (
              <a
                href={`https://ipfs.io/ipfs/${item.cid}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 bg-white/5 text-gray-400 rounded-lg text-sm hover:bg-white/10 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                查看
              </a>
            )}
          </div>
          
          {/* Access Log */}
          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-500 mb-2">访问记录 ({item.accessLog?.length || 0})</p>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {item.accessLog?.slice(0, 3).map((log, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {log.accessorType === 'owner' ? '您' : log.accessorId.slice(0, 8)} {log.action === 'read' ? '查看' : log.action === 'write' ? '编辑' : '分享'}
                  </span>
                  <span className="text-gray-600">
                    {new Date(log.timestamp).toLocaleDateString('zh-HK')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ColdWalletExportModal({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean; 
  onClose: () => void;
}) {
  const { exportToColdWallet } = useVault();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [exportData, setExportData] = useState<string>('');
  
  if (!isOpen) return null;
  
  const handleExport = async () => {
    if (password !== confirmPassword || password.length < 8) return;
    
    setIsExporting(true);
    try {
      const data = await exportToColdWallet(password);
      setExportData(JSON.stringify(data, null, 2));
      setExported(true);
    } finally {
      setIsExporting(false);
    }
  };
  
  const downloadExport = () => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fac-vault-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0A1628] rounded-2xl border border-[#C9A96E]/30 overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Wallet className="w-6 h-6 text-[#C9A96E]" />
            导出至冷钱包
          </h2>
          <p className="text-sm text-gray-400 mt-1">Executive 专属 · 端到端加密</p>
        </div>
        
        <div className="p-6">
          {!exported ? (
            <div className="space-y-4">
              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-yellow-400 font-medium">安全提醒</p>
                    <p className="text-xs text-yellow-400/70 mt-1">
                      导出的文件将包含您的所有保险柜数据，请妥善保管密码。一旦丢失，数据将无法恢复。
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">设置密码（至少8位）</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A96E]"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-2">确认密码</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#C9A96E]"
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
                  onClick={handleExport}
                  disabled={password !== confirmPassword || password.length < 8 || isExporting}
                  className="flex-1 py-3 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      加密中...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      导出
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-center">
                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-medium">导出成功</p>
                <p className="text-xs text-green-400/70 mt-1">您的保险柜数据已加密</p>
              </div>
              
              <div className="p-4 bg-black/30 rounded-xl">
                <p className="text-xs text-gray-500 mb-2">文件预览（已加密）</p>
                <pre className="text-xs text-gray-400 overflow-x-auto">{exportData.slice(0, 200)}...</pre>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-colors"
                >
                  关闭
                </button>
                <button
                  onClick={downloadExport}
                  className="flex-1 py-3 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-xl hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  下载文件
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ==================== Main Page ====================

export default function VaultPage() {
  const { 
    items, 
    isLoading, 
    storageUsed, 
    storageLimit, 
    addItem,
    getStats 
  } = useVault();
  const { connection, isMetaMaskInstalled, connect } = useWeb3Wallet();
  
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  
  const stats = getStats();
  const usagePercent = (storageUsed / storageLimit) * 100;

  return (
    <div className="min-h-screen bg-[#0A1628]">
      <Navbar />
      
      <main className="pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">智慧保险柜</h1>
            <p className="text-gray-400">去中心化存储 · IPFS/Arweave · 端到端加密</p>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-[#C9A96E]">{stats.total}</p>
              <p className="text-xs text-gray-400">存储项目</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-white">{stats.encrypted}</p>
              <p className="text-xs text-gray-400">已加密</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-blue-400">
                {(storageUsed / 1024).toFixed(1)} KB
              </p>
              <p className="text-xs text-gray-400">已用空间</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold text-green-400">
                {usagePercent.toFixed(1)}%
              </p>
              <p className="text-xs text-gray-400">容量使用</p>
            </div>
          </div>
          
          {/* Storage Usage Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
              <span>存储空间</span>
              <span>{(storageUsed / 1024).toFixed(1)} KB / {(storageLimit / 1024 / 1024).toFixed(0)} MB</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] transition-all"
                style={{ width: `${Math.min(usagePercent, 100)}%` }}
              />
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-lg hover:opacity-90 transition-opacity"
            >
              <Upload className="w-4 h-4" />
              添加项目
            </button>
            
            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
            >
              <Wallet className="w-4 h-4" />
              导出至冷钱包
            </button>
            
            {!connection ? (
              <button
                onClick={() => connect('metamask')}
                disabled={!isMetaMaskInstalled}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors disabled:opacity-50"
              >
                <Key className="w-4 h-4" />
                {isMetaMaskInstalled ? '连接钱包' : '需安装 MetaMask'}
              </button>
            ) : (
              <span className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-sm">
                <CheckCircle className="w-4 h-4" />
                {connection.address.slice(0, 6)}...{connection.address.slice(-4)}
              </span>
            )}
          </div>
          
          {/* Items List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-12 text-gray-400">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                加载中...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>保险柜为空</p>
                <p className="text-sm mt-2">添加您的第一个加密存储项目</p>
              </div>
            ) : (
              items.map(item => (
                <VaultItemCard 
                  key={item.id} 
                  item={item} 
                  onGrantAccess={(id) => alert(`授权访问项目 ${id}`)}
                />
              ))
            )}
          </div>
          
          {/* Info */}
          <div className="mt-8 p-6 bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl border border-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Cloud className="w-6 h-6 text-blue-400" />
              <h3 className="text-lg font-bold text-white">去中心化存储说明</h3>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-400">
              <div>
                <p className="text-blue-400 font-medium mb-1">IPFS</p>
                <p>星际文件系统，内容寻址分布式存储。您的数据被分割存储在全球数千个节点上。</p>
              </div>
              <div>
                <p className="text-green-400 font-medium mb-1">Arweave</p>
                <p>永久存储网络，一次付费永久保存。适合存储重要的资质证明和证书。</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
      <BottomNav />
      
      <ColdWalletExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />
    </div>
  );
}
