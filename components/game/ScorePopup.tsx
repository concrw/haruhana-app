import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';

interface ScorePopupProps {
  score: number;
  x: number;
  y: number;
  isCorrect: boolean;
  onComplete?: () => void;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  score,
  x,
  y,
  isCorrect,
  onComplete,
}) => {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.2,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 100,
          friction: 3,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(translateY, {
        toValue: -50,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 1000,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete?.();
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          left: x,
          top: y,
          opacity,
          transform: [{ translateY }, { scale }],
        },
      ]}
    >
      <Text
        style={[
          styles.text,
          { color: isCorrect ? COLORS.green : COLORS.orangeRed },
        ]}
      >
        {isCorrect ? `+${score}` : '0'}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});
