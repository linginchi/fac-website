import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeamMembers, type TeamMember } from '../hooks/useTeamMembers';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { 
  Users, Settings, FileText, LogOut, Plus, Edit2, Trash2, Save, Upload, 
  ChevronDown, ChevronUp, Globe, Mail, RefreshCw, BarChart3,
  TrendingUp, Coins, UserCheck, ArrowUpRight, Gift, CheckCircle, Linkedin, DollarSign, Star, Network, ShieldAlert
} from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const subscriptionGrowthData = [
  { month: '1月', 免費會員: 42, 標準訂閱: 12, 企業版: 3 },
  { month: '2月', 免費會員: 58, 標準訂閱: 18, 企業版: 4 },
  { month: '3月', 免費會員: 71, 標準訂閱: 24, 企業版: 5 },
  { month: '4月', 免費會員: 89, 標準訂閱: 31, 企業版: 7 },
  { month: '5月', 免費會員: 112, 標準訂閱: 40, 企業版: 9 },
  { month: '6月', 免費會員: 134, 標準訂閱: 52, 企業版: 11 },
  { month: '7月', 免費會員: 156, 標準訂閱: 67, 企業版: 14 },
  { month: '8月', 免費會員: 183, 標準訂閱: 81, 企業版: 16 },
];

const tokenFlowData = [
  { week: 'W1', 解碼消耗: 1240, 貢獻獎勵: 680, 淨流通: 560 },
  { week: 'W2', 解碼消耗: 1890, 貢獻獎勵: 920, 淨流通: 970 },
  { week: 'W3', 解碼消耗: 2340, 貢獻獎勵: 1100, 淨流通: 1240 },
  { week: 'W4', 解碼消耗: 1780, 貢獻獎勵: 840, 淨流通: 940 },
  { week: 'W5', 解碼消耗: 2910, 貢獻獎勵: 1350, 淨流通: 1560 },
  { week: 'W6', 解碼消耗: 3420, 貢獻獎勵: 1680, 淨流通: 1740 },
  { week: 'W7', 解碼消耗: 3890, 貢獻獎勵: 1920, 淨流通: 1970 },
  { week: 'W8', 解碼消耗: 4210, 貢獻獎勵: 2100, 淨流通: 2110 },
];

const pillarsActivity = [
  { name: '跨境貿易', 配對次數: 38 },
  { name: '高級零售', 配對次數: 29 },
  { name: '家族財富', 配對次數: 45 },
  { name: '精密製造', 配對次數: 22 },
  { name: '企業融資', 配對次數: 51 },
  { name: '工程基建', 配對次數: 17 },
  { name: '教育傳承', 配對次數: 34 },
  { name: 'RO合規', 配對次數: 41 },
];

const CHART_COLORS = {
  gold: '#C9A96E',
  goldLight: '#e0c28a',
  goldDim: 'rgba(201,169,110,0.35)',
  blue: '#4A90C4',
  green: '#4CAF7D',
  gridLine: 'rgba(255,255,255,0.06)',
  text: 'rgba(237,232,223,0.5)',
};

const tooltipStyle = {
  backgroundColor: 'rgba(10,22,40,0.96)',
  border: '1px solid rgba(201,169,110,0.25)',
  borderRadius: '10px',
  color: '#EDE8DF',
  fontSize: '12px',
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon, label, value, sub, trend
}: {
  icon: React.ElementType; label: string; value: string; sub: string; trend?: string;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)' }}
        >
          <Icon className="w-4 h-4" style={{ color: '#C9A96E' }} />
        </div>
        {trend && (
          <span className="flex items-center gap-0.5 text-xs" style={{ color: '#4CAF7D' }}>
            <ArrowUpRight className="w-3 h-3" />
            {trend}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm font-medium" style={{ color: '#C9A96E' }}>{label}</div>
      <div className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.4)' }}>{sub}</div>
    </div>
  );
}

interface MemberFormData {
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  desc: string;
  descEn: string;
  image: string;
  order: number;
}

const emptyMemberForm: MemberFormData = {
  name: '',
  nameEn: '',
  role: '',
  roleEn: '',
  desc: '',
  descEn: '',
  image: '',
  order: 0
};

interface AdminPanelProps {
  onLogout: () => void;
}

const STORAGE_KEY_PENDING_REWARDS = 'fac_pending_suggestion_rewards';

interface PendingSuggestionReward {
  id: string;
  userEmail: string;
  suggestionText: string;
  suggestedAmount: number;
  submittedAt: string;
}

const defaultPendingRewards: PendingSuggestionReward[] = [
  { id: '1', userEmail: 'user_a@example.com', suggestionText: '建議在匹配邏輯中增加「行業年資」權重', suggestedAmount: 80, submittedAt: '2025-03-01T10:00:00Z' },
  { id: '2', userEmail: 'consultant_b@example.com', suggestionText: '跨境貿易標籤可細化為大灣區/東盟/歐美', suggestedAmount: 120, submittedAt: '2025-03-03T14:30:00Z' },
  { id: '3', userEmail: 'expert_c@example.com', suggestionText: 'RO 合規支柱可增加「合規審計」子標籤', suggestedAmount: 150, submittedAt: '2025-03-04T09:15:00Z' },
];

