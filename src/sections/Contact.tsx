import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-gateway-title',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
      gsap.fromTo(
        '.contact-gateway-btn',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.2,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToCommand = () => {
    const el = document.querySelector('#hero');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-20 lg:py-28 overflow-hidden"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            bottom: 0, left: '30%',
            width: '320px', height: '320px',
            background: 'radial-gradient(circle, rgba(201,169,110,0.06) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-12 text-center">
        <span className="contact-gateway-title section-tag opacity-0 block mb-4">
          {t('contact.sectionTag')}
        </span>
        <h2
          className="contact-gateway-title font-bold opacity-0 mb-6"
          style={{
            fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
            color: 'var(--off-white)',
            letterSpacing: '0.03em'
          }}
        >
          {t('contact.title')}
        </h2>
        <p
          className="contact-gateway-title opacity-0 text-sm mb-10 mx-auto"
          style={{
            color: 'rgba(237,232,223,0.65)',
            lineHeight: 1.8,
            maxWidth: '480px'
          }}
        >
          {t('contact.gatewayMessage')}
        </p>
        <button
          type="button"
          onClick={scrollToCommand}
          className="contact-gateway-btn opacity-0 inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg,#C9A96E 0%,#a8883a 100%)',
            color: '#0A1628',
            border: '1px solid rgba(201,169,110,0.4)'
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(201,169,110,0.25)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLElement).style.boxShadow = 'none';
          }}
        >
          <MessageCircle className="w-5 h-5" />
          {t('contact.gatewayCta')}
        </button>
      </div>
    </section>
  );
}
