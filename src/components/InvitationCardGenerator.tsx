/**
 * FAC Platform V5.1 - Black Gold Invitation Card Generator
 * 电子邀请函系统：午夜蓝磨砂背景 + 亮香槟金双边框 + 四角钻石装饰
 * P1 优先级功能
 */

import { useState, useRef, useCallback } from 'react';
import { Download, Sparkles, Crown, X, Loader2 } from 'lucide-react';
import { useInvitation } from '../contexts/InvitationContext';

// ==================== Types ====================

interface InvitationCardGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userTier?: 'basic' | 'professional' | 'executive';
}

interface GeneratedCard {
  code: string;
  dataUrl: string;
}

// ==================== Constants ====================

const CARD_WIDTH = 900;
const CARD_HEIGHT = 500;

// ==================== Component ====================

export default function InvitationCardGenerator({
  isOpen,
  onClose,
  userName: _userName = 'FAC Member',
  userTier = 'executive'
}: InvitationCardGeneratorProps) {
  const { generateInviteCode } = useInvitation();
  const [generatedCard, setGeneratedCard] = useState<GeneratedCard | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Generate unique invitation code
  const generateCode = useCallback(() => {
    const invitation = generateInviteCode('current_user', 20);
    return invitation.code;
  }, [generateInviteCode]);

  // Draw the invitation card on canvas
  const drawCard = useCallback((code: string): string => {
    const canvas = canvasRef.current;
    if (!canvas) return '';

    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size
    canvas.width = CARD_WIDTH;
    canvas.height = CARD_HEIGHT;

    // Clear canvas
    ctx.fillStyle = '#0A1628';
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Draw midnight blue gradient background with frosted glass effect
    const gradient = ctx.createLinearGradient(0, 0, CARD_WIDTH, CARD_HEIGHT);
    gradient.addColorStop(0, '#0A1628');
    gradient.addColorStop(0.5, '#0F1D32');
    gradient.addColorStop(1, '#0A1628');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

    // Add noise texture for frosted glass effect
    for (let i = 0; i < 5000; i++) {
      const x = Math.random() * CARD_WIDTH;
      const y = Math.random() * CARD_HEIGHT;
      const alpha = Math.random() * 0.03;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.fillRect(x, y, 2, 2);
    }

    // Draw outer border (champagne gold)
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, CARD_WIDTH - 60, CARD_HEIGHT - 60);

    // Draw inner border (champagne gold)
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1;
    ctx.strokeRect(40, 40, CARD_WIDTH - 80, CARD_HEIGHT - 80);

    // Draw corner diamonds
    const drawDiamond = (x: number, y: number, size: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x, y + size);
      ctx.lineTo(x - size, y);
      ctx.closePath();
      
      // Diamond gradient
      const diamondGrad = ctx.createRadialGradient(x, y, 0, x, y, size);
      diamondGrad.addColorStop(0, '#FFFFFF');
      diamondGrad.addColorStop(0.5, '#C9A96E');
      diamondGrad.addColorStop(1, '#8B7355');
      ctx.fillStyle = diamondGrad;
      ctx.fill();
      
      // Diamond sparkle
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.15, 0, Math.PI * 2);
      ctx.fill();
    };

    drawDiamond(30, 30, 12);
    drawDiamond(CARD_WIDTH - 30, 30, 12);
    drawDiamond(30, CARD_HEIGHT - 30, 12);
    drawDiamond(CARD_WIDTH - 30, CARD_HEIGHT - 30, 12);

    // Draw header
    ctx.fillStyle = '#C9A96E';
    ctx.font = 'bold 48px "Noto Sans TC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('FAC', CARD_WIDTH / 2, 120);

    ctx.font = '300 24px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#D4AF37';
    ctx.fillText('| 智慧合夥人 專屬邀請', CARD_WIDTH / 2, 155);

    // Draw decorative line
    ctx.beginPath();
    ctx.moveTo(CARD_WIDTH / 2 - 100, 175);
    ctx.lineTo(CARD_WIDTH / 2 + 100, 175);
    ctx.strokeStyle = '#C9A96E';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Draw quote
    ctx.font = 'italic 300 20px "Noto Sans TC", serif';
    ctx.fillStyle = 'rgba(201, 169, 110, 0.8)';
    ctx.fillText('「有些智慧，值得存入保險箱；', CARD_WIDTH / 2, 230);
    ctx.fillText('有些朋友，值得共同傳承。」', CARD_WIDTH / 2, 260);

    // Draw invite code
    ctx.font = 'bold 36px "Courier New", monospace';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(code, CARD_WIDTH / 2, 330);

    // Draw code label
    ctx.font = '12px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#888888';
    ctx.fillText('唯一邀請碼', CARD_WIDTH / 2, 360);

    // Draw footer
    ctx.font = '14px "Noto Sans TC", sans-serif';
    ctx.fillStyle = '#666666';
    ctx.fillText('國科綠色發展國際實驗室（香港）有限公司', CARD_WIDTH / 2, 420);
    ctx.fillText('香港非盈利擔保有限公司 · 公司編號 2828258', CARD_WIDTH / 2, 445);

    // Draw executive badge if applicable
    if (userTier === 'executive') {
      ctx.font = 'bold 16px "Noto Sans TC", sans-serif';
      ctx.fillStyle = '#C9A96E';
      ctx.fillText('★ EXECUTIVE PARTNER', CARD_WIDTH / 2, 470);
    }

    return canvas.toDataURL('image/png');
  }, [userTier]);

  // Generate card
  const handleGenerate = useCallback(() => {
    setIsGenerating(true);
    
    // Simulate processing delay for premium feel
    setTimeout(() => {
      const code = generateCode();
      const dataUrl = drawCard(code);
      setGeneratedCard({ code, dataUrl });
      setIsGenerating(false);
    }, 1500);
  }, [generateCode, drawCard]);

  // Download card
  const handleDownload = useCallback(() => {
    if (!generatedCard) return;
    
    const link = document.createElement('a');
    link.download = `FAC-Invitation-${generatedCard.code}.png`;
    link.href = generatedCard.dataUrl;
    link.click();
  }, [generatedCard]);

  if (!isOpen) return null;

  const canGenerate = userTier === 'executive';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="w-full max-w-4xl bg-[#0A1628] rounded-3xl border border-[#C9A96E]/30 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Crown className="w-8 h-8 text-[#C9A96E]" />
            <div>
              <h2 className="text-2xl font-bold text-white">黑金电子邀请函</h2>
              <p className="text-sm text-gray-400">Executive Partner 专属权益</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <div className="p-8">
          {!canGenerate ? (
            <div className="text-center py-16">
              <Crown className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Executive 专属功能</h3>
              <p className="text-gray-400 mb-6">升级至 Executive 会员，解锁黑金邀请函生成权益</p>
              <button className="px-6 py-3 bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] font-medium rounded-xl hover:scale-105 transition-transform">
                了解 Executive 权益
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Preview Area */}
              <div className="flex flex-col items-center">
                <h3 className="text-sm font-medium text-gray-400 mb-4">预览</h3>
                {generatedCard ? (
                  <div className="relative group">
                    <img 
                      src={generatedCard.dataUrl} 
                      alt="Invitation Card"
                      className="rounded-lg shadow-2xl max-w-full"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <button
                        onClick={handleDownload}
                        className="flex items-center gap-2 px-4 py-2 bg-[#C9A96E] text-[#0A1628] rounded-lg font-medium"
                      >
                        <Download className="w-4 h-4" />
                        下载 PNG
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="w-full aspect-[9/5] bg-white/5 rounded-lg flex items-center justify-center border-2 border-dashed border-white/20">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-500">点击生成按钮创建邀请函</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col justify-center">
                <h3 className="text-lg font-bold text-white mb-4">生成邀请函</h3>
                
                <div className="space-y-4 mb-6">
                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="font-medium text-[#C9A96E] mb-2">邀请函权益</h4>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
                        被邀请者首月享 8 折优惠
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
                        邀请者获得永久分紅权 (7.5%)
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-[#C9A96E] rounded-full" />
                        专属 6 位链上邀请码
                      </li>
                    </ul>
                  </div>

                  <div className="p-4 bg-white/5 rounded-xl">
                    <h4 className="font-medium text-gray-400 mb-2">设计规格</h4>
                    <ul className="space-y-1 text-xs text-gray-500">
                      <li>尺寸: 900 × 500 px</li>
                      <li>格式: PNG 高清导出</li>
                      <li>风格: 午夜蓝磨砂 + 香槟金双边框</li>
                    </ul>
                  </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className={`
                    w-full py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2
                    ${isGenerating
                      ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] hover:scale-[1.02]'
                    }
                  `}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      {generatedCard ? '重新生成' : '生成邀请函'}
                    </>
                  )}
                </button>

                {generatedCard && (
                  <button
                    onClick={handleDownload}
                    className="w-full mt-3 py-3 border border-[#C9A96E] text-[#C9A96E] rounded-xl font-medium hover:bg-[#C9A96E]/10 transition-colors flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    下载 PNG (900×500)
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden canvas for generation */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
