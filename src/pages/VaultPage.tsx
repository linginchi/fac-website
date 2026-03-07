/**
 * VaultPage — 智慧庫
 * Displays decoded expert profiles & project cards stored in user's vault.
 * Mobile-first single-column layout, large readable cards.
 */
import { useState } from 'react';
import { ArrowLeft, Shield, ShieldCheck, Lock, Layers, Search, Filter } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

interface VaultItem {
  id: string;
  type: 'expert' | 'project';
  title: string;
  subtitle: string;
  tags: string[];
  decodedAt: string;
  cost: number;
  detail: string;
}

const MOCK_VAULT: VaultItem[] = [
  {
    id: 'v1',
    type: 'expert',
    title: '專家 A（脫敏）',
    subtitle: '金融合規 · SFC 持牌 RO',
    tags: ['SFC 1號牌', 'SFC 4號牌', 'SFC 9號牌', '跨境融資'],
    decodedAt: '2025-06-01',
    cost: 10,
    detail: '前美資投資銀行 Managing Director，擁有 SFC 1、4、9 號牌 RO 實務經驗，主導逾 30 宗跨境融資案，現提供顧問及合規培訓服務。',
  },
  {
    id: 'v2',
    type: 'expert',
    title: '專家 B（脫敏）',
    subtitle: '工程基建 · 港府工務局',
    tags: ['公共工程', '大型基建', '環評監理', '28年資歷'],
    decodedAt: '2025-05-20',
    cost: 10,
    detail: '前香港政府工務局高級工程師，基建監理資歷 28 年，主責多項大型公共工程驗收，具備環評、規劃設計及施工監督全程經驗。',
  },
  {
    id: 'v3',
    type: 'expert',
    title: '專家 C（脫敏）',
    subtitle: '跨境貿易 · 大灣區合規',
    tags: ['出口管制', '關稅優化', '跨境物流', '大灣區'],
    decodedAt: '2025-05-14',
    cost: 10,
    detail: '大灣區跨境貿易合規顧問，深耕出口管制與關稅架構優化，曾任職世界 500 強物流企業區域合規總監，精通粵港澳三地法規。',
  },
];

const TAG_COLORS = [
  'rgba(201,169,110,0.15)',
  'rgba(33,150,243,0.12)',
  'rgba(76,175,80,0.12)',
  'rgba(156,39,176,0.12)',
];

