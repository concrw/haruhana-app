import { create } from 'zustand';
import {
  Ritual,
  UserRitual,
  TodayRitual,
  RitualCompletion,
  MoodType,
  RitualCategory,
} from '../types/ritual';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

interface RitualState {
  // State
  systemRituals: Ritual[];
  userRituals: UserRitual[];
  todayRituals: TodayRitual[];
  completedToday: string[]; // ritual IDs
  currentStreak: number;
  isLoading: boolean;
  error: string | null;

  // Current ritual being performed
  performingRitual: {
    ritualId: string | null;
    currentStep: number;
    totalSteps: number;
    isPlaying: boolean;
    elapsedSeconds: number;
    startedAt: Date | null;
  };

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Ritual management
  fetchSystemRituals: () => Promise<void>;
  fetchUserRituals: (userId: string) => Promise<void>;
  fetchTodayRituals: (userId: string) => Promise<void>;
  addUserRitual: (ritual: Omit<UserRitual, 'id' | 'createdAt'>) => Promise<boolean>;
  updateUserRitual: (id: string, data: Partial<UserRitual>) => Promise<boolean>;
  removeUserRitual: (id: string) => Promise<boolean>;

  // Ritual performance
  startRitual: (ritualId: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  setPlaying: (playing: boolean) => void;
  updateElapsed: (seconds: number) => void;
  completeRitual: (data: {
    mood?: MoodType;
    photoUri?: string;
    voiceMemoUri?: string;
    notes?: string;
  }) => Promise<boolean>;
  skipRitual: (ritualId: string) => Promise<boolean>;
  resetPerforming: () => void;

  // Stats
  fetchStreak: (userId: string) => Promise<void>;
}

// Mock 시스템 의식 데이터
const mockSystemRituals: Ritual[] = [
  {
    id: 'ritual-morning-stretch',
    category: 'morning',
    title: '아침 스트레칭',
    description: '하루를 시작하는 가벼운 스트레칭으로 몸을 깨워요',
    icon: '🧘',
    defaultTime: '07:00',
    durationMinutes: 10,
    guideSteps: [
      { step: 1, text: '편안하게 서서 심호흡을 해요', duration: 30 },
      { step: 2, text: '양팔을 위로 뻗어 기지개를 켜요', duration: 30 },
      { step: 3, text: '목을 좌우로 천천히 돌려요', duration: 30 },
      { step: 4, text: '어깨를 으쓱으쓱 풀어줘요', duration: 30 },
      { step: 5, text: '허리를 좌우로 천천히 돌려요', duration: 30 },
    ],
    isSystem: true,
    createdAt: new Date(),
  },
  {
    id: 'ritual-morning-medication',
    category: 'medication',
    title: '아침 약 복용',
    description: '아침 식사 후 약을 챙겨 드세요',
    icon: '💊',
    defaultTime: '08:00',
    durationMinutes: 2,
    guideSteps: [
      { step: 1, text: '약통에서 오늘 약을 꺼내요', duration: 10 },
      { step: 2, text: '물과 함께 약을 드세요', duration: 20 },
    ],
    isSystem: true,
    createdAt: new Date(),
  },
  {
    id: 'ritual-afternoon-walk',
    category: 'exercise',
    title: '산책하기',
    description: '동네 한 바퀴 걸으며 신선한 공기를 마셔요',
    icon: '🚶',
    defaultTime: '14:00',
    durationMinutes: 30,
    guideSteps: [
      { step: 1, text: '편한 신발을 신어요', duration: 60 },
      { step: 2, text: '집 주변을 천천히 걸어요', duration: 1200 },
      { step: 3, text: '중간에 벤치에 앉아 쉬어도 괜찮아요', duration: 300 },
    ],
    isSystem: true,
    createdAt: new Date(),
  },
  {
    id: 'ritual-evening-reflection',
    category: 'evening',
    title: '하루 돌아보기',
    description: '오늘 하루를 돌아보며 감사한 일을 생각해요',
    icon: '🌙',
    defaultTime: '21:00',
    durationMinutes: 5,
    guideSteps: [
      { step: 1, text: '오늘 감사한 일 세 가지를 떠올려요', duration: 60 },
      { step: 2, text: '내일 하고 싶은 일을 생각해요', duration: 60 },
      { step: 3, text: '편안한 마음으로 잠자리에 들 준비를 해요', duration: 60 },
    ],
    isSystem: true,
    createdAt: new Date(),
  },
];

const initialPerformingState = {
  ritualId: null,
  currentStep: 0,
  totalSteps: 0,
  isPlaying: false,
  elapsedSeconds: 0,
  startedAt: null,
};

export const useRitualStore = create<RitualState>((set, get) => ({
  // Initial state
  systemRituals: [],
  userRituals: [],
  todayRituals: [],
  completedToday: [],
  currentStreak: 0,
  isLoading: false,
  error: null,
  performingRitual: initialPerformingState,

  // Basic setters
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),

  // Fetch system rituals
  fetchSystemRituals: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('rituals')
        .select('*')
        .eq('is_system', true)
        .order('category', { ascending: true });

      if (error) throw error;

      const rituals: Ritual[] = data.map((r) => ({
        id: r.id,
        category: r.category as RitualCategory,
        title: r.title,
        description: r.description || '',
        icon: r.icon || '🌟',
        defaultTime: r.default_time,
        durationMinutes: r.duration_minutes,
        guideSteps: r.guide_steps as any,
        isSystem: r.is_system,
        createdAt: new Date(r.created_at),
      }));

      set({
        systemRituals: rituals,
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch system rituals error:', error);
      // Fallback to mock data if Supabase fails
      set({
        systemRituals: mockSystemRituals,
        isLoading: false,
      });
    }
  },

  // Fetch user's configured rituals
  fetchUserRituals: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_rituals')
        .select(`
          *,
          ritual:rituals(*)
        `)
        .eq('user_id', userId)
        .order('scheduled_time', { ascending: true });

      if (error) throw error;

      const userRituals: UserRitual[] = data.map((ur) => ({
        id: ur.id,
        userId: ur.user_id,
        ritualId: ur.ritual_id,
        ritual: ur.ritual ? {
          id: ur.ritual.id,
          category: ur.ritual.category as RitualCategory,
          title: ur.ritual.title,
          description: ur.ritual.description || '',
          icon: ur.ritual.icon || '🌟',
          defaultTime: ur.ritual.default_time,
          durationMinutes: ur.ritual.duration_minutes,
          guideSteps: ur.ritual.guide_steps as any,
          isSystem: ur.ritual.is_system,
          createdAt: new Date(ur.ritual.created_at),
        } : mockSystemRituals[0], // Fallback
        scheduledTime: ur.scheduled_time,
        daysOfWeek: ur.days_of_week,
        isActive: ur.is_active,
        reminderMinutes: ur.reminder_minutes,
        createdAt: new Date(ur.created_at),
      }));

      set({
        userRituals,
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch user rituals error:', error);
      set({
        error: '의식 설정을 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Fetch today's rituals
  fetchTodayRituals: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { userRituals } = get();

      // 오늘 요일에 해당하는 의식만 필터링
      const today = new Date().getDay() || 7; // Sunday = 0 -> 7
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      // Check which rituals have been completed today
      const { data: completions, error: completionsError } = await supabase
        .from('ritual_completions')
        .select('ritual_id, completed_at')
        .eq('user_id', userId)
        .gte('completed_at', todayStart.toISOString());

      if (completionsError) throw completionsError;

      const completedRitualIds = new Set(completions.map((c) => c.ritual_id));

      const todayRituals: TodayRitual[] = userRituals
        .filter((ur) => ur.daysOfWeek.includes(today as any) && ur.isActive)
        .map((ur) => ({
          ...ur,
          isCompleted: completedRitualIds.has(ur.ritualId),
          completedAt: completedRitualIds.has(ur.ritualId)
            ? completions.find((c) => c.ritual_id === ur.ritualId)?.completed_at
              ? new Date(completions.find((c) => c.ritual_id === ur.ritualId)!.completed_at)
              : undefined
            : undefined,
        }));

      set({
        todayRituals,
        completedToday: Array.from(completedRitualIds),
        isLoading: false,
      });
    } catch (error) {
      console.error('Fetch today rituals error:', error);
      set({
        error: '오늘의 의식을 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Add user ritual
  addUserRitual: async (ritual) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_rituals')
        .insert({
          user_id: ritual.userId,
          ritual_id: ritual.ritualId,
          scheduled_time: ritual.scheduledTime,
          days_of_week: ritual.daysOfWeek,
          is_active: ritual.isActive,
          reminder_minutes: ritual.reminderMinutes,
        })
        .select(`
          *,
          ritual:rituals(*)
        `)
        .single();

      if (error) throw error;

      const newRitual: UserRitual = {
        id: data.id,
        userId: data.user_id,
        ritualId: data.ritual_id,
        ritual: data.ritual ? {
          id: data.ritual.id,
          category: data.ritual.category as RitualCategory,
          title: data.ritual.title,
          description: data.ritual.description || '',
          icon: data.ritual.icon || '🌟',
          defaultTime: data.ritual.default_time,
          durationMinutes: data.ritual.duration_minutes,
          guideSteps: data.ritual.guide_steps as any,
          isSystem: data.ritual.is_system,
          createdAt: new Date(data.ritual.created_at),
        } : ritual.ritual,
        scheduledTime: data.scheduled_time,
        daysOfWeek: data.days_of_week,
        isActive: data.is_active,
        reminderMinutes: data.reminder_minutes,
        createdAt: new Date(data.created_at),
      };

      set((state) => ({
        userRituals: [...state.userRituals, newRitual],
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Add user ritual error:', error);
      set({
        error: '의식 추가에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Update user ritual
  updateUserRitual: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      const updateData: any = {};
      if (data.scheduledTime !== undefined) updateData.scheduled_time = data.scheduledTime;
      if (data.daysOfWeek !== undefined) updateData.days_of_week = data.daysOfWeek;
      if (data.isActive !== undefined) updateData.is_active = data.isActive;
      if (data.reminderMinutes !== undefined) updateData.reminder_minutes = data.reminderMinutes;

      const { error } = await supabase
        .from('user_rituals')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        userRituals: state.userRituals.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Update user ritual error:', error);
      set({
        error: '의식 수정에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Remove user ritual
  removeUserRitual: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('user_rituals')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        userRituals: state.userRituals.filter((r) => r.id !== id),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      console.error('Remove user ritual error:', error);
      set({
        error: '의식 삭제에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Start performing ritual
  startRitual: (ritualId) => {
    const { todayRituals, systemRituals } = get();
    const todayRitual = todayRituals.find((r) => r.ritualId === ritualId);
    const ritual = todayRitual?.ritual || systemRituals.find((r) => r.id === ritualId);

    if (!ritual) return;

    set({
      performingRitual: {
        ritualId,
        currentStep: 0,
        totalSteps: ritual.guideSteps.length,
        isPlaying: true,
        elapsedSeconds: 0,
        startedAt: new Date(),
      },
    });
  },

  nextStep: () => {
    set((state) => ({
      performingRitual: {
        ...state.performingRitual,
        currentStep: Math.min(
          state.performingRitual.currentStep + 1,
          state.performingRitual.totalSteps - 1
        ),
      },
    }));
  },

  prevStep: () => {
    set((state) => ({
      performingRitual: {
        ...state.performingRitual,
        currentStep: Math.max(state.performingRitual.currentStep - 1, 0),
      },
    }));
  },

  setPlaying: (playing) => {
    set((state) => ({
      performingRitual: {
        ...state.performingRitual,
        isPlaying: playing,
      },
    }));
  },

  updateElapsed: (seconds) => {
    set((state) => ({
      performingRitual: {
        ...state.performingRitual,
        elapsedSeconds: seconds,
      },
    }));
  },

  // Complete ritual
  completeRitual: async (data) => {
    const { performingRitual } = get();

    if (!performingRitual.ritualId) return false;

    set({ isLoading: true, error: null });

    try {
      // Get current user from auth store
      const authStore = (await import('./authStore')).useAuthStore;
      const userId = authStore.getState().user?.id;

      if (!userId) throw new Error('User not authenticated');

      // Save completion to Supabase
      const { data: completionData, error: completionError } = await supabase
        .from('ritual_completions')
        .insert({
          user_id: userId,
          ritual_id: performingRitual.ritualId,
          duration_seconds: performingRitual.elapsedSeconds,
          mood: data.mood || null,
          photo_url: data.photoUri || null,
          voice_memo_url: data.voiceMemoUri || null,
          notes: data.notes || null,
        })
        .select()
        .single();

      if (completionError) throw completionError;

      // 오늘 의식 상태 업데이트
      set((state) => ({
        todayRituals: state.todayRituals.map((r) =>
          r.ritualId === performingRitual.ritualId
            ? { ...r, isCompleted: true, completedAt: new Date() }
            : r
        ),
        completedToday: [...state.completedToday.filter((id): id is string => id !== null), performingRitual.ritualId].filter((id): id is string => id !== null),
        performingRitual: initialPerformingState,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Complete ritual error:', error);
      set({
        error: '의식 완료 저장에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  skipRitual: async (ritualId) => {
    set({ isLoading: true, error: null });
    try {
      // 스킵 처리 (기록은 남기지 않음)
      set((state) => ({
        todayRituals: state.todayRituals.map((r) =>
          r.ritualId === ritualId
            ? { ...r, isCompleted: true }
            : r
        ),
        isLoading: false,
      }));
      return true;
    } catch (error) {
      set({
        error: '처리에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  resetPerforming: () => {
    set({ performingRitual: initialPerformingState });
  },

  // Fetch streak
  fetchStreak: async (userId) => {
    try {
      // Calculate streak from ritual_completions
      const { data, error } = await supabase
        .from('ritual_completions')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(365); // Get last year of data

      if (error) throw error;

      if (!data || data.length === 0) {
        set({ currentStreak: 0 });
        return;
      }

      // Calculate streak
      let streak = 0;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const completionDates = data.map((c) => {
        const date = new Date(c.completed_at);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      });

      const uniqueDates = Array.from(new Set(completionDates)).sort((a, b) => b - a);

      // Check if completed today or yesterday (to continue streak)
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let checkDate = today.getTime();
      if (uniqueDates[0] === checkDate) {
        streak = 1;
        checkDate = yesterday.getTime();
      } else if (uniqueDates[0] === yesterday.getTime()) {
        streak = 1;
        checkDate = yesterday.getTime();
      } else {
        set({ currentStreak: 0 });
        return;
      }

      // Count consecutive days
      for (let i = 1; i < uniqueDates.length; i++) {
        const expectedDate = new Date(checkDate);
        expectedDate.setDate(expectedDate.getDate() - 1);

        if (uniqueDates[i] === expectedDate.getTime()) {
          streak++;
          checkDate = expectedDate.getTime();
        } else {
          break;
        }
      }

      set({ currentStreak: streak });
    } catch (error) {
      console.error('Failed to fetch streak:', error);
      set({ currentStreak: 0 });
    }
  },
}));

export default useRitualStore;
