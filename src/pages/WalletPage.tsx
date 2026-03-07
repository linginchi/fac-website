import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Coins, ArrowLeft, TrendingUp, Vote, Star, ChevronRight, Lock } from 'lucide-react';

const PRESET_MOCK: { date: string; label: string; amount: number }[] = [
  { date: '2024-05-20', label: 'LinkedIn 註冊獎勵', amount: 80 },
  { date: '2024-05-20', label: '完善個人保險箱資訊', amount: 20 }
];

const MOCK_GOVERNANCE = [
  { id: 'g1', title: '是否新增「生命科學與醫療合規」支柱？', endDate: '2025-09-01', forPct: 67, voters: 67, yourVote: '支持新增' },
  { id: 'g2', title: '開啟第九智慧支柱：新能源與 ESG', endDate: '2025-06-30', forPct: 76, voters: 102, yourVote: '支持開啟' },
];

export default function WalletPage({ onBack }: { onBack: () => void }) {
  const { facBalance, transactions } = useWallet();
  const displayList = transactions.length > 0 ? transactions : PRESET_MOCK.map((t, i) => ({ ...t, id: `preset_${i}` }));

  const isPartner = typeof window !== 'undefined' && localStorage.getItem('fac_user_tier') === 'executive';
  const dividendRate = (() => {
    try {
      const p = JSON.parse(localStorage.getItem('fac_pricing_tiers') || '{}');
      return p?.executive?.dividendRate ?? '7';
    } catch (_) { return '7'; }
  })();

  // Estimated monthly dividend based on balance
  const estMonthlyFAC  = Math.round(facBalance * 0.08);
  const estMonthlyHKD  = Math.round(estMonthlyFAC * 1.5);
  const [voteHighlight, setVoteHighlight] = useState<string | null>(null);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--midnight)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-8 transition-colors" style={{ color: 'rgba(201,169,110,0.8)' }}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        {/* ── Transaction Statement ── */}
        <div className="rounded-2xl overflow-hidden border mb-6" style={{
          background: 'linear-gradient(145deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
          borderColor: 'rgba(201,169,110,0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
        }}>
          {/* 帳單標頭 */}
          <div className="px-6 py-5 border-b" style={{ borderColor: 'rgba(201,169,110,0.2)' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
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
                <div className="text-xs uppercase tracking-wider" style={{ color: 'rgba(237,232,223,0.5)' }}>當前餘額</div>
                <div className="text-2xl font-bold tabular-nums" style={{ color: 'var(--champagne)' }}>
                  {transactions.length > 0 ? facBalance : '—'}
                </div>
                <div className="text-xs" style={{ color: 'rgba(201,169,110,0.7)' }}>$FAC</div>
              </div>
            </div>
          </div>

          {/* 表頭 */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs uppercase tracking-wider"
            style={{ background: 'rgba(201,169,110,0.06)', borderBottom: '1px solid rgba(201,169,110,0.15)', color: 'rgba(237,232,223,0.5)' }}>
            <div className="col-span-3">日期</div>
            <div className="col-span-6">項目名稱</div>
            <div className="col-span-3 text-right">金額變動</div>
          </div>

          {/* 流水列表 */}
          <ul className="divide-y" style={{ borderColor: 'rgba(201,169,110,0.1)' }}>
            {displayList.map((tx) => (
              <li key={tx.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center transition-colors hover:bg-white/[0.02]">
                <div className="col-span-3 text-sm" style={{ color: 'rgba(237,232,223,0.85)' }}>{tx.date}</div>
                <div className="col-span-6 text-sm" style={{ color: 'var(--off-white)' }}>{tx.label}</div>
                <div className="col-span-3 text-right">
                  <span className="font-semibold tabular-nums" style={{ color: tx.amount >= 0 ? '#4CAF7D' : 'rgba(239,68,68,0.9)' }}>
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

        {/* ── 合夥人分紅預估（Executive 可見）── */}
        {isPartner ? (
          <div className="rounded-2xl overflow-hidden border mb-6" style={{
            background: 'linear-gradient(145deg, rgba(13,31,60,0.97) 0%, rgba(10,22,40,0.99) 100%)',
            borderColor: 'rgba(201,169,110,0.3)',
          }}>
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.25)' }}>
                  <TrendingUp className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
                </div>
                <div>
                  <h2 className="text-sm font-bold" style={{ color: 'var(--off-white)' }}>合夥人分紅預估</h2>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.55)' }}>Partner Revenue Forecast</p>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.3)', color: '#C9A96E' }}>
                分紅率 {dividendRate}%
              </span>
            </div>

            <div className="px-6 py-5 space-y-4">
              {/* 預估數字 */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: '預估月收益', value: `+${estMonthlyFAC} $FAC`, sub: `≈ HKD ${estMonthlyHKD}`, color: '#4CAF7D' },
                  { label: '信任網絡規模', value: '2 人', sub: '已引薦入駐', color: 'var(--champagne)' },
                  { label: '歷史累積分紅', value: 'HKD 1,650', sub: '3 筆撮合', color: 'rgba(237,232,223,0.75)' },
                ].map(({ label, value, sub, color }) => (
                  <div key={label} className="p-4 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,110,0.12)' }}>
                    <p className="text-xs mb-1.5" style={{ color: 'rgba(201,169,110,0.5)' }}>{label}</p>
                    <p className="text-base font-bold tabular-nums" style={{ color }}>{value}</p>
                    <p className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.35)' }}>{sub}</p>
                  </div>
                ))}
              </div>

              {/* 潛在收益圖示條 */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.18)' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium" style={{ color: 'rgba(201,169,110,0.8)' }}>本月分紅進度</span>
                  <span className="text-xs tabular-nums" style={{ color: '#4CAF7D' }}>HKD 200 / 500</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                  <div className="h-full rounded-full" style={{ width: '40%', background: 'linear-gradient(90deg, #4CAF7D, #81C784)' }} />
                </div>
                <p className="text-xs mt-2" style={{ color: 'rgba(237,232,223,0.35)' }}>
                  預計本月底可達 HKD 500，建議邀請更多專家入駐以提升分紅。
                </p>
              </div>

              <a href="/profile" className="flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium transition-all"
                style={{ border: '1px solid rgba(201,169,110,0.3)', color: 'var(--champagne)' }}>
                <span>查看完整分紅流水 & 申請提現</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        ) : (
          /* 非合夥人：升級提示 */
          <div className="rounded-2xl p-5 mb-6 border" style={{ background: 'rgba(13,31,60,0.7)', borderColor: 'rgba(201,169,110,0.2)' }}>
            <div className="flex items-start gap-3">
              <Star className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgba(201,169,110,0.7)' }} />
              <div>
                <p className="text-sm font-semibold mb-1" style={{ color: 'var(--off-white)' }}>升級為合夥人，解鎖分紅收益</p>
                <p className="text-xs mb-3" style={{ color: 'rgba(237,232,223,0.5)', lineHeight: 1.65 }}>
                  Executive 合夥人可從每筆成功撮合中獲得 5–10% 智慧分紅，並享有平台治理投票權。
                </p>
                <a href="/profile" className="inline-flex items-center gap-2 py-1.5 px-3 rounded-lg text-xs font-semibold"
                  style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}>
                  前往個人中心升級
                </a>
              </div>
            </div>
          </div>
        )}

        {/* ── 投票權展示 ── */}
        <div className="rounded-2xl overflow-hidden border" style={{
          background: 'linear-gradient(145deg, rgba(13,31,60,0.97) 0%, rgba(10,22,40,0.99) 100%)',
          borderColor: isPartner ? 'rgba(201,169,110,0.3)' : 'rgba(255,255,255,0.08)',
        }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: isPartner ? 'rgba(201,169,110,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isPartner ? 'rgba(201,169,110,0.25)' : 'rgba(255,255,255,0.1)'}` }}>
                <Vote className="w-4 h-4" style={{ color: isPartner ? 'var(--champagne)' : 'rgba(237,232,223,0.4)' }} />
              </div>
              <div>
                <h2 className="text-sm font-bold" style={{ color: isPartner ? 'var(--off-white)' : 'rgba(237,232,223,0.5)' }}>治理投票權</h2>
                <p className="text-xs mt-0.5" style={{ color: isPartner ? 'rgba(201,169,110,0.55)' : 'rgba(237,232,223,0.3)' }}>
                  {isPartner ? '您正在參與平台決策' : '僅 Executive 合夥人可見'}
                </p>
              </div>
            </div>
            {isPartner && (
              <span className="text-xs px-2.5 py-1 rounded-lg" style={{ background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', color: '#81C784' }}>
                已投票 {MOCK_GOVERNANCE.length} 次
              </span>
            )}
          </div>

          {isPartner ? (
            <div className="px-6 py-5 space-y-4">
              <p className="text-xs" style={{ color: 'rgba(237,232,223,0.5)', lineHeight: 1.65 }}>
                作為合夥人，您的每一票直接影響智慧銀行的戰略走向。以下為您已參與的決議：
              </p>
              {MOCK_GOVERNANCE.map((g) => (
                <div
                  key={g.id}
                  className="p-4 rounded-xl cursor-pointer transition-all"
                  onClick={() => setVoteHighlight(voteHighlight === g.id ? null : g.id)}
                  style={{
                    background: voteHighlight === g.id ? 'rgba(201,169,110,0.08)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${voteHighlight === g.id ? 'rgba(201,169,110,0.35)' : 'rgba(201,169,110,0.12)'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-xs font-semibold" style={{ color: 'rgba(237,232,223,0.85)' }}>{g.title}</p>
                    <span className="text-xs flex-shrink-0" style={{ color: 'rgba(237,232,223,0.4)' }}>截止 {g.endDate}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
                      <div className="h-full rounded-full" style={{ width: `${g.forPct}%`, background: 'linear-gradient(90deg,#C9A96E,#a8883a)' }} />
                    </div>
                    <span className="text-xs tabular-nums" style={{ color: 'var(--champagne)' }}>{g.forPct}%</span>
                    <span className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>{g.voters} 票</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.4)' }}>
                      <span style={{ fontSize: '8px', color: '#4CAF7D' }}>✓</span>
                    </div>
                    <span className="text-xs" style={{ color: '#81C784' }}>您已投票：「{g.yourVote}」</span>
                  </div>
                </div>
              ))}
              <a href="/profile" className="flex items-center justify-between py-2.5 px-4 rounded-xl text-sm font-medium"
                style={{ border: '1px solid rgba(201,169,110,0.3)', color: 'var(--champagne)' }}>
                <span>前往合夥人中心參與新提案</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          ) : (
            <div className="px-6 py-8 text-center">
              <Lock className="w-8 h-8 mx-auto mb-3" style={{ color: 'rgba(237,232,223,0.2)' }} />
              <p className="text-sm mb-1" style={{ color: 'rgba(237,232,223,0.4)' }}>治理投票權尚未開通</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(237,232,223,0.3)' }}>升級為 Executive 合夥人後，即可參與平台決策投票。</p>
              <a href="/profile" className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold"
                style={{ border: '1px solid rgba(201,169,110,0.35)', color: 'rgba(201,169,110,0.7)' }}>
                了解合夥人權益
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
