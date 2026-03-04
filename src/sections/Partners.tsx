import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Partner logos using text-based representation
const partners = [
  { name: 'HKUST', fullName: 'Hong Kong University of Science and Technology' },
  { name: 'CUHK', fullName: 'The Chinese University of Hong Kong' },
  { name: 'HKSTP', fullName: 'Hong Kong Science and Technology Parks' },
  { name: 'Alibaba', fullName: 'Alibaba Group' },
  { name: 'Tencent', fullName: 'Tencent Holdings' },
  { name: 'HSBC', fullName: 'HSBC Holdings' },
  { name: 'BOCHK', fullName: 'Bank of China (Hong Kong)' },
  { name: 'PwC', fullName: 'PricewaterhouseCoopers' },
  { name: 'Deloitte', fullName: 'Deloitte Touche Tohmatsu' },
  { name: 'KPMG', fullName: 'KPMG International' }
];

export default function Partners() {
  const { t } = useTranslation();
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
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-black to-[#0A0A0A]" />
      
      {/* Gold Lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent" />

      <div className="relative z-10">
        {/* Header */}
        <div className="text-center mb-16 px-6">
          <span className="partners-title section-tag opacity-0">
            {t('partners.sectionTag')}
          </span>
          <h2 className="partners-title text-3xl lg:text-4xl font-bold text-white mt-4 opacity-0">
            {t('partners.title')}
          </h2>
        </div>

        {/* Marquee Row 1 - Left to Right */}
        <div className="marquee-row mb-8 overflow-hidden opacity-0">
          <div className="flex animate-scroll-left hover:[animation-play-state:paused]">
            {[...partners, ...partners].map((partner, index) => (
              <div
                key={`row1-${index}`}
                className="flex-shrink-0 mx-6 lg:mx-10"
              >
                <div className="group relative px-8 py-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer">
                  <span className="text-xl lg:text-2xl font-bold text-white/40 group-hover:text-[#FFD700] transition-colors duration-300">
                    {partner.name}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#1A1A1A] rounded text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {partner.fullName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Marquee Row 2 - Right to Left */}
        <div className="marquee-row overflow-hidden opacity-0">
          <div className="flex animate-scroll-right hover:[animation-play-state:paused]">
            {[...partners.reverse(), ...partners].map((partner, index) => (
              <div
                key={`row2-${index}`}
                className="flex-shrink-0 mx-6 lg:mx-10"
              >
                <div className="group relative px-8 py-6 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300 cursor-pointer">
                  <span className="text-xl lg:text-2xl font-bold text-white/40 group-hover:text-[#FFD700] transition-colors duration-300">
                    {partner.name}
                  </span>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-[#1A1A1A] rounded text-xs text-white/80 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    {partner.fullName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
