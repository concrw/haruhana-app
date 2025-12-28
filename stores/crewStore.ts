import { create } from 'zustand';
import {
  Crew,
  CrewMember,
  CrewSavings,
  CrewDeposit,
  CrewMessage,
  CrewStats,
  CrewLeaderboardEntry,
  CreateCrewData,
  CreateSavingsData,
  DepositData,
  CrewMessageType,
} from '../types/crew';
import { supabase } from '../lib/supabase';
import { crewService } from '../services/crew.service';

interface CrewState {
  // State
  crews: Crew[];
  currentCrew: Crew | null;
  members: CrewMember[];
  savings: CrewSavings | null;
  deposits: CrewDeposit[];
  messages: CrewMessage[];
  leaderboard: CrewLeaderboardEntry[];
  stats: CrewStats | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Crew management
  createCrew: (data: CreateCrewData) => Promise<string | null>;
  joinCrew: (inviteCode: string) => Promise<boolean>;
  fetchCrews: (userId: string) => Promise<void>;
  fetchCrewDetails: (crewId: string) => Promise<void>;
  fetchMembers: (crewId: string) => Promise<void>;
  leaveCrew: (crewId: string) => Promise<boolean>;
  setCurrentCrew: (crew: Crew | null) => void;

  // Leaderboard & Stats
  fetchLeaderboard: (crewId: string) => Promise<void>;
  fetchCrewStats: (crewId: string) => Promise<void>;

  // Savings
  createSavings: (data: CreateSavingsData) => Promise<boolean>;
  fetchSavings: (crewId: string) => Promise<void>;
  fetchDeposits: (savingsId: string) => Promise<void>;
  makeDeposit: (data: DepositData) => Promise<boolean>;

  // Chat
  fetchMessages: (crewId: string, limit?: number) => Promise<void>;
  sendMessage: (crewId: string, message: string, type?: CrewMessageType) => Promise<boolean>;
  subscribeToMessages: (crewId: string) => () => void;
}

