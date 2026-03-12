/**
 * FAC Platform V5.1 - Bloomberg风格市场信息走马灯
 * 全宽横向滚动，显示实时甲乙双方动态
 */

import { useState, useEffect, useRef } from 'react';
import { Briefcase, User, Clock, TrendingUp, Building2, DollarSign } from 'lucide-react';
import type { MockPartyA, MockPartyB } from '../data/mockMarketData';
import { MOCK_PARTY_A, MOCK_PARTY_B } from '../data/mockMarketData';

interface MarketTickerProps {
  onItemClick?: (type: 'A' | 'B', item: MockPartyA | MockPartyB) => void;
}

// 合并并格式化数据
const formatTickerItems = () => {
  const items: Array<{
    type: 'A' | 'B';
    id: string;
    title: string;
    subtitle: string;
    value: string;
    time: string;
  }> = [];
  
  MOCK_PARTY_A.forEach(item => {
    items.push({
      type: 'A',
      id: item.id,
      title: item.maskedName,
      subtitle: item.requirement.slice(0, 20) + '...',
      value: item.budget,
      time: item.timestamp
    });
  });
  
  MOCK_PARTY_B.forEach(item => {
    items.push({
      type: 'B',
      id: item.id,
      title: item.maskedName,
      subtitle: item.expertise.slice(0, 2).join('、'),
      value: item.hourlyRate + '/hr',
      time: item.timestamp
    });
  });
  
  // 随机排序
  return items.sort(() => Math.random() - 0.5);
};

export default function MarketTicker({ onItemClick }: MarketTickerProps) {
  const [items] = useState(formatTickerItems);
  const [isPaused, setIsPaused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const [selectedItem, setSelectedItem] = useState<typeof items[0] | null>(null);

  // 复制数据以实现无缝滚动
  const duplicatedItems = [...items, ...items];

  return (
    <>
      {/* Bloomberg风格全宽走马灯 */}
      <div 
        className="w-full relative overflow-hidden"
        style={{ 
          background: 'linear-gradient(180deg, rgba(10,22,40,0.98) 0%, rgba(7,14,31,0.99) 100%)',
          borderTop: '1px solid rgba(201,169,110,0.15)',
          borderBottom: '1px solid rgba(201,169,110,0.1)',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* 顶部状态栏 */}
        <div className="flex items-center px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2 mr-6">
            <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-xs font-medium text-[#C9A96E]">LIVE</span>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#64B5F6] animate-pulse"></span>
              <span className="text-gray-400">甲方需求</span>
              <span className="text-[#64B5F6] font-medium">{MOCK_PARTY_A.length}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#81C784] animate-pulse"></span>
              <span className="text-gray-400">乙方专家</span>
              <span className="text-[#81C784] font-medium">{MOCK_PARTY_B.length}</span>
            </span>
          </div>
          <div className="ml-auto text-xs text-gray-500">
            实时更新 · 香港市场
          </div>
        </div>

        {/* 滚动内容区 */}
        <div 
          ref={containerRef}
          className="relative h-12 overflow-hidden"
        >
          <div 
            className={`flex items-center h-full ${isPaused ? '' : 'animate-marquee'}`}
            style={{
              animation: isPaused ? 'none' : 'marquee 40s linear infinite',
            }}
          >
            {duplicatedItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex-shrink-0 flex items-center px-6 h-full border-r border-white/5 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => {
                  setSelectedItem(item);
                  setShowBetaNotice(true);
                  const originalItem = item.type === 'A' 
                    ? MOCK_PARTY_A.find(i => i.id === item.id)
                    : MOCK_PARTY_B.find(i => i.id === item.id);
                  if (originalItem) {
                    onItemClick?.(item.type, originalItem);
                  }
                }}
              >
                {/* 类型图标 */}
                <div 
                  className="w-6 h-6 rounded flex items-center justify-center mr-3"
                  style={{ 
                    background: item.type === 'A' 
                      ? 'rgba(33,150,243,0.15)' 
                      : 'rgba(76,175,80,0.15)',
                  }}
                >
                  {item.type === 'A' ? (
                    <Building2 className="w-3 h-3 text-[#64B5F6]" />
                  ) : (
                    <User className="w-3 h-3 text-[#81C784]" />
                  )}
                </div>

                {/* 内容 */}
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-300 whitespace-nowrap">
                    {item.title}
                  </span>
                  <span className="text-xs text-gray-500 whitespace-nowrap max-w-[120px] truncate">
                    {item.subtitle}
                  </span>
                  <span 
                    className="text-xs font-medium whitespace-nowrap"
                    style={{ color: item.type === 'A' ? '#64B5F6' : '#81C784' }}
                  >
                    {item.value}
                  </span>
                  <span className="text-xs text-gray-600 whitespace-nowrap">
                    {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 试营运提示弹窗 */}
      {showBetaNotice && selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowBetaNotice(false)}
        >
          <div 
            className="max-w-md w-full bg-[#0A1628] rounded-2xl p-6 border border-[#C9A96E]/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background: selectedItem.type === 'A' 
                    ? 'rgba(33,150,243,0.15)' 
                    : 'rgba(76,175,80,0.15)',
                }}
              >
                {selectedItem.type === 'A' ? (
                  <Briefcase className="w-6 h-6 text-[#64B5F6]" />
                ) : (
                  <User className="w-6 h-6 text-[#81C784]" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-xs px-2 py-0.5 rounded"
                    style={{
                      background: selectedItem.type === 'A' 
                        ? 'rgba(33,150,243,0.15)' 
                        : 'rgba(76,175,80,0.15)',
                      color: selectedItem.type === 'A' ? '#64B5F6' : '#81C784'
                    }}
                  >
                    {selectedItem.type === 'A' ? '甲方需求' : '乙方专家'}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{selectedItem.title}</h3>
                <p className="text-sm text-[#C9A96E] font-medium mb-4">{selectedItem.value}</p>
                <p className="text-sm text-gray-400 mb-4">
                  FAC Platform 目前处于试营运阶段，详细资料正在收集中。
                </p>
                <button
                  onClick={() => setShowBetaNotice(false)}
                  className="w-full py-3 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-xl hover:opacity-90 transition-opacity"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS动画 */}
      <style>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </>
  );
}
