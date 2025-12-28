import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

const { width, height } = Dimensions.get('window');

interface FeedbackOverlayProps {
  type: 'correct' | 'incorrect' | 'timeout';
  visible: boolean;
  onHide?: () => void;
  duration?: number;
}

export const FeedbackOverlay: React.FC<FeedbackOverlayProps> = ({
  type,
  visible,
  onHide,
  duration = 500,
}) => {
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setTimeout(() => {
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }).start(onHide);
        }, duration);
      });
    }
  }, [visible]);

  if (!visible) return null;

  const feedbackConfig = {
    correct: {
      emoji: '✓',
      color: COLORS.greenApple,
      backgroundColor: COLORS.greenAppleLight,
      text: '정답!',
    },
    incorrect: {
      emoji: '✗',
      color: COLORS.apple,
      backgroundColor: COLORS.appleLight,
      text: '틀렸어요',
    },
    timeout: {
      emoji: '⏰',
      color: COLORS.orange,
      backgroundColor: COLORS.orangeLight,
      text: '시간 초과',
    },
  };

  const config = feedbackConfig[type];

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          opacity: opacityAnim,
          backgroundColor: config.backgroundColor,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.feedbackContainer,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View
          style={[styles.iconCircle, { backgroundColor: config.color }]}
        >
          <Text style={styles.feedbackIcon}>{config.emoji}</Text>
        </View>
        <Text style={[styles.feedbackText, { color: config.color }]}>
          {config.text}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

interface ScorePopupProps {
  score: number;
  position?: { x: number; y: number };
  visible: boolean;
}

export const ScorePopup: React.FC<ScorePopupProps> = ({
  score,
  position,
  visible,
}) => {
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      translateYAnim.setValue(0);
      opacityAnim.setValue(1);
      scaleAnim.setValue(0.5);

      Animated.parallel([
        Animated.timing(translateYAnim, {
          toValue: -50,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.delay(400),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const isPositive = score > 0;

  return (
    <Animated.View
      style={[
        styles.scorePopup,
        position && { left: position.x, top: position.y },
        {
          transform: [
            { translateY: translateYAnim },
            { scale: scaleAnim },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <Text
        style={[
          styles.scoreText,
          { color: isPositive ? COLORS.greenApple : COLORS.apple },
        ]}
      >
        {isPositive ? '+' : ''}{score}
      </Text>
    </Animated.View>
  );
};

interface ComboDisplayProps {
  combo: number;
  visible: boolean;
}

export const ComboDisplay: React.FC<ComboDisplayProps> = ({
  combo,
  visible,
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible && combo > 1) {
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 5,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [combo]);

  if (!visible || combo < 2) return null;

  return (
    <Animated.View
      style={[
        styles.comboContainer,
        { transform: [{ scale: scaleAnim }] },
      ]}
    >
      <Text style={styles.comboNumber}>{combo}</Text>
      <Text style={styles.comboText}>COMBO!</Text>
    </Animated.View>
  );
};

interface CountdownOverlayProps {
  count: number;
  visible: boolean;
}

export const CountdownOverlay: React.FC<CountdownOverlayProps> = ({
  count,
  visible,
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 5,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.8,
          duration: 800,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [count, visible]);

  if (!visible) return null;

  return (
    <View style={styles.countdownOverlay}>
      <Animated.Text
        style={[
          styles.countdownNumber,
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        {count}
      </Animated.Text>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  feedbackContainer: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  feedbackIcon: {
    fontSize: 48,
    color: COLORS.white,
    fontWeight: '700',
  },
  feedbackText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
  },
  scorePopup: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
  },
  comboContainer: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    backgroundColor: COLORS.orange,
    paddingHorizontal: LAYOUT.spacing.xl,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  comboNumber: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.white,
  },
  comboText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.white,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 100,
  },
  countdownNumber: {
    fontSize: 150,
    fontWeight: '700',
    color: COLORS.white,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 8,
  },
});