function loadPendingRewards(): PendingSuggestionReward[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PENDING_REWARDS);
    if (raw) {
      const parsed = JSON.parse(raw) as PendingSuggestionReward[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (_) {}
  return [...defaultPendingRewards];
}

function savePendingRewards(list: PendingSuggestionReward[]) {
  localStorage.setItem(STORAGE_KEY_PENDING_REWARDS, JSON.stringify(list));
}

// ─── 定價管理 (V2.0) ───────────────────────────────────────────────────────
const STORAGE_KEY_PRICING = 'fac_pricing_tiers';
export interface PricingTierRow {
  name: string;
  nameEn?: string;
  priceMonthly: string;
  priceYearly: string;
  /** Executive 專屬：智慧分紅比例 (%) */
  dividendRate?: string;
}
export interface PricingTiers {
  basic: PricingTierRow;
  professional: PricingTierRow;
  executive: PricingTierRow;
}
const defaultPricing: PricingTiers = {
  basic: { name: 'Basic（基礎版）', nameEn: 'Basic', priceMonthly: '0', priceYearly: '0' },
  professional: { name: 'Professional（專業版）', nameEn: 'Professional', priceMonthly: '99', priceYearly: '999' },
  executive: { name: 'Executive（精英版）', nameEn: 'Executive', priceMonthly: '299', priceYearly: '2999', dividendRate: '7' },
};
function loadPricing(): PricingTiers {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICING);
    if (raw) {
      const parsed = JSON.parse(raw) as PricingTiers;
      if (parsed?.basic && parsed?.professional && parsed?.executive) return parsed;
    }
  } catch (_) {}
  return { ...defaultPricing };
}
function savePricing(tiers: PricingTiers) {
  localStorage.setItem(STORAGE_KEY_PRICING, JSON.stringify(tiers));
}

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { auth, logout } = useAuth();
  const { members, addMember, updateMember, deleteMember, reorderMembers, resetToDefault: resetTeam } = useTeamMembers();
  const { config, updateConfig, resetToDefault: resetConfig } = useSiteConfig();
  
  const [activeTab, setActiveTab] = useState<'team' | 'content' | 'settings' | 'stats' | 'tokens' | 'pricing' | 'partner' | 'filtered'>('team');
  const [pendingRewards, setPendingRewards] = useState<PendingSuggestionReward[]>(loadPendingRewards);
  const [pricingTiers, setPricingTiers] = useState<PricingTiers>(loadPricing);
  
  useEffect(() => {
    if (window.location.pathname === '/admin/tokens') setActiveTab('tokens');
    if (window.location.pathname === '/admin/pricing') setActiveTab('pricing');
    if (window.location.pathname === '/admin/partner') setActiveTab('partner');
  }, []);

  const switchToTab = (tab: 'team' | 'content' | 'settings' | 'stats' | 'tokens' | 'pricing' | 'partner' | 'filtered') => {
    setActiveTab(tab);
    if (tab === 'tokens') window.history.replaceState({}, '', '/admin/tokens');
    if (tab === 'pricing') window.history.replaceState({}, '', '/admin/pricing');
    if (tab === 'partner') window.history.replaceState({}, '', '/admin/partner');
  };

  const STORAGE_AI_FILTERED = 'fac_ai_filtered';
  const [filteredList, setFilteredList] = useState<Array<{ text: string; at: string }>>([]);
  const loadFilteredList = () => {
    try {
      const raw = localStorage.getItem(STORAGE_AI_FILTERED);
      setFilteredList(raw ? JSON.parse(raw) : []);
    } catch {
      setFilteredList([]);
    }
  };
  useEffect(() => { if (activeTab === 'filtered') loadFilteredList(); }, [activeTab]);
  const clearFilteredList = () => {
    if (!confirm('確定清空「AI 已過濾」紀錄？此操作僅影響本機，供管理員抽查優化過濾精準度。')) return;
    localStorage.removeItem(STORAGE_AI_FILTERED);
    setFilteredList([]);
  };

  const handleDisburseReward = (id: string) => {
    const next = pendingRewards.filter((r) => r.id !== id);
    setPendingRewards(next);
    savePendingRewards(next);
  };

  const handleDisburseAll = () => {
    if (!confirm('確定一鍵審核並發放全部待審建議獎勵？')) return;
    setPendingRewards([]);
    savePendingRewards([]);
  };
  
  // Team management state
  const [isEditingMember, setIsEditingMember] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [memberForm, setMemberForm] = useState<MemberFormData>(emptyMemberForm);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Content editing state - can be used for future section-specific editing
  // const [editingSection, setEditingSection] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    onLogout();
  };

  // Team Management Functions
  const handleMemberInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setMemberForm(prev => ({ ...prev, [name]: value }));
  };

  const handleMemberImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setMemberForm(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMemberId) {
      updateMember(editingMemberId, memberForm);
    } else {
      addMember({
        ...memberForm,
        order: members.length + 1
      });
    }
    
    resetMemberForm();
  };

  const resetMemberForm = () => {
    setMemberForm(emptyMemberForm);
    setPreviewImage('');
    setIsEditingMember(false);
    setEditingMemberId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEditMember = (member: TeamMember) => {
    setMemberForm({
      name: member.name,
      nameEn: member.nameEn,
      role: member.role,
      roleEn: member.roleEn,
      desc: member.desc,
      descEn: member.descEn,
      image: member.image,
      order: member.order
    });
    setPreviewImage(member.image);
    setEditingMemberId(member.id);
    setIsEditingMember(true);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm('确定要删除这位团队成员吗？')) {
      deleteMember(id);
    }
  };

  const handleMoveMember = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === members.length - 1) return;
    
    const newOrder = [...members.map(m => m.id)];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];
    reorderMembers(newOrder);
  };

  // Content Update Functions
  const handleContentUpdate = (section: keyof typeof config, field: string, value: string) => {
    updateConfig(section, { [field]: value });
  };

  const handleFeatureUpdate = (index: number, value: string, lang: 'zh' | 'en') => {
    const field = lang === 'zh' ? 'features' : 'featuresEn';
    const newFeatures = [...config.about[field]];
    newFeatures[index] = value;
    updateConfig('about', { [field]: newFeatures });
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-white">
                F<span className="text-[#FFD700]">A</span>C
              </span>
              <span className="text-white/30">|</span>
              <span className="text-white/70">后台管理系统</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-white/50 text-sm">{auth.email}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-red-400 transition-colors duration-300"
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
                onClick={() => setActiveTab('team')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'team' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Users className="w-5 h-5" />
                <span>团队管理</span>
              </button>
              
              <button
                onClick={() => setActiveTab('content')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'content' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span>内容管理</span>
              </button>
              
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>网站设置</span>
              </button>

              <button
                onClick={() => setActiveTab('stats')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'stats' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
                <span>數據儀表板</span>
              </button>

              <button
                onClick={() => switchToTab('tokens')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'tokens' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Gift className="w-5 h-5" />
                <span>獎勵撥發</span>
              </button>

              <button
                onClick={() => switchToTab('pricing')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'pricing' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <DollarSign className="w-5 h-5" />
                <span>定價管理</span>
              </button>

              <button
                onClick={() => switchToTab('partner')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'partner' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Star className="w-5 h-5" />
                <span>合夥人看板</span>
              </button>

              <button
                onClick={() => switchToTab('filtered')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  activeTab === 'filtered' 
                    ? 'bg-[#FFD700]/10 text-[#FFD700]' 
                    : 'text-white/60 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ShieldAlert className="w-5 h-5" />
                <span>AI 已過濾</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Team Management Tab */}
            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">团队管理</h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => resetTeam()}
                      className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-[#FFD700] transition-colors duration-300"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span className="text-sm">恢复默认</span>
                    </button>
                    <button
                      onClick={() => setIsEditingMember(true)}
                      className="btn-gold flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      添加成员
                    </button>
                  </div>
                </div>

                {/* Member Form */}
                {isEditingMember && (
                  <div className="bg-white/5 rounded-2xl p-6">
                    <h3 className="text-lg font-medium text-white mb-4">
                      {editingMemberId ? '编辑成员' : '添加新成员'}
                    </h3>
                    
                    <form onSubmit={handleMemberSubmit} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">中文姓名 *</label>
                          <input
                            type="text"
                            name="name"
                            value={memberForm.name}
                            onChange={handleMemberInputChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                            placeholder="例如：林憬怡"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">英文姓名 *</label>
                          <input
                            type="text"
                            name="nameEn"
                            value={memberForm.nameEn}
                            onChange={handleMemberInputChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                            placeholder="例如：Mark Lin"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">中文职位 *</label>
                          <input
                            type="text"
                            name="role"
                            value={memberForm.role}
                            onChange={handleMemberInputChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                            placeholder="例如：创始合伙人"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">英文职位 *</label>
                          <input
                            type="text"
                            name="roleEn"
                            value={memberForm.roleEn}
                            onChange={handleMemberInputChange}
                            required
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                            placeholder="例如：Founding Partner"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">中文简介</label>
                          <textarea
                            name="desc"
                            value={memberForm.desc}
                            onChange={handleMemberInputChange}
                            rows={2}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none resize-none"
                            placeholder="例如：20年科技产业投资经验"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">英文简介</label>
                          <textarea
                            name="descEn"
                            value={memberForm.descEn}
                            onChange={handleMemberInputChange}
                            rows={2}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none resize-none"
                            placeholder="例如：20 years of tech investment experience"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm text-white/60 mb-1">照片</label>
                        <div className="flex gap-4 items-center">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 border-dashed rounded-lg text-white/60 hover:text-white transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            上传照片
                          </button>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleMemberImageUpload}
                            className="hidden"
                          />
                          {previewImage && (
                            <img src={previewImage} alt="Preview" className="w-12 h-12 rounded object-cover" />
                          )}
                          <input
                            type="text"
                            name="image"
                            value={memberForm.image}
                            onChange={handleMemberInputChange}
                            placeholder="或输入图片路径"
                            className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button type="submit" className="btn-gold flex items-center gap-2">
                          <Save className="w-4 h-4" />
                          {editingMemberId ? '保存修改' : '添加成员'}
                        </button>
                        <button type="button" onClick={resetMemberForm} className="btn-outline">
                          取消
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Members List */}
                <div className="bg-white/5 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-white/10">
                    {members.map((member, index) => (
                      <div key={member.id} className="flex items-center gap-4 px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleMoveMember(index, 'up')}
                            disabled={index === 0}
                            className="text-white/30 hover:text-[#FFD700] disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <span className="text-center text-white/50 text-xs">{member.order}</span>
                          <button
                            onClick={() => handleMoveMember(index, 'down')}
                            disabled={index === members.length - 1}
                            className="text-white/30 hover:text-[#FFD700] disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>

                        <img src={member.image} alt={member.name} className="w-12 h-12 rounded-lg object-cover" />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{member.name}</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/60 text-sm">{member.nameEn}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#FFD700] text-sm">{member.role}</span>
                            <span className="text-white/30">/</span>
                            <span className="text-white/50 text-sm">{member.roleEn}</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditMember(member)}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FFD700]/20"
                          >
                            <Edit2 className="w-4 h-4 text-white/60" />
                          </button>
                          <button
                            onClick={() => handleDeleteMember(member.id)}
                            className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/20"
                          >
                            <Trash2 className="w-4 h-4 text-white/60" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content Management Tab */}
            {activeTab === 'content' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">内容管理</h2>
                </div>

                {/* Hero Section */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-[#FFD700]" />
                    首页 Hero 区域
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标语（中文）</label>
                        <input
                          type="text"
                          value={config.hero.tagline}
                          onChange={(e) => handleContentUpdate('hero', 'tagline', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标语（英文）</label>
                        <input
                          type="text"
                          value={config.hero.taglineEn}
                          onChange={(e) => handleContentUpdate('hero', 'taglineEn', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标题第一行（中文）</label>
                        <input
                          type="text"
                          value={config.hero.title1}
                          onChange={(e) => handleContentUpdate('hero', 'title1', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标题第一行（英文）</label>
                        <input
                          type="text"
                          value={config.hero.title1En}
                          onChange={(e) => handleContentUpdate('hero', 'title1En', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标题第二行（中文）</label>
                        <input
                          type="text"
                          value={config.hero.title2}
                          onChange={(e) => handleContentUpdate('hero', 'title2', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标题第二行（英文）</label>
                        <input
                          type="text"
                          value={config.hero.title2En}
                          onChange={(e) => handleContentUpdate('hero', 'title2En', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">副标题（中文）</label>
                        <textarea
                          value={config.hero.subtitle}
                          onChange={(e) => handleContentUpdate('hero', 'subtitle', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">副标题（英文）</label>
                        <textarea
                          value={config.hero.subtitleEn}
                          onChange={(e) => handleContentUpdate('hero', 'subtitleEn', e.target.value)}
                          rows={3}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* About Section */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#FFD700]" />
                    关于我们
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标题（中文）</label>
                        <input
                          type="text"
                          value={config.about.title}
                          onChange={(e) => handleContentUpdate('about', 'title', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">标题（英文）</label>
                        <input
                          type="text"
                          value={config.about.titleEn}
                          onChange={(e) => handleContentUpdate('about', 'titleEn', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">描述（中文）</label>
                        <textarea
                          value={config.about.description}
                          onChange={(e) => handleContentUpdate('about', 'description', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">描述（英文）</label>
                        <textarea
                          value={config.about.descriptionEn}
                          onChange={(e) => handleContentUpdate('about', 'descriptionEn', e.target.value)}
                          rows={4}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none resize-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">特点 1（中文）</label>
                        <input
                          type="text"
                          value={config.about.features[0]}
                          onChange={(e) => handleFeatureUpdate(0, e.target.value, 'zh')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">特点 1（英文）</label>
                        <input
                          type="text"
                          value={config.about.featuresEn[0]}
                          onChange={(e) => handleFeatureUpdate(0, e.target.value, 'en')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">特点 2（中文）</label>
                        <input
                          type="text"
                          value={config.about.features[1]}
                          onChange={(e) => handleFeatureUpdate(1, e.target.value, 'zh')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">特点 2（英文）</label>
                        <input
                          type="text"
                          value={config.about.featuresEn[1]}
                          onChange={(e) => handleFeatureUpdate(1, e.target.value, 'en')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">特点 3（中文）</label>
                        <input
                          type="text"
                          value={config.about.features[2]}
                          onChange={(e) => handleFeatureUpdate(2, e.target.value, 'zh')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">特点 3（英文）</label>
                        <input
                          type="text"
                          value={config.about.featuresEn[2]}
                          onChange={(e) => handleFeatureUpdate(2, e.target.value, 'en')}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Section */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-[#FFD700]" />
                    数据统计
                  </h3>
                  
                  <div className="space-y-4">
                    {Object.entries(config.stats).map(([key, stat]) => (
                      <div key={key} className="grid md:grid-cols-4 gap-4 items-end">
                        <div>
                          <label className="block text-sm text-white/60 mb-1">数字</label>
                          <input
                            type="text"
                            value={stat.number}
                            onChange={(e) => {
                              const newStats = { ...config.stats };
                              newStats[key as keyof typeof config.stats] = { ...stat, number: e.target.value };
                              updateConfig('stats', newStats);
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">标签（中文）</label>
                          <input
                            type="text"
                            value={stat.label}
                            onChange={(e) => {
                              const newStats = { ...config.stats };
                              newStats[key as keyof typeof config.stats] = { ...stat, label: e.target.value };
                              updateConfig('stats', newStats);
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">标签（英文）</label>
                          <input
                            type="text"
                            value={stat.labelEn}
                            onChange={(e) => {
                              const newStats = { ...config.stats };
                              newStats[key as keyof typeof config.stats] = { ...stat, labelEn: e.target.value };
                              updateConfig('stats', newStats);
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm text-white/60 mb-1">描述（中文）</label>
                          <input
                            type="text"
                            value={stat.desc}
                            onChange={(e) => {
                              const newStats = { ...config.stats };
                              newStats[key as keyof typeof config.stats] = { ...stat, desc: e.target.value };
                              updateConfig('stats', newStats);
                            }}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Section */}
                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-[#FFD700]" />
                    联系信息
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">地址（中文）</label>
                        <input
                          type="text"
                          value={config.contact.address}
                          onChange={(e) => handleContentUpdate('contact', 'address', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">地址（英文）</label>
                        <input
                          type="text"
                          value={config.contact.addressEn}
                          onChange={(e) => handleContentUpdate('contact', 'addressEn', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-1">电话</label>
                        <input
                          type="text"
                          value={config.contact.phone}
                          onChange={(e) => handleContentUpdate('contact', 'phone', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">邮箱</label>
                        <input
                          type="text"
                          value={config.contact.email}
                          onChange={(e) => handleContentUpdate('contact', 'email', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-1">工作时间（中文）</label>
                        <input
                          type="text"
                          value={config.contact.hours}
                          onChange={(e) => handleContentUpdate('contact', 'hours', e.target.value)}
                          className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#FFD700] outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">网站设置</h2>

                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">数据管理</h3>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                      <p className="text-yellow-400 text-sm">
                        警告：恢复默认将清除所有自定义内容，包括团队成员和网站设置。
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <button
                        onClick={() => {
                          if (confirm('确定要恢复团队默认设置吗？')) {
                            resetTeam();
                          }
                        }}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        恢复团队默认
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要恢复网站内容默认设置吗？')) {
                            resetConfig();
                          }
                        }}
                        className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                      >
                        恢复内容默认
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">登录信息</h3>
                  
                  <div className="space-y-2">
                    <p className="text-white/60 text-sm">允许登录的邮箱：</p>
                    <ul className="space-y-1">
                      <li className="text-white text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FFD700]" />
                        mark@hkfac.com
                      </li>
                      <li className="text-white text-sm flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#FFD700]" />
                        markgclin@gmail.com
                      </li>
                    </ul>
                    <p className="text-white/40 text-xs mt-4">
                      如需添加或修改登录邮箱，请联系技术支持。
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-2xl p-6">
                  <h3 className="text-lg font-medium text-white mb-4">当前登录</h3>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white">{auth.email}</p>
                      <p className="text-white/50 text-sm">已登录</p>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                    >
                      退出登录
                    </button>
                  </div>
                </div>
              </div>
            )}
            {/* Stats / Dashboard Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">數據儀表板</h2>
                  <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(201,169,110,0.1)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.2)' }}>
                    模擬數據 · Demo
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  <StatCard icon={UserCheck} label="總訂閱用戶" value="716" sub="較上月 +83" trend="+13%" />
                  <StatCard icon={Linkedin} label="LinkedIn 註冊佔比" value="68%" sub="佔總註冊用戶" trend="+5%" />
                  <StatCard icon={TrendingUp} label="企業版客戶" value="16" sub="本月新增 2 家" trend="+14%" />
                  <StatCard icon={Coins} label="$FAC 流通量" value="24,860" sub="本週淨增 2,110" trend="+9%" />
                  <StatCard icon={BarChart3} label="本月配對次數" value="277" sub="8大支柱累計" trend="+22%" />
                </div>

                {/* Subscription Growth Chart */}
                <div
                  className="rounded-2xl p-6"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-white">用戶訂閱統計</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(237,232,223,0.45)' }}>
                        各訂閱層級月度增長趨勢（2025年）
                      </p>
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={subscriptionGrowthData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="freeGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.gold} stopOpacity={0.18} />
                          <stop offset="95%" stopColor={CHART_COLORS.gold} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="stdGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.blue} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={CHART_COLORS.blue} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="entGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.green} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={CHART_COLORS.green} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
                      <XAxis dataKey="month" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(201,169,110,0.15)' }} />
                      <Legend
                        wrapperStyle={{ color: 'rgba(237,232,223,0.6)', fontSize: '11px', paddingTop: '12px' }}
                      />
                      <Area type="monotone" dataKey="免費會員" stroke={CHART_COLORS.gold} strokeWidth={2} fill="url(#freeGrad)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.gold }} />
                      <Area type="monotone" dataKey="標準訂閱" stroke={CHART_COLORS.blue} strokeWidth={2} fill="url(#stdGrad)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.blue }} />
                      <Area type="monotone" dataKey="企業版" stroke={CHART_COLORS.green} strokeWidth={2} fill="url(#entGrad)" dot={false} activeDot={{ r: 4, fill: CHART_COLORS.green }} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Token Flow + Pillars side by side */}
                <div className="grid lg:grid-cols-5 gap-6">

                  {/* $FAC Token Flow — span 3 */}
                  <div
                    className="lg:col-span-3 rounded-2xl p-6"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}
                  >
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-white">$FAC Token 流轉監測</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(237,232,223,0.45)' }}>
                        周度解碼消耗 vs 貢獻獎勵（近 8 週）
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={tokenFlowData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} />
                        <XAxis dataKey="week" tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: CHART_COLORS.text, fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: 'rgba(201,169,110,0.15)' }} />
                        <Legend wrapperStyle={{ color: 'rgba(237,232,223,0.6)', fontSize: '11px', paddingTop: '12px' }} />
                        <Line type="monotone" dataKey="解碼消耗" stroke={CHART_COLORS.gold} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                        <Line type="monotone" dataKey="貢獻獎勵" stroke={CHART_COLORS.blue} strokeWidth={2} dot={false} activeDot={{ r: 4 }} strokeDasharray="5 3" />
                        <Line type="monotone" dataKey="淨流通" stroke={CHART_COLORS.green} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Pillar Activity — span 2 */}
                  <div
                    className="lg:col-span-2 rounded-2xl p-6"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}
                  >
                    <div className="mb-6">
                      <h3 className="text-base font-semibold text-white">八大支柱配對活躍度</h3>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(237,232,223,0.45)' }}>
                        本月累計配對次數
                      </p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart
                        data={pillarsActivity}
                        layout="vertical"
                        margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
                        barSize={8}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} horizontal={false} />
                        <XAxis type="number" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fill: CHART_COLORS.text, fontSize: 10 }} axisLine={false} tickLine={false} width={58} />
                        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(201,169,110,0.04)' }} />
                        <Bar dataKey="配對次數" fill={CHART_COLORS.gold} radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Token 獎勵與解碼規則（完整版） */}
                <div
                  className="rounded-2xl p-5"
                  style={{ background: 'rgba(201,169,110,0.04)', border: '1px solid rgba(201,169,110,0.15)' }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <Coins className="w-4 h-4" style={{ color: '#C9A96E' }} />
                    <span className="text-sm font-semibold" style={{ color: '#C9A96E' }}>$FAC 獎勵與解碼規則</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6 text-xs" style={{ color: 'rgba(237,232,223,0.65)' }}>
                    <div>
                      <div className="font-semibold text-white mb-2">基礎建設獎</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>LinkedIn 註冊：80 $FAC；LinkedIn 數據同步：50 $FAC</li>
                        <li>每增加一個專業標籤：20 $FAC；上傳實戰案例：100 $FAC</li>
                        <li>白銀/黃金/鑽石訂閱月返：50 / 150 / 500 $FAC</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-2">貢獻價值獎</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>有效建議（經後台採納）：50－200 $FAC</li>
                        <li>市場情報反饋：30 $FAC</li>
                        <li>結案獎勵：專家 5%、需求方 2% $FAC</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-2">消耗與解碼</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>基礎行情解碼：10 $FAC/次</li>
                        <li>深度資訊解碼：50 $FAC/次</li>
                        <li>開啟私密對話：100 $FAC/次</li>
                        <li>優先處理權：20 $FAC/日</li>
                      </ul>
                    </div>
                    <div>
                      <div className="font-semibold text-white mb-2">防禦機制</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>鎖定期：註冊獎勵須活躍 30 天或完成一次解碼後激活</li>
                        <li>品質門檻：完善資料獎勵須通過 Agent 邏輯檢查</li>
                        <li>回購與銷毀：每月 20% 訂閱收入回購 $FAC 並銷毀</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 獎勵撥發 Tab — /admin/tokens */}
            {activeTab === 'tokens' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">獎勵撥發 · 建議獎勵審核</h2>
                  {pendingRewards.length > 0 && (
                    <button
                      onClick={handleDisburseAll}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                      style={{ background: 'rgba(201,169,110,0.2)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.4)' }}
                    >
                      <CheckCircle className="w-4 h-4" />
                      一鍵審核並發放全部
                    </button>
                  )}
                </div>
                <p className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>
                  審核用戶提交的有效建議，通過後一鍵發放對應 $FAC 獎勵（50－200，依貢獻度）。
                </p>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(255,255,255,0.03)' }}>
                  {pendingRewards.length === 0 ? (
                    <div className="p-12 text-center" style={{ color: 'rgba(237,232,223,0.4)' }}>
                      <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>目前沒有待審核的建議獎勵。</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-white/10">
                      {pendingRewards.map((r) => (
                        <li key={r.id} className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs mb-1" style={{ color: 'rgba(201,169,110,0.7)' }}>{r.userEmail}</div>
                            <p className="text-sm text-white/90">{r.suggestionText}</p>
                            <div className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.45)' }}>
                              {new Date(r.submittedAt).toLocaleString('zh-HK', { dateStyle: 'short', timeStyle: 'short' })}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="font-semibold" style={{ color: '#C9A96E' }}>{r.suggestedAmount} $FAC</span>
                            <button
                              onClick={() => handleDisburseReward(r.id)}
                              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
                            >
                              <CheckCircle className="w-4 h-4" />
                              審核並發放
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* 定價管理 Tab — /admin/pricing (V2.0) */}
            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">定價管理 · Basic / Professional / Executive</h2>
                  <button
                    onClick={() => { setPricingTiers(loadPricing()); }}
                    className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-[#FFD700] transition-colors text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    重新載入
                  </button>
                </div>
                <p className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>
                  設置三級會員名稱與價格（月費/年費）。修改後即時寫入本地，前台個人頁與保險箱邏輯會讀取此配置。
                </p>
                <div className="grid gap-6 md:grid-cols-3">
                  {(['basic', 'professional', 'executive'] as const).map((key) => (
                    <div
                      key={key}
                      className="rounded-2xl p-6 border"
                      style={{ borderColor: 'rgba(201,169,110,0.25)', background: 'rgba(255,255,255,0.03)' }}
                    >
                      <div className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: '#C9A96E' }}>
                        {key === 'basic' ? 'Basic' : key === 'professional' ? 'Professional' : 'Executive'}
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'rgba(237,232,223,0.5)' }}>顯示名稱</label>
                          <input
                            type="text"
                            value={pricingTiers[key].name}
                            onChange={(e) => setPricingTiers((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], name: e.target.value }
                            }))}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            placeholder="e.g. Basic（基礎版）"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'rgba(237,232,223,0.5)' }}>月費（法幣/穩定幣）</label>
                          <input
                            type="text"
                            value={pricingTiers[key].priceMonthly}
                            onChange={(e) => setPricingTiers((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], priceMonthly: e.target.value }
                            }))}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            placeholder="0 或 99"
                          />
                        </div>
                        <div>
                          <label className="block text-xs mb-1" style={{ color: 'rgba(237,232,223,0.5)' }}>年費</label>
                          <input
                            type="text"
                            value={pricingTiers[key].priceYearly}
                            onChange={(e) => setPricingTiers((prev) => ({
                              ...prev,
                              [key]: { ...prev[key], priceYearly: e.target.value }
                            }))}
                            className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm"
                            placeholder="0 或 999"
                          />
                        </div>
                        {key === 'executive' && (
                          <div>
                            <label className="block text-xs mb-1" style={{ color: 'rgba(201,169,110,0.75)' }}>
                              合夥人智慧分紅比例 (%)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                max="30"
                                value={pricingTiers.executive.dividendRate ?? '7'}
                                onChange={(e) => setPricingTiers((prev) => ({
                                  ...prev,
                                  executive: { ...prev.executive, dividendRate: e.target.value }
                                }))}
                                className="w-full px-3 py-2 rounded-lg bg-white/5 border text-sm text-white pr-8"
                                style={{ borderColor: 'rgba(201,169,110,0.4)' }}
                                placeholder="7"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs pointer-events-none" style={{ color: 'rgba(201,169,110,0.65)' }}>%</span>
                            </div>
                            <p className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.35)' }}>
                              每筆成功撮合手續費中撥給 Executive 合夥人的分紅比例（建議 5%–10%）
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => savePricing(pricingTiers)}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium"
                          style={{ background: 'linear-gradient(135deg, #C9A96E 0%, #a8883a 100%)', color: '#0A1628' }}
                        >
                          <Save className="w-4 h-4" />
                          儲存定價
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>
                  進入方式：登入後台 → 左側「定價管理」或直接訪問 <strong>/admin/pricing</strong>
                </p>
              </div>
            )}

            {/* 合夥人看板 Tab — /admin/partner (V2.1) */}
            {activeTab === 'partner' && (() => {
              const mockPartners = [
                { code: 'FAC-A7K2P9', name: '合夥人 A（脫敏）', referred: 5, dividendHKD: 3200, status: '活躍', votesCount: 2 },
                { code: 'FAC-B3R8XL', name: '合夥人 B（脫敏）', referred: 3, dividendHKD: 1800, status: '活躍', votesCount: 1 },
                { code: 'FAC-C9M4TQ', name: '合夥人 C（脫敏）', referred: 8, dividendHKD: 5600, status: '活躍', votesCount: 2 },
                { code: 'FAC-D1W6NE', name: '合夥人 D（脫敏）', referred: 1, dividendHKD: 480, status: '待激活', votesCount: 0 },
              ];
              const totalDividend = mockPartners.reduce((s, p) => s + p.dividendHKD, 0);
              const totalReferred = mockPartners.reduce((s, p) => s + p.referred, 0);
              return (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">合夥人看板 · Partner Tier V2.1</h2>
                    <span className="text-xs px-3 py-1.5 rounded-lg" style={{ background: 'rgba(201,169,110,0.12)', color: '#C9A96E', border: '1px solid rgba(201,169,110,0.3)' }}>
                      {mockPartners.length} 位合夥人
                    </span>
                  </div>

                  {/* KPI 卡片 */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { icon: Star, label: '活躍合夥人', value: String(mockPartners.filter(p => p.status === '活躍').length), sub: '/' + mockPartners.length + ' 總數', trend: '+1本月' },
                      { icon: Network, label: '信任網絡成員', value: String(totalReferred), sub: '已引薦入駐', trend: '+3本月' },
                      { icon: TrendingUp, label: '累積分紅撥發', value: `HKD ${totalDividend.toLocaleString()}`, sub: '本月撥發', trend: '+HKD 2,400' },
                      { icon: Coins, label: '$FAC 分紅等值', value: `${Math.round(totalDividend * 0.65)}`, sub: '$FAC', trend: undefined },
                    ].map(({ icon: Icon, label, value, sub, trend }) => (
                      <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,169,110,0.12)' }}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.1)', border: '1px solid rgba(201,169,110,0.2)' }}>
                            <Icon className="w-4 h-4" style={{ color: '#C9A96E' }} />
                          </div>
                          {trend && <span className="text-xs flex items-center gap-0.5" style={{ color: '#4CAF7D' }}><ArrowUpRight className="w-3 h-3" />{trend}</span>}
                        </div>
                        <div className="text-2xl font-bold text-white mb-1">{value}</div>
                        <div className="text-sm font-medium" style={{ color: '#C9A96E' }}>{label}</div>
                        <div className="text-xs mt-1" style={{ color: 'rgba(237,232,223,0.4)' }}>{sub}</div>
                      </div>
                    ))}
                  </div>

                  {/* 合夥人列表 */}
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="px-5 py-3 border-b grid grid-cols-12 text-xs font-medium" style={{ borderColor: 'rgba(201,169,110,0.12)', color: 'rgba(237,232,223,0.4)' }}>
                      <span className="col-span-3">邀請碼</span>
                      <span className="col-span-2 text-center">引薦人數</span>
                      <span className="col-span-3 text-right">累積分紅</span>
                      <span className="col-span-2 text-center">投票次數</span>
                      <span className="col-span-2 text-right">狀態</span>
                    </div>
                    {mockPartners.map((p) => (
                      <div key={p.code} className="px-5 py-4 border-b grid grid-cols-12 items-center" style={{ borderColor: 'rgba(201,169,110,0.08)' }}>
                        <div className="col-span-3">
                          <div className="font-mono text-xs font-bold" style={{ color: 'var(--champagne)' }}>{p.code}</div>
                          <div className="text-xs" style={{ color: 'rgba(237,232,223,0.45)' }}>{p.name}</div>
                        </div>
                        <div className="col-span-2 text-center text-sm text-white">{p.referred}</div>
                        <div className="col-span-3 text-right">
                          <div className="text-sm font-semibold" style={{ color: '#4CAF7D' }}>HKD {p.dividendHKD.toLocaleString()}</div>
                        </div>
                        <div className="col-span-2 text-center text-sm" style={{ color: 'rgba(237,232,223,0.65)' }}>{p.votesCount}</div>
                        <div className="col-span-2 text-right">
                          <span className="text-xs px-2 py-1 rounded-md" style={{
                            background: p.status === '活躍' ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.07)',
                            color: p.status === '活躍' ? '#81C784' : 'rgba(237,232,223,0.55)',
                            border: `1px solid ${p.status === '活躍' ? 'rgba(76,175,80,0.35)' : 'rgba(255,255,255,0.12)'}`
                          }}>
                            {p.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 治理提案管理 */}
                  <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(255,255,255,0.02)' }}>
                    <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(201,169,110,0.12)' }}>
                      <span className="text-sm font-semibold text-white">治理提案 · 董事會決議</span>
                      <span className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>3 個進行中</span>
                    </div>
                    {[
                      { title: '開啟第九智慧支柱：新能源與 ESG', forPct: 76, against: 24, voters: 102 },
                      { title: '調整全平台最低基礎解碼費', forPct: 47, against: 53, voters: 116 },
                      { title: '是否新增「生命科學與醫療合規」支柱？', forPct: 67, against: 33, voters: 67 },
                    ].map((q) => (
                      <div key={q.title} className="px-5 py-4 border-b" style={{ borderColor: 'rgba(201,169,110,0.08)' }}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm" style={{ color: 'rgba(237,232,223,0.85)' }}>{q.title}</span>
                          <span className="text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>{q.voters} 票</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width: `${q.forPct}%`, background: 'linear-gradient(90deg, #C9A96E, #a8883a)' }} />
                          </div>
                          <span className="text-xs tabular-nums" style={{ color: 'var(--champagne)' }}>{q.forPct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="text-xs" style={{ color: 'rgba(237,232,223,0.35)' }}>
                    以上為模擬數據。實際接入後，數據由鏈上 / API 實時同步。路徑：<strong>/admin/partner</strong>
                  </p>
                </div>
              );
            })()}

            {/* AI 已過濾 — 管理員抽查，不顯示給用戶 */}
            {activeTab === 'filtered' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-white">AI 已過濾</h2>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={loadFilteredList}
                      className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-[#FFD700] transition-colors duration-300 text-sm"
                    >
                      <RefreshCw className="w-4 h-4" />
                      重新載入
                    </button>
                    <button
                      type="button"
                      onClick={clearFilteredList}
                      className="px-4 py-2 text-sm rounded-lg transition-colors"
                      style={{ border: '1px solid rgba(239,68,68,0.4)', color: 'rgba(239,68,68,0.9)' }}
                    >
                      清空紀錄
                    </button>
                  </div>
                </div>
                <p className="text-sm" style={{ color: 'rgba(237,232,223,0.5)' }}>
                  以下為被智慧過濾協議拒絕的查詢（本機儲存），供管理員定期抽查以優化過濾精準度。不對用戶顯示。
                </p>
                <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(201,169,110,0.18)', background: 'rgba(255,255,255,0.02)' }}>
                  <div className="px-5 py-3 border-b grid grid-cols-12 text-xs font-medium" style={{ borderColor: 'rgba(201,169,110,0.12)', color: 'rgba(237,232,223,0.4)' }}>
                    <span className="col-span-1">#</span>
                    <span className="col-span-7">查詢內容</span>
                    <span className="col-span-4 text-right">時間</span>
                  </div>
                  {filteredList.length === 0 ? (
                    <div className="px-5 py-12 text-center" style={{ color: 'rgba(237,232,223,0.4)' }}>
                      尚無被過濾紀錄
                    </div>
                  ) : (
                    filteredList.map((item, i) => (
                      <div key={`${item.at}-${i}`} className="px-5 py-4 border-b grid grid-cols-12 items-start gap-2" style={{ borderColor: 'rgba(201,169,110,0.08)' }}>
                        <span className="col-span-1 text-xs" style={{ color: 'rgba(237,232,223,0.4)' }}>{i + 1}</span>
                        <span className="col-span-7 text-sm break-words" style={{ color: 'rgba(237,232,223,0.85)' }}>{item.text || '—'}</span>
                        <span className="col-span-4 text-right text-xs" style={{ color: 'rgba(237,232,223,0.45)' }}>
                          {new Date(item.at).toLocaleString('zh-HK')}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
