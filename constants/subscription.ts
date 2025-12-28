// 구독 관련 상수

import { SubscriptionDuration, SubscriptionPlan } from '../types/subscription';

// 구독 플랜
export const SUBSCRIPTION_PLANS: Record<SubscriptionDuration, SubscriptionPlan> = {
  1: {
    duration: 1,
    price: 9900,
    discount: 0,
    label: '1개월',
    description: '월 9,900원',
  },
  3: {
    duration: 3,
    price: 27900,
    discount: 6,
    label: '3개월',
    description: '6% 할인',
  },
  6: {
    duration: 6,
    price: 54900,
    discount: 8,
    label: '6개월',
    description: '8% 할인',
  },
  12: {
    duration: 12,
    price: 99000,
    discount: 17,
    label: '1년',
    description: '17% 할인, 2개월 무료!',
  },
} as const;

// 선물 관련
export const GIFT_VALIDITY_DAYS = 30;

// 추천 플랜
export const RECOMMENDED_PLAN: SubscriptionDuration = 3;

// 선물 메시지 프리셋
export const GIFT_MESSAGE_PRESETS = [
  {
    emoji: '🎁',
    text: '같이 하자!',
  },
  {
    emoji: '💪',
    text: '건강하게 지내자!',
  },
  {
    emoji: '❤️',
    text: '항상 응원해!',
  },
  {
    emoji: '🌸',
    text: '생일 축하해요!',
  },
] as const;

// 갱신 넛지 타이밍 (일)
export const NUDGE_TIMINGS = {
  '2weeks': 14,
  '1week': 7,
  'last_day': 0,
} as const;

// 구독 텍스트
export const SUBSCRIPTION_TEXTS = {
  gift: {
    title: '친구와 함께 하기',
    subtitle: '친구에게 구독을 선물하고 함께 리추얼을 시작하세요!',
    recipientLabel: '받는 사람',
    recipientPlaceholder: '전화번호 입력',
    durationLabel: '선물 구독권 선택',
    messageLabel: '메시지 (선택)',
    messagePlaceholder: '친구에게 전할 메시지를 입력하세요',
    sendButton: '선물하기',
    successTitle: '선물 완료!',
    successMessage: '친구에게 카카오톡으로 선물이 전달되었어요.',
  },
  received: {
    title: '받은 선물',
    emptyText: '받은 선물이 없어요',
    acceptButton: '선물 받기',
    expiredText: '만료됨',
    from: '보낸 사람',
    expiresIn: '남은 기간',
  },
  status: {
    title: '구독 현황',
    activeLabel: '프리미엄 구독 중',
    expiresLabel: '만료 예정',
    freeLabel: '무료 플랜',
    upgradeButton: '프리미엄 시작하기',
    giftButton: '친구에게 선물하기',
  },
  renew: {
    title: '구독 갱신',
    expiringTitle: '구독이 곧 종료됩니다',
    expiredTitle: '구독이 종료되었습니다',
    usageTitle: '지난 사용 현황',
    renewButton: '갱신하기',
    askFamilyButton: '가족에게 부탁하기',
    giftFriendButton: '친구에게 선물하고 함께하기',
  },
  nudge: {
    '2weeks': {
      title: '구독 갱신 안내',
      body: (name: string) => `${name}님께 선물하신 구독이 2주 후 종료됩니다`,
    },
    '1week': {
      title: '구독 종료 안내',
      body: '선물받은 구독이 1주일 후 종료됩니다',
    },
    'last_day': {
      title: '구독이 오늘 종료됩니다',
      body: '오늘 자정에 구독이 종료됩니다',
    },
  },
} as const;

// 프리미엄 기능 목록
export const PREMIUM_FEATURES = [
  {
    emoji: '🧠',
    title: '모든 두뇌 게임',
    description: '다양한 인지 훈련 게임 이용',
  },
  {
    emoji: '📊',
    title: 'AI 건강 리포트',
    description: '맞춤형 건강 분석 리포트',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: '가족 무제한',
    description: '가족 구성원 무제한 초대',
  },
  {
    emoji: '🎙️',
    title: '음성 메시지',
    description: '무제한 음성 응원 저장',
  },
  {
    emoji: '📹',
    title: '영상 메시지',
    description: '영상 응원 녹화 및 저장',
  },
] as const;

// 결제 관련
export const PAYMENT_METHODS = [
  { id: 'kakaopay', label: '카카오페이', emoji: '💛' },
  { id: 'tosspay', label: '토스페이', emoji: '💙' },
  { id: 'card', label: '신용카드', emoji: '💳' },
] as const;
