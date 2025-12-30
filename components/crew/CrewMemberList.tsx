/**
 * 크루 멤버 목록 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_ROLES } from '../../constants/crew';
import type { CrewMember, CrewLeaderboardEntry } from '../../types/crew';

interface CrewMemberListProps {
  members: CrewMember[];
  onMemberPress?: (member: CrewMember) => void;
  showStatus?: boolean;
  todayCompletedUserIds?: Set<string>;
}

export const CrewMemberList: React.FC<CrewMemberListProps> = ({
  members,
  onMemberPress,
  showStatus = false,
  todayCompletedUserIds = new Set(),
}) => {
  const renderMember = ({ item: member }: { item: CrewMember }) => {
    const isCompleted = todayCompletedUserIds.has(member.userId);
    const isCreator = member.role === 'creator';

    return (
      <TouchableOpacity
        style={styles.memberItem}
        onPress={() => onMemberPress?.(member)}
        activeOpacity={onMemberPress ? 0.8 : 1}
        disabled={!onMemberPress}
      >
        <View style={styles.avatarContainer}>
          {member.user?.avatarUrl ? (
            <Image source={{ uri: member.user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {member.user?.name?.charAt(0) || '?'}
              </Text>
            </View>
          )}
          {isCreator && (
            <View style={styles.crownBadge}>
              <Text style={styles.crownText}>👑</Text>
            </View>
          )}
        </View>

        <View style={styles.memberInfo}>
          <Text style={styles.memberName}>{member.user?.name || '크루원'}</Text>
          <Text style={styles.memberRole}>
            {CREW_ROLES[member.role].label}
          </Text>
        </View>

        {showStatus && (
          <View style={[styles.statusBadge, isCompleted && styles.statusCompleted]}>
            <Text style={[styles.statusText, isCompleted && styles.statusTextCompleted]}>
              {isCompleted ? '완료' : '진행중'}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      data={members}
      renderItem={renderMember}
      keyExtractor={(item) => item.id}
      scrollEnabled={false}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
    />
  );
};

// 리더보드용 멤버 아이템
interface LeaderboardItemProps {
  entry: CrewLeaderboardEntry;
  isCurrentUser?: boolean;
}

export const LeaderboardItem: React.FC<LeaderboardItemProps> = ({
  entry,
  isCurrentUser = false,
}) => {
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return null;
    }
  };

  const rankEmoji = getRankEmoji(entry.rank);

  return (
    <View style={[styles.leaderboardItem, isCurrentUser && styles.currentUserItem]}>
      <View style={styles.rankContainer}>
        {rankEmoji ? (
          <Text style={styles.rankEmoji}>{rankEmoji}</Text>
        ) : (
          <Text style={styles.rankNumber}>{entry.rank}</Text>
        )}
      </View>

      <View style={styles.avatarContainer}>
        {entry.userAvatar ? (
          <Image source={{ uri: entry.userAvatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>
              {entry.userName.charAt(0)}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.leaderboardInfo}>
        <Text style={[styles.memberName, isCurrentUser && styles.currentUserName]}>
          {entry.userName}
          {isCurrentUser && ' (나)'}
        </Text>
        <View style={styles.statsRow}>
          <Text style={styles.statBadge}>✅ {entry.weeklyCompletions}</Text>
          <Text style={styles.statBadge}>🏃 {entry.firstFinishes}</Text>
          <Text style={styles.statBadge}>🍎 {entry.fruitsCollected}</Text>
        </View>
      </View>
    </View>
  );
};

// 오늘 완료 현황 컴포넌트
interface TodayStatusGridProps {
  members: CrewMember[];
  completedUserIds: Set<string>;
}

export const TodayStatusGrid: React.FC<TodayStatusGridProps> = ({
  members,
  completedUserIds,
}) => {
  const completedCount = members.filter((m) => completedUserIds.has(m.userId)).length;
  const totalCount = members.length;

  return (
    <View style={styles.statusGridContainer}>
      <View style={styles.statusGridHeader}>
        <Text style={styles.statusGridTitle}>오늘 완료 현황</Text>
        <Text style={styles.statusGridCount}>
          {completedCount}/{totalCount}명
        </Text>
      </View>

      <View style={styles.statusGrid}>
        {members.map((member) => {
          const isCompleted = completedUserIds.has(member.userId);
          return (
            <View
              key={member.id}
              style={[styles.statusGridItem, isCompleted && styles.statusGridItemComplete]}
            >
              {member.user?.avatarUrl ? (
                <Image source={{ uri: member.user.avatarUrl }} style={styles.gridAvatar} />
              ) : (
                <View style={[styles.gridAvatarPlaceholder, isCompleted && styles.gridAvatarComplete]}>
                  <Text style={styles.gridAvatarText}>
                    {member.user?.name?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              {isCompleted && (
                <View style={styles.checkBadge}>
                  <Text style={styles.checkText}>✓</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  // 기본 멤버 리스트
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  crownBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.white,
    borderRadius: 10,
    padding: 2,
  },
  crownText: {
    fontSize: 12,
  },
  memberInfo: {
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  memberName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  memberRole: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  statusBadge: {
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.full,
  },
  statusCompleted: {
    backgroundColor: COLORS.greenAppleLight,
  },
  statusText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.textGray,
  },
  statusTextCompleted: {
    color: COLORS.greenApple,
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.backgroundLight,
  },

  // 리더보드
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    marginBottom: LAYOUT.spacing.sm,
  },
  currentUserItem: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  currentUserName: {
    color: COLORS.textDark,
    fontWeight: '700',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  rankEmoji: {
    fontSize: 24,
  },
  rankNumber: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textGray,
  },
  leaderboardInfo: {
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
    marginTop: LAYOUT.spacing.xs,
  },
  statBadge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    backgroundColor: COLORS.backgroundLight,
    paddingVertical: 2,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },

  // 오늘 완료 현황 그리드
  statusGridContainer: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  statusGridHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  statusGridTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statusGridCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.greenApple,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
  },
  statusGridItem: {
    position: 'relative',
  },
  statusGridItemComplete: {},
  gridAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  gridAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridAvatarComplete: {
    backgroundColor: COLORS.greenAppleLight,
  },
  gridAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  checkBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  checkText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.white,
  },
});

export default CrewMemberList;
