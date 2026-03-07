import { useEffect, useRef } from 'react';
import { ArrowRight, Globe2, ShoppingBag, Landmark, Wrench, TrendingUp, HardHat, GraduationCap, Scale } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const wisdomPillars = [
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
    description: '從奢侈品牌哲學到庫存美學，從品牌定位到團隊激勵——真正懂零售的人，知道一個眼神能改變顧客體驗。',
    tags: ['#奢侈品牌哲學', '#庫存美學', '#品牌定位']
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
    tags: ['#老師傅帶徒', '#產線相容', '#帶徒心法']
  },
  {
    id: 'finance',
    icon: TrendingUp,
    title: '企業融資與現金流管理',
    description: '銀行談判桌上的底氣從何而來？風險控制的直覺如何培養？債務重組的時機怎樣判斷？問老江湖。',
    tags: ['#銀行借貸談判', '#現金流', '#債務重組']
  },
  {
    id: 'engineering',
    icon: HardHat,
    title: '工程基建與監理',
    description: '工程師實戰排難、基建項目監管、工地安全管理。幾十年基建經驗，讓每一個項目按時、按預算、按質落地。',
    tags: ['#工程師實戰排難', '#基建項目監管', '#工地監理']
  },
  {
    id: 'education',
    icon: GraduationCap,
    title: '教育專業傳承',
    description: '香港 DSE 課程邏輯、中學教育心法、名校升學策略。教育老前輩的心血，是下一代最值得擁有的傳承。',
    tags: ['#DSE課程邏輯', '#中學教育心法', '#升學策略']
  },
  {
    id: 'compliance',
    icon: Scale,
    title: '金融監管合規（RO）',
    description: 'SFC 1–6、9 號牌持牌實務、RO 風險管理、合規框架設計。監管迷宮中，唯有老行尊才識得最短路。',
    tags: ['#SFC持牌實務', '#RO風險管理', '#合規框架']
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
          y: 0, opacity: 1, duration: 0.7, ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(
        '.pillar-card-item',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: 'expo.out',
          scrollTrigger: {
            trigger: '.pillars-grid',
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
          top: '20%', left: '0',
          width: '400px', height: '400px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
          filter: 'blur(60px)'
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          bottom: '10%', right: '5%',
          width: '320px', height: '320px',
          background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
          filter: 'blur(50px)'
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="services-title section-tag opacity-0 block mb-4">
            八大智慧支柱
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
            style={{ color: 'rgba(237,232,223,0.6)', fontSize: '1rem', lineHeight: '1.8' }}
          >
            FAC 平台八大智慧支柱，涵蓋香港核心行業精英。
            每位顧問均擁有最少二十年實戰經歷，所有知識來自市場第一線。
          </p>

          {/* Pillar index dots */}
          <div className="flex items-center justify-center gap-1.5 mt-6">
            {wisdomPillars.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i < 4 ? '20px' : '6px',
                  height: '6px',
                  background: i < 4 ? 'var(--champagne)' : 'rgba(201,169,110,0.25)'
                }}
              />
            ))}
          </div>
        </div>

        {/* 8-pillar grid — 4 columns on lg, 2 on md, 1 on sm */}
        <div className="pillars-grid grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {wisdomPillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.id}
                className="pillar-card-item expertise-card opacity-0 flex flex-col group"
              >
                {/* Pillar number */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: 'rgba(201,169,110,0.1)',
                      border: '1px solid rgba(201,169,110,0.2)'
                    }}
                  >
                    <Icon className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
                  </div>
                  <span
                    className="text-xs font-mono mt-1"
                    style={{ color: 'rgba(201,169,110,0.3)' }}
                  >
                    0{index + 1}
                  </span>
                </div>

                {/* Title */}
                <h3
                  className="font-bold mb-3"
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--off-white)',
                    lineHeight: '1.5',
                    letterSpacing: '0.02em',
                    fontFamily: "'PingFang HK', 'Noto Sans TC', 'Microsoft JhengHei', sans-serif"
                  }}
                >
                  {pillar.title}
                </h3>

                {/* Description */}
                <p
                  className="text-sm flex-1 mb-4"
                  style={{ color: 'rgba(237,232,223,0.6)', lineHeight: '1.8' }}
                >
                  {pillar.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap mt-auto gap-1">
                  {pillar.tags.map((tag) => (
                    <span key={tag} className="tag-pill text-xs">
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
            style={{ color: 'rgba(237,232,223,0.5)', lineHeight: '1.8' }}
          >
            找不到你需要的專業？FAC 港匠匯智慧管家會為您解碼需求，配對最合適的行業顧問。
          </p>
          <button
            onClick={() => scrollToSection('#contact')}
            className="btn-gold inline-flex items-center gap-2 group"
          >
            立即發起諮詢
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
