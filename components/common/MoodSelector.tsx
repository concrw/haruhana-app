import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { MoodType } from '../../types/ritual';

interface MoodOption {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { type: 'great', emoji: '😄', label: '아주 좋아요', color: COLORS.greenApple },
  { type: 'good', emoji: '🙂', label: '좋아요', color: COLORS.orange },
  { type: 'okay', emoji: '😐', label: '그냥 그래요', color: COLORS.lemon },
  { type: 'tired', emoji: '😔', label: '피곤해요', color: COLORS.grape },
];

export interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood?: (mood: MoodType) => void;
  onSelect?: (mood: MoodType) => void;  // alias for onSelectMood
  variant?: 'horizontal' | 'grid';
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
  onSelect,
  variant = 'horizontal',
}) => {
  const handleSelect = (mood: MoodType) => {
    if (onSelectMood) onSelectMood(mood);
    if (onSelect) onSelect(mood);
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>오늘 기분은 어떠세요?</Text>
      <View style={[
        styles.optionsContainer,
        variant === 'grid' && styles.gridContainer,
      ]}>
        {MOOD_OPTIONS.map((option) => {
          const isSelected = selectedMood === option.type;
          return (
            <TouchableOpacity
              key={option.type}
              style={[
                styles.moodOption,
                variant === 'grid' && styles.gridOption,
                isSelected && { backgroundColor: option.color },
              ]}
              onPress={() => handleSelect(option.type)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.emoji,
                isSelected && styles.selectedEmoji,
              ]}>
                {option.emoji}
              </Text>
              <Text style={[
                styles.moodLabel,
                isSelected && styles.selectedLabel,
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// 간단한 이모지 선택기 (컴팩트 버전)
interface CompactMoodSelectorProps {
  selectedMood: MoodType | null;
  onSelectMood: (mood: MoodType) => void;
}

export const CompactMoodSelector: React.FC<CompactMoodSelectorProps> = ({
  selectedMood,
  onSelectMood,
}) => {
  return (
    <View style={styles.compactContainer}>
      {MOOD_OPTIONS.map((option) => {
        const isSelected = selectedMood === option.type;
        return (
          <TouchableOpacity
            key={option.type}
            style={[
              styles.compactOption,
              isSelected && {
                backgroundColor: option.color,
                transform: [{ scale: 1.2 }],
              },
            ]}
            onPress={() => onSelectMood(option.type)}
            activeOpacity={0.8}
          >
            <Text style={styles.compactEmoji}>{option.emoji}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: LAYOUT.spacing.md,
  },
  gridContainer: {
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  moodOption: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.lg,
    paddingHorizontal: LAYOUT.spacing.sm,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.lg,
    minWidth: 72,
    maxWidth: 90,
  },
  gridOption: {
    flex: 0,
    width: '45%',
    marginBottom: LAYOUT.spacing.md,
  },
  emoji: {
    fontSize: 40,
    marginBottom: LAYOUT.spacing.sm,
  },
  selectedEmoji: {
    transform: [{ scale: 1.1 }],
  },
  moodLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  selectedLabel: {
    color: COLORS.white,
    fontWeight: '600',
  },

  // Compact
  compactContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: LAYOUT.spacing.lg,
  },
  compactOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.backgroundLight,
  },
  compactEmoji: {
    fontSize: 32,
  },
});

export default MoodSelector;
