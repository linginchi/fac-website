import { useState, useEffect, useCallback } from 'react';

// Site configuration interface
export interface SiteConfig {
  hero: {
    tagline: string;
    taglineEn: string;
    title1: string;
    title1En: string;
    title2: string;
    title2En: string;
    subtitle: string;
    subtitleEn: string;
    cta1: string;
    cta1En: string;
    cta2: string;
    cta2En: string;
  };
  about: {
    title: string;
    titleEn: string;
    description: string;
    descriptionEn: string;
    features: string[];
    featuresEn: string[];
  };
  stats: {
    projects: { number: string; label: string; labelEn: string; desc: string; descEn: string };
    partners: { number: string; label: string; labelEn: string; desc: string; descEn: string };
    experts: { number: string; label: string; labelEn: string; desc: string; descEn: string };
    clients: { number: string; label: string; labelEn: string; desc: string; descEn: string };
  };
  contact: {
    address: string;
    addressEn: string;
    phone: string;
    email: string;
    hours: string;
    hoursEn: string;
  };
}

const STORAGE_KEY = 'fac_site_config';

const defaultConfig: SiteConfig = {
  hero: {
    tagline: '香港中科創新中心有限公司',
    taglineEn: 'FAC (Hong Kong) Ltd.',
    title1: '连接科技、',
    title1En: 'Connecting Technology,',
    title2: '资本与人才',
    title2En: 'Capital & Talent',
    subtitle: '我们致力于成为香港领先的创新中心，通过专业交付与资源赋能，助力企业实现数字化转型与可持续增长。',
    subtitleEn: 'We are committed to becoming Hong Kong\'s leading innovation center, empowering enterprises to achieve digital transformation and sustainable growth through professional delivery and resource enablement.',
    cta1: '探索我们的服务',
    cta1En: 'Explore Our Services',
    cta2: '联系我们',
    cta2En: 'Contact Us'
  },
  about: {
    title: '引领创新，赋能未来',
    titleEn: 'Leading Innovation, Empowering Future',
    description: '香港中科創新中心有限公司（FAC）成立于香港，是一家专注于科技创新与产业赋能的综合性服务平台。我们依托香港国际化的区位优势，连接全球科技资源与资本市场，为企业提供从战略咨询到落地执行的全链条服务。',
    descriptionEn: 'FAC (Hong Kong) Ltd. is a comprehensive service platform focused on technology innovation and industry empowerment. Leveraging Hong Kong\'s international advantages, we connect global technology resources with capital markets, providing end-to-end services from strategic consulting to implementation.',
    features: [
      '国际化视野，本土化执行',
      '产学研深度融合',
      '全生命周期服务'
    ],
    featuresEn: [
      'Global Vision, Local Execution',
      'Industry-Academia-Research Integration',
      'Full Lifecycle Services'
    ]
  },
  stats: {
    projects: { 
      number: '50+', 
      label: '成功项目', 
      labelEn: 'Projects',
      desc: '累计交付超过50个创新项目',
      descEn: 'Delivered over 50 innovation projects'
    },
    partners: { 
      number: '100+', 
      label: '战略合作伙伴', 
      labelEn: 'Partners',
      desc: '与全球100+机构建立合作',
      descEn: 'Collaborated with 100+ global institutions'
    },
    experts: { 
      number: '30+', 
      label: '行业专家', 
      labelEn: 'Experts',
      desc: '汇聚30+位资深行业专家',
      descEn: 'Gathered 30+ senior industry experts'
    },
    clients: { 
      number: '500+', 
      label: '服务企业', 
      labelEn: 'Clients',
      desc: '服务超过500家企业客户',
      descEn: 'Served over 500 enterprise clients'
    }
  },
  contact: {
    address: '香港九龙尖沙咀梳士巴利道18号',
    addressEn: '18 Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong',
    phone: '+852 1234 5678',
    email: 'info@hkfac.com',
    hours: '周一至周五 9:00 - 18:00',
    hoursEn: 'Mon-Fri 9:00 - 18:00'
  }
};

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setConfig({ ...defaultConfig, ...parsed });
      } catch (e) {
        console.error('Failed to parse site config:', e);
        setConfig(defaultConfig);
      }
    } else {
      setConfig(defaultConfig);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    }
  }, [config, isLoaded]);

  const updateConfig = useCallback((section: keyof SiteConfig, data: Partial<SiteConfig[keyof SiteConfig]>) => {
    setConfig(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  }, []);

  const resetToDefault = useCallback(() => {
    setConfig(defaultConfig);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultConfig));
  }, []);

  return {
    config,
    isLoaded,
    updateConfig,
    resetToDefault
  };
}
