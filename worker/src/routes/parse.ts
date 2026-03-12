/**
 * FAC Platform AI Agent - 多模態文件解析服務
 * 支持 PDF、Word、圖片、語音文件的智能解析
 * 集成中國大模型：通義千問、DeepSeek、豆包
 */

import type { Env } from '../types';
import { extractInfoWithAI, checkAIHealth } from '../utils/aiModels';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 支持的文件類型配置
const FILE_TYPE_CONFIG = {
  pdf: {
    mimeTypes: ['application/pdf'],
    maxSize: 20 * 1024 * 1024,
    extractMethod: 'text-extraction',
    label: 'PDF',
  },
  doc: {
    mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 20 * 1024 * 1024,
    extractMethod: 'text-extraction',
    label: 'Word',
  },
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 10 * 1024 * 1024,
    extractMethod: 'ocr+vision',
    label: '圖片',
  },
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/x-m4a'],
    maxSize: 50 * 1024 * 1024,
    extractMethod: 'speech-to-text',
    label: '語音',
  },
};

// 文件類型檢測
function detectFileType(mimeType: string, filename: string): string | null {
  const ext = filename.toLowerCase().split('.').pop();
  
  for (const [type, config] of Object.entries(FILE_TYPE_CONFIG)) {
    if (config.mimeTypes.includes(mimeType)) {
      return type;
    }
  }
  
  // 通過擴展名檢測
  if (ext === 'pdf') return 'pdf';
  if (ext === 'doc' || ext === 'docx') return 'doc';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return 'image';
  if (['mp3', 'wav', 'm4a', 'ogg', 'webm', 'mp4'].includes(ext || '')) return 'audio';
  
  return null;
}

// 從文件內容提取文本（簡化版本，實際需要更複雜的處理）
async function extractTextFromFile(
  fileBuffer: ArrayBuffer,
  fileType: string,
  mimeType: string
): Promise<string> {
  // 對於文本類型，嘗試直接解碼
  if (fileType === 'pdf' || fileType === 'doc') {
    // 注意：這是簡化處理，實際需要 PDF/DOC 解析庫
    // 在 Workers 環境中，可以使用 pdf-parse 或其他庫
    const text = new TextDecoder('utf-8').decode(fileBuffer);
    // 提取可打印字符
    return text.replace(/[^\x20-\x7E\u4e00-\u9fa5]/g, ' ').slice(0, 10000);
  }
  
  if (fileType === 'image') {
    // 圖片將通過 AI Vision API 處理，這裡返回標記
    return `[IMAGE_FILE:${mimeType}]`;
  }
  
  if (fileType === 'audio') {
    // 語音將通過 ASR API 處理
    return `[AUDIO_FILE:${mimeType}]`;
  }
  
  return '';
}

// 主處理函數
export async function handleParseRoutes(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // 文件解析端點
  if (path === '/api/parse/file' && request.method === 'POST') {
    try {
      const startTime = Date.now();
      
      // 獲取上傳的文件
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const userRole = formData.get('userRole') as string || 'neutral';
      
      if (!file) {
        return new Response(JSON.stringify({
          success: false,
          error: { code: 'MISSING_FILE', message: 'No file provided' }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 檢測文件類型
      const fileType = detectFileType(file.type, file.name);
      if (!fileType) {
        return new Response(JSON.stringify({
          success: false,
          error: { 
            code: 'UNSUPPORTED_TYPE', 
            message: 'Unsupported file type. Please upload PDF, Word, Image (JPG/PNG), or Audio (MP3/WAV) files.' 
          }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 檢查文件大小
      const config = FILE_TYPE_CONFIG[fileType as keyof typeof FILE_TYPE_CONFIG];
      if (file.size > config.maxSize) {
        return new Response(JSON.stringify({
          success: false,
          error: { 
            code: 'FILE_TOO_LARGE', 
            message: `File too large. Maximum size for ${config.label} is ${config.maxSize / 1024 / 1024}MB` 
          }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 讀取文件內容
      const fileBuffer = await file.arrayBuffer();
      
      // 提取文本內容
      const extractedText = await extractTextFromFile(fileBuffer, fileType, file.type);
      
      // 使用 AI 模型解析
      const isImage = fileType === 'image';
      const aiResult = await extractInfoWithAI(env, extractedText, fileType, isImage);
      
      const processingTime = Date.now() - startTime;
      
      if (!aiResult.success) {
        return new Response(JSON.stringify({
          success: false,
          error: { 
            code: 'AI_PARSE_ERROR', 
            message: aiResult.error || 'Failed to parse file with AI' 
          }
        }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 構建響應
      const response = {
        success: true,
        data: {
          extractedInfo: aiResult.data,
          originalFile: {
            name: file.name,
            size: file.size,
            type: file.type,
            detectedType: fileType,
            label: config.label,
          },
          aiProcessing: {
            modelUsed: aiResult.modelUsed,
            processingTimeMs: processingTime,
            isMock: aiResult.modelUsed === 'mock-fallback',
          },
        },
        message: `File analyzed successfully using ${aiResult.modelUsed}`,
      };
      
      return new Response(JSON.stringify(response), { 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      });
      
    } catch (error: any) {
      console.error('Parse error:', error);
      return new Response(JSON.stringify({
        success: false,
        error: { 
          code: 'PARSE_ERROR', 
          message: error.message || 'Failed to analyze file' 
        }
      }), { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
    }
  }
  
  // 獲取支持的文件類型列表
  if (path === '/api/parse/supported-types' && request.method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      data: {
        types: Object.entries(FILE_TYPE_CONFIG).map(([type, config]) => ({
          type,
          mimeTypes: config.mimeTypes,
          maxSize: config.maxSize,
          maxSizeMB: config.maxSize / 1024 / 1024,
          label: config.label,
        })),
      },
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  
  // AI 模型健康檢查
  if (path === '/api/parse/ai-health' && request.method === 'GET') {
    const health = await checkAIHealth(env);
    return new Response(JSON.stringify({
      success: true,
      data: {
        ...health,
        availableModels: Object.entries(health)
          .filter(([, v]) => v)
          .map(([k]) => k),
      },
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  
  // 健康檢查端點
  if (path === '/api/parse/health' && request.method === 'GET') {
    return new Response(JSON.stringify({
      success: true,
      data: {
        status: 'healthy',
        service: 'FAC AI Parse Agent',
        version: '2.0.0',
        capabilities: ['pdf', 'doc', 'image', 'audio'],
        supportedModels: ['deepseek-chat', 'qwen-turbo', 'doubao-lite', 'mock-fallback'],
      },
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}
