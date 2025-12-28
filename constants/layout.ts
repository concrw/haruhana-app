// 하루하나 레이아웃 시스템
// 시니어 친화적: 큰 터치 영역, 충분한 여백

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const LAYOUT = {
  // Screen dimensions
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,

  // Screen padding
  screenPaddingHorizontal: 24,
  screenPaddingTop: 16,
  screenPaddingBottom: 16,
  contentWidth: Math.min(SCREEN_WIDTH - 48, 345),

  // Spacing (8pt grid)
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    xxxl: 48,
  },

  // Border Radius
  radius: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  // Button Heights (시니어용 큰 버튼)
  buttonHeight: {
    small: 48,
    medium: 56,
    large: 64, // 시니어용 기본
  },

  // Touch targets (최소 56pt)
  touchTarget: {
    minimum: 48,
    recommended: 56,
    large: 64,
  },

  // Card dimensions
  card: {
    featureWidth: 166,
    featureHeight: 180,
    listHeight: 80,
    gap: 12,
  },

  // Tab bar
  tabBar: {
    height: 80,
    iconSize: 28,
  },

  // Header
  header: {
    height: 60,
  },

  // Icon sizes
  icon: {
    small: 20,
    medium: 24,
    large: 32,
    xlarge: 48,
  },

  // Game specific
  game: {
    fruitSize: 80,
    basketWidth: 120,
    basketHeight: 80,
  },
} as const;

export type SpacingKey = keyof typeof LAYOUT.spacing;
export type RadiusKey = keyof typeof LAYOUT.radius;