export default function VaultPage({ onBack }: { onBack: () => void }) {
  const { facBalance } = useWallet();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_VAULT.filter((item) => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.tags.some((t) => t.toLowerCase().includes(q)) ||
      item.detail.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen relative" style={{ backgroundColor: 'var(--midnight)' }}>
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }} />
      <div className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)' }} />

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 py-10 pb-28 md:pb-10">

        {/* Header */}
        <button onClick={onBack} className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: 'rgba(201,169,110,0.8)' }}>
          <ArrowLeft className="w-4 h-4" />
          返回
        </button>

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--off-white)' }}>
              <Layers className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
              智慧庫
            </h1>
            <p className="text-xs mt-1" style={{ color: 'rgba(201,169,110,0.55)' }}>
              已解碼資產 · 銀行級加密保存
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>當前餘額</p>
            <p className="text-lg font-bold tabular-nums" style={{ color: 'var(--champagne)' }}>{facBalance} <span className="text-xs">$FAC</span></p>
          </div>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: '已解碼項目', value: MOCK_VAULT.length },
            { label: '保險箱狀態', value: '已開通' },
            { label: '本月消耗', value: `${MOCK_VAULT.length * 10} $FAC` },
          ].map(({ label, value }) => (
            <div key={label} className="p-3 rounded-xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(201,169,110,0.12)' }}>
              <p className="text-base font-bold" style={{ color: 'var(--champagne)' }}>{value}</p>
              <p className="text-[10px] mt-0.5" style={{ color: 'rgba(237,232,223,0.4)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'rgba(201,169,110,0.45)' }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜尋智慧庫（專業領域、證書、技能…）"
            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white bg-transparent"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(201,169,110,0.2)',
              outline: 'none',
            }}
          />
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
            style={{ color: 'rgba(201,169,110,0.3)' }} />
        </div>

        {/* Vault Item Cards */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="text-center py-12">
              <Lock className="w-10 h-10 mx-auto mb-3" style={{ color: 'rgba(237,232,223,0.2)' }} />
              <p className="text-sm" style={{ color: 'rgba(237,232,223,0.4)' }}>暫無符合條件的記錄</p>
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl overflow-hidden transition-all duration-300"
                style={{
                  background: 'linear-gradient(145deg, rgba(13,31,60,0.97) 0%, rgba(10,22,40,0.99) 100%)',
                  border: `1px solid ${expanded === item.id ? 'rgba(201,169,110,0.45)' : 'rgba(201,169,110,0.2)'}`,
                  boxShadow: expanded === item.id ? '0 8px 32px rgba(0,0,0,0.4)' : 'none',
                }}
              >
                {/* Card header */}
                <button
                  className="w-full text-left px-5 py-4"
                  onClick={() => setExpanded(expanded === item.id ? null : item.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold"
                        style={{ background: 'rgba(201,169,110,0.14)', border: '1px solid rgba(201,169,110,0.28)', color: 'var(--champagne)' }}>
                        {item.id.replace('v', '')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold" style={{ color: 'var(--off-white)' }}>{item.title}</p>
                          <span className="text-[10px] px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(76,175,80,0.14)', border: '1px solid rgba(76,175,80,0.3)', color: '#81C784' }}>
                            <ShieldCheck className="w-2.5 h-2.5 inline mr-0.5" />
                            已解碼
                          </span>
                        </div>
                        <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.65)' }}>{item.subtitle}</p>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-xs" style={{ color: 'rgba(237,232,223,0.35)' }}>{item.decodedAt}</p>
                      <p className="text-xs" style={{ color: 'rgba(239,68,68,0.65)' }}>-{item.cost} $FAC</p>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {item.tags.map((tag, idx) => (
                      <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md"
                        style={{
                          background: TAG_COLORS[idx % TAG_COLORS.length],
                          border: '1px solid rgba(255,255,255,0.08)',
                          color: 'rgba(237,232,223,0.75)'
                        }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </button>

                {/* Expanded detail */}
                {expanded === item.id && (
                  <div className="px-5 pb-5 space-y-3" style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}>
                    <div className="flex items-center gap-2 pt-4">
                      <Shield className="w-3.5 h-3.5" style={{ color: '#4CAF7D' }} />
                      <span className="text-xs font-semibold" style={{ color: '#4CAF7D' }}>脫敏智慧資歷 · 銀行級加密存儲</span>
                    </div>
                    <p className="text-sm" style={{ color: 'rgba(237,232,223,0.82)', lineHeight: 1.75 }}>{item.detail}</p>
                    <div className="flex flex-col sm:flex-row gap-2 pt-1">
                      <button className="flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all"
                        style={{ background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)', color: '#0A1628' }}>
                        發送 Job Offer
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl text-xs font-medium transition-all"
                        style={{ border: '1px solid rgba(201,169,110,0.4)', color: 'var(--champagne)' }}>
                        預約私密對話（100 $FAC）
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* CTA if vault is empty */}
        <div className="mt-6 p-5 rounded-2xl text-center"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px dashed rgba(201,169,110,0.2)' }}>
          <p className="text-xs mb-3" style={{ color: 'rgba(237,232,223,0.4)' }}>
            使用首頁萬能框搜尋並解碼更多隱世專家，資歷將自動存入智慧庫。
          </p>
          <a href="/"
            className="inline-flex items-center gap-2 py-2 px-4 rounded-xl text-xs font-semibold"
            style={{ border: '1px solid rgba(201,169,110,0.35)', color: 'var(--champagne)' }}>
            前往萬能框搜尋
          </a>
        </div>
      </div>
    </div>
  );
}
