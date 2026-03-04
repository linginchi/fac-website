import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, GraduationCap, HeartHandshake, ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useSiteConfig } from '../hooks/useSiteConfig';

gsap.registerPlugin(ScrollTrigger);

const icons = [Globe, GraduationCap, HeartHandshake];

export default function About() {
  const { i18n } = useTranslation();
  const { config } = useSiteConfig();
  const sectionRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image animation
      gsap.fromTo(
        imageRef.current,
        { rotateY: -15, x: -100, opacity: 0 },
        {
          rotateY: 0,
          x: 0,
          opacity: 1,
          duration: 1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 70%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Content animation
      const contentElements = contentRef.current?.querySelectorAll('.animate-item');
      if (contentElements) {
        gsap.fromTo(
          contentElements,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 60%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      }

      // Parallax effect
      gsap.to(imageRef.current, {
        y: -50,
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const features = isEnglish ? config.about.featuresEn : config.about.features;

  return (
    <section
      id="about"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#FFD700]/5 to-transparent" />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div
            ref={imageRef}
            className="relative opacity-0"
            style={{ perspective: '1000px' }}
          >
            <div className="relative rounded-2xl overflow-hidden group">
              <img
                src="/about-team.jpg"
                alt="About FAC"
                className="w-full h-[500px] lg:h-[600px] object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Gold Border Effect */}
              <div className="absolute inset-0 border-2 border-[#FFD700]/0 group-hover:border-[#FFD700]/30 transition-colors duration-500 rounded-2xl" />
            </div>
            
            {/* Decorative Element */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 border-2 border-[#FFD700]/30 rounded-2xl -z-10" />
          </div>

          {/* Content */}
          <div ref={contentRef} className="space-y-8">
            {/* Section Tag */}
            <span className="animate-item section-tag opacity-0">
              {isEnglish ? 'About Us' : '关于我们'}
            </span>

            {/* Title */}
            <h2 className="animate-item text-3xl lg:text-4xl font-bold text-white opacity-0">
              {isEnglish ? config.about.titleEn : config.about.title}
            </h2>

            {/* Description */}
            <p className="animate-item text-white/70 leading-relaxed opacity-0">
              {isEnglish ? config.about.descriptionEn : config.about.description}
            </p>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => {
                const Icon = icons[index];
                return (
                  <div
                    key={index}
                    className="animate-item flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-all duration-300 group opacity-0"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-[#FFD700]/10 flex items-center justify-center group-hover:bg-[#FFD700]/20 transition-colors duration-300">
                      <Icon className="w-6 h-6 text-[#FFD700]" />
                    </div>
                    <span className="text-white/80 group-hover:text-white transition-colors duration-300">
                      {feature}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* CTA */}
            <button
              onClick={() => scrollToSection('#services')}
              className="animate-item btn-outline flex items-center gap-2 group opacity-0"
            >
              {isEnglish ? 'Learn More' : '了解更多'}
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
