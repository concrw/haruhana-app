import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FruitButton } from '../../components/common/FruitButton';
import { StepProgressBar } from '../../components/common/ProgressBar';
import { useAuthStore } from '../../stores/authStore';
import { useRitualStore } from '../../stores/ritualStore';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    emoji: '🌸',
    title: '하루하나에 오신 것을\n환영해요!',
    description: '매일 작은 의식을 통해\n건강하고 행복한 하루를 만들어요',
  },
  {
    emoji: '☀️',
    title: '아침 의식으로\n하루를 시작해요',
    description: '기지개 펴기, 물 마시기 같은\n간단한 의식으로 활기찬 아침을',
  },
  {
    emoji: '🧠',
    title: '재미있는 게임으로\n두뇌를 깨워요',
    description: '과일 수확 게임을 하면서\n즐겁게 두뇌 운동해요',
  },
  {
    emoji: '👨‍👩‍👧‍👦',
    title: '가족과 함께\n응원해요',
    description: '가족에게 응원 메시지를 받고\n더 큰 힘을 얻어요',
  },
];

const RITUAL_SUGGESTIONS = [
  { id: 'morning-stretch', name: '아침 기지개', emoji: '🙆', category: 'health' },
  { id: 'drink-water', name: '물 한 잔', emoji: '💧', category: 'health' },
  { id: 'gratitude', name: '감사 일기', emoji: '📝', category: 'mind' },
  { id: 'walk', name: '가벼운 산책', emoji: '🚶', category: 'health' },
  { id: 'breathing', name: '심호흡', emoji: '🌬️', category: 'mind' },
  { id: 'family-call', name: '가족과 통화', emoji: '📞', category: 'social' },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, completeOnboarding } = useAuthStore();
  const { systemRituals } = useRitualStore();

  const [step, setStep] = useState(0);
  const [selectedRituals, setSelectedRituals] = useState<string[]>([]);

  const isIntroPhase = step < ONBOARDING_STEPS.length;
  const totalSteps = ONBOARDING_STEPS.length + 1; // 인트로 + 의식 선택

  const handleNext = () => {
    if (step < ONBOARDING_STEPS.length) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const toggleRitual = (ritualId: string) => {
    setSelectedRituals((prev) =>
      prev.includes(ritualId)
        ? prev.filter((id) => id !== ritualId)
        : [...prev, ritualId]
    );
  };

  const handleComplete = async () => {
    // TODO: 선택한 의식 저장
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  const handleSkip = async () => {
    await completeOnboarding();
    router.replace('/(tabs)');
  };

  if (isIntroPhase) {
    const currentStep = ONBOARDING_STEPS[step];

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <StepProgressBar currentStep={step + 1} totalSteps={totalSteps} />
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipText}>건너뛰기</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.introContent}>
          <Text style={styles.introEmoji}>{currentStep.emoji}</Text>
          <Text style={styles.introTitle}>{currentStep.title}</Text>
          <Text style={styles.introDescription}>{currentStep.description}</Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <View style={styles.buttonRow}>
            {step > 0 && (
              <FruitButton
                variant="lemon"
                label="이전"
                size="medium"
                onPress={handleBack}
              />
            )}
            <View style={{ flex: 1 }}>
              <FruitButton
                variant="orange"
                label="다음"
                size="large"
                onPress={handleNext}
              />
            </View>
          </View>
        </View>
      </View>
    );
  }

  // 의식 선택 단계
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <StepProgressBar currentStep={step + 1} totalSteps={totalSteps} />
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>나중에 할게요</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.ritualTitle}>
          어떤 의식을 시작할까요? 🌱
        </Text>
        <Text style={styles.ritualDescription}>
          매일 실천하고 싶은 의식을 선택해주세요{'\n'}
          나중에 언제든 변경할 수 있어요
        </Text>

        <View style={styles.ritualGrid}>
          {RITUAL_SUGGESTIONS.map((ritual) => {
            const isSelected = selectedRituals.includes(ritual.id);
            return (
              <TouchableOpacity
                key={ritual.id}
                style={[
                  styles.ritualItem,
                  isSelected && styles.ritualItemSelected,
                ]}
                onPress={() => toggleRitual(ritual.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
                <Text
                  style={[
                    styles.ritualName,
                    isSelected && styles.ritualNameSelected,
                  ]}
                >
                  {ritual.name}
                </Text>
                {isSelected && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.selectedCount}>
          {selectedRituals.length > 0
            ? `${selectedRituals.length}개 선택됨`
            : '하나 이상 선택해주세요'}
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.buttonRow}>
          <FruitButton
            variant="lemon"
            label="이전"
            size="medium"
            onPress={handleBack}
          />
          <View style={{ flex: 1 }}>
            <FruitButton
              variant="greenApple"
              label="시작하기"
              size="large"
              onPress={handleComplete}
              disabled={selectedRituals.length === 0}
            />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.lg,
  },
  skipButton: {
    padding: LAYOUT.spacing.sm,
  },
  skipText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  introEmoji: {
    fontSize: 100,
    marginBottom: LAYOUT.spacing.xxl,
  },
  introTitle: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.lg,
    lineHeight: TYPOGRAPHY.fontSize.hero * 1.3,
  },
  introDescription: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
  ritualTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
  },
  ritualDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.xl,
  },
  ritualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.lg,
  },
  ritualItem: {
    width: (width - LAYOUT.screenPaddingHorizontal * 2 - LAYOUT.spacing.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'transparent',
  },
  ritualItemSelected: {
    borderColor: COLORS.greenApple,
    backgroundColor: COLORS.greenAppleLight,
  },
  ritualEmoji: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  ritualName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
    textAlign: 'center',
  },
  ritualNameSelected: {
    color: COLORS.greenApple,
  },
  checkmark: {
    position: 'absolute',
    top: LAYOUT.spacing.sm,
    right: LAYOUT.spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  selectedCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    alignItems: 'center',
  },
});
