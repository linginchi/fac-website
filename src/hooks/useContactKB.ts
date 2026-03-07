import { useState, useEffect, useCallback } from 'react';

const STORAGE_KB = 'fac_contact_kb';
const STORAGE_SUBMISSIONS = 'fac_contact_submissions';
const STORAGE_PLATFORM_MESSAGES = 'fac_platform_messages';

export interface KBEntry {
  id: string;
  q: string;
  a: string;
  lang?: 'zh' | 'en';
}

export interface Submission {
  id: string;
  message: string;
  at: string;
  userId?: string;
  reply?: string;
  repliedAt?: string;
}

export interface PlatformMessage {
  id: string;
  from: string;
  text: string;
  at: string;
  read?: boolean;
  submissionId?: string;
}

const defaultKB: KBEntry[] = [
  { id: '1', q: '章程', a: '本平台由國科綠色發展國際實驗室（香港）有限公司 (CAS Laboratory) 運營，為香港註冊非盈利擔保有限公司。服務香港退休專家，打造公正、專業、去中心化的智慧對接平台。', lang: 'zh' },
  { id: '2', q: '非盈利', a: 'CAS Laboratory 為香港註冊非盈利擔保有限公司，盈餘用於平台發展與公益使命，不向股東分紅。', lang: 'zh' },
  { id: '3', q: 'Web3', a: 'FAC 港匠匯採用 Web3 理念：去中心化保險箱、數據主權歸用戶、$FAC 代幣激勵與智慧解碼。技術上支援加密備份與鏈上追蹤。', lang: 'zh' },
  { id: '4', q: '合規', a: '平台恪守香港法規，專業對接涵蓋 SFC 持牌、合規諮詢、跨境貿易合規等，所有專家與需求經系統識別與脫敏處理。', lang: 'zh' },
  { id: '5', q: '業務', a: '專業服務對接、退休專家諮詢、八大智慧支柱（跨境貿易、零售、家族傳承、製造、融資、工程、教育、金融監管 RO）。', lang: 'zh' },
  { id: '6', q: 'charter', a: 'This platform is operated by CAS Laboratory (HK), a Hong Kong registered non-profit guarantee company. We serve Hong Kong retired experts and provide a fair, professional, decentralised wisdom-matching platform.', lang: 'en' },
  { id: '7', q: 'non-profit', a: 'CAS Laboratory is a Hong Kong registered non-profit. Surplus is used for platform development and public good; no shareholder dividends.', lang: 'en' },
  { id: '8', q: 'Web3', a: 'FAC uses Web3 principles: decentralised vault, user data sovereignty, $FAC token incentives and decode mechanics. We support encrypted backup and on-chain tracking.', lang: 'en' },
  { id: '9', q: 'compliance', a: 'We comply with Hong Kong regulations. Services cover SFC licensing, compliance advice, cross-border trade compliance; all matching is system-mediated and anonymised.', lang: 'en' },
  { id: '10', q: 'business', a: 'Professional matching, retired expert consultation, eight pillars of expertise: trade, retail, family succession, manufacturing, finance, engineering, education, RO compliance.', lang: 'en' },
];

function loadKB(): KBEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KB);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : defaultKB;
    }
  } catch (_) {}
  return defaultKB;
}

function loadSubmissions(): Submission[] {
  try {
    const raw = localStorage.getItem(STORAGE_SUBMISSIONS);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return [];
}

function loadPlatformMessages(): Record<string, PlatformMessage[]> {
  try {
    const raw = localStorage.getItem(STORAGE_PLATFORM_MESSAGES);
    if (raw) return JSON.parse(raw);
  } catch (_) {}
  return {};
}

function savePlatformMessages(data: Record<string, PlatformMessage[]>) {
  localStorage.setItem(STORAGE_PLATFORM_MESSAGES, JSON.stringify(data));
}

export function useContactKB() {
  const [kb, setKb] = useState<KBEntry[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [platformMessages, setPlatformMessages] = useState<Record<string, PlatformMessage[]>>({});

  useEffect(() => {
    setKb(loadKB());
    setSubmissions(loadSubmissions());
    setPlatformMessages(loadPlatformMessages());
  }, []);

  useEffect(() => {
    if (kb.length > 0) localStorage.setItem(STORAGE_KB, JSON.stringify(kb));
  }, [kb]);

  useEffect(() => {
    localStorage.setItem(STORAGE_SUBMISSIONS, JSON.stringify(submissions));
  }, [submissions]);

  useEffect(() => {
    if (Object.keys(platformMessages).length > 0) savePlatformMessages(platformMessages);
  }, [platformMessages]);

  const addToKB = useCallback((q: string, a: string, lang?: 'zh' | 'en') => {
    setKb((prev) => [...prev, { id: Date.now().toString(), q, a, lang }]);
  }, []);

  const addSubmission = useCallback((message: string): Submission => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('fac_user_id') ?? undefined : undefined;
    const sub: Submission = { id: Date.now().toString(), message, at: new Date().toISOString(), userId };
    setSubmissions((prev) => [sub, ...prev]);
    return sub;
  }, []);

  /** 管理員回覆：可選同步至知識庫；自動推送至用戶「平台消息」並觸發外部通知（模擬） */
  const replySubmission = useCallback((id: string, reply: string, options?: { syncToKB?: boolean }) => {
    const now = new Date().toISOString();
    const syncToKB = options?.syncToKB !== false;
    setSubmissions((prev) => {
      const one = prev.find((s) => s.id === id);
      if (!one) return prev;
      const updated = { ...one, reply, repliedAt: now };
      if (syncToKB) {
        setKb((k) => [...k, { id: `sub-${id}`, q: one.message, a: reply, lang: undefined }]);
      }
      if (one.userId) {
        setPlatformMessages((pm) => {
          const list = pm[one.userId!] ?? [];
          const msg: PlatformMessage = {
            id: `msg-${id}-${Date.now()}`,
            from: 'FAC 港匠匯',
            text: reply,
            at: now,
            read: false,
            submissionId: id,
          };
          savePlatformMessages({ ...pm, [one.userId!]: [msg, ...list] });
          return { ...pm, [one.userId!]: [msg, ...list] };
        });
      }
      return prev.map((s) => (s.id === id ? updated : s));
    });
  }, []);

  const matchKB = useCallback((query: string, lang: 'zh' | 'en'): string | null => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    const langEntries = kb.filter((e) => !e.lang || e.lang === lang);
    for (const e of langEntries) {
      if (e.q.length >= 2 && q.includes(e.q.toLowerCase())) return e.a;
    }
    for (const e of langEntries) {
      const keywords = e.q.toLowerCase().split(/\s+/);
      if (keywords.some((k) => k.length >= 2 && q.includes(k))) return e.a;
    }
    return null;
  }, [kb]);

  const getMessagesForUser = useCallback((userId: string): PlatformMessage[] => {
    return platformMessages[userId] ?? [];
  }, [platformMessages]);

  const markMessageRead = useCallback((userId: string, messageId: string) => {
    setPlatformMessages((pm) => {
      const list = pm[userId] ?? [];
      const next = list.map((m) => (m.id === messageId ? { ...m, read: true } : m));
      const out = { ...pm, [userId]: next };
      savePlatformMessages(out);
      return out;
    });
  }, []);

  return {
    kb,
    submissions,
    replySubmission,
    addToKB,
    addSubmission,
    matchKB,
    getMessagesForUser,
    markMessageRead,
  };
}
