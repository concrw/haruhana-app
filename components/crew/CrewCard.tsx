/**
 * 크루 카드 컴포넌트
 * 크루 목록에서 표시되는 카드
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_ROLES } from '../../constants/crew';
import type { Crew, CrewMember, CrewStats } from '../../types/crew';

interface CrewCardProps {
  crew: Crew;
  members?: CrewMember[];
  stats?: CrewStats;
  myRole?: 'creator' | 'member';
  onPress?: () => void;
}

export const CrewCard: React.FC<CrewCardProps> = ({
  crew,
  members = [],
  stats,
  myRole,
  onPress,
}) => {
  const memberCount = members.length;
  const completionRate = stats
    ? Math.round((stats.todayCompleted / stats.todayTotal) * 100) || 0
    : 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={styles.name}>{crew.name}</Text>
          {myRole && (
            <View style={[styles.roleBadge, myRole === 'creator' && styles.creatorBadge]}>
              <Text style={styles.roleBadgeText}>
                {CREW_ROLES[myRole].emoji} {CREW_ROLES[myRole].label}
              </Text>
            </View>
          )}
        </View>
        {crew.description && (
          <Text style={styles.description} numberOfLines={1}>
            {crew.description}
          </Text>
        )}
      </View>

      <View style={styles.memberAvatars}>
        {members.slice(0, 5).map((member, index) => (
          <View
            key={member.id}
            style={[
              styles.avatarWrapper,
              { marginLeft: index === 0 ? 0 : -12, zIndex: 5 - index },
            ]}
          >
            {member.user?.avatarUrl ? (
              <Image source={{ uri: member.user.avatarUrl }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {member.user?.name?.charAt(0) || '?'}
                </Text>
              </View>
            )}
          </View>
        ))}
        {memberCount > 5 && (
          <View style={[styles.avatarWrapper, { marginLeft: -12 }]}>
            <View style={styles.moreAvatar}>
              <Text style={styles.moreAvatarText}>+{memberCount - 5}</Text>
            </View>
          </View>
        )}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statEmoji}>👥</Text>
          <Text style={styles.statValue}>{memberCount}명</Text>
        </View>

        {stats && (
          <>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={styles.statValue}>
                오늘 {stats.todayCompleted}/{stats.todayTotal}
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📊</Text>
              <Text style={styles.statValue}>{completionRate}%</Text>
            </View>
          </>
        )}
      </View>

      {stats && stats.goalProgress > 0 && (
        <View style={styles.goalProgress}>
          <View style={styles.progressHeader}>
            <Text style={styles.goalLabel}>목표 달성률</Text>
            <Text style={styles.goalValue}>{stats.goalProgress}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${stats.goalProgress}%` },
                stats.goalProgress === 100 && styles.progressComplete,
              ]}
            />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

// 크루 미니 카드 (홈 화면용)
interface CrewMiniCardProps {
  crew: Crew;
  todayCompleted: number;
  todayTotal: number;
  onPress?: () => void;
}

export const CrewMiniCard: React.FC<CrewMiniCardProps> = ({
  crew,
  todayCompleted,
  todayTotal,
  onPress,
}) => {
  const isComplete = todayCompleted === todayTotal && todayTotal > 0;

  return (
    <TouchableOpacity
      style={styles.miniContainer}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.miniHeader}>
        <Text style={styles.miniName}>{crew.name}</Text>
        {isComplete && <Text style={styles.completeBadge}>🎉</Text>}
      </View>
      <Text style={styles.miniStats}>
        오늘 {todayCompleted}/{todayTotal} 완료
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.xl,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: LAYOUT.spacing.lg,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  roleBadge: {
    backgroundColor: COLORS.grapeLight,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.full,
  },
  creatorBadge: {
    backgroundColor: COLORS.lemonLight,
  },
  roleBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  avatarWrapper: {
    borderWidth: 2,
    borderColor: COLORS.white,
    borderRadius: 20,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  avatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  moreAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  statEmoji: {
    fontSize: 16,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  statDivider: {
    width: 1,
    height: 16,
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: LAYOUT.spacing.md,
  },
  goalProgress: {
    marginTop: LAYOUT.spacing.lg,
    paddingTop: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.sm,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  goalValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 4,
  },
  progressComplete: {
    backgroundColor: COLORS.greenApple,
  },

  // 미니 카드
  miniContainer: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  miniHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  miniName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  completeBadge: {
    fontSize: 16,
  },
  miniStats: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
});

export default CrewCard;
