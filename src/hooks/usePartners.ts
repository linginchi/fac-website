import { useState, useEffect, useCallback } from 'react';

export interface Partner {
  id: string;
  logo?: string;
  name: string;
  link?: string;
  description?: string;
  order: number;
}

const STORAGE_KEY = 'fac_partners';

const defaultPartners: Partner[] = [
  { id: '1', name: 'HSBC', description: 'HSBC Holdings', order: 1 },
  { id: '2', name: 'BOCHK', description: 'Bank of China (Hong Kong)', order: 2 },
  { id: '3', name: 'Hang Seng', description: 'Hang Seng Bank', order: 3 },
  { id: '4', name: 'PwC', description: 'PricewaterhouseCoopers', order: 4 },
  { id: '5', name: 'Deloitte', description: 'Deloitte Touche Tohmatsu', order: 5 },
  { id: '6', name: 'KPMG', description: 'KPMG International', order: 6 },
  { id: '7', name: 'HKGCC', description: 'HK General Chamber of Commerce', order: 7 },
  { id: '8', name: 'HKMA', description: 'Hong Kong Monetary Authority', order: 8 },
  { id: '9', name: 'TDC', description: 'Hong Kong Trade Development Council', order: 9 },
  { id: '10', name: 'InvestHK', description: 'Invest Hong Kong', order: 10 },
];

export function usePartners() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPartners(Array.isArray(parsed) ? parsed : defaultPartners);
      } catch {
        setPartners(defaultPartners);
      }
    } else {
      setPartners(defaultPartners);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPartners));
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(partners));
  }, [partners, isLoaded]);

  const addPartner = useCallback((partner: Omit<Partner, 'id'>) => {
    const newPartner: Partner = {
      ...partner,
      id: Date.now().toString(),
      order: partner.order ?? partners.length + 1,
    };
    setPartners((prev) => [...prev, newPartner].sort((a, b) => a.order - b.order));
    return newPartner;
  }, [partners.length]);

  const updatePartner = useCallback((id: string, updates: Partial<Partner>) => {
    setPartners((prev) =>
      prev
        .map((p) => (p.id === id ? { ...p, ...updates } : p))
        .sort((a, b) => a.order - b.order)
    );
  }, []);

  const deletePartner = useCallback((id: string) => {
    setPartners((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const reorderPartners = useCallback((orderedIds: string[]) => {
    setPartners((prev) => {
      const byId = new Map(prev.map((p) => [p.id, p]));
      return orderedIds.map((id, i) => {
        const p = byId.get(id);
        return p ? { ...p, order: i + 1 } : null;
      }).filter(Boolean) as Partner[];
    });
  }, []);

  return {
    partners,
    isLoaded,
    addPartner,
    updatePartner,
    deletePartner,
    reorderPartners,
  };
}
