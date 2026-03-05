import { useEffect, useRef } from 'react';
import { ArrowRight, Globe2, ShoppingBag, Landmark, Wrench, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const expertiseDomains = [
  {
    id: 'trade',
    icon: Globe2,
    title: '跨境貿易與國際合規',
    description: '大灣區雙向物流、出口管制策略、關稅架構優化。數十年親身磨礪的實戰心法，助企業在複雜監管環境中穩步前行。',
    tags: ['#大灣區物流', '#出口管制', '#關稅優化']
  },
  {
    id: 'retail',
    icon: ShoppingBag,
    title: '高級零售與品牌管理',
    description: '從服務哲學到庫存美學，從品牌定位到團隊激勵——真正懂零售的人，知道一個眼神能改變顧客體驗。',
    tags: ['#客戶服務哲學', '#庫存美學', '#團隊激勵']
  },
  {
    id: 'wealth',
    icon: Landmark,
    title: '家族財富與企業傳承',
    description: '信託架構設計、接班人選拔培養、家族治理憲章制定。讓幾代人的心血，以最穩妥的方式薪火相傳。',
    tags: ['#信託架構', '#接班人思維', '#家族治理']
  },
  {
    id: 'manufacturing',
    icon: Wrench,
    title: '精密製造與工藝傳承',
    description: '老師傅的那雙手，藏著任何 AI 都無法複製的精密。帶徒心法、技術相容之道，讓工藝在時代洪流中不失根。',
    tags: ['#老師傅手勢', '#帶徒心法', '#技術相容']
  },
  {
    id: 'finance',
    icon: TrendingUp,
    title: '企業融資與現金流管理',
    description: '銀行談判桌上的底氣從何而來？風險控制的直覺如何培養？債務重組的時機怎樣判斷？問老江湖。',
    tags: ['#銀行談判策略', '#風險控制', '#債務重組']
  }
];

export default function Services() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.services-title',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(
        '.expertise-card-item',
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: '.expertise-grid',
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
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
      id="services"
      ref={sectionRef}
      className="relative py-24 lg:py-36 overflow-hidden"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      {/* Background glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '20%',
          left: '0',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '10%',
          right: '5%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="services-title section-tag opacity-0 block mb-4">
            五大專業領域
          </span>
          <h2
            className="services-title font-bold opacity-0"
            style={{
              fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)',
              color: 'var(--off-white)',
              lineHeight: '1.5',
              letterSpacing: '0.03em',
              fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
            }}
          >
            每一個領域，都是幾十年磨礪的結晶
          </h2>
          <p
            className="services-title mt-4 max-w-2xl mx-auto opacity-0"
            style={{
              color: 'rgba(237,232,223,0.6)',
              fontSize: '1rem',
              lineHeight: '1.8'
            }}
          >
            港匠匯的導師群，每位均擁有最少二十年實戰經歷。
            他們的知識，來自市場的第一線，而非書本或課室。
          </p>
        </div>

        {/* Expertise Card Grid — 2 columns + 1 full-width on lg */}
        <div className="expertise-grid grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {expertiseDomains.map((domain, index) => {
            const Icon = domain.icon;
            const isLast = index === expertiseDomains.length - 1;

            return (
              <div
                key={domain.id}
                className={`expertise-card-item expertise-card opacity-0 flex flex-col ${
                  isLast ? 'sm:col-span-2 lg:col-span-1' : ''
                }`}
              >
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(201,169,110,0.12)',
                    border: '1px solid rgba(201,169,110,0.2)'
                  }}
                >
                  <Icon className="w-6 h-6" style={{ color: 'var(--champagne)' }} />
                </div>

                {/* Title */}
                <h3
                  className="font-bold mb-3"
                  style={{
                    fontSize: '1.1rem',
                    color: 'var(--off-white)',
                    lineHeight: '1.5',
                    letterSpacing: '0.02em',
                    fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
                  }}
                >
                  {domain.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm flex-1 mb-5"
                  style={{
                    color: 'rgba(237,232,223,0.65)',
                    lineHeight: '1.85'
                  }}
                >
                  {domain.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap mt-auto">
                  {domain.tags.map((tag) => (
                    <span key={tag} className="tag-pill">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p
            className="mb-6 text-sm"
            style={{ color: 'rgba(237,232,223,0.55)', lineHeight: '1.8' }}
          >
            找不到你需要的專業？告訴我們，我們的網絡比你想像的更廣。
          </p>
          <button
            onClick={() => scrollToSection('#contact')}
            className="btn-gold inline-flex items-center gap-2 group"
          >
            預約免費諮詢
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
