import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FruitButton } from '../../components/common/FruitButton';
import { Timer } from '../../components/common/Timer';
import { useRitualStore } from '../../stores/ritualStore';
import { useAuthStore } from '../../stores/authStore';
import { Ritual } from '../../types/ritual';

const CATEGORY_EMOJI: Record<string, string> = {
  health: '💪',
  mind: '🧘',
  social: '👥',
  hobby: '🎨',
  routine: '📋',
};

export default function RitualDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { systemRituals, userRituals, todayRituals } = useRitualStore();

  const [ritual, setRitual] = useState<Ritual | null>(null);
  const [todayRitual, setTodayRitual] = useState<typeof todayRituals[0] | null>(null);

  useEffect(() => {
    // 시스템 의식에서 찾기
    const foundRitual = systemRituals.find((r) => r.id === id);
    if (foundRitual) {
      setRitual(foundRitual);
    }

    // 오늘의 의식에서 상태 찾기
    const foundToday = todayRituals.find((r) => r.ritualId === id);
    if (foundToday) {
      setTodayRitual(foundToday);
    }
  }, [id, systemRituals, todayRituals]);

  if (!ritual) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </View>
    );
  }

  const handleStartRitual = () => {
    router.push({
      pathname: '/ritual/perform',
      params: { id: ritual.id },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 의식 정보 카드 */}
        <View style={styles.infoCard}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryEmoji}>
              {CATEGORY_EMOJI[ritual.category] || '📋'}
            </Text>
            <Text style={styles.categoryText}>
              {ritual.category === 'health' && '건강'}
              {ritual.category === 'mind' && '마음'}
              {ritual.category === 'social' && '사회'}
              {ritual.category === 'hobby' && '취미'}
              {ritual.category === 'routine' && '일상'}
            </Text>
          </View>

          <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
          <Text style={styles.ritualName}>{ritual.name}</Text>
          <Text style={styles.ritualDescription}>{ritual.description}</Text>

          {/* 소요 시간 */}
          <View style={styles.durationBadge}>
            <Text style={styles.durationIcon}>⏱️</Text>
            <Text style={styles.durationText}>
              약 {Math.floor((ritual.duration || 0) / 60)}분 소요
            </Text>
          </View>
        </View>

        {/* 완료 상태 */}
        {todayRitual?.isCompleted && (
          <View style={styles.completedCard}>
            <Text style={styles.completedEmoji}>✅</Text>
            <Text style={styles.completedTitle}>오늘 완료했어요!</Text>
            <Text style={styles.completedText}>
              잘하셨어요. 내일도 함께해요.
            </Text>
          </View>
        )}

        {/* 가이드 단계 */}
        {ritual.steps && ritual.steps.length > 0 && (
          <View style={styles.stepsSection}>
            <Text style={styles.sectionTitle}>진행 순서</Text>
            <View style={styles.stepsList}>
              {ritual.steps.map((step, index) => (
                <View key={index} style={styles.stepItem}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{typeof step === 'string' ? step : step.text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 효과 안내 */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>이런 효과가 있어요</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>💪</Text>
              <Text style={styles.benefitText}>건강 증진</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>😊</Text>
              <Text style={styles.benefitText}>기분 개선</Text>
            </View>
            <View style={styles.benefitItem}>
              <Text style={styles.benefitEmoji}>🧠</Text>
              <Text style={styles.benefitText}>두뇌 활성화</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* 하단 버튼 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {todayRitual?.isCompleted ? (
          <FruitButton
            variant="grape"
            label="다시 하기"
            size="large"
            onPress={handleStartRitual}
          />
        ) : (
          <FruitButton
            variant="apple"
            label="시작하기"
            size="large"
            onPress={handleStartRitual}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  backButton: {
    padding: LAYOUT.spacing.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCream,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.full,
    gap: LAYOUT.spacing.xs,
    marginBottom: LAYOUT.spacing.lg,
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    fontWeight: '500',
  },
  ritualEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.lg,
  },
  ritualName: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
    textAlign: 'center',
  },
  ritualDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.lg,
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  durationIcon: {
    fontSize: 20,
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  completedCard: {
    backgroundColor: COLORS.greenAppleLight,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.greenApple,
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  completedTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.greenApple,
    marginBottom: LAYOUT.spacing.sm,
  },
  completedText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  stepsSection: {
    gap: LAYOUT.spacing.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  stepsList: {
    gap: LAYOUT.spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '700',
  },
  stepText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.4,
  },
  benefitsSection: {
    gap: LAYOUT.spacing.md,
  },
  benefitsList: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
  },
  benefitItem: {
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  benefitEmoji: {
    fontSize: 32,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
