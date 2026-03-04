import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Linkedin, Twitter, Facebook, MessageCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Footer() {
  const { t } = useTranslation();
  const footerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.footer-col',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      gsap.fromTo(
        '.footer-bottom',
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.4,
          delay: 0.6,
          ease: 'smooth',
          scrollTrigger: {
            trigger: footerRef.current,
            start: 'top 80%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  const quickLinks = [
    { key: 'home', href: '#hero' },
    { key: 'about', href: '#about' },
    { key: 'services', href: '#services' },
    { key: 'team', href: '#team' },
    { key: 'contact', href: '#contact' }
  ];

  const services = [
    { key: 'consulting', label: t('services.tabs.0.label') },
    { key: 'incubation', label: t('services.tabs.1.label') },
    { key: 'technology', label: t('services.tabs.2.label') },
    { key: 'investment', label: t('services.tabs.3.label') }
  ];

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: MessageCircle, href: '#', label: 'WeChat' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative bg-black border-t border-white/10"
    >
      {/* Gold Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#FFD700]/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-20">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Logo & About */}
          <div className="footer-col opacity-0">
            <a href="#hero" className="inline-block mb-6">
              <span className="text-3xl font-bold text-white">
                F<span className="text-[#FFD700]">A</span>C
              </span>
            </a>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              {t('footer.about')}
            </p>
            <div className="flex gap-3">
              {socialLinks.map((link, index) => {
                const Icon = link.icon;
                return (
                  <a
                    key={index}
                    href={link.href}
                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FFD700]/20 transition-all duration-300 group"
                    aria-label={link.label}
                  >
                    <Icon className="w-4 h-4 text-white/60 group-hover:text-[#FFD700] transition-colors duration-300" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col opacity-0">
            <h4 className="text-white font-semibold mb-6">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <a
                    href={link.href}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection(link.href);
                    }}
                    className="text-white/60 hover:text-[#FFD700] hover:translate-x-1 transition-all duration-300 inline-block text-sm"
                  >
                    {t(`nav.${link.key}`)}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col opacity-0">
            <h4 className="text-white font-semibold mb-6">
              {t('footer.services')}
            </h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.key}>
                  <a
                    href="#services"
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToSection('#services');
                    }}
                    className="text-white/60 hover:text-[#FFD700] hover:translate-x-1 transition-all duration-300 inline-block text-sm"
                  >
                    {service.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col opacity-0">
            <h4 className="text-white font-semibold mb-6">
              {t('footer.contact')}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="text-white/60">
                {t('contact.info.addressValue')}
              </li>
              <li>
                <a href={`tel:${t('contact.info.phoneValue')}`} className="text-white/60 hover:text-[#FFD700] transition-colors duration-300">
                  {t('contact.info.phoneValue')}
                </a>
              </li>
              <li>
                <a href={`mailto:${t('contact.info.emailValue')}`} className="text-white/60 hover:text-[#FFD700] transition-colors duration-300">
                  {t('contact.info.emailValue')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom mt-16 pt-8 border-t border-white/10 opacity-0">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              {t('footer.copyright')}
            </p>
            <div className="flex gap-6">
              <a href="#" className="text-white/40 hover:text-[#FFD700] text-sm transition-colors duration-300">
                {t('footer.privacy')}
              </a>
              <a href="#" className="text-white/40 hover:text-[#FFD700] text-sm transition-colors duration-300">
                {t('footer.terms')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
