import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FRUITS } from '../../constants/fruits';

const { width } = Dimensions.get('window');

interface GameResultCardProps {
  title: string;
  emoji: string;
  stats: Array<{
    label: string;
    value: string | number;
    highlight?: boolean;
  }>;
  fruitsEarned?: {
    fruitId: string;
    count: number;
  };
}

export const GameResultCard: React.FC<GameResultCardProps> = ({
  title,
  emoji,
  stats,
  fruitsEarned,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fruit = fruitsEarned ? FRUITS[fruitsEarned.fruitId as keyof typeof FRUITS] : null;

  return (
    <View style={styles.resultContainer}>
      <Animated.View
        style={[styles.celebrationCard, { transform: [{ scale: scaleAnim }] }]}
      >
        <Text style={styles.celebrationEmoji}>{emoji}</Text>
        <Text style={styles.celebrationTitle}>{title}</Text>
      </Animated.View>

      <Animated.View style={[styles.statsContainer, { opacity: fadeAnim }]}>
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View
              key={index}
              style={[
                styles.statBox,
                stat.highlight && styles.statBoxHighlight,
              ]}
            >
              <Text
                style={[
                  styles.statValue,
                  stat.highlight && styles.statValueHighlight,
                ]}
              >
                {stat.value}
              </Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {fruitsEarned && fruit && fruitsEarned.count > 0 && (
          <View style={styles.fruitEarnedCard}>
            <Text style={styles.fruitEarnedEmoji}>{fruit.emoji}</Text>
            <Text style={styles.fruitEarnedValue}>+{fruitsEarned.count}</Text>
            <Text style={styles.fruitEarnedLabel}>획득!</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
};

interface AccuracyMeterProps {
  accuracy: number;
  size?: 'small' | 'medium' | 'large';
}

export const AccuracyMeter: React.FC<AccuracyMeterProps> = ({
  accuracy,
  size = 'medium',
}) => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: accuracy,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [accuracy]);

  const sizes = {
    small: { outer: 80, inner: 60, fontSize: 18 },
    medium: { outer: 120, inner: 96, fontSize: 24 },
    large: { outer: 160, inner: 128, fontSize: 32 },
  };

  const sizeConfig = sizes[size];

  const getColor = () => {
    if (accuracy >= 80) return COLORS.greenApple;
    if (accuracy >= 60) return COLORS.orange;
    return COLORS.apple;
  };

  return (
    <View
      style={[
        styles.accuracyMeter,
        {
          width: sizeConfig.outer,
          height: sizeConfig.outer,
          borderRadius: sizeConfig.outer / 2,
          borderColor: getColor(),
        },
      ]}
    >
      <View
        style={[
          styles.accuracyInner,
          {
            width: sizeConfig.inner,
            height: sizeConfig.inner,
            borderRadius: sizeConfig.inner / 2,
          },
        ]}
      >
        <Text style={[styles.accuracyValue, { fontSize: sizeConfig.fontSize }]}>
          {Math.round(accuracy)}%
        </Text>
        <Text style={styles.accuracyLabel}>정확도</Text>
      </View>
    </View>
  );
};

interface ReactionTimeMeterProps {
  reactionTime: number; // milliseconds
  benchmark?: number; // target reaction time
}

export const ReactionTimeMeter: React.FC<ReactionTimeMeterProps> = ({
  reactionTime,
  benchmark = 500,
}) => {
  const isFast = reactionTime <= benchmark;

  return (
    <View style={styles.reactionTimeMeter}>
      <View style={styles.reactionTimeHeader}>
        <Text style={styles.reactionTimeEmoji}>⚡</Text>
        <Text style={styles.reactionTimeLabel}>반응 속도</Text>
      </View>
      <Text
        style={[
          styles.reactionTimeValue,
          { color: isFast ? COLORS.greenApple : COLORS.orange },
        ]}
      >
        {reactionTime}ms
      </Text>
      <Text style={styles.reactionTimeStatus}>
        {isFast ? '빠른 편이에요!' : '조금 더 빠르게!'}
      </Text>
    </View>
  );
};

interface LevelUpCardProps {
  previousLevel: number;
  newLevel: number;
  visible: boolean;
}

export const LevelUpCard: React.FC<LevelUpCardProps> = ({
  previousLevel,
  newLevel,
  visible,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[styles.levelUpCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.levelUpEmoji}>🎊</Text>
      <Text style={styles.levelUpTitle}>레벨 업!</Text>
      <View style={styles.levelUpDetails}>
        <Text style={styles.levelUpPrevious}>Lv.{previousLevel}</Text>
        <Text style={styles.levelUpArrow}>→</Text>
        <Text style={styles.levelUpNew}>Lv.{newLevel}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  resultContainer: {
    alignItems: 'center',
    gap: LAYOUT.spacing.xl,
  },
  celebrationCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xxl,
    alignItems: 'center',
    width: '100%',
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.md,
  },
  celebrationTitle: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  statsContainer: {
    width: '100%',
    gap: LAYOUT.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
  },
  statBox: {
    width: (width - LAYOUT.screenPaddingHorizontal * 2 - LAYOUT.spacing.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  statBoxHighlight: {
    backgroundColor: COLORS.greenAppleLight,
    borderWidth: 2,
    borderColor: COLORS.greenApple,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  statValueHighlight: {
    color: COLORS.greenApple,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  fruitEarnedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orangeLight,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
    gap: LAYOUT.spacing.md,
  },
  fruitEarnedEmoji: {
    fontSize: 40,
  },
  fruitEarnedValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.orange,
  },
  fruitEarnedLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.orange,
  },
  accuracyMeter: {
    borderWidth: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyInner: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accuracyValue: {
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  accuracyLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  reactionTimeMeter: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
  },
  reactionTimeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.md,
  },
  reactionTimeEmoji: {
    fontSize: 24,
  },
  reactionTimeLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  reactionTimeValue: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    marginBottom: LAYOUT.spacing.sm,
  },
  reactionTimeStatus: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  levelUpCard: {
    backgroundColor: COLORS.grape,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
  },
  levelUpEmoji: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  levelUpTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.md,
  },
  levelUpDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  levelUpPrevious: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.white,
    opacity: 0.7,
  },
  levelUpArrow: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.white,
  },
  levelUpNew: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.white,
  },
});
