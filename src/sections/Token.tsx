import { useEffect, useRef } from 'react';
import { Coins, Gift, Zap, Shield, Lock, TrendingUp, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const foundationRewards = [
  { label: 'LinkedIn 註冊獎勵', value: '80 $FAC', sub: '一鍵註冊，高於一般註冊，公信力帳號接入' },
  { label: 'LinkedIn 數據同步', value: '50 $FAC', sub: '授權將經歷導入個人智慧錢包，完成資料完善' },
  { label: '每增加一個 Agent 驗證的專業標籤', value: '20 $FAC', sub: '如 SFC RO 1號牌' },
  { label: '上傳加密「實戰案例邏輯」', value: '100 $FAC', sub: '僅供 Agent 匹配使用' },
  { label: '白銀級訂閱 · 每月返還', value: '50 $FAC', sub: '法幣轉化' },
  { label: '黃金級訂閱 · 每月返還', value: '150 $FAC', sub: '法幣轉化' },
  { label: '鑽石級訂閱 · 每月返還', value: '500 $FAC', sub: '法幣轉化' },
];

const contributionRewards = [
  { label: '智慧貢獻（建議、市場情報獲採納）', value: '50 － 200 $FAC', sub: '依貢獻度' },
  { label: '結案獎勵 · 專家方', value: '交易額 5%', sub: '平台額外撥放，不扣專家' },
  { label: '結案回扣 · 需求方', value: '交易額 2%', sub: '$FAC 回扣' },
];

const decodeCosts = [
  { label: '基礎行情解碼', value: '10 $FAC/次', sub: '專家分佈與基本資歷標籤' },
  { label: '深度資訊解碼', value: '50 $FAC/次', sub: '實戰案例詳情、錢包內脫敏成就' },
  { label: '開啟私密對話通道', value: '100 $FAC/次', sub: '與匹配對象首次加密連線' },
];

const defenseMechanisms = [
  { icon: Lock, title: '鎖定期 (Lock-up)', desc: '註冊獎勵須在平台活躍滿 30 天，或完成一次有效「資訊解碼」後方可激活使用。' },
  { icon: Shield, title: '品質門檻', desc: '完善個人信息的獎勵需通過 FAC 港匠匯邏輯性審核，防止隨意填寫垃圾數據。' },
  { icon: TrendingUp, title: '回購與銷毀 (Buy-back & Burn)', desc: '平台每月將 20% 訂閱收入用於回購 $FAC 並銷毀，確保稀缺性與長期價值。' },
];

export default function Token() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.token-head', { y: 36, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.7, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 72%', toggleActions: 'play none none reverse' }
      });
      gsap.fromTo('.token-block', { y: 44, opacity: 0 }, {
        y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 68%', toggleActions: 'play none none reverse' }
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
      id="token"
      ref={sectionRef}
      className="relative py-24 lg:py-36 overflow-hidden"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      <div className="absolute top-0 right-0 w-1/2 h-full pointer-events-none" style={{ background: 'linear-gradient(to left, rgba(201,169,110,0.04) 0%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 w-full h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)' }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-16">
          <span className="token-head section-tag opacity-0 block mb-4">$FAC Token 經濟</span>
          <h2 className="token-head font-bold opacity-0" style={{ fontSize: 'clamp(1.5rem, 3.2vw, 2.4rem)', color: 'var(--off-white)', lineHeight: 1.5, letterSpacing: '0.03em', fontFamily: "'PingFang HK', 'Noto Sans TC', sans-serif" }}>
            智慧與信任的「採礦」— 獎勵與解碼規則
          </h2>
          <p className="token-head mt-4 max-w-2xl mx-auto opacity-0" style={{ color: 'rgba(237,232,223,0.65)', fontSize: '1rem', lineHeight: 1.85 }}>
            LinkedIn 註冊與數據同步享額外獎勵；完善個人智慧錢包、訂閱與智慧貢獻皆可獲 $FAC。解碼按次計費。
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-10">
          {/* 基礎建設獎 */}
          <div className="token-block opacity-0 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'var(--navy-card)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.22)' }}>
                  <Gift className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white" style={{ fontSize: '1.05rem', fontFamily: "'PingFang HK', sans-serif" }}>基礎建設獎</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.7)' }}>鼓勵加入與留存</p>
                </div>
              </div>
            </div>
            <ul className="p-6 pt-4 space-y-3">
              {foundationRewards.map((r, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm" style={{ color: 'rgba(237,232,223,0.88)' }}>{r.label}</div>
                    {r.sub && <div className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.5)' }}>{r.sub}</div>}
                  </div>
                  <span className="flex-shrink-0 font-semibold text-sm" style={{ color: 'var(--champagne)' }}>{r.value}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 貢獻價值獎 */}
          <div className="token-block opacity-0 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'var(--navy-card)' }}>
            <div className="p-6 border-b" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.22)' }}>
                  <Zap className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
                </div>
                <div>
                  <h3 className="font-bold text-white" style={{ fontSize: '1.05rem', fontFamily: "'PingFang HK', sans-serif" }}>貢獻價值獎</h3>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.7)' }}>鼓勵平台優化</p>
                </div>
              </div>
            </div>
            <ul className="p-6 pt-4 space-y-3">
              {contributionRewards.map((r, i) => (
                <li key={i} className="flex items-start justify-between gap-4 py-2 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm" style={{ color: 'rgba(237,232,223,0.88)' }}>{r.label}</div>
                    {r.sub && <div className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.5)' }}>{r.sub}</div>}
                  </div>
                  <span className="flex-shrink-0 font-semibold text-sm" style={{ color: 'var(--champagne)' }}>{r.value}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 消耗與解碼 */}
        <div className="token-block opacity-0 mt-10 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'var(--navy-card)' }}>
          <div className="p-6 border-b flex items-center gap-3" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)', border: '1px solid rgba(201,169,110,0.22)' }}>
              <Coins className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
            </div>
            <div>
              <h3 className="font-bold text-white" style={{ fontSize: '1.05rem', fontFamily: "'PingFang HK', sans-serif" }}>$FAC 消耗與解碼規則</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(201,169,110,0.7)' }}>價值的「變現」</p>
            </div>
          </div>
          <div className="p-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {decodeCosts.map((d, i) => (
              <div key={i} className="p-4 rounded-xl" style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.12)' }}>
                <div className="font-semibold text-sm text-white mb-1">{d.label}</div>
                <div className="text-lg font-bold" style={{ color: 'var(--champagne)' }}>{d.value}</div>
                <div className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.5)' }}>{d.sub}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 防禦機制 */}
        <div className="token-block opacity-0 mt-10 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(201,169,110,0.03)' }}>
          <div className="p-6 border-b flex items-center gap-3" style={{ borderColor: 'rgba(201,169,110,0.15)' }}>
            <Shield className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
            <h3 className="font-bold text-white" style={{ fontSize: '1.05rem', fontFamily: "'PingFang HK', sans-serif" }}>代幣防禦機制（防止刷獎勵）</h3>
          </div>
          <div className="p-6 grid sm:grid-cols-3 gap-6">
            {defenseMechanisms.map((d, i) => {
              const Icon = d.icon;
              return (
                <div key={i} className="flex gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)' }}>
                    <Icon className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
                  </div>
                  <div>
                    <div className="font-semibold text-sm text-white mb-1">{d.title}</div>
                    <div className="text-xs" style={{ color: 'rgba(237,232,223,0.7)', lineHeight: 1.7 }}>{d.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12">
          <button onClick={() => scrollToSection('#contact')} className="btn-gold inline-flex items-center gap-2 group">
            聯絡我們 · 了解 $FAC
            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </section>
  );
}
