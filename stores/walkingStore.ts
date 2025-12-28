import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { walkingService } from '../services/walking.service';
import { WALKING_GOALS, WALKING_REWARDS } from '../constants/walking';
import type { WalkingSession, DailySteps, WalkingStats, WalkingGoalLevel } from '../types/walking';

interface WalkingStore {
  // State
  todaySteps: number;
  todayDistance: number;
  goalSteps: number;
  goalLevel: WalkingGoalLevel;
  currentSession: WalkingSession | null;
  dailyStats: DailySteps | null;
  weeklyData: DailySteps[];
  isTracking: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setGoalLevel: (level: WalkingGoalLevel) => void;
  startWalkingSession: (withCall?: boolean) => Promise<void>;
  updateSteps: (steps: number) => void;
  completeSession: () => Promise<void>;
  fetchTodaySteps: () => Promise<void>;
  fetchWeeklyData: () => Promise<void>;
  fetchStats: () => Promise<WalkingStats | null>;
  resetDay: () => void;
}

export const useWalkingStore = create<WalkingStore>()(
  persist(
    (set, get) => ({
      // Initial state
      todaySteps: 0,
      todayDistance: 0,
      goalSteps: WALKING_GOALS.moderate.steps,
      goalLevel: 'moderate',
      currentSession: null,
      dailyStats: null,
      weeklyData: [],
      isTracking: false,
      isLoading: false,
      error: null,

      // 목표 레벨 설정
      setGoalLevel: (level) => {
        const goal = WALKING_GOALS[level];
        set({
          goalLevel: level,
          goalSteps: goal.steps,
        });
      },

      // 산책 세션 시작
      startWalkingSession: async (withCall = false) => {
        set({ isLoading: true, error: null });

        try {
          // Pedometer 권한 확인
          const hasPermission = await walkingService.isPedometerAvailable();
          if (!hasPermission) {
            const granted = await walkingService.requestPermissions();
            if (!granted) {
              throw new Error('걸음 수 측정 권한이 필요합니다.');
            }
          }

          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) throw new Error('로그인이 필요합니다.');

          const today = new Date().toISOString().split('T')[0];
          const { goalSteps } = get();

          // 세션 생성
          const { data: session, error } = await supabase
            .from('walking_sessions')
            .insert({
              user_id: userId,
              date: today,
              goal_steps: goalSteps,
              started_at: new Date().toISOString(),
              with_call: withCall,
            })
            .select()
            .single();

          if (error) throw error;

          const newSession: WalkingSession = {
            id: session.id,
            userId: session.user_id,
            date: session.date,
            totalSteps: session.total_steps,
            distanceMeters: session.distance_meters,
            goalSteps: session.goal_steps,
            startedAt: new Date(session.started_at),
            completedAt: session.completed_at ? new Date(session.completed_at) : null,
            isCompleted: session.is_completed,
            withCall: session.with_call,
            callDurationSeconds: session.call_duration_seconds,
            createdAt: new Date(session.created_at),
          };

          set({
            currentSession: newSession,
            isTracking: true,
            isLoading: false,
          });

          // 실시간 걸음 수 측정 시작
          walkingService.startPedometer((steps) => {
            get().updateSteps(steps);
          });
        } catch (error: any) {
          console.error('Failed to start walking session:', error);
          set({
            error: error.message || '산책 시작에 실패했어요.',
            isLoading: false,
          });
        }
      },

      // 걸음 수 업데이트
      updateSteps: (steps) => {
        const { currentSession } = get();
        if (!currentSession) return;

        const distance = walkingService.calculateDistance(steps);

        set({
          todaySteps: steps,
          todayDistance: distance,
        });

        // Supabase 업데이트 (100보마다)
        if (steps % 100 === 0 && currentSession) {
          supabase
            .from('walking_sessions')
            .update({
              total_steps: steps,
              distance_meters: distance,
            })
            .eq('id', currentSession.id)
            .then();
        }
      },

      // 산책 완료
      completeSession: async () => {
        set({ isLoading: true, error: null });

        try {
          const { currentSession, todaySteps, todayDistance, goalSteps } = get();
          if (!currentSession) throw new Error('진행 중인 세션이 없습니다.');

          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) throw new Error('로그인이 필요합니다.');

          // 세션 완료 처리
          const { error: updateError } = await supabase
            .from('walking_sessions')
            .update({
              total_steps: todaySteps,
              distance_meters: todayDistance,
              completed_at: new Date().toISOString(),
              is_completed: true,
            })
            .eq('id', currentSession.id);

          if (updateError) throw updateError;

          // 목표 달성 시 과일 보상
          if (todaySteps >= goalSteps) {
            const reward = WALKING_REWARDS.goal_achieved;

            await supabase.from('collected_fruits').insert({
              user_id: userId,
              fruit_type: reward.fruitType,
              quantity: reward.quantity,
              source: 'ritual',
              source_id: currentSession.id,
            });

            // 20% 초과 보너스
            if (todaySteps >= goalSteps * 1.2) {
              const bonusReward = WALKING_REWARDS.goal_exceeded_20;
              await supabase.from('collected_fruits').insert({
                user_id: userId,
                fruit_type: bonusReward.fruitType,
                quantity: bonusReward.quantity,
                source: 'ritual',
                source_id: currentSession.id,
              });
            }
          }

          // Pedometer 중지
          walkingService.stopPedometer();

          set({
            currentSession: null,
            isTracking: false,
            isLoading: false,
          });

          // 오늘 통계 갱신
          await get().fetchTodaySteps();
        } catch (error: any) {
          console.error('Failed to complete walking session:', error);
          set({
            error: error.message || '산책 완료에 실패했어요.',
            isLoading: false,
          });
        }
      },

      // 오늘 걸음 수 조회
      fetchTodaySteps: async () => {
        set({ isLoading: true, error: null });

        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) return;

          const today = new Date().toISOString().split('T')[0];

          const { data, error } = await supabase
            .from('daily_steps')
            .select('*')
            .eq('user_id', userId)
            .eq('date', today)
            .single();

          if (error && error.code !== 'PGRST116') throw error;

          if (data) {
            const dailyStats: DailySteps = {
              userId: data.user_id,
              date: data.date,
              totalSteps: data.total_steps,
              distanceMeters: data.distance_meters,
            };

            set({
              dailyStats,
              todaySteps: data.total_steps,
              todayDistance: data.distance_meters,
              isLoading: false,
            });
          } else {
            set({
              dailyStats: null,
              todaySteps: 0,
              todayDistance: 0,
              isLoading: false,
            });
          }
        } catch (error: any) {
          console.error('Failed to fetch today steps:', error);
          set({
            error: error.message || '걸음 수 조회에 실패했어요.',
            isLoading: false,
          });
        }
      },

      // 주간 데이터 조회
      fetchWeeklyData: async () => {
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) return;

          // 최근 7일
          const endDate = new Date();
          const startDate = new Date();
          startDate.setDate(endDate.getDate() - 7);

          const { data, error } = await supabase
            .from('daily_steps')
            .select('*')
            .eq('user_id', userId)
            .gte('date', startDate.toISOString().split('T')[0])
            .lte('date', endDate.toISOString().split('T')[0])
            .order('date', { ascending: true });

          if (error) throw error;

          const weeklyData: DailySteps[] = (data || []).map((d) => ({
            userId: d.user_id,
            date: d.date,
            totalSteps: d.total_steps,
            distanceMeters: d.distance_meters,
          }));

          set({ weeklyData });
        } catch (error: any) {
          console.error('Failed to fetch weekly data:', error);
        }
      },

      // 통계 조회
      fetchStats: async () => {
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (!userId) return null;

          // 오늘 통계
          await get().fetchTodaySteps();
          await get().fetchWeeklyData();

          const { dailyStats, weeklyData, goalSteps } = get();

          // 월간 통계
          const monthStart = new Date();
          monthStart.setDate(1);

          const { data: monthlyData } = await supabase
            .from('daily_steps')
            .select('*')
            .eq('user_id', userId)
            .gte('date', monthStart.toISOString().split('T')[0]);

          const monthlySteps = (monthlyData || []).reduce(
            (sum, d) => sum + d.total_steps,
            0
          );
          const monthlyDistance = (monthlyData || []).reduce(
            (sum, d) => sum + d.distance_meters,
            0
          );

          // 전체 통계
          const { data: allTimeData } = await supabase
            .from('daily_steps')
            .select('*')
            .eq('user_id', userId);

          const allTimeSteps = (allTimeData || []).reduce(
            (sum, d) => sum + d.total_steps,
            0
          );
          const allTimeDistance = (allTimeData || []).reduce(
            (sum, d) => sum + d.distance_meters,
            0
          );

          const currentStreak = walkingService.calculateStreak(
            allTimeData || [],
            goalSteps
          );

          const stats: WalkingStats = {
            today: dailyStats || {
              userId,
              date: new Date().toISOString().split('T')[0],
              totalSteps: 0,
              distanceMeters: 0,
            },
            weekly: weeklyData,
            monthly: {
              totalSteps: monthlySteps,
              totalDistanceKm: monthlyDistance / 1000,
              avgStepsPerDay: Math.round(monthlySteps / (monthlyData?.length || 1)),
              daysActive: monthlyData?.length || 0,
            },
            allTime: {
              totalSteps: allTimeSteps,
              totalDistanceKm: allTimeDistance / 1000,
              longestStreak: currentStreak,
              currentStreak,
            },
          };

          return stats;
        } catch (error: any) {
          console.error('Failed to fetch stats:', error);
          return null;
        }
      },

      // 하루 리셋 (디버깅용)
      resetDay: () => {
        set({
          todaySteps: 0,
          todayDistance: 0,
          currentSession: null,
          isTracking: false,
        });
      },
    }),
    {
      name: 'walking-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        goalSteps: state.goalSteps,
        goalLevel: state.goalLevel,
      }),
    }
  )
);

export default useWalkingStore;
