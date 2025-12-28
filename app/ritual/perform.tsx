import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  BackHandler,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FruitButton } from '../../components/common/FruitButton';
import { Timer } from '../../components/common/Timer';
import { StepProgressBar } from '../../components/common/ProgressBar';
import { useRitualStore } from '../../stores/ritualStore';
import { useAuthStore } from '../../stores/authStore';

export default function RitualPerformScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { systemRituals, completeRitual } = useRitualStore();

  const ritual = systemRituals.find((r) => r.id === id);
  const steps = ritual?.steps || ['의식을 수행해주세요'];

  const [currentStep, setCurrentStep] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [stepCompleted, setStepCompleted] = useState(false);

  const stepDuration = ritual ? Math.floor((ritual.duration || 0) / steps.length) : 60;

  // 뒤로가기 방지
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      handleExit();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleExit = () => {
    Alert.alert(
      '의식 중단',
      '지금 나가면 진행 상황이 저장되지 않아요.\n정말 나가시겠어요?',
      [
        { text: '계속하기', style: 'cancel' },
        {
          text: '나가기',
          style: 'destructive',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleTimerComplete = useCallback(() => {
    setIsTimerRunning(false);
    setStepCompleted(true);
  }, []);

  const handleNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setStepCompleted(false);
      setIsTimerRunning(true);
    } else {
      // 모든 단계 완료
      handleComplete();
    }
  };

  const handleComplete = async () => {
    if (user?.id && ritual) {
      await completeRitual({
        mood: 'good',
      });
    }
    router.replace({
      pathname: '/ritual/complete',
      params: { id: ritual?.id },
    });
  };

  const handleSkipStep = () => {
    Alert.alert(
      '단계 건너뛰기',
      '이 단계를 건너뛸까요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '건너뛰기',
          onPress: handleNextStep,
        },
      ]
    );
  };

  if (!ritual) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>불러오는 중...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
          <Text style={styles.exitButtonText}>✕</Text>
        </TouchableOpacity>
        <StepProgressBar
          currentStep={currentStep + 1}
          totalSteps={steps.length}
        />
        <View style={styles.placeholder} />
      </View>

      {/* 메인 콘텐츠 */}
      <View style={styles.content}>
        {/* 의식 정보 */}
        <View style={styles.ritualInfo}>
          <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
          <Text style={styles.ritualName}>{ritual.name}</Text>
        </View>

        {/* 현재 단계 */}
        <View style={styles.stepCard}>
          <Text style={styles.stepLabel}>
            {currentStep + 1}단계 / {steps.length}단계
          </Text>
          <Text style={styles.stepText}>{typeof steps[currentStep] === 'string' ? steps[currentStep] : steps[currentStep].text}</Text>
        </View>

        {/* 타이머 */}
        <View style={styles.timerSection}>
          {!isTimerRunning && !stepCompleted ? (
            <TouchableOpacity
              style={styles.startTimerButton}
              onPress={() => setIsTimerRunning(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.startTimerEmoji}>▶️</Text>
              <Text style={styles.startTimerText}>터치하여 시작</Text>
            </TouchableOpacity>
          ) : (
            <Timer
              duration={stepDuration}
              isRunning={isTimerRunning}
              onComplete={handleTimerComplete}
              variant="circular"
              size="large"
              showControls={false}
            />
          )}
        </View>

        {/* 완료 메시지 */}
        {stepCompleted && (
          <View style={styles.completedMessage}>
            <Text style={styles.completedEmoji}>👏</Text>
            <Text style={styles.completedText}>잘하셨어요!</Text>
          </View>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {stepCompleted ? (
          <FruitButton
            variant={currentStep === steps.length - 1 ? 'greenApple' : 'orange'}
            label={currentStep === steps.length - 1 ? '완료하기' : '다음 단계'}
            size="large"
            onPress={handleNextStep}
          />
        ) : (
          <View style={styles.footerButtons}>
            {isTimerRunning && (
              <FruitButton
                variant="lemon"
                label="건너뛰기"
                size="medium"
                onPress={handleSkipStep}
              />
            )}
          </View>
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
    justifyContent: 'space-between',
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  exitButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: 24,
    color: COLORS.textGray,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
    padding: LAYOUT.screenPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ritualInfo: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  ritualEmoji: {
    fontSize: 64,
    marginBottom: LAYOUT.spacing.md,
  },
  ritualName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  stepCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  stepLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.md,
  },
  stepText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textBlack,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.5,
  },
  timerSection: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  startTimerButton: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTimerEmoji: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.sm,
  },
  startTimerText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.white,
  },
  completedMessage: {
    alignItems: 'center',
  },
  completedEmoji: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.sm,
  },
  completedText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.greenApple,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
  footerButtons: {
    alignItems: 'center',
  },
});
