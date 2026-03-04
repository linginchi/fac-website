import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 简体中文
const zhCN = {
  nav: {
    home: '首页',
    about: '关于我们',
    services: '服务',
    team: '团队',
    partners: '合作',
    contact: '联系',
    cta: '立即咨询'
  },
  hero: {
    tagline: '香港中科創新中心有限公司',
    title1: '连接科技、',
    title2: '资本与人才',
    subtitle: '我们致力于成为香港领先的创新中心，通过专业交付与资源赋能，助力企业实现数字化转型与可持续增长。',
    cta1: '探索我们的服务',
    cta2: '联系我们',
    scroll: '向下滚动'
  },
  about: {
    sectionTag: '关于我们',
    title: '引领创新，赋能未来',
    description: '香港中科創新中心有限公司（FAC）成立于香港，是一家专注于科技创新与产业赋能的综合性服务平台。我们依托香港国际化的区位优势，连接全球科技资源与资本市场，为企业提供从战略咨询到落地执行的全链条服务。',
    features: [
      '国际化视野，本土化执行',
      '产学研深度融合',
      '全生命周期服务'
    ],
    cta: '了解更多'
  },
  stats: {
    projects: { number: '50+', label: '成功项目', desc: '累计交付超过50个创新项目' },
    partners: { number: '100+', label: '战略合作伙伴', desc: '与全球100+机构建立合作' },
    experts: { number: '30+', label: '行业专家', desc: '汇聚30+位资深行业专家' },
    clients: { number: '500+', label: '服务企业', desc: '服务超过500家企业客户' }
  },
  services: {
    sectionTag: '我们的服务',
    title: '全方位创新服务，助力企业腾飞',
    tabs: [
      {
        id: 'consulting',
        label: '创新咨询',
        title: '创新咨询',
        description: '为企业提供战略规划、市场分析、技术路线规划等专业咨询服务，助力企业明确发展方向。',
        items: ['战略规划', '市场研究', '技术评估', '商业模式设计']
      },
      {
        id: 'incubation',
        label: '孵化加速',
        title: '孵化加速',
        description: '为初创企业提供全方位孵化服务，包括办公空间、导师辅导、资源对接、融资支持等。',
        items: ['办公空间', '导师辅导', '资源对接', '融资服务']
      },
      {
        id: 'technology',
        label: '技术转移',
        title: '技术转移',
        description: '促进科研成果产业化，搭建产学研合作桥梁，推动技术创新与商业应用的深度融合。',
        items: ['专利授权', '技术许可', '联合研发', '成果转化']
      },
      {
        id: 'investment',
        label: '投资对接',
        title: '投资对接',
        description: '连接优质项目与资本，为企业提供从种子轮到成长期的全周期融资服务。',
        items: ['项目评估', '投资人对接', '融资顾问', '投后管理']
      }
    ],
    cta: '了解详情'
  },
  team: {
    sectionTag: '核心团队',
    title: '汇聚行业精英，共创卓越价值'
  },
  partners: {
    sectionTag: '战略合作伙伴',
    title: '携手全球领先机构，共创创新生态'
  },
  contact: {
    sectionTag: '联系我们',
    title: '期待与您的合作',
    form: {
      name: '姓名',
      namePlaceholder: '请输入您的姓名',
      email: '邮箱',
      emailPlaceholder: '请输入您的邮箱',
      subject: '主题',
      subjectPlaceholder: '请输入主题',
      message: '留言',
      messagePlaceholder: '请输入您的留言',
      submit: '发送消息',
      sending: '发送中...',
      success: '消息已发送，我们会尽快与您联系！',
      error: '发送失败，请稍后重试。'
    },
    info: {
      address: '地址',
      addressValue: '香港九龙尖沙咀梳士巴利道18号',
      phone: '电话',
      phoneValue: '+852 1234 5678',
      email: '邮箱',
      emailValue: 'info@hkfac.com',
      hours: '工作时间',
      hoursValue: '周一至周五 9:00 - 18:00'
    },
    social: '关注我们'
  },
  footer: {
    about: '香港中科創新中心有限公司致力于成为香港领先的创新服务平台。',
    quickLinks: '快速链接',
    services: '服务',
    contact: '联系方式',
    copyright: '© 2024 香港中科創新中心有限公司. 保留所有权利.',
    privacy: '隐私政策',
    terms: '使用条款'
  },
  article: {
    back: '返回首页',
    share: '分享到',
    wechat: '微信',
    weibo: '微博',
    linkedin: 'LinkedIn',
    related: '相关文章'
  }
};

