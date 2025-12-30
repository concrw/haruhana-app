import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { Header, SectionHeader } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useRitualStore } from '../../stores/ritualStore';
import { useAuthStore } from '../../stores/authStore';
import { Ritual } from '../../types/ritual';

const CATEGORY_INFO: Record<string, { name: string; emoji: string }> = {
  health: { name: '건강', emoji: '💪' },
  mind: { name: '마음', emoji: '🧘' },
  social: { name: '사회', emoji: '👥' },
  hobby: { name: '취미', emoji: '🎨' },
  routine: { name: '일상', emoji: '📋' },
};

export default function RitualsManageScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    systemRituals,
    userRituals,
    addUserRitual,
    removeUserRitual,
    fetchSystemRituals,
    fetchUserRituals,
  } = useRitualStore();

  const [selectedTab, setSelectedTab] = useState<'my' | 'all'>('my');

  useEffect(() => {
    fetchSystemRituals();
    if (user?.id) {
      fetchUserRituals(user.id);
    }
  }, []);

  const userRitualIds = userRituals.map((r) => r.ritualId);

  const handleToggleRitual = async (ritual: Ritual) => {
    if (!user?.id) return;

    const isAdded = userRitualIds.includes(ritual.id);

    if (isAdded) {
      Alert.alert(
        '의식 제거',
        `"${ritual.name}" 의식을 목록에서 제거할까요?`,
        [
          { text: '취소', style: 'cancel' },
          {
            text: '제거',
            style: 'destructive',
            onPress: async () => {
              const userRitual = userRituals.find((r) => r.ritualId === ritual.id);
              if (userRitual) {
                await removeUserRitual(userRitual.id);
              }
            },
          },
        ]
      );
    } else {
      await addUserRitual({
        userId: user.id,
        ritualId: ritual.id,
        scheduledTime: '09:00',
        daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
        isActive: true,
        reminderMinutes: 0,
      });
      Alert.alert('추가 완료', `"${ritual.name}" 의식이 추가되었어요!`);
    }
  };

  const groupedRituals = systemRituals.reduce((acc, ritual) => {
    const category = ritual.category || 'routine';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(ritual);
    return acc;
  }, {} as Record<string, Ritual[]>);

  const myRituals = systemRituals.filter((r) => userRitualIds.includes(r.id));

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="의식 관리" showBack onBack={() => router.back()} />

      {/* 탭 */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'my' && styles.tabActive]}
          onPress={() => setSelectedTab('my')}
        >
          <Text style={[styles.tabText, selectedTab === 'my' && styles.tabTextActive]}>
            내 의식 ({myRituals.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'all' && styles.tabActive]}
          onPress={() => setSelectedTab('all')}
        >
          <Text style={[styles.tabText, selectedTab === 'all' && styles.tabTextActive]}>
            전체 의식
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'my' ? (
          // 내 의식 목록
          myRituals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyTitle}>아직 설정한 의식이 없어요</Text>
              <Text style={styles.emptyText}>
                '전체 의식' 탭에서{'\n'}
                원하는 의식을 추가해보세요
              </Text>
              <FruitButton
                variant="greenApple"
                label="의식 둘러보기"
                size="medium"
                onPress={() => setSelectedTab('all')}
              />
            </View>
          ) : (
            <View style={styles.ritualList}>
              {myRituals.map((ritual) => (
                <TouchableOpacity
                  key={ritual.id}
                  style={styles.ritualCard}
                  onPress={() =>
                    router.push({
                      pathname: '/ritual/[id]',
                      params: { id: ritual.id },
                    })
                  }
                >
                  <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
                  <View style={styles.ritualInfo}>
                    <Text style={styles.ritualName}>{ritual.name}</Text>
                    <Text style={styles.ritualCategory}>
                      {CATEGORY_INFO[ritual.category]?.emoji}{' '}
                      {CATEGORY_INFO[ritual.category]?.name}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => handleToggleRitual(ritual)}
                  >
                    <Text style={styles.removeButtonText}>제거</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          )
        ) : (
          // 전체 의식 목록 (카테고리별)
          Object.entries(groupedRituals).map(([category, rituals]) => (
            <View key={category} style={styles.categorySection}>
              <SectionHeader
                title={`${CATEGORY_INFO[category]?.emoji} ${CATEGORY_INFO[category]?.name}`}
              />
              <View style={styles.ritualList}>
                {rituals.map((ritual) => {
                  const isAdded = userRitualIds.includes(ritual.id);
                  return (
                    <View key={ritual.id} style={styles.ritualCard}>
                      <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
                      <View style={styles.ritualInfo}>
                        <Text style={styles.ritualName}>{ritual.name}</Text>
                        <Text style={styles.ritualDescription} numberOfLines={1}>
                          {ritual.description}
                        </Text>
                      </View>
                      <TouchableOpacity
                        style={[
                          styles.addButton,
                          isAdded && styles.addedButton,
                        ]}
                        onPress={() => handleToggleRitual(ritual)}
                      >
                        <Text
                          style={[
                            styles.addButtonText,
                            isAdded && styles.addedButtonText,
                          ]}
                        >
                          {isAdded ? '✓' : '+'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                })}
              </View>
            </View>
          ))
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  tab: {
    flex: 1,
    paddingVertical: LAYOUT.spacing.md,
    alignItems: 'center',
    borderRadius: LAYOUT.radius.lg,
    backgroundColor: COLORS.white,
  },
  tabActive: {
    backgroundColor: COLORS.greenApple,
  },
  tabText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textGray,
  },
  tabTextActive: {
    color: COLORS.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  emptyState: {
    alignItems: 'center',
    padding: LAYOUT.spacing.xxl,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: LAYOUT.spacing.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.xl,
  },
  categorySection: {
    gap: LAYOUT.spacing.md,
  },
  ritualList: {
    gap: LAYOUT.spacing.md,
  },
  ritualCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.md,
  },
  ritualEmoji: {
    fontSize: 40,
  },
  ritualInfo: {
    flex: 1,
  },
  ritualName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.xs,
  },
  ritualCategory: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  ritualDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  removeButton: {
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
  },
  removeButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.apple,
    fontWeight: '600',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addedButton: {
    backgroundColor: COLORS.textLight,
  },
  addButtonText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '600',
  },
  addedButtonText: {
    fontSize: 18,
  },
});
