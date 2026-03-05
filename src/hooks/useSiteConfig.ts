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
    tagline: 'FAC · 港匠匯',
    taglineEn: 'FAC · Facilitating Artisan Collective',
    title1: '智慧沉澱，',
    title1En: 'Wisdom Distilled,',
    title2: '在此相遇。',
    title2En: 'Meeting Here.',
    subtitle: '香港首個退休精英智慧共享平台。致企業：有些答案，不在數據庫，在老江湖的眉頭一皺。',
    subtitleEn: "Hong Kong's first wisdom-sharing platform for retired industry elite. Some answers aren't in databases — they're in the furrowed brow of a seasoned veteran.",
    cta1: '成為導師：灌溉下一代',
    cta1En: 'Become a Mentor',
    cta2: '尋求專家：與老江湖對話',
    cta2En: 'Find an Expert'
  },
  about: {
    title: '香港之所以成為香港，是因為一代又一代人的「紮實」。',
    titleEn: "Hong Kong became what it is because of generations who were 'solid'.",
    description: '石屎森林裡，每一塊磚都是汗水砌成的。獅子山下，沒有人憑空得到什麼——憑的是一雙手、一顆心、幾十年如一日的埋頭苦幹。那些在細房仔裡傾密偈的夜晚，那些師傅帶徒弟時不說出口的手勢——這些無法被 Google 搜索的智慧，才是香港真正的底蘊。',
    descriptionEn: "In the concrete forest, every brick was laid with sweat. Under Lion Rock, no one got anything for free. Those late nights in tiny flats, the gestures a master passes silently to an apprentice — wisdom that no Google search can find. That is Hong Kong's true foundation.",
    features: [
      '精英導師網絡：跨行業、跨世代的智慧橋樑',
      '實戰經驗為本：不講理論，只談老江湖的眉頭一皺',
      '大灣區視野：根植香港，放眼粵港澳'
    ],
    featuresEn: [
      'Elite Mentor Network: Bridges across industries and generations',
      'Experience-First: Not theory, but the instinct of veterans',
      'Greater Bay Area Vision: Rooted in HK, eyes on the GBA'
    ]
  },
  stats: {
    projects: {
      number: '200+',
      label: '成功配對',
      labelEn: 'Matches Made',
      desc: '成功促成超過200個專家配對',
      descEn: 'Over 200 successful expert pairings'
    },
    partners: {
      number: '80+',
      label: '精英導師',
      labelEn: 'Elite Mentors',
      desc: '匯聚80+位退休業界精英',
      descEn: '80+ retired industry veterans'
    },
    experts: {
      number: '25+',
      label: '專業領域',
      labelEn: 'Domains',
      desc: '覆蓋25+個核心行業領域',
      descEn: '25+ core industry domains covered'
    },
    clients: {
      number: '300+',
      label: '服務企業',
      labelEn: 'Businesses Served',
      desc: '服務超過300家中小企業',
      descEn: 'Over 300 SMEs served'
    }
  },
  contact: {
    address: '香港九龍尖沙咀梳士巴利道18號',
    addressEn: '18 Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong',
    phone: '+852 1234 5678',
    email: 'info@hkfac.com',
    hours: '週一至週五 9:00 - 18:00',
    hoursEn: 'Mon–Fri 9:00 – 18:00'
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
