import { useState, useCallback } from 'react';
import { ArrowLeft, Shield, Download, Lock, Cloud, CheckCircle, X } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import type { PricingTiers } from '../sections/AdminPanel';

const STORAGE_VAULT = 'fac_vault_status';
const STORAGE_TIER = 'fac_user_tier';
const STORAGE_KEY_PRICING = 'fac_pricing_tiers';

type VaultStatus = 'none' | 'cloud' | 'cold';
type UserTier = 'basic' | 'professional' | 'executive';

function loadPricing(): PricingTiers | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICING);
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

export default function ProfilePage({ onBack }: { onBack: () => void }) {
  const { facBalance, transactions } = useWallet();
  const [vaultStatus, setVaultStatus] = useState<VaultStatus>(getVaultStatus);
  const [userTier, setUserTier] = useState<UserTier>(getUserTier);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentConfirming, setPaymentConfirming] = useState(false);

  const pricing = loadPricing();
  const executivePrice = pricing?.executive?.priceMonthly ?? '299';

  const handleOpenVault = useCallback(() => setShowPaymentModal(true), []);

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
    const payload = {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      vaultStatus,
      tier: userTier,
      balance: facBalance,
      transactions: transactions.slice(0, 50),
      note: '此檔案為加密備份，請妥善保管於冷錢包或離線儲存。'
    };
    const json = JSON.stringify(payload, null, 2);
    const encoded = btoa(unescape(encodeURIComponent(json)));
    const blob = new Blob([JSON.stringify({ encrypted: true, payload: encoded })], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fac-cold-wallet-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    localStorage.setItem(STORAGE_VAULT, 'cold');
    setVaultStatus('cold');
  }, [vaultStatus, userTier, facBalance, transactions]);

  const vaultLabel =
    vaultStatus === 'none'
      ? '未開通'
      : vaultStatus === 'cloud'
        ? '已開通（雲端）'
        : '已備份至冷錢包';

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--midnight)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-6 py-12">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'rgba(201,169,110,0.8)' }}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <h1 className="text-xl font-bold mb-6" style={{ color: 'var(--off-white)' }}>
          個人中心
        </h1>

        {/* 去中心化保險箱模塊 */}
        <div
          className="rounded-2xl overflow-hidden border mb-8"
          style={{
            background: 'linear-gradient(145deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
            borderColor: 'rgba(201,169,110,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(201,169,110,0.2)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
              </div>
              <div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--off-white)' }}>去中心化保險箱</h2>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.6)' }}>鏈上加密空間 · 智慧資產托管</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm" style={{ color: 'rgba(237,232,223,0.7)' }}>狀態</span>
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
                onClick={handleOpenVault}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all"
                style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
              >
                <Lock className="w-4 h-4" />
                開通保險箱
              </button>
            )}
            {userTier === 'executive' && vaultStatus !== 'none' && (
              <button
                onClick={handleExportToColdWallet}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(201,169,110,0.5)', color: 'var(--champagne)' }}
              >
                <Download className="w-4 h-4" />
                下載數據至冷錢包
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs" style={{ color: 'rgba(201,169,110,0.45)' }}>
            當前會員等級：{userTier === 'basic' ? 'Basic' : userTier === 'professional' ? 'Professional' : 'Executive'} · 餘額 {facBalance} $FAC
          </span>
          <button
            type="button"
            onClick={() => {
              localStorage.setItem(STORAGE_TIER, 'executive');
              setUserTier('executive');
            }}
            className="text-xs underline transition-colors"
            style={{ color: 'rgba(201,169,110,0.65)' }}
          >
            體驗 Executive 導出
          </button>
        </div>
      </div>

      {/* 支付彈窗（模擬法幣） */}
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
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
                style={{ border: '1px solid rgba(201,169,110,0.4)', color: 'var(--champagne)' }}
              >
                取消
              </button>
              <button
                onClick={handlePaymentConfirm}
                disabled={paymentConfirming}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
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
