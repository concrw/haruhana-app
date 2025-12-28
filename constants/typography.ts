// 하루하나 타이포그래피 시스템
// 시니어 친화적: 큰 글씨, 높은 line-height

export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System', // Pretendard-Regular (나중에 폰트 로드)
    medium: 'System',  // Pretendard-Medium
    semiBold: 'System', // Pretendard-SemiBold
    bold: 'System',     // Pretendard-Bold
  },

  // 시니어 최적화 크기 (일반 앱보다 2pt씩 크게)
  fontSize: {
    xs: 12,
    sm: 14,
    base: 18,    // 일반 16pt → 시니어 18pt
    lg: 20,
    xl: 24,
    xxl: 28,
    '2xl': 28,
    xxxl: 36,
    '3xl': 32,
    '4xl': 40,
    hero: 48,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },

  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },
} as const;

// 미리 정의된 텍스트 스타일
export const TEXT_STYLES = {
  // 제목
  heading1: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700' as const,
    lineHeight: TYPOGRAPHY.fontSize['3xl'] * TYPOGRAPHY.lineHeight.tight,
  },
  heading2: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700' as const,
    lineHeight: TYPOGRAPHY.fontSize['2xl'] * TYPOGRAPHY.lineHeight.tight,
  },
  heading3: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600' as const,
    lineHeight: TYPOGRAPHY.fontSize.xl * TYPOGRAPHY.lineHeight.tight,
  },

  // 본문
  body: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '400' as const,
    lineHeight: TYPOGRAPHY.fontSize.base * TYPOGRAPHY.lineHeight.relaxed,
  },
  bodyLarge: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '400' as const,
    lineHeight: TYPOGRAPHY.fontSize.lg * TYPOGRAPHY.lineHeight.relaxed,
  },
  bodySmall: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '400' as const,
    lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.relaxed,
  },

  // 버튼
  button: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600' as const,
    lineHeight: TYPOGRAPHY.fontSize.lg * TYPOGRAPHY.lineHeight.normal,
  },
  buttonSmall: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600' as const,
    lineHeight: TYPOGRAPHY.fontSize.base * TYPOGRAPHY.lineHeight.normal,
  },

  // 라벨
  label: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500' as const,
    lineHeight: TYPOGRAPHY.fontSize.sm * TYPOGRAPHY.lineHeight.normal,
  },
  labelLarge: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500' as const,
    lineHeight: TYPOGRAPHY.fontSize.base * TYPOGRAPHY.lineHeight.normal,
  },

  // 캡션
  caption: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '400' as const,
    lineHeight: TYPOGRAPHY.fontSize.xs * TYPOGRAPHY.lineHeight.normal,
  },
} as const;

export type FontSizeKey = keyof typeof TYPOGRAPHY.fontSize;
