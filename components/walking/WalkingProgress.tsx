import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

interface WalkingProgressProps {
  steps: number;
  goal: number;
  showPercentage?: boolean;
}

export const WalkingProgress: React.FC<WalkingProgressProps> = ({
  steps,
  goal,
  showPercentage = true,
}) => {
  const progress = Math.min((steps / goal) * 100, 100);

  return (
    <View style={styles.container}>
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%` }]} />
      </View>
      {showPercentage && (
        <Text style={styles.percentage}>{Math.round(progress)}%</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.greenApple,
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
    width: 45,
    textAlign: 'right',
  },
});
