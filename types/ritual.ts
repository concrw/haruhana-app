// 의식(Ritual) 관련 타입 정의

export type RitualCategory = 'morning' | 'medication' | 'exercise' | 'social' | 'evening' | 'hobby' | 'learning' | 'health' | 'mind' | 'routine';
export type MoodType = 'great' | 'good' | 'okay' | 'tired';
export type DayOfWeek = 1 | 2 | 3 | 4 | 5 | 6 | 7; // 1=월, 7=일

export interface GuideStep {
  step: number;
  text: string;
  voiceUrl?: string;
  duration?: number; // seconds
}

export interface Ritual {
  id: string;
  category: RitualCategory;
  title: string;
  name?: string;  // alias for title
  emoji?: string; // alias for icon
  description: string | null;
  icon: string;
  defaultTime: string | null; // HH:mm format
  durationMinutes: number;
  duration?: number; // alias for durationMinutes (in minutes)
  guideSteps: GuideStep[];
  steps?: GuideStep[]; // alias for guideSteps
  isSystem: boolean;
  createdAt: Date;
}

export interface UserRitual {
  id: string;
  userId: string;
  ritualId: string;
  ritual?: Ritual;
  scheduledTime: string; // HH:mm format
  daysOfWeek: DayOfWeek[];
  isActive: boolean;
  reminderMinutes: number;
  createdAt: Date;
}

export interface RitualCompletion {
  id: string;
  userId: string;
  ritualId: string;
  completedAt: Date;
  durationSeconds: number | null;
  mood: MoodType | null;
  photoUrl: string | null;
  voiceMemoUrl: string | null;
  notes: string | null;
}

export interface TodayRitual extends UserRitual {
  isCompleted: boolean;
  completedAt?: Date;
}

export interface RitualPerformState {
  ritualId: string;
  currentStep: number;
  totalSteps: number;
  isPlaying: boolean;
  elapsedSeconds: number;
  mood: MoodType | null;
  photoUri: string | null;
  voiceMemoUri: string | null;
}

// 카테고리별 아이콘 및 색상 매핑
export const RITUAL_CATEGORY_CONFIG: Record<RitualCategory, { icon: string; color: string; label: string }> = {
  morning: { icon: '☀️', color: '#FFA94D', label: '아침 의식' },
  medication: { icon: '💊', color: '#FF6B6B', label: '건강 관리' },
  exercise: { icon: '🏃', color: '#69DB7C', label: '신체 운동' },
  social: { icon: '👥', color: '#B197FC', label: '사회 활동' },
  evening: { icon: '🌙', color: '#748FFC', label: '저녁 의식' },
  hobby: { icon: '🎨', color: '#F06595', label: '취미 활동' },
  learning: { icon: '📚', color: '#20C997', label: '배움' },
  health: { icon: '❤️', color: '#FF6B6B', label: '건강' },
  mind: { icon: '🧠', color: '#748FFC', label: '마음 챙김' },
  routine: { icon: '📋', color: '#868E96', label: '일상 루틴' },
};
