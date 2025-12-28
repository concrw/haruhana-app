import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useWalkingStore } from '../../stores/walkingStore';
import { StepCounter } from '../../components/walking/StepCounter';
import { FruitButton } from '../../components/common/FruitButton';
import { COLORS } from '../../constants/colors';
import { WALKING_TEXTS } from '../../constants/walkingTexts';

export default function WalkingHome() {
  const router = useRouter();
  const {
    todaySteps,
    todayDistance,
    goalSteps,
    currentSession,
    isTracking,
    isLoading,
    startWalkingSession,
    fetchTodaySteps,
  } = useWalkingStore();

  useEffect(() => {
    fetchTodaySteps();
  }, []);

  const handleStart = async () => {
    await startWalkingSession(false);
    router.push('/walking/session');
  };

  const handleContinue = () => {
    router.push('/walking/session');
  };

  const distanceKm = todayDistance / 1000;
  const progress = goalSteps > 0 ? Math.min((todaySteps / goalSteps) * 100, 100) : 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{WALKING_TEXTS.home.title} 🚶</Text>

      <View style={styles.card}>
        <StepCounter
          currentSteps={todaySteps}
          goalSteps={goalSteps}
          distanceKm={distanceKm}
        />

        {progress >= 100 && (
          <View style={styles.achievedBanner}>
            <Text style={styles.achievedText}>{WALKING_TEXTS.home.goalAchieved}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonsContainer}>
        {isTracking && currentSession ? (
          <FruitButton
            variant="orange"
            label={WALKING_TEXTS.home.continueButton}
            onPress={handleContinue}
            disabled={isLoading}
          />
        ) : (
          <FruitButton
            variant="apple"
            label={WALKING_TEXTS.home.startButton}
            onPress={handleStart}
            disabled={isLoading}
            loading={isLoading}
          />
        )}
      </View>

      <View style={styles.quickLinks}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/walking/history')}
        >
          <Text style={styles.linkText}>📊 {WALKING_TEXTS.history.title}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.linkButton}
          onPress={() => router.push('/walking/stats')}
        >
          <Text style={styles.linkText}>📈 {WALKING_TEXTS.stats.title}</Text>
        </TouchableOpacity>
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
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.textDark,
    marginBottom: 20,
  },
  card: {
    marginBottom: 24,
  },
  achievedBanner: {
    marginTop: 16,
    padding: 16,
    backgroundColor: COLORS.greenAppleLight,
    borderRadius: 12,
    alignItems: 'center',
  },
  achievedText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.greenApple,
  },
  buttonsContainer: {
    marginBottom: 24,
  },
  quickLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  linkButton: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  linkText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});
