import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FruitButton } from '../../components/common/FruitButton';
import { MoodSelector } from '../../components/common/MoodSelector';
import { useRitualStore } from '../../stores/ritualStore';
import { useAuthStore } from '../../stores/authStore';
import { MoodType } from '../../types/ritual';

const ENCOURAGEMENTS = [
  '오늘도 의식을 완료했어요! 👏',
  '꾸준함이 가장 큰 힘이에요! 💪',
  '잘하고 계세요! 자랑스러워요! 🌟',
  '한 걸음 한 걸음 성장하고 있어요! 🌱',
  '오늘의 작은 실천이 큰 변화를 만들어요! ✨',
];

export default function RitualCompleteScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { systemRituals, currentStreak } = useRitualStore();

  const ritual = systemRituals.find((r) => r.id === id);

  const [mood, setMood] = useState<MoodType | null>(null);
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [encouragement] = useState(
    ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]
  );

  // 애니메이션
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // 2초 후 기분 선택 표시
    const timer = setTimeout(() => {
      setShowMoodSelector(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleMoodSelect = (selectedMood: MoodType) => {
    setMood(selectedMood);
  };

  const handleDone = () => {
    router.replace('/(tabs)');
  };

  const handleAnotherRitual = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        {/* 완료 애니메이션 */}
        <Animated.View
          style={[
            styles.celebrationCard,
            { transform: [{ scale: scaleAnim }] },
          ]}
        >
          <Text style={styles.celebrationEmoji}>🎉</Text>
          <Text style={styles.celebrationTitle}>완료!</Text>
          {ritual && (
            <View style={styles.ritualInfo}>
              <Text style={styles.ritualEmoji}>{ritual.emoji}</Text>
              <Text style={styles.ritualName}>{ritual.name}</Text>
            </View>
          )}
        </Animated.View>

        {/* 격려 메시지 */}
        <Animated.View style={[styles.encouragement, { opacity: fadeAnim }]}>
          <Text style={styles.encouragementText}>{encouragement}</Text>
        </Animated.View>

        {/* 스트릭 정보 */}
        <Animated.View style={[styles.streakCard, { opacity: fadeAnim }]}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakText}>
            {currentStreak > 0
              ? `${currentStreak}일 연속 달성 중!`
              : '첫 번째 의식을 완료했어요!'}
          </Text>
        </Animated.View>

        {/* 기분 선택 */}
        {showMoodSelector && (
          <Animated.View style={[styles.moodSection, { opacity: fadeAnim }]}>
            <Text style={styles.moodTitle}>지금 기분이 어떠세요?</Text>
            <MoodSelector
              selectedMood={mood}
              onSelect={handleMoodSelect}
            />
          </Animated.View>
        )}
      </View>

      {/* 하단 버튼 */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="greenApple"
          label="홈으로"
          size="large"
          onPress={handleDone}
        />
        <TouchableOpacity
          style={styles.anotherButton}
          onPress={handleAnotherRitual}
        >
          <Text style={styles.anotherButtonText}>다른 의식 하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  content: {
    flex: 1,
    padding: LAYOUT.screenPaddingHorizontal,
    alignItems: 'center',
    justifyContent: 'center',
  },
  celebrationCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xxl,
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
    width: '100%',
  },
  celebrationEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.md,
  },
  celebrationTitle: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.greenApple,
    marginBottom: LAYOUT.spacing.lg,
  },
  ritualInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    backgroundColor: COLORS.backgroundCream,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
  },
  ritualEmoji: {
    fontSize: 28,
  },
  ritualName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  encouragement: {
    marginBottom: LAYOUT.spacing.xl,
  },
  encouragementText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textBlack,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.5,
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.orangeLight,
    paddingHorizontal: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  streakEmoji: {
    fontSize: 24,
  },
  streakText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.orange,
  },
  moodSection: {
    width: '100%',
    alignItems: 'center',
    gap: LAYOUT.spacing.lg,
  },
  moodTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  anotherButton: {
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
  },
  anotherButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
