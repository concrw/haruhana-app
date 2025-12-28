import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

const { width } = Dimensions.get('window');

interface FruitTargetProps {
  emoji: string;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  disabled?: boolean;
  animateIn?: boolean;
  animateOut?: boolean;
  highlight?: boolean;
  position?: { x: number; y: number };
}

const SIZES = {
  small: 60,
  medium: 100,
  large: 140,
};

export const FruitTarget: React.FC<FruitTargetProps> = ({
  emoji,
  size = 'medium',
  onPress,
  disabled = false,
  animateIn = true,
  animateOut = false,
  highlight = false,
  position,
}) => {
  const scaleAnim = useRef(new Animated.Value(animateIn ? 0 : 1)).current;
  const opacityAnim = useRef(new Animated.Value(animateIn ? 0 : 1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (animateIn) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateIn]);

  useEffect(() => {
    if (animateOut) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [animateOut]);

  useEffect(() => {
    if (highlight) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [highlight]);

  const targetSize = SIZES[size];
  const fontSize = targetSize * 0.7;

  const containerStyle = [
    styles.container,
    {
      width: targetSize,
      height: targetSize,
      borderRadius: targetSize / 2,
    },
    highlight && styles.highlighted,
    position && {
      position: 'absolute' as const,
      left: position.x - targetSize / 2,
      top: position.y - targetSize / 2,
    },
  ];

  return (
    <Animated.View
      style={[
        containerStyle,
        {
          transform: [
            { scale: Animated.multiply(scaleAnim, pulseAnim) },
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchable}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={[styles.emoji, { fontSize }]}>{emoji}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface FruitGridProps {
  fruits: Array<{ id: string; emoji: string }>;
  targetId: string;
  onFruitPress: (fruitId: string, isTarget: boolean) => void;
  columns?: number;
  disabled?: boolean;
}

export const FruitGrid: React.FC<FruitGridProps> = ({
  fruits,
  targetId,
  onFruitPress,
  columns = 3,
  disabled = false,
}) => {
  const gridWidth = width - LAYOUT.screenPaddingHorizontal * 2;
  const itemSize = (gridWidth - LAYOUT.spacing.md * (columns - 1)) / columns;

  return (
    <View style={[styles.grid, { width: gridWidth }]}>
      {fruits.map((fruit, index) => (
        <TouchableOpacity
          key={`${fruit.id}-${index}`}
          style={[
            styles.gridItem,
            {
              width: itemSize,
              height: itemSize,
              borderRadius: itemSize / 2,
            },
          ]}
          onPress={() => onFruitPress(fruit.id, fruit.id === targetId)}
          disabled={disabled}
          activeOpacity={0.7}
        >
          <Text style={[styles.gridEmoji, { fontSize: itemSize * 0.5 }]}>
            {fruit.emoji}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.textBlack,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  highlighted: {
    backgroundColor: COLORS.greenAppleLight,
    borderWidth: 3,
    borderColor: COLORS.greenApple,
  },
  touchable: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
  },
  gridItem: {
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.textBlack,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  gridEmoji: {
    textAlign: 'center',
  },
});
