import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

interface Reward {
  id: string;
  type: 'streak' | 'fruit_collect' | 'game_master' | 'early_bird' | 'social';
  title: string;
  description?: string;
  icon: string;
  earnedAt?: Date;
  streakDays?: number;
  fruitType?: string;
  fruitCount?: number;
  isLocked?: boolean;
}

interface RewardCardProps {
  reward: Reward;
  onPress?: () => void;
}

const REWARD_COLORS: Record<string, string> = {
  streak: COLORS.orange,
  fruit_collect: COLORS.greenApple,
  game_master: COLORS.grape,
  early_bird: COLORS.lemon,
  social: COLORS.apple,
};

export const RewardCard: React.FC<RewardCardProps> = ({ reward, onPress }) => {
  const backgroundColor = reward.isLocked
    ? COLORS.backgroundLight
    : REWARD_COLORS[reward.type] || COLORS.primary;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor },
        reward.isLocked && styles.lockedContainer,
      ]}
      onPress={onPress}
      activeOpacity={reward.isLocked ? 1 : 0.8}
      disabled={reward.isLocked}
    >
      <Text style={[styles.icon, reward.isLocked && styles.lockedIcon]}>
        {reward.isLocked ? '🔒' : reward.icon}
      </Text>
      <Text
        style={[styles.title, reward.isLocked && styles.lockedText]}
        numberOfLines={2}
      >
        {reward.title}
      </Text>
      {reward.earnedAt && (
        <Text style={styles.date}>
          {reward.earnedAt.toLocaleDateString('ko-KR', {
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      )}
    </TouchableOpacity>
  );
};

// 배지 그리드 (프로필용)
interface RewardBadgeGridProps {
  rewards: Reward[];
  onRewardPress?: (reward: Reward) => void;
}

export const RewardBadgeGrid: React.FC<RewardBadgeGridProps> = ({
  rewards,
  onRewardPress,
}) => {
  return (
    <View style={styles.gridContainer}>
      {rewards.map((reward) => (
        <RewardCard
          key={reward.id}
          reward={reward}
          onPress={onRewardPress ? () => onRewardPress(reward) : undefined}
        />
      ))}
    </View>
  );
};

// 스트릭 배너 카드
interface StreakBannerProps {
  currentStreak: number;
  longestStreak: number;
  onPress?: () => void;
}

export const StreakBanner: React.FC<StreakBannerProps> = ({
  currentStreak,
  longestStreak,
  onPress,
}) => {
  const isNewRecord = currentStreak >= longestStreak && currentStreak > 0;

  return (
    <TouchableOpacity
      style={styles.streakContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.streakMain}>
        <Text style={styles.fireEmoji}>🔥</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakCount}>{currentStreak}일</Text>
          <Text style={styles.streakLabel}>연속 달성 중!</Text>
        </View>
      </View>
      {isNewRecord && (
        <View style={styles.recordBadge}>
          <Text style={styles.recordText}>🏆 최고 기록!</Text>
        </View>
      )}
      {!isNewRecord && longestStreak > 0 && (
        <Text style={styles.longestStreak}>
          최고 기록: {longestStreak}일
        </Text>
      )}
    </TouchableOpacity>
  );
};

// 과일 수집 카드
interface FruitCollectionCardProps {
  fruits: {
    apple: number;
    orange: number;
    lemon: number;
    grape: number;
    greenApple: number;
  };
  totalFruits: number;
  onPress?: () => void;
}

const FRUIT_EMOJIS = {
  apple: '🍎',
  orange: '🍊',
  lemon: '🍋',
  grape: '🍇',
  greenApple: '🍏',
};

