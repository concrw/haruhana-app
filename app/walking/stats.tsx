import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useWalkingStore } from '../../stores/walkingStore';
import { WeeklyStepsChart } from '../../components/walking/WeeklyStepsChart';
import { COLORS } from '../../constants/colors';
import { WALKING_TEXTS } from '../../constants/walkingTexts';
import type { WalkingStats } from '../../types/walking';

export default function WalkingStatsScreen() {
  const { goalSteps, fetchStats } = useWalkingStore();
  const [stats, setStats] = useState<WalkingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    const data = await fetchStats();
    setStats(data);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{WALKING_TEXTS.errors.failedToFetch}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{WALKING_TEXTS.stats.title}</Text>

      {/* 주간 차트 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{WALKING_TEXTS.stats.weeklyChart}</Text>
        <WeeklyStepsChart data={stats.weekly} goalSteps={goalSteps} />
      </View>

      {/* 월간 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{WALKING_TEXTS.history.thisMonth}</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.history.totalSteps}</Text>
            <Text style={styles.statValue}>
              {stats.monthly.totalSteps.toLocaleString()} {WALKING_TEXTS.units.steps}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.history.totalDistance}</Text>
            <Text style={styles.statValue}>
              {stats.monthly.totalDistanceKm.toFixed(2)} {WALKING_TEXTS.units.km}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.stats.avgPerDay}</Text>
            <Text style={styles.statValue}>
              {stats.monthly.avgStepsPerDay.toLocaleString()} {WALKING_TEXTS.units.steps}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.history.daysActive}</Text>
            <Text style={styles.statValue}>
              {stats.monthly.daysActive} {WALKING_TEXTS.stats.days}
            </Text>
          </View>
        </View>
      </View>

      {/* 전체 통계 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{WALKING_TEXTS.history.allTime}</Text>
        <View style={styles.card}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.history.totalSteps}</Text>
            <Text style={styles.statValue}>
              {stats.allTime.totalSteps.toLocaleString()} {WALKING_TEXTS.units.steps}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.history.totalDistance}</Text>
            <Text style={styles.statValue}>
              {stats.allTime.totalDistanceKm.toFixed(2)} {WALKING_TEXTS.units.km}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.stats.currentStreak}</Text>
            <Text style={styles.statValue}>
              {stats.allTime.currentStreak} {WALKING_TEXTS.stats.days}
            </Text>
          </View>

          <View style={styles.statRow}>
            <Text style={styles.statLabel}>{WALKING_TEXTS.stats.longestStreak}</Text>
            <Text style={styles.statValue}>
              {stats.allTime.longestStreak} {WALKING_TEXTS.stats.days}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundWarm,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: 12,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  statLabel: {
    fontSize: 16,
    color: COLORS.textGray,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});
