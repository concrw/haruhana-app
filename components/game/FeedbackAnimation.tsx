import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface FeedbackAnimationProps {
  type: 'correct' | 'incorrect';
  onComplete?: () => void;
}

export const FeedbackAnimation: React.FC<FeedbackAnimationProps> = ({
  type,
  onComplete,
}) => {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.delay(500),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  const emoji = type === 'correct' ? '✓' : '✗';
  const color = type === 'correct' ? COLORS.green : COLORS.orangeRed;
  const backgroundColor =
    type === 'correct'
      ? 'rgba(76, 175, 80, 0.1)'
      : 'rgba(255, 87, 51, 0.1)';

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      <Text style={[styles.emoji, { color }]}>{emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '40%',
    left: width / 2 - 75,
    width: 150,
    height: 150,
    borderRadius: 75,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'transparent',
  },
  emoji: {
    fontSize: 80,
    fontWeight: '700',
  },
});
