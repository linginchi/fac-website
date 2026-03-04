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
      // Title animation
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

      // Cards animation
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
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#FFD700]/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#FFD700]/2 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="team-title section-tag opacity-0">
            {t('team.sectionTag')}
          </span>
          <h2 className="team-title text-3xl lg:text-4xl font-bold text-white mt-4 opacity-0">
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
              className="team-card group relative bg-white/5 rounded-2xl overflow-hidden hover:bg-white/10 transition-all duration-500 opacity-0"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Image */}
              <div className="relative h-96 overflow-hidden">
                <img
                  src={member.image}
                  alt={isEnglish ? member.nameEn : member.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />
                
                {/* Social Links */}
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                  <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#FFD700]/20 transition-colors duration-300">
                    <Linkedin className="w-4 h-4 text-white" />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-[#FFD700]/20 transition-colors duration-300">
                    <Mail className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {isEnglish ? member.nameEn : member.name}
                </h3>
                <p className="text-[#FFD700] text-sm font-medium mb-2">
                  {isEnglish ? member.roleEn : member.role}
                </p>
                <p className="text-white/60 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  {isEnglish ? member.descEn : member.desc}
                </p>
              </div>

              {/* Gold Border on Hover */}
              <div className="absolute inset-0 border-2 border-[#FFD700]/0 group-hover:border-[#FFD700]/30 rounded-2xl transition-colors duration-500 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
