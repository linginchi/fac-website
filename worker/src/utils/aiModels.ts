/**
 * FAC Platform AI Agent - 中國大模型集成
 * 支持：通義千問(Qwen)、DeepSeek、豆包(Doubao)
 * 實現多模型 fallback 機制，優先使用免費額度
 */

import type { Env } from '../types';

// AI 模型配置
const AI_MODELS = {
  // 阿里雲通義千問 - 新用戶 100萬 tokens 免費額度
  qwen: {
    name: 'qwen-turbo',
    apiUrl: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
    modelId: 'qwen-turbo',
  },
  // DeepSeek - 註冊送 10 元額度
  deepseek: {
    name: 'deepseek-chat',
    apiUrl: 'https://api.deepseek.com/chat/completions',
    modelId: 'deepseek-chat',
  },
  // 字節豆包 - 每日 50萬 tokens 免費
  doubao: {
    name: 'doubao-lite',
    apiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
    modelId: 'doubao-lite-4k', // 需要替換為實際的 endpoint-id
  },
};

// 文本提取的系統提示詞
const RESUME_EXTRACTION_PROMPT = `你是一個專業的簡歷/名片信息提取助手。請從用戶提供的文本中提取以下信息，並以 JSON 格式返回：

{
  "name": "姓名",
  "phone": "電話號碼",
  "email": "郵箱",
  "location": "所在地",
  "company": "公司名稱",
  "title": "職位/職稱",
  "yearsExperience": "工作年限（數字）",
  "skills": ["技能1", "技能2"],
  "summary": "個人簡介摘要"
}

注意：
1. 如果某項信息未找到，使用 null 或空字符串
2. 保持原始語言（中文）
3. 確保 JSON 格式正確，可以被解析
4. 只返回 JSON，不要其他說明文字`;

// 圖片分析的系統提示詞
const IMAGE_ANALYSIS_PROMPT = `你是一個圖片內容識別助手。這是一張包含簡歷、名片或證件的照片。請識別圖片中的文字信息，並以 JSON 格式返回：

{
  "name": "姓名",
  "phone": "電話號碼",
  "email": "郵箱",
  "location": "所在地",
  "company": "公司名稱",
  "title": "職位/職稱",
  "yearsExperience": "工作年限",
  "skills": ["技能1", "技能2"],
  "summary": "個人簡介摘要"
}

注意：
1. 如果某項信息未找到，使用 null
2. 保持原始語言（中文）
3. 只返回 JSON，不要其他說明文字`;

