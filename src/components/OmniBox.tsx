/**
 * FAC Platform V5.1 - OmniBox (万能框)
 * Google Search Bar 风格 - 简洁、居中、优雅
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { useIdentity } from '../contexts/IdentityContext';
import { Search, Briefcase, ArrowRight, Mic, Sparkles } from 'lucide-react';

// Party A（甲方/需求方）关键词
const PARTY_A_KEYWORDS = [
  '找', '需要', '尋求', '寻求', '尋找', '寻找', '請', '请', '幫我', '帮我', 
  '想要', '委託', '委托', '招', '聘', '需求', '外包', '代做', '帮忙',
  'find', 'need', 'looking for', 'hire', 'seek', 'want', 'help me', 
  'engage', 'outsource', 'delegate', 'commission',
];

// Party B（乙方/提供方）关键词
const PARTY_B_KEYWORDS = [
  '我是', '提供', '擅長', '擅长', '技能', '專業', '专业', '服務', '服务', 
  '可以做', '會做', '会做', '接', '承接', '擅长', '有经验', '懂', '会',
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
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const matchType: MatchType = value.trim() === '' ? null : matchPartyA(value) ? 'A' : matchPartyB(value) ? 'B' : null;
  const hasMatch = matchType !== null;

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
    const onClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    window.addEventListener('mousedown', onClickOutside);
    return () => window.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Google风格搜索框 */}
      <div 
        className={`relative rounded-full transition-all duration-300 ${
          isFocused ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
        }`}
        style={{
          background: 'rgba(13, 31, 60, 0.95)',
          border: `2px solid ${
            isFocused 
              ? 'rgba(201, 169, 110, 0.6)' 
              : hasMatch 
                ? (matchType === 'A' ? 'rgba(33, 150, 243, 0.5)' : 'rgba(76, 175, 80, 0.5)')
                : 'rgba(201, 169, 110, 0.2)'
          }`,
          boxShadow: isFocused 
            ? '0 8px 32px rgba(201, 169, 110, 0.2), 0 0 0 4px rgba(201, 169, 110, 0.05)' 
            : '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {/* 左侧搜索图标 */}
        <div className="absolute left-5 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search 
            className="w-5 h-5 transition-colors duration-200"
            style={{ 
              color: hasMatch 
                ? (matchType === 'A' ? '#64B5F6' : '#81C784')
                : 'rgba(201, 169, 110, 0.5)'
            }}
          />
        </div>

        {/* 输入框 */}
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && hasMatch) {
              e.preventDefault();
              handleSelect(matchType!);
            }
          }}
          placeholder={identityContext === 'A' 
            ? '描述您的需求，例如：寻找SFC合规顾问...' 
            : identityContext === 'B'
              ? '描述您的专长，例如：我是退休银行风控专家...'
              : '描述您的需求（甲方）或专长（乙方）...'}
          className="w-full bg-transparent text-white placeholder-gray-500 outline-none"
          style={{
            padding: '16px 60px 16px 52px',
            fontSize: '16px',
            fontFamily: "'PingFang HK', 'Noto Sans TC', sans-serif",
          }}
        />

        {/* 右侧操作区 */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* 清除按钮 */}
          {value && (
            <button
              onClick={() => {
                setValue('');
                inputRef.current?.focus();
              }}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            >
              <span className="text-gray-500 text-lg">×</span>
            </button>
          )}
          
          {/* 语音按钮 */}
          <button
            onClick={() => {
              // 触发语音输入
              if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
                const recognition = new (window as any).webkitSpeechRecognition();
                recognition.lang = 'zh-HK';
                recognition.onresult = (e: any) => {
                  const transcript = e.results[0][0].transcript;
                  setValue(transcript);
                };
                recognition.start();
              }
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:bg-white/10"
          >
            <Mic className="w-5 h-5 text-[#C9A96E]" />
          </button>
        </div>

        {/* 底部动态边框效果 */}
        {hasMatch && (
          <div 
            className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
            style={{
              background: matchType === 'A' 
                ? 'linear-gradient(90deg, transparent, #64B5F6, transparent)'
                : 'linear-gradient(90deg, transparent, #81C784, transparent)',
              opacity: 0.6,
            }}
          />
        )}
      </div>

      {/* 下拉建议面板 */}
      {isOpen && hasMatch && (
        <div 
          className="absolute top-full left-0 right-0 mt-2 rounded-2xl overflow-hidden z-50"
          style={{
            background: 'linear-gradient(180deg, rgba(13,31,60,0.98) 0%, rgba(10,22,40,0.99) 100%)',
            border: `1px solid ${matchType === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`,
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* 智能识别提示 */}
          <div 
            className="px-4 py-2 text-xs border-b"
            style={{ 
              borderColor: matchType === 'A' ? 'rgba(33,150,243,0.15)' : 'rgba(76,175,80,0.15)',
              background: matchType === 'A' ? 'rgba(33,150,243,0.08)' : 'rgba(76,175,80,0.08)',
              color: matchType === 'A' ? '#64B5F6' : '#81C784'
            }}
          >
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              已识别为{matchType === 'A' ? '甲方（需求方）' : '乙方（提供方）'}模式
            </span>
          </div>

          {/* 主选项 */}
          <button
            onClick={() => handleSelect(matchType!)}
            className="w-full px-5 py-4 flex items-center gap-4 transition-colors hover:bg-white/5 text-left"
          >
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ 
                background: matchType === 'A' 
                  ? 'linear-gradient(135deg, rgba(33,150,243,0.2) 0%, rgba(33,150,243,0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(76,175,80,0.2) 0%, rgba(76,175,80,0.05) 100%)',
                border: `1px solid ${matchType === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`,
              }}
            >
              {matchType === 'A' ? (
                <Briefcase className="w-5 h-5 text-[#64B5F6]" />
              ) : (
                <svg className="w-5 h-5 text-[#81C784]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white">
                {matchType === 'A' ? '发布委托需求' : '完善专家档案'}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {matchType === 'A' 
                  ? '描述您的项目需求，AI为您匹配最合适的专业乙方'
                  : '展示您的专业技能，接收甲方的委托邀约'}
              </p>
            </div>
            <ArrowRight 
              className="w-5 h-5 flex-shrink-0"
              style={{ color: matchType === 'A' ? '#64B5F6' : '#81C784' }}
            />
          </button>

          {/* 快捷标签 */}
          <div className="px-5 pb-4 pt-2">
            <p className="text-xs text-gray-600 mb-2">热门搜索</p>
            <div className="flex flex-wrap gap-2">
              {(matchType === 'A' 
                ? ['SFC合规', '跨境融资', 'IPO审计', '税务筹划', '风控顾问']
                : ['退休银行家', '注册会计师', '法律顾问', '工程监理', '贸易专家']
              ).map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    setValue(tag);
                    inputRef.current?.focus();
                  }}
                  className="px-3 py-1.5 rounded-full text-xs transition-colors hover:bg-white/10"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(201,169,110,0.8)',
                    border: '1px solid rgba(201,169,110,0.15)',
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
