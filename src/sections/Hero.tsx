import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Mic, Paperclip, ArrowRight, Sparkles } from 'lucide-react';
import gsap from 'gsap';

const suggestions = [
  '幫我找跨境貿易合規專家',
  '家族信託架構如何設計？',
  '尋找 SFC 持牌 RO 顧問',
  '企業融資談判老江湖',
];

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const commandRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const [commandValue, setCommandValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      tl.fromTo(
        tagRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.7 },
        0.3
      );

      const titleLines = titleRef.current?.querySelectorAll('.title-line');
      if (titleLines) {
        titleLines.forEach((line, i) => {
          tl.fromTo(
            line,
            { rotateX: -90, y: 60, opacity: 0 },
            { rotateX: 0, y: 0, opacity: 1, duration: 0.9 },
            0.6 + i * 0.18
          );
        });
      }

      tl.fromTo(subtitleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 }, 1.1);
      tl.fromTo(commandRef.current, { y: 44, scale: 0.97, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1 }, 1.35);
      tl.fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 }, 1.8);
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      {/* Layered background */}
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)' }}
      />

      {/* Glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '10%', right: '8%',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '15%', left: '3%',
          width: '380px', height: '380px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Command-box focus glow */}
      <div
        className="absolute pointer-events-none transition-opacity duration-700"
        style={{
          top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          width: '900px', height: '280px', borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(201,169,110,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)',
          opacity: isFocused ? 1 : 0
        }}
      />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(201,169,110,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.035) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 lg:px-12 py-32 text-center">

        {/* Section tag */}
        <span
          ref={tagRef}
          className="section-tag opacity-0 inline-flex items-center gap-2 mb-8"
        >
          <Sparkles className="w-3 h-3" />
          FAC &nbsp;·&nbsp; Web3 去中心化智慧對接平台
        </span>

        {/* Title */}
        <div ref={titleRef} className="space-y-1 mb-6" style={{ perspective: '1000px' }}>
          <h1
            className="title-line font-bold leading-tight opacity-0"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              color: 'var(--off-white)',
              fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
              letterSpacing: '0.04em'
            }}
          >
            智慧沈澱，
          </h1>
          <h1
            className="title-line font-bold leading-tight opacity-0 text-gold-gradient"
            style={{
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
              letterSpacing: '0.04em'
            }}
          >
            在此相遇。
          </h1>
        </div>

        {/* Subtitle */}
        <p
          ref={subtitleRef}
          className="opacity-0 mb-10 mx-auto"
          style={{
            color: 'rgba(237,232,223,0.7)',
            fontSize: 'clamp(0.9rem, 2vw, 1.05rem)',
            lineHeight: '1.9',
            maxWidth: '560px'
          }}
        >
          香港首個 Web3 去中心化對接平台。有些答案，不在數據庫，
          <br className="hidden sm:block" />
          <span style={{ color: 'rgba(201,169,110,0.9)', fontStyle: 'italic' }}>
            在老江湖的腦袋中。
          </span>
        </p>

        {/* ═══════════════════════════════════════════
            萬能指揮框  Command Box
        ════════════════════════════════════════════ */}
        <div ref={commandRef} className="opacity-0 mb-8">
          <div
            className="relative mx-auto transition-all duration-500"
            style={{
              maxWidth: '740px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(13,31,60,0.96) 0%, rgba(10,22,40,0.99) 100%)',
              border: isFocused
                ? '1px solid rgba(201,169,110,0.55)'
                : '1px solid rgba(201,169,110,0.2)',
              boxShadow: isFocused
                ? '0 0 48px rgba(201,169,110,0.13), 0 12px 40px rgba(0,0,0,0.45)'
                : '0 6px 28px rgba(0,0,0,0.35)',
              backdropFilter: 'blur(24px)'
            }}
          >
            {/* $FAC badge */}
            <div className="absolute -top-3.5 right-5">
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'linear-gradient(135deg, rgba(10,22,40,0.99) 0%, rgba(13,31,60,0.96) 100%)',
                  border: '1px solid rgba(201,169,110,0.35)',
                  color: 'var(--champagne)'
                }}
              >
                $FAC &nbsp;<span style={{ opacity: 0.55 }}>· Token to Decode</span>
              </span>
            </div>

            {/* Input row */}
            <div className="flex items-center px-5 py-4 gap-3">
              {/* Artisan mark */}
              <div
                className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.07) 100%)',
                  border: '1px solid rgba(201,169,110,0.28)'
                }}
              >
                <span
                  className="text-xs font-bold"
                  style={{ color: 'var(--champagne)', fontFamily: "'PingFang HK', sans-serif" }}
                >
                  匠
                </span>
              </div>

              <input
                type="text"
                value={commandValue}
                onChange={(e) => setCommandValue(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => { if (e.key === 'Enter') scrollToSection('#services'); }}
                placeholder="請描述您的需求，AI Agent 將為您配對最合適的智慧顧問..."
                className="flex-1 bg-transparent outline-none text-sm lg:text-base min-w-0"
                style={{
                  color: 'var(--off-white)',
                  caretColor: 'var(--champagne)'
                }}
              />

              {/* Action icons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {[
                  { Icon: Mic, title: '語音輸入' },
                  { Icon: Paperclip, title: '上傳文件' }
                ].map(({ Icon, title }) => (
                  <button
                    key={title}
                    title={title}
                    className="w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 hover:bg-white/10"
                    style={{ color: 'rgba(201,169,110,0.45)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--champagne)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(201,169,110,0.45)'; }}
                  >
                    <Icon className="w-4 h-4" />
                  </button>
                ))}

                <button
                  onClick={() => scrollToSection('#services')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-300 group"
                  style={{
                    background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)',
                    color: '#0A1628'
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  配對
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </button>
              </div>
            </div>

            {/* Divider */}
            <div
              style={{
                height: '1px',
                background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.15), transparent)',
                margin: '0 20px'
              }}
            />

            {/* Suggestion chips */}
            <div className="flex flex-wrap items-center gap-2 px-5 py-3">
              <span
                className="text-xs flex-shrink-0"
                style={{ color: 'rgba(201,169,110,0.45)' }}
              >
                快速提問：
              </span>
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setCommandValue(s)}
                  className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: 'rgba(201,169,110,0.07)',
                    border: '1px solid rgba(201,169,110,0.14)',
                    color: 'rgba(237,232,223,0.65)'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.42)';
                    (e.currentTarget as HTMLElement).style.color = 'var(--champagne)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.14)';
                    (e.currentTarget as HTMLElement).style.color = 'rgba(237,232,223,0.65)';
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Supports line */}
          <p
            className="mt-3 text-xs text-center"
            style={{ color: 'rgba(201,169,110,0.35)' }}
          >
            支持文字 · 語音 · 多模態文件上傳 &nbsp;|&nbsp; Powered by AI Agent (Sonnet 4.6)
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="opacity-0 flex flex-col sm:flex-row gap-4 justify-center items-center"
        >
          <button
            onClick={() => scrollToSection('#contact')}
            className="btn-outline"
            style={{ whiteSpace: 'nowrap' }}
          >
            成為智慧導師
          </button>
          <button
            onClick={() => scrollToSection('#about')}
            className="btn-gold"
            style={{ whiteSpace: 'nowrap' }}
          >
            了解 FAC 平台
          </button>
        </div>

        {/* Trust line */}
        <p
          className="mt-10 text-xs tracking-widest uppercase"
          style={{ color: 'rgba(201,169,110,0.3)' }}
        >
          Facilitating Artisan Collective &nbsp;·&nbsp; Web3 · Decentralized · Est. Hong Kong
        </p>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => scrollToSection('#about')}
          className="flex flex-col items-center gap-2 transition-colors duration-300"
          style={{ color: 'rgba(201,169,110,0.5)' }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = 'var(--champagne)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = 'rgba(201,169,110,0.5)')}
        >
          <span className="text-xs tracking-wider">向下滾動</span>
          <ChevronDown className="w-5 h-5 animate-bounce-gentle" />
        </button>
      </div>
    </section>
  );
}
