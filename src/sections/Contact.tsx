import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Clock, Linkedin, Twitter, Facebook, MessageCircle, Send, CheckCircle } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteConfig } from '../hooks/useSiteConfig';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const { t, i18n } = useTranslation();
  const { config } = useSiteConfig();
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.contact-title',
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

      // Form animation
      gsap.fromTo(
        formRef.current,
        { rotateX: 10, y: 50, opacity: 0 },
        {
          rotateX: 0,
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Info card animation
      gsap.fromTo(
        '.contact-info',
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Social icons animation
      gsap.fromTo(
        '.social-icon',
        { scale: 0 },
        {
          scale: 1,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.7)',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 40%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData({ name: '', email: '', subject: '', message: '' });
    
    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const contactInfo = [
    { 
      icon: MapPin, 
      label: t('contact.info.address'), 
      value: isEnglish ? config.contact.addressEn : config.contact.address 
    },
    { 
      icon: Phone, 
      label: t('contact.info.phone'), 
      value: config.contact.phone 
    },
    { 
      icon: Mail, 
      label: t('contact.info.email'), 
      value: config.contact.email 
    },
    { 
      icon: Clock, 
      label: t('contact.info.hours'), 
      value: isEnglish ? config.contact.hoursEn : config.contact.hours 
    }
  ];

  const socialLinks = [
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: MessageCircle, href: '#', label: 'WeChat' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Facebook, href: '#', label: 'Facebook' }
  ];

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="relative py-24 lg:py-32 overflow-hidden"
      style={{ backgroundColor: 'var(--navy)' }}
    >
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute rounded-full"
          style={{
            bottom: 0, left: '25%',
            width: '400px', height: '400px',
            background: 'radial-gradient(circle, rgba(201,169,110,0.05) 0%, transparent 70%)',
            filter: 'blur(60px)'
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            top: 0, right: '25%',
            width: '280px', height: '280px',
            background: 'radial-gradient(circle, rgba(201,169,110,0.04) 0%, transparent 70%)',
            filter: 'blur(50px)'
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="contact-title section-tag opacity-0">
            {t('contact.sectionTag')}
          </span>
          <h2
            className="contact-title font-bold mt-4 opacity-0"
            style={{
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              color: 'var(--off-white)',
              letterSpacing: '0.03em'
            }}
          >
            {t('contact.title')}
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Form */}
          <div className="lg:col-span-3">
            <form
              ref={formRef}
              onSubmit={handleSubmit}
              className="rounded-2xl p-6 lg:p-8 opacity-0"
              style={{
                backgroundColor: 'var(--navy-card)',
                border: '1px solid rgba(201,169,110,0.12)',
                perspective: '1000px'
              }}
            >
              {isSubmitted ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                    style={{ backgroundColor: 'rgba(201,169,110,0.15)' }}
                  >
                    <CheckCircle className="w-8 h-8" style={{ color: 'var(--champagne)' }} />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--off-white)' }}>
                    {t('contact.form.success')}
                  </h3>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'rgba(237,232,223,0.6)' }}>
                        {t('contact.form.name')}
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={t('contact.form.namePlaceholder')}
                        required
                        className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(201,169,110,0.05)',
                          border: '1px solid rgba(201,169,110,0.15)',
                          color: 'var(--off-white)'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.5)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.15)')}
                      />
                    </div>
                    <div>
                      <label className="block text-sm mb-2" style={{ color: 'rgba(237,232,223,0.6)' }}>
                        {t('contact.form.email')}
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder={t('contact.form.emailPlaceholder')}
                        required
                        className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                        style={{
                          backgroundColor: 'rgba(201,169,110,0.05)',
                          border: '1px solid rgba(201,169,110,0.15)',
                          color: 'var(--off-white)'
                        }}
                        onFocus={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.5)')}
                        onBlur={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.15)')}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(237,232,223,0.6)' }}>
                      {t('contact.form.subject')}
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder={t('contact.form.subjectPlaceholder')}
                      className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(201,169,110,0.05)',
                        border: '1px solid rgba(201,169,110,0.15)',
                        color: 'var(--off-white)'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.15)')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm mb-2" style={{ color: 'rgba(237,232,223,0.6)' }}>
                      {t('contact.form.message')}
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder={t('contact.form.messagePlaceholder')}
                      required
                      rows={5}
                      className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-300 resize-none"
                      style={{
                        backgroundColor: 'rgba(201,169,110,0.05)',
                        border: '1px solid rgba(201,169,110,0.15)',
                        color: 'var(--off-white)'
                      }}
                      onFocus={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.5)')}
                      onBlur={(e) => (e.target.style.borderColor = 'rgba(201,169,110,0.15)')}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        {t('contact.form.sending')}
                      </>
                    ) : (
                      <>
                        {t('contact.form.submit')}
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Contact Info */}
            <div
              className="contact-info rounded-2xl p-6 lg:p-8 opacity-0"
              style={{
                backgroundColor: 'var(--navy-card)',
                border: '1px solid rgba(201,169,110,0.12)'
              }}
            >
              <div className="space-y-6">
                {contactInfo.map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={index} className="flex items-start gap-4">
                      <div
                        className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: 'rgba(201,169,110,0.1)' }}
                      >
                        <Icon className="w-5 h-5" style={{ color: 'var(--champagne)' }} />
                      </div>
                      <div>
                        <p className="text-sm mb-1" style={{ color: 'rgba(237,232,223,0.5)' }}>{item.label}</p>
                        <p style={{ color: 'var(--off-white)' }}>{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Social Links */}
            <div
              className="contact-info rounded-2xl p-6 lg:p-8 opacity-0"
              style={{
                backgroundColor: 'var(--navy-card)',
                border: '1px solid rgba(201,169,110,0.12)'
              }}
            >
              <p className="mb-4" style={{ color: 'rgba(237,232,223,0.6)' }}>{t('contact.social')}</p>
              <div className="flex gap-4">
                {socialLinks.map((link, index) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={index}
                      href={link.href}
                      className="social-icon w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(201,169,110,0.08)',
                        border: '1px solid rgba(201,169,110,0.15)'
                      }}
                      aria-label={link.label}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,169,110,0.2)';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,169,110,0.08)';
                      }}
                    >
                      <Icon className="w-5 h-5 transition-colors duration-300" style={{ color: 'rgba(201,169,110,0.65)' }} />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
