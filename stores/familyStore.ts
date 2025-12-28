import { create } from 'zustand';
import {
  Family,
  FamilyMember,
  Encouragement,
  EncouragementType,
  PreRecordedMessage,
  WeeklyReport,
} from '../types/family';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

interface FamilyState {
  // State
  family: Family | null;
  members: FamilyMember[];
  familyMembers: FamilyMember[];  // alias for members
  encouragements: Encouragement[];
  preRecordedMessages: PreRecordedMessage[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Family management
  createFamily: (name: string, creatorId: string) => Promise<string | null>;
  joinFamily: (inviteCode: string, userId?: string, relationship?: string) => Promise<boolean>;
  fetchFamily: (userId: string) => Promise<void>;
  fetchMembers: (familyId: string) => Promise<void>;
  fetchFamilyMembers: (familyId: string) => Promise<void>;  // alias for fetchMembers
  leaveFamily: (userId: string) => Promise<boolean>;

  // Encouragements
  fetchEncouragements: (userId: string) => Promise<void>;
  sendEncouragement: (data: {
    fromUserId: string;
    toUserId: string;
    familyId: string;
    type: EncouragementType;
    content?: string;
    mediaUrl?: string;
    relatedRitualId?: string;
    relatedGameSessionId?: string;
  }) => Promise<boolean>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userId: string) => Promise<void>;

  // Pre-recorded messages
  fetchPreRecordedMessages: (userId: string) => Promise<void>;
  addPreRecordedMessage: (message: Omit<PreRecordedMessage, 'id' | 'createdAt'>) => Promise<boolean>;
  deletePreRecordedMessage: (id: string) => Promise<boolean>;

  // Reports
  fetchWeeklyReport: (userId: string) => Promise<WeeklyReport | null>;
}

// Mock data
const mockFamily: Family = {
  id: 'family-1',
  name: '우리 가족',
  inviteCode: 'ABC12345',
  createdBy: 'user-1',
  createdAt: new Date(),
};

const mockMembers: FamilyMember[] = [
  {
    id: 'member-1',
    familyId: 'family-1',
    userId: 'user-1',
    user: {
      id: 'user-1',
      name: '아버지',
      avatarUrl: null,
      role: 'senior',
    },
    relationship: '본인',
    isPrimarySenior: true,
    joinedAt: new Date(),
  },
  {
    id: 'member-2',
    familyId: 'family-1',
    userId: 'user-2',
    user: {
      id: 'user-2',
      name: '큰아들',
      avatarUrl: null,
      role: 'family',
    },
    relationship: '아들',
    isPrimarySenior: false,
    joinedAt: new Date(),
  },
  {
    id: 'member-3',
    familyId: 'family-1',
    userId: 'user-3',
    user: {
      id: 'user-3',
      name: '며느리',
      avatarUrl: null,
      role: 'family',
    },
    relationship: '며느리',
    isPrimarySenior: false,
    joinedAt: new Date(),
  },
];

const mockEncouragements: Encouragement[] = [
  {
    id: 'enc-1',
    fromUserId: 'user-2',
    toUserId: 'user-1',
    familyId: 'family-1',
    type: 'text',
    content: '아버지 오늘도 화이팅이에요! 💪',
    mediaUrl: null,
    relatedRitualId: null,
    relatedGameSessionId: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30분 전
    fromUser: {
      id: 'user-2',
      name: '큰아들',
      avatarUrl: null,
    },
  },
  {
    id: 'enc-2',
    fromUserId: 'user-3',
    toUserId: 'user-1',
    familyId: 'family-1',
    type: 'voice',
    content: null,
    mediaUrl: 'mock-voice-url',
    relatedRitualId: null,
    relatedGameSessionId: null,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2시간 전
    fromUser: {
      id: 'user-3',
      name: '며느리',
      avatarUrl: null,
    },
  },
];

