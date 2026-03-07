import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePartners } from '../hooks/usePartners';

gsap.registerPlugin(ScrollTrigger);

export default function Partners() {
  const { t } = useTranslation();
  const { partners } = usePartners();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.partners-title',
        { scale: 0.9, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(
        '.marquee-row',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="partners"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      {/* Top & bottom accent lines */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.2), transparent)' }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-16 px-6">
          <span className="partners-title section-tag opacity-0 block mb-4">
            {t('partners.sectionTag')}
          </span>
          <h2
            className="partners-title font-bold mt-4 opacity-0"
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              color: 'var(--off-white)',
              letterSpacing: '0.03em'
            }}
          >
            {t('partners.title')}
          </h2>
        </div>

        {/* Marquee Row 1 — Left to Right */}
        <div className="marquee-row mb-6 overflow-hidden opacity-0">
          <div className="flex animate-scroll-left hover:[animation-play-state:paused]">
            {partners.length > 0 && [...partners, ...partners].map((partner, index) => (
              <div
                key={`row1-${partner.id}-${index}`}
                className="flex-shrink-0 mx-5 lg:mx-8"
              >
                {partner.link ? (
                  <a
                    href={partner.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex px-8 py-5 rounded-xl transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: 'var(--navy-card)',
                      border: '1px solid rgba(201,169,110,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.4)';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-hover)';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.1)';
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-card)';
                    }}
                  >
                    {partner.logo ? (
                      <img src={partner.logo} alt={partner.name} className="w-10 h-10 object-contain mr-3" />
                    ) : null}
                    <span className="text-lg lg:text-xl font-bold transition-colors duration-300" style={{ color: 'rgba(237,232,223,0.4)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.4)')}>
                      {partner.name}
                    </span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: 'var(--navy-card)', border: '1px solid rgba(201,169,110,0.25)', color: 'rgba(237,232,223,0.8)' }}>
                      {partner.description || partner.name}
                    </div>
                  </a>
                ) : (
                  <div
                    className="group relative px-8 py-5 rounded-xl transition-all duration-300 cursor-pointer"
                    style={{ backgroundColor: 'var(--navy-card)', border: '1px solid rgba(201,169,110,0.1)' }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.4)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-hover)'; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.1)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-card)'; }}
                  >
                    {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-10 h-10 object-contain inline-block mr-3 align-middle" /> : null}
                    <span className="text-lg lg:text-xl font-bold transition-colors duration-300" style={{ color: 'rgba(237,232,223,0.4)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.4)')}>{partner.name}</span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: 'var(--navy-card)', border: '1px solid rgba(201,169,110,0.25)', color: 'rgba(237,232,223,0.8)' }}>{partner.description || partner.name}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 — Right to Left */}
        <div className="marquee-row overflow-hidden opacity-0">
          <div className="flex animate-scroll-right hover:[animation-play-state:paused]">
            {partners.length > 0 && [...partners.slice().reverse(), ...partners.slice().reverse()].map((partner, index) => (
              <div key={`row2-${partner.id}-${index}`} className="flex-shrink-0 mx-5 lg:mx-8">
                <div
                  className="group relative px-8 py-5 rounded-xl transition-all duration-300 cursor-pointer"
                  style={{ backgroundColor: 'var(--navy-card)', border: '1px solid rgba(201,169,110,0.1)' }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.4)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-hover)'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.1)'; (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--navy-card)'; }}
                >
                  {partner.logo ? <img src={partner.logo} alt={partner.name} className="w-10 h-10 object-contain inline-block mr-3 align-middle" /> : null}
                  <span className="text-lg lg:text-xl font-bold transition-colors duration-300" style={{ color: 'rgba(237,232,223,0.4)' }} onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--champagne)')} onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237,232,223,0.4)')}>{partner.name}</span>
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ backgroundColor: 'var(--navy-card)', border: '1px solid rgba(201,169,110,0.25)', color: 'rgba(237,232,223,0.8)' }}>{partner.description || partner.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
