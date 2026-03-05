import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Mail } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useTeamMembers } from '../hooks/useTeamMembers';

gsap.registerPlugin(ScrollTrigger);

export default function Team() {
  const { t, i18n } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { members, isLoaded } = useTeamMembers();

  useEffect(() => {
    if (!isLoaded) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.team-title',
        { y: 40, opacity: 0 },
        {
          y: 0,
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

      const cards = cardsRef.current?.querySelectorAll('.team-card');
      if (cards) {
        gsap.fromTo(
          cards,
          { rotateY: -90, opacity: 0 },
          {
            rotateY: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 70%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [isLoaded]);

  const isEnglish = i18n.language === 'en';

  return (
    <section
      id="team"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            top: 0, right: '25%',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            bottom: 0, left: '25%',
            width: '300px', height: '300px',
            background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="team-title section-tag opacity-0 block mb-4">
            {t('team.sectionTag')}
          </span>
          <h2
            className="team-title font-bold mt-4 opacity-0"
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              color: 'var(--off-white)',
              letterSpacing: '0.03em'
            }}
          >
            {t('team.title')}
          </h2>
        </div>

        {/* Team Grid */}
        <div
          ref={cardsRef}
          className="grid sm:grid-cols-2 gap-8 max-w-4xl mx-auto"
          style={{ perspective: '1000px' }}
        >
          {members.map((member) => (
            <div
              key={member.id}
              className="team-card group relative rounded-2xl overflow-hidden transition-all duration-500 opacity-0"
              style={{
                backgroundColor: 'var(--navy-card)',
                border: '1px solid rgba(201,169,110,0.12)',
                transformStyle: 'preserve-3d'
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.35)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(201,169,110,0.12)';
              }}
            >
              {/* Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                  src={member.image}
                  alt={isEnglish ? member.nameEn : member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />

                {/* Gradient Overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-500"
                  style={{
                    background: 'linear-gradient(to top, rgba(10,22,40,0.95) 0%, rgba(10,22,40,0.5) 50%, transparent 100%)',
                    opacity: 0.7
                  }}
                />

                {/* Social Links */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <button
                    className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(201,169,110,0.15)',
                      border: '1px solid rgba(201,169,110,0.3)'
                    }}
                  >
                    <Linkedin className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
                  </button>
                  <button
                    className="w-10 h-10 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300"
                    style={{
                      backgroundColor: 'rgba(201,169,110,0.15)',
                      border: '1px solid rgba(201,169,110,0.3)'
                    }}
                  >
                    <Mail className="w-4 h-4" style={{ color: 'var(--champagne)' }} />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3
                  className="text-2xl font-bold mb-1"
                  style={{ color: 'var(--off-white)' }}
                >
                  {isEnglish ? member.nameEn : member.name}
                </h3>
                <p
                  className="text-sm font-medium mb-2"
                  style={{ color: 'var(--champagne)' }}
                >
                  {isEnglish ? member.roleEn : member.role}
                </p>
                <p
                  className="text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ color: 'rgba(237,232,223,0.65)' }}
                >
                  {isEnglish ? member.descEn : member.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
