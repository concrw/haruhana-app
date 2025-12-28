// 사용자 관련 타입 정의

export type UserRole = 'senior' | 'family';
export type VoicePreference = 'male' | 'female';
export type FontSize = 'medium' | 'large' | 'xlarge';

export interface User {
  id: string;
  phone: string | null;
  email?: string | null;
  name: string;
  birthDate: Date | null;
  role: UserRole;
  familyId?: string | null;
  avatarUrl: string | null;
  voicePreference: VoicePreference;
  fontSize: FontSize;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserStats {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  totalRitualsCompleted: number;
  totalGameSessions: number;
  totalFruitsCollected: number;

  // 과일별 수집 현황
  fruitsApple: number;
  fruitsOrange: number;
  fruitsLemon: number;
  fruitsGrape: number;
  fruitsGreenApple: number;

  // 인지 점수 트렌드
  avgAccuracy7days: number | null;
  avgReactionTime7days: number | null;

  lastActivityAt: Date | null;
  updatedAt: Date;
}

export interface OnboardingState {
  step: number; // 1-6
  role: UserRole | null;
  name: string;
  birthDate: Date | null;
  familyCode: string;
  voicePreference: VoicePreference;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
