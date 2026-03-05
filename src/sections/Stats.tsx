import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteConfig } from '../hooks/useSiteConfig';

gsap.registerPlugin(ScrollTrigger);

interface StatItemProps {
  number: string;
  label: string;
  desc: string;
  delay: number;
}

function StatItem({ number, label, desc, delay }: StatItemProps) {
  const [count, setCount] = useState(0);
  const itemRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: itemRef.current,
        start: 'top 80%',
        onEnter: () => {
          if (hasAnimated.current) return;
          hasAnimated.current = true;

          // Animate the counter
          const targetNum = parseInt(number.replace(/\D/g, ''));
          gsap.to({}, {
            duration: 1.2,
            delay: delay,
            ease: 'expo.out',
            onUpdate: function() {
              setCount(Math.round(this.progress() * targetNum));
            }
          });

          // Animate the item
          gsap.fromTo(
            itemRef.current,
            { scale: 0.5, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.2, delay: delay, ease: 'expo.out' }
          );
        }
      });
    }, itemRef);

    return () => ctx.revert();
  }, [number, delay]);

  const displayNumber = number.replace(/\d+/, count.toString());

  return (
    <div
      ref={itemRef}
      className="text-center p-8 rounded-2xl transition-all duration-500 group opacity-0"
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
        className="text-5xl lg:text-6xl font-bold mb-2 group-hover:scale-105 transition-transform duration-300 text-gold-gradient"
      >
        {displayNumber}
      </div>
      <div className="text-lg font-medium mb-2" style={{ color: 'var(--off-white)' }}>{label}</div>
      <div className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>{desc}</div>

      <div
        className="mt-4 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.5), transparent)' }}
      />
    </div>
  );
}

export default function Stats() {
  const { i18n } = useTranslation();
  const { config } = useSiteConfig();
  const sectionRef = useRef<HTMLDivElement>(null);

  const isEnglish = i18n.language === 'en';

  const stats = [
    { 
      key: 'projects', 
      delay: 0.2,
      number: config.stats.projects.number,
      label: isEnglish ? config.stats.projects.labelEn : config.stats.projects.label,
      desc: isEnglish ? config.stats.projects.descEn : config.stats.projects.desc
    },
    { 
      key: 'partners', 
      delay: 0.4,
      number: config.stats.partners.number,
      label: isEnglish ? config.stats.partners.labelEn : config.stats.partners.label,
      desc: isEnglish ? config.stats.partners.descEn : config.stats.partners.desc
    },
    { 
      key: 'experts', 
      delay: 0.6,
      number: config.stats.experts.number,
      label: isEnglish ? config.stats.experts.labelEn : config.stats.experts.label,
      desc: isEnglish ? config.stats.experts.descEn : config.stats.experts.desc
    },
    { 
      key: 'clients', 
      delay: 0.8,
      number: config.stats.clients.number,
      label: isEnglish ? config.stats.clients.labelEn : config.stats.clients.label,
      desc: isEnglish ? config.stats.clients.descEn : config.stats.clients.desc
    }
  ];

  return (
    <section
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--midnight)' }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)' }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(201,169,110,0.25), transparent)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat) => (
            <StatItem
              key={stat.key}
              number={stat.number}
              label={stat.label}
              desc={stat.desc}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
