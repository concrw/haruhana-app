// 구독 관련 타입 정의

export type SubscriptionDuration = 1 | 3 | 6 | 12;
export type GiftStatus = 'pending' | 'accepted' | 'expired';
export type NudgeType = '2weeks' | '1week' | 'last_day';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'none';

export interface Subscription {
  id: string;
  userId: string;
  planType: 'free' | 'premium';
  status: SubscriptionStatus;
  startedAt: Date;
  expiresAt: Date;
  giftId: string | null; // 선물로 받은 경우
  autoRenew?: boolean;
  createdAt: Date;
}

export interface SubscriptionGift {
  id: string;
  senderId: string;
  recipientPhone: string;
  recipientId: string | null;
  durationMonths: SubscriptionDuration;
  amount: number;
  status: GiftStatus;
  message: string | null;
  expiresAt: Date;
  acceptedAt: Date | null;
  createdAt?: Date;
  sender?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  recipient?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface RenewalNudge {
  id: string;
  subscriptionId: string;
  recipientId: string;
  senderId: string | null;
  nudgeType: NudgeType;
  isRead: boolean;
  createdAt: Date;
}

export interface SubscriptionPlan {
  duration: SubscriptionDuration;
  price: number;
  discount: number; // percentage
  label: string;
  description: string;
}

export interface SendGiftData {
  recipientPhone: string;
  durationMonths: SubscriptionDuration;
  message?: string;
}

export interface SubscriptionUsageStats {
  ritualsCompleted: number;
  gamesPlayed: number;
  streakDays: number;
  fruitsCollected: number;
  encouragementsReceived: number;
}
