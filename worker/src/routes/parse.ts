/**
 * FAC Platform AI Agent - 多模態文件解析服務
 * 支持 PDF、Word、圖片、語音文件的智能解析
 */

import type { Env } from '../types';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// 支持的文件類型配置
const FILE_TYPE_CONFIG = {
  pdf: {
    mimeTypes: ['application/pdf'],
    maxSize: 20 * 1024 * 1024, // 20MB
    extractMethod: 'text-extraction',
    aiPrompt: 'Extract personal information from this resume/CV including: name, phone, email, location, company, job title, years of experience, skills, and a brief summary. Return as structured JSON.',
  },
  doc: {
    mimeTypes: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    maxSize: 20 * 1024 * 1024,
    extractMethod: 'text-extraction',
    aiPrompt: 'Extract personal information from this document including: name, phone, email, location, company, job title, years of experience, skills, and a brief summary. Return as structured JSON.',
  },
  image: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSize: 10 * 1024 * 1024, // 10MB
    extractMethod: 'ocr+vision',
    aiPrompt: 'This is an image of a document or business card. Perform OCR and extract: name, phone, email, location, company, job title, and any other contact information. Return as structured JSON.',
  },
  audio: {
    mimeTypes: ['audio/mpeg', 'audio/wav', 'audio/mp4', 'audio/ogg', 'audio/webm', 'audio/x-m4a'],
    maxSize: 50 * 1024 * 1024, // 50MB
    extractMethod: 'speech-to-text',
    aiPrompt: 'This is a spoken introduction or resume. Transcribe the audio and extract: name, background, skills, experience, and contact information if mentioned. Return as structured JSON.',
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

// 模擬 AI 解析（實際部署時替換為真實 AI 調用）
async function mockAIAnalyze(
  fileType: string,
  fileContent: ArrayBuffer,
  filename: string
): Promise<any> {
  // 這裡是模擬的 AI 解析結果
  // 實際部署時，這裡應該調用：
  // - OpenAI GPT-4 Vision API (圖片)
  // - OpenAI Whisper API (語音)
  // - 或 Cloudflare AI (如果可用)
  
  const mockResponses = [
    {
      name: '張偉明',
      phone: '+852 9123 4567',
      email: 'wmcheng@example.com',
      location: '香港中環',
      company: '環球顧問有限公司',
      title: '資深財務顧問',
      yearsExperience: '15',
      skills: ['財務規劃', '稅務諮詢', '跨境投資'],
      summary: '擁有15年財務顧問經驗，專精於跨境稅務規劃和企業融資。曾服務於多家跨國企業，協助客戶實現資產優化配置。',
    },
    {
      name: '李思敏',
      phone: '+852 9876 5432',
      email: 'smli@example.com',
      location: '香港尖沙咀',
      company: '創新科技有限公司',
      title: '項目總監',
      yearsExperience: '12',
      skills: ['項目管理', '團隊領導', '商業分析'],
      summary: '資深項目管理專家，擅長大型IT項目交付。具備PMP認證，成功交付超過50個企業級項目。',
    },
    {
      name: '王大衛',
      phone: '+852 9345 6789',
      email: 'dwong@example.com',
      location: '香港灣仔',
      company: '獨立顧問',
      title: '法律顧問',
      yearsExperience: '20',
      skills: ['商業法律', '合規審查', '知識產權'],
      summary: '執業律師，專注於商業法律和知識產權領域。為初創企業和中小企提供法律諮詢服務。',
    },
  ];
  
  // 根據文件名哈希選擇一個固定的模擬結果
  const hash = filename.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const mockData = mockResponses[hash % mockResponses.length];
  
  // 模擬處理延遲
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    extractedInfo: mockData,
    fileType,
    confidence: 0.92,
    processedAt: new Date().toISOString(),
    aiModel: 'FAC-Agent-v1.0 (Mock)',
  };
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
            message: 'Unsupported file type. Please upload PDF, Word, Image, or Audio files.' 
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
            message: `File too large. Maximum size for ${fileType} is ${config.maxSize / 1024 / 1024}MB` 
          }
        }), { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
      
      // 讀取文件內容
      const fileBuffer = await file.arrayBuffer();
      
      // TODO: 實際部署時，這裡應該：
      // 1. 將文件上傳到 R2/S3 存儲
      // 2. 調用 AI 服務進行解析（OpenAI, Claude, 或 Cloudflare AI）
      // 3. 返回解析結果
      
      // 目前使用模擬 AI 解析
      const analysisResult = await mockAIAnalyze(fileType, fileBuffer, file.name);
      
      // 根據用戶角色調整解析結果
      if (userRole === 'A') {
        // 甲方（企業）可能需要不同的信息結構
        analysisResult.extractedInfo = {
          ...analysisResult.extractedInfo,
          contactPerson: analysisResult.extractedInfo.name,
          companyName: analysisResult.extractedInfo.company,
        };
      }
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          ...analysisResult,
          originalFile: {
            name: file.name,
            size: file.size,
            type: file.type,
            detectedType: fileType,
          },
        },
        message: 'File analyzed successfully',
      }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      
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
        })),
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
        version: '1.0.0',
        capabilities: ['pdf', 'doc', 'image', 'audio'],
      },
    }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
  }
  
  return new Response(JSON.stringify({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found' }
  }), { status: 404, headers: { 'Content-Type': 'application/json', ...corsHeaders } });
}
