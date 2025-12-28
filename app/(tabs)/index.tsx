import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { Header, SectionHeader } from '../../components/layout/Header';
import { RitualCard, FeatureRitualCard } from '../../components/cards/RitualCard';
import { StreakBanner } from '../../components/cards/RewardCard';
import { EncouragementPreview } from '../../components/cards/EncouragementCard';
import { FruitButton } from '../../components/common/FruitButton';
import { useAuthStore } from '../../stores/authStore';
import { useRitualStore } from '../../stores/ritualStore';
import { useFamilyStore } from '../../stores/familyStore';
import { useCrewStore } from '../../stores/crewStore';
import { CrewMiniCard } from '../../components/crew/CrewCard';
import { getGreeting } from '../../utils/date';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    todayRituals,
    currentStreak,
    fetchTodayRituals,
    fetchUserRituals,
    fetchSystemRituals,
    fetchStreak,
    isLoading: ritualsLoading,
  } = useRitualStore();
  const {
    encouragements,
    fetchEncouragements,
  } = useFamilyStore();
  const {
    crews,
    fetchCrews,
  } = useCrewStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchSystemRituals(),
        fetchUserRituals(user.id),
        fetchStreak(user.id),
        fetchEncouragements(user.id),
        fetchCrews(user.id),
      ]);
      await fetchTodayRituals(user.id);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const completedCount = todayRituals.filter((r) => r.isCompleted).length;
  const totalCount = todayRituals.length;
  const latestEncouragement = encouragements[0];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 인사 헤더 */}
      <Header
        greeting
        userName={user?.name}
        rightElement={
          <TouchableOpacity
            style={styles.helpButton}
            onPress={() => {/* 도움말 */}}
          >
            <Text style={styles.helpIcon}>❓</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 스트릭 배너 */}
        {currentStreak > 0 && (
          <StreakBanner
            currentStreak={currentStreak}
            longestStreak={currentStreak}
            onPress={() => router.push('/profile')}
          />
        )}

        {/* 오늘의 의식 섹션 */}
        <View style={styles.section}>
          <SectionHeader
            title="오늘의 의식"
            actionText={`${completedCount}/${totalCount} 완료`}
          />

          {todayRituals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>
                아직 설정된 의식이 없어요
              </Text>
              <FruitButton
                variant="apple"
                label="의식 추가하기"
                size="medium"
                onPress={() => router.push('/profile')}
              />
            </View>
          ) : (
            <View style={styles.ritualList}>
              {todayRituals.map((ritual) => (
                <RitualCard
                  key={ritual.id}
                  ritual={ritual}
                  onPress={() =>
                    router.push({
                      pathname: '/ritual/[id]',
                      params: { id: ritual.ritualId },
                    })
                  }
                />
              ))}
            </View>
          )}
        </View>

        {/* 빠른 게임 버튼 */}
        <View style={styles.section}>
          <SectionHeader title="두뇌 운동" />
          <TouchableOpacity
            style={styles.gameCard}
            onPress={() => router.push('/game')}
            activeOpacity={0.8}
          >
            <View style={styles.gameCardContent}>
              <Text style={styles.gameCardIcon}>🌳</Text>
              <View style={styles.gameCardText}>
                <Text style={styles.gameCardTitle}>과수원 가기</Text>
                <Text style={styles.gameCardSubtitle}>
                  과일을 수확하며 두뇌 운동해요
                </Text>
              </View>
            </View>
            <Text style={styles.gameCardArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 크루 섹션 */}
        {crews.length > 0 && (
          <View style={styles.section}>
            <SectionHeader
              title="내 크루"
              actionText="전체보기"
              onAction={() => router.push('/crew')}
            />
            <View style={styles.crewList}>
              {crews.slice(0, 2).map((crew) => (
                <CrewMiniCard
                  key={crew.id}
                  crew={crew}
                  todayCompleted={0}
                  todayTotal={0}
                  onPress={() => router.push(`/crew/${crew.id}`)}
                />
              ))}
            </View>
          </View>
        )}

        {/* 가족 응원 섹션 */}
        {latestEncouragement && (
          <View style={styles.section}>
            <SectionHeader
              title="가족 응원"
              actionText="더보기"
              onAction={() => router.push('/family')}
            />
            <EncouragementPreview
              encouragement={latestEncouragement}
              onPress={() => router.push('/family')}
            />
          </View>
        )}

        {/* 하단 여백 */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  helpButton: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpIcon: {
    fontSize: 24,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  section: {
    gap: LAYOUT.spacing.md,
  },
  ritualList: {
    gap: LAYOUT.spacing.md,
  },
  crewList: {
    gap: LAYOUT.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    padding: LAYOUT.spacing.xxl,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xl,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.greenApple,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
  },
  gameCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  gameCardIcon: {
    fontSize: 40,
  },
  gameCardText: {},
  gameCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.white,
  },
  gameCardSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
    marginTop: LAYOUT.spacing.xs,
  },
  gameCardArrow: {
    fontSize: 28,
    color: COLORS.white,
  },
});
