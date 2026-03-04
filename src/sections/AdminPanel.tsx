import { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTeamMembers, type TeamMember } from '../hooks/useTeamMembers';
import { useSiteConfig } from '../hooks/useSiteConfig';
import { 
  Users, Settings, FileText, LogOut, Plus, Edit2, Trash2, Save, Upload, 
  ChevronDown, ChevronUp, Globe, Mail, RefreshCw 
} from 'lucide-react';

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

export default function AdminPanel({ onLogout }: AdminPanelProps) {
  const { auth, logout } = useAuth();
  const { members, addMember, updateMember, deleteMember, reorderMembers, resetToDefault: resetTeam } = useTeamMembers();
  const { config, updateConfig, resetToDefault: resetConfig } = useSiteConfig();
  
  const [activeTab, setActiveTab] = useState<'team' | 'content' | 'settings'>('team');
  
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
          </div>
        </div>
      </div>
    </div>
  );
}
