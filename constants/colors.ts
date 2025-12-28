// 하루하나 색상 시스템
// 시니어 친화적: 따뜻한 색조 + 높은 명도 + 중간 채도

export const COLORS = {
  // Primary - 따뜻한 주황 계열
  primary: '#F7D786',
  primaryDark: '#FFCC90',
  primaryLight: '#FFF3E0',

  // Semantic (Fruits) - 과일 버튼 색상
  apple: '#FF6B6B',      // 빨강 - 시작, 중요
  orange: '#FFA94D',     // 주황 - 다음, 진행
  lemon: '#FFD43B',      // 노랑 - 뒤로, 취소
  grape: '#B197FC',      // 보라 - 보조
  greenApple: '#69DB7C', // 초록 - 완료, 성공
  green: '#4CAF50',      // 초록 - 성공, 올바름
  orangeRed: '#FF5733',  // 주황-빨강 - 오류, 틀림

  // Fruit Light colors (배경용)
  appleLight: '#FFE5E5',
  orangeLight: '#FFF0E0',
  lemonLight: '#FFF9E5',
  grapeLight: '#F0E8FF',
  greenAppleLight: '#E5F9E7',

  // Neutral
  textBlack: '#212121',
  textDark: '#212121',
  textGray: '#909090',
  textLight: '#BDBDBD',
  backgroundLight: '#F5F5F5',
  backgroundCream: '#FFF8F0',
  backgroundWarm: '#FFFBF5',
  white: '#FFFFFF',

  // Status
  error: '#FF6B6B',
  success: '#69DB7C',
  warning: '#FFD43B',
  info: '#74C0FC',

  // Game specific
  rottenFruit: '#8B4513', // 썩은 과일
  goldenFruit: '#FFD700', // 특별 과일

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

// 과일 색상 매핑
export const FRUIT_COLORS = {
  apple: COLORS.apple,
  orange: COLORS.orange,
  lemon: COLORS.lemon,
  grape: COLORS.grape,
  greenApple: COLORS.greenApple,
} as const;

// 과일 버튼 용도
export const FRUIT_BUTTON_USAGE = {
  apple: 'start',      // 시작, 중요
  orange: 'next',      // 다음, 진행
  lemon: 'back',       // 뒤로, 취소
  grape: 'secondary',  // 보조
  greenApple: 'complete', // 완료, 성공
} as const;

export type FruitType = keyof typeof FRUIT_COLORS;
export type ColorKey = keyof typeof COLORS;
