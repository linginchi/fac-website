/**
 * FAC Platform V5.1-ALPHA - Registration Wizard
 * Fixed: Input remount issue, AI parse回填, phone validation
 */

import { useState, useRef, useEffect, memo } from 'react';
import { 
  ChevronRight, ChevronLeft, User, Building2, 
  Upload, Mic, MicOff, CheckCircle, Wallet,
  Briefcase, MapPin, Phone, DollarSign, FileText,
  Sparkles, Shield, Eye, EyeOff, Loader2,
  Image as ImageIcon, FileAudio
} from 'lucide-react';

interface RegistrationWizardProps {
  onComplete?: () => void;
  onBack?: () => void;
}

const API_BASE_URL = 'https://api-fac-platform.mark-377.workers.dev';

const SKILL_OPTIONS = [
  { id: 'legal', label: '法律合規' },
  { id: 'finance', label: '金融財務' },
  { id: 'trade', label: '跨境貿易' },
  { id: 'tech', label: '技術工程' },
  { id: 'language', label: '語言翻譯' },
  { id: 'management', label: '管理諮詢' },
  { id: 'education', label: '教育培訓' },
  { id: 'healthcare', label: '醫療健康' },
];

// ============================================
// Step 1: 身份選擇 (獨立組件避免重新掛載)
// ============================================
interface Step1Props {
  onSelect: (role: 'A' | 'B') => void;
}

const Step1SelectRole = memo(function Step1SelectRole({ onSelect }: Step1Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <User className="w-10 h-10 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">選擇您的身份</h2>
        <p className="text-sm text-gray-400">V5.1-ALPHA 智慧匹配系統</p>
      </div>

      <div className="grid gap-4">
        {/* 乙方 - 專家 */}
        <button
          onClick={() => onSelect('B')}
          className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] group"
          style={{ background: 'linear-gradient(145deg, rgba(76,175,80,0.1) 0%, rgba(76,175,80,0.02) 100%)', border: '1px solid rgba(76,175,80,0.2)' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
              <User className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400">我是專家 / 顧問</h3>
              <p className="text-sm text-gray-400 mb-3">提供專業服務，分享知識經驗</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">乙方身份</span>
                <span className="text-xs px-2 py-1 rounded-full bg-green-500/10 text-green-400">+50 $FAC</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-green-400" />
          </div>
        </button>

        {/* 甲方 - 企業 */}
        <button
          onClick={() => onSelect('A')}
          className="p-5 rounded-2xl text-left transition-all hover:scale-[1.02] group"
          style={{ background: 'linear-gradient(145deg, rgba(33,150,243,0.1) 0%, rgba(33,150,243,0.02) 100%)', border: '1px solid rgba(33,150,243,0.2)' }}
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400">我是企業 / 需求方</h3>
              <p className="text-sm text-gray-400 mb-3">發布項目需求，匹配專家資源</p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">甲方身份</span>
                <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">+50 $FAC</span>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-blue-400" />
          </div>
        </button>
      </div>
    </div>
  );
});

// ============================================
// Step 2: 資料填寫 (獨立組件)
// ============================================
interface Step2Props {
  userRole: 'A' | 'B' | null;
  displayName: string;
  setDisplayName: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  location: string;
  setLocation: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  hourlyRate: string;
  setHourlyRate: (v: string) => void;
  yearsExperience: string;
  setYearsExperience: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  industry: string;
  setIndustry: (v: string) => void;
  companySize: string;
  setCompanySize: (v: string) => void;
  selectedSkills: string[];
  toggleSkill: (id: string) => void;
  avatarPreview: string | null;
  onAvatarClick: () => void;
  parseFileName: string;
  isParsing: boolean;
  parseError: string;
  parsedData: any;
  onFileClick: () => void;
  isRecording: boolean;
  toggleRecording: () => void;
  transcript: string;
  onNext: () => void;
  onBack: () => void;
}

