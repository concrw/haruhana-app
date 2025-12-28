// 산책 관련 상수

import { WalkingGoal } from '../types/walking';

// 걸음 수 목표 설정
export const WALKING_GOALS: Record<string, WalkingGoal> = {
  light: {
    level: 'light',
    steps: 3000,
    distanceKm: 2.0,
  },
  moderate: {
    level: 'moderate',
    steps: 5000,
    distanceKm: 3.5,
  },
  active: {
    level: 'active',
    steps: 7000,
    distanceKm: 5.0,
  },
} as const;

// 보폭 계수 (신장 대비)
export const STRIDE_COEFFICIENTS = {
  senior: 0.40,  // 시니어용 (보수적)
  adult: 0.43,   // 성인용
} as const;

// 기본 보폭 (cm) - 신장을 모르는 경우
export const DEFAULT_STRIDE_LENGTH = 60; // 시니어 평균 보폭

// 산책 보상 (과일 지급)
export const WALKING_REWARDS = {
  goal_achieved: {
    fruitType: 'apple',
    quantity: 2,
    reason: '목표 달성',
  },
  goal_exceeded_20: {
    fruitType: 'orange',
    quantity: 1,
    reason: '목표 20% 초과',
  },
  streak_7days: {
    fruitType: 'grape',
    quantity: 5,
    reason: '7일 연속',
  },
  monthly_goal: {
    fruitType: 'greenApple',
    quantity: 10,
    reason: '월간 목표 달성',
  },
} as const;

// 센서 업데이트 주기 (ms)
export const PEDOMETER_UPDATE_INTERVAL = 1000; // 1초마다 업데이트

// 백그라운드 저장 주기 (걸음 수)
export const STEPS_SAVE_THRESHOLD = 100; // 100보마다 저장

// 목표 달성 알림 간격 (걸음 수)
export const MILESTONE_STEPS = [1000, 3000, 5000, 7000, 10000];

// 걸음 수 히스토리 보관 기간 (일)
export const STEPS_HISTORY_RETENTION_DAYS = 90;
