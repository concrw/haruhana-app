/**
 * 크루 리더보드 화면
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_TEXTS, LEADERBOARD_PERIODS } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { LeaderboardItem } from '../../components/crew/CrewMemberList';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';

type PeriodType = keyof typeof LEADERBOARD_PERIODS;

export default function LeaderboardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { currentCrew, leaderboard, isLoading, fetchLeaderboard, fetchCrewDetails } = useCrewStore();

  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState<PeriodType>('week');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, period]);

  const loadData = async () => {
    if (!id) return;
    await fetchCrewDetails(id);
    await fetchLeaderboard(id);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (isLoading && leaderboard.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const topThree = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={CREW_TEXTS.leaderboard.title}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 기간 선택 */}
        <View style={styles.periodSelector}>
          {(Object.keys(LEADERBOARD_PERIODS) as PeriodType[]).map((key) => (
            <TouchableOpacity
              key={key}
              style={[styles.periodTab, period === key && styles.periodTabActive]}
              onPress={() => setPeriod(key)}
            >
              <Text style={[styles.periodText, period === key && styles.periodTextActive]}>
                {LEADERBOARD_PERIODS[key].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 크루 이름 */}
        {currentCrew && (
          <Text style={styles.crewName}>{currentCrew.name}</Text>
        )}

        {/* 상위 3명 */}
        {topThree.length > 0 && (
          <View style={styles.podium}>
            {/* 2등 */}
            {topThree[1] && (
              <View style={[styles.podiumItem, styles.podiumSecond]}>
                <Text style={styles.podiumRank}>🥈</Text>
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>
                    {topThree[1].userName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {topThree[1].userName}
                </Text>
                <Text style={styles.podiumScore}>
                  {topThree[1].weeklyCompletions}회
                </Text>
              </View>
            )}

            {/* 1등 */}
            {topThree[0] && (
              <View style={[styles.podiumItem, styles.podiumFirst]}>
                <Text style={styles.podiumRank}>🥇</Text>
                <View style={[styles.podiumAvatar, styles.podiumAvatarFirst]}>
                  <Text style={[styles.podiumAvatarText, styles.podiumAvatarTextFirst]}>
                    {topThree[0].userName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {topThree[0].userName}
                </Text>
                <Text style={styles.podiumScore}>
                  {topThree[0].weeklyCompletions}회
                </Text>
              </View>
            )}

            {/* 3등 */}
            {topThree[2] && (
              <View style={[styles.podiumItem, styles.podiumThird]}>
                <Text style={styles.podiumRank}>🥉</Text>
                <View style={styles.podiumAvatar}>
                  <Text style={styles.podiumAvatarText}>
                    {topThree[2].userName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.podiumName} numberOfLines={1}>
                  {topThree[2].userName}
                </Text>
                <Text style={styles.podiumScore}>
                  {topThree[2].weeklyCompletions}회
                </Text>
              </View>
            )}
          </View>
        )}

        {/* 나머지 순위 */}
        <View style={styles.rankList}>
          {rest.map((entry) => (
            <LeaderboardItem
              key={entry.userId}
              entry={entry}
              isCurrentUser={entry.userId === user?.id}
            />
          ))}
        </View>

        {/* 범례 */}
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>✅</Text>
            <Text style={styles.legendText}>{CREW_TEXTS.leaderboard.completedLabel}</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🏃</Text>
            <Text style={styles.legendText}>{CREW_TEXTS.leaderboard.firstFinishLabel}</Text>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendIcon}>🍎</Text>
            <Text style={styles.legendText}>{CREW_TEXTS.leaderboard.fruitsLabel}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: LAYOUT.screenPaddingHorizontal,
    paddingBottom: LAYOUT.spacing.xxxl,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.lg,
    padding: 4,
    marginBottom: LAYOUT.spacing.xl,
  },
  periodTab: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.md,
    alignItems: 'center',
    borderRadius: LAYOUT.radius.md,
  },
  periodTabActive: {
    backgroundColor: COLORS.white,
  },
  periodText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  periodTextActive: {
    fontWeight: '600',
    color: COLORS.textDark,
  },
  crewName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  podium: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.xxl,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  podiumFirst: {
    marginBottom: LAYOUT.spacing.lg,
  },
  podiumSecond: {},
  podiumThird: {},
  podiumRank: {
    fontSize: 32,
    marginBottom: LAYOUT.spacing.sm,
  },
  podiumAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  podiumAvatarFirst: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.primary,
  },
  podiumAvatarText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textGray,
  },
  podiumAvatarTextFirst: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.white,
  },
  podiumName: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.xs,
    maxWidth: 80,
  },
  podiumScore: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.grape,
  },
  rankList: {
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: LAYOUT.spacing.xl,
    paddingTop: LAYOUT.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  legendIcon: {
    fontSize: 14,
  },
  legendText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
  },
});
