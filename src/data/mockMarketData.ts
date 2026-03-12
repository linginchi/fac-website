/**
 * FAC Platform V5.1 - 模拟市场数据
 * 基于香港 Freelance/Part-time 市场调研
 * 用于公测阶段展示
 */

export interface MockPartyA {
  id: string;
  company: string;
  maskedName: string;
  industry: string;
  requirement: string;
  budget: string;
  urgency: 'high' | 'medium' | 'low';
  timestamp: string;
}

export interface MockPartyB {
  id: string;
  name: string;
  maskedName: string;
  expertise: string[];
  experience: string;
  hourlyRate: string;
  availability: string;
  timestamp: string;
}

// 甲方需求数据（企业发布的需求）
export const MOCK_PARTY_A: MockPartyA[] = [
  {
    id: 'a001',
    company: '跨境贸易公司',
    maskedName: '甲方 **公司',
    industry: '跨境贸易',
    requirement: '寻求 SFC 持牌RO，协助跨境融资合规审查',
    budget: '$800-1,200/小时',
    urgency: 'high',
    timestamp: '10分钟前'
  },
  {
    id: 'a002',
    company: '制造业企业',
    maskedName: '甲方 **实业',
    industry: '制造',
    requirement: 'ISO 9001 质量体系审核专家，年度审核',
    budget: '$15,000-25,000/项目',
    urgency: 'medium',
    timestamp: '25分钟前'
  },
  {
    id: 'a003',
    company: '餐饮连锁',
    maskedName: '甲方 **餐饮',
    industry: '零售餐饮',
    requirement: '寻找资深店长顾问，优化运营流程',
    budget: '$300-500/小时',
    urgency: 'medium',
    timestamp: '1小时前'
  },
  {
    id: 'a004',
    company: '家族办公室',
    maskedName: '甲方 **家族',
    industry: '财富管理',
    requirement: '遗嘱规划与信托架构设计顾问',
    budget: '$2,000-5,000/项目',
    urgency: 'high',
    timestamp: '2小时前'
  },
  {
    id: 'a005',
    company: '科技初创',
    maskedName: '甲方 **科技',
    industry: '科技',
    requirement: '寻找退休工程师，担任技术顾问',
    budget: '$400-800/小时',
    urgency: 'low',
    timestamp: '3小时前'
  },
  {
    id: 'a006',
    company: '物流公司',
    maskedName: '甲方 **物流',
    industry: '物流贸易',
    requirement: '出口管制合规专家，大湾区物流优化',
    budget: '$500-1,000/小时',
    urgency: 'high',
    timestamp: '5小时前'
  },
  {
    id: 'a007',
    company: '教育中心',
    maskedName: '甲方 **教育',
    industry: '教育',
    requirement: '资深导师，商业英语及演讲培训',
    budget: '$200-400/小时',
    urgency: 'medium',
    timestamp: '昨天'
  },
  {
    id: 'a008',
    company: '建筑公司',
    maskedName: '甲方 **建筑',
    industry: '建筑',
    requirement: '退休工务局工程师，项目验收顾问',
    budget: '$600-1,000/小时',
    urgency: 'high',
    timestamp: '昨天'
  },
  {
    id: 'a009',
    company: '医疗机构',
    maskedName: '甲方 **医疗',
    industry: '医疗',
    requirement: '医院管理顾问，优化运营流程',
    budget: '$500-800/小时',
    urgency: 'medium',
    timestamp: '2天前'
  },
  {
    id: 'a010',
    company: '金融机构',
    maskedName: '甲方 **银行',
    industry: '金融',
    requirement: '反洗钱合规顾问，AML政策审查',
    budget: '$1,000-1,500/小时',
    urgency: 'high',
    timestamp: '2天前'
  }
];

