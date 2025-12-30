/**
 * 크루 상세 화면 (크루 홈)
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
  Alert,
  Share,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_TEXTS, CREW_GOALS } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { TodayStatusGrid, CrewMemberList } from '../../components/crew/CrewMemberList';
import { SavingsProgress } from '../../components/crew/SavingsProgress';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';
import { crewService } from '../../services/crew.service';

export default function CrewDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    currentCrew,
    members,
    stats,
    savings,
    isLoading,
    fetchCrewDetails,
    fetchMembers,
    fetchCrewStats,
    fetchSavings,
    leaveCrew,
  } = useCrewStore();

  const [refreshing, setRefreshing] = useState(false);
  const [todayCompletedIds, setTodayCompletedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (id) {
      loadCrewData();
    }
  }, [id]);

  const loadCrewData = async () => {
    if (!id) return;
    await Promise.all([
      fetchCrewDetails(id),
      fetchMembers(id),
      fetchCrewStats(id),
      fetchSavings(id),
    ]);

    // TODO: 오늘 완료한 사용자 ID 목록 가져오기
    // 임시로 빈 Set 사용
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCrewData();
    setRefreshing(false);
  };

  const handleShareInvite = async () => {
    if (!currentCrew) return;

    try {
      await Share.share({
        message: `하루하나 크루 "${currentCrew.name}"에 함께해요!\n\n초대 코드: ${currentCrew.inviteCode}\n\n하루하나 앱에서 코드를 입력하세요.`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  };

  const handleLeaveCrew = () => {
    Alert.alert(
      '크루 나가기',
      '정말 크루를 나가시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              await leaveCrew(id);
              router.replace('/crew');
            }
          },
        },
      ]
    );
  };

  if (isLoading || !currentCrew) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const myMembership = members.find((m) => m.userId === user?.id);
  const isCreator = myMembership?.role === 'creator';
  const goalInfo = currentCrew.goalType ? CREW_GOALS[currentCrew.goalType] : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={currentCrew.name}
        showBack
        onBack={() => router.back()}
        rightElement={
          <TouchableOpacity onPress={handleShareInvite} style={styles.shareButton}>
            <Text style={styles.shareButtonText}>초대</Text>
          </TouchableOpacity>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 크루 정보 */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Text style={styles.crewName}>{currentCrew.name}</Text>
            {isCreator && <Text style={styles.creatorBadge}>👑 크루장</Text>}
          </View>
          {currentCrew.description && (
            <Text style={styles.description}>{currentCrew.description}</Text>
          )}
          <View style={styles.inviteCodeRow}>
            <Text style={styles.inviteCodeLabel}>초대 코드</Text>
            <Text style={styles.inviteCode}>{currentCrew.inviteCode}</Text>
          </View>
        </View>

        {/* 오늘 완료 현황 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{CREW_TEXTS.home.statsTitle}</Text>
          <TodayStatusGrid
            members={members}
            completedUserIds={todayCompletedIds}
          />
        </View>

        {/* 목표 진행률 */}
        {goalInfo && currentCrew.goalValue && stats && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{CREW_TEXTS.home.goalTitle}</Text>
            <View style={styles.goalCard}>
              <Text style={styles.goalLabel}>{goalInfo.label}</Text>
              <View style={styles.goalProgress}>
                <View style={styles.goalProgressBar}>
                  <View
                    style={[
                      styles.goalProgressFill,
                      { width: `${stats.goalProgress}%` },
                    ]}
                  />
                </View>
                <Text style={styles.goalProgressText}>{stats.goalProgress}%</Text>
              </View>
              <Text style={styles.goalDescription}>{goalInfo.description}</Text>
            </View>
          </View>
        )}

        {/* 모임통장 */}
        {savings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{CREW_TEXTS.home.savingsTitle}</Text>
            <SavingsProgress
              savings={savings}
              onDepositPress={() => router.push(`/crew/savings?id=${id}`)}
            />
          </View>
        )}

        {/* 퀵 액션 */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/crew/leaderboard?id=${id}`)}
          >
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionLabel}>리더보드</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/crew/chat?id=${id}`)}
          >
            <Text style={styles.actionIcon}>💬</Text>
            <Text style={styles.actionLabel}>채팅</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push(`/crew/savings?id=${id}`)}
          >
            <Text style={styles.actionIcon}>💰</Text>
            <Text style={styles.actionLabel}>모임통장</Text>
          </TouchableOpacity>
        </View>

        {/* 크루원 목록 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{CREW_TEXTS.home.membersTitle}</Text>
          <View style={styles.memberListCard}>
            <CrewMemberList
              members={members}
              showStatus
              todayCompletedUserIds={todayCompletedIds}
            />
          </View>
        </View>

        {/* 나가기 버튼 */}
        {!isCreator && (
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveCrew}>
            <Text style={styles.leaveButtonText}>크루 나가기</Text>
          </TouchableOpacity>
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
  shareButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
  },
  shareButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.grape,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.xl,
    marginBottom: LAYOUT.spacing.xl,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  crewName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  creatorBadge: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    backgroundColor: COLORS.lemonLight,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.full,
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.lg,
  },
  inviteCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
  inviteCodeLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  inviteCode: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.grape,
    letterSpacing: 2,
  },
  section: {
    marginBottom: LAYOUT.spacing.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  goalCard: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  goalProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.sm,
  },
  goalProgressBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  goalProgressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 6,
  },
  goalProgressText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  quickActions: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: LAYOUT.spacing.xs,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  memberListCard: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  leaveButton: {
    marginTop: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.error,
  },
});
