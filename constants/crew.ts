// 크루 관련 상수

import { CrewGoalType } from '../types/crew';

// 크루 제한
export const CREW_LIMITS = {
  minMembers: 3,
  maxMembers: 10,
  nameMaxLength: 100,
  descriptionMaxLength: 500,
  messageMaxLength: 1000,
} as const;

// 크루 목표 타입
export const CREW_GOALS: Record<CrewGoalType, { label: string; description: string; value: number | null }> = {
  continuous: {
    label: '함께 꾸준히',
    description: '목표 없이 함께 리추얼을 수행해요',
    value: null,
  },
  '30days_streak': {
    label: '30일 연속 전원 달성',
    description: '30일 동안 모든 크루원이 매일 완료해요',
    value: 30,
  },
  '1000_rituals': {
    label: '누적 1,000회 리추얼',
    description: '크루 전체 리추얼 1,000회를 달성해요',
    value: 1000,
  },
  custom: {
    label: '직접 입력',
    description: '원하는 목표를 직접 설정해요',
    value: null,
  },
} as const;

// 크루 역할
export const CREW_ROLES = {
  creator: {
    label: '크루장',
    emoji: '👑',
  },
  member: {
    label: '크루원',
    emoji: '👤',
  },
} as const;

// 모임통장 관련
export const SAVINGS_DEFAULTS = {
  minGoalAmount: 10000,
  maxGoalAmount: 10000000,
  suggestedAmounts: [100000, 300000, 500000, 1000000],
} as const;

// 입금 금액 옵션
export const DEPOSIT_AMOUNTS = [10000, 30000, 50000, 100000] as const;

// 리더보드 기간
export const LEADERBOARD_PERIODS = {
  week: {
    label: '이번 주',
    days: 7,
  },
  month: {
    label: '이번 달',
    days: 30,
  },
} as const;

// 크루 텍스트
export const CREW_TEXTS = {
  create: {
    title: '크루 만들기',
    subtitle: '친구들과 함께 리추얼을 시작하세요',
    namePlaceholder: '예: 청춘 3인방',
    descriptionPlaceholder: '예: 매일 아침 산책하는 친구들',
    inviteTitle: '초대할 친구',
    inviteSubtitle: '전화번호로 친구를 초대하세요',
  },
  home: {
    statsTitle: '크루 현황',
    goalTitle: '크루 목표',
    membersTitle: '크루원',
    chatTitle: '크루 채팅',
    savingsTitle: '크루 모임통장',
  },
  leaderboard: {
    title: '크루 리더보드',
    completedLabel: '완료',
    firstFinishLabel: '선착',
    fruitsLabel: '과일',
  },
  savings: {
    title: '크루 모임통장',
    goalLabel: '목표',
    currentLabel: '현재',
    remainingLabel: '남은 금액',
    depositButton: '입금하기',
    memberContribution: '크루원별 현황',
  },
  chat: {
    title: '크루 채팅',
    placeholder: '메시지를 입력하세요...',
  },
} as const;

// 시스템 메시지 템플릿
export const CREW_SYSTEM_MESSAGES = {
  memberJoined: (name: string) => `${name}님이 크루에 참여했어요!`,
  memberLeft: (name: string) => `${name}님이 크루를 떠났어요.`,
  goalAchieved: '크루 목표를 달성했어요! 축하해요! 🎉',
  savingsGoalAchieved: '모임통장 목표를 달성했어요! 🎊',
  firstComplete: (name: string) => `${name}님이 오늘 첫 완료! 🔥`,
  allComplete: '오늘 크루원 모두 완료! 👏',
} as const;

// 초대 코드 설정
export const INVITE_CODE_LENGTH = 6;
export const INVITE_CODE_EXPIRY_DAYS = 7;
