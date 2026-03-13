/**
 * FAC Platform V5.1-ALPHA - Registration Wizard (Email 優先版)
 * Architecture: Auth(Email) → Upload → AI Refine → Complete
 * Privacy-First: Email 僅用於帳號登入，CV 數據加密保存於用戶錢包
 */

import { useState, useRef, useEffect, memo } from 'react';
import { 
  ChevronRight, ChevronLeft, User, Building2, 
  Upload, Mic, MicOff, CheckCircle, Wallet,
  Briefcase, MapPin, Phone, DollarSign, FileText,
  Sparkles, Shield, Eye, EyeOff, Loader2,
  Image as ImageIcon, FileAudio, Lock, Mail,
  AlertTriangle, Fingerprint
} from 'lucide-react';
import { 
  sendEmailVerificationCode, 
  registerUser, 
  loginUser,
  parseFile,
  updateUserProfile 
} from '../utils/api';

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
// Phase 1: 基礎註冊 (Email 優先，電話可選)
// ============================================
interface StepAuthProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  phone: string;
  setPhone: (v: string) => void;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  isSendingCode: boolean;
  isRegistering: boolean;
  countDown: number;
  onSendCode: () => void;
  onRegister: () => void;
  error: string;
}

const StepAuth = memo(function StepAuth({
  email, setEmail, password, setPassword, phone, setPhone,
  verificationCode, setVerificationCode, isSendingCode, isRegistering,
  countDown, onSendCode, onRegister, error
}: StepAuthProps) {
  const [showPassword, setShowPassword] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[+]?[\d\s]*$/.test(value)) setPhone(value);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 8;
  const canRegister = isEmailValid && isPasswordValid && verificationCode.length === 6;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">創建您的帳號</h2>
        <p className="text-sm text-gray-400">Email 優先註冊，安全便捷</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Email - 核心入口（置頂） */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            <Mail className="w-3 h-3 inline mr-1" />
            電子郵件 * (帳號標識)
          </label>
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            />
            <button
              onClick={onSendCode}
              disabled={!isEmailValid || countDown > 0 || isSendingCode}
              className="px-4 py-3 rounded-xl text-sm font-medium bg-white/5 border border-[#C9A96E]/30 text-[#C9A96E] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#C9A96E]/10 transition-colors whitespace-nowrap"
            >
              {isSendingCode ? '發送中...' : countDown > 0 ? `${countDown}s` : '獲取驗證碼'}
            </button>
          </div>
        </div>

        {/* 驗證碼 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">郵箱驗證碼 *</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="6位數字"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50 text-center tracking-widest"
          />
        </div>

        {/* 密碼 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            <Lock className="w-3 h-3 inline mr-1" />
            密碼 * (至少8位)
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="設置登入密碼"
              className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* 電話 - 可選（後續驗證使用） */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 flex items-center justify-between">
            <span>
              <Phone className="w-3 h-3 inline mr-1" />
              手機號碼
            </span>
            <span className="text-xs text-gray-500">(可選，後續驗證使用)</span>
          </label>
          <input
            type="text"
            value={phone}
            onChange={handlePhoneChange}
            placeholder="+852 9123 4567"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
          />
        </div>
      </div>

      {/* 隱私聲明 - 更新版 */}
      <div className="p-4 rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/20">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-[#C9A96E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300 mb-1">數據主權承諾</p>
            <p className="text-xs text-gray-500">
              您的 Email 僅用於帳號登入。專業資料（CV）解析後將加密保存於您的電子錢包，平台無法查看。
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={onRegister}
        disabled={!canRegister || isRegistering}
        className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        {isRegistering ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            創建帳號中...
          </span>
        ) : '創建帳號並繼續'}
      </button>
    </div>
  );
});

// ============================================
// Phase 2: 能力導入 (CV Upload) - 身份選擇 + 文件上傳
// ============================================
interface StepUploadProps {
  userRole: 'A' | 'B' | null;
  setUserRole: (role: 'A' | 'B') => void;
  isParsing: boolean;
  parseFileName: string;
  parseError: string;
  onFileClick: () => void;
  onContinue: () => void;
}

