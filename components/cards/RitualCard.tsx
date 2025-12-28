import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { TodayRitual, RITUAL_CATEGORY_CONFIG } from '../../types/ritual';

interface RitualCardProps {
  ritual: TodayRitual;
  onPress: () => void;
}

export const RitualCard: React.FC<RitualCardProps> = ({ ritual, onPress }) => {
  const categoryConfig = ritual.ritual
    ? RITUAL_CATEGORY_CONFIG[ritual.ritual.category]
    : null;

  const statusText = ritual.isCompleted ? '완료' : '미완료';
  const statusColor = ritual.isCompleted ? COLORS.greenApple : COLORS.textGray;

  return (
    <TouchableOpacity
      style={[
        styles.container,
        ritual.isCompleted && styles.completedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: categoryConfig?.color || COLORS.primary },
        ]}
      >
        <Text style={styles.icon}>
          {categoryConfig?.icon || '📋'}
        </Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>
          {ritual.ritual?.title || '의식'}
        </Text>
        <View style={styles.metaRow}>
          <Text style={styles.time}>
            🕐 {ritual.scheduledTime}
          </Text>
          {ritual.ritual?.durationMinutes && (
            <Text style={styles.duration}>
              약 {ritual.ritual.durationMinutes}분
            </Text>
          )}
        </View>
      </View>

      <View style={styles.statusContainer}>
        {ritual.isCompleted ? (
          <View style={styles.checkmark}>
            <Text style={styles.checkmarkText}>✓</Text>
          </View>
        ) : (
          <View style={styles.circle} />
        )}
        <Text style={[styles.statusText, { color: statusColor }]}>
          {statusText}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// 컴팩트 버전 (목록용)
interface CompactRitualCardProps {
  ritual: TodayRitual;
  onPress: () => void;
}

export const CompactRitualCard: React.FC<CompactRitualCardProps> = ({
  ritual,
  onPress,
}) => {
  const categoryConfig = ritual.ritual
    ? RITUAL_CATEGORY_CONFIG[ritual.ritual.category]
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.compactContainer,
        ritual.isCompleted && styles.completedContainer,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.compactIcon}>
        {categoryConfig?.icon || '📋'}
      </Text>
      <Text
        style={[
          styles.compactTitle,
          ritual.isCompleted && styles.completedText,
        ]}
        numberOfLines={1}
      >
        {ritual.ritual?.title || '의식'}
      </Text>
      <Text style={styles.compactTime}>{ritual.scheduledTime}</Text>
      {ritual.isCompleted && (
        <Text style={styles.compactCheck}>✓</Text>
      )}
    </TouchableOpacity>
  );
};

// 피처 카드 (홈 화면용 큰 카드)
interface FeatureRitualCardProps {
  ritual: TodayRitual;
  onPress: () => void;
}

export const FeatureRitualCard: React.FC<FeatureRitualCardProps> = ({
  ritual,
  onPress,
}) => {
  const categoryConfig = ritual.ritual
    ? RITUAL_CATEGORY_CONFIG[ritual.ritual.category]
    : null;

  return (
    <TouchableOpacity
      style={[
        styles.featureContainer,
        { backgroundColor: categoryConfig?.color || COLORS.primary },
        ritual.isCompleted && styles.featureCompleted,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.featureIcon}>
        {categoryConfig?.icon || '📋'}
      </Text>
      <Text style={styles.featureTitle} numberOfLines={2}>
        {ritual.ritual?.title || '의식'}
      </Text>
      <Text style={styles.featureTime}>
        {ritual.scheduledTime}
      </Text>
      {ritual.isCompleted && (
        <View style={styles.featureCheckBadge}>
          <Text style={styles.featureCheckText}>완료!</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 기본 카드
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    gap: LAYOUT.spacing.md,
  },
  completedContainer: {
    backgroundColor: COLORS.backgroundLight,
    opacity: 0.8,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: LAYOUT.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 28,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  time: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  duration: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textLight,
  },
  statusContainer: {
    alignItems: 'center',
    minWidth: 56,
  },
  checkmark: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.xs,
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '700',
  },
  circle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: COLORS.textLight,
    marginBottom: LAYOUT.spacing.xs,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '500',
  },

  // 컴팩트 카드
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.md,
    gap: LAYOUT.spacing.md,
  },
  compactIcon: {
    fontSize: 24,
  },
  compactTitle: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
  },
  completedText: {
    color: COLORS.textGray,
    textDecorationLine: 'line-through',
  },
  compactTime: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
  },
  compactCheck: {
    fontSize: 18,
    color: COLORS.greenApple,
    fontWeight: '700',
  },

  // 피처 카드
  featureContainer: {
    width: LAYOUT.card.featureWidth,
    height: LAYOUT.card.featureHeight,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    justifyContent: 'space-between',
  },
  featureCompleted: {
    opacity: 0.7,
  },
  featureIcon: {
    fontSize: 40,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  featureTime: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  featureCheckBadge: {
    position: 'absolute',
    top: LAYOUT.spacing.md,
    right: LAYOUT.spacing.md,
    backgroundColor: COLORS.white,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  featureCheckText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: COLORS.greenApple,
  },
});

export default RitualCard;
