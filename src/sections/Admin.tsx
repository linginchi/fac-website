import { useState, useRef } from 'react';
import { useTeamMembers, type TeamMember } from '../hooks/useTeamMembers';
import { Plus, Edit2, Trash2, Save, X, Upload, ArrowLeft, RefreshCw } from 'lucide-react';

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

const emptyForm: MemberFormData = {
  name: '',
  nameEn: '',
  role: '',
  roleEn: '',
  desc: '',
  descEn: '',
  image: '',
  order: 0
};

interface AdminProps {
  onBack: () => void;
}

export default function Admin({ onBack }: AdminProps) {
  const { members, isLoaded, addMember, updateMember, deleteMember, reorderMembers, resetToDefault } = useTeamMembers();
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<MemberFormData>(emptyForm);
  const [previewImage, setPreviewImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreviewImage(result);
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingId) {
      updateMember(editingId, formData);
    } else {
      addMember({
        ...formData,
        order: members.length + 1
      });
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setPreviewImage('');
    setIsEditing(false);
    setEditingId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleEdit = (member: TeamMember) => {
    setFormData({
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
    setEditingId(member.id);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这位团队成员吗？')) {
      deleteMember(id);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrder = [...members.map(m => m.id)];
    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
    reorderMembers(newOrder);
  };

  const handleMoveDown = (index: number) => {
    if (index === members.length - 1) return;
    const newOrder = [...members.map(m => m.id)];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    reorderMembers(newOrder);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-[#FFD700] text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-white/70 hover:text-[#FFD700] transition-colors duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>返回网站</span>
              </button>
              <div className="h-6 w-px bg-white/20" />
              <span className="text-xl font-bold text-white">
                F<span className="text-[#FFD700]">A</span>C
              </span>
              <span className="text-white/50">|</span>
              <span className="text-white/70">团队管理后台</span>
            </div>
            
            <button
              onClick={resetToDefault}
              className="flex items-center gap-2 px-4 py-2 text-white/60 hover:text-[#FFD700] transition-colors duration-300"
            >
              <RefreshCw className="w-4 h-4" />
              <span className="text-sm">恢复默认</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Add/Edit Form */}
        <div className="mb-8">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center gap-2 btn-gold mb-6"
          >
            {isEditing ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {isEditing ? '取消' : '添加成员'}
          </button>

          {isEditing && (
            <form onSubmit={handleSubmit} className="bg-white/5 rounded-2xl p-6 lg:p-8">
              <h2 className="text-xl font-bold text-white mb-6">
                {editingId ? '编辑成员' : '添加新成员'}
              </h2>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  {/* Chinese Name */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">中文姓名 *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                      placeholder="例如：林憬怡"
                    />
                  </div>

                  {/* English Name */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">英文姓名 *</label>
                    <input
                      type="text"
                      name="nameEn"
                      value={formData.nameEn}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                      placeholder="例如：Mark Lin"
                    />
                  </div>

                  {/* Chinese Role */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">中文职位 *</label>
                    <input
                      type="text"
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                      placeholder="例如：创始合伙人"
                    />
                  </div>

                  {/* English Role */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">英文职位 *</label>
                    <input
                      type="text"
                      name="roleEn"
                      value={formData.roleEn}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                      placeholder="例如：Founding Partner"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Chinese Description */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">中文简介</label>
                    <textarea
                      name="desc"
                      value={formData.desc}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none resize-none"
                      placeholder="例如：20年科技产业投资经验"
                    />
                  </div>

                  {/* English Description */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">英文简介</label>
                    <textarea
                      name="descEn"
                      value={formData.descEn}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none resize-none"
                      placeholder="例如：20 years of tech investment experience"
                    />
                  </div>

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">照片</label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2 px-4 py-3 bg-white/5 border border-white/10 border-dashed rounded-lg text-white/60 hover:text-white hover:border-[#FFD700] transition-all duration-300"
                      >
                        <Upload className="w-4 h-4" />
                        <span>上传照片</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      {previewImage && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Image URL Input */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">或输入图片路径</label>
                    <input
                      type="text"
                      name="image"
                      value={formData.image}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:border-[#FFD700] focus:ring-2 focus:ring-[#FFD700]/20 transition-all duration-300 outline-none"
                      placeholder="例如：/team-photo.jpg"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-4 mt-6">
                <button type="submit" className="btn-gold flex items-center gap-2">
                  <Save className="w-4 h-4" />
                  {editingId ? '保存修改' : '添加成员'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="btn-outline"
                >
                  取消
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Members List */}
        <div className="bg-white/5 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-bold text-white">团队成员列表</h2>
            <p className="text-white/50 text-sm mt-1">共 {members.length} 位成员</p>
          </div>
          
          <div className="divide-y divide-white/10">
            {members.map((member, index) => (
              <div
                key={member.id}
                className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-colors duration-300"
              >
                {/* Order */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="text-white/30 hover:text-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    ▲
                  </button>
                  <span className="text-center text-white/50 text-sm">{member.order}</span>
                  <button
                    onClick={() => handleMoveDown(index)}
                    disabled={index === members.length - 1}
                    className="text-white/30 hover:text-[#FFD700] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-300"
                  >
                    ▼
                  </button>
                </div>

                {/* Photo */}
                <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-medium">{member.name}</h3>
                    <span className="text-white/30">/</span>
                    <span className="text-white/60 text-sm">{member.nameEn}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[#FFD700] text-sm">{member.role}</span>
                    <span className="text-white/30">/</span>
                    <span className="text-white/50 text-sm">{member.roleEn}</span>
                  </div>
                  <p className="text-white/40 text-sm mt-1 truncate">{member.desc}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(member)}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#FFD700]/20 transition-colors duration-300"
                    title="编辑"
                  >
                    <Edit2 className="w-4 h-4 text-white/60 hover:text-[#FFD700]" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id)}
                    className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-red-500/20 transition-colors duration-300"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4 text-white/60 hover:text-red-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-white/40">暂无团队成员</p>
              <button
                onClick={() => setIsEditing(true)}
                className="btn-gold mt-4"
              >
                添加第一位成员
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
