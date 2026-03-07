import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe, Coins, User } from 'lucide-react';
import { useWallet } from '../context/WalletContext';

const languages = [
  { code: 'zh-HK', label: '繁體' },
  { code: 'zh-CN', label: '简体' },
  { code: 'en', label: 'EN' }
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { facBalance } = useWallet();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);

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
    { key: 'token', href: '#token' },
    { key: 'team', href: '#team' },
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
          {/* Logo — FAC | 港匠匯 · CAS Laboratory */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <span className="text-xl lg:text-2xl font-bold tracking-wide" style={{ color: 'var(--off-white)' }}>
              F<span style={{ color: 'var(--champagne)' }}>A</span>C
            </span>
            <span className="hidden sm:inline text-sm font-normal tracking-widest" style={{ color: 'rgba(201,169,110,0.45)' }}>
              &nbsp;|&nbsp;
            </span>
            <div className="hidden sm:flex flex-col leading-none">
              <span className="text-sm lg:text-base font-medium tracking-wider" style={{ color: 'var(--champagne)' }}>
                港匠匯
              </span>
              <span className="text-[9px] tracking-widest" style={{ color: 'rgba(201,169,110,0.45)', letterSpacing: '0.12em' }}>
                CAS Laboratory · 非盈利
              </span>
            </div>
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

            {/* 餘額：香檳金 + 細微閃爍，點擊進入 /wallet */}
            <a
              href="/wallet"
              className="flex items-center gap-2 text-sm font-medium tabular-nums wallet-balance-shimmer"
            >
              <Coins className="w-4 h-4" />
              <span>餘額: {facBalance} $FAC</span>
            </a>
            <a
              href="/profile"
              className="flex items-center gap-1.5 text-sm transition-colors duration-300"
              style={{ color: 'rgba(237,232,223,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.8)')}
            >
              <User className="w-4 h-4" />
              個人中心
            </a>
            <a
              href="/register"
              className="text-sm transition-colors duration-300"
              style={{ color: 'rgba(237,232,223,0.8)' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.8)')}
            >
              註冊 / 登入
            </a>
            {/* CTA Button */}
            <button
              onClick={() => scrollToSection('#contact')}
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
              餘額: {facBalance} $FAC
            </a>
            <a
              href="/profile"
              className="flex items-center justify-center gap-2 py-3 text-sm"
              style={{ color: 'rgba(237,232,223,0.8)' }}
            >
              <User className="w-4 h-4" />
              個人中心
            </a>
            <a
              href="/register"
              className="block text-center py-3 border rounded-lg transition-colors mt-4"
              style={{ borderColor: 'rgba(201,169,110,0.35)', color: 'var(--champagne)' }}
            >
              註冊 / 登入
            </a>
            <button
              onClick={() => scrollToSection('#contact')}
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