// 繁体中文（香港）
const zhHK = {
  nav: {
    home: '首頁',
    about: '關於我們',
    services: '服務',
    team: '團隊',
    partners: '合作',
    contact: '聯繫',
    cta: '立即諮詢'
  },
  hero: {
    tagline: '香港中科創新中心有限公司',
    title1: '連接科技、',
    title2: '資本與人才',
    subtitle: '我們致力於成為香港領先的創新中心，通過專業交付與資源賦能，助力企業實現數字化轉型與可持續增長。',
    cta1: '探索我們的服務',
    cta2: '聯繫我們',
    scroll: '向下滾動'
  },
  about: {
    sectionTag: '關於我們',
    title: '引領創新，賦能未來',
    description: '香港中科創新中心有限公司（FAC）成立於香港，是一家專注於科技創新與產業賦能的綜合性服務平台。我們依托香港國際化的區位優勢，連接全球科技資源與資本市場，為企業提供從戰略諮詢到落地執行的全鏈條服務。',
    features: [
      '國際化視野，本土化執行',
      '產學研深度融合',
      '全生命週期服務'
    ],
    cta: '了解更多'
  },
  stats: {
    projects: { number: '50+', label: '成功項目', desc: '累計交付超過50個創新項目' },
    partners: { number: '100+', label: '戰略合作夥伴', desc: '與全球100+機構建立合作' },
    experts: { number: '30+', label: '行業專家', desc: '匯聚30+位資深行業專家' },
    clients: { number: '500+', label: '服務企業', desc: '服務超過500家企業客戶' }
  },
  services: {
    sectionTag: '我們的服務',
    title: '全方位創新服務，助力企業騰飛',
    tabs: [
      {
        id: 'consulting',
        label: '創新諮詢',
        title: '創新諮詢',
        description: '為企業提供戰略規劃、市場分析、技術路線規劃等專業諮詢服務，助力企業明確發展方向。',
        items: ['戰略規劃', '市場研究', '技術評估', '商業模式設計']
      },
      {
        id: 'incubation',
        label: '孵化加速',
        title: '孵化加速',
        description: '為初創企業提供全方位孵化服務，包括辦公空間、導師輔導、資源對接、融資支持等。',
        items: ['辦公空間', '導師輔導', '資源對接', '融資服務']
      },
      {
        id: 'technology',
        label: '技術轉移',
        title: '技術轉移',
        description: '促進科研成果產業化，搭建產學研合作橋樑，推動技術創新與商業應用的深度融合。',
        items: ['專利授權', '技術許可', '聯合研發', '成果轉化']
      },
      {
        id: 'investment',
        label: '投資對接',
        title: '投資對接',
        description: '連接優質項目與資本，為企業提供從種子輪到成長期的全週期融資服務。',
        items: ['項目評估', '投資人對接', '融資顧問', '投後管理']
      }
    ],
    cta: '了解詳情'
  },
  team: {
    sectionTag: '核心團隊',
    title: '匯聚行業精英，共創卓越價值'
  },
  partners: {
    sectionTag: '戰略合作夥伴',
    title: '攜手全球領先機構，共創創新生態'
  },
  contact: {
    sectionTag: '聯繫我們',
    title: '期待與您的合作',
    form: {
      name: '姓名',
      namePlaceholder: '請輸入您的姓名',
      email: '郵箱',
      emailPlaceholder: '請輸入您的郵箱',
      subject: '主題',
      subjectPlaceholder: '請輸入主題',
      message: '留言',
      messagePlaceholder: '請輸入您的留言',
      submit: '發送消息',
      sending: '發送中...',
      success: '消息已發送，我們會盡快與您聯繫！',
      error: '發送失敗，請稍後重試。'
    },
    info: {
      address: '地址',
      addressValue: '香港九龍尖沙咀梳士巴利道18號',
      phone: '電話',
      phoneValue: '+852 1234 5678',
      email: '郵箱',
      emailValue: 'info@hkfac.com',
      hours: '工作時間',
      hoursValue: '週一至週五 9:00 - 18:00'
    },
    social: '關注我們'
  },
  footer: {
    about: '香港中科創新中心有限公司致力於成為香港領先的創新服務平台。',
    quickLinks: '快速鏈接',
    services: '服務',
    contact: '聯繫方式',
    copyright: '© 2024 香港中科創新中心有限公司. 保留所有權利.',
    privacy: '隱私政策',
    terms: '使用條款'
  },
  article: {
    back: '返回首頁',
    share: '分享到',
    wechat: '微信',
    weibo: '微博',
    linkedin: 'LinkedIn',
    related: '相關文章'
  }
};

