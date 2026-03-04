import { useState, useEffect, useCallback } from 'react';

export interface TeamMember {
  id: string;
  name: string;
  nameEn: string;
  role: string;
  roleEn: string;
  desc: string;
  descEn: string;
  image: string;
  order: number;
}

const STORAGE_KEY = 'fac_team_members';

// Default team members
const defaultMembers: TeamMember[] = [
  {
    id: '1',
    name: '林憬怡',
    nameEn: 'Mark Lin',
    role: '创始合伙人',
    roleEn: 'Founding Partner',
    desc: '20年科技产业投资经验',
    descEn: '20 years of tech investment experience',
    image: '/team-mark.jpg',
    order: 1
  },
  {
    id: '2',
    name: '胡威廉',
    nameEn: 'William Hu',
    role: '管理合伙人',
    roleEn: 'Managing Partner',
    desc: '前跨国企业高管，擅长战略规划',
    descEn: 'Former MNC executive, strategy expert',
    image: '/team-william.jpg',
    order: 2
  }
];

export function useTeamMembers() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load members from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setMembers(parsed);
      } catch (e) {
        console.error('Failed to parse team members:', e);
        setMembers(defaultMembers);
      }
    } else {
      setMembers(defaultMembers);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever members change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
    }
  }, [members, isLoaded]);

  const addMember = useCallback((member: Omit<TeamMember, 'id'>) => {
    const newMember: TeamMember = {
      ...member,
      id: Date.now().toString()
    };
    setMembers(prev => [...prev, newMember].sort((a, b) => a.order - b.order));
    return newMember;
  }, []);

  const updateMember = useCallback((id: string, updates: Partial<TeamMember>) => {
    setMembers(prev =>
      prev.map(member =>
        member.id === id ? { ...member, ...updates } : member
      ).sort((a, b) => a.order - b.order)
    );
  }, []);

  const deleteMember = useCallback((id: string) => {
    setMembers(prev => prev.filter(member => member.id !== id));
  }, []);

  const reorderMembers = useCallback((newOrder: string[]) => {
    setMembers(prev =>
      prev.map(member => ({
        ...member,
        order: newOrder.indexOf(member.id) + 1
      })).sort((a, b) => a.order - b.order)
    );
  }, []);

  const resetToDefault = useCallback(() => {
    setMembers(defaultMembers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultMembers));
  }, []);

  return {
    members,
    isLoaded,
    addMember,
    updateMember,
    deleteMember,
    reorderMembers,
    resetToDefault
  };
}