const Step2Profile = memo(function Step2Profile({
  userRole,
  displayName, setDisplayName,
  phone, setPhone,
  location, setLocation,
  bio, setBio,
  hourlyRate, setHourlyRate,
  yearsExperience, setYearsExperience,
  companyName, setCompanyName,
  industry, setIndustry,
  companySize, setCompanySize,
  selectedSkills, toggleSkill,
  avatarPreview, onAvatarClick,
  parseFileName, isParsing, parseError, parsedData, onFileClick,
  isRecording, toggleRecording, transcript,
  onNext, onBack
}: Step2Props) {
  // 電話輸入處理：允許 + 開頭和數字
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // 允許 + 開頭，後續只能輸入數字和空格
    if (/^[+]?[\d\s]*$/.test(value)) {
      setPhone(value);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-bold text-white mb-2">完善您的資料</h2>
        <p className="text-sm text-gray-400">上傳文件讓AI自動填充，或手動填寫</p>
      </div>

      {/* AI 文件上傳 */}
      <div 
        className="p-5 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 bg-[#C9A96E]/5 text-center cursor-pointer hover:border-[#C9A96E]/60 transition-colors"
        onClick={onFileClick}
      >
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
            <p className="text-xs text-gray-500 mt-1">已自動填入 {Object.keys(parsedData.extractedInfo || {}).filter(k => parsedData.extractedInfo[k]).length} 項資料</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-[#C9A96E]" />
              <ImageIcon className="w-6 h-6 text-[#C9A96E]" />
              <FileAudio className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <p className="text-sm text-white font-medium mb-1">上傳文件 AI 自動解析</p>
            <p className="text-xs text-gray-500">PDF · Word · 圖片 · 語音</p>
          </>
        )}
        {parseError && <p className="text-xs text-red-400 mt-2">{parseError}</p>}
      </div>

      {/* 頭像上傳 */}
      <div className="flex flex-col items-center">
        <button
          onClick={onAvatarClick}
          className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-[#C9A96E]/30 flex items-center justify-center transition-all hover:border-[#C9A96E]"
          style={{ background: 'rgba(201,169,110,0.05)' }}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <Upload className="w-8 h-8 text-[#C9A96E]/50" />
          )}
        </button>
        <p className="text-xs text-gray-500 mt-2">點擊上傳頭像</p>
      </div>

      {/* 表單字段 - 修復：確保 onChange 正確綁定 */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs text-gray-400 mb-2">顯示名稱 *</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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
              type="text"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="+852 9123 4567"
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
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="香港"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            />
          </div>
        </div>

        {/* 語音輸入 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 flex items-center justify-between">
            <span>個人簡介</span>
            <button
              onClick={toggleRecording}
              type="button"
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
                isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#C9A96E]/10 text-[#C9A96E]'
              }`}
            >
              {isRecording ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              {isRecording ? '錄音中...' : '語音輸入'}
            </button>
          </label>
          <textarea
            value={bio || transcript}
            onChange={(e) => setBio(e.target.value)}
            placeholder="請介紹您的專業背景、核心技能和服務範圍..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50 resize-none"
          />
        </div>

        {/* 乙方字段 */}
        {userRole === 'B' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-2">專業技能（可多選）</label>
              <div className="flex flex-wrap gap-2">
                {SKILL_OPTIONS.map(skill => (
                  <button
                    key={skill.id}
                    type="button"
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
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(e.target.value)}
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
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  placeholder="20"
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
                />
              </div>
            </div>
          </>
        )}

        {/* 甲方字段 */}
        {userRole === 'A' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-2">企業名稱</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="您的公司名稱"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-400 mb-2">行業領域</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
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
                  value={companySize}
                  onChange={(e) => setCompanySize(e.target.value)}
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

      {/* 導航按钮 */}
      <div className="flex gap-3 pt-4">
        <button
          onClick={onBack}
          type="button"
          className="flex-1 py-3 rounded-xl text-sm text-gray-400 hover:text-white transition-colors border border-white/10"
        >
          返回
        </button>
        <button
          onClick={onNext}
          disabled={!displayName.trim()}
          type="button"
          className="flex-1 py-3 rounded-xl text-sm font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          下一步
        </button>
      </div>
    </div>
  );
});

// ============================================
// Step 3: 錢包創建 (獨立組件)
// ============================================
interface Step3Props {
  walletAddress: string | null;
  isGenerating: boolean;
  showSecret: boolean;
  setShowSecret: (v: boolean) => void;
  onGenerate: () => void;
  onComplete: () => void;
  onBack: () => void;
}

const Step3Wallet = memo(function Step3Wallet({
  walletAddress, isGenerating, showSecret, setShowSecret,
  onGenerate, onComplete, onBack
}: Step3Props) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <Wallet className="w-8 h-8 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">創建您的智慧錢包</h2>
        <p className="text-sm text-gray-400">去中心化存儲，您的數據僅由您掌控</p>
      </div>

      {!walletAddress ? (
        <div className="p-6 rounded-2xl text-center" style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-green-400" />
            <span className="text-sm text-gray-300">銀行級加密保護</span>
          </div>
          <ul className="text-left text-sm text-gray-400 space-y-2 mb-6">
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />您的資歷存儲於專屬加密節點</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />非經授權，平台亦無法讀取</li>
            <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-400" />支持導出至冷錢包</li>
          </ul>

          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 hover:opacity-90"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                正在生成安全密鑰...
              </span>
            ) : '創建我的智慧錢包'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-5 rounded-2xl" style={{ background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.2)' }}>
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
                  onClick={() => setShowSecret(!showSecret)}
                  className="text-xs text-yellow-500/60 hover:text-yellow-500"
                >
                  {showSecret ? '隱藏' : '顯示'}
                </button>
              </div>
              {showSecret ? (
                <p className="text-xs text-gray-400 font-mono">wisdom legacy vault secure blockchain future...</p>
              ) : (
                <p className="text-xs text-gray-600">•••• •••• •••• ••••</p>
              )}
            </div>
          </div>

          <button
            onClick={onComplete}
            className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] hover:opacity-90"
          >
            完成註冊，進入平台
          </button>
        </div>
      )}

      <button onClick={onBack} className="w-full py-3 text-sm text-gray-400 hover:text-white">
        返回修改資料
      </button>
    </div>
  );
});

