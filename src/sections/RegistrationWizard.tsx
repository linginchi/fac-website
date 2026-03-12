/**
 * FAC Platform V5.1 - 用户注册向导 (AI Agent版)
 * 支持多模態文件解析：PDF/Word/圖片/語音
 */

import { useState, useRef } from 'react';
import { 
  ChevronRight, ChevronLeft, User, Building2, 
  Upload, Mic, MicOff, CheckCircle, Wallet, Coins,
  Briefcase, MapPin, Phone, DollarSign, FileText,
  Sparkles, Shield, Eye, EyeOff, Loader2, FileUp, X,
  Image as ImageIcon, FileAudio, FileType2
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

// 支持的上傳文件類型
const SUPPORTED_FILE_TYPES = {
  pdf: { mime: 'application/pdf', ext: '.pdf', icon: FileText, label: 'PDF' },
  doc: { mime: 'application/msword', ext: '.doc', icon: FileType2, label: 'Word' },
  docx: { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', ext: '.docx', icon: FileType2, label: 'Word' },
  jpg: { mime: 'image/jpeg', ext: '.jpg', icon: ImageIcon, label: '圖片' },
  jpeg: { mime: 'image/jpeg', ext: '.jpeg', icon: ImageIcon, label: '圖片' },
  png: { mime: 'image/png', ext: '.png', icon: ImageIcon, label: '圖片' },
  gif: { mime: 'image/gif', ext: '.gif', icon: ImageIcon, label: '圖片' },
  webp: { mime: 'image/webp', ext: '.webp', icon: ImageIcon, label: '圖片' },
  mp3: { mime: 'audio/mpeg', ext: '.mp3', icon: FileAudio, label: '語音' },
  wav: { mime: 'audio/wav', ext: '.wav', icon: FileAudio, label: '語音' },
  m4a: { mime: 'audio/mp4', ext: '.m4a', icon: FileAudio, label: '語音' },
  ogg: { mime: 'audio/ogg', ext: '.ogg', icon: FileAudio, label: '語音' },
  webm: { mime: 'audio/webm', ext: '.webm', icon: FileAudio, label: '語音' },
};

// API基礎URL
const API_BASE_URL = 'https://api-fac-platform.mark-377.workers.dev';

export default function RegistrationWizard({ onComplete, onBack }: RegistrationWizardProps) {
  const { 
    currentUser, 
    isLoggedIn, 
    userRole, 
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
  const [parseFile, setParseFile] = useState<File | null>(null);
  const [parseFileName, setParseFileName] = useState<string>('');
  const [parseFileType, setParseFileType] = useState<string>('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string>('');
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [showWalletSecret, setShowWalletSecret] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 表单状态
  const [formData, setFormData] = useState({
    displayName: '',
    phone: '',
    location: '',
    bio: '',
    hourlyRate: '',
    yearsExperience: '',
    availability: [] as string[],
    companyName: '',
    companySize: '',
    industry: '',
    jobTitle: '',
    jobDescription: '',
    jobBudget: '',
  });

  // 初始化用户ID
  const initUser = () => {
    const userId = `user_${Date.now()}`;
    localStorage.setItem('fac_user_id', userId);
    localStorage.setItem('fac_user_logged_in', '1');
    return userId;
  };

  // 选择身份
  const handleRoleSelect = (role: UserRole) => {
    initUser();
    setUserRole(role);
    setRegistrationStep(2);
    
    const now = new Date().toISOString().slice(0, 10);
    addTransaction({ date: now, label: '手動註冊', amount: 50 });
  };

  // 处理表单输入
  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // 头像上传
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('请上传图片文件');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert('图片大小不能超过5MB');
        return;
      }
      
      setAvatarFile(file);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
        updateProfile({ avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  // 檢測文件類型
  const detectFileType = (file: File): string => {
    const mimeType = file.type.toLowerCase();
    for (const [key, config] of Object.entries(SUPPORTED_FILE_TYPES)) {
      if (config.mime === mimeType) {
        return key;
      }
    }
    // 通過擴展名檢測
    const ext = file.name.toLowerCase().split('.').pop();
    if (ext && ext in SUPPORTED_FILE_TYPES) {
      return ext;
    }
    return 'unknown';
  };

  // 獲取文件類型顯示名稱
  const getFileTypeLabel = (type: string): string => {
    return SUPPORTED_FILE_TYPES[type as keyof typeof SUPPORTED_FILE_TYPES]?.label || '文件';
  };

  // AI Agent 解析文件
  const parseFileWithAgent = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userRole', userRole || 'neutral');

    const response = await fetch(`${API_BASE_URL}/api/parse/file`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || `解析失敗: ${response.status}`);
    }

    return await response.json();
  };

  // 文件上傳處理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 檢查文件大小（最大20MB）
    if (file.size > 20 * 1024 * 1024) {
      alert('文件大小不能超过20MB');
      return;
    }

    // 檢測文件類型
    const fileType = detectFileType(file);
    if (fileType === 'unknown') {
      alert('不支持的文件格式。請上傳 PDF、Word、圖片或語音文件。');
      return;
    }

    setParseFile(file);
    setParseFileName(file.name);
    setParseFileType(fileType);
    setParseError('');
    setParsedData(null);

    // 開始解析
    setIsParsing(true);
    try {
      const result = await parseFileWithAgent(file);
      
      if (result.success && result.data) {
        setParsedData(result.data);
        
        // 自動填充表單
        if (result.data.extractedInfo) {
          const info = result.data.extractedInfo;
          setFormData(prev => ({
            ...prev,
            displayName: info.name || prev.displayName,
            phone: info.phone || prev.phone,
            location: info.location || prev.location,
            bio: info.bio || info.summary || prev.bio,
            companyName: info.company || prev.companyName,
            jobTitle: info.title || prev.jobTitle,
            yearsExperience: info.yearsExperience || prev.yearsExperience,
          }));
        }

        // 發放獎勵
        const now = new Date().toISOString().slice(0, 10);
        const rewardAmount = fileType.includes('mp3') || fileType.includes('wav') || fileType.includes('m4a') 
          ? 50  // 語音獎勵更高
          : 30; // 文檔/圖片獎勵
        
        addTransaction({ 
          date: now, 
          label: `AI解析${getFileTypeLabel(fileType)}`, 
          amount: rewardAmount 
        });
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      setParseError(error.message || '文件解析失敗，請手動填寫資料');
    } finally {
      setIsParsing(false);
    }
  };

  // 語音輸入（本地Web Speech API）
  const toggleRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
      
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
        };
        
        recognition.onend = () => {
          setIsRecording(false);
        };
        
        recognition.start();
      } else {
        setTimeout(() => {
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
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const address = generateWallet();
    setIsGeneratingWallet(false);
    
    const now = new Date().toISOString().slice(0, 10);
    addTransaction({ date: now, label: '完善個人保險箱', amount: 20 });
    if (transcript) {
      addTransaction({ date: now, label: '語音完善資料', amount: 50 });
    }
  };

  // 完成注册
  const handleComplete = async () => {
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
    
    await completeRegistration();
    onComplete?.();
  };

  // 步骤指示器
  const StepIndicator = () => {
    const steps = ['身份', '資料', '錢包'];
    const adjustedStep = registrationStep >= 2 ? registrationStep - 1 : 1;
    
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isActive = adjustedStep === stepNum;
          const isCompleted = adjustedStep > stepNum;
          
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

  // 步驟1: 選擇身份
  const Step1_RoleSelect = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">選擇您的身份</h2>
        <p className="text-sm text-gray-400">
          這將決定您在平台上的主要使用方式
        </p>
      </div>

      <div 
        className="py-3 px-4 rounded-xl text-sm mb-6"
        style={{ background: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}
      >
        <div className="flex items-center justify-center gap-2 text-[#C9A96E] mb-2">
          <Coins className="w-4 h-4" />
          <span className="font-medium">註冊即領 50 $FAC</span>
        </div>
        <p className="text-xs text-gray-500 text-center">
          AI解析文件額外獲得 30-50 $FAC
        </p>
      </div>

      <div className="grid gap-4">
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
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-400 transition-colors" />
          </div>
        </button>

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
                尋找專業顧問、發布項目需求
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                  發布招聘需求
                </span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400 transition-colors" />
          </div>
        </button>
      </div>
    </div>
  );

  // 步驟2: 完善資料
  const Step2_Profile = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">完善您的資料</h2>
        <p className="text-sm text-gray-400">
          上傳文件讓AI自動填充，或手動填寫
        </p>
      </div>

      {/* AI Agent 文件上傳區域 */}
      <div 
        className="p-5 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 bg-[#C9A96E]/5 text-center cursor-pointer hover:border-[#C9A96E]/60 transition-colors"
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.m4a,.ogg,.webm"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        {isParsing ? (
          <div className="py-4">
            <Loader2 className="w-10 h-10 text-[#C9A96E] animate-spin mx-auto mb-3" />
            <p className="text-sm text-white font-medium">AI Agent 正在解析...</p>
            <p className="text-xs text-gray-500 mt-1">{parseFileName}</p>
          </div>
        ) : parsedData ? (
          <div className="py-2">
            <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-2" />
            <p className="text-sm text-green-400 font-medium">✓ AI解析完成</p>
            <p className="text-xs text-gray-500 mt-1">{parseFileName}</p>
            {parsedData.extractedInfo && (
              <div className="mt-3 text-left bg-black/20 rounded-lg p-3">
                <p className="text-xs text-gray-400 mb-1">已提取信息：</p>
                {parsedData.extractedInfo.name && (
                  <p className="text-xs text-white">• 姓名: {parsedData.extractedInfo.name}</p>
                )}
                {parsedData.extractedInfo.phone && (
                  <p className="text-xs text-white">• 電話: {parsedData.extractedInfo.phone}</p>
                )}
                {parsedData.extractedInfo.company && (
                  <p className="text-xs text-white">• 公司: {parsedData.extractedInfo.company}</p>
                )}
              </div>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setParseFile(null);
                setParseFileName('');
                setParsedData(null);
              }}
              className="mt-3 text-xs text-red-400 hover:text-red-300"
            >
              移除文件
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-[#C9A96E]" />
              <ImageIcon className="w-6 h-6 text-[#C9A96E]" />
              <FileAudio className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <p className="text-sm text-white font-medium mb-1">上傳文件 AI 自動解析</p>
            <p className="text-xs text-gray-500">
              PDF · Word · 圖片 · 語音
            </p>
            <p className="text-xs text-gray-600 mt-2">
              最大 20MB
            </p>
          </>
        )}
        
        {parseError && (
          <p className="text-xs text-red-400 mt-2">{parseError}</p>
        )}
      </div>

      {/* 頭像上傳 */}
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
          accept="image/*"
          onChange={handleAvatarUpload}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">
          {avatarFile ? `已選擇: ${avatarFile.name}` : '點擊上傳頭像'}
        </p>
      </div>

      {/* 表單字段 */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">顯示名稱 *</label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => handleInputChange('displayName', e.target.value)}
            placeholder={userRole === 'B' ? '您的姓名或專業稱號' : '企業聯繫人姓名'}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            autoComplete="off"
            spellCheck="false"
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
              autoComplete="off"
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
              autoComplete="off"
            />
          </div>
        </div>

        {/* 語音輸入 */}
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
            spellCheck="false"
          />
          {transcript && (
            <p className="text-xs text-green-400 mt-1">✓ 語音轉文字成功 (+50 $FAC)</p>
          )}
        </div>

        {/* 乙方特定 */}
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
          </>
        )}

        {/* 甲方特定 */}
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
                autoComplete="off"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">行業領域</label>
                <select
                  value={formData.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-[#C9A96E]/50"
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
          </>
        )}
      </div>

      {/* 導航按鈕 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={() => setRegistrationStep(1)}
          className="flex-1 py-3 rounded-xl text-sm text-gray-400 hover:text-white transition-colors border border-white/10"
        >
          返回
        </button>
        <button
          onClick={() => setRegistrationStep(3)}
          disabled={!formData.displayName}
          className="flex-1 py-3 rounded-xl text-sm font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          下一步
        </button>
      </div>
    </div>
  );

  // 步驟3: 創建錢包
  const Step3_Wallet = () => (
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
            <p className="text-2xl font-bold text-white">100+ $FAC</p>
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
        onClick={() => setRegistrationStep(2)}
        className="w-full py-3 text-sm text-gray-400 hover:text-white transition-colors"
      >
        返回修改資料
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A1628] py-8 px-4">
      <div className="max-w-md mx-auto">
        <button 
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          返回首頁
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">FAC</h1>
          <p className="text-xs text-gray-500">智慧沈澱，在此相遇</p>
        </div>

        <StepIndicator />

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
          {registrationStep === 1 && <Step1_RoleSelect />}
          {registrationStep === 2 && <Step2_Profile />}
          {registrationStep === 3 && <Step3_Wallet />}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          FAC Platform V5.1 · AI Agent Powered
        </p>
      </div>
    </div>
  );
}
