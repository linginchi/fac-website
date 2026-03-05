import { useEffect, useRef } from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        imageRef.current,
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      const items = contentRef.current?.querySelectorAll('.animate-item');
      if (items) {
        gsap.fromTo(
          items,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.12,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      gsap.to(imageRef.current, {
        y: -40,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }, sectionRef);

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
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-36 overflow-hidden"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      {/* Background accents */}
      <div
        className="absolute top-0 right-0 w-1/2 h-full pointer-events-none"
        style={{
          background: 'linear-gradient(to left, rgba(201,169,110,0.04) 0%, transparent 100%)'
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — visual panel */}
          <div
            ref={imageRef}
            className="opacity-0"
            style={{ perspective: '1000px' }}
          >
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(201,169,110,0.15)' }}
            >
              {/* Decorative visual block instead of image */}
              <div
                className="w-full h-[480px] lg:h-[560px] flex items-center justify-center relative"
                style={{
                  background: 'linear-gradient(145deg, var(--navy-card) 0%, #0A1628 100%)'
                }}
              >
                {/* Large Chinese character motif */}
                <div className="text-center select-none">
                  <div
                    className="text-[9rem] lg:text-[12rem] font-black leading-none"
                    style={{
                      background: 'linear-gradient(180deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.04) 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontFamily: "'PingFang HK', 'Noto Sans TC', sans-serif"
                    }}
                  >
                    紮
                  </div>
                  <div
                    className="text-xs tracking-[0.5em] uppercase mt-4"
                    style={{ color: 'rgba(201,169,110,0.3)' }}
                  >
                    CRAFTMANSHIP
                  </div>
                </div>

                {/* Corner ornaments */}
                <div
                  className="absolute top-4 left-4 w-8 h-8"
                  style={{
                    borderTop: '2px solid rgba(201,169,110,0.4)',
                    borderLeft: '2px solid rgba(201,169,110,0.4)'
                  }}
                />
                <div
                  className="absolute bottom-4 right-4 w-8 h-8"
                  style={{
                    borderBottom: '2px solid rgba(201,169,110,0.4)',
                    borderRight: '2px solid rgba(201,169,110,0.4)'
                  }}
                />
              </div>

              {/* Hover gold border effect */}
              <div
                className="absolute inset-0 rounded-2xl pointer-events-none transition-opacity duration-500 opacity-0 hover:opacity-100"
                style={{ border: '1px solid rgba(201,169,110,0.35)' }}
              />
            </div>

            {/* Decorative offset square */}
            <div
              className="absolute -bottom-5 -right-5 w-28 h-28 rounded-xl -z-10"
              style={{ border: '1px solid rgba(201,169,110,0.2)' }}
            />
          </div>

          {/* Right — content */}
          <div ref={contentRef} className="space-y-8 lg:pt-4">

            {/* Section Tag */}
            <span className="animate-item section-tag opacity-0 block">
              關於我們
            </span>

            {/* Title */}
            <h2
              className="animate-item font-bold opacity-0"
              style={{
                fontSize: 'clamp(1.5rem, 3vw, 2.2rem)',
                color: 'var(--off-white)',
                lineHeight: '1.6',
                letterSpacing: '0.03em',
                fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
              }}
            >
              香港之所以成為香港，<br />
              是因為一代又一代人的「紮實」。
            </h2>

            {/* Story paragraphs */}
            <div className="animate-item space-y-5 opacity-0">
              <p style={{ color: 'rgba(237,232,223,0.78)', lineHeight: '1.9' }}>
                石屎森林裡，每一塊磚都是汗水砌成的。
                獅子山下，沒有人憑空得到什麼——憑的是一雙手、一顆心、幾十年如一日的<strong style={{ color: 'var(--champagne)' }}>「埋頭苦幹」</strong>。
              </p>
              <p style={{ color: 'rgba(237,232,223,0.78)', lineHeight: '1.9' }}>
                那些在細房仔裡傾密偈的夜晚，那些師傅帶徒弟時不說出口的手勢、眼神與停頓——
                這些<strong style={{ color: 'var(--off-white)' }}>無法被 Google 搜索的智慧</strong>，才是香港真正的底蘊。
              </p>
              <p style={{ color: 'rgba(237,232,223,0.78)', lineHeight: '1.9' }}>
                港匠匯（FAC）相信：每一位退休的企業家、行業老將，都是一座未被充分開採的知識礦山。
                我們的使命，是讓這些智慧找到歸宿，讓下一代不必重走彎路。
              </p>
            </div>

            {/* Feature highlights */}
            <div className="animate-item space-y-3 opacity-0">
              {[
                { icon: '🤝', text: '精英導師網絡：跨行業、跨世代的智慧橋樑' },
                { icon: '🏆', text: '實戰經驗為本：不講理論，只談老江湖的眉頭一皺' },
                { icon: '🌏', text: '大灣區視野：根植香港，放眼粵港澳' }
              ].map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 group"
                  style={{
                    backgroundColor: 'var(--navy-card)',
                    border: '1px solid rgba(201,169,110,0.1)'
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.35)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-hover)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.1)';
                    (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-card)';
                  }}
                >
                  <span className="text-xl flex-shrink-0">{item.icon}</span>
                  <span style={{ color: 'rgba(237,232,223,0.82)', lineHeight: '1.6' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>

            {/* Security emphasis */}
            <div className="animate-item opacity-0">
              <div className="security-badge">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <strong>國際級數據隱私保護技術</strong>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'rgba(201,169,110,0.6)' }}>
                所有導師資料與諮詢內容受嚴格保密協議保護，符合 GDPR 及香港《個人資料（私隱）條例》
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => scrollToSection('#services')}
              className="animate-item btn-outline flex items-center gap-2 group opacity-0"
            >
              了解五大專業領域
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
