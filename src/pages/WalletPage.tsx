import { useWallet } from '../context/WalletContext';
import { Coins, ArrowLeft } from 'lucide-react';

const PRESET_MOCK: { date: string; label: string; amount: number }[] = [
  { date: '2024-05-20', label: 'LinkedIn 註冊獎勵', amount: 80 },
  { date: '2024-05-20', label: '完善個人保險箱資訊', amount: 20 }
];

export default function WalletPage({ onBack }: { onBack: () => void }) {
  const { facBalance, transactions } = useWallet();
  const displayList = transactions.length > 0 ? transactions : PRESET_MOCK.map((t, i) => ({ ...t, id: `preset_${i}` }));

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }}
      />
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-8 transition-colors"
          style={{ color: 'rgba(201,169,110,0.8)' }}
        >
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div
          className="rounded-2xl overflow-hidden border"
          style={{
            background: 'linear-gradient(145deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
            borderColor: 'rgba(201,169,110,0.35)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
          }}
        >
          {/* 帳單標頭 */}
          <div
            className="px-6 py-5 border-b"
            style={{ borderColor: 'rgba(201,169,110,0.2)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}
                >
                  <Coins className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
                </div>
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--off-white)', fontFamily: "'PingFang HK', sans-serif" }}>
                    $FAC 流水賬
                  </h1>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.6)' }}>
                    個人智慧錢包 · 銀行級私人保險箱
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(237,232,223,0.5)' }}>
                  當前餘額
                </div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--champagne)' }}>
                  {transactions.length > 0 ? facBalance : '—'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(201,169,110,0.7)' }}>$FAC</div>
              </div>
            </div>
          </div>

          {/* 表頭 */}
          <div
            className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider"
            style={{ background: 'rgba(201,169,110,0.06)', borderBottom: '1px solid rgba(201,169,110,0.15)', color: 'rgba(237,232,223,0.5)' }}
          >
            <div className="col-span-3">日期</div>
            <div className="col-span-6">項目名稱</div>
            <div className="col-span-3 text-right">金額變動</div>
          </div>

          {/* 流水列表 */}
          <ul className="divide-y" style={{ borderColor: 'rgba(201,169,110,0.1)' }}>
            {displayList.map((tx) => (
              <li
                key={tx.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-white/[0.02]"
              >
                <div className="col-span-3 text-sm" style={{ color: 'rgba(237,232,223,0.85)' }}>
                  {tx.date}
                </div>
                <div className="col-span-6 text-sm" style={{ color: 'var(--off-white)' }}>
                  {tx.label}
                </div>
                <div className="col-span-3 text-right">
                  <span
                    className="font-semibold tabular-nums"
                    style={{ color: tx.amount >= 0 ? '#4CAF7D' : 'rgba(239,68,68,0.9)' }}
                  >
                    {tx.amount >= 0 ? '+' : ''}{tx.amount} $FAC
                  </span>
                </div>
              </li>
            ))}
          </ul>

          {transactions.length === 0 && (
            <div className="px-6 py-4 text-center text-xs" style={{ color: 'rgba(201,169,110,0.45)', borderTop: '1px solid rgba(201,169,110,0.1)' }}>
              以上為預置模擬數據。完成 LinkedIn 一鍵同步後，將顯示真實流水與餘額。
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
