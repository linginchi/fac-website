import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ArrowRight, Lightbulb, Rocket, Cpu, TrendingUp } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const icons = [Lightbulb, Rocket, Cpu, TrendingUp];

export default function Services() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const tabs = t('services.tabs', { returnObjects: true }) as Array<{
    id: string;
    label: string;
    title: string;
    description: string;
    items: string[];
  }>;

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Title animation
      gsap.fromTo(
        '.services-title',
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

      // Tabs animation
      gsap.fromTo(
        '.service-tab',
        { x: -50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.1,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 60%',
            toggleActions: 'play none none reverse'
          }
        }
      );

      // Content animation
      gsap.fromTo(
        contentRef.current,
        { rotateY: 15, opacity: 0 },
        {
          rotateY: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'expo.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 50%',
            toggleActions: 'play none none reverse'
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleTabChange = (index: number) => {
    if (index === activeTab) return;

    // Animate content out
    gsap.to(contentRef.current, {
      x: -50,
      opacity: 0,
      duration: 0.3,
      ease: 'expo.in',
      onComplete: () => {
        setActiveTab(index);
        // Animate content in
        gsap.fromTo(
          contentRef.current,
          { x: 50, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.5, ease: 'expo.out' }
        );
      }
    });
  };

  const currentTab = tabs[activeTab];

  return (
    <section
      id="services"
      ref={sectionRef}
      className="relative py-24 lg:py-32 bg-black overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-[#FFD700]/3 rounded-full blur-[150px]" />
        <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-[#FFD700]/2 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="services-title section-tag opacity-0">
            {t('services.sectionTag')}
          </span>
          <h2 className="services-title text-3xl lg:text-4xl font-bold text-white mt-4 opacity-0">
            {t('services.title')}
          </h2>
        </div>

        {/* Content Grid */}
        <div className="grid lg:grid-cols-12 gap-8">
          {/* Tabs */}
          <div className="lg:col-span-4 space-y-2">
            {tabs.map((tab, index) => {
              const Icon = icons[index];
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(index)}
                  className={`service-tab w-full text-left p-4 rounded-lg transition-all duration-300 flex items-center gap-4 opacity-0 ${
                    activeTab === index
                      ? 'bg-[#FFD700]/10 border-l-4 border-[#FFD700]'
                      : 'bg-white/5 hover:bg-white/10 border-l-4 border-transparent'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors duration-300 ${
                    activeTab === index ? 'bg-[#FFD700]/20' : 'bg-white/10'
                  }`}>
                    <Icon className={`w-5 h-5 transition-colors duration-300 ${
                      activeTab === index ? 'text-[#FFD700]' : 'text-white/60'
                    }`} />
                  </div>
                  <span className={`font-medium transition-colors duration-300 ${
                    activeTab === index ? 'text-white' : 'text-white/60'
                  }`}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div
            ref={contentRef}
            className="lg:col-span-8 opacity-0"
            style={{ perspective: '1000px' }}
          >
            <div className="bg-white/5 rounded-2xl overflow-hidden">
              {/* Image */}
              <div className="relative h-64 lg:h-80">
                <img
                  src={`/service-${currentTab.id}.jpg`}
                  alt={currentTab.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                {/* Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-2xl lg:text-3xl font-bold text-white">
                    {currentTab.title}
                  </h3>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 lg:p-8">
                <p className="text-white/70 leading-relaxed mb-6">
                  {currentTab.description}
                </p>

                {/* Service Items */}
                <div className="grid sm:grid-cols-2 gap-4 mb-8">
                  {currentTab.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors duration-300 group"
                    >
                      <div className="w-6 h-6 rounded-full bg-[#FFD700]/20 flex items-center justify-center group-hover:bg-[#FFD700]/30 transition-colors duration-300">
                        <Check className="w-4 h-4 text-[#FFD700]" />
                      </div>
                      <span className="text-white/80 text-sm">{item}</span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button className="btn-gold flex items-center gap-2 group">
                  {t('services.cta')}
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
