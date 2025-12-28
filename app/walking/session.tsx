import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useWalkingStore } from '../../stores/walkingStore';
import { StepCounter } from '../../components/walking/StepCounter';
import { FruitButton } from '../../components/common/FruitButton';
import { COLORS } from '../../constants/colors';
import { WALKING_TEXTS } from '../../constants/walkingTexts';

export default function WalkingSession() {
  const router = useRouter();
  const {
    todaySteps,
    todayDistance,
    goalSteps,
    currentSession,
    isTracking,
    completeSession,
  } = useWalkingStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!currentSession) {
      router.replace('/walking');
      return;
    }

    // 타이머 시작
    const timer = setInterval(() => {
      if (currentSession.startedAt) {
        const elapsed = Math.floor(
          (Date.now() - currentSession.startedAt.getTime()) / 1000
        );
        setElapsedSeconds(elapsed);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [currentSession]);

  const handleComplete = () => {
    Alert.alert(
      '산책 완료',
      '산책을 완료하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '완료',
          onPress: async () => {
            await completeSession();
            router.replace('/walking');
          },
        },
      ]
    );
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentSession) {
    return null;
  }

  const distanceKm = todayDistance / 1000;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{WALKING_TEXTS.session.title}</Text>

      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>{WALKING_TEXTS.session.timeElapsed}</Text>
        <Text style={styles.timerValue}>{formatTime(elapsedSeconds)}</Text>
      </View>

      <View style={styles.card}>
        <StepCounter
          currentSteps={todaySteps}
          goalSteps={goalSteps}
          distanceKm={distanceKm}
        />
      </View>

      <View style={styles.buttonsContainer}>
        <FruitButton
          variant="greenApple"
          label={WALKING_TEXTS.session.completeButton}
          onPress={handleComplete}
        />
      </View>

      {currentSession.withCall && (
        <View style={styles.callIndicator}>
          <Text style={styles.callText}>📞 통화 중...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundWarm,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  timerContainer: {
    backgroundColor: COLORS.white,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  timerLabel: {
    fontSize: 16,
    color: COLORS.textGray,
    marginBottom: 8,
  },
  timerValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  card: {
    marginBottom: 24,
  },
  buttonsContainer: {
    marginTop: 'auto',
  },
  callIndicator: {
    marginTop: 16,
    padding: 12,
    backgroundColor: COLORS.appleLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  callText: {
    fontSize: 16,
    color: COLORS.apple,
    fontWeight: '600',
  },
});
