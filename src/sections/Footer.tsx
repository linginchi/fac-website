import { useEffect, useRef } from 'react';
import { Linkedin, MessageCircle, Facebook } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-col',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(
        '.footer-bottom',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          delay: 0.5,
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { label: '首頁', href: '#hero' },
    { label: '關於我們', href: '#about' },
    { label: '八大支柱', href: '#services' },
    { label: '代幣經濟', href: '#token' },
    { label: '合作夥伴', href: '#partners' },
    { label: '聯絡我們', href: '#contact' }
  ];

  const expertiseLinks = [
    '跨境貿易與國際合規',
    '高級零售與品牌管理',
    '家族財富與企業傳承',
    '精密製造與工藝傳承',
    '企業融資與現金流管理'
  ];

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: MessageCircle, href: '#', label: 'WhatsApp' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative"
      style={{
        backgroundColor: '#060F1E',
        borderTop: '1px solid rgba(201,169,110,0.12)'
      }}
    >
      {/* Gold top line */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.4), transparent)'
        }}
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* Brand Column */}
          <div className="footer-col opacity-0">
            <a href="#hero" className="inline-block mb-2">
              <span
                className="text-2xl font-bold tracking-wide"
                style={{ color: 'var(--off-white)' }}
              >
                F<span style={{ color: 'var(--champagne)' }}>A</span>C
              </span>
              <span
                className="ml-2 text-base font-medium"
                style={{ color: 'var(--champagne)' }}
              >
                港匠匯
              </span>
            </a>
            <p
              className="text-xs mb-1 tracking-widest uppercase"
              style={{ color: 'rgba(201,169,110,0.45)' }}
            >
              Facilitating Artisan Collective
            </p>
            <p
              className="text-sm mt-5 leading-relaxed"
              style={{ color: 'rgba(237,232,223,0.5)' }}
            >
              香港首個退休精英智慧共享平台。
              連結企業與業界老江湖，讓數十年的商業智慧，滋養香港的下一代。
            </p>
            <div className="flex gap-3 mt-6">
              {socialLinks.map((link, i) => {
                const Icon = link.icon;
                return (
                  <a
                    key={i}
                    href={link.href}
                    className="w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(201,169,110,0.08)',
                      border: '1px solid rgba(201,169,110,0.15)'
                    }}
                    aria-label={link.label}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,169,110,0.2)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,169,110,0.08)';
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.15)';
                    }}
                  >
                    <Icon
                      className="w-4 h-4 transition-colors duration-300"
                      style={{ color: 'rgba(201,169,110,0.6)' }}
                    />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col opacity-0">
            <h4
              className="font-semibold mb-6 text-sm tracking-wider uppercase"
              style={{ color: 'var(--off-white)' }}
            >
              快速連結
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link, i) => (
                <li key={i}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-sm transition-all duration-300 inline-block"
                    style={{ color: 'rgba(237,232,223,0.55)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--champagne)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,223,0.55)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Expertise */}
          <div className="footer-col opacity-0">
            <h4
              className="font-semibold mb-6 text-sm tracking-wider uppercase"
              style={{ color: 'var(--off-white)' }}
            >
              專業領域
            </h4>
            <ul className="space-y-3">
              {expertiseLinks.map((label, i) => (
                <li key={i}>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('#services');
                    }}
                    className="text-sm transition-all duration-300 inline-block"
                    style={{ color: 'rgba(237,232,223,0.55)' }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'var(--champagne)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,223,0.55)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateX(0)';
                    }}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 聯絡入口：僅引導至萬能框，不展示實體聯絡方式 */}
          <div className="footer-col opacity-0">
            <h4
              className="font-semibold mb-6 text-sm tracking-wider uppercase"
              style={{ color: 'var(--off-white)' }}
            >
              聯絡我們
            </h4>
            <p className="text-sm mb-4" style={{ color: 'rgba(237,232,223,0.5)', lineHeight: 1.7 }}>
              所有溝通請經由首頁萬能框，由 FAC 港匠匯 智慧諮詢處理。
            </p>
            <a
              href="#hero"
              onClick={(e) => { e.preventDefault(); scrollToSection('#hero'); }}
              className="text-sm font-medium transition-colors duration-300 inline-block"
              style={{ color: 'var(--champagne)' }}
              onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.textDecoration = 'underline'}
              onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.textDecoration = 'none'}
            >
              前往智慧諮詢視窗 →
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          className="footer-bottom mt-16 pt-8 opacity-0"
          style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p className="text-sm" style={{ color: 'rgba(237,232,223,0.35)' }}>
                © 2025 FAC | 港匠匯 · Facilitating Artisan Collective. 版權所有。
              </p>
            </div>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-sm transition-colors duration-300"
                style={{ color: 'rgba(237,232,223,0.35)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.35)')}
              >
                隱私政策
              </a>
              <a
                href="#"
                className="text-sm transition-colors duration-300"
                style={{ color: 'rgba(237,232,223,0.35)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.35)')}
              >
                使用條款
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
