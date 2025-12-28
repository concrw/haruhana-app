/**
 * 크루 목록 화면
 */

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_TEXTS } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { CrewCard } from '../../components/crew/CrewCard';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';

export default function CrewListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    crews,
    isLoading,
    fetchCrews,
    fetchMembers,
    fetchCrewStats,
  } = useCrewStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    if (user?.id) {
      loadCrews();
    }
  }, [user?.id]);

  const loadCrews = async () => {
    if (!user?.id) return;
    await fetchCrews(user.id);
  };

  useEffect(() => {
    // Crews will be loaded on mount
  }, [crews]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCrews();
    setRefreshing(false);
  };

  const handleCreateCrew = () => {
    router.push('/crew/create');
  };

  const handleJoinCrew = () => {
    router.push('/crew/join');
  };

  const handleCrewPress = (crewId: string) => {
    router.push(`/crew/${crewId}`);
  };

  if (isLoading && crews.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="내 크루" showBack onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {crews.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>👥</Text>
            <Text style={styles.emptyTitle}>아직 크루가 없어요</Text>
            <Text style={styles.emptyDescription}>
              친구들과 함께 리추얼을 수행해보세요!{'\n'}
              서로 응원하면 더 재미있어요.
            </Text>

            <View style={styles.emptyActions}>
              <FruitButton
                variant="apple"
                label="크루 만들기"
                size="large"
                onPress={handleCreateCrew}
              />
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinCrew}
              >
                <Text style={styles.joinButtonText}>초대 코드로 참여하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.crewList}>
              {crews.map((crew) => (
                <CrewCard
                  key={crew.id}
                  crew={crew}
                  onPress={() => handleCrewPress(crew.id)}
                />
              ))}
            </View>

            <View style={styles.actions}>
              <FruitButton
                variant="orange"
                label="새 크루 만들기"
                size="medium"
                onPress={handleCreateCrew}
              />
              <TouchableOpacity
                style={styles.joinButton}
                onPress={handleJoinCrew}
              >
                <Text style={styles.joinButtonText}>초대 코드로 참여하기</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
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
  crewList: {
    gap: LAYOUT.spacing.lg,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    paddingTop: LAYOUT.spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.xl,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.xxl,
  },
  emptyActions: {
    width: '100%',
    gap: LAYOUT.spacing.lg,
  },
  actions: {
    marginTop: LAYOUT.spacing.xxl,
    gap: LAYOUT.spacing.md,
  },
  joinButton: {
    paddingVertical: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.grape,
    fontWeight: '600',
  },
});
