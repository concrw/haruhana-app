import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FRUIT_COLORS, FruitType } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FRUITS } from '../../constants/fruits';

interface FruitButtonProps {
  variant: FruitType;
  label: string;
  onPress: () => void;
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  showEmoji?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BUTTON_SIZES = {
  small: {
    height: LAYOUT.buttonHeight.small,
    paddingHorizontal: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.base,
    emojiSize: 20,
  },
  medium: {
    height: LAYOUT.buttonHeight.medium,
    paddingHorizontal: LAYOUT.spacing.xl,
    fontSize: TYPOGRAPHY.fontSize.lg,
    emojiSize: 24,
  },
  large: {
    height: LAYOUT.buttonHeight.large,
    paddingHorizontal: LAYOUT.spacing.xxl,
    fontSize: TYPOGRAPHY.fontSize.xl,
    emojiSize: 28,
  },
};

export const FruitButton: React.FC<FruitButtonProps> = ({
  variant,
  label,
  onPress,
  size = 'large',
  disabled = false,
  loading = false,
  fullWidth = false,
  showEmoji = true,
  style,
  textStyle,
}) => {
  const fruitColor = FRUIT_COLORS[variant];
  const fruitInfo = FRUITS[variant as keyof typeof FRUITS];
  const sizeConfig = BUTTON_SIZES[size];

  const buttonStyles: ViewStyle[] = [
    styles.button,
    {
      height: sizeConfig.height,
      paddingHorizontal: sizeConfig.paddingHorizontal,
      backgroundColor: fruitColor,
    },
    fullWidth ? styles.fullWidth : {},
    disabled ? styles.disabled : {},
    style || {},
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} size="small" />
      ) : (
        <View style={styles.content}>
          {showEmoji && fruitInfo && (
            <Text style={[styles.emoji, { fontSize: sizeConfig.emojiSize }]}>
              {fruitInfo.emoji}
            </Text>
          )}
          <Text
            style={[
              styles.label,
              { fontSize: sizeConfig.fontSize },
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {label}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: LAYOUT.radius.lg,
    minWidth: LAYOUT.touchTarget.recommended,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  emoji: {
    marginRight: LAYOUT.spacing.xs,
  },
  label: {
    color: COLORS.white,
    fontWeight: '600',
    textAlign: 'center',
  },
  disabledText: {
    color: COLORS.textLight,
  },
});

export default FruitButton;