// English
const en = {
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    team: 'Team',
    partners: 'Partners',
    contact: 'Contact',
    cta: 'Get in Touch'
  },
  hero: {
    tagline: 'FAC (Hong Kong) Ltd.',
    title1: 'Connecting Technology,',
    title2: 'Capital & Talent',
    subtitle: 'We are committed to becoming Hong Kong\'s leading innovation center, empowering enterprises to achieve digital transformation and sustainable growth through professional delivery and resource enablement.',
    cta1: 'Explore Our Services',
    cta2: 'Contact Us',
    scroll: 'Scroll Down'
  },
  about: {
    sectionTag: 'About Us',
    title: 'Leading Innovation, Empowering Future',
    description: 'FAC (Hong Kong) Ltd. is a comprehensive service platform focused on technology innovation and industry empowerment. Leveraging Hong Kong\'s international advantages, we connect global technology resources with capital markets, providing end-to-end services from strategic consulting to implementation.',
    features: [
      'Global Vision, Local Execution',
      'Industry-Academia-Research Integration',
      'Full Lifecycle Services'
    ],
    cta: 'Learn More'
  },
  stats: {
    projects: { number: '50+', label: 'Projects', desc: 'Delivered over 50 innovation projects' },
    partners: { number: '100+', label: 'Partners', desc: 'Collaborated with 100+ global institutions' },
    experts: { number: '30+', label: 'Experts', desc: 'Gathered 30+ senior industry experts' },
    clients: { number: '500+', label: 'Clients', desc: 'Served over 500 enterprise clients' }
  },
  services: {
    sectionTag: 'Our Services',
    title: 'Comprehensive Innovation Services for Your Success',
    tabs: [
      {
        id: 'consulting',
        label: 'Innovation Consulting',
        title: 'Innovation Consulting',
        description: 'Providing strategic planning, market analysis, and technology roadmap consulting to help enterprises define their development direction.',
        items: ['Strategic Planning', 'Market Research', 'Technology Assessment', 'Business Model Design']
      },
      {
        id: 'incubation',
        label: 'Incubation',
        title: 'Incubation & Acceleration',
        description: 'Comprehensive incubation services for startups, including office space, mentorship, resource matching, and funding support.',
        items: ['Office Space', 'Mentorship', 'Resource Matching', 'Funding Support']
      },
      {
        id: 'technology',
        label: 'Tech Transfer',
        title: 'Technology Transfer',
        description: 'Promoting the industrialization of research achievements and building bridges between industry, academia, and research.',
        items: ['Patent Licensing', 'Technology Licensing', 'Joint R&D', 'Commercialization']
      },
      {
        id: 'investment',
        label: 'Investment',
        title: 'Investment Matching',
        description: 'Connecting quality projects with capital, providing full-cycle financing services from seed to growth stage.',
        items: ['Project Evaluation', 'Investor Matching', 'Financing Advisory', 'Post-investment Management']
      }
    ],
    cta: 'Learn More'
  },
  team: {
    sectionTag: 'Our Team',
    title: 'Industry Elite, Creating Excellence Together'
  },
  partners: {
    sectionTag: 'Strategic Partners',
    title: 'Partnering with Global Leaders to Build Innovation Ecosystem'
  },
  contact: {
    sectionTag: 'Contact Us',
    title: 'Looking Forward to Working with You',
    form: {
      name: 'Name',
      namePlaceholder: 'Enter your name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      subject: 'Subject',
      subjectPlaceholder: 'Enter subject',
      message: 'Message',
      messagePlaceholder: 'Enter your message',
      submit: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent! We will contact you soon.',
      error: 'Failed to send. Please try again later.'
    },
    info: {
      address: 'Address',
      addressValue: '18 Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong',
      phone: 'Phone',
      phoneValue: '+852 1234 5678',
      email: 'Email',
      emailValue: 'info@hkfac.com',
      hours: 'Working Hours',
      hoursValue: 'Mon-Fri 9:00 - 18:00'
    },
    social: 'Follow Us'
  },
  footer: {
    about: 'FAC (Hong Kong) Ltd. is committed to becoming a leading innovation service platform in Hong Kong.',
    quickLinks: 'Quick Links',
    services: 'Services',
    contact: 'Contact',
    copyright: '© 2024 FAC (Hong Kong) Ltd. All rights reserved.',
    privacy: 'Privacy Policy',
    terms: 'Terms of Use'
  },
  article: {
    back: 'Back to Home',
    share: 'Share to',
    wechat: 'WeChat',
    weibo: 'Weibo',
    linkedin: 'LinkedIn',
    related: 'Related Articles'
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'zh-CN': { translation: zhCN },
      'zh-HK': { translation: zhHK },
      'en': { translation: en }
    },
    fallbackLng: 'zh-HK',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage']
    }
  });

export default i18n;