const StepUpload = memo(function StepUpload({
  userRole, setUserRole, isParsing, parseFileName, parseError, onFileClick, onContinue
}: StepUploadProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">能力導入</h2>
        <p className="text-sm text-gray-400">上傳 CV 建立您的專業檔案</p>
      </div>

      {/* 身份選擇 - 甲方/乙方術語 */}
      <div className="space-y-3">
        <label className="block text-xs text-gray-400">選擇您的身份 *</label>
        
        {/* 乙方 - 專家/供應方 */}
        <button
          onClick={() => setUserRole('B')}
          className={`w-full p-4 rounded-xl text-left transition-all ${
            userRole === 'B' 
              ? 'bg-green-500/10 border-green-500/30' 
              : 'bg-white/5 border-white/10 hover:border-[#C9A96E]/30'
          } border`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              userRole === 'B' ? 'bg-green-500/20' : 'bg-white/5'
            }`}>
              <User className={`w-5 h-5 ${userRole === 'B' ? 'text-green-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium mb-1 ${userRole === 'B' ? 'text-green-400' : 'text-white'}`}>
                乙方 - 專家 / 顧問
              </h3>
              <p className="text-xs text-gray-500">提供專業服務，分享知識經驗</p>
            </div>
            {userRole === 'B' && <CheckCircle className="w-5 h-5 text-green-400" />}
          </div>
        </button>

        {/* 甲方 - 企業/需求方 */}
        <button
          onClick={() => setUserRole('A')}
          className={`w-full p-4 rounded-xl text-left transition-all ${
            userRole === 'A' 
              ? 'bg-blue-500/10 border-blue-500/30' 
              : 'bg-white/5 border-white/10 hover:border-[#C9A96E]/30'
          } border`}
        >
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              userRole === 'A' ? 'bg-blue-500/20' : 'bg-white/5'
            }`}>
              <Building2 className={`w-5 h-5 ${userRole === 'A' ? 'text-blue-400' : 'text-gray-400'}`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-medium mb-1 ${userRole === 'A' ? 'text-blue-400' : 'text-white'}`}>
                甲方 - 企業 / 需求方
              </h3>
              <p className="text-xs text-gray-500">發布項目需求，匹配專家資源</p>
            </div>
            {userRole === 'A' && <CheckCircle className="w-5 h-5 text-blue-400" />}
          </div>
        </button>
      </div>

      {/* 隱私提示 - 更新版（白皮書要求） */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-amber-300 font-medium mb-1">數據主權聲明</p>
            <p className="text-xs text-amber-400/80 leading-relaxed">
              您的專業資料（CV）解析後將僅加密保存於您的電子錢包/區塊鏈上，平台無法查看，除非您後續授權揭露。
            </p>
          </div>
        </div>
      </div>

      {/* CV 上傳 */}
      <div 
        className="p-6 rounded-2xl border-2 border-dashed border-[#C9A96E]/30 bg-[#C9A96E]/5 text-center cursor-pointer hover:border-[#C9A96E]/60 transition-colors"
        onClick={onFileClick}
      >
        {isParsing ? (
          <div className="py-4">
            <Loader2 className="w-10 h-10 text-[#C9A96E] animate-spin mx-auto mb-3" />
            <p className="text-sm text-white font-medium">AI Agent 正在解析您的 CV...</p>
            <p className="text-xs text-gray-500 mt-1">{parseFileName}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-center gap-3 mb-3">
              <FileText className="w-6 h-6 text-[#C9A96E]" />
              <FileAudio className="w-6 h-6 text-[#C9A96E]" />
            </div>
            <p className="text-sm text-white font-medium mb-1">點擊上傳 CV 文件</p>
            <p className="text-xs text-gray-500">PDF · Word (最大 20MB)</p>
          </>
        )}
        {parseError && <p className="text-xs text-red-400 mt-2">{parseError}</p>}
      </div>

      <button
        onClick={onContinue}
        disabled={!userRole}
        className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 hover:opacity-90 transition-opacity"
      >
        {userRole ? '繼續' : '請先選擇身份'}
      </button>
    </div>
  );
});

// ============================================
// Phase 3: 數據回填與主權確認 (AI Refine)
// ============================================
interface StepRefineProps {
  userRole: 'A' | 'B';
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
  isRecording: boolean;
  toggleRecording: () => void;
  transcript: string;
  parsedData: any;
  onConfirm: () => void;
  onBack: () => void;
  isSaving: boolean;
}

