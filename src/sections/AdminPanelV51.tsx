/**
 * FAC Platform V5.1 - AdminPanel (重构版)
 * 特性：
 * - 按专业能力分类的合作伙伴管理
 * - 完整的分页功能
 * - V5.1-ALPHA 版本标记
 * - 甲乙双方数据统计
 */

import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  Users, LogOut, BarChart3, Building2, ChevronLeft, ChevronRight,
  Search, Filter, Tag, Star, Briefcase, Search as SearchIcon
} from 'lucide-react';
import { SKILL_CATEGORY_LABELS, type SkillCategory } from '../types/user';

// V5.1-ALPHA 版本标记
const VERSION_TAG = 'V5.1-ALPHA';

// 模拟合作伙伴数据（按能力分类）
const MOCK_PARTNERS = [
  // 法律合规
  { id: '1', name: '李律师', maskedName: '李**', skills: ['遗嘱规划', '公司注册'], category: 'legal' as SkillCategory, rating: 4.9, tasksCompleted: 23 },
  { id: '2', name: '陈顾问', maskedName: '陈**', skills: ['跨境合规', '税务筹划'], category: 'legal' as SkillCategory, rating: 4.8, tasksCompleted: 31 },
  // 金融财务
  { id: '3', name: '王审计', maskedName: '王**', skills: ['ISO 9001 审核', '内部审计'], category: 'finance' as SkillCategory, rating: 4.7, tasksCompleted: 45 },
  { id: '4', name: '张会计', maskedName: '张**', skills: ['税务筹划', '财务报表'], category: 'finance' as SkillCategory, rating: 4.6, tasksCompleted: 52 },
  // 跨境贸易
  { id: '5', name: '赵经理', maskedName: '赵**', skills: ['进出口报关', '关税优化'], category: 'trade' as SkillCategory, rating: 4.9, tasksCompleted: 38 },
  { id: '6', name: '刘专员', maskedName: '刘**', skills: ['跨境物流', '海关合规'], category: 'trade' as SkillCategory, rating: 4.5, tasksCompleted: 27 },
  // 技术工程
  { id: '7', name: '黄工程师', maskedName: '黄**', skills: ['机械维修', '设备保养'], category: 'tech' as SkillCategory, rating: 4.8, tasksCompleted: 41 },
  { id: '8', name: '吴技师', maskedName: '吴**', skills: ['电路设计', '自动化'], category: 'tech' as SkillCategory, rating: 4.7, tasksCompleted: 33 },
  // 语言翻译
  { id: '9', name: '郑翻译', maskedName: '郑**', skills: ['粤语同声传译', '商务英语'], category: 'language' as SkillCategory, rating: 5.0, tasksCompleted: 56 },
  { id: '10', name: '孙老师', maskedName: '孙**', skills: ['商务英语', '日语翻译'], category: 'language' as SkillCategory, rating: 4.8, tasksCompleted: 42 },
  // 管理咨询
  { id: '11', name: '周顾问', maskedName: '周**', skills: ['企业战略', '团队培训'], category: 'management' as SkillCategory, rating: 4.9, tasksCompleted: 29 },
  { id: '12', name: '钱专家', maskedName: '钱**', skills: ['流程优化', '质量管理'], category: 'management' as SkillCategory, rating: 4.6, tasksCompleted: 35 },
];

interface AdminPanelV51Props {
  onLogout: () => void;
}

