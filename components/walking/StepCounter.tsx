import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface StepCounterProps {
  currentSteps: number;
  goalSteps: number;
  distanceKm: number;
}

export const StepCounter: React.FC<StepCounterProps> = ({
  currentSteps,
  goalSteps,
  distanceKm,
}) => {
  const progress = Math.min((currentSteps / goalSteps) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.stepsContainer}>
        <Text style={styles.stepsNumber}>{currentSteps.toLocaleString()}</Text>
        <Text style={styles.stepsLabel}>걸음</Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{Math.round(progress)}%</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>목표</Text>
          <Text style={styles.statValue}>{goalSteps.toLocaleString()}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>거리</Text>
          <Text style={styles.statValue}>{distanceKm.toFixed(2)} km</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  stepsContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  stepsNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  stepsLabel: {
    fontSize: 18,
    color: COLORS.textGray,
    marginTop: 4,
  },
  progressContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.greenApple,
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textDark,
    width: 50,
  },
  statsRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.textGray,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textDark,
  },
});
