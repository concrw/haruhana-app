// 산책 관련 타입 정의

export interface WalkingSession {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  totalSteps: number;
  distanceMeters: number;
  goalSteps: number;
  startedAt: Date | null;
  completedAt: Date | null;
  isCompleted: boolean;
  withCall: boolean;
  callDurationSeconds: number | null;
  createdAt: Date;
}

export interface DailySteps {
  userId: string;
  date: string; // YYYY-MM-DD
  totalSteps: number;
  distanceMeters: number;
}

export interface WalkingStats {
  today: DailySteps;
  weekly: DailySteps[];
  monthly: {
    totalSteps: number;
    totalDistanceKm: number;
    avgStepsPerDay: number;
    daysActive: number;
  };
  allTime: {
    totalSteps: number;
    totalDistanceKm: number;
    longestStreak: number;
    currentStreak: number;
  };
}

export type WalkingGoalLevel = 'light' | 'moderate' | 'active';

export interface WalkingGoal {
  level: WalkingGoalLevel;
  steps: number;
  distanceKm: number;
}

export interface WalkingReward {
  fruitType: string;
  quantity: number;
  reason: string;
}
