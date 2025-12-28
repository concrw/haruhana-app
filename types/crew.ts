// 크루 관련 타입 정의

export type CrewRole = 'creator' | 'member';
export type CrewGoalType = 'continuous' | '30days_streak' | '1000_rituals' | 'custom';
export type SavingsStatus = 'active' | 'achieved' | 'cancelled';
export type CrewMessageType = 'text' | 'image' | 'system';
export type DepositorType = 'self' | 'family';

export interface Crew {
  id: string;
  name: string;
  description: string | null;
  creatorId: string;
  goalType: CrewGoalType;
  goalValue: number | null;
  inviteCode?: string;
  createdAt: Date;
}

export interface CrewMember {
  id: string;
  crewId: string;
  userId: string;
  role: CrewRole;
  joinedAt: Date;
  user?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CrewSavings {
  id: string;
  crewId: string;
  goalName: string;
  goalAmount: number;
  currentAmount: number;
  status: SavingsStatus;
  achievedAt: Date | null;
  createdAt: Date;
}

export interface CrewDeposit {
  id: string;
  savingsId: string;
  depositorId: string;
  depositorType: DepositorType;
  forMemberId: string;
  amount: number;
  message: string | null;
  depositedAt: Date;
  depositor?: {
    id: string;
    name: string;
  };
  forMember?: {
    id: string;
    name: string;
  };
}

export interface CrewMessage {
  id: string;
  crewId: string;
  senderId: string;
  message: string;
  messageType: CrewMessageType;
  sentAt: Date;
  sender?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface CrewFamilyAccess {
  id: string;
  crewId: string;
  familyUserId: string;
  crewMemberId: string;
  canViewStats: boolean;
  canSendMessages: boolean;
  canDeposit: boolean;
  grantedAt: Date;
}

export interface CrewStats {
  todayCompleted: number;
  todayTotal: number;
  weeklyCompleted: number;
  weeklyTotal: number;
  weeklyCompletionRate: number;
  totalRituals: number;
  goalProgress: number; // 0-100
}

export interface CrewLeaderboardEntry {
  userId: string;
  userName: string;
  userAvatar: string | null;
  rank: number;
  weeklyCompletions: number;
  firstFinishes: number; // 선착순
  fruitsCollected: number;
  currentStreak: number;
}

export interface CreateCrewData {
  name: string;
  description?: string;
  goalType: CrewGoalType;
  goalValue?: number;
  inviteUserIds?: string[];
}

export interface CreateSavingsData {
  crewId: string;
  goalName: string;
  goalAmount: number;
}

export interface DepositData {
  savingsId: string;
  depositorId: string;
  depositorType: DepositorType;
  forMemberId: string;
  amount: number;
  message?: string;
}
