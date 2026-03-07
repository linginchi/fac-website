import { useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import ContactBot from '../components/ContactBot';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const { t } = useTranslation();
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-bot-title',
        { y: 24, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse'
          }
        }
      );
      gsap.fromTo(
        '.contact-bot-box',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.15,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 78%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);
    return () => ctx.revert();
  }, []);

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

      <div className="relative z-10 max-w-2xl mx-auto px-6 lg:px-12">
        <div className="text-center mb-10">
          <span className="contact-bot-title section-tag opacity-0 block mb-3">
            {t('contact.sectionTag')}
          </span>
          <h2
            className="contact-bot-title font-bold opacity-0"
            style={{
              fontSize: 'clamp(1.5rem, 2.8vw, 2rem)',
              color: 'var(--off-white)',
              letterSpacing: '0.03em'
            }}
          >
            {t('contact.title')}
          </h2>
          <p
            className="contact-bot-title opacity-0 text-sm mt-3 mx-auto"
            style={{ color: 'rgba(237,232,223,0.55)', lineHeight: 1.7, maxWidth: '480px' }}
          >
            {t('contact.gatewayMessage')}
          </p>
        </div>
        <div className="contact-bot-box opacity-0">
          <ContactBot />
        </div>
      </div>
    </section>
  );
}
