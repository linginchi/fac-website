/**
 * FAC Platform V5.1 - Voice Universal Box
 * 语音万能框：支持广东话、普通话、英文三语混合输入
 * P1 优先级功能
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, X, Send, Loader2 } from 'lucide-react';
import gsap from 'gsap';

// ==================== Types ====================

interface VoiceUniversalBoxProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (text: string, isVoice: boolean) => void;
  placeholder?: string;
}

type RecordingState = 'idle' | 'listening' | 'processing';

// ==================== Speech Recognition Setup ====================

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

// ==================== Component ====================

export default function VoiceUniversalBox({ 
  isOpen, 
  onClose, 
  onSubmit,
  placeholder = "描述您的需求（甲方），或告诉我们您的专长（乙方）..."
}: VoiceUniversalBoxProps) {
  const [text, setText] = useState('');
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('');
  const [visualizerData, setVisualizerData] = useState<number[]>(new Array(20).fill(0));
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const visualizerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const micButtonRef = useRef<HTMLButtonElement>(null);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.maxAlternatives = 1;
    }
  }, []);

  // Handle recognition events
  useEffect(() => {
    const recognition = recognitionRef.current;
    if (!recognition) return;

    recognition.onstart = () => {
      setRecordingState('listening');
      startVisualizer();
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setText(prev => prev + (prev ? ' ' : '') + finalTranscript);
        detectLanguage(finalTranscript);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error);
      setRecordingState('idle');
      stopVisualizer();
    };

    recognition.onend = () => {
      setRecordingState('idle');
      stopVisualizer();
    };

    return () => {
      recognition.onstart = null;
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
    };
  }, []);

  // Animate modal on open
  useEffect(() => {
    if (isOpen && modalRef.current) {
      gsap.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' }
      );
    }
  }, [isOpen]);

  // Visualizer animation
  const startVisualizer = () => {
    if (visualizerIntervalRef.current) return;
    
    visualizerIntervalRef.current = setInterval(() => {
      const newData = new Array(20).fill(0).map(() => 
        Math.max(0.1, Math.min(1, 0.3 + Math.random() * 0.7))
      );
      setVisualizerData(newData);
    }, 100);
  };

  const stopVisualizer = () => {
    if (visualizerIntervalRef.current) {
      clearInterval(visualizerIntervalRef.current);
      visualizerIntervalRef.current = null;
    }
    setVisualizerData(new Array(20).fill(0.1));
  };

  // Language detection (simplified)
  const detectLanguage = (text: string) => {
    const hasChinese = /[\u4e00-\u9fa5]/.test(text);
    const hasCantonese = /[嘅咗咁啲乜]/.test(text);
    
    if (hasCantonese) {
      setDetectedLanguage('廣東話');
    } else if (hasChinese) {
      setDetectedLanguage('普通话');
    } else {
      setDetectedLanguage('English');
    }
  };

  // Toggle recording
  const toggleRecording = useCallback(() => {
    const recognition = recognitionRef.current;
    if (!recognition) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    if (recordingState === 'listening') {
      recognition.stop();
    } else {
      // Try different languages
      recognition.lang = 'zh-HK'; // Default to Cantonese for HK market
      try {
        recognition.start();
      } catch (e) {
        console.error('Failed to start recognition:', e);
      }
    }
  }, [recordingState]);

  // Handle submit
  const handleSubmit = () => {
    if (text.trim()) {
      onSubmit(text.trim(), recordingState !== 'idle');
      setText('');
      onClose();
    }
  };

  // Handle close
  const handleClose = () => {
    if (recognitionRef.current && recordingState === 'listening') {
      recognitionRef.current.stop();
    }
    stopVisualizer();
    onClose();
  };

  if (!isOpen) return null;

  const isSupported = typeof window !== 'undefined' && 
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div 
        ref={modalRef}
        className="w-full max-w-2xl bg-[#0A1628] rounded-3xl border border-[#C9A96E]/30 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-bold text-white">万能框</h2>
            <p className="text-xs text-gray-400">
              支持广东话、普通话、英文
              {detectedLanguage && <span className="text-[#C9A96E] ml-2">检测: {detectedLanguage}</span>}
            </p>
          </div>
          <button 
            onClick={handleClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Input Area */}
        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value) detectLanguage(e.target.value);
            }}
            placeholder={placeholder}
            className="w-full h-40 bg-white/5 rounded-2xl p-4 text-white placeholder-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-[#C9A96E]/50"
          />

          {/* Voice Visualizer */}
          {recordingState === 'listening' && (
            <div className="flex items-center justify-center gap-1 h-16 mt-4">
              {visualizerData.map((height, i) => (
                <div
                  key={i}
                  className="w-2 bg-gradient-to-t from-[#C9A96E] to-[#D4AF37] rounded-full transition-all duration-75"
                  style={{ 
                    height: `${height * 100}%`,
                    opacity: 0.3 + height * 0.7
                  }}
                />
              ))}
            </div>
          )}

          {/* Recording Status */}
          {recordingState === 'listening' && (
            <div className="text-center mt-2">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                正在聆听...
              </span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-white/5">
          <div className="flex items-center gap-3">
            {isSupported ? (
              <button
                ref={micButtonRef}
                onClick={toggleRecording}
                className={`
                  w-14 h-14 rounded-full flex items-center justify-center transition-all
                  ${recordingState === 'listening'
                    ? 'bg-red-500 animate-pulse'
                    : 'bg-gradient-to-br from-[#C9A96E] to-[#D4AF37] hover:scale-105'
                  }
                `}
              >
                {recordingState === 'listening' ? (
                  <Loader2 className="w-6 h-6 text-white animate-spin" />
                ) : (
                  <Mic className="w-6 h-6 text-[#0A1628]" />
                )}
              </button>
            ) : (
              <div className="text-xs text-gray-500">
                浏览器不支持语音识别
              </div>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!text.trim()}
            className={`
              flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all
              ${text.trim()
                ? 'bg-gradient-to-r from-[#C9A96E] to-[#D4AF37] text-[#0A1628] hover:scale-105'
                : 'bg-white/10 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            <Send className="w-4 h-4" />
            提交
          </button>
        </div>

        {/* Tips */}
        <div className="px-6 py-3 bg-black/30 text-xs text-gray-500">
          <p>提示：点击麦克风按钮开始语音输入，支持随时打断。文字和语音可以混合使用。</p>
        </div>
      </div>
    </div>
  );
}
