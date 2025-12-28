import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { FRUITS } from '../../constants/fruits';
import { GAME_CONFIG } from '../../constants/game';
import { FruitButton } from '../../components/common/FruitButton';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useGameStore } from '../../stores/gameStore';
import { NBackTrial } from '../../types/game';

const { width } = Dimensions.get('window');
const FRUIT_LIST = Object.values(FRUITS);

export default function NBackGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDifficulty, startSession, endSession, addTrial, addFruit } = useGameStore();

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'result'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentFruit, setCurrentFruit] = useState(FRUIT_LIST[0]);
  const [showFruit, setShowFruit] = useState(false);
  const [canRespond, setCanRespond] = useState(false);
  const [results, setResults] = useState<NBackTrial[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sequence, setSequence] = useState<typeof FRUIT_LIST[0][]>([]);

  const trialStartTime = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);

  const config = GAME_CONFIG.nBack;
  const levelConfig = config.levels[currentDifficulty as 1 | 2 | 3 | 4 | 5] || config.levels[1];
  const nValue = levelConfig.nLevel;
  const totalTrials = config.trialsPerLevel;
  const stimulusDuration = levelConfig.stimulusDuration;
  const matchRatio = levelConfig.matchRatio;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  // 시퀀스 생성
  const generateSequence = useCallback(() => {
    const seq: typeof FRUIT_LIST[0][] = [];

    for (let i = 0; i < totalTrials; i++) {
      if (i >= nValue && Math.random() < matchRatio) {
        // N번 전과 같은 과일 (매치)
        seq.push(seq[i - nValue]);
      } else {
        // 랜덤 과일 (매치 방지)
        let randomFruit;
        do {
          randomFruit = FRUIT_LIST[Math.floor(Math.random() * FRUIT_LIST.length)];
        } while (i >= nValue && randomFruit.id === seq[i - nValue].id);
        seq.push(randomFruit);
      }
    }

    return seq;
  }, [nValue, totalTrials, matchRatio]);

  // 게임 시작
  const startGame = () => {
    const newSequence = generateSequence();
    setSequence(newSequence);
    setGameState('countdown');
    setCountdown(3);

    const newSessionId = startSession('nback', currentDifficulty);
    setSessionId(newSessionId);
  };

  // 카운트다운
  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setCurrentTrial(0);
      setResults([]);
    }
  }, [gameState, countdown]);

  // 시행 표시
  useEffect(() => {
    if (gameState === 'playing' && currentTrial < totalTrials) {
      showNextTrial();
    } else if (gameState === 'playing' && currentTrial >= totalTrials) {
      finishGame();
    }
  }, [gameState, currentTrial, totalTrials]);

  const showNextTrial = () => {
    hasResponded.current = false;
    setCanRespond(currentTrial >= nValue);

    const fruit = sequence[currentTrial];
    setCurrentFruit(fruit);

    scaleAnim.setValue(0);
    setShowFruit(true);
    trialStartTime.current = Date.now();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // 자동 진행
    setTimeout(() => {
      if (!hasResponded.current && currentTrial >= nValue) {
        handleResponse(false);
      } else {
        setShowFruit(false);
        setTimeout(() => {
          setCurrentTrial((prev) => prev + 1);
        }, 500);
      }
    }, stimulusDuration);
  };

  // 응답 처리
  const handleResponse = useCallback((userSaidMatch: boolean) => {
    if (hasResponded.current || currentTrial < nValue) return;
    hasResponded.current = true;

    const reactionTime = Date.now() - trialStartTime.current;
    const isActualMatch = sequence[currentTrial].id === sequence[currentTrial - nValue].id;
    const correct = userSaidMatch === isActualMatch;

    const trial: NBackTrial = {
      id: `trial-${Date.now()}`,
      trialNumber: currentTrial + 1,
      fruitType: sequence[currentTrial].id as any,
      isTarget: isActualMatch,
      startTime: trialStartTime.current,
      responseTime: reactionTime,
      reactionTime,
      response: userSaidMatch ? 'match' : 'no-match',
      isCorrect: correct,
      correct,
    };

    setResults((prev) => [...prev, trial]);

    if (sessionId) {
      addTrial(sessionId, trial);
    }

    setShowFruit(false);
    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
    }, 500);
  }, [currentTrial, nValue, sequence, sessionId]);

  // 게임 종료
  const finishGame = () => {
    setGameState('result');

    if (sessionId) {
      const correctCount = results.filter((r) => r.correct).length;
      const totalResponded = results.length;
      const fruitsEarned = Math.floor(correctCount / 3);

      endSession(sessionId, {
        correct: correctCount,
        incorrect: totalResponded - correctCount,
        averageReactionTime:
          results.reduce((sum, r) => sum + (r.reactionTime || 0), 0) / totalResponded || 0,
        fruitsEarned,
      });

      if (fruitsEarned > 0) {
        const randomFruit = FRUIT_LIST[Math.floor(Math.random() * FRUIT_LIST.length)];
        addFruit(randomFruit.id, fruitsEarned);
      }
    }
  };

  // 나가기
  const handleExit = () => {
    Alert.alert('게임 종료', '지금 나가면 진행 상황이 저장되지 않아요.', [
      { text: '계속하기', style: 'cancel' },
      { text: '나가기', style: 'destructive', onPress: () => router.back() },
    ]);
  };

  // 인트로
  if (gameState === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.introContent}>
          <Text style={styles.introEmoji}>🧠</Text>
          <Text style={styles.introTitle}>기억력 게임</Text>
          <Text style={styles.introDescription}>
            {nValue}번 전에 본 과일과 같으면{'\n'}
            "같아요" 버튼을 누르세요!
          </Text>

          <View style={styles.exampleCard}>
            <Text style={styles.exampleTitle}>예시 ({nValue}-Back)</Text>
            <View style={styles.exampleSequence}>
              <View style={styles.exampleItem}>
                <Text style={styles.exampleEmoji}>🍎</Text>
                <Text style={styles.exampleNumber}>1</Text>
              </View>
              {nValue >= 2 && (
                <View style={styles.exampleItem}>
                  <Text style={styles.exampleEmoji}>🍊</Text>
                  <Text style={styles.exampleNumber}>2</Text>
                </View>
              )}
              <View style={styles.exampleItem}>
                <Text style={styles.exampleEmoji}>🍎</Text>
                <Text style={styles.exampleNumber}>{nValue + 1}</Text>
                <Text style={styles.matchLabel}>같아요!</Text>
              </View>
            </View>
          </View>

          <Text style={styles.difficultyText}>
            난이도: {currentDifficulty}단계 ({nValue}-Back)
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <FruitButton variant="grape" label="시작하기" size="large" onPress={startGame} />
        </View>
      </View>
    );
  }

  // 카운트다운
  if (gameState === 'countdown') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.nbackLabel}>{nValue}-Back</Text>
        <Text style={styles.countdownNumber}>{countdown}</Text>
        <Text style={styles.countdownText}>
          {nValue}번 전 과일을 기억하세요!
        </Text>
      </View>
    );
  }

  // 게임 진행
  if (gameState === 'playing') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.gameHeader}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.exitButtonText}>✕</Text>
          </TouchableOpacity>
          <ProgressBar progress={(currentTrial / totalTrials) * 100} />
          <View style={styles.nBadge}>
            <Text style={styles.nBadgeText}>{nValue}-Back</Text>
          </View>
        </View>

        <View style={styles.gameContent}>
          {showFruit && (
            <Animated.View
              style={[styles.fruitContainer, { transform: [{ scale: scaleAnim }] }]}
            >
              <Text style={styles.gameFruitEmoji}>{currentFruit.emoji}</Text>
            </Animated.View>
          )}

          {currentTrial < nValue && (
            <Text style={styles.watchText}>잘 보세요!</Text>
          )}
        </View>

        <View style={[styles.gameFooter, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.trialCounter}>
            {currentTrial + 1} / {totalTrials}
          </Text>

          {canRespond && showFruit && (
            <View style={styles.responseButtons}>
              <TouchableOpacity
                style={[styles.responseButton, styles.matchButton]}
                onPress={() => handleResponse(true)}
              >
                <Text style={styles.responseButtonText}>같아요!</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.responseButton, styles.noMatchButton]}
                onPress={() => handleResponse(false)}
              >
                <Text style={styles.responseButtonText}>달라요</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  }

  // 결과
  const correctCount = results.filter((r) => r.correct).length;
  const totalResponded = results.length;
  const accuracy = totalResponded > 0 ? Math.round((correctCount / totalResponded) * 100) : 0;
  const avgReactionTime = totalResponded > 0
    ? Math.round(results.reduce((sum, r) => sum + (r.reactionTime || 0), 0) / totalResponded)
    : 0;
  const fruitsEarned = Math.floor(correctCount / 3);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.resultContent}>
        <Text style={styles.resultEmoji}>
          {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
        </Text>
        <Text style={styles.resultTitle}>
          {accuracy >= 80 ? '대단해요!' : accuracy >= 60 ? '잘했어요!' : '연습하면 늘어요!'}
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{accuracy}%</Text>
            <Text style={styles.statBoxLabel}>정확도</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{avgReactionTime}ms</Text>
            <Text style={styles.statBoxLabel}>평균 반응 속도</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{correctCount}/{totalResponded}</Text>
            <Text style={styles.statBoxLabel}>정답</Text>
          </View>
          <View style={[styles.statBox, styles.fruitBox]}>
            <Text style={styles.fruitBoxEmoji}>🍇</Text>
            <Text style={styles.fruitBoxValue}>+{fruitsEarned}</Text>
            <Text style={styles.statBoxLabel}>획득</Text>
          </View>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="greenApple"
          label="홈으로"
          size="large"
          onPress={() => router.replace('/(tabs)')}
        />
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setGameState('intro');
            setResults([]);
            setCurrentTrial(0);
          }}
        >
          <Text style={styles.retryButtonText}>다시 하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  centerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
  exitButton: {
    padding: LAYOUT.spacing.sm,
    alignSelf: 'flex-start',
  },
  exitButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
  },
  introContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  introEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.lg,
  },
  introTitle: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
  },
  introDescription: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.5,
    marginBottom: LAYOUT.spacing.xl,
  },
  exampleCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    width: '100%',
    marginBottom: LAYOUT.spacing.xl,
  },
  exampleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.lg,
  },
  exampleSequence: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: LAYOUT.spacing.lg,
  },
  exampleItem: {
    alignItems: 'center',
  },
  exampleEmoji: {
    fontSize: 40,
  },
  exampleNumber: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  matchLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.grape,
    marginTop: LAYOUT.spacing.xs,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  nbackLabel: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.grape,
    marginBottom: LAYOUT.spacing.lg,
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '700',
    color: COLORS.grape,
  },
  countdownText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.md,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  nBadge: {
    backgroundColor: COLORS.grape,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.full,
  },
  nBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruitContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameFruitEmoji: {
    fontSize: 120,
  },
  watchText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.grape,
    marginTop: LAYOUT.spacing.lg,
  },
  gameFooter: {
    alignItems: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  trialCounter: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.lg,
  },
  responseButtons: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.lg,
  },
  responseButton: {
    paddingHorizontal: LAYOUT.spacing.xxl,
    paddingVertical: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
    minWidth: 140,
    alignItems: 'center',
  },
  matchButton: {
    backgroundColor: COLORS.grape,
  },
  noMatchButton: {
    backgroundColor: COLORS.textGray,
  },
  responseButtonText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.white,
  },
  resultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  resultEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.lg,
  },
  resultTitle: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.xxl,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
    width: '100%',
  },
  statBox: {
    width: (width - LAYOUT.screenPaddingHorizontal * 2 - LAYOUT.spacing.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    alignItems: 'center',
  },
  statBoxValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  statBoxLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  fruitBox: {
    backgroundColor: COLORS.grapeLight,
  },
  fruitBoxEmoji: {
    fontSize: 32,
  },
  fruitBoxValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.grape,
  },
  retryButton: {
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
