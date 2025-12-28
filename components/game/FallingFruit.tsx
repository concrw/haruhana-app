import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import { FRUITS } from '../../constants/fruits';

const { width, height} = Dimensions.get('window');

interface FallingFruitProps {
  fruitId: string;
  onComplete?: () => void;
  delay?: number;
}

export const FallingFruit: React.FC<FallingFruitProps> = ({
  fruitId,
  onComplete,
  delay = 0,
}) => {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;

  const fruit = FRUITS[fruitId as keyof typeof FRUITS];

  useEffect(() => {
    const animation = Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: height * 0.6,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]);

    animation.start(() => {
      onComplete?.();
    });

    return () => {
      animation.stop();
    };
  }, []);

  const spin = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!fruit) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity,
          transform: [{ translateY }, { rotate: spin }],
        },
      ]}
    >
      <Text style={styles.fruit}>{fruit.emoji}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: width / 2 - 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruit: {
    fontSize: 80,
  },
});
