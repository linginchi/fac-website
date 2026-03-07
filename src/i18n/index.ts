import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 简体中文 — FAC | 港匠汇
const zhCN = {
  brand: {
    title: '港匠汇',
    subtitle: '由 国科绿色发展国际实验室 营运 · 香港注册非营利机构'
  },
  nav: {
    home: '首页',
    about: '关于我们',
    services: '专业领域',
    token: '代币经济',
    team: '导师团队',
    partners: '合作伙伴',
    contact: '联络我们',
    cta: '立即预约'
  },
  hero: {
    commandGuidance: '阁下想分享专业，抑或寻求专家？请即口述、传讯或上传图档，FAC 港匠汇 为您效劳。',
    commandSubline: 'CAS Laboratory · 香港非营利 · 数据主权归用户',
    tagline: 'FAC · 港匠汇',
    title1: '智慧沉淀，',
    title2: '在此相遇。',
    subtitle: '香港首个退休精英智慧共享平台。致企业：有些答案，不在数据库，在老江湖的眉头一皱。',
    cta1: '成为导师：灌溉下一代',
    cta2: '寻求专家：与老江湖对话',
    scroll: '向下滚动'
  },
  about: {
    sectionTag: '关于我们',
    title: '香港之所以成为香港，是因为一代又一代人的「扎实」。',
    description: '石屎森林里，每一块砖都是汗水砌成的。狮子山下，没有人凭空得到什么——凭的是一双手、一颗心、几十年如一日的埋头苦干。那些在小房子里彻夜长谈的夜晚，那些师傅带徒弟时不说出口的手势、眼神与停顿——这些无法被 Google 搜索的智慧，才是香港真正的底蕴。',
    features: [
      '精英导师网络：跨行业、跨世代的智慧桥梁',
      '实战经验为本：不讲理论，只谈老江湖的眉头一皱',
      '大湾区视野：根植香港，放眼粤港澳'
    ],
    cta: '了解五大专业领域'
  },
  stats: {
    projects: { number: '200+', label: '成功配对', desc: '成功促成超过200个专家配对' },
    partners: { number: '80+', label: '精英导师', desc: '汇聚80+位退休业界精英' },
    experts: { number: '25+', label: '专业领域', desc: '覆盖25+个核心行业领域' },
    clients: { number: '300+', label: '服务企业', desc: '服务超过300家中小企业' }
  },
  services: {
    sectionTag: '五大专业领域',
    title: '每一个领域，都是几十年磨砺的结晶',
    tabs: [
      {
        id: 'trade',
        label: '跨境贸易',
        title: '跨境贸易与国际合规',
        description: '大湾区双向物流、出口管制策略、关税架构优化。数十年亲身磨砺的实战心法，助企业在复杂监管环境中稳步前行。',
        items: ['大湾区物流策略', '出口管制合规', '关税优化架构', '国际贸易谈判']
      },
      {
        id: 'retail',
        label: '零售品牌',
        title: '高级零售与品牌管理',
        description: '从服务哲学到库存美学，从品牌定位到团队激励——真正懂零售的人，知道一个眼神能改变顾客体验。',
        items: ['客户服务哲学', '库存美学管理', '品牌定位策略', '零售团队激励']
      },
      {
        id: 'wealth',
        label: '家族传承',
        title: '家族财富与企业传承',
        description: '信托架构设计、接班人选拔培养、家族治理宪章制定。让几代人的心血，以最稳妥的方式薪火相传。',
        items: ['信托架构设计', '接班人培育', '家族治理宪章', '财富传承规划']
      },
      {
        id: 'manufacturing',
        label: '制造工艺',
        title: '精密制造与工艺传承',
        description: '老师傅的那双手，藏着任何 AI 都无法复制的精密。带徒心法、技术兼容之道，让工艺在时代洪流中不失根。',
        items: ['老师傅带徒心法', '精密工艺传承', '技术兼容规划', '制造流程优化']
      },
      {
        id: 'finance',
        label: '融资财务',
        title: '企业融资与现金流管理',
        description: '银行谈判桌上的底气从何而来？风险控制的直觉如何培养？债务重组的时机怎样判断？问老江湖。',
        items: ['银行谈判策略', '现金流管理', '风险控制框架', '债务重组规划']
      }
    ],
    cta: '预约免费咨询'
  },
  team: {
    sectionTag: '导师团队',
    title: '业界老将，倾囊相授'
  },
  partners: {
    sectionTag: '合作伙伴',
    title: '携手香港业界，共筑智慧桥梁'
  },
  contact: {
    sectionTag: '联络我们',
    title: '智慧，从一次对话开始',
    form: {
      name: '姓名',
      namePlaceholder: '请输入您的姓名',
      email: '邮箱',
      emailPlaceholder: '请输入您的邮箱',
      subject: '主题',
      subjectPlaceholder: '例如：寻求跨境贸易专家',
      message: '留言',
      messagePlaceholder: '告诉我们您的需求或问题，我们会为您配对最合适的导师。',
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
    about: 'FAC 港匠汇致力连结退休精英与有需要的企业，让商业智慧薪火相传。',
    quickLinks: '快速链接',
    services: '专业领域',
    contact: '联络方式',
    copyright: '© 2025 FAC | 港匠汇 · Facilitating Artisan Collective. 版权所有。',
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

// 繁體中文（香港）— FAC | 港匠匯
const zhHK = {
  brand: {
    title: '港匠匯',
    subtitle: '由 國科綠色發展國際實驗室 營運 · 香港註冊非盈利機構'
  },
  nav: {
    home: '首頁',
    about: '關於我們',
    services: '專業領域',
    token: '代幣經濟',
    team: '導師團隊',
    partners: '合作夥伴',
    contact: '聯絡我們',
    cta: '立即預約'
  },
  hero: {
    commandGuidance: '閣下想分享專業，抑或尋求專家？請即口述、傳訊或上傳圖檔，FAC 港匠匯 為您效勞。',
    commandSubline: 'CAS Laboratory · 香港非盈利 · 數據主權歸用戶',
    tagline: 'FAC · 港匠匯',
    title1: '智慧沉澱，',
    title2: '在此相遇。',
    subtitle: '香港首個退休精英智慧共享平台。致企業：有些答案，不在數據庫，在老江湖的眉頭一皺。',
    cta1: '成為導師：灌溉下一代',
    cta2: '尋求專家：與老江湖對話',
    scroll: '向下滾動'
  },
  about: {
    sectionTag: '關於我們',
    title: '香港之所以成為香港，是因為一代又一代人的「紮實」。',
    description: '石屎森林裡，每一塊磚都是汗水砌成的。獅子山下，沒有人憑空得到什麼——憑的是一雙手、一顆心、幾十年如一日的埋頭苦幹。那些在細房仔裡傾密偈的夜晚，那些師傅帶徒弟時不說出口的手勢、眼神與停頓——這些無法被 Google 搜索的智慧，才是香港真正的底蘊。',
    features: [
      '精英導師網絡：跨行業、跨世代的智慧橋樑',
      '實戰經驗為本：不講理論，只談老江湖的眉頭一皺',
      '大灣區視野：根植香港，放眼粵港澳'
    ],
    cta: '了解五大專業領域'
  },
  stats: {
    projects: { number: '200+', label: '成功配對', desc: '成功促成超過200個專家配對' },
    partners: { number: '80+', label: '精英導師', desc: '匯聚80+位退休業界精英' },
    experts: { number: '25+', label: '專業領域', desc: '覆蓋25+個核心行業領域' },
    clients: { number: '300+', label: '服務企業', desc: '服務超過300家中小企業' }
  },
  services: {
    sectionTag: '五大專業領域',
    title: '每一個領域，都是幾十年磨礪的結晶',
    tabs: [
      {
        id: 'trade',
        label: '跨境貿易',
        title: '跨境貿易與國際合規',
        description: '大灣區雙向物流、出口管制策略、關稅架構優化。數十年親身磨礪的實戰心法，助企業在複雜監管環境中穩步前行。',
        items: ['大灣區物流策略', '出口管制合規', '關稅優化架構', '國際貿易談判']
      },
      {
        id: 'retail',
        label: '零售品牌',
        title: '高級零售與品牌管理',
        description: '從服務哲學到庫存美學，從品牌定位到團隊激勵——真正懂零售的人，知道一個眼神能改變顧客體驗。',
        items: ['客戶服務哲學', '庫存美學管理', '品牌定位策略', '零售團隊激勵']
      },
      {
        id: 'wealth',
        label: '家族傳承',
        title: '家族財富與企業傳承',
        description: '信託架構設計、接班人選拔培養、家族治理憲章制定。讓幾代人的心血，以最穩妥的方式薪火相傳。',
        items: ['信託架構設計', '接班人培育', '家族治理憲章', '財富傳承規劃']
      },
      {
        id: 'manufacturing',
        label: '製造工藝',
        title: '精密製造與工藝傳承',
        description: '老師傅的那雙手，藏著任何 AI 都無法複製的精密。帶徒心法、技術相容之道，讓工藝在時代洪流中不失根。',
        items: ['老師傅帶徒心法', '精密工藝傳承', '技術相容規劃', '製造流程優化']
      },
      {
        id: 'finance',
        label: '融資財務',
        title: '企業融資與現金流管理',
        description: '銀行談判桌上的底氣從何而來？風險控制的直覺如何培養？債務重組的時機怎樣判斷？問老江湖。',
        items: ['銀行談判策略', '現金流管理', '風險控制框架', '債務重組規劃']
      }
    ],
    cta: '預約免費諮詢'
  },
  team: {
    sectionTag: '導師團隊',
    title: '業界老將，傾囊相授'
  },
  partners: {
    sectionTag: '合作夥伴',
    title: '攜手香港業界，共築智慧橋樑'
  },
  contact: {
    sectionTag: '聯絡我們',
    title: '智慧，從一次對話開始',
    form: {
      name: '姓名',
      namePlaceholder: '請輸入您的姓名',
      email: '電郵',
      emailPlaceholder: '請輸入您的電郵',
      subject: '主題',
      subjectPlaceholder: '例如：尋求跨境貿易專家',
      message: '留言',
      messagePlaceholder: '告訴我們您的需求或問題，我們會為您配對最合適的導師。',
      submit: '發送訊息',
      sending: '發送中...',
      success: '訊息已發送，我們會盡快與您聯繫！',
      error: '發送失敗，請稍後重試。'
    },
    info: {
      address: '地址',
      addressValue: '香港九龍尖沙咀梳士巴利道18號',
      phone: '電話',
      phoneValue: '+852 1234 5678',
      email: '電郵',
      emailValue: 'info@hkfac.com',
      hours: '辦公時間',
      hoursValue: '週一至週五 9:00 - 18:00'
    },
    social: '關注我們'
  },
  footer: {
    about: 'FAC 港匠匯致力連結退休精英與有需要的企業，讓商業智慧薪火相傳。',
    quickLinks: '快速連結',
    services: '專業領域',
    contact: '聯絡資訊',
    copyright: '© 2025 FAC | 港匠匯 · Facilitating Artisan Collective. 版權所有。',
    privacy: '隱私政策',
    terms: '使用條款'
  },
  article: {
    back: '返回首頁',
    share: '分享至',
    wechat: '微信',
    weibo: '微博',
    linkedin: 'LinkedIn',
    related: '相關文章'
  }
};

// English — FAC | Facilitating Artisan Collective
const en = {
  brand: {
    title: 'Facilitating Artisan Collective',
    subtitle: 'Operated by CAS Laboratory · HK Registered Non-profit Organization'
  },
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Expertise',
    token: '$FAC Token',
    team: 'Mentors',
    partners: 'Partners',
    contact: 'Contact',
    cta: 'Book a Session'
  },
  hero: {
    commandGuidance: 'Share your expertise or find an expert? Speak, type or upload — FAC is at your service.',
    commandSubline: 'CAS Laboratory · Non-profit · Your data, your sovereignty',
    tagline: 'FAC · Facilitating Artisan Collective',
    title1: 'Wisdom Distilled,',
    title2: 'Meeting Here.',
    subtitle: "Hong Kong's first wisdom-sharing platform for retired industry elite. To enterprises: some answers aren't in databases — they're in the furrowed brow of a seasoned veteran.",
    cta1: 'Become a Mentor: Nurture the Next Generation',
    cta2: 'Find an Expert: Talk to a Veteran',
    scroll: 'Scroll Down'
  },
  about: {
    sectionTag: 'About Us',
    title: "Hong Kong became what it is because of generations of people who were 'solid'.",
    description: "In the concrete forest, every brick was laid with sweat. Under Lion Rock, no one got anything for free — it took two hands, one heart, and decades of perseverance. Those late nights of intimate conversations in tiny flats, the gestures and silent moments a master passes to an apprentice — wisdom that no Google search can find. That is Hong Kong's true foundation.",
    features: [
      'Elite Mentor Network: Bridges across industries and generations',
      'Experience-First: Not theory, but the seasoned instinct of veterans',
      'Greater Bay Area Vision: Rooted in HK, eyes on the GBA'
    ],
    cta: 'Explore Our 5 Domains'
  },
  stats: {
    projects: { number: '200+', label: 'Matches Made', desc: 'Over 200 successful expert pairings' },
    partners: { number: '80+', label: 'Elite Mentors', desc: '80+ retired industry veterans' },
    experts: { number: '25+', label: 'Domains', desc: '25+ core industry domains covered' },
    clients: { number: '300+', label: 'Businesses Served', desc: 'Over 300 SMEs served' }
  },
  services: {
    sectionTag: '5 Domains of Expertise',
    title: 'Each domain — decades of hard-earned wisdom',
    tabs: [
      {
        id: 'trade',
        label: 'Cross-Border Trade',
        title: 'Cross-Border Trade & International Compliance',
        description: 'GBA logistics, export controls, tariff architecture optimisation. Decades of hands-on experience navigating complex regulatory environments.',
        items: ['GBA Logistics Strategy', 'Export Control Compliance', 'Tariff Optimisation', 'International Trade Negotiation']
      },
      {
        id: 'retail',
        label: 'Retail & Branding',
        title: 'Premium Retail & Brand Management',
        description: 'From service philosophy to inventory aesthetics, brand positioning to team motivation — those who truly understand retail know a single glance can transform the customer experience.',
        items: ['Customer Service Philosophy', 'Inventory Aesthetics', 'Brand Positioning', 'Retail Team Motivation']
      },
      {
        id: 'wealth',
        label: 'Family Succession',
        title: 'Family Wealth & Business Succession',
        description: 'Trust structures, successor selection, family governance charters. Ensuring that the work of generations is passed on with care and stability.',
        items: ['Trust Structure Design', 'Successor Development', 'Family Governance Charter', 'Wealth Succession Planning']
      },
      {
        id: 'manufacturing',
        label: 'Manufacturing',
        title: 'Precision Manufacturing & Craft Succession',
        description: "The master's hands hold a precision no AI can replicate. Apprenticeship philosophy and technology compatibility — keeping craft alive in the modern era.",
        items: ['Mentorship Methodology', 'Craft Succession', 'Technology Compatibility', 'Process Optimisation']
      },
      {
        id: 'finance',
        label: 'Corporate Finance',
        title: 'Corporate Financing & Cashflow Management',
        description: 'Where does confidence at the bank negotiating table come from? How is risk control instinct cultivated? Ask a veteran.',
        items: ['Bank Negotiation Strategy', 'Cashflow Management', 'Risk Control Framework', 'Debt Restructuring']
      }
    ],
    cta: 'Book a Free Consultation'
  },
  team: {
    sectionTag: 'Our Mentors',
    title: 'Industry Veterans, Sharing All They Know'
  },
  partners: {
    sectionTag: 'Partners',
    title: "Building Hong Kong's Wisdom Bridge Together"
  },
  contact: {
    sectionTag: 'Contact Us',
    title: 'Wisdom Begins with One Conversation',
    form: {
      name: 'Name',
      namePlaceholder: 'Enter your name',
      email: 'Email',
      emailPlaceholder: 'Enter your email',
      subject: 'Subject',
      subjectPlaceholder: 'e.g. Looking for a cross-border trade expert',
      message: 'Message',
      messagePlaceholder: 'Tell us your needs and we will match you with the most suitable mentor.',
      submit: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent! We will be in touch shortly.',
      error: 'Failed to send. Please try again later.'
    },
    info: {
      address: 'Address',
      addressValue: '18 Salisbury Road, Tsim Sha Tsui, Kowloon, Hong Kong',
      phone: 'Phone',
      phoneValue: '+852 1234 5678',
      email: 'Email',
      emailValue: 'info@hkfac.com',
      hours: 'Office Hours',
      hoursValue: 'Mon–Fri 9:00 – 18:00'
    },
    social: 'Follow Us'
  },
  footer: {
    about: 'FAC | Facilitating Artisan Collective connects retired industry elite with businesses that need their wisdom.',
    quickLinks: 'Quick Links',
    services: 'Expertise',
    contact: 'Contact',
    copyright: '© 2025 FAC | Facilitating Artisan Collective. All rights reserved.',
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
