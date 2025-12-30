import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelPosition?: 'top' | 'right' | 'inside';
  labelFormat?: 'percent' | 'fraction';
  total?: number;
  current?: number;
  style?: ViewStyle;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 12,
  color = COLORS.greenApple,
  backgroundColor = COLORS.backgroundLight,
  showLabel = false,
  labelPosition = 'right',
  labelFormat = 'percent',
  total,
  current,
  style,
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const percentage = Math.round(clampedProgress * 100);

  const getLabel = () => {
    if (labelFormat === 'fraction' && total !== undefined && current !== undefined) {
      return `${current}/${total}`;
    }
    return `${percentage}%`;
  };

  const renderLabel = () => {
    if (!showLabel) return null;

    const label = getLabel();

    if (labelPosition === 'inside' && clampedProgress > 0.15) {
      return (
        <Text style={[styles.insideLabel, { lineHeight: height }]}>
          {label}
        </Text>
      );
    }

    return null;
  };

  return (
    <View style={[styles.container, style]}>
      {showLabel && labelPosition === 'top' && (
        <Text style={styles.topLabel}>{getLabel()}</Text>
      )}

      <View style={styles.barRow}>
        <View
          style={[
            styles.barContainer,
            {
              height,
              backgroundColor,
              borderRadius: height / 2,
            },
          ]}
        >
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: color,
                borderRadius: height / 2,
              },
            ]}
          >
            {renderLabel()}
          </View>
        </View>

        {showLabel && labelPosition === 'right' && (
          <Text style={styles.rightLabel}>{getLabel()}</Text>
        )}
      </View>
    </View>
  );
};

// 여러 단계를 표시하는 스텝 프로그레스 바
interface StepProgressBarProps {
  currentStep: number;
  totalSteps: number;
  activeColor?: string;
  inactiveColor?: string;
  completedColor?: string;
  style?: ViewStyle;
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({
  currentStep,
  totalSteps,
  activeColor = COLORS.orange,
  inactiveColor = COLORS.backgroundLight,
  completedColor = COLORS.greenApple,
  style,
}) => {
  return (
    <View style={[styles.stepContainer, style]}>
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <React.Fragment key={index}>
            <View
              style={[
                styles.stepDot,
                {
                  backgroundColor: isCompleted
                    ? completedColor
                    : isCurrent
                      ? activeColor
                      : inactiveColor,
                  transform: [{ scale: isCurrent ? 1.3 : 1 }],
                },
              ]}
            >
              {isCompleted && <Text style={styles.checkmark}>✓</Text>}
              {isCurrent && <Text style={styles.currentNumber}>{index + 1}</Text>}
            </View>
            {index < totalSteps - 1 && (
              <View
                style={[
                  styles.stepLine,
                  {
                    backgroundColor: isCompleted ? completedColor : inactiveColor,
                  },
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  barContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: LAYOUT.spacing.sm,
  },
  topLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xs,
    textAlign: 'right',
  },
  rightLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
    marginLeft: LAYOUT.spacing.md,
    minWidth: 48,
  },
  insideLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.white,
    fontWeight: '600',
  },

  // Step Progress
  stepContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepLine: {
    flex: 1,
    height: 3,
    maxWidth: 60,
  },
  checkmark: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  currentNumber: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },
});

export default ProgressBar;
