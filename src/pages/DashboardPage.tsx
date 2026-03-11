/**
 * FAC Platform V5.1 - Dashboard Page
 * 甲方(Party A) / 乙方(Party B) 双模式控制台
 * 核心机制：30% 订金托管 (Smart Escrow) + 非雇佣契约
 */

import { useState } from 'react';
import { useIdentity } from '../contexts/IdentityContext';
import { useWallet } from '../context/WalletContext';
import Navbar from '../sections/Navbar';
import Footer from '../sections/Footer';
import BottomNav from '../components/BottomNav';
import { 
  ArrowLeft, Search, Briefcase, Shield, Lock, 
  DollarSign, CheckCircle, Clock, User, AlertCircle,
  FileText, ChevronRight
} from 'lucide-react';
import type { Task, TaskStatus } from '../types/user';
import { DEPOSIT_RATE, NON_EMPLOYMENT_CLAUSE } from '../types/user';

type ViewMode = 'a' | 'b' | null;

function getViewFromUrl(): ViewMode {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const view = params.get('view');
  if (view === 'a') return 'a';
  if (view === 'b') return 'b';
  return null;
}

interface DashboardPageProps {
  view?: string | null;
  intent?: string | null;
}

// 模拟任务数据
const MOCK_TASKS: Task[] = [
  {
    id: 'task-001',
    partyAId: 'user-a-001',
    partyAMaskedName: '甲方 ***1',
    partyBId: 'user-b-001',
    partyBMaskedName: '乙方 ***2',
    title: 'ISO 9001 质量管理体系审核',
    description: '需要资深审核员对我司进行 ISO 9001 年度审核',
    requiredSkills: ['ISO 9001', '质量审核', '制造业'],
    totalAmount: 8000,
    depositAmount: 2400,
    platformFee: 50,
    status: 'in_progress',
    createdAt: '2025-03-01T10:00:00Z',
    publishedAt: '2025-03-01T10:30:00Z',
    depositLockedAt: '2025-03-02T09:00:00Z',
    startedAt: '2025-03-02T09:00:00Z',
  },
  {
    id: 'task-002',
    partyAId: 'user-a-001',
    partyAMaskedName: '甲方 ***1',
    title: '粤语同声传译服务',
    description: '商务会议需要粤语-英语同声传译，约 4 小时',
    requiredSkills: ['同声传译', '粤语', '英语', '商务'],
    totalAmount: 5000,
    depositAmount: 1500,
    platformFee: 50,
    status: 'published',
    createdAt: '2025-03-05T14:00:00Z',
    publishedAt: '2025-03-05T14:30:00Z',
  }
];