export const useFamilyStore = create<FamilyState>((set, get) => ({
  // Initial state
  family: null,
  members: [],
  familyMembers: [],
  encouragements: [],
  preRecordedMessages: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Create a new family
  createFamily: async (name, creatorId) => {
    set({ isLoading: true, error: null });
    try {
      // Generate invite code
      const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      const { data, error } = await supabase
        .from('families')
        .insert({
          name,
          invite_code: inviteCode,
          created_by: creatorId,
        })
        .select()
        .single();

      if (error) throw error;

      const newFamily: Family = {
        id: data.id,
        name: data.name,
        inviteCode: data.invite_code,
        createdBy: data.created_by,
        createdAt: new Date(data.created_at),
      };

      // Add creator as first family member
      await supabase.from('family_members').insert({
        family_id: newFamily.id,
        user_id: creatorId,
        relationship: '본인',
        is_primary_senior: true,
      });

      set({
        family: newFamily,
        isLoading: false,
      });

      return inviteCode;
    } catch (error) {
      console.error('Create family error:', error);
      set({
        error: '가족 그룹 생성에 실패했어요.',
        isLoading: false,
      });
      return null;
    }
  },

  // Join existing family
  joinFamily: async (inviteCode, userId, relationship) => {
    set({ isLoading: true, error: null });
    try {
      // Find family by invite code
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('invite_code', inviteCode)
        .single();

      if (familyError) throw familyError;

      // Add user as family member
      const { error: memberError } = await supabase
        .from('family_members')
        .insert({
          family_id: familyData.id,
          user_id: userId || '',
          relationship: relationship || '가족',
          is_primary_senior: false,
        });

      if (memberError) throw memberError;

      const family: Family = {
        id: familyData.id,
        name: familyData.name,
        inviteCode: familyData.invite_code,
        createdBy: familyData.created_by,
        createdAt: new Date(familyData.created_at),
      };

      set({
        family,
        isLoading: false,
      });

      return true;
    } catch (error) {
      console.error('Join family error:', error);
      set({
        error: '가족 참여에 실패했어요. 초대 코드를 확인해주세요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch family
  fetchFamily: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // Get user's family membership
      const { data: memberData, error: memberError } = await supabase
        .from('family_members')
        .select('family_id')
        .eq('user_id', userId)
        .single();

      if (memberError) {
        // User is not in any family yet
        set({ isLoading: false });
        return;
      }

      // Get family details
      const { data: familyData, error: familyError } = await supabase
        .from('families')
        .select('*')
        .eq('id', memberData.family_id)
        .single();

      if (familyError) throw familyError;

      const family: Family = {
        id: familyData.id,
        name: familyData.name,
        inviteCode: familyData.invite_code,
        createdBy: familyData.created_by,
        createdAt: new Date(familyData.created_at),
      };

      set({
        family,
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch family error:', error);
      set({
        error: '가족 정보를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Fetch members
  fetchMembers: async (familyId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('family_members')
        .select(`
          *,
          user:users(id, name, avatar_url, role)
        `)
        .eq('family_id', familyId);

      if (error) throw error;

      const members: FamilyMember[] = data.map((m) => ({
        id: m.id,
        familyId: m.family_id,
        userId: m.user_id,
        user: m.user ? {
          id: m.user.id,
          name: m.user.name,
          avatarUrl: m.user.avatar_url,
          role: m.user.role as any,
        } : undefined,
        nickname: m.nickname || undefined,
        relationship: m.relationship,
        isPrimarySenior: m.is_primary_senior,
        joinedAt: new Date(m.joined_at),
        role: m.user?.role as any,
      }));

      set({
        members,
        familyMembers: members,
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch members error:', error);
      set({
        error: '가족 구성원을 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Alias for fetchMembers
  fetchFamilyMembers: async (familyId) => {
    return get().fetchMembers(familyId);
  },

  // Leave family
  leaveFamily: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Leave family in Supabase
      set({
        family: null,
        members: [],
        isLoading: false,
      });
      return true;
    } catch (error) {
      set({
        error: '가족 그룹에서 나가는데 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch encouragements
  fetchEncouragements: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Fetch from Supabase
      const unreadCount = mockEncouragements.filter((e) => !e.isRead).length;

      set({
        encouragements: mockEncouragements,
        unreadCount,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: '응원 메시지를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Send encouragement
  sendEncouragement: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const newEncouragement: Encouragement = {
        id: `enc-${Date.now()}`,
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        familyId: data.familyId,
        type: data.type,
        content: data.content || null,
        mediaUrl: data.mediaUrl || null,
        relatedRitualId: data.relatedRitualId || null,
        relatedGameSessionId: data.relatedGameSessionId || null,
        isRead: false,
        createdAt: new Date(),
      };

      // TODO: Save to Supabase

      set((state) => ({
        encouragements: [newEncouragement, ...state.encouragements],
        isLoading: false,
      }));

      return true;
    } catch (error) {
      set({
        error: '응원 메시지 전송에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Mark as read
  markAsRead: async (id) => {
    try {
      // TODO: Update in Supabase
      set((state) => ({
        encouragements: state.encouragements.map((e) =>
          e.id === id ? { ...e, isRead: true } : e
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  },

  markAllAsRead: async (userId) => {
    try {
      // TODO: Update in Supabase
      set((state) => ({
        encouragements: state.encouragements.map((e) =>
          e.toUserId === userId ? { ...e, isRead: true } : e
        ),
        unreadCount: 0,
      }));
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  },

  // Pre-recorded messages
  fetchPreRecordedMessages: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Fetch from Supabase
      set({
        preRecordedMessages: [],
        isLoading: false,
      });
    } catch (error) {
      set({
        error: '녹음 메시지를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  addPreRecordedMessage: async (message) => {
    set({ isLoading: true, error: null });
    try {
      const newMessage: PreRecordedMessage = {
        ...message,
        id: `msg-${Date.now()}`,
        createdAt: new Date(),
      };

      // TODO: Save to Supabase

      set((state) => ({
        preRecordedMessages: [...state.preRecordedMessages, newMessage],
        isLoading: false,
      }));

      return true;
    } catch (error) {
      set({
        error: '녹음 메시지 저장에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  deletePreRecordedMessage: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Delete from Supabase
      set((state) => ({
        preRecordedMessages: state.preRecordedMessages.filter((m) => m.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({
        error: '녹음 메시지 삭제에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Weekly report
  fetchWeeklyReport: async (userId) => {
    try {
      // TODO: Fetch from Supabase
      const mockReport: WeeklyReport = {
        userId,
        weekStart: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        weekEnd: new Date(),
        ritualsCompleted: 18,
        ritualsTotal: 21,
        ritualCompletionRate: 0.86,
        gameSessions: 5,
        avgAccuracy: 0.82,
        avgReactionTime: 450,
        accuracyChange: 5,
        currentStreak: 7,
        encouragementsReceived: 12,
        dailyData: [],
      };

      return mockReport;
    } catch (error) {
      console.error('Failed to fetch weekly report:', error);
      return null;
    }
  },
}));

export default useFamilyStore;
