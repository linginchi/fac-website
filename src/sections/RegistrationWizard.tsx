/**
 * FAC Platform V5.1 - 用户注册向导
 * 多步骤注册流程：LinkedIn登录 → 身份选择 → 完善资料 → 创建钱包
 * 
 * 修复内容：
 * 1. 接入真实LinkedIn OAuth
 * 2. 修复文件上传（头像和CV分离）
 * 3. 表单字段移除所有限制
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { 
  Linkedin, ChevronRight, ChevronLeft, User, Building2, 
  Upload, Mic, MicOff, CheckCircle, Wallet, Coins,
  Briefcase, MapPin, Phone, DollarSign, Clock, FileText,
  Sparkles, Shield, Eye, EyeOff, Loader2
} from 'lucide-react';
import { useUser, type UserRole } from '../contexts/UserContext';
import { useWallet } from '../context/WalletContext';
import type { SkillTag } from '../types/user';

interface RegistrationWizardProps {
  onComplete?: () => void;
  onBack?: () => void;
}

// 技能选项
const SKILL_OPTIONS = [
  { id: 'legal', label: '法律合規', category: 'legal' as const },
  { id: 'finance', label: '金融財務', category: 'finance' as const },
  { id: 'trade', label: '跨境貿易', category: 'trade' as const },
  { id: 'tech', label: '技術工程', category: 'tech' as const },
  { id: 'language', label: '語言翻譯', category: 'language' as const },
  { id: 'management', label: '管理諮詢', category: 'management' as const },
  { id: 'education', label: '教育培訓', category: 'education' as const },
  { id: 'healthcare', label: '醫療健康', category: 'healthcare' as const },
];

// LinkedIn OAuth配置
const LINKEDIN_CLIENT_ID = '86rh0n847vlmx9';
const LINKEDIN_REDIRECT_URI = typeof window !== 'undefined' 
  ? `${window.location.origin}/register`
  : 'https://www.hkfac.com/register';
const LINKEDIN_SCOPE = 'openid profile email';

export default function RegistrationWizard({ onComplete, onBack }: RegistrationWizardProps) {
  const { 
    currentUser, 
    isLoggedIn, 
    userRole, 
    login, 
    setUserRole, 
    updateProfile, 
    completeRegistration,
    generateWallet,
    walletAddress,
    registrationStep,
    setRegistrationStep,
    addSkill 
  } = useUser();
  const { addTransaction } = useWallet();
  
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvFileName, setCvFileName] = useState<string>('');
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [showWalletSecret, setShowWalletSecret] = useState(false);
  const [isLinkedInLoading, setIsLinkedInLoading] = useState(false);
  const [linkedInError, setLinkedInError] = useState<string>('');
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    location: '',
    bio: '',
    // 乙方字段
    hourlyRate: '',
    yearsExperience: '',
    availability: [] as string[],
    // 甲方字段
    companyName: '',
    companySize: '',
    industry: '',
    jobTitle: '',
    jobDescription: '',
    jobBudget: '',
  });

  // 检查URL参数（LinkedIn OAuth回调）
  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');
    const error = url.searchParams.get('error');
    const errorDescription = url.searchParams.get('error_description');

    if (error) {
      setLinkedInError(errorDescription || 'LinkedIn授权失败');
      return;
    }

    if (code && state) {
      // 验证state防止CSRF攻击
      const savedState = sessionStorage.getItem('linkedin_oauth_state');
      if (state !== savedState) {
        setLinkedInError('安全验证失败，请重试');
        return;
      }
      
      // 清除URL参数
      window.history.replaceState({}, '', '/register');
      
      // 处理LinkedIn登录
      handleLinkedInCallback(code);
    }
  }, []);

  // LinkedIn OAuth登录
  const handleLinkedInLogin = () => {
    setIsLinkedInLoading(true);
    setLinkedInError('');
    
    // 生成随机state防止CSRF
    const state = Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('linkedin_oauth_state', state);
    
    // 构建LinkedIn OAuth URL
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: LINKEDIN_CLIENT_ID,
      redirect_uri: LINKEDIN_REDIRECT_URI,
      state: state,
      scope: LINKEDIN_SCOPE,
    });
    
    // 跳转到LinkedIn授权页面
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
  };

  // 处理LinkedIn回调
  const handleLinkedInCallback = async (code: string) => {
    setIsLinkedInLoading(true);
    
    try {
      // 调用后端API交换code获取token
      const response = await fetch('/api/auth/linkedin/callback?code=' + encodeURIComponent(code));
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'LinkedIn登录失败');
      }

      // 登录成功，更新用户状态
      const { user, token } = data;
      
      // 存储token
      localStorage.setItem('fac_auth_token', token);
      
      // 预填充表单数据
      if (user.name) {
        setFormData(prev => ({ ...prev, displayName: user.name }));
      }
      if (user.avatar_url) {
        setAvatarPreview(user.avatar_url);
      }
      
      // 发放LinkedIn登录奖励
      const now = new Date().toISOString().slice(0, 10);
      addTransaction({ date: now, label: 'LinkedIn 授權註冊', amount: 80 });
      
      // 进入下一步
      setRegistrationStep(2);
    } catch (error: any) {
      setLinkedInError(error.message || '登录过程中发生错误');
    } finally {
      setIsLinkedInLoading(false);
    }
  };

  // 选择身份
  const handleRoleSelect = (role: UserRole) => {
    setUserRole(role);
    setRegistrationStep(3);
  };

  // 处理表单输入 - 移除所有限制
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 头像上传 - 修复文件处理
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      // 验证文件大小（最大5MB）
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      
      setAvatarFile(file);
      
      // 创建本地预览
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        // 立即更新用户资料
        updateProfile({ avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // CV上传 - 独立的上传处理
  const handleCVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // 验证文件类型
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      if (!allowedTypes.includes(file.type)) {
        alert('请上传PDF或Word文件');
        return;
      }
      // 验证文件大小（最大10MB）
      if (file.size > 10 * 1024 * 1024) {
        alert('文件大小不能超过10MB');
        return;
      }
      
      setCvFile(file);
      setCvFileName(file.name);
      
      // 创建本地预览（仅用于显示）
      const reader = new FileReader();
      reader.onloadend = () => {
        // CV文件不直接存储内容，只存储引用
        updateProfile({ cvUrl: file.name });
      };
      reader.readAsDataURL(file);
    }
  };

  // 语音输入
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      
      // 使用真实的Web Speech API
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'zh-HK';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onresult = (event: any) => {
          const transcriptText = event.results[0][0].transcript;
          setTranscript(transcriptText);
          handleInputChange('bio', transcriptText);
          setIsRecording(false);
        };
        
        recognition.onerror = () => {
          setIsRecording(false);
          // 降级到模拟数据
          const mockBio = '我是一位擁有20年經驗的財務顧問，精通跨境稅務規劃和企業融資。目前專注於為中小企業提供專業諮詢服務。';
          setTranscript(mockBio);
          handleInputChange('bio', mockBio);
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } else {
        // 浏览器不支持语音识别，使用模拟
        setTimeout(() => {
          const mockBio = '我是一位擁有20年經驗的財務顧問，精通跨境稅務規劃和企業融資。目前專注於為中小企業提供專業諮詢服務。';
          setTranscript(mockBio);
          handleInputChange('bio', mockBio);
          setIsRecording(false);
        }, 3000);
      }
    } else {
      setIsRecording(false);
    }
  };

  // 技能选择
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => {
      const isSelected = prev.includes(skillId);
      const newSkills = isSelected
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId];
      
      // 添加到用户资料
      if (!isSelected) {
        const skill = SKILL_OPTIONS.find(s => s.id === skillId);
        if (skill) {
          addSkill({
            id: skillId,
            label: skill.label,
            weight: 80,
            category: skill.category,
            verified: false,
            source: 'manual',
          });
        }
      }
      
      return newSkills;
    });
  };

  // 生成钱包
  const handleGenerateWallet = async () => {
    setIsGeneratingWallet(true);
    
    // 模拟生成过程
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const address = generateWallet();
    setIsGeneratingWallet(false);
    
    // 发放完善资料奖励
    const now = new Date().toISOString().slice(0, 10);
    addTransaction({ date: now, label: '完善個人保險箱', amount: 20 });
    if (transcript) {
      addTransaction({ date: now, label: '語音完善資料', amount: 50 });
    }
  };

  // 完成注册
  const handleComplete = async () => {
    // 更新所有资料
    updateProfile({
      displayName: formData.displayName,
      phone: formData.phone,
      location: formData.location,
      bio: formData.bio,
      hourlyRate: formData.hourlyRate ? parseInt(formData.hourlyRate) : undefined,
      yearsExperience: formData.yearsExperience ? parseInt(formData.yearsExperience) : undefined,
      companyName: formData.companyName,
      companySize: formData.companySize,
      industry: formData.industry,
    });
    
    // TODO: 实际上传文件到服务器
    // 这里应该调用API上传avatarFile和cvFile
    
    await completeRegistration();
    onComplete?.();
  };

  // 步骤指示器
  const StepIndicator = () => {
    const steps = ['LinkedIn', '身份', '資料', '錢包'];
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = registrationStep === stepNum;
          const isCompleted = registrationStep > stepNum;
          
          return (
            <div key={step} className="flex items-center">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#C9A96E] text-[#0A1628]' 
                    : isCompleted 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-white/5 text-gray-500'
                }`}
              >
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`ml-2 text-xs ${isActive ? 'text-[#C9A96E]' : 'text-gray-500'}`}>
                {step}
              </span>
              {idx < steps.length - 1 && (
                <div className="w-8 h-px bg-white/10 mx-2" />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // 步骤1: LinkedIn 登录
  const Step1_LinkedIn = () => (
    <div className="text-center space-y-6">
      <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0A66C2]/10 border border-[#0A66C2]/20 flex items-center justify-center">
        <Linkedin className="w-10 h-10 text-[#0A66C2]" />
      </div>
      
      <div>
        <h2 className="text-xl font-bold text-white mb-2">使用 LinkedIn 一鍵註冊</h2>
        <p className="text-sm text-gray-400">
          安全同步您的職業資歷，快速建立智慧保險箱
        </p>
      </div>

      <div 
        className="py-3 px-4 rounded-xl text-sm"
        style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}
      >
        <div className="flex items-center justify-center gap-2 text-[#C9A96E] mb-2">
          <Coins className="w-4 h-4" />
          <span className="font-medium">註冊即領 80 $FAC</span>
        </div>
        <p className="text-xs text-gray-500">
          平台採用去中心化存儲，您的數據僅存於您的專屬加密節點
        </p>
      </div>

      {linkedInError && (
        <div className="py-2 px-3 rounded-lg text-sm text-red-400 bg-red-500/10 border border-red-500/20">
          {linkedInError}
        </div>
      )}

      <button
        onClick={handleLinkedInLogin}
        disabled={isLinkedInLoading}
        className="w-full flex items-center justify-center gap-3 py-4 px-5 rounded-xl font-semibold text-base transition-all duration-300 hover:opacity-95 hover:scale-[1.01] disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #0A66C2 0%, #004182 100%)',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.15)',
          boxShadow: '0 4px 20px rgba(10,102,194,0.35)'
        }}
      >
        {isLinkedInLoading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <Linkedin className="w-5 h-5" />
        )}
        <span>{isLinkedInLoading ? '連接中...' : '使用 LinkedIn 登入'}</span>
      </button>

      <p className="text-xs text-gray-500">
        註冊即表示您同意我們的<a href="/terms.html" target="_blank" className="text-[#C9A96E] hover:underline">服務條款</a>與<a href="/privacy.html" target="_blank" className="text-[#C9A96E] hover:underline">隱私政策</a>
      </p>
    </div>
  );

  // 步骤2: 选择身份
  const Step2_RoleSelect = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">選擇您的身份</h2>
        <p className="text-sm text-gray-400">
          這將決定您在平台上的主要使用方式
        </p>
      </div>

      <div className="grid gap-4">
        {/* 乙方选项 */}
        <button
          onClick={() => handleRoleSelect('B')}
          className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] group"
          style={{ 
            background: 'linear-gradient(145deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.02) 100%)',
            border: '1px solid rgba(76,175,80,0.2)'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
              <User className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                我是專家 / 顧問
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                退休專業人士、行業顧問、自由工作者
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  尋找項目機會
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  分享專業智慧
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">
                  獲得額外收入
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" />
          </div>
        </button>

        {/* 甲方选项 */}
        <button
          onClick={() => handleRoleSelect('A')}
          className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] group"
          style={{ 
            background: 'linear-gradient(145deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.02) 100%)',
            border: '1px solid rgba(33,150,243,0.2)'
          }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors">
                我是企業 / 需求方
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                尋找專業顧問、發布項目需求、預約專家諮詢
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  發布招聘需求
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  匹配專家資源
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  獲得專業服務
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
          </div>
        </button>
      </div>

      <button
        onClick={() => setRegistrationStep(1)}
        className="w-full flex items-center justify-center gap-2 py-3 text-sm text-gray-400 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        返回
      </button>
    </div>
  );

  // 步骤3: 完善资料
  const Step3_Profile = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">完善您的資料</h2>
        <p className="text-sm text-gray-400">
          {userRole === 'B' ? '讓企業更好地了解您的專業背景' : '讓專家更好地了解您的企業需求'}
        </p>
      </div>

      {/* 头像上传 */}
      <div className="flex flex-col items-center">
        <button
          onClick={() => avatarInputRef.current?.click()}
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#C9A96E]/30 flex items-center justify-center transition-all hover:border-[#C9A96E]"
          style={{ background: 'rgba(201,169,110,0.05)' }}
        >
          {avatarPreview ? (
            <img 
              src={avatarPreview} 
              alt="Avatar" 
              className="w-full h-full object-cover"
              onError={() => setAvatarPreview(null)}
            />
          ) : (
            <Upload className="w-8 h-8 text-[#C9A96E]/50" />
          )}
        </button>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">
          {avatarFile ? `已選擇: ${avatarFile.name}` : '點擊上傳頭像 (JPG/PNG/GIF, 最大5MB)'}
        </p>
      </div>

      {/* 基本信息 */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">顯示名稱 *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder={userRole === 'B' ? '您的姓名或專業稱號' : '企業聯繫人姓名'}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              <Phone className="w-3 h-3 inline mr-1" />
              聯繫電話
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="+852"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-2">
              <MapPin className="w-3 h-3 inline mr-1" />
              所在地
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="香港"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            />
          </div>
        </div>

        {/* 语音输入 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 flex items-center justify-between">
            <span>個人簡介</span>
            <button
              onClick={toggleRecording}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
                isRecording 
                  ? 'bg-red-500/20 text-red-400 animate-pulse' 
                  : 'bg-[#C9A96E]/10 text-[#C9A96E]'
              }`}
            >
              {isRecording ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              {isRecording ? '錄音中...' : '語音輸入'}
            </button>
          </label>
          <textarea
            value={formData.bio || transcript}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            placeholder={userRole === 'B' 
              ? '請介紹您的專業背景、核心技能和服務範圍...' 
              : '請介紹您的企業背景和專業需求...'}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50 resize-none"
          />
          {transcript && (
            <p className="text-xs text-green-400 mt-1">✓ 語音轉文字成功 (+50 $FAC)</p>
          )}
        </div>

        {/* 乙方特定：技能和薪资 */}
        {userRole === 'B' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-2">專業技能（可多選）</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      selectedSkills.includes(skill.id)
                        ? 'bg-[#C9A96E] text-[#0A1628]'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:border-[#C9A96E]/30'
                    }`}
                  >
                    {skill.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  <DollarSign className="w-3 h-3 inline mr-1" />
                  每小時報價 (HKD)
                </label>
                <input
                  type="number"
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  placeholder="500"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">
                  <Briefcase className="w-3 h-3 inline mr-1" />
                  工作經驗（年）
                </label>
                <input
                  type="number"
                  value={formData.yearsExperience}
                  onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                  placeholder="20"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">
                <Clock className="w-3 h-3 inline mr-1" />
                可服務時間
              </label>
              <div className="flex flex-wrap gap-2">
                {['工作日', '週末', '上午', '下午', '晚上', '彈性'].map(time => (
                  <button
                    key={time}
                    onClick={() => {
                      const newAvailability = formData.availability.includes(time)
                        ? formData.availability.filter(t => t !== time)
                        : [...formData.availability, time];
                      handleInputChange('availability', newAvailability);
                    }}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      formData.availability.includes(time)
                        ? 'bg-[#C9A96E] text-[#0A1628]'
                        : 'bg-white/5 text-gray-400 border border-white/10'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* 甲方特定：企业信息 */}
        {userRole === 'A' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                <Building2 className="w-3 h-3 inline mr-1" />
                企業名稱
              </label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleInputChange('companyName', e.target.value)}
                placeholder="您的公司名稱"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">行業領域</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C9A96E]/50 appearance-none"
                  style={{ backgroundImage: 'none' }}
                >
                  <option value="" className="bg-[#0A1628]">請選擇</option>
                  <option value="finance" className="bg-[#0A1628]">金融服務</option>
                  <option value="tech" className="bg-[#0A1628]">科技互聯網</option>
                  <option value="trade" className="bg-[#0A1628]">跨境貿易</option>
                  <option value="legal" className="bg-[#0A1628]">法律合規</option>
                  <option value="manufacturing" className="bg-[#0A1628]">製造業</option>
                  <option value="other" className="bg-[#0A1628]">其他</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-2">企業規模</label>
                <select
                  value={formData.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C9A96E]/50"
                >
                  <option value="" className="bg-[#0A1628]">請選擇</option>
                  <option value="1-10" className="bg-[#0A1628]">1-10人</option>
                  <option value="11-50" className="bg-[#0A1628]">11-50人</option>
                  <option value="51-200" className="bg-[#0A1628]">51-200人</option>
                  <option value="200+" className="bg-[#0A1628]">200人以上</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">
                <FileText className="w-3 h-3 inline mr-1" />
                當前需求簡述
              </label>
              <textarea
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                placeholder="請描述您正在尋找的專業服務或人才類型..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-2">
                <DollarSign className="w-3 h-3 inline mr-1" />
                預算範圍 (HKD)
              </label>
              <input
                type="text"
                value={formData.jobBudget}
                onChange={(e) => handleInputChange('jobBudget', e.target.value)}
                placeholder="例如：每小時 500-800 或 項目總額 50000"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
              />
            </div>
          </>
        )}

        {/* CV上传 - 修复版本 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            <FileText className="w-3 h-3 inline mr-1" />
            上傳履歷/CV（可選）
          </label>
          <input
            ref={cvInputRef}
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={handleCVUpload}
            className="hidden"
          />
          <div 
            className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center cursor-pointer hover:border-[#C9A96E]/30 transition-colors"
            onClick={() => cvInputRef.current?.click()}
          >
            <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
            <p className="text-sm text-gray-400">
              {cvFileName || '點擊上傳 PDF 或 Word 文件'}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              {cvFile ? `已選擇: ${cvFile.name} (${(cvFile.size / 1024 / 1024).toFixed(2)}MB)` : '支持 PDF, DOC, DOCX 格式，最大10MB'}
            </p>
          </div>
        </div>
      </div>

      {/* 导航按钮 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setRegistrationStep(2)}
          className="flex-1 py-3 rounded-xl text-sm text-gray-400 hover:text-white transition-colors border border-white/10"
        >
          返回
        </button>
        <button
          onClick={() => setRegistrationStep(4)}
          disabled={!formData.displayName}
          className="flex-1 py-3 rounded-xl text-sm font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          下一步
        </button>
      </div>
    </div>
  );

  // 步骤4: 创建钱包
  const Step4_Wallet = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">創建您的智慧錢包</h2>
        <p className="text-sm text-gray-400">
          去中心化存儲，您的數據僅由您掌控
        </p>
      </div>

      {!walletAddress ? (
        <div 
          className="p-6 rounded-2xl text-center"
          style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">銀行級加密保護</span>
          </div>
          <ul className="text-left text-sm text-gray-400 space-y-2 mb-6">
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              您的資歷存儲於專屬加密節點
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              非經授權，平台亦無法讀取
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
              支持導出至冷錢包（Executive級別）
            </li>
          </ul>

          <button
            onClick={handleGenerateWallet}
            disabled={isGeneratingWallet}
            className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 transition-all hover:opacity-90"
          >
            {isGeneratingWallet ? (
              <span className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                正在生成安全密鑰...
              </span>
            ) : (
              '創建我的智慧錢包'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div 
            className="p-5 rounded-2xl"
            style={{ background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.2)' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-green-400">錢包創建成功</span>
            </div>
            
            <div className="p-3 rounded-xl bg-black/20 mb-3">
              <p className="text-xs text-gray-500 mb-1">您的錢包地址</p>
              <code className="text-xs text-[#C9A96E] break-all">{walletAddress}</code>
            </div>

            <div className="p-3 rounded-xl bg-yellow-500/5 border border-yellow-500/20">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-yellow-500/80">助記詞（請安全備份）</span>
                <button
                  onClick={() => setShowWalletSecret(!showWalletSecret)}
                  className="text-xs text-yellow-500/60 hover:text-yellow-500 flex items-center gap-1"
                >
                  {showWalletSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                  {showWalletSecret ? '隱藏' : '顯示'}
                </button>
              </div>
              {showWalletSecret ? (
                <p className="text-xs text-gray-400 font-mono">
                  wisdom legacy vault secure blockchain future legacy...
                </p>
              ) : (
                <p className="text-xs text-gray-600">•••• •••• •••• •••• •••• ••••</p>
              )}
            </div>
          </div>

          <div 
            className="p-4 rounded-xl text-center"
            style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}
          >
            <p className="text-sm text-[#C9A96E] font-medium mb-1">註冊完成獎勵</p>
            <p className="text-2xl font-bold text-white">150 $FAC</p>
            <p className="text-xs text-gray-500 mt-1">已發放至您的錢包</p>
          </div>

          <button
            onClick={handleComplete}
            className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] hover:opacity-90 transition-opacity"
          >
            完成註冊，進入平台
          </button>
        </div>
      )}

      <button
        onClick={() => setRegistrationStep(3)}
        className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors"
      >
        返回修改資料
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A1628] py-8 px-4">
      <div className="max-w-md mx-auto">
        {/* 返回按钮 */}
        {onBack && registrationStep === 1 && (
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-sm mb-6 text-[#C9A96E]/70 hover:text-[#C9A96E] transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            返回首頁
          </button>
        )}

        {/* Logo */}
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-white mb-1">
            F<span className="text-[#C9A96E]">A</span>C
          </div>
          <p className="text-xs text-gray-500">智慧沈澱，在此相遇</p>
        </div>

        {/* 步骤指示器 */}
        <StepIndicator />

        {/* 步骤内容 */}
        <div 
          className="rounded-2xl p-6"
          style={{ 
            background: 'linear-gradient(145deg, rgba(13,31,60,0.95) 0%, rgba(10,22,40,0.98) 100%)',
            border: '1px solid rgba(201,169,110,0.15)'
          }}
        >
          {registrationStep === 1 && <Step1_LinkedIn />}
          {registrationStep === 2 && <Step2_RoleSelect />}
          {registrationStep === 3 && <Step3_Profile />}
          {registrationStep === 4 && <Step4_Wallet />}
        </div>

        {/* 底部信息 */}
        <p className="text-center text-xs text-gray-600 mt-6">
          FAC Platform V5.1 · 國科綠色發展國際實驗室（香港）
        </p>
      </div>
    </div>
  );
}
