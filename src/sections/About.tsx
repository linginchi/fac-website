import { useEffect, useRef } from 'react';
import { ShieldCheck, ArrowRight, Lock, Coins, Network, Building2 } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const pillars = [
  {
    Icon: Lock,
    title: '銀行級隱私保護',
    desc: '如私人保險箱／個人智慧錢包般密封。所有智慧顧問資料與諮詢內容，未經授權絕不公開——這是 FAC 對每一位老江湖的承諾。'
  },
  {
    Icon: Coins,
    title: '$FAC 代幣激勵',
    desc: 'Proof of Contribution 機制：每一次智慧貢獻、每一條有效建議，都將被鏈上記錄並獲得 $FAC 獎勵。'
  },
  {
    Icon: Network,
    title: 'Web3 去中心化對接',
    desc: '沒有中間人，沒有數據壟斷。需求方與智慧方直接在鏈上對接，AI Agent 負責語義解析與精準配對。'
  }
];

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
          x: 0, opacity: 1, duration: 1, ease: 'expo.out',
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
            y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      gsap.to(imageRef.current, {
        y: -40, ease: 'none',
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
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
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
        style={{ background: 'linear-gradient(to left, rgba(201,169,110,0.04) 0%, transparent 100%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-full h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">

          {/* Left — Vault visual */}
          <div ref={imageRef} className="opacity-0" style={{ perspective: '1000px' }}>
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{ border: '1px solid rgba(201,169,110,0.15)' }}
            >
              <div
                className="w-full h-[480px] lg:h-[560px] flex items-center justify-center relative"
                style={{ background: 'linear-gradient(145deg, var(--navy-card) 0%, #0A1628 100%)' }}
              >
                {/* Vault door design */}
                <div className="text-center select-none relative z-10">
                  {/* Outer vault ring */}
                  <div className="relative w-44 h-44 mx-auto mb-6">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        border: '2px solid rgba(201,169,110,0.25)',
                        animation: 'rotate-slow 40s linear infinite'
                      }}
                    />
                    <div
                      className="absolute rounded-full"
                      style={{
                        inset: '14px',
                        border: '1px solid rgba(201,169,110,0.18)',
                        animation: 'rotate-slow 28s linear infinite reverse'
                      }}
                    />
                    <div
                      className="absolute rounded-full flex items-center justify-center"
                      style={{
                        inset: '32px',
                        border: '2px solid rgba(201,169,110,0.45)',
                        boxShadow: '0 0 24px rgba(201,169,110,0.12), inset 0 0 16px rgba(201,169,110,0.06)',
                        background: 'rgba(10,22,40,0.8)'
                      }}
                    >
                      <Lock
                        className="w-10 h-10"
                        style={{ color: 'var(--champagne)' }}
                        strokeWidth={1.5}
                      />
                    </div>

                    {/* Bolt marks */}
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                      <div
                        key={deg}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: 'rgba(201,169,110,0.35)',
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${deg}deg) translate(0, -82px) translate(-50%, -50%)`
                        }}
                      />
                    ))}
                  </div>

                  <div
                    className="text-sm tracking-[0.35em] uppercase font-light"
                    style={{ color: 'rgba(201,169,110,0.55)' }}
                  >
                    PRIVATE VAULT
                  </div>
                  <div
                    className="mt-1 text-xs tracking-widest"
                    style={{ color: 'rgba(237,232,223,0.3)' }}
                  >
                    個人智慧錢包
                  </div>
                </div>

                {/* Scattered lock-detail lines */}
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute"
                    style={{
                      top: `${18 + i * 16}%`,
                      left: '12%',
                      width: `${24 + i * 8}%`,
                      height: '1px',
                      background: `linear-gradient(90deg, rgba(201,169,110,${0.06 + i * 0.02}), transparent)`
                    }}
                  />
                ))}

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
            </div>

            {/* Offset square */}
            <div
              className="absolute -bottom-5 -right-5 w-28 h-28 rounded-xl -z-10"
              style={{ border: '1px solid rgba(201,169,110,0.2)' }}
            />
          </div>

          {/* Right — content */}
          <div ref={contentRef} className="space-y-8 lg:pt-4">

            <span className="animate-item section-tag opacity-0 block">
              關於 FAC
            </span>

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
              「銀行私人保險箱／個人智慧錢包」級別的<br />
              <span className="text-gold-gradient">隱私保護與價值密度。</span>
            </h2>

            <div className="animate-item space-y-5 opacity-0">
              <p style={{ color: 'rgba(237,232,223,0.78)', lineHeight: '1.9' }}>
                FAC（港匠匯）是香港首個以 Web3 去中心化技術構建的<strong style={{ color: 'var(--champagne)' }}>智慧傳承對接平台</strong>。
                我們相信：每一位退休的企業家、行業老將，都是一座未被充分開採的知識礦山。
              </p>
              <p style={{ color: 'rgba(237,232,223,0.78)', lineHeight: '1.9' }}>
                那些在談判桌上的底氣、師傅帶徒弟時不說出口的手勢、幾十年磨礪的市場直覺——
                這些<strong style={{ color: 'var(--off-white)' }}>無法被 Google 搜索的智慧</strong>，
                正是 FAC 鏈上保護、鏈上流通的核心資產。
              </p>
            </div>

            {/* Three pillars */}
            <div className="animate-item space-y-3 opacity-0">
              {pillars.map(({ Icon, title, desc }, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 p-4 rounded-xl transition-all duration-300"
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
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{
                      background: 'rgba(201,169,110,0.1)',
                      border: '1px solid rgba(201,169,110,0.2)'
                    }}
                  >
                    <Icon className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
                  </div>
                  <div>
                    <div
                      className="font-semibold mb-1 text-sm"
                      style={{ color: 'var(--off-white)', fontFamily: "'PingFang HK', 'Noto Sans TC', sans-serif" }}
                    >
                      {title}
                    </div>
                    <div className="text-sm" style={{ color: 'rgba(237,232,223,0.65)', lineHeight: '1.7' }}>
                      {desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Security badge */}
            <div className="animate-item opacity-0">
              <div className="security-badge">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <strong>國際級數據隱私保護 · 鏈上透明 · 鏈下保密</strong>
              </div>
              <p className="mt-2 text-xs" style={{ color: 'rgba(201,169,110,0.6)' }}>
                所有用戶資料受 GDPR 及香港《個人資料（私隱）條例》保護，隱私控制中心由用戶自主管理
              </p>
            </div>

            {/* CAS Laboratory 機構聲明 */}
            <div
              className="animate-item opacity-0 rounded-xl p-4 space-y-2"
              style={{
                background: 'linear-gradient(135deg, rgba(201,169,110,0.06) 0%, rgba(7,14,31,0.5) 100%)',
                border: '1px solid rgba(201,169,110,0.22)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: 'rgba(201,169,110,0.8)' }} />
                <p className="text-xs font-semibold" style={{ color: 'rgba(201,169,110,0.85)' }}>
                  運營主體 · CAS Laboratory
                </p>
              </div>
              <p className="text-sm font-medium" style={{ color: 'var(--off-white)', lineHeight: 1.5 }}>
                國科綠色發展國際實驗室（香港）有限公司
              </p>
              <p className="text-xs" style={{ color: 'rgba(237,232,223,0.55)', lineHeight: 1.65 }}>
                香港註冊非盈利擔保有限公司（編號 2828258）。服務香港退休專家，打造
                <strong style={{ color: 'rgba(237,232,223,0.8)' }}>公正、專業、去中心化</strong>
                的智慧對接平台。所有收費餘額全數撥入「香港專業人才傳承基金」。
              </p>
            </div>

            <button
              onClick={() => scrollToSection('#services')}
              className="animate-item btn-outline flex items-center gap-2 group opacity-0"
            >
              探索八大智慧支柱
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
