/**
 * FAC Platform V5.1 - Navbar
 * P0 要求：Logo 点击必须执行 重置意图 -> 重置身份 -> 回归首页
 */

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Coins, User, Sparkles } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { useIdentity } from '../contexts/IdentityContext';
import gsap from 'gsap';

const languages = [
  { code: 'zh-HK', label: '繁體' },
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'EN' }
];

// V5.1-ALPHA 版本标记
const VERSION_TAG = 'V5.1-ALPHA';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { facBalance } = useWallet();
  const { resetIdentity, identityContext } = useIdentity();
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

  /**
   * P0 优先级：Logo 点击行为
   * 1. 重置意图 (resetIdentity)
   * 2. 重置身份 (清除 localStorage)
   * 3. 回归首页 (window.location.href = '/')
   */
  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // 1. 重置身份和意图
    resetIdentity();
    
    // 2. 视觉反馈
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current, 
        { boxShadow: '0 0 0 0 rgba(201,169,110,0)' }, 
        { 
          boxShadow: '0 0 24px 4px rgba(201,169,110,0.5)', 
          duration: 0.15, 
          yoyo: true, 
          repeat: 1 
        }
      );
    }
    
    // 3. 回归首页
    window.location.href = '/';
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { key: 'home', href: '#hero' },
    { key: 'about', href: '#about' },
    { key: 'services', href: '#services' },
    { key: 'partners', href: '#partners' },
    { key: 'contact', href: '#contact' }
  ];

  const changeLanguage = (code: string) => {
    i18n.changeLanguage(code);
    setIsLangMenuOpen(false);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  // 根据当前身份获取颜色
  const getIdentityColor = () => {
    switch (identityContext) {
      case 'A': return '#64B5F6'; // 甲方 - 蓝色
      case 'B': return '#81C784'; // 乙方 - 绿色
      default: return 'var(--champagne)';
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass py-3 shadow-lg'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between">
          {/* 
            Logo — FAC | 港匠匯
            P0: 点击重置身份 + 回归首页
          */}
          <a
            ref={logoRef}
            href="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2 group rounded-lg transition-shadow"
          >
            {/* FAC wordmark */}
            <span className="text-xl lg:text-2xl font-bold tracking-wide" style={{ color: 'var(--off-white)' }}>
              F<span style={{ color: getIdentityColor() }}>A</span>C
            </span>

            {/* Divider */}
            <span className="hidden sm:inline text-sm font-normal" style={{ color: 'rgba(201,169,110,0.3)' }}>
              &nbsp;|&nbsp;
            </span>

            {/* Brand name + CAS attribution */}
            <div className="hidden sm:flex flex-col leading-tight gap-[3px] min-w-0 max-w-[min(42vw,280px)]">
              <span
                className="font-semibold break-words"
                style={{
                  fontSize: i18n.language === 'en' ? 'clamp(0.7rem, 1.1vw, 0.82rem)' : 'clamp(0.82rem, 1.3vw, 0.95rem)',
                  color: 'var(--champagne)',
                  fontFamily: "'PingFang HK','Noto Sans TC',sans-serif",
                  letterSpacing: '0.04em'
                }}
              >
                {t('brand.title')}
              </span>
              <span
                className="break-words"
                style={{
                  fontSize: '0.58rem',
                  color: 'rgba(201,169,110,0.5)',
                  letterSpacing: '0.04em',
                  fontFamily: "'PingFang HK','Noto Sans TC',sans-serif"
                }}
              >
                {t('brand.subtitle')}
              </span>
            </div>

            {/* Mobile: localized title only */}
            <span
              className="sm:hidden font-semibold break-words max-w-[55vw]"
              style={{
                fontSize: i18n.language === 'en' ? '0.7rem' : '0.9rem',
                color: 'var(--champagne)',
                fontFamily: "'PingFang HK','Noto Sans TC',sans-serif",
                letterSpacing: '0.04em'
              }}
            >
              {t('brand.title')}
            </span>

            {/* V5.1-ALPHA 版本标记 */}
            <span 
              className="hidden lg:inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ml-2"
              style={{
                background: 'rgba(201,169,110,0.1)',
                border: '1px solid rgba(201,169,110,0.25)',
                color: 'rgba(201,169,110,0.7)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              {VERSION_TAG}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="text-sm animated-underline transition-colors duration-300"
                style={{ color: 'rgba(237,232,223,0.75)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.75)')}
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
          </div>

          {/* Right Side */}
          <div className="hidden lg:flex items-center gap-4">
            {/* 当前身份指示器 */}
            {identityContext !== 'neutral' && (
              <span 
                className="text-xs px-2.5 py-1 rounded-full font-medium"
                style={{
                  background: identityContext === 'A' ? 'rgba(33,150,243,0.1)' : 'rgba(76,175,80,0.1)',
                  border: `1px solid ${identityContext === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`,
                  color: identityContext === 'A' ? '#64B5F6' : '#81C784'
                }}
              >
                {identityContext === 'A' ? '甲方' : '乙方'}
              </span>
            )}

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                className="flex items-center gap-2 transition-colors duration-300 text-sm"
                style={{ color: 'rgba(237,232,223,0.7)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.7)')}
              >
                <Globe className="w-4 h-4" />
                <span>
                  {languages.find((l) => l.code === i18n.language)?.label || '繁體'}
                </span>
              </button>

              {isLangMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-2 py-2 rounded-lg shadow-xl border"
                  style={{
                    backgroundColor: 'var(--navy-card)',
                    borderColor: 'rgba(201,169,110,0.2)'
                  }}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className="block w-full px-4 py-2 text-sm text-left transition-colors duration-300"
                      style={{
                        color: i18n.language === lang.code ? 'var(--champagne)' : 'rgba(237,232,223,0.75)'
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
                      onMouseLeave={(e) => {
                        if (i18n.language !== lang.code) {
                          e.currentTarget.style.color = 'rgba(237,232,223,0.75)';
                        }
                      }}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* $FAC 余额 */}
            <a
              href="/wallet"
              className="flex items-center gap-2 text-sm font-medium tabular-nums wallet-balance-shimmer"
            >
              <Coins className="w-4 h-4" />
              <span>{facBalance} $FAC</span>
            </a>

            {/* 登录/注册 */}
            <a
              href="/register"
              className="flex items-center gap-1.5 text-sm transition-colors duration-300"
              style={{ color: 'rgba(237,232,223,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.8)')}
            >
              <User className="w-4 h-4" />
              登入 / 註冊
            </a>

            <a
              href="/me"
              className="flex items-center gap-1.5 text-sm transition-colors duration-300"
              style={{ color: 'rgba(237,232,223,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.8)')}
            >
              <User className="w-4 h-4" />
              个人中心
            </a>

            {/* CTA Button */}
            <button
              onClick={() => scrollToSection('#hero')}
              className="btn-gold text-sm"
            >
              {t('nav.cta')}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 transition-colors duration-300"
            style={{ color: 'var(--off-white)' }}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden absolute top-full left-0 right-0 glass"
          style={{ borderTop: '1px solid rgba(201,169,110,0.15)' }}
        >
          <div className="px-6 py-6 space-y-4">
            {/* 版本标记 (移动端) */}
            <div 
              className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-4"
              style={{
                background: 'rgba(201,169,110,0.08)',
                border: '1px solid rgba(201,169,110,0.2)',
                color: 'rgba(201,169,110,0.7)',
              }}
            >
              <Sparkles className="w-3 h-3" />
              FAC Platform {VERSION_TAG}
            </div>

            {/* 当前身份显示 */}
            {identityContext !== 'neutral' && (
              <div 
                className="px-3 py-2 rounded-lg text-sm"
                style={{
                  background: identityContext === 'A' ? 'rgba(33,150,243,0.1)' : 'rgba(76,175,80,0.1)',
                  border: `1px solid ${identityContext === 'A' ? 'rgba(33,150,243,0.3)' : 'rgba(76,175,80,0.3)'}`,
                  color: identityContext === 'A' ? '#64B5F6' : '#81C784'
                }}
              >
                当前身份：{identityContext === 'A' ? '甲方（需求方）' : '乙方（提供方）'}
              </div>
            )}

            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="block transition-colors duration-300"
                style={{ color: 'rgba(237,232,223,0.8)' }}
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}

            {/* Mobile Language Selector */}
            <div className="pt-4" style={{ borderTop: '1px solid rgba(201,169,110,0.15)' }}>
              <div className="flex gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className="text-sm transition-colors duration-300"
                    style={{
                      color: i18n.language === lang.code ? 'var(--champagne)' : 'rgba(237,232,223,0.55)'
                    }}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <a
              href="/wallet"
              className="flex items-center justify-center gap-2 py-3 text-sm font-medium wallet-balance-shimmer"
            >
              <Coins className="w-4 h-4" />
              余额: {facBalance} $FAC
            </a>

            <a
              href="/register"
              className="flex items-center justify-center gap-2 py-3 text-sm"
              style={{ color: 'rgba(237,232,223,0.8)' }}
            >
              <User className="w-4 h-4" />
              登入 / 註冊
            </a>

            <a
              href="/me"
              className="flex items-center justify-center gap-2 py-3 text-sm"
              style={{ color: 'rgba(237,232,223,0.8)' }}
            >
              <User className="w-4 h-4" />
              个人中心
            </a>

            <button
              onClick={() => scrollToSection('#hero')}
              className="btn-gold w-full mt-4"
            >
              {t('nav.cta')}
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