export default function AdminPanelV51({ onLogout }: AdminPanelV51Props) {
  const { auth, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'partners' | 'partyA' | 'partyB'>('overview');
  
  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [selectedCategory, setSelectedCategory] = useState<SkillCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 筛选合作伙伴
  const filteredPartners = MOCK_PARTNERS.filter(partner => {
    const matchesCategory = selectedCategory === 'all' || partner.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      partner.name.includes(searchQuery) ||
      partner.skills.some(s => s.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredPartners.length / pageSize);
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // 重置页码当筛选条件改变
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery, pageSize]);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // 统计卡片数据
  const stats = [
    { icon: Users, label: '甲方 (需求方)', value: '156', sub: '发布委托', trend: '+12%' },
    { icon: Briefcase, label: '乙方 (提供方)', value: '89', sub: '注册专家', trend: '+8%' },
    { icon: Star, label: '能力标签', value: '234', sub: '原子化技能', trend: '+23%' },
    { icon: Building2, label: '进行中任务', value: '42', sub: '30% 订金托管', trend: '+15%' },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b" style={{ 
        background: 'rgba(10,10,10,0.95)', 
        backdropFilter: 'blur(10px)',
        borderColor: 'rgba(201,169,110,0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">
                F<span style={{ color: '#C9A96E' }}>A</span>C
              </span>
              <span className="text-white/30">|</span>
              <span className="text-white/70">后台管理系统</span>
              {/* V5.1-ALPHA 版本标记 */}
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full"
                style={{
                  background: 'rgba(201,169,110,0.15)',
                  border: '1px solid rgba(201,169,110,0.3)',
                  color: '#C9A96E'
                }}
              >
                {VERSION_TAG}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white/50 text-sm">{auth.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-red-400 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">退出</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'overview' 
                    ? 'text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
                style={activeTab === 'overview' ? { background: 'rgba(201,169,110,0.1)' } : {}}
              >
                <BarChart3 className="w-5 h-5" style={{ color: activeTab === 'overview' ? '#C9A96E' : 'currentColor' }} />
                <span>数据概览</span>
              </button>
              
              <button
                onClick={() => setActiveTab('partyA')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'partyA' 
                    ? 'text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
                style={activeTab === 'partyA' ? { background: 'rgba(33,150,243,0.1)' } : {}}
              >
                <SearchIcon className="w-5 h-5" style={{ color: activeTab === 'partyA' ? '#64B5F6' : 'currentColor' }} />
                <span>甲方管理</span>
              </button>

              <button
                onClick={() => setActiveTab('partyB')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'partyB' 
                    ? 'text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
                style={activeTab === 'partyB' ? { background: 'rgba(76,175,80,0.1)' } : {}}
              >
                <Briefcase className="w-5 h-5" style={{ color: activeTab === 'partyB' ? '#81C784' : 'currentColor' }} />
                <span>乙方管理</span>
              </button>
              
              <button
                onClick={() => setActiveTab('partners')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  activeTab === 'partners' 
                    ? 'text-white' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
                style={activeTab === 'partners' ? { background: 'rgba(201,169,110,0.1)' } : {}}
              >
                <Building2 className="w-5 h-5" style={{ color: activeTab === 'partners' ? '#C9A96E' : 'currentColor' }} />
                <span>合作伙伴 (按能力)</span>
              </button>
            </nav>

            {/* 系统信息 */}
            <div 
              className="mt-8 p-4 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <h4 className="text-xs uppercase tracking-wider mb-3" style={{ color: 'rgba(201,169,110,0.6)' }}>
                系统信息
              </h4>
              <div className="space-y-2 text-xs" style={{ color: 'rgba(237,232,223,0.5)' }}>
                <div className="flex justify-between">
                  <span>版本</span>
                  <span style={{ color: '#C9A96E' }}>{VERSION_TAG}</span>
                </div>
                <div className="flex justify-between">
                  <span>架构</span>
                  <span>Party A/B 模式</span>
                </div>
                <div className="flex justify-between">
                  <span>订金比例</span>
                  <span>30%</span>
                </div>
                <div className="flex justify-between">
                  <span>佣金</span>
                  <span style={{ color: '#4CAF7D' }}>零佣金</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* 数据概览 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">数据概览</h2>
                
                {/* 统计卡片 */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {stats.map((stat, i) => (
                    <StatCard key={i} {...stat} />
                  ))}
                </div>

                {/* V5.1 新特性说明 */}
                <div 
                  className="p-6 rounded-2xl"
                  style={{ 
                    background: 'linear-gradient(145deg, rgba(201,169,110,0.08) 0%, rgba(10,22,40,0.98) 100%)',
                    border: '1px solid rgba(201,169,110,0.2)'
                  }}
                >
                  <h3 className="text-lg font-semibold text-white mb-4">V5.1 战略重启核心特性</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { title: '甲乙双方模式', desc: '废除雇主/专家二元论，采用 Party A/B 身份流动', color: '#C9A96E' },
                      { title: '原子化能力矩阵', desc: '打破行业壁垒，精准匹配原子化技能标签', color: '#64B5F6' },
                      { title: '30% 订金托管', desc: 'Smart Escrow 保障双方权益，非雇佣契约框架', color: '#81C784' },
                      { title: '隐私授权机制', desc: '乙方主动授权后才揭露真实联系信息', color: '#C9A96E' },
                    ].map((item, i) => (
                      <div 
                        key={i} 
                        className="p-4 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <h4 className="text-sm font-medium mb-1" style={{ color: item.color }}>{item.title}</h4>
                        <p className="text-xs" style={{ color: 'rgba(237,232,223,0.5)' }}>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* 合作伙伴管理 - 按能力分类 */}
            {activeTab === 'partners' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">合作伙伴管理</h2>
                    <p className="text-sm mt-1" style={{ color: 'rgba(237,232,223,0.5)' }}>
                      按原子化能力分类 · 共 {filteredPartners.length} 位专家
                    </p>
                  </div>
                </div>

                {/* 筛选工具栏 */}
                <div 
                  className="flex flex-wrap gap-4 p-4 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}
                >
                  {/* 搜索框 */}
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(201,169,110,0.5)' }} />
                    <input
                      type="text"
                      placeholder="搜索姓名或技能..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 rounded-lg text-sm text-white bg-transparent outline-none"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    />
                  </div>

                  {/* 能力分类筛选 */}
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" style={{ color: 'rgba(201,169,110,0.5)' }} />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as SkillCategory | 'all')}
                      className="px-3 py-2 rounded-lg text-sm text-white bg-transparent outline-none cursor-pointer"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <option value="all">全部能力</option>
                      {Object.entries(SKILL_CATEGORY_LABELS).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  {/* 每页数量 */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>每页</span>
                    <select
                      value={pageSize}
                      onChange={(e) => setPageSize(Number(e.target.value))}
                      className="px-3 py-2 rounded-lg text-sm text-white bg-transparent outline-none cursor-pointer"
                      style={{ 
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)'
                      }}
                    >
                      <option value={6}>6</option>
                      <option value={12}>12</option>
                      <option value={24}>24</option>
                    </select>
                  </div>
                </div>

                {/* 合作伙伴列表 */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedPartners.map((partner) => (
                    <div 
                      key={partner.id}
                      className="p-5 rounded-xl transition-all hover:scale-[1.02]"
                      style={{ 
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)'
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: 'rgba(201,169,110,0.1)' }}
                        >
                          <Tag className="w-5 h-5" style={{ color: '#C9A96E' }} />
                        </div>
                        <span 
                          className="text-xs px-2 py-1 rounded-full"
                          style={{ 
                            background: 'rgba(201,169,110,0.1)',
                            color: '#C9A96E'
                          }}
                        >
                          {SKILL_CATEGORY_LABELS[partner.category]}
                        </span>
                      </div>

                      <h3 className="text-white font-medium mb-1">{partner.maskedName}</h3>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {partner.skills.map(skill => (
                          <span 
                            key={skill}
                            className="text-[10px] px-2 py-0.5 rounded"
                            style={{ 
                              background: 'rgba(255,255,255,0.05)',
                              color: 'rgba(237,232,223,0.6)'
                            }}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3" style={{ color: '#C9A96E' }} />
                          <span>{partner.rating}</span>
                        </div>
                        <span>完成 {partner.tasksCompleted} 单</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 空状态 */}
                {paginatedPartners.length === 0 && (
                  <div className="text-center py-12" style={{ color: 'rgba(237,232,223,0.3)' }}>
                    暂无符合条件的合作伙伴
                  </div>
                )}

                {/* 分页控件 */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 pt-4">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg transition-colors disabled:opacity-30"
                      style={{ 
                        background: currentPage === 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        color: 'rgba(237,232,223,0.6)'
                      }}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className="w-10 h-10 rounded-lg text-sm font-medium transition-colors"
                        style={{
                          background: currentPage === page ? 'rgba(201,169,110,0.2)' : 'rgba(255,255,255,0.05)',
                          color: currentPage === page ? '#C9A96E' : 'rgba(237,232,223,0.6)',
                          border: currentPage === page ? '1px solid rgba(201,169,110,0.3)' : '1px solid transparent'
                        }}
                      >
                        {page}
                      </button>
                    ))}

                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg transition-colors disabled:opacity-30"
                      style={{ 
                        background: currentPage === totalPages ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                        color: 'rgba(237,232,223,0.6)'
                      }}
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                )}

                {/* 分页信息 */}
                <div className="text-center text-xs" style={{ color: 'rgba(237,232,223,0.3)' }}>
                  第 {currentPage} / {totalPages} 页，共 {filteredPartners.length} 条记录
                </div>
              </div>
            )}

            {/* 甲方管理 */}
            {activeTab === 'partyA' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">甲方 (Party A) 管理</h2>
                <div 
                  className="p-8 rounded-2xl text-center"
                  style={{ 
                    background: 'rgba(33,150,243,0.05)',
                    border: '1px dashed rgba(33,150,243,0.3)'
                  }}
                >
                  <p style={{ color: 'rgba(237,232,223,0.5)' }}>甲方管理功能开发中...</p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(237,232,223,0.3)' }}>
                    将包含委托发布管理、订金托管审核、验收记录等功能
                  </p>
                </div>
              </div>
            )}

            {/* 乙方管理 */}
            {activeTab === 'partyB' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">乙方 (Party B) 管理</h2>
                <div 
                  className="p-8 rounded-2xl text-center"
                  style={{ 
                    background: 'rgba(76,175,80,0.05)',
                    border: '1px dashed rgba(76,175,80,0.3)'
                  }}
                >
                  <p style={{ color: 'rgba(237,232,223,0.5)' }}>乙方管理功能开发中...</p>
                  <p className="text-sm mt-2" style={{ color: 'rgba(237,232,223,0.3)' }}>
                    将包含能力矩阵审核、隐私授权记录、收益结算等功能
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 统计卡片组件
function StatCard({ 
  icon: Icon, 
  label, 
  value, 
  sub, 
  trend 
}: { 
  icon: React.ElementType; 
  label: string; 
  value: string; 
  sub: string; 
  trend?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ 
        background: 'rgba(255,255,255,0.03)', 
        border: '1px solid rgba(255,255,255,0.08)' 
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(201,169,110,0.1)' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#C9A96E' }} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs" style={{ color: '#4CAF7D' }}>
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm" style={{ color: '#C9A96E' }}>{label}</div>
      <div className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.4)' }}>{sub}</div>
    </div>
  );
}