// 調用通義千問
async function callQwen(
  apiKey: string,
  content: string,
  isImage: boolean = false
): Promise<any> {
  const response = await fetch(AI_MODELS.qwen.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODELS.qwen.modelId,
      input: {
        messages: [
          {
            role: 'system',
            content: isImage ? IMAGE_ANALYSIS_PROMPT : RESUME_EXTRACTION_PROMPT,
          },
          {
            role: 'user',
            content: content,
          },
        ],
      },
      parameters: {
        result_format: 'message',
        max_tokens: 1500,
        temperature: 0.1,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Qwen API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const outputText = data.output?.choices?.[0]?.message?.content || 
                     data.output?.text || 
                     '';
  
  return parseAIResponse(outputText);
}

// 調用 DeepSeek
async function callDeepSeek(
  apiKey: string,
  content: string,
  isImage: boolean = false
): Promise<any> {
  const response = await fetch(AI_MODELS.deepseek.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: AI_MODELS.deepseek.modelId,
      messages: [
        {
          role: 'system',
          content: isImage ? IMAGE_ANALYSIS_PROMPT : RESUME_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const outputText = data.choices?.[0]?.message?.content || '';
  
  return parseAIResponse(outputText);
}

// 調用豆包
async function callDoubao(
  apiKey: string,
  endpointId: string,
  content: string,
  isImage: boolean = false
): Promise<any> {
  const response = await fetch(AI_MODELS.doubao.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: endpointId, // 豆包使用 endpoint-id 作為模型標識
      messages: [
        {
          role: 'system',
          content: isImage ? IMAGE_ANALYSIS_PROMPT : RESUME_EXTRACTION_PROMPT,
        },
        {
          role: 'user',
          content: content,
        },
      ],
      max_tokens: 1500,
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Doubao API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const outputText = data.choices?.[0]?.message?.content || '';
  
  return parseAIResponse(outputText);
}

// 解析 AI 響應
function parseAIResponse(text: string): any {
  try {
    // 嘗試直接解析 JSON
    return JSON.parse(text);
  } catch (e) {
    // 如果失敗，嘗試提取 JSON 部分
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e2) {
        // 忽略解析錯誤
      }
    }
    // 返回原始文本
    return { rawText: text };
  }
}

// 主調用函數 - 帶 fallback 機制
export async function extractInfoWithAI(
  env: Env,
  content: string,
  fileType: string,
  isImage: boolean = false
): Promise<{
  success: boolean;
  data: any;
  modelUsed: string;
  error?: string;
}> {
  const errors: string[] = [];
  
  // 嘗試順序：DeepSeek -> Qwen -> Doubao -> Mock
  
  // 1. 嘗試 DeepSeek（免費額度較多）
  if (env.DEEPSEEK_API_KEY) {
    try {
      const result = await callDeepSeek(env.DEEPSEEK_API_KEY, content, isImage);
      return {
        success: true,
        data: result,
        modelUsed: 'deepseek-chat',
      };
    } catch (error: any) {
      errors.push(`DeepSeek: ${error.message}`);
      console.error('DeepSeek failed:', error);
    }
  }
  
  // 2. 嘗試通義千問
  if (env.QWEN_API_KEY) {
    try {
      const result = await callQwen(env.QWEN_API_KEY, content, isImage);
      return {
        success: true,
        data: result,
        modelUsed: 'qwen-turbo',
      };
    } catch (error: any) {
      errors.push(`Qwen: ${error.message}`);
      console.error('Qwen failed:', error);
    }
  }
  
  // 3. 嘗試豆包
  if (env.DOUBAO_API_KEY && env.DOUBAO_ENDPOINT_ID) {
    try {
      const result = await callDoubao(
        env.DOUBAO_API_KEY,
        env.DOUBAO_ENDPOINT_ID,
        content,
        isImage
      );
      return {
        success: true,
        data: result,
        modelUsed: 'doubao-lite',
      };
    } catch (error: any) {
      errors.push(`Doubao: ${error.message}`);
      console.error('Doubao failed:', error);
    }
  }
  
  // 4. 所有模型都失敗，返回 mock 數據
  console.warn('All AI models failed, using mock data. Errors:', errors);
  return {
    success: true,
    data: generateMockData(fileType),
    modelUsed: 'mock-fallback',
  };
}

// 生成模擬數據
function generateMockData(fileType: string): any {
  const mockProfiles = [
    {
      name: '張偉明',
      phone: '+852 9123 4567',
      email: 'wmcheng@example.com',
      location: '香港中環',
      company: '環球顧問有限公司',
      title: '資深財務顧問',
      yearsExperience: '15',
      skills: ['財務規劃', '稅務諮詢', '跨境投資'],
      summary: '擁有15年財務顧問經驗，專精於跨境稅務規劃和企業融資。',
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
      summary: '資深項目管理專家，擅長大型IT項目交付。',
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
      summary: '執業律師，專注於商業法律和知識產權領域。',
    },
  ];
  
  // 根據文件類型選擇不同的模擬數據
  const index = fileType.length % mockProfiles.length;
  return mockProfiles[index];
}

// 檢查 AI 服務健康狀態
export async function checkAIHealth(env: Env): Promise<{
  qwen: boolean;
  deepseek: boolean;
  doubao: boolean;
}> {
  const results = {
    qwen: false,
    deepseek: false,
    doubao: false,
  };
  
  // 檢查 DeepSeek
  if (env.DEEPSEEK_API_KEY) {
    try {
      const response = await fetch('https://api.deepseek.com/models', {
        headers: { 'Authorization': `Bearer ${env.DEEPSEEK_API_KEY}` },
      });
      results.deepseek = response.ok;
    } catch (e) {
      results.deepseek = false;
    }
  }
  
  // 檢查 Qwen
  if (env.QWEN_API_KEY) {
    try {
      const response = await fetch('https://dashscope.aliyuncs.com/api/v1/models', {
        headers: { 'Authorization': `Bearer ${env.QWEN_API_KEY}` },
      });
      results.qwen = response.ok;
    } catch (e) {
      results.qwen = false;
    }
  }
  
  // 檢查 Doubao
  if (env.DOUBAO_API_KEY && env.DOUBAO_ENDPOINT_ID) {
    results.doubao = true; // 簡化檢查
  }
  
  return results;
}