export const useCrewStore = create<CrewState>((set, get) => ({
  // Initial state
  crews: [],
  currentCrew: null,
  members: [],
  savings: null,
  deposits: [],
  messages: [],
  leaderboard: [],
  stats: null,
  isLoading: false,
  error: null,

  // Basic setters
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setCurrentCrew: (crew) => set({ currentCrew: crew }),

  // Create a new crew
  createCrew: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const authStore = (await import('./authStore')).useAuthStore;
      const userId = authStore.getState().user?.id;

      if (!userId) throw new Error('로그인이 필요해요.');

      const inviteCode = crewService.generateInviteCode();

      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .insert({
          name: data.name,
          description: data.description || null,
          creator_id: userId,
          goal_type: data.goalType,
          goal_value: data.goalValue || null,
          invite_code: inviteCode,
        })
        .select()
        .single();

      if (crewError) throw crewError;

      // Add creator as first member
      await supabase.from('crew_members').insert({
        crew_id: crewData.id,
        user_id: userId,
        role: 'creator',
      });

      const newCrew: Crew = {
        id: crewData.id,
        name: crewData.name,
        description: crewData.description,
        creatorId: crewData.creator_id,
        goalType: crewData.goal_type,
        goalValue: crewData.goal_value,
        createdAt: new Date(crewData.created_at),
      };

      set((state) => ({
        crews: [...state.crews, newCrew],
        currentCrew: newCrew,
        isLoading: false,
      }));

      return inviteCode;
    } catch (error) {
      console.error('Create crew error:', error);
      set({
        error: '크루 생성에 실패했어요.',
        isLoading: false,
      });
      return null;
    }
  },

  // Join existing crew
  joinCrew: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const authStore = (await import('./authStore')).useAuthStore;
      const userId = authStore.getState().user?.id;

      if (!userId) throw new Error('로그인이 필요해요.');

      if (!crewService.validateInviteCode(inviteCode)) {
        throw new Error('잘못된 초대 코드예요.');
      }

      // Find crew by invite code
      const { data: crewData, error: crewError } = await supabase
        .from('crews')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single();

      if (crewError) throw new Error('크루를 찾을 수 없어요.');

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('crew_members')
        .select('id')
        .eq('crew_id', crewData.id)
        .eq('user_id', userId)
        .single();

      if (existingMember) {
        throw new Error('이미 가입된 크루예요.');
      }

      // Add user as member
      const { error: memberError } = await supabase
        .from('crew_members')
        .insert({
          crew_id: crewData.id,
          user_id: userId,
          role: 'member',
        });

      if (memberError) throw memberError;

      const crew: Crew = {
        id: crewData.id,
        name: crewData.name,
        description: crewData.description,
        creatorId: crewData.creator_id,
        goalType: crewData.goal_type,
        goalValue: crewData.goal_value,
        createdAt: new Date(crewData.created_at),
      };

      set((state) => ({
        crews: [...state.crews, crew],
        isLoading: false,
      }));

      return true;
    } catch (error: any) {
      console.error('Join crew error:', error);
      set({
        error: error.message || '크루 참여에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch user's crews
  fetchCrews: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crew_members')
        .select(`
          crew:crews(*)
        `)
        .eq('user_id', userId);

      if (error) throw error;

      const crews: Crew[] = data
        .filter((d) => d.crew && !Array.isArray(d.crew))
        .map((d) => {
          const crew = d.crew as any;
          return {
            id: crew.id,
            name: crew.name,
            description: crew.description,
            creatorId: crew.creator_id,
            goalType: crew.goal_type,
            goalValue: crew.goal_value,
            createdAt: new Date(crew.created_at),
          };
        });

      set({ crews, isLoading: false });
    } catch (error) {
      console.error('Fetch crews error:', error);
      set({
        error: '크루 목록을 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Fetch crew details
  fetchCrewDetails: async (crewId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crews')
        .select('*')
        .eq('id', crewId)
        .single();

      if (error) throw error;

      const crew: Crew = {
        id: data.id,
        name: data.name,
        description: data.description,
        creatorId: data.creator_id,
        goalType: data.goal_type,
        goalValue: data.goal_value,
        createdAt: new Date(data.created_at),
      };

      set({ currentCrew: crew, isLoading: false });
    } catch (error) {
      console.error('Fetch crew details error:', error);
      set({
        error: '크루 정보를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Fetch crew members
  fetchMembers: async (crewId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crew_members')
        .select(`
          *,
          user:users(id, name, avatar_url)
        `)
        .eq('crew_id', crewId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      const members: CrewMember[] = data.map((m) => ({
        id: m.id,
        crewId: m.crew_id,
        userId: m.user_id,
        role: m.role,
        joinedAt: new Date(m.joined_at),
        user: m.user ? {
          id: m.user.id,
          name: m.user.name,
          avatarUrl: m.user.avatar_url,
        } : undefined,
      }));

      set({ members, isLoading: false });
    } catch (error) {
      console.error('Fetch members error:', error);
      set({
        error: '크루원을 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Leave crew
  leaveCrew: async (crewId) => {
    set({ isLoading: true, error: null });
    try {
      const authStore = (await import('./authStore')).useAuthStore;
      const userId = authStore.getState().user?.id;

      if (!userId) throw new Error('로그인이 필요해요.');

      const { error } = await supabase
        .from('crew_members')
        .delete()
        .eq('crew_id', crewId)
        .eq('user_id', userId);

      if (error) throw error;

      set((state) => ({
        crews: state.crews.filter((c) => c.id !== crewId),
        currentCrew: state.currentCrew?.id === crewId ? null : state.currentCrew,
        isLoading: false,
      }));

      return true;
    } catch (error) {
      console.error('Leave crew error:', error);
      set({
        error: '크루 탈퇴에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch leaderboard
  fetchLeaderboard: async (crewId) => {
    set({ isLoading: true, error: null });
    try {
      const { members } = get();

      // Get weekly completions
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const memberIds = members.map((m) => m.userId);

      const { data: completions } = await supabase
        .from('ritual_completions')
        .select('user_id, completed_at')
        .in('user_id', memberIds)
        .gte('completed_at', weekStart.toISOString());

      const { data: fruits } = await supabase
        .from('collected_fruits')
        .select('user_id, quantity')
        .in('user_id', memberIds)
        .gte('created_at', weekStart.toISOString());

      const leaderboard = crewService.generateLeaderboard(
        members,
        (completions || []).map((c) => ({
          userId: c.user_id,
          completedAt: c.completed_at,
        })),
        (fruits || []).map((f) => ({
          userId: f.user_id,
          quantity: f.quantity,
        }))
      );

      set({ leaderboard, isLoading: false });
    } catch (error) {
      console.error('Fetch leaderboard error:', error);
      set({
        error: '리더보드를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Fetch crew stats
  fetchCrewStats: async (crewId) => {
    set({ isLoading: true, error: null });
    try {
      const { members, currentCrew } = get();

      if (!currentCrew) throw new Error('크루 정보가 없어요.');

      const today = new Date().toISOString().split('T')[0];
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 7);

      const memberIds = members.map((m) => m.userId);

      // Today's completions
      const { data: todayCompletions } = await supabase
        .from('ritual_completions')
        .select('user_id')
        .in('user_id', memberIds)
        .gte('completed_at', today);

      // Weekly completions
      const { data: weeklyCompletions } = await supabase
        .from('ritual_completions')
        .select('user_id, completed_at')
        .in('user_id', memberIds)
        .gte('completed_at', weekStart.toISOString());

      const stats = crewService.calculateCrewStats(
        members,
        (todayCompletions || []).map((c) => ({ userId: c.user_id })),
        (weeklyCompletions || []).map((c) => ({
          userId: c.user_id,
          date: c.completed_at.split('T')[0],
        })),
        currentCrew.goalType,
        currentCrew.goalValue
      );

      set({ stats, isLoading: false });
    } catch (error) {
      console.error('Fetch crew stats error:', error);
      set({
        error: '통계를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Create savings
  createSavings: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: savingsData, error } = await supabase
        .from('crew_savings')
        .insert({
          crew_id: data.crewId,
          goal_name: data.goalName,
          goal_amount: data.goalAmount,
          current_amount: 0,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;

      const savings: CrewSavings = {
        id: savingsData.id,
        crewId: savingsData.crew_id,
        goalName: savingsData.goal_name,
        goalAmount: savingsData.goal_amount,
        currentAmount: savingsData.current_amount,
        status: savingsData.status,
        achievedAt: null,
        createdAt: new Date(savingsData.created_at),
      };

      set({ savings, isLoading: false });
      return true;
    } catch (error) {
      console.error('Create savings error:', error);
      set({
        error: '모임통장 생성에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch savings
  fetchSavings: async (crewId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crew_savings')
        .select('*')
        .eq('crew_id', crewId)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        const savings: CrewSavings = {
          id: data.id,
          crewId: data.crew_id,
          goalName: data.goal_name,
          goalAmount: data.goal_amount,
          currentAmount: data.current_amount,
          status: data.status,
          achievedAt: data.achieved_at ? new Date(data.achieved_at) : null,
          createdAt: new Date(data.created_at),
        };

        set({ savings, isLoading: false });
      } else {
        set({ savings: null, isLoading: false });
      }
    } catch (error) {
      console.error('Fetch savings error:', error);
      set({
        error: '모임통장 정보를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Fetch deposits
  fetchDeposits: async (savingsId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crew_deposits')
        .select(`
          *,
          depositor:users!depositor_id(id, name),
          for_member:users!for_member_id(id, name)
        `)
        .eq('savings_id', savingsId)
        .order('deposited_at', { ascending: false });

      if (error) throw error;

      const deposits: CrewDeposit[] = data.map((d) => ({
        id: d.id,
        savingsId: d.savings_id,
        depositorId: d.depositor_id,
        depositorType: d.depositor_type,
        forMemberId: d.for_member_id,
        amount: d.amount,
        message: d.message,
        depositedAt: new Date(d.deposited_at),
        depositor: d.depositor,
        forMember: d.for_member,
      }));

      set({ deposits, isLoading: false });
    } catch (error) {
      console.error('Fetch deposits error:', error);
      set({
        error: '입금 내역을 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Make deposit
  makeDeposit: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: depositData, error } = await supabase
        .from('crew_deposits')
        .insert({
          savings_id: data.savingsId,
          depositor_id: data.depositorId,
          depositor_type: data.depositorType,
          for_member_id: data.forMemberId,
          amount: data.amount,
          message: data.message || null,
        })
        .select()
        .single();

      if (error) throw error;

      // Update savings current amount
      const { savings } = get();
      if (savings) {
        const newAmount = savings.currentAmount + data.amount;
        const isAchieved = newAmount >= savings.goalAmount;

        await supabase
          .from('crew_savings')
          .update({
            current_amount: newAmount,
            status: isAchieved ? 'achieved' : 'active',
            achieved_at: isAchieved ? new Date().toISOString() : null,
          })
          .eq('id', savings.id);

        set({
          savings: {
            ...savings,
            currentAmount: newAmount,
            status: isAchieved ? 'achieved' : 'active',
            achievedAt: isAchieved ? new Date() : null,
          },
        });
      }

      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('Make deposit error:', error);
      set({
        error: '입금에 실패했어요.',
        isLoading: false,
      });
      return false;
    }
  },

  // Fetch messages
  fetchMessages: async (crewId, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('crew_messages')
        .select(`
          *,
          sender:users(id, name, avatar_url)
        `)
        .eq('crew_id', crewId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const messages: CrewMessage[] = data.map((m) => ({
        id: m.id,
        crewId: m.crew_id,
        senderId: m.sender_id,
        message: m.message,
        messageType: m.message_type,
        sentAt: new Date(m.sent_at),
        sender: m.sender ? {
          id: m.sender.id,
          name: m.sender.name,
          avatarUrl: m.sender.avatar_url,
        } : undefined,
      })).reverse(); // Oldest first for display

      set({ messages, isLoading: false });
    } catch (error) {
      console.error('Fetch messages error:', error);
      set({
        error: '메시지를 불러오는데 실패했어요.',
        isLoading: false,
      });
    }
  },

  // Send message
  sendMessage: async (crewId, message, type = 'text') => {
    set({ error: null });
    try {
      const authStore = (await import('./authStore')).useAuthStore;
      const user = authStore.getState().user;

      if (!user) throw new Error('로그인이 필요해요.');

      const { data, error } = await supabase
        .from('crew_messages')
        .insert({
          crew_id: crewId,
          sender_id: user.id,
          message,
          message_type: type,
        })
        .select()
        .single();

      if (error) throw error;

      const newMessage: CrewMessage = {
        id: data.id,
        crewId: data.crew_id,
        senderId: data.sender_id,
        message: data.message,
        messageType: data.message_type,
        sentAt: new Date(data.sent_at),
        sender: {
          id: user.id,
          name: user.name,
          avatarUrl: user.avatarUrl,
        },
      };

      set((state) => ({
        messages: [...state.messages, newMessage],
      }));

      return true;
    } catch (error) {
      console.error('Send message error:', error);
      set({
        error: '메시지 전송에 실패했어요.',
      });
      return false;
    }
  },

  // Subscribe to real-time messages
  subscribeToMessages: (crewId) => {
    const channel = supabase
      .channel(`crew-messages-${crewId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'crew_messages',
          filter: `crew_id=eq.${crewId}`,
        },
        async (payload) => {
          const authStore = (await import('./authStore')).useAuthStore;
          const currentUserId = authStore.getState().user?.id;

          // Skip if it's our own message (already added)
          if (payload.new.sender_id === currentUserId) return;

          // Fetch sender info
          const { data: sender } = await supabase
            .from('users')
            .select('id, name, avatar_url')
            .eq('id', payload.new.sender_id)
            .single();

          const newMessage: CrewMessage = {
            id: payload.new.id,
            crewId: payload.new.crew_id,
            senderId: payload.new.sender_id,
            message: payload.new.message,
            messageType: payload.new.message_type,
            sentAt: new Date(payload.new.sent_at),
            sender: sender ? {
              id: sender.id,
              name: sender.name,
              avatarUrl: sender.avatar_url,
            } : undefined,
          };

          set((state) => ({
            messages: [...state.messages, newMessage],
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },
}));

export default useCrewStore;
