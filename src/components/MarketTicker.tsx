/**
 * FAC Platform V5.1 - 市场信息走马灯
 * 展示模拟的甲方需求和乙方专家信息
 * 公测阶段使用
 */

import { useState, useEffect, useRef } from 'react';
import { Briefcase, User, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import type { MockPartyA, MockPartyB } from '../data/mockMarketData';
import { MOCK_PARTY_A, MOCK_PARTY_B } from '../data/mockMarketData';

interface MarketTickerProps {
  onItemClick?: (type: 'A' | 'B', item: MockPartyA | MockPartyB) => void;
}

export default function MarketTicker({ onItemClick }: MarketTickerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showBetaNotice, setShowBetaNotice] = useState(false);
  const [matchedItem, setMatchedItem] = useState<MockPartyA | MockPartyB | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 合并数据，交替显示甲乙双方
  const allItems: Array<{ type: 'A' | 'B'; data: MockPartyA | MockPartyB }> = [
    ...MOCK_PARTY_A.map(item => ({ type: 'A' as const, data: item })),
    ...MOCK_PARTY_B.map(item => ({ type: 'B' as const, data: item }))
  ].sort(() => 0.5 - Math.random());

  useEffect(() => {
    if (!isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex(prev => (prev + 1) % allItems.length);
      }, 4000); // 每4秒切换一次
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, allItems.length]);

  const handleItemClick = (type: 'A' | 'B', item: MockPartyA | MockPartyB) => {
    setMatchedItem(item);
    setShowBetaNotice(true);
    onItemClick?.(type, item);
  };

  const currentItem = allItems[currentIndex];

  return (
    <div className="w-full">
      {/* 走马灯主体 */}
      <div 
        className="relative overflow-hidden rounded-xl border"
        style={{ 
          background: 'linear-gradient(145deg, rgba(13,31,60,0.95) 0%, rgba(10,22,40,0.98) 100%)',
          borderColor: currentItem?.type === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* 顶部标签 */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#C9A96E]" />
            <span className="text-xs text-gray-400">实时市场动态</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#64B5F6]"></span>
              <span className="text-gray-400">甲方需求</span>
            </span>
            <span className="flex items-center gap-1 text-xs">
              <span className="w-2 h-2 rounded-full bg-[#81C784]"></span>
              <span className="text-gray-400">乙方专家</span>
            </span>
          </div>
        </div>

        {/* 滚动内容 */}
        <div className="relative h-16">
          {allItems.map((item, index) => (
            <div
              key={`${item.type}-${item.data.id}`}
              className={`absolute inset-0 flex items-center px-4 transition-all duration-500 ${
                index === currentIndex 
                  ? 'opacity-100 translate-x-0' 
                  : index < currentIndex 
                    ? 'opacity-0 -translate-x-full' 
                    : 'opacity-0 translate-x-full'
              }`}
              onClick={() => handleItemClick(item.type, item.data)}
              style={{ cursor: 'pointer' }}
            >
              {/* 类型标识 */}
              <div 
                className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ 
                  background: item.type === 'A' 
                    ? 'rgba(33,150,243,0.15)' 
                    : 'rgba(76,175,80,0.15)',
                  border: `1px solid ${item.type === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`
                }}
              >
                {item.type === 'A' ? (
                  <Briefcase className="w-5 h-5 text-[#64B5F6]" />
                ) : (
                  <User className="w-5 h-5 text-[#81C784]" />
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span 
                    className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{ 
                      background: item.type === 'A' 
                        ? 'rgba(33,150,243,0.1)' 
                        : 'rgba(76,175,80,0.1)',
                      color: item.type === 'A' ? '#64B5F6' : '#81C784'
                    }}
                  >
                    {item.type === 'A' ? '寻找专家' : '专家入驻'}
                  </span>
                  <span className="text-xs text-gray-500">
                    {item.type === 'A' 
                      ? (item.data as MockPartyA).maskedName 
                      : (item.data as MockPartyB).maskedName}
                  </span>
                  <Clock className="w-3 h-3 text-gray-500 ml-2" />
                  <span className="text-xs text-gray-500">{item.data.timestamp}</span>
                </div>
                <p className="text-sm text-white truncate">
                  {item.type === 'A' 
                    ? (item.data as MockPartyA).requirement 
                    : `${(item.data as MockPartyB).expertise.join('、')} - ${(item.data as MockPartyB).experience}`}
                </p>
              </div>

              {/* 预算/薪资 */}
              <div className="flex-shrink-0 ml-4 text-right">
                <p className="text-sm font-medium text-[#C9A96E]">
                  {item.type === 'A' 
                    ? (item.data as MockPartyA).budget 
                    : (item.data as MockPartyB).hourlyRate + '/小时'}
                </p>
                <p className="text-xs text-gray-500">
                  {item.type === 'A' ? '预算' : '时薪'}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 进度指示器 */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/5">
          <div 
            className="h-full transition-all duration-300"
            style={{ 
              width: `${((currentIndex + 1) / allItems.length) * 100}%`,
              background: 'linear-gradient(90deg, #C9A96E, #D4AF37)'
            }}
          />
        </div>
      </div>

      {/* 试营运提示弹窗 */}
      {showBetaNotice && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowBetaNotice(false)}
        >
          <div 
            className="max-w-md w-full bg-[#0A1628] rounded-2xl p-6 border border-[#C9A96E]/30"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center flex-shrink-0">
                <AlertCircle className="w-6 h-6 text-[#C9A96E]" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-white mb-2">试营运阶段</h3>
                <p className="text-sm text-gray-400 mb-4">
                  感谢您关注此{matchedItem ? ('expertise' in matchedItem ? '专家' : '需求') : ''}！
                </p>
                <p className="text-sm text-gray-400 mb-4">
                  FAC Platform 目前处于试营运阶段，甲乙双方的详细资料正在持续收集中。正式版上线后，您将可以：
                </p>
                <ul className="text-sm text-gray-400 space-y-1 mb-4">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#C9A96E]"></span>
                    查看完整的需求/专家详情
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#C9A96E]"></span>
                    使用 Smart Escrow 安全交易
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-[#C9A96E]"></span>
                    解锁深度资历解码
                  </li>
                </ul>
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
    </div>
  );
}
