import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Audio } from 'expo-av';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';

interface VoicePlayerProps {
  uri?: string;
  text?: string; // TTS용 텍스트
  autoPlay?: boolean;
  showControls?: boolean;
  variant?: 'inline' | 'card';
  onPlayStart?: () => void;
  onPlayEnd?: () => void;
}

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  uri,
  text,
  autoPlay = false,
  showControls = true,
  variant = 'inline',
  onPlayStart,
  onPlayEnd,
}) => {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  useEffect(() => {
    if (autoPlay && uri) {
      playSound();
    }
  }, [autoPlay, uri]);

  const playSound = async () => {
    try {
      if (sound) {
        if (isPlaying) {
          await sound.pauseAsync();
          setIsPlaying(false);
        } else {
          await sound.playAsync();
          setIsPlaying(true);
          onPlayStart?.();
        }
        return;
      }

      if (!uri) return;

      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        onPlaybackStatusUpdate
      );

      setSound(newSound);
      setIsPlaying(true);
      onPlayStart?.();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setDuration(status.durationMillis || 0);
      setPosition(status.positionMillis || 0);

      if (status.didJustFinish) {
        setIsPlaying(false);
        onPlayEnd?.();
      }
    }
  };

  const formatTime = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? position / duration : 0;

  // 음성 파형 애니메이션
  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(0);
    }
  }, [isPlaying]);

  if (variant === 'card') {
    return (
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.playButtonLarge}
          onPress={playSound}
          disabled={!uri}
        >
          <Text style={styles.playIcon}>{isPlaying ? '⏸️' : '▶️'}</Text>
        </TouchableOpacity>

        <View style={styles.cardInfo}>
          {text && <Text style={styles.cardText} numberOfLines={2}>{text}</Text>}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
            </View>
            <Text style={styles.timeText}>
              {formatTime(position)} / {formatTime(duration)}
            </Text>
          </View>
        </View>

        {/* 음성 파형 시각화 */}
        <View style={styles.waveform}>
          {[...Array(5)].map((_, i) => (
            <Animated.View
              key={i}
              style={[
                styles.waveBar,
                {
                  transform: [
                    {
                      scaleY: isPlaying
                        ? animatedValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.3 + Math.random() * 0.3, 0.8 + Math.random() * 0.2],
                          })
                        : 0.3,
                    },
                  ],
                },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.inlineContainer}>
      {showControls && (
        <TouchableOpacity
          style={styles.playButton}
          onPress={playSound}
          disabled={!uri}
        >
          <Text style={styles.playIconSmall}>{isPlaying ? '⏸️' : '🔊'}</Text>
        </TouchableOpacity>
      )}

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      {text && <Text style={styles.inlineText} numberOfLines={1}>{text}</Text>}
    </View>
  );
};

// 음성 녹음 버튼
interface VoiceRecorderProps {
  onRecordComplete: (uri: string) => void;
  maxDuration?: number; // seconds
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordComplete,
  maxDuration = 60,
}) => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return maxDuration;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('Failed to start recording:', error);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();

      setRecording(null);
      setIsRecording(false);

      if (uri) {
        onRecordComplete(uri);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.recorderContainer}>
      <TouchableOpacity
        style={[
          styles.recordButton,
          isRecording && styles.recordingActive,
        ]}
        onPress={isRecording ? stopRecording : startRecording}
      >
        <Text style={styles.recordIcon}>{isRecording ? '⏹️' : '🎙️'}</Text>
      </TouchableOpacity>

      <Text style={styles.recordingTime}>
        {isRecording ? `녹음 중 ${formatTime(recordingTime)}` : '녹음하기'}
      </Text>

      {isRecording && (
        <View style={styles.recordingIndicator}>
          <View style={styles.recordingDot} />
          <Text style={styles.recordingLabel}>REC</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  // Inline variant
  inlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  playButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIconSmall: {
    fontSize: 24,
  },
  inlineText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
  },

  // Card variant
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playButtonLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.greenApple,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
  },
  cardText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.sm,
  },

  // Progress
  progressContainer: {
    flex: 1,
  },
  progressBar: {
    height: 6,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.greenApple,
    borderRadius: 3,
  },
  timeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },

  // Waveform
  waveform: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    height: 40,
  },
  waveBar: {
    width: 4,
    height: 40,
    backgroundColor: COLORS.greenApple,
    borderRadius: 2,
  },

  // Recorder
  recorderContainer: {
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingActive: {
    backgroundColor: COLORS.textDark,
  },
  recordIcon: {
    fontSize: 40,
  },
  recordingTime: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.xs,
  },
  recordingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.error,
  },
  recordingLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.error,
    fontWeight: '700',
  },
});

export default VoicePlayer;