export const FruitCollectionCard: React.FC<FruitCollectionCardProps> = ({
  fruits,
  totalFruits,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.fruitContainer}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.fruitHeader}>
        <Text style={styles.fruitTitle}>🧺 과일 컬렉션</Text>
        <Text style={styles.totalFruits}>총 {totalFruits}개</Text>
      </View>

      <View style={styles.fruitGrid}>
        {(Object.keys(fruits) as Array<keyof typeof fruits>).map((fruitKey) => (
          <View key={fruitKey} style={styles.fruitItem}>
            <Text style={styles.fruitEmoji}>
              {FRUIT_EMOJIS[fruitKey]}
            </Text>
            <Text style={styles.fruitCount}>{fruits[fruitKey]}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

// 게임 결과 보상 카드
interface GameRewardCardProps {
  score: number;
  fruitsEarned: number;
  accuracy: number;
  newAchievements?: string[];
  onContinue: () => void;
}

export const GameRewardCard: React.FC<GameRewardCardProps> = ({
  score,
  fruitsEarned,
  accuracy,
  newAchievements,
  onContinue,
}) => {
  return (
    <View style={styles.gameRewardContainer}>
      <Text style={styles.gameRewardTitle}>🎉 잘하셨어요!</Text>

      <View style={styles.gameRewardStats}>
        <View style={styles.gameRewardStatItem}>
          <Text style={styles.gameRewardStatValue}>{score}</Text>
          <Text style={styles.gameRewardStatLabel}>점수</Text>
        </View>
        <View style={styles.gameRewardStatItem}>
          <Text style={styles.gameRewardStatValue}>
            {fruitsEarned} 🍎
          </Text>
          <Text style={styles.gameRewardStatLabel}>수확</Text>
        </View>
        <View style={styles.gameRewardStatItem}>
          <Text style={styles.gameRewardStatValue}>
            {Math.round(accuracy * 100)}%
          </Text>
          <Text style={styles.gameRewardStatLabel}>정확도</Text>
        </View>
      </View>

      {newAchievements && newAchievements.length > 0 && (
        <View style={styles.achievementsSection}>
          <Text style={styles.achievementsTitle}>🏅 새로운 업적!</Text>
          {newAchievements.map((achievement, index) => (
            <Text key={index} style={styles.achievementItem}>
              {achievement}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity
        style={styles.continueButton}
        onPress={onContinue}
        activeOpacity={0.8}
      >
        <Text style={styles.continueButtonText}>계속하기</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 보상 카드
  container: {
    width: 100,
    height: 120,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.spacing.md,
  },
  lockedContainer: {
    opacity: 0.6,
  },
  icon: {
    fontSize: 40,
    marginBottom: LAYOUT.spacing.sm,
  },
  lockedIcon: {
    opacity: 0.5,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
  lockedText: {
    color: COLORS.textGray,
  },
  date: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    opacity: 0.8,
    marginTop: LAYOUT.spacing.xs,
  },

  // 그리드
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
  },

  // 스트릭 배너
  streakContainer: {
    backgroundColor: COLORS.orange,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  fireEmoji: {
    fontSize: 40,
  },
  streakInfo: {},
  streakCount: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.white,
  },
  streakLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  recordBadge: {
    backgroundColor: COLORS.white,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
  },
  recordText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.orange,
  },
  longestStreak: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.white,
    opacity: 0.8,
  },

  // 과일 수집 카드
  fruitContainer: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  fruitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  fruitTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  totalFruits: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  fruitGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fruitItem: {
    alignItems: 'center',
  },
  fruitEmoji: {
    fontSize: 32,
    marginBottom: LAYOUT.spacing.xs,
  },
  fruitCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // 게임 결과 보상 카드
  gameRewardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xxl,
    padding: LAYOUT.spacing.xxl,
    alignItems: 'center',
  },
  gameRewardTitle: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.xl,
  },
  gameRewardStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: LAYOUT.spacing.xl,
  },
  gameRewardStatItem: {
    alignItems: 'center',
  },
  gameRewardStatValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: '700',
    color: COLORS.textDark,
  },
  gameRewardStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  achievementsSection: {
    width: '100%',
    backgroundColor: COLORS.primaryLight,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.xl,
  },
  achievementsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.sm,
  },
  achievementItem: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    marginTop: LAYOUT.spacing.xs,
  },
  continueButton: {
    backgroundColor: COLORS.greenApple,
    paddingVertical: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.xxl,
    borderRadius: LAYOUT.radius.lg,
    minWidth: 200,
  },
  continueButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
  },
});

export default RewardCard;
