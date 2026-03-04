import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, X, Globe } from 'lucide-react';

const languages = [
  { code: 'zh-CN', label: '简体' },
  { code: 'zh-HK', label: '繁體' },
  { code: 'en', label: 'EN' }
];

export default function Navbar() {
  const { t, i18n } = useTranslation();
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
          {/* Logo */}
          <a
            href="#hero"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('#hero');
            }}
            className="flex items-center gap-2 group"
          >
            <span className="text-2xl font-bold text-white">
              F<span className="text-[#FFD700]">A</span>C
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
                className="text-sm text-white/80 hover:text-[#FFD700] transition-colors duration-300 animated-underline"
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
                className="flex items-center gap-2 text-white/80 hover:text-[#FFD700] transition-colors duration-300"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">
                  {languages.find((l) => l.code === i18n.language)?.label || '繁體'}
                </span>
              </button>
              
              {isLangMenuOpen && (
                <div className="absolute top-full right-0 mt-2 py-2 bg-[#1A1A1A] border border-white/10 rounded-lg shadow-xl">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`block w-full px-4 py-2 text-sm text-left transition-colors duration-300 ${
                        i18n.language === lang.code
                          ? 'text-[#FFD700]'
                          : 'text-white/80 hover:text-[#FFD700]'
                      }`}
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

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
            className="lg:hidden text-white p-2"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 glass border-t border-white/10">
          <div className="px-6 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.key}
                href={link.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(link.href);
                }}
                className="block text-white/80 hover:text-[#FFD700] transition-colors duration-300"
              >
                {t(`nav.${link.key}`)}
              </a>
            ))}
            
            {/* Mobile Language Selector */}
            <div className="pt-4 border-t border-white/10">
              <div className="flex gap-4">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => changeLanguage(lang.code)}
                    className={`text-sm transition-colors duration-300 ${
                      i18n.language === lang.code
                        ? 'text-[#FFD700]'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>
            
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