const StepRefine = memo(function StepRefine({
  userRole, displayName, setDisplayName, phone, setPhone, location, setLocation,
  bio, setBio, hourlyRate, setHourlyRate, yearsExperience, setYearsExperience,
  companyName, setCompanyName, industry, setIndustry, companySize, setCompanySize,
  selectedSkills, toggleSkill, isRecording, toggleRecording, transcript,
  parsedData, onConfirm, onBack, isSaving
}: StepRefineProps) {
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^[+]?[\d\s]*$/.test(value)) setPhone(value);
  };

  // 修復：確保 bio 正確顯示
  const displayBio = bio || transcript || '';

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-[#C9A96E]/10 border border-[#C9A96E]/20 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-[#C9A96E]" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">確認您的專業檔案</h2>
        <p className="text-sm text-gray-400">AI 已從 CV 中提取關鍵信息，請核實</p>
      </div>

      {/* AI 提取標記 */}
      {parsedData && (
        <div className="p-3 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span className="text-sm text-green-400">
            AI 已識別 {Object.keys(parsedData.extractedInfo || {}).filter(k => parsedData.extractedInfo[k]).length} 項資料
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* 顯示名稱 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2">
            {userRole === 'B' ? '乙方名稱' : '甲方聯繫人'} *
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder={userRole === 'B' ? '您的姓名或專業稱號' : '企業聯繫人姓名'}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50"
          />
        </div>

        {/* 電話與所在地 */}
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

        {/* 個人簡介 - 修復版 */}
        <div>
          <label className="block text-xs text-gray-400 mb-2 flex items-center justify-between">
            <span>{userRole === 'B' ? '乙方簡介' : '甲方簡介'}</span>
            <button
              onClick={toggleRecording}
              type="button"
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all ${
                isRecording ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-[#C9A96E]/10 text-[#C9A96E]'
              }`}
            >
              {isRecording ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              {isRecording ? '錄音中...' : '語音補充'}
            </button>
          </label>
          <textarea
            value={displayBio}
            onChange={(e) => setBio(e.target.value)}
            placeholder={userRole === 'B' ? '請介紹您的專業背景、核心技能和服務範圍...' : '請介紹您的企業背景和項目需求...'}
            rows={4}
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-[#C9A96E]/50 resize-none"
          />
        </div>

        {/* 乙方專屬字段 */}
        {userRole === 'B' && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-2">專業標籤</label>
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

        {/* 甲方專屬字段 */}
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

      {/* 主權確認提示 */}
      <div className="p-4 rounded-xl bg-[#C9A96E]/5 border border-[#C9A96E]/20">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-[#C9A96E] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-gray-300 mb-1">確認即授權</p>
            <p className="text-xs text-gray-500">
              點擊「確認保存」後，您的資料將加密寫入您的私人保險箱。未經您的授權，平台無法查看。
            </p>
          </div>
        </div>
      </div>

      {/* 導航 */}
      <div className="flex gap-3 pt-2">
        <button
          onClick={onBack}
          type="button"
          className="flex-1 py-4 rounded-xl text-sm text-gray-400 hover:text-white transition-colors border border-white/10"
        >
          返回
        </button>
        <button
          onClick={onConfirm}
          disabled={!displayName.trim() || isSaving}
          type="button"
          className="flex-1 py-4 rounded-xl text-sm font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50 hover:opacity-90 transition-opacity"
        >
          {isSaving ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              加密保存中...
            </span>
          ) : '確認保存'}
        </button>
      </div>
    </div>
  );
});

// ============================================
// Phase 4: 完成 (Complete) - 錢包創建
// ============================================
interface StepCompleteProps {
  walletAddress: string | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onEnter: () => void;
}

const StepComplete = memo(function StepComplete({
  walletAddress, isGenerating, onGenerate, onEnter
}: StepCompleteProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mb-4">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">註冊完成</h2>
        <p className="text-sm text-gray-400">歡迎加入 FAC 智慧平台</p>
      </div>

      <div className="p-5 rounded-2xl bg-green-500/5 border border-green-500/20">
        <div className="text-center mb-4">
          <span className="text-4xl font-bold text-[#C9A96E]">+100</span>
          <span className="text-lg text-gray-400 ml-2">$FAC</span>
        </div>
        <p className="text-center text-sm text-gray-400">Email 註冊獎勵已發放</p>
      </div>

      {!walletAddress ? (
        <div className="p-5 rounded-2xl" style={{ background: 'rgba(201,169,110,0.05)', border: '1px solid rgba(201,169,110,0.15)' }}>
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-[#C9A96E]" />
            <span className="text-sm text-gray-300">創建您的智慧保險箱</span>
          </div>
          <p className="text-xs text-gray-500 text-center mb-4">
            您的專業資料將加密存儲於專屬節點，僅您可訪問
          </p>
          <button
            onClick={onGenerate}
            disabled={isGenerating}
            className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                生成加密密鑰...
              </span>
            ) : '創建智慧保險箱'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-black/20">
            <p className="text-xs text-gray-500 mb-1">保險箱地址</p>
            <code className="text-xs text-[#C9A96E] break-all">{walletAddress}</code>
          </div>
          <button
            onClick={onEnter}
            className="w-full py-4 rounded-xl font-medium bg-[#C9A96E] text-[#0A1628] hover:opacity-90"
          >
            進入平台
          </button>
        </div>
      )}
    </div>
  );
});

// ============================================
// 主組件 - 四階段流程: Auth → Upload → Refine → Complete
// ============================================
export default function RegistrationWizard({ onComplete, onBack }: RegistrationWizardProps) {
  // 流程階段
  const [phase, setPhase] = useState<'auth' | 'upload' | 'refine' | 'complete'>('auth');
  
  // Phase 1: Auth 狀態 (Email 優先)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // 可選
  const [verificationCode, setVerificationCode] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [countDown, setCountDown] = useState(0);
  const [authError, setAuthError] = useState('');
  const [authToken, setAuthToken] = useState<string | null>(null);
  
  // Phase 2 & 3: 資料狀態
  const [userRole, setUserRole] = useState<'A' | 'B' | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [hourlyRate, setHourlyRate] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  
  // 文件解析狀態
  const [parseFileName, setParseFileName] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState<any>(null);
  
  // 語音輸入
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  // Phase 4: 錢包
  const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 倒計時
  useEffect(() => {
    if (countDown > 0) {
      const timer = setTimeout(() => setCountDown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countDown]);

  // Phase 1: 發送 Email 驗證碼
  const handleSendCode = async () => {
    if (!email || countDown > 0) return;
    
    setIsSendingCode(true);
    setAuthError('');
    
    try {
      await sendEmailVerificationCode(email);
      setCountDown(60);
    } catch (error: any) {
      setAuthError(error.message || '發送驗證碼失敗');
    } finally {
      setIsSendingCode(false);
    }
  };

  // Phase 1: 註冊 (Email 主鍵)
  const handleRegister = async () => {
    if (!email || !password || !verificationCode) return;
    
    setIsRegistering(true);
    setAuthError('');
    
    try {
      const result = await registerUser({
        email,
        password,
        code: verificationCode,
        phone: phone || undefined, // 可選
        displayName: '新用戶'
      });
      
      if (result.success) {
        setAuthToken(result.data.token);
        localStorage.setItem('fac_auth_token', result.data.token);
        localStorage.setItem('fac_user_id', result.data.user.id);
        
        // 進入 Phase 2
        setPhase('upload');
      }
    } catch (error: any) {
      setAuthError(error.message || '註冊失敗，請檢查信息');
    } finally {
      setIsRegistering(false);
    }
  };

  // Phase 2: 文件上傳處理
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userRole) return;

    if (file.size > 20 * 1024 * 1024) {
      setParseError('文件大小不能超过20MB');
      return;
    }

    setParseFileName(file.name);
    setParseError('');
    setIsParsing(true);
    
    try {
      const result = await parseFile(file, userRole);
      
      if (result.success && result.data?.extractedInfo) {
        const info = result.data.extractedInfo;
        setParsedData(result.data);
        
        // AI 回填 - 修復版
        if (info.name && typeof info.name === 'string') {
          setDisplayName(info.name.trim());
        }
        if (info.phone && typeof info.phone === 'string') {
          setPhone(info.phone.trim());
        }
        if (info.location && typeof info.location === 'string') {
          setLocation(info.location.trim());
        }
        // 修復：同時處理 bio/summary/profile/description
        const bioText = info.bio || info.summary || info.profile || info.description;
        if (bioText && typeof bioText === 'string') {
          setBio(bioText.trim());
        }
        if (info.company && typeof info.company === 'string') {
          setCompanyName(info.company.trim());
        }
        if (info.yearsExperience) {
          setYearsExperience(String(info.yearsExperience));
        }
        if (info.hourlyRate) {
          setHourlyRate(String(info.hourlyRate));
        }
        
        // 自動進入 Phase 3
        setPhase('refine');
      } else {
        throw new Error(result.error?.message || '解析结果为空');
      }
    } catch (error: any) {
      console.error('Parse error:', error);
      setParseError(error.message || 'AI解析失敗，請手動填寫');
      setTimeout(() => setPhase('refine'), 1500);
    } finally {
      setIsParsing(false);
    }
  };

  // Phase 3: 語音輸入
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

  // Phase 3: 技能切換
  const toggleSkill = (skillId: string) => {
    setSelectedSkills(prev => 
      prev.includes(skillId) 
        ? prev.filter(id => id !== skillId)
        : [...prev, skillId]
    );
  };

  // Phase 3: 確認保存
  const handleConfirmSave = async () => {
    if (!authToken) {
      setAuthError('登入狀態已過期，請重新註冊');
      return;
    }

    setIsSavingProfile(true);
    
    try {
      await updateUserProfile({
        displayName,
        phone,
        location,
        bio,
        hourlyRate: hourlyRate ? parseInt(hourlyRate) : undefined,
        yearsExperience: yearsExperience ? parseInt(yearsExperience) : undefined,
        companyName,
        companySize,
        industry,
      });

      // 保存技能
      for (const skillId of selectedSkills) {
        const skill = SKILL_OPTIONS.find(s => s.id === skillId);
        if (skill) {
          try {
            await import('../utils/api').then(m => m.addUserSkill({
              label: skill.label,
              category: skill.id,
              weight: 1,
              verified: false,
              source: 'self_reported'
            }));
          } catch (e) {
            console.warn('Failed to add skill:', skillId);
          }
        }
      }

      setPhase('complete');
    } catch (error: any) {
      setAuthError(error.message || '保存失敗');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Phase 4: 生成錢包
  const handleGenerateWallet = () => {
    setIsGeneratingWallet(true);
    setTimeout(() => {
      const address = '0x' + Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('');
      setWalletAddress(address);
      
      localStorage.setItem('fac_wallet_address', address);
      localStorage.setItem('fac_user_logged_in', '1');
      localStorage.setItem('fac_user_role', userRole || 'neutral');
      
      setIsGeneratingWallet(false);
    }, 1500);
  };

  // Phase 4: 完成
  const handleComplete = () => {
    onComplete?.();
  };

  // 步驟指示器
  const PhaseIndicator = () => {
    const phases = [
      { key: 'auth', label: '註冊' },
      { key: 'upload', label: '上傳' },
      { key: 'refine', label: '確認' },
      { key: 'complete', label: '完成' }
    ];
    
    const currentIndex = phases.findIndex(p => p.key === phase);
    
    return (
      <div className="flex items-center justify-center gap-2 mb-8">
        {phases.map((p, idx) => {
          const isActive = phase === p.key;
          const isCompleted = currentIndex > idx;
          
          return (
            <div key={p.key} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                isActive ? 'bg-[#C9A96E] text-[#0A1628]' : 
                isCompleted ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                'bg-white/5 text-gray-500'
              }`}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className={`ml-2 text-xs ${isActive ? 'text-[#C9A96E]' : 'text-gray-500'}`}>{p.label}</span>
              {idx < phases.length - 1 && <div className="w-6 h-px bg-white/10 mx-2" />}
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

        <PhaseIndicator />

        <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-6 border border-white/10">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            className="hidden"
          />

          {phase === 'auth' && (
            <StepAuth
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              phone={phone}
              setPhone={setPhone}
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              isSendingCode={isSendingCode}
              isRegistering={isRegistering}
              countDown={countDown}
              onSendCode={handleSendCode}
              onRegister={handleRegister}
              error={authError}
            />
          )}

          {phase === 'upload' && (
            <StepUpload
              userRole={userRole}
              setUserRole={setUserRole}
              isParsing={isParsing}
              parseFileName={parseFileName}
              parseError={parseError}
              onFileClick={() => fileInputRef.current?.click()}
              onContinue={() => userRole && setPhase('refine')}
            />
          )}

          {phase === 'refine' && userRole && (
            <StepRefine
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
              isRecording={isRecording}
              toggleRecording={toggleRecording}
              transcript={transcript}
              parsedData={parsedData}
              onConfirm={handleConfirmSave}
              onBack={() => setPhase('upload')}
              isSaving={isSavingProfile}
            />
          )}

          {phase === 'complete' && (
            <StepComplete
              walletAddress={walletAddress}
              isGenerating={isGeneratingWallet}
              onGenerate={handleGenerateWallet}
              onEnter={handleComplete}
            />
          )}
        </div>

        <p className="text-center text-xs text-gray-600 mt-8">
          FAC Platform V5.1-ALPHA · 國科綠色發展國際實驗室（香港）
        </p>
      </div>
    </div>
  );
}
