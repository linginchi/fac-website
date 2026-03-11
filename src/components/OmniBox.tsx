/**
 * FAC Platform V5.1 - OmniBox (万能框)
 * 核心概念：Party A (甲方/需求方) / Party B (乙方/提供方)
 * 废除「雇主/专家」二元论
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIdentity } from '../contexts/IdentityContext';
import { Search, Briefcase, ArrowRight, Mic } from 'lucide-react';

// Party A（甲方/需求方）关键词 - 寻找服务
const PARTY_A_KEYWORDS = [
  // 中文
  '找', '需要', '尋求', '寻求', '尋找', '寻找', '請', '请', '幫我', '帮我', 
  '想要', '委託', '委托', '招', '聘', '需求', '外包', '代做', '帮忙',
  // 英文
  'find', 'need', 'looking for', 'hire', 'seek', 'want', 'help me', 
  'engage', 'outsource', 'delegate', 'commission',
];

// Party B（乙方/提供方）关键词 - 提供服务
const PARTY_B_KEYWORDS = [
  // 中文
  '我是', '提供', '擅長', '擅长', '技能', '專業', '专业', '服務', '服务', 
  '可以做', '會做', '会做', '接', '承接', '擅长', '有经验', '懂', '会',
  // 英文
  "i am", "i'm", 'provide', 'skilled in', 'expert', 'offer', 'can do', 
  'specialize', 'available', 'freelance', 'consultant',
];

function matchPartyA(text: string): boolean {
  const t = text.trim().toLowerCase();
  return PARTY_A_KEYWORDS.some((k) => t.includes(k.toLowerCase()));
}

function matchPartyB(text: string): boolean {
  const t = text.trim().toLowerCase();
  return PARTY_B_KEYWORDS.some((k) => t.includes(k.toLowerCase()));
}

type MatchType = 'A' | 'B' | null;

export default function OmniBox() {
  const { switchToA, switchToB, identityContext } = useIdentity();
  const [value, setValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchType: MatchType = value.trim() === '' ? null : matchPartyA(value) ? 'A' : matchPartyB(value) ? 'B' : null;
  const hasMatch = matchType !== null;

  // 根据当前输入推荐对应流程
  const options = hasMatch
    ? [
        matchType === 'A'
          ? { 
              type: 'A' as const, 
              icon: Search, 
              title: '发布委托（甲方流程）', 
              subtitle: '发布任务需求，平台为您匹配最合适的专业乙方',
              action: '寻找解决方案 →'
            }
          : { 
              type: 'B' as const, 
              icon: Briefcase, 
              title: '管理技能（乙方流程）', 
              subtitle: '展示您的原子化能力，接收甲方委托邀约',
              action: '维护能力矩阵 →'
            },
      ]
    : [];

  const handleSelect = useCallback(
    (type: 'A' | 'B') => {
      const intent = value.trim() || (type === 'A' ? '寻找服务' : '提供专业服务');
      if (type === 'A') {
        switchToA(intent);
        window.location.href = `/dashboard?view=a&intent=${encodeURIComponent(intent)}`;
      } else {
        switchToB(intent);
        window.location.href = `/dashboard?view=b&intent=${encodeURIComponent(intent)}`;
      }
    },
    [value, switchToA, switchToB]
  );

  useEffect(() => {
    if (!isOpen) setSelectedIndex(0);
  }, [isOpen, matchType]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || options.length === 0) {
        if (e.key === 'Escape') setIsOpen(false);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % options.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i - 1 + options.length) % options.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = options[selectedIndex];
        if (opt) handleSelect(opt.type);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, options, selectedIndex, handleSelect]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  // 显示当前身份状态
  const showIdentityBadge = identityContext !== 'neutral';

  return (
    <div ref={containerRef} className="group relative w-full" style={{ maxWidth: '680px' }}>
      {/* 身份状态指示器 */}
      {showIdentityBadge && (
        <div className="mb-2 flex items-center gap-2">
          <span 
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{ 
              background: identityContext === 'A' ? 'rgba(33,150,243,0.12)' : 'rgba(76,175,80,0.12)',
              border: `1px solid ${identityContext === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`,
              color: identityContext === 'A' ? '#64B5F6' : '#81C784'
            }}
          >
            {identityContext === 'A' ? '甲方模式 · 寻找服务' : '乙方模式 · 提供专业服务'}
          </span>
        </div>
      )}

      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="描述您的需求（甲方），或告诉我们您的专长（乙方）..."
          className="w-full rounded-xl border px-4 py-3.5 text-white placeholder-gray-400 transition-all duration-200 outline-none"
          style={{
            background: 'rgba(10,22,40,0.9)',
            borderColor: hasMatch 
              ? (matchType === 'A' ? 'rgba(33,150,243,0.5)' : 'rgba(76,175,80,0.5)')
              : 'rgba(201,169,110,0.4)',
            paddingLeft: '44px',
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hasMatch && options.length > 0) {
              e.preventDefault();
              handleSelect(options[selectedIndex].type);
            }
          }}
        />
        
        {/* 搜索图标 */}
        <Search 
          className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
          style={{ 
            color: hasMatch 
              ? (matchType === 'A' ? '#64B5F6' : '#81C784')
              : 'rgba(201,169,110,0.5)'
          }}
        />

        {/* 输入提示 */}
        {value.trim() && !hasMatch && (
          <div 
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded"
            style={{ 
              background: 'rgba(255,255,255,0.05)',
              color: 'rgba(237,232,223,0.4)'
            }}
          >
            继续输入以获取匹配
          </div>
        )}
      </div>

      {/* Focus ring */}
      <div
        className="pointer-events-none absolute inset-0 rounded-xl opacity-0 transition-opacity duration-200 group-focus-within:opacity-100"
        style={{
          boxShadow: hasMatch
            ? (matchType === 'A' ? '0 0 20px rgba(33,150,243,0.25)' : '0 0 20px rgba(76,175,80,0.25)')
            : '0 0 20px rgba(201,169,110,0.3)',
          border: `1px solid ${hasMatch ? (matchType === 'A' ? '#64B5F6' : '#81C784') : '#C9A96E'}`,
          top: showIdentityBadge ? '28px' : '0',
        }}
        aria-hidden
      />

      {/* 下拉选项 */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 z-50 mt-2 rounded-xl border shadow-2xl transition-all duration-200 overflow-hidden"
          style={{
            background: '#0F1D32',
            borderColor: hasMatch 
              ? (matchType === 'A' ? 'rgba(33,150,243,0.4)' : 'rgba(76,175,80,0.4)')
              : 'rgba(201,169,110,0.3)',
            animation: 'omni-fade-slide 0.2s ease-out',
          }}
        >
          {hasMatch ? (
            <ul className="py-1">
              {options.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <li key={opt.type}>
                    <button
                      type="button"
                      onClick={() => handleSelect(opt.type)}
                      className="flex w-full items-center gap-4 px-4 py-4 text-left transition-colors"
                      style={{
                        backgroundColor: i === selectedIndex 
                          ? (opt.type === 'A' ? 'rgba(33,150,243,0.1)' : 'rgba(76,175,80,0.1)')
                          : undefined,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = opt.type === 'A' 
                          ? 'rgba(33,150,243,0.08)' 
                          : 'rgba(76,175,80,0.08)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = i === selectedIndex 
                          ? (opt.type === 'A' ? 'rgba(33,150,243,0.1)' : 'rgba(76,175,80,0.1)')
                          : 'transparent';
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: opt.type === 'A' 
                            ? 'rgba(33,150,243,0.15)' 
                            : 'rgba(76,175,80,0.15)',
                        }}
                      >
                        <Icon 
                          className="w-6 h-6" 
                          style={{ color: opt.type === 'A' ? '#64B5F6' : '#81C784' }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-semibold text-white mb-0.5"
                          style={{ fontSize: '15px' }}
                        >
                          {opt.title}
                        </div>
                        <div 
                          className="text-sm"
                          style={{ color: 'rgba(237,232,223,0.55)' }}
                        >
                          {opt.subtitle}
                        </div>
                      </div>
                      <div 
                        className="flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                        style={{ color: opt.type === 'A' ? '#64B5F6' : '#81C784' }}
                      >
                        {opt.action}
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : value.trim() ? (
            <div 
              className="px-4 py-4 text-sm flex items-center gap-3"
              style={{ color: 'rgba(237,232,223,0.5)' }}
            >
              <div 
                className="w-2 h-2 rounded-full animate-pulse"
                style={{ background: 'rgba(201,169,110,0.5)' }}
              />
              继续输入以获取智慧匹配...
            </div>
          ) : (
            <div className="px-4 py-4 space-y-2">
              <p className="text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(201,169,110,0.5)' }}>
                热门需求示例
              </p>
              {[
                { type: 'A', text: '需要 ISO 9001 审核专家' },
                { type: 'A', text: '寻找遗嘱规划顾问' },
                { type: 'B', text: '提供粤语同声传译服务' },
                { type: 'B', text: '擅长跨境贸易合规咨询' },
              ].map((example, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setValue(example.text);
                    inputRef.current?.focus();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors hover:bg-white/5"
                  style={{ color: 'rgba(237,232,223,0.6)' }}
                >
                  <span 
                    className="inline-block w-4 text-xs mr-2"
                    style={{ color: example.type === 'A' ? '#64B5F6' : '#81C784' }}
                  >
                    {example.type === 'A' ? '找' : '供'}
                  </span>
                  {example.text}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes omni-fade-slide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
