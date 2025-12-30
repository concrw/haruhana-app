import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { ProgressBar } from '../common/ProgressBar';

interface GameHeaderProps {
  onExit: () => void;
  progress?: number;
  trialText?: string;
  rightElement?: React.ReactNode;
  backgroundColor?: string;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  onExit,
  progress,
  trialText,
  rightElement,
  backgroundColor = COLORS.backgroundCream,
}) => {
  return (
    <View style={[styles.container, { backgroundColor }]}>
      <TouchableOpacity style={styles.exitButton} onPress={onExit}>
        <Text style={styles.exitButtonText}>✕</Text>
      </TouchableOpacity>

      {progress !== undefined && (
        <View style={styles.progressContainer}>
          <ProgressBar progress={progress} />
        </View>
      )}

      {trialText && (
        <View style={styles.trialBadge}>
          <Text style={styles.trialText}>{trialText}</Text>
        </View>
      )}

      {rightElement && (
        <View style={styles.rightElement}>{rightElement}</View>
      )}
    </View>
  );
};

interface GameScoreHeaderProps {
  score: number;
  time?: number;
  lives?: number;
  onPause?: () => void;
}

export const GameScoreHeader: React.FC<GameScoreHeaderProps> = ({
  score,
  time,
  lives,
  onPause,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.scoreHeader}>
      <View style={styles.scoreItem}>
        <Text style={styles.scoreLabel}>점수</Text>
        <Text style={styles.scoreValue}>{score}</Text>
      </View>

      {time !== undefined && (
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>시간</Text>
          <Text style={styles.scoreValue}>{formatTime(time)}</Text>
        </View>
      )}

      {lives !== undefined && (
        <View style={styles.scoreItem}>
          <Text style={styles.scoreLabel}>남은 기회</Text>
          <Text style={styles.livesValue}>
            {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
          </Text>
        </View>
      )}

      {onPause && (
        <TouchableOpacity style={styles.pauseButton} onPress={onPause}>
          <Text style={styles.pauseButtonText}>⏸️</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

interface GameRuleIndicatorProps {
  rule: string;
  emoji: string;
  highlighted?: boolean;
}

export const GameRuleIndicator: React.FC<GameRuleIndicatorProps> = ({
  rule,
  emoji,
  highlighted = false,
}) => {
  return (
    <View style={[styles.ruleIndicator, highlighted && styles.ruleHighlighted]}>
      <Text style={styles.ruleEmoji}>{emoji}</Text>
      <Text style={styles.ruleText}>{rule}</Text>
    </View>
  );
};

interface TargetIndicatorProps {
  emoji: string;
  label?: string;
}

export const TargetIndicator: React.FC<TargetIndicatorProps> = ({
  emoji,
  label = '목표',
}) => {
  return (
    <View style={styles.targetIndicator}>
      <Text style={styles.targetLabel}>{label}</Text>
      <View style={styles.targetBadge}>
        <Text style={styles.targetEmoji}>{emoji}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  exitButton: {
    width: LAYOUT.touchTarget.recommended,
    height: LAYOUT.touchTarget.recommended,
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButtonText: {
    fontSize: 24,
    color: COLORS.textGray,
  },
  progressContainer: {
    flex: 1,
  },
  trialBadge: {
    backgroundColor: COLORS.grape,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.full,
  },
  trialText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  rightElement: {
    minWidth: LAYOUT.touchTarget.recommended,
    alignItems: 'flex-end',
  },
  scoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: COLORS.white,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.screenPaddingHorizontal,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundCream,
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xs,
  },
  scoreValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  livesValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
  },
  pauseButton: {
    width: LAYOUT.touchTarget.recommended,
    height: LAYOUT.touchTarget.recommended,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseButtonText: {
    fontSize: 24,
  },
  ruleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.grape,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.sm,
  },
  ruleHighlighted: {
    backgroundColor: COLORS.orange,
  },
  ruleEmoji: {
    fontSize: 24,
  },
  ruleText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  targetIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  targetLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  targetBadge: {
    width: LAYOUT.touchTarget.recommended,
    height: LAYOUT.touchTarget.recommended,
    borderRadius: LAYOUT.touchTarget.recommended / 2,
    backgroundColor: COLORS.backgroundCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetEmoji: {
    fontSize: 24,
  },
});
