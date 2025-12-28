import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FamilyMember, WeeklyReport } from '../../types/family';
import { UserStats } from '../../types/user';

interface FamilyMemberCardProps {
  member: FamilyMember;
  stats?: UserStats;
  onPress?: () => void;
  showStats?: boolean;
}

export const FamilyMemberCard: React.FC<FamilyMemberCardProps> = ({
  member,
  stats,
  onPress,
  showStats = false,
}) => {
  const isSenior = member.user?.role === 'senior';

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
      disabled={!onPress}
    >
      <View style={styles.avatarContainer}>
        {member.user?.avatarUrl ? (
          <Image
            source={{ uri: member.user.avatarUrl }}
            style={styles.avatar}
          />
        ) : (
          <View
            style={[
              styles.avatarPlaceholder,
              isSenior && styles.seniorAvatar,
            ]}
          >
            <Text style={styles.avatarText}>
              {member.user?.name?.charAt(0) || '?'}
            </Text>
          </View>
        )}
        {isSenior && member.isPrimarySenior && (
          <View style={styles.primaryBadge}>
            <Text style={styles.primaryBadgeText}>👑</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{member.user?.name || '가족'}</Text>
        <Text style={styles.relationship}>{member.relationship}</Text>
      </View>

      {showStats && stats && isSenior && (
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🔥 {stats.currentStreak}</Text>
            <Text style={styles.statLabel}>연속</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {stats.totalRitualsCompleted}
            </Text>
            <Text style={styles.statLabel}>완료</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

// 시니어 현황 카드 (가족이 보는 시니어 상태)
interface SeniorStatusCardProps {
  seniorName: string;
  avatarUrl?: string;
  stats: UserStats;
  todayCompleted: number;
  todayTotal: number;
  lastActivityTime?: string;
  onPress?: () => void;
}

export const SeniorStatusCard: React.FC<SeniorStatusCardProps> = ({
  seniorName,
  avatarUrl,
  stats,
  todayCompleted,
  todayTotal,
  lastActivityTime,
  onPress,
}) => {
  const completionRate = todayTotal > 0 ? todayCompleted / todayTotal : 0;

  return (
    <TouchableOpacity
      style={styles.statusContainer}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.statusHeader}>
        <View style={styles.statusAvatarSection}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.statusAvatar} />
          ) : (
            <View style={styles.statusAvatarPlaceholder}>
              <Text style={styles.statusAvatarText}>
                {seniorName.charAt(0)}
              </Text>
            </View>
          )}
          <View>
            <Text style={styles.statusName}>{seniorName}의 오늘</Text>
            {lastActivityTime && (
              <Text style={styles.lastActivity}>
                마지막 활동: {lastActivityTime}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.streakBadge}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakCount}>{stats.currentStreak}일째</Text>
        </View>
      </View>

      <View style={styles.progressSection}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressLabel}>오늘의 의식</Text>
          <Text style={styles.progressValue}>
            {todayCompleted}/{todayTotal}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${completionRate * 100}%` },
              completionRate === 1 && styles.progressComplete,
            ]}
          />
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{stats.totalRitualsCompleted}</Text>
          <Text style={styles.gridLabel}>총 완료</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{stats.totalGameSessions}</Text>
          <Text style={styles.gridLabel}>게임 세션</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridValue}>{stats.longestStreak}</Text>
          <Text style={styles.gridLabel}>최장 연속</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

// 주간 리포트 카드
interface WeeklyReportCardProps {
  report: WeeklyReport;
  onPress?: () => void;
}

export const WeeklyReportCard: React.FC<WeeklyReportCardProps> = ({
  report,
  onPress,
}) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
    });
  };

  const accuracyTrend = report.accuracyChange >= 0 ? '📈' : '📉';
  const accuracyColor =
    report.accuracyChange >= 0 ? COLORS.greenApple : COLORS.error;

  return (
    <TouchableOpacity
      style={styles.reportContainer}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={styles.reportHeader}>
        <Text style={styles.reportTitle}>📊 주간 리포트</Text>
        <Text style={styles.reportPeriod}>
          {formatDate(report.weekStart)} - {formatDate(report.weekEnd)}
        </Text>
      </View>

      <View style={styles.reportStats}>
        <View style={styles.reportStatItem}>
          <Text style={styles.reportStatValue}>
            {Math.round(report.ritualCompletionRate * 100)}%
          </Text>
          <Text style={styles.reportStatLabel}>의식 완료율</Text>
        </View>

        <View style={styles.reportStatItem}>
          <View style={styles.trendContainer}>
            <Text style={styles.reportStatValue}>
              {Math.round(report.avgAccuracy * 100)}%
            </Text>
            <Text style={[styles.trendText, { color: accuracyColor }]}>
              {accuracyTrend} {Math.abs(report.accuracyChange)}%
            </Text>
          </View>
          <Text style={styles.reportStatLabel}>게임 정확도</Text>
        </View>

        <View style={styles.reportStatItem}>
          <Text style={styles.reportStatValue}>
            🔥 {report.currentStreak}
          </Text>
          <Text style={styles.reportStatLabel}>연속 달성</Text>
        </View>
      </View>

      <View style={styles.reportFooter}>
        <Text style={styles.encouragementsReceived}>
          💌 응원 {report.encouragementsReceived}개 받음
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 기본 멤버 카드
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
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.grape,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seniorAvatar: {
    backgroundColor: COLORS.primary,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.white,
  },
  primaryBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 2,
  },
  primaryBadgeText: {
    fontSize: 16,
  },
  info: {
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  name: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  relationship: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textGray,
  },

  // 시니어 현황 카드
  statusContainer: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.xl,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  statusAvatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  statusAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  statusAvatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.white,
  },
  statusName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  lastActivity: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orange,
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
    gap: LAYOUT.spacing.xs,
  },
  streakEmoji: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  progressSection: {
    marginBottom: LAYOUT.spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.sm,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  progressValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 6,
  },
  progressComplete: {
    backgroundColor: COLORS.greenApple,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  gridItem: {
    alignItems: 'center',
  },
  gridValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  gridLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },

  // 주간 리포트 카드
  reportContainer: {
    backgroundColor: COLORS.backgroundCream,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.xl,
  },
  reportHeader: {
    marginBottom: LAYOUT.spacing.lg,
  },
  reportTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  reportPeriod: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  reportStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.lg,
  },
  reportStatItem: {
    alignItems: 'center',
  },
  reportStatValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  reportStatLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  trendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
  },
  reportFooter: {
    paddingTop: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  encouragementsReceived: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
  },
});

export default FamilyMemberCard;