const STATUS_LABELS: Record<TaskStatus, { label: string; color: string; bg: string }> = {
  draft: { label: '草稿', color: 'rgba(237,232,223,0.5)', bg: 'rgba(255,255,255,0.05)' },
  published: { label: '已发布', color: '#64B5F6', bg: 'rgba(33,150,243,0.1)' },
  matched: { label: '已匹配', color: '#81C784', bg: 'rgba(76,175,80,0.1)' },
  deposit_locked: { label: '订金已托管', color: '#C9A96E', bg: 'rgba(201,169,110,0.1)' },
  in_progress: { label: '进行中', color: '#64B5F6', bg: 'rgba(33,150,243,0.1)' },
  delivered: { label: '已交付', color: '#81C784', bg: 'rgba(76,175,80,0.1)' },
  completed: { label: '已完成', color: '#4CAF7D', bg: 'rgba(76,175,80,0.15)' },
  disputed: { label: '争议中', color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  cancelled: { label: '已取消', color: 'rgba(237,232,223,0.4)', bg: 'rgba(255,255,255,0.05)' },
};

export default function DashboardPage({ view: viewProp, intent }: DashboardPageProps) {
  const { identityContext, getIdentityLabel, getIdentityDescription, switchToA, switchToB } = useIdentity();
  const { facBalance } = useWallet();
  const viewFromUrl = getViewFromUrl();
  const view: ViewMode = viewProp === 'a' || viewFromUrl === 'a' ? 'a' : viewProp === 'b' || viewFromUrl === 'b' ? 'b' : null;
  const effectiveView: 'a' | 'b' | 'neutral' = view === 'a' ? 'a' : view === 'b' ? 'b' : 'neutral';
  
  const [showEscrowInfo, setShowEscrowInfo] = useState(false);
  const [showNonEmployment, setShowNonEmployment] = useState(false);

  const goHome = () => {
    window.location.href = '/';
  };

  const goToView = (v: 'a' | 'b') => {
    if (v === 'a') switchToA();
    else switchToB();
    window.location.href = `/dashboard?view=${v}`;
  };

  // 30% 订金计算示例
  const sampleAmount = 10000;
  const sampleDeposit = sampleAmount * DEPOSIT_RATE;
  const samplePlatformFee = 50;
  const sampleProviderReceive = sampleAmount - samplePlatformFee;

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <main className="relative pt-24 pb-20 md:pb-0 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2 text-sm mb-8 transition-colors hover:opacity-90"
            style={{ color: 'rgba(201,169,110,0.9)' }}
          >
            <ArrowLeft className="w-4 h-4" />
            返回首页
          </button>

          {effectiveView === 'neutral' && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">选择您的身份</h1>
                <p className="text-gray-400 text-sm">V5.1 采用甲乙双方模式，同一账号可在两种身份间自由切换</p>
              </div>

              {/* Smart Escrow 机制说明 */}
              <div 
                className="rounded-2xl p-5 mb-6 border"
                style={{ 
                  background: 'rgba(201,169,110,0.05)', 
                  borderColor: 'rgba(201,169,110,0.2)' 
                }}
              >
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#C9A96E' }} />
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-1">30% 订金托管机制</h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      平台采用 Smart Escrow 保障双方权益。甲方确认合作时锁定 30% 订金，
                      乙方看到订金锁定后才启动工作。非雇佣契约框架，甲方不承担雇主法律义务。
                    </p>
                    <button 
                      onClick={() => setShowEscrowInfo(!showEscrowInfo)}
                      className="text-xs flex items-center gap-1"
                      style={{ color: '#C9A96E' }}
                    >
                      查看计算示例
                      <ChevronRight className={`w-3 h-3 transition-transform ${showEscrowInfo ? 'rotate-90' : ''}`} />
                    </button>
                  </div>
                </div>

                {showEscrowInfo && (
                  <div 
                    className="mt-4 pt-4 grid grid-cols-3 gap-3"
                    style={{ borderTop: '1px solid rgba(201,169,110,0.1)' }}
                  >
                    <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <p className="text-xs text-gray-500 mb-1">项目总额</p>
                      <p className="text-sm font-semibold text-white">HKD {sampleAmount.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(201,169,110,0.08)' }}>
                      <p className="text-xs text-gray-500 mb-1">30% 订金托管</p>
                      <p className="text-sm font-semibold" style={{ color: '#C9A96E' }}>HKD {sampleDeposit.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(76,175,80,0.08)' }}>
                      <p className="text-xs text-gray-500 mb-1">乙方实得 (零佣金)</p>
                      <p className="text-sm font-semibold text-green-400">HKD {sampleProviderReceive.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-500">仅扣除平台维护费 HKD {samplePlatformFee}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Party A Card */}
                <button
                  type="button"
                  onClick={() => goToView('a')}
                  className="rounded-2xl p-8 text-left transition-all hover:scale-[1.02] border group"
                  style={{
                    background: 'linear-gradient(145deg, rgba(33,150,243,0.08) 0%, rgba(10,22,40,0.98) 100%)',
                    borderColor: 'rgba(33,150,243,0.3)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: 'rgba(33,150,243,0.15)' }}
                    >
                      <Search className="w-7 h-7" style={{ color: '#64B5F6' }} />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-white">甲方 (Party A)</span>
                      <span 
                        className="block text-xs"
                        style={{ color: 'rgba(100,181,246,0.7)' }}
                      >
                        需求方
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">发布任务、寻找解决方案的专业服务采购方</p>
                  <div className="space-y-2">
                    {['发布意图', '锁定 30% 订金', '验收交付'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 text-xs text-gray-500">
                        <span 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                          style={{ background: 'rgba(33,150,243,0.15)', color: '#64B5F6' }}
                        >
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </button>

                {/* Party B Card */}
                <button
                  type="button"
                  onClick={() => goToView('b')}
                  className="rounded-2xl p-8 text-left transition-all hover:scale-[1.02] border group"
                  style={{
                    background: 'linear-gradient(145deg, rgba(76,175,80,0.08) 0%, rgba(10,22,40,0.98) 100%)',
                    borderColor: 'rgba(76,175,80,0.3)',
                  }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="w-14 h-14 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
                      style={{ background: 'rgba(76,175,80,0.15)' }}
                    >
                      <Briefcase className="w-7 h-7" style={{ color: '#81C784' }} />
                    </div>
                    <div>
                      <span className="text-lg font-semibold text-white">乙方 (Party B)</span>
                      <span 
                        className="block text-xs"
                        style={{ color: 'rgba(129,199,132,0.7)' }}
                      >
                        提供方
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-4">具备专业特长的能者（退休专家、银发族、Freelancer）</p>
                  <div className="space-y-2">
                    {['维护能力矩阵', '接收邀约', '授权隐私 → 执行获酬'].map((step, i) => (
                      <div key={step} className="flex items-center gap-2 text-xs text-gray-500">
                        <span 
                          className="w-5 h-5 rounded-full flex items-center justify-center text-[10px]"
                          style={{ background: 'rgba(76,175,80,0.15)', color: '#81C784' }}
                        >
                          {i + 1}
                        </span>
                        {step}
                      </div>
                    ))}
                  </div>
                </button>
              </div>

              {/* 非雇佣契约声明 */}
              <div 
                className="mt-6 rounded-2xl border overflow-hidden"
                style={{ borderColor: 'rgba(255,255,255,0.1)' }}
              >
                <button
                  onClick={() => setShowNonEmployment(!showNonEmployment)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  style={{ background: 'rgba(255,255,255,0.02)' }}
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" style={{ color: 'rgba(237,232,223,0.5)' }} />
                    <span className="text-sm" style={{ color: 'rgba(237,232,223,0.6)' }}>
                      非雇佣契约框架 (Non-Employment)
                    </span>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform ${showNonEmployment ? 'rotate-90' : ''}`}
                    style={{ color: 'rgba(237,232,223,0.4)' }}
                  />
                </button>
                {showNonEmployment && (
                  <div 
                    className="px-5 py-4 text-xs leading-relaxed"
                    style={{ 
                      background: 'rgba(255,255,255,0.01)',
                      color: 'rgba(237,232,223,0.5)',
                      borderTop: '1px solid rgba(255,255,255,0.05)'
                    }}
                  >
                    {NON_EMPLOYMENT_CLAUSE}
                  </div>
                )}
              </div>
            </>
          )}

          {effectiveView === 'a' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(33,150,243,0.15)' }}
                >
                  <Search className="w-5 h-5" style={{ color: '#64B5F6' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">甲方控制台</h1>
                  <p className="text-sm text-gray-400">发布委托，寻找专业乙方</p>
                </div>
              </div>

              {/* 快速操作 */}
              <div className="grid grid-cols-2 gap-4 mt-6 mb-8">
                <button 
                  className="p-4 rounded-xl border text-left transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(33,150,243,0.3)' }}
                >
                  <PlusIcon className="w-5 h-5 mb-2" style={{ color: '#64B5F6' }} />
                  <span className="text-sm text-white block">发布新委托</span>
                  <span className="text-xs text-gray-500">创建任务需求</span>
                </button>
                <button 
                  className="p-4 rounded-xl border text-left transition-all hover:bg-white/5"
                  style={{ borderColor: 'rgba(201,169,110,0.2)' }}
                >
                  <DollarSign className="w-5 h-5 mb-2" style={{ color: '#C9A96E' }} />
                  <span className="text-sm text-white block">托管资金</span>
                  <span className="text-xs text-gray-500">管理 30% 订金</span>
                </button>
              </div>

              {/* 我的委托列表 */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(237,232,223,0.5)' }}>
                  我的委托
                </h2>
                {MOCK_TASKS.filter(t => t.partyAId === 'user-a-001').map(task => (
                  <TaskCard key={task.id} task={task} role="a" />
                ))}
              </div>
            </>
          )}

          {effectiveView === 'b' && (
            <>
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(76,175,80,0.15)' }}
                >
                  <Briefcase className="w-5 h-5" style={{ color: '#81C784' }} />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">乙方控制台</h1>
                  <p className="text-sm text-gray-400">维护能力矩阵，接收委托邀约</p>
                </div>
              </div>

              {/* 能力矩阵概览 */}
              <div 
                className="mt-6 p-5 rounded-2xl border mb-6"
                style={{ borderColor: 'rgba(76,175,80,0.2)', background: 'rgba(76,175,80,0.03)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-semibold text-white">原子化能力矩阵</h2>
                  <button 
                    className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(76,175,80,0.15)', color: '#81C784' }}
                  >
                    编辑能力标签
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['ISO 9001 审核', '遗嘱规划', '粤语同传', '跨境贸易合规', '企业管理咨询'].map(skill => (
                    <span 
                      key={skill}
                      className="text-xs px-3 py-1.5 rounded-full"
                      style={{ 
                        background: 'rgba(76,175,80,0.1)', 
                        border: '1px solid rgba(76,175,80,0.2)',
                        color: '#81C784' 
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                  <span 
                    className="text-xs px-3 py-1.5 rounded-full cursor-pointer hover:bg-white/10"
                    style={{ 
                      background: 'rgba(255,255,255,0.05)', 
                      border: '1px dashed rgba(255,255,255,0.2)',
                      color: 'rgba(237,232,223,0.5)' 
                    }}
                  >
                    + 添加能力
                  </span>
                </div>
              </div>

              {/* 可承接的委托 */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'rgba(237,232,223,0.5)' }}>
                  可承接的委托
                </h2>
                {MOCK_TASKS.filter(t => t.status === 'published').map(task => (
                  <TaskCard key={task.id} task={task} role="b" />
                ))}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

// 任务卡片组件
function TaskCard({ task, role }: { task: Task; role: 'a' | 'b' }) {
  const status = STATUS_LABELS[task.status];
  
  return (
    <div 
      className="p-5 rounded-2xl border transition-all hover:bg-white/[0.02]"
      style={{ borderColor: 'rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span 
              className="text-xs px-2.5 py-0.5 rounded-full"
              style={{ background: status.bg, color: status.color }}
            >
              {status.label}
            </span>
            {task.status === 'deposit_locked' && (
              <Lock className="w-3 h-3" style={{ color: '#C9A96E' }} />
            )}
          </div>
          <h3 className="text-white font-medium mb-1">{task.title}</h3>
          <p className="text-xs text-gray-500 mb-3 line-clamp-2">{task.description}</p>
          
          <div className="flex flex-wrap gap-1.5 mb-3">
            {task.requiredSkills.map(skill => (
              <span 
                key={skill}
                className="text-[10px] px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(237,232,223,0.5)' }}
              >
                {skill}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span style={{ color: 'rgba(237,232,223,0.6)' }}>
              总额: <strong className="text-white">HKD {task.totalAmount.toLocaleString()}</strong>
            </span>
            {task.depositLockedAt && (
              <span style={{ color: '#C9A96E' }}>
                已托管: HKD {task.depositAmount.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          {role === 'a' ? (
            <button 
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(33,150,243,0.15)', color: '#64B5F6' }}
            >
              查看详情
            </button>
          ) : (
            <button 
              className="text-xs px-3 py-2 rounded-lg"
              style={{ background: 'rgba(76,175,80,0.15)', color: '#81C784' }}
            >
              申请承接
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PlusIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );
}
