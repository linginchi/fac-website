import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowRight, ChevronDown } from 'lucide-react';
import gsap from 'gsap';
import { useSiteConfig } from '../hooks/useSiteConfig';

export default function Hero() {
  const { i18n } = useTranslation();
  const { config } = useSiteConfig();
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<HTMLDivElement>(null);
  const tagRef = useRef<HTMLSpanElement>(null);

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

      // Tag animation
      tl.fromTo(
        tagRef.current,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.6 },
        0.3
      );

      // Title lines animation
      const titleLines = titleRef.current?.querySelectorAll('.title-line');
      if (titleLines) {
        titleLines.forEach((line, index) => {
          tl.fromTo(
            line,
            { rotateX: -90, y: 50, opacity: 0 },
            { rotateX: 0, y: 0, opacity: 1, duration: 0.8 },
            0.5 + index * 0.15
          );
        });
      }

      // Subtitle animation
      tl.fromTo(
        subtitleRef.current,
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
        1
      );

      // CTA buttons animation
      tl.fromTo(
        ctaRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6 },
        1.2
      );

      // 3D Cube animation
      tl.fromTo(
        cubeRef.current,
        { rotateY: 180, rotateX: 45, scale: 0.5, opacity: 0 },
        { rotateY: 0, rotateX: 0, scale: 1, opacity: 1, duration: 1.4 },
        0.4
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
      className="relative min-h-screen flex items-center overflow-hidden bg-black"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#0A0A0A] to-[#1A1A1A]" />
      
      {/* Gold Accent Glow */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#FFD700]/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-[#FFD700]/3 rounded-full blur-[100px]" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            {/* Tagline */}
            <span
              ref={tagRef}
              className="section-tag opacity-0"
            >
              {isEnglish ? config.hero.taglineEn : config.hero.tagline}
            </span>

            {/* Title */}
            <div ref={titleRef} className="space-y-2" style={{ perspective: '1000px' }}>
              <h1 className="title-line text-4xl sm:text-5xl lg:text-6xl font-bold text-white opacity-0">
                {isEnglish ? config.hero.title1En : config.hero.title1}
              </h1>
              <h1 className="title-line text-4xl sm:text-5xl lg:text-6xl font-bold text-gold-gradient opacity-0">
                {isEnglish ? config.hero.title2En : config.hero.title2}
              </h1>
            </div>

            {/* Subtitle */}
            <p
              ref={subtitleRef}
              className="text-lg text-white/70 max-w-xl leading-relaxed opacity-0"
            >
              {isEnglish ? config.hero.subtitleEn : config.hero.subtitle}
            </p>

            {/* CTA Buttons */}
            <div ref={ctaRef} className="flex flex-wrap gap-4 opacity-0">
              <button
                onClick={() => scrollToSection('#services')}
                className="btn-gold flex items-center gap-2 group"
              >
                {isEnglish ? config.hero.cta1En : config.hero.cta1}
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => scrollToSection('#contact')}
                className="btn-outline"
              >
                {isEnglish ? config.hero.cta2En : config.hero.cta2}
              </button>
            </div>
          </div>

          {/* Right Content - 3D Cube */}
          <div className="hidden lg:flex justify-center items-center">
            <div
              ref={cubeRef}
              className="relative w-80 h-80 opacity-0"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1200px'
              }}
            >
              <img
                src="/hero-cube.png"
                alt="3D Cube"
                className="w-full h-full object-contain animate-rotate-slow"
              />
              
              {/* Floating Particles */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-2 h-2 bg-[#FFD700]/40 rounded-full animate-float"
                    style={{
                      top: `${20 + i * 15}%`,
                      left: `${10 + i * 15}%`,
                      animationDelay: `${i * 0.5}s`
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <button
          onClick={() => scrollToSection('#about')}
          className="flex flex-col items-center gap-2 text-white/50 hover:text-[#FFD700] transition-colors duration-300"
        >
          <span className="text-xs tracking-wider">{isEnglish ? 'Scroll Down' : '向下滚动'}</span>
          <ChevronDown className="w-5 h-5 animate-bounce-gentle" />
        </button>
      </div>
    </section>
  );
}