// 乙方专家数据（退休专家/自由职业者）
export const MOCK_PARTY_B: MockPartyB[] = [
  {
    id: 'b001',
    name: '李志强',
    maskedName: '乙方 李**',
    expertise: ['SFC合规', '跨境融资', '资产管理'],
    experience: '前美资投行MD，30年经验，持1/4/9号牌',
    hourlyRate: '$800-1,200',
    availability: '即时',
    timestamp: '5分钟前'
  },
  {
    id: 'b002',
    name: '陈美华',
    maskedName: '乙方 陈**',
    expertise: ['ISO审核', '质量管理', '制造业'],
    experience: '前质检局高级工程师，ISO主任审核员',
    hourlyRate: '$400-600',
    availability: '1周内',
    timestamp: '15分钟前'
  },
  {
    id: 'b003',
    name: '王伟明',
    maskedName: '乙方 王**',
    expertise: ['遗嘱规划', '信托设计', '家族治理'],
    experience: '前律所合伙人，专注家族财富传承28年',
    hourlyRate: '$1,000-1,800',
    availability: '预约',
    timestamp: '30分钟前'
  },
  {
    id: 'b004',
    name: '张建国',
    maskedName: '乙方 张**',
    expertise: ['工程监理', '基建验收', '环评'],
    experience: '前工务局高级工程师，28年公共工程经验',
    hourlyRate: '$600-1,000',
    availability: '即时',
    timestamp: '1小时前'
  },
  {
    id: 'b005',
    name: '刘慧敏',
    maskedName: '乙方 刘**',
    expertise: ['跨境物流', '关稅优化', '贸易合规'],
    experience: '前世界500强物流区域总监，精通粤港澳法规',
    hourlyRate: '$500-900',
    availability: '2周内',
    timestamp: '2小时前'
  },
  {
    id: 'b006',
    name: '赵天成',
    maskedName: '乙方 赵**',
    expertise: ['餐饮运营', '门店管理', '团队培训'],
    experience: '前连锁餐饮区域经理，管理过50+门店',
    hourlyRate: '$300-500',
    availability: '即时',
    timestamp: '3小时前'
  },
  {
    id: 'b007',
    name: '郑秀文',
    maskedName: '乙方 郑**',
    expertise: ['商业英语', '演讲培训', '雅思备考'],
    experience: '前国际学校教学主任，30年教学经验',
    hourlyRate: '$250-400',
    availability: '预约',
    timestamp: '昨天'
  },
  {
    id: 'b008',
    name: '黄志明',
    maskedName: '乙方 黄**',
    expertise: ['税务筹划', '审计', '财务报表'],
    experience: '前四大会计师事务所合伙人',
    hourlyRate: '$800-1,500',
    availability: '1周内',
    timestamp: '昨天'
  },
  {
    id: 'b009',
    name: '林小燕',
    maskedName: '乙方 林**',
    expertise: ['医护管理', '医院运营', '康复护理'],
    experience: '前医院护理部主任，35年医护经验',
    hourlyRate: '$400-700',
    availability: '预约',
    timestamp: '2天前'
  },
  {
    id: 'b010',
    name: '梁国栋',
    maskedName: '乙方 梁**',
    expertise: ['机械维修', '设备保养', '自动化'],
    experience: '前工厂总工程师，40年机械经验',
    hourlyRate: '$350-600',
    availability: '即时',
    timestamp: '2天前'
  }
];

// 获取随机甲方需求（走马灯用）
export function getRandomPartyA(count: number = 3): MockPartyA[] {
  const shuffled = [...MOCK_PARTY_A].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 获取随机乙方专家（走马灯用）
export function getRandomPartyB(count: number = 3): MockPartyB[] {
  const shuffled = [...MOCK_PARTY_B].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

// 模拟匹配结果
export function simulateMatch(userInput: string): { partyA: MockPartyA | null; partyB: MockPartyB | null; matchScore: number } {
  const keywords = userInput.toLowerCase();
  
  // 简单关键词匹配
  let bestPartyA = null;
  let bestPartyB = null;
  let maxScore = 0;
  
  // 匹配甲方需求
  MOCK_PARTY_A.forEach(partyA => {
    const score = calculateMatchScore(keywords, partyA.requirement + partyA.industry);
    if (score > maxScore) {
      maxScore = score;
      bestPartyA = partyA;
    }
  });
  
  // 匹配乙方专家
  MOCK_PARTY_B.forEach(partyB => {
    const score = calculateMatchScore(keywords, partyB.expertise.join(' ') + partyB.experience);
    if (score > maxScore) {
      maxScore = score;
      bestPartyB = partyB;
    }
  });
  
  return {
    partyA: bestPartyA,
    partyB: bestPartyB,
    matchScore: maxScore
  };
}

function calculateMatchScore(input: string, target: string): number {
  const inputWords = input.split(/\s+/);
  const targetWords = target.toLowerCase().split(/\s+/);
  let score = 0;
  
  inputWords.forEach(word => {
    if (targetWords.some(tw => tw.includes(word) || word.includes(tw))) {
      score += 1;
    }
  });
  
  return score;
}