// ============================================
// 主組件
// ============================================
export default function RegistrationWizard({ onComplete, onBack }: RegistrationWizardProps) {
  const [step, setStep] = useState(1);
  const [userRole, setUserRole] = useState<'A' | 'B' | null>(null);
  
  // 表單狀態
  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const [parseFileName, setParseFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showWalletSecret, setShowWalletSecret] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // 文件上傳處理 - 修復 AI 回填
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      alert('文件大小不能超过20MB');
      return;
    }

    setParseFileName(file.name);
    setParseError('');
    setIsParsing(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('userRole', userRole || 'neutral');

      const response = await fetch(`${API_BASE_URL}/api/parse/file`, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      
      if (result.success && result.data?.extractedInfo) {
        const info = result.data.extractedInfo;
        setParsedData(result.data);
        
        // 修復 AI 回填：確保正確設置每個欄位
        if (info.name && typeof info.name === 'string') {
          setDisplayName(info.name.trim());
        }
        if (info.phone && typeof info.phone === 'string') {
          setPhone(info.phone.trim());
        }
        if (info.location && typeof info.location === 'string') {
          setLocation(info.location.trim());
        }
        if (info.bio && typeof info.bio === 'string') {
          setBio(info.bio.trim());
        } else if (info.summary && typeof info.summary === 'string') {
          setBio(info.summary.trim());
        }
        if (info.company && typeof info.company === 'string') {
          setCompanyName(info.company.trim());
        }
        if (info.yearsExperience) {
          setYearsExperience(String(info.yearsExperience));
        }
      } else {
        throw new Error(result.error?.message || '解析结果为空');
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      setParseError(error.message || 'AI解析失敗，請手動填寫');
    } finally {
      setIsParsing(false);
    }
  };

  // 頭像上傳
  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('请上传图片文件');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过5MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // 語音輸入
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
          const text = event.results[0][0].transcript;
          setTranscript(text);
          setBio(text);
          setIsRecording(false);
        };
        
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        setTimeout(() => setIsRecording(false), 3000);
      }
    } else {
      setIsRecording(false);
    }
  };

  // 技能切換
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // 生成錢包
  const handleGenerateWallet = () => {
    setIsGeneratingWallet(true);
    setTimeout(() => {
      const address = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setWalletAddress(address);
      setIsGeneratingWallet(false);
    }, 1500);
  };

  // 完成註冊
  const handleComplete = () => {
    const userId = `user_${Date.now()}`;
    const userData = {
      id: userId,
      displayName,
      phone,
      location,
      bio,
      userRole,
      skills: selectedSkills,
      walletAddress,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('fac_user_profile', JSON.stringify(userData));
    localStorage.setItem('fac_user_logged_in', '1');
    onComplete?.();
  };

  // 步驟指示器
  const StepIndicator = () => {
    const steps = ['身份', '資料', '錢包'];
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {steps.map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          
          return (
            <div key={label} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                isActive ? 'bg-[#C9A96E] text-[#0A1628]' : 
                isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                'bg-white/5 text-gray-500'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNum}
              </div>
              <span className={`ml-2 text-xs ${isActive ? 'text-[#C9A96E]' : 'text-gray-500'}`}>{label}</span>
              {idx < steps.length - 1 && <div className="w-8 h-px bg-white/10 mx-2" />}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A1628] py-8 px-4">
      <div className="max-w-md mx-auto">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-400 hover:text-white mb-6">
          <ChevronLeft className="w-4 h-4" />
          返回首頁
        </button>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">FAC</h1>
          <p className="text-xs text-gray-500">V5.1-ALPHA · 智慧沈澱，在此相遇</p>
        </div>

        <StepIndicator />

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
          {/* 隱藏的文件輸入 */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp3,.wav,.m4a"
            onChange={handleFileUpload}
            className="hidden"
          />
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
          />

          {/* 條件渲染步驟 - 使用獨立組件避免重新掛載 */}
          {step === 1 && (
            <Step1SelectRole onSelect={(role) => { setUserRole(role); setStep(2); }} />
          )}
          
          {step === 2 && (
            <Step2Profile
              userRole={userRole}
              displayName={displayName}
              setDisplayName={setDisplayName}
              phone={phone}
              setPhone={setPhone}
              location={location}
              setLocation={setLocation}
              bio={bio}
              setBio={setBio}
              hourlyRate={hourlyRate}
              setHourlyRate={setHourlyRate}
              yearsExperience={yearsExperience}
              setYearsExperience={setYearsExperience}
              companyName={companyName}
              setCompanyName={setCompanyName}
              industry={industry}
              setIndustry={setIndustry}
              companySize={companySize}
              setCompanySize={setCompanySize}
              selectedSkills={selectedSkills}
              toggleSkill={toggleSkill}
              avatarPreview={avatarPreview}
              onAvatarClick={() => avatarInputRef.current?.click()}
              parseFileName={parseFileName}
              isParsing={isParsing}
              parseError={parseError}
              parsedData={parsedData}
              onFileClick={() => fileInputRef.current?.click()}
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              transcript={transcript}
              onNext={() => setStep(3)}
              onBack={() => setStep(1)}
            />
          )}
          
          {step === 3 && (
            <Step3Wallet
              walletAddress={walletAddress}
              isGenerating={isGeneratingWallet}
              showSecret={showWalletSecret}
              setShowSecret={setShowWalletSecret}
              onGenerate={handleGenerateWallet}
              onComplete={handleComplete}
              onBack={() => setStep(2)}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          FAC Platform V5.1-ALPHA · 數據持久化 · 身分清晰
        </p>
      </div>
    </div>
  );
}
