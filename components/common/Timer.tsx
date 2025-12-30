import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

export interface TimerProps {
  duration: number; // seconds
  onComplete: () => void;
  variant?: 'circular' | 'linear';
  showControls?: boolean;
  size?: 'small' | 'large';
  autoStart?: boolean;
  countDown?: boolean;
  isRunning?: boolean;  // externally controlled running state
}

export const Timer: React.FC<TimerProps> = ({
  duration,
  onComplete,
  variant = 'circular',
  showControls = true,
  size = 'large',
  autoStart = false,
  countDown = true,
  isRunning: externalIsRunning,
}) => {
  const [elapsed, setElapsed] = useState(0);
  const [internalIsRunning, setInternalIsRunning] = useState(autoStart);
  const isRunning = externalIsRunning !== undefined ? externalIsRunning : internalIsRunning;
  const setIsRunning = setInternalIsRunning;
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const remaining = countDown ? Math.max(0, duration - elapsed) : elapsed;
  const progress = countDown ? elapsed / duration : 1 - elapsed / duration;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setElapsed(0);
  }, []);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = prev + 1;
          if (next >= duration) {
            setIsRunning(false);
            onComplete();
            return duration;
          }
          return next;
        });
      }, 1000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, duration, onComplete]);

  const sizeConfig = size === 'large'
    ? { containerSize: 200, strokeWidth: 12, fontSize: 48 }
    : { containerSize: 120, strokeWidth: 8, fontSize: 28 };

  const radius = (sizeConfig.containerSize - sizeConfig.strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  if (variant === 'linear') {
    return (
      <View style={styles.linearContainer}>
        <View style={styles.linearBar}>
          <View
            style={[
              styles.linearProgress,
              { width: `${progress * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.linearTime}>{formatTime(remaining)}</Text>
        {showControls && (
          <View style={styles.controls}>
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={isRunning ? pause : start}
            >
              <Text style={styles.controlButtonText}>
                {isRunning ? '일시정지' : '시작'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.circularContainer, { width: sizeConfig.containerSize, height: sizeConfig.containerSize }]}>
      <View style={styles.svgWrapper}>
        {/* Background circle */}
        <View
          style={[
            styles.circleBackground,
            {
              width: sizeConfig.containerSize,
              height: sizeConfig.containerSize,
              borderRadius: sizeConfig.containerSize / 2,
              borderWidth: sizeConfig.strokeWidth,
            },
          ]}
        />
        {/* Progress circle - using view rotation for simplicity */}
        <View
          style={[
            styles.circleProgress,
            {
              width: sizeConfig.containerSize,
              height: sizeConfig.containerSize,
              borderRadius: sizeConfig.containerSize / 2,
              borderWidth: sizeConfig.strokeWidth,
              borderColor: COLORS.greenApple,
              borderTopColor: 'transparent',
              borderRightColor: progress > 0.25 ? COLORS.greenApple : 'transparent',
              borderBottomColor: progress > 0.5 ? COLORS.greenApple : 'transparent',
              borderLeftColor: progress > 0.75 ? COLORS.greenApple : 'transparent',
              transform: [{ rotate: '-90deg' }],
            },
          ]}
        />
      </View>

      <View style={styles.timeContainer}>
        <Text style={[styles.timeText, { fontSize: sizeConfig.fontSize }]}>
          {formatTime(remaining)}
        </Text>
        <Text style={styles.labelText}>
          {countDown ? '남음' : '경과'}
        </Text>
      </View>

      {showControls && (
        <View style={styles.circularControls}>
          <TouchableOpacity
            style={[styles.controlButton, isRunning ? styles.pauseButton : styles.startButton]}
            onPress={isRunning ? pause : start}
          >
            <Text style={styles.controlButtonText}>
              {isRunning ? '⏸️' : '▶️'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={reset}
          >
            <Text style={styles.controlButtonText}>🔄</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Linear variant
  linearContainer: {
    width: '100%',
    alignItems: 'center',
  },
  linearBar: {
    width: '100%',
    height: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  linearProgress: {
    height: '100%',
    backgroundColor: COLORS.greenApple,
    borderRadius: 6,
  },
  linearTime: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: LAYOUT.spacing.md,
  },

  // Circular variant
  circularContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgWrapper: {
    position: 'absolute',
  },
  circleBackground: {
    position: 'absolute',
    borderColor: COLORS.backgroundLight,
  },
  circleProgress: {
    position: 'absolute',
  },
  timeContainer: {
    alignItems: 'center',
  },
  timeText: {
    fontWeight: '700',
    color: COLORS.textDark,
  },
  labelText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },

  // Controls
  controls: {
    flexDirection: 'row',
    marginTop: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.md,
  },
  circularControls: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -60,
    gap: LAYOUT.spacing.md,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButton: {
    backgroundColor: COLORS.greenApple,
  },
  pauseButton: {
    backgroundColor: COLORS.orange,
  },
  resetButton: {
    backgroundColor: COLORS.backgroundLight,
  },
  controlButtonText: {
    fontSize: 20,
  },
});

export default Timer;
