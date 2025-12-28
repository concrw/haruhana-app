/**
 * 구독 관련 상태 관리
 * 구독 현황, 선물, 갱신 넛지 등
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabase';
import { subscriptionService } from '../services/subscription.service';
import type {
  Subscription,
  SubscriptionGift,
  RenewalNudge,
  SubscriptionDuration,
} from '../types/subscription';

interface SubscriptionState {
  // 현재 구독
  currentSubscription: Subscription | null;

  // 보낸 선물
  sentGifts: SubscriptionGift[];

  // 받은 선물
  receivedGifts: SubscriptionGift[];

  // 갱신 넛지
  pendingNudges: RenewalNudge[];

  // 로딩 상태
  isLoading: boolean;
  error: string | null;
}

interface SubscriptionActions {
  // 구독 조회
  fetchSubscription: (userId: string) => Promise<void>;

  // 선물 보내기
  sendGift: (params: {
    senderId: string;
    recipientPhone: string;
    durationMonths: SubscriptionDuration;
    amount: number;
    message?: string;
  }) => Promise<SubscriptionGift | null>;

  // 선물 수락
  acceptGift: (giftId: string, recipientId: string) => Promise<boolean>;

  // 보낸 선물 조회
  fetchSentGifts: (userId: string) => Promise<void>;

  // 받은 선물 조회
  fetchReceivedGifts: (userId: string) => Promise<void>;

  // 구독 갱신
  renewSubscription: (params: {
    userId: string;
    durationMonths: SubscriptionDuration;
    amount: number;
  }) => Promise<boolean>;

  // 넛지 조회
  fetchPendingNudges: (userId: string) => Promise<void>;

  // 넛지 읽음 처리
  markNudgeAsRead: (nudgeId: string) => Promise<void>;

  // 구독 상태 확인
  checkSubscriptionStatus: () => {
    isActive: boolean;
    isPremium: boolean;
    isExpiringSoon: boolean;
    daysRemaining: number;
  };

  // 초기화
  reset: () => void;
}

const initialState: SubscriptionState = {
  currentSubscription: null,
  sentGifts: [],
  receivedGifts: [],
  pendingNudges: [],
  isLoading: false,
  error: null,
};

export const useSubscriptionStore = create<SubscriptionState & SubscriptionActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * 현재 사용자의 구독 정보 조회
       */
      fetchSubscription: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .order('expires_at', { ascending: false })
            .limit(1)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (data) {
            const d = data as any;
            const subscription: Subscription = {
              id: d.id,
              userId: d.user_id,
              planType: d.plan_type,
              status: d.status,
              startedAt: new Date(d.started_at),
              expiresAt: new Date(d.expires_at),
              giftId: d.gift_id || null,
              autoRenew: d.auto_renew || false,
              createdAt: new Date(d.created_at),
            };
            set({ currentSubscription: subscription });
          } else {
            set({ currentSubscription: null });
          }
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 선물 보내기
       */
      sendGift: async (params) => {
        set({ isLoading: true, error: null });

        try {
          const expiresAt = subscriptionService.calculateGiftExpiry();

          const { data, error } = await supabase
            .from('subscription_gifts')
            .insert({
              sender_id: params.senderId,
              recipient_phone: subscriptionService.normalizePhone(params.recipientPhone),
              duration_months: params.durationMonths,
              amount: params.amount,
              message: params.message || null,
              status: 'pending',
              expires_at: expiresAt.toISOString(),
            } as any)
            .select()
            .single();

          if (error) throw error;

          const d = data as any;
          const gift: SubscriptionGift = {
            id: d.id,
            senderId: d.sender_id,
            recipientPhone: d.recipient_phone,
            recipientId: d.recipient_id || null,
            durationMonths: d.duration_months,
            amount: d.amount,
            message: d.message || null,
            status: d.status,
            expiresAt: new Date(d.expires_at),
            acceptedAt: d.accepted_at ? new Date(d.accepted_at) : null,
            createdAt: new Date(d.created_at),
          };

          set((state) => ({
            sentGifts: [gift, ...state.sentGifts],
          }));

          return gift;
        } catch (error: any) {
          set({ error: error.message });
          return null;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 선물 수락
       */
      acceptGift: async (giftId: string, recipientId: string) => {
        set({ isLoading: true, error: null });

        try {
          // 선물 정보 조회
          const { data: gift, error: giftError } = await supabase
            .from('subscription_gifts')
            .select('*')
            .eq('id', giftId)
            .single();

          if (giftError) throw giftError;

          const g = gift as any;
          if (g.status !== 'pending') {
            throw new Error('이미 처리된 선물입니다');
          }

          if (new Date(g.expires_at) < new Date()) {
            throw new Error('만료된 선물입니다');
          }

          // 구독 시작일/만료일 계산
          const startDate = new Date();
          const expiryDate = subscriptionService.calculateSubscriptionExpiry(
            startDate,
            g.duration_months
          );

          // 트랜잭션: 선물 상태 업데이트 + 구독 생성
          const { error: updateError } = await (supabase
            .from('subscription_gifts') as any)
            .update({
              status: 'accepted',
              recipient_id: recipientId,
              accepted_at: new Date().toISOString(),
            })
            .eq('id', giftId);

          if (updateError) throw updateError;

          // 구독 생성
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: recipientId,
              plan_type: 'premium',
              status: 'active',
              started_at: startDate.toISOString(),
              expires_at: expiryDate.toISOString(),
              gift_id: giftId,
              auto_renew: false,
            } as any);

          if (subError) throw subError;

          // 상태 업데이트
          set((state) => ({
            receivedGifts: state.receivedGifts.map((g) =>
              g.id === giftId
                ? { ...g, status: 'accepted' as const, acceptedAt: new Date(), recipientId }
                : g
            ),
          }));

          // 구독 정보 다시 조회
          await get().fetchSubscription(recipientId);

          return true;
        } catch (error: any) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 보낸 선물 목록 조회
       */
      fetchSentGifts: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('subscription_gifts')
            .select(`
              *,
              recipient:users!subscription_gifts_recipient_id_fkey(id, name, avatar_url)
            `)
            .eq('sender_id', userId)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const gifts: SubscriptionGift[] = (data || []).map((g: any) => ({
            id: g.id,
            senderId: g.sender_id,
            recipientPhone: g.recipient_phone,
            recipientId: g.recipient_id || null,
            durationMonths: g.duration_months,
            amount: g.amount,
            message: g.message || null,
            status: g.status,
            expiresAt: new Date(g.expires_at),
            acceptedAt: g.accepted_at ? new Date(g.accepted_at) : null,
            createdAt: new Date(g.created_at),
            recipient: g.recipient || null,
          }));

          set({ sentGifts: gifts });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 받은 선물 목록 조회 (전화번호 기반)
       */
      fetchReceivedGifts: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          // 사용자 전화번호 조회
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('phone')
            .eq('id', userId)
            .single();

          if (userError) throw userError;

          const u = userData as any;
          if (!u?.phone) {
            set({ receivedGifts: [] });
            return;
          }

          const normalizedPhone = subscriptionService.normalizePhone(u.phone);

          const { data, error } = await supabase
            .from('subscription_gifts')
            .select(`
              *,
              sender:users!subscription_gifts_sender_id_fkey(id, name, avatar_url)
            `)
            .or(`recipient_phone.eq.${normalizedPhone},recipient_id.eq.${userId}`)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const gifts: SubscriptionGift[] = (data || []).map((g: any) => ({
            id: g.id,
            senderId: g.sender_id,
            recipientPhone: g.recipient_phone,
            recipientId: g.recipient_id || null,
            durationMonths: g.duration_months,
            amount: g.amount,
            message: g.message || null,
            status: g.status,
            expiresAt: new Date(g.expires_at),
            acceptedAt: g.accepted_at ? new Date(g.accepted_at) : null,
            createdAt: new Date(g.created_at),
            sender: g.sender || null,
          }));

          set({ receivedGifts: gifts });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 구독 갱신
       */
      renewSubscription: async (params) => {
        set({ isLoading: true, error: null });

        try {
          const { currentSubscription } = get();

          // 새 구독 시작일 계산 (기존 구독이 있으면 만료일부터, 없으면 오늘부터)
          const startDate = currentSubscription && new Date(currentSubscription.expiresAt) > new Date()
            ? new Date(currentSubscription.expiresAt)
            : new Date();

          const expiryDate = subscriptionService.calculateSubscriptionExpiry(
            startDate,
            params.durationMonths
          );

          // 기존 구독 비활성화
          if (currentSubscription) {
            await (supabase
              .from('subscriptions') as any)
              .update({ status: 'expired' })
              .eq('id', currentSubscription.id);
          }

          // 새 구독 생성
          const { data, error } = await supabase
            .from('subscriptions')
            .insert({
              user_id: params.userId,
              plan_type: 'premium',
              status: 'active',
              started_at: startDate.toISOString(),
              expires_at: expiryDate.toISOString(),
              auto_renew: false,
            } as any)
            .select()
            .single();

          if (error) throw error;

          const d = data as any;
          const subscription: Subscription = {
            id: d.id,
            userId: d.user_id,
            planType: d.plan_type,
            status: d.status,
            startedAt: new Date(d.started_at),
            expiresAt: new Date(d.expires_at),
            giftId: d.gift_id || null,
            autoRenew: d.auto_renew || false,
            createdAt: new Date(d.created_at),
          };

          set({ currentSubscription: subscription });

          return true;
        } catch (error: any) {
          set({ error: error.message });
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 갱신 넛지 조회
       */
      fetchPendingNudges: async (userId: string) => {
        set({ isLoading: true, error: null });

        try {
          const { data, error } = await supabase
            .from('renewal_nudges')
            .select('*')
            .eq('recipient_id', userId)
            .eq('is_read', false)
            .order('created_at', { ascending: false });

          if (error) throw error;

          const nudges: RenewalNudge[] = (data || []).map((n: any) => ({
            id: n.id,
            subscriptionId: n.subscription_id,
            recipientId: n.recipient_id,
            senderId: n.sender_id || null,
            nudgeType: n.nudge_type,
            isRead: n.is_read,
            createdAt: new Date(n.created_at),
          }));

          set({ pendingNudges: nudges });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      /**
       * 넛지 읽음 처리
       */
      markNudgeAsRead: async (nudgeId: string) => {
        try {
          const { error } = await (supabase
            .from('renewal_nudges') as any)
            .update({ is_read: true })
            .eq('id', nudgeId);

          if (error) throw error;

          set((state) => ({
            pendingNudges: state.pendingNudges.filter((n) => n.id !== nudgeId),
          }));
        } catch (error: any) {
          console.error('Failed to mark nudge as read:', error);
        }
      },

      /**
       * 구독 상태 확인
       */
      checkSubscriptionStatus: () => {
        const { currentSubscription } = get();
        return subscriptionService.checkSubscriptionStatus(currentSubscription);
      },

      /**
       * 상태 초기화
       */
      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        currentSubscription: state.currentSubscription,
      }),
    }
  )
);
