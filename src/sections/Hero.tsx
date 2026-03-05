import { useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import gsap from 'gsap';

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const decorRef = useRef<HTMLDivElement>(null);

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

      tl.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        1.1
      );

      tl.fromTo(
        ctaRef.current,
        { scale: 0.85, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.7 },
        1.4
      );

      tl.fromTo(
        decorRef.current,
        { x: 60, opacity: 0 },
        { x: 0, opacity: 1, duration: 1.2 },
        0.5
      );
    }, heroRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      {/* Background — layered midnight blue gradients */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, #0A1628 0%, #0D1F3C 50%, #0A1628 100%)'
        }}
      />

      {/* Champagne glow orbs */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '15%',
          right: '10%',
          width: '480px',
          height: '480px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.07) 0%, transparent 70%)',
          filter: 'blur(40px)'
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '20%',
          left: '5%',
          width: '320px',
          height: '320px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(201,169,110,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,169,110,0.04) 1px, transparent 1px)',
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* Left Content */}
          <div className="space-y-8">

            {/* Section Tag */}
            <span
              ref={tagRef}
              className="section-tag opacity-0 block"
            >
              FAC &nbsp;·&nbsp; 港匠匯
            </span>

            {/* Hero Title */}
            <div ref={titleRef} className="space-y-1" style={{ perspective: '1000px' }}>
              <h1
                className="title-line font-bold leading-tight opacity-0"
                style={{
                  fontSize: 'clamp(2.4rem, 5vw, 4rem)',
                  color: 'var(--off-white)',
                  fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif",
                  letterSpacing: '0.04em'
                }}
              >
                智慧沉澱，
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
            <div className="space-y-3">
              <p
                ref={subtitleRef}
                className="opacity-0"
                style={{
                  color: 'rgba(237,232,223,0.78)',
                  fontSize: 'clamp(0.95rem, 2vw, 1.1rem)',
                  lineHeight: '1.9',
                  maxWidth: '520px'
                }}
              >
                香港首個退休精英智慧共享平台。
                <br className="hidden sm:block" />
                <span style={{ color: 'rgba(237,232,223,0.6)', fontStyle: 'italic' }}>
                  致企業：有些答案，不在數據庫，在老江湖的眉頭一皺。
                </span>
              </p>
            </div>

            {/* CTA Buttons */}
            <div
              ref={ctaRef}
              className="opacity-0 flex flex-col sm:flex-row gap-4"
            >
              {/* 金邊透明底 */}
              <button
                onClick={() => scrollToSection('#contact')}
                className="btn-outline text-center sm:text-left"
                style={{ whiteSpace: 'nowrap' }}
              >
                成為導師：灌溉下一代
              </button>

              {/* 金底黑字 */}
              <button
                onClick={() => scrollToSection('#services')}
                className="btn-gold text-center sm:text-left"
                style={{ whiteSpace: 'nowrap' }}
              >
                尋求專家：與老江湖對話
              </button>
            </div>

            {/* Trust line */}
            <p
              className="text-xs tracking-widest uppercase"
              style={{ color: 'rgba(201,169,110,0.45)' }}
            >
              Facilitating Artisan Collective &nbsp;·&nbsp; Est. Hong Kong
            </p>
          </div>

          {/* Right Content — decorative visual */}
          <div
            ref={decorRef}
            className="hidden lg:flex justify-center items-center opacity-0"
          >
            <div className="relative w-80 h-80">
              {/* Outer ring */}
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  border: '1px solid rgba(201,169,110,0.15)',
                  animation: 'rotate-slow 40s linear infinite'
                }}
              />
              {/* Middle ring */}
              <div
                className="absolute rounded-full"
                style={{
                  inset: '30px',
                  border: '1px solid rgba(201,169,110,0.25)',
                  animation: 'rotate-slow 25s linear infinite reverse'
                }}
              />
              {/* Inner ring */}
              <div
                className="absolute rounded-full"
                style={{
                  inset: '70px',
                  border: '2px solid rgba(201,169,110,0.4)',
                  boxShadow: '0 0 30px rgba(201,169,110,0.1)',
                  animation: 'rotate-slow 15s linear infinite'
                }}
              />
              {/* Center content */}
              <div
                className="absolute inset-0 flex flex-col items-center justify-center"
              >
                <span
                  className="text-4xl font-bold text-gold-gradient"
                  style={{
                    fontFamily: "'PingFang HK', 'Noto Sans TC', sans-serif",
                    letterSpacing: '0.05em'
                  }}
                >
                  匠
                </span>
                <span
                  className="mt-2 text-xs tracking-[0.3em] uppercase"
                  style={{ color: 'rgba(201,169,110,0.6)' }}
                >
                  ARTISAN
                </span>
              </div>

              {/* Floating dots */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full animate-float"
                  style={{
                    backgroundColor: 'rgba(201,169,110,0.5)',
                    top: `${15 + i * 14}%`,
                    left: `${8 + i * 16}%`,
                    animationDelay: `${i * 0.6}s`
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => scrollToSection('#about')}
          className="flex flex-col items-center gap-2 transition-colors duration-300"
          style={{ color: 'rgba(201,169,110,0.5)' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(201,169,110,0.5)')}
        >
          <span className="text-xs tracking-wider">向下滾動</span>
          <ChevronDown className="w-5 h-5 animate-bounce-gentle" />
        </button>
      </div>
    </section>
  );
}
