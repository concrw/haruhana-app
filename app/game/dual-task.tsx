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
import { FruitButton } from '../../components/common/FruitButton';
import { ProgressBar } from '../../components/common/ProgressBar';
import { useGameStore } from '../../stores/gameStore';

const { width } = Dimensions.get('window');
const FRUIT_SIZE = 100;
const FRUIT_LIST = Object.values(FRUITS);

interface DualTaskTrial {
  id: string;
  fruitType: string;
  isTarget: boolean;
  isCountFruit: boolean;
  startTime: number;
  responseTime?: number;
  response: 'tap' | 'none';
  correct: boolean;
}

const DUAL_TASK_CONFIG = {
  totalTrials: 20,
  stimulusDuration: 2500,
  isi: 1000,
  targetRatio: 0.4,
  countFruitRatio: 0.3,
  levels: {
    1: { stimulusDuration: 3000, isi: 1500, targetRatio: 0.4 },
    2: { stimulusDuration: 2500, isi: 1200, targetRatio: 0.4 },
    3: { stimulusDuration: 2000, isi: 1000, targetRatio: 0.35 },
    4: { stimulusDuration: 1800, isi: 800, targetRatio: 0.35 },
    5: { stimulusDuration: 1500, isi: 600, targetRatio: 0.3 },
  } as const,
};

export default function DualTaskGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDifficulty, startSession, endSession, addFruit } = useGameStore();

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'counting' | 'result'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentTrial, setCurrentTrial] = useState(0);

  const [targetFruit, setTargetFruit] = useState(FRUIT_LIST[0]);
  const [countFruit, setCountFruit] = useState(FRUIT_LIST[1]);
  const [currentFruit, setCurrentFruit] = useState(FRUIT_LIST[0]);
  const [isTarget, setIsTarget] = useState(false);
  const [showFruit, setShowFruit] = useState(false);

  const [results, setResults] = useState<DualTaskTrial[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const [actualCountFruitCount, setActualCountFruitCount] = useState(0);
  const [userCountAnswer, setUserCountAnswer] = useState<number | null>(null);
  const [countOptions, setCountOptions] = useState<number[]>([]);

  const trialStartTime = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);
  const responseTimeout = useRef<NodeJS.Timeout | null>(null);

  const levelConfig = DUAL_TASK_CONFIG.levels[currentDifficulty as 1 | 2 | 3 | 4 | 5] || DUAL_TASK_CONFIG.levels[1];
  const totalTrials = DUAL_TASK_CONFIG.totalTrials;
  const stimulusDuration = levelConfig.stimulusDuration;
  const isi = levelConfig.isi;
  const targetRatio = levelConfig.targetRatio;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);

    const shuffledFruits = [...FRUIT_LIST].sort(() => Math.random() - 0.5);
    setTargetFruit(shuffledFruits[0]);
    setCountFruit(shuffledFruits[1]);
    setActualCountFruitCount(0);

    const newSessionId = startSession('dual_task', currentDifficulty);
    setSessionId(newSessionId);
  };

  useEffect(() => {
    if (gameState === 'countdown' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'countdown' && countdown === 0) {
      setGameState('playing');
      setCurrentTrial(0);
      setResults([]);
      showNextTrial();
    }
  }, [gameState, countdown]);

  const showNextTrial = useCallback(() => {
    if (currentTrial >= totalTrials) {
      goToCountingPhase();
      return;
    }

    hasResponded.current = false;

    const isTargetTrial = Math.random() < targetRatio;
    const isCountFruitTrial = !isTargetTrial && Math.random() < DUAL_TASK_CONFIG.countFruitRatio;

    let fruit;
    if (isTargetTrial) {
      fruit = targetFruit;
    } else if (isCountFruitTrial) {
      fruit = countFruit;
      setActualCountFruitCount(prev => prev + 1);
    } else {
      const otherFruits = FRUIT_LIST.filter(
        (f) => f.id !== targetFruit.id && f.id !== countFruit.id
      );
      fruit = otherFruits[Math.floor(Math.random() * otherFruits.length)];
    }

    setCurrentFruit(fruit);
    setIsTarget(isTargetTrial);

    scaleAnim.setValue(0);
    setShowFruit(true);
    trialStartTime.current = Date.now();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    responseTimeout.current = setTimeout(() => {
      if (!hasResponded.current) {
        handleResponse(false);
      }
    }, stimulusDuration);
  }, [currentTrial, totalTrials, targetFruit, countFruit, targetRatio, stimulusDuration]);

  const handleResponse = useCallback((tapped: boolean) => {
    if (hasResponded.current) return;
    hasResponded.current = true;

    if (responseTimeout.current) {
      clearTimeout(responseTimeout.current);
    }

    const reactionTime = Date.now() - trialStartTime.current;
    const correct = (isTarget && tapped) || (!isTarget && !tapped);

    const trial: DualTaskTrial = {
      id: `trial-${Date.now()}`,
      fruitType: currentFruit.id,
      isTarget,
      isCountFruit: currentFruit.id === countFruit.id,
      startTime: trialStartTime.current,
      responseTime: tapped ? reactionTime : undefined,
      response: tapped ? 'tap' : 'none',
      correct,
    };

    setResults((prev) => [...prev, trial]);
    setShowFruit(false);

    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
    }, 300);
  }, [isTarget, currentFruit, countFruit]);

  useEffect(() => {
    if (gameState === 'playing' && currentTrial > 0 && currentTrial < totalTrials) {
      const timer = setTimeout(showNextTrial, isi);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && currentTrial >= totalTrials) {
      goToCountingPhase();
    }
  }, [currentTrial, gameState, totalTrials, isi]);

  const goToCountingPhase = () => {
    const options = generateCountOptions(actualCountFruitCount);
    setCountOptions(options);
    setGameState('counting');
  };

  const generateCountOptions = (correct: number): number[] => {
    const options = new Set<number>();
    options.add(correct);

    while (options.size < 4) {
      const offset = Math.floor(Math.random() * 5) - 2;
      const option = Math.max(0, correct + offset);
      if (option !== correct) {
        options.add(option);
      }
    }

    return Array.from(options).sort((a, b) => a - b);
  };

  const handleCountAnswer = (answer: number) => {
    setUserCountAnswer(answer);
    finishGame(answer);
  };

  const finishGame = (countAnswer: number) => {
    setGameState('result');

    if (sessionId) {
      const correctTaps = results.filter((r) => r.correct).length;
      const countCorrect = countAnswer === actualCountFruitCount;
      const totalScore = correctTaps + (countCorrect ? 5 : 0);
      const fruitsEarned = Math.floor(totalScore / 5);

      endSession(sessionId, {
        correct: correctTaps,
        incorrect: totalTrials - correctTaps,
        averageReactionTime:
          results.filter((r) => r.responseTime).reduce((sum, r) => sum + (r.responseTime || 0), 0) /
          results.filter((r) => r.responseTime).length || 0,
        fruitsEarned,
      });

      if (fruitsEarned > 0) {
        addFruit(targetFruit.id, fruitsEarned);
      }
    }
  };

  const handleScreenTap = () => {
    if (gameState === 'playing' && showFruit) {
      handleResponse(true);
    }
  };

  const handleExit = () => {
    Alert.alert(
      '게임 종료',
      '지금 나가면 진행 상황이 저장되지 않아요.',
      [
        { text: '계속하기', style: 'cancel' },
        { text: '나가기', style: 'destructive', onPress: () => router.back() },
      ]
    );
  };

  if (gameState === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.introContent}>
          <Text style={styles.introEmoji}>🎯</Text>
          <Text style={styles.introTitle}>동시에 두 가지!</Text>
          <Text style={styles.introDescription}>
            목표 과일을 터치하면서{'\n'}
            세는 과일이 몇 번 나왔는지 기억하세요!
          </Text>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>규칙</Text>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>👆</Text>
              <Text style={styles.ruleText}>목표 과일이 나오면 터치!</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>🔢</Text>
              <Text style={styles.ruleText}>세는 과일이 몇 번 나왔는지 기억!</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>⏳</Text>
              <Text style={styles.ruleText}>마지막에 개수를 맞춰요!</Text>
            </View>
          </View>

          <Text style={styles.difficultyText}>
            난이도: {currentDifficulty}단계 ({totalTrials}회)
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <FruitButton
            variant="apple"
            label="시작하기"
            size="large"
            onPress={startGame}
          />
        </View>
      </View>
    );
  }

  if (gameState === 'countdown') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.targetIntro}>
          <View style={styles.dualFruitDisplay}>
            <View style={styles.fruitIntroBox}>
              <Text style={styles.fruitIntroLabel}>터치할 과일</Text>
              <Text style={styles.targetEmoji}>{targetFruit.emoji}</Text>
              <Text style={styles.targetName}>{targetFruit.name}</Text>
            </View>
            <View style={styles.fruitIntroBox}>
              <Text style={styles.fruitIntroLabel}>셀 과일</Text>
              <Text style={styles.targetEmoji}>{countFruit.emoji}</Text>
              <Text style={styles.targetName}>{countFruit.name}</Text>
            </View>
          </View>
        </View>
        <Text style={styles.countdownNumber}>{countdown}</Text>
        <Text style={styles.countdownText}>준비하세요!</Text>
      </View>
    );
  }

  if (gameState === 'playing') {
    return (
      <TouchableOpacity
        style={[styles.container, styles.gameArea]}
        activeOpacity={1}
        onPress={handleScreenTap}
      >
        <View style={[styles.gameHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.exitButton} onPress={handleExit}>
            <Text style={styles.exitButtonText}>✕</Text>
          </TouchableOpacity>
          <ProgressBar progress={(currentTrial / totalTrials) * 100} />
          <View style={styles.dualBadges}>
            <View style={styles.targetBadge}>
              <Text style={styles.badgeLabel}>터치</Text>
              <Text style={styles.targetBadgeEmoji}>{targetFruit.emoji}</Text>
            </View>
            <View style={[styles.targetBadge, styles.countBadge]}>
              <Text style={styles.badgeLabel}>세기</Text>
              <Text style={styles.targetBadgeEmoji}>{countFruit.emoji}</Text>
            </View>
          </View>
        </View>

        <View style={styles.gameContent}>
          {showFruit && (
            <Animated.View
              style={[
                styles.fruitContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <Text style={styles.gameFruitEmoji}>{currentFruit.emoji}</Text>
            </Animated.View>
          )}
        </View>

        <View style={[styles.gameFooter, { paddingBottom: insets.bottom + 20 }]}>
          <Text style={styles.trialCounter}>
            {currentTrial + 1} / {totalTrials}
          </Text>
          <Text style={styles.tapHint}>
            {showFruit && isTarget ? '터치!' : showFruit ? '기억하세요' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  if (gameState === 'counting') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.countingContent}>
          <Text style={styles.countingEmoji}>{countFruit.emoji}</Text>
          <Text style={styles.countingTitle}>
            {countFruit.name}이(가){'\n'}몇 번 나왔나요?
          </Text>

          <View style={styles.optionsGrid}>
            {countOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.optionButton}
                onPress={() => handleCountAnswer(option)}
                activeOpacity={0.8}
              >
                <Text style={styles.optionText}>{option}번</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  }

  const correctTaps = results.filter((r) => r.correct).length;
  const tapAccuracy = Math.round((correctTaps / totalTrials) * 100);
  const countCorrect = userCountAnswer === actualCountFruitCount;
  const avgReactionTime = Math.round(
    results.filter((r) => r.responseTime).reduce((sum, r) => sum + (r.responseTime || 0), 0) /
    results.filter((r) => r.responseTime).length || 0
  );
  const totalScore = correctTaps + (countCorrect ? 5 : 0);
  const fruitsEarned = Math.floor(totalScore / 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.resultContent}>
        <Text style={styles.resultEmoji}>
          {tapAccuracy >= 80 && countCorrect ? '🎉' : tapAccuracy >= 60 ? '👍' : '💪'}
        </Text>
        <Text style={styles.resultTitle}>
          {tapAccuracy >= 80 && countCorrect
            ? '완벽해요!'
            : tapAccuracy >= 60
            ? '잘했어요!'
            : '다음엔 더 잘할 수 있어요!'}
        </Text>

        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{tapAccuracy}%</Text>
            <Text style={styles.statBoxLabel}>터치 정확도</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statBoxValue}>{avgReactionTime}ms</Text>
            <Text style={styles.statBoxLabel}>평균 반응 속도</Text>
          </View>
          <View style={[styles.statBox, countCorrect ? styles.correctBox : styles.wrongBox]}>
            <Text style={styles.countResultEmoji}>{countFruit.emoji}</Text>
            <Text style={styles.statBoxValue}>
              {userCountAnswer} / {actualCountFruitCount}
            </Text>
            <Text style={styles.statBoxLabel}>
              {countCorrect ? '정답!' : '아쉬워요'}
            </Text>
          </View>
          <View style={[styles.statBox, styles.fruitBox]}>
            <Text style={styles.fruitBoxEmoji}>{targetFruit.emoji}</Text>
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
            setActualCountFruitCount(0);
            setUserCountAnswer(null);
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
    minWidth: LAYOUT.touchTarget.recommended,
    minHeight: LAYOUT.touchTarget.recommended,
    justifyContent: 'center',
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
  ruleCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    width: '100%',
    marginBottom: LAYOUT.spacing.xl,
  },
  ruleTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.lg,
  },
  ruleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.md,
  },
  ruleEmoji: {
    fontSize: 24,
  },
  ruleText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  targetIntro: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xxl,
  },
  dualFruitDisplay: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.xl,
  },
  fruitIntroBox: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
    minWidth: 130,
  },
  fruitIntroLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.sm,
  },
  targetEmoji: {
    fontSize: 60,
    marginBottom: LAYOUT.spacing.sm,
  },
  targetName: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '700',
    color: COLORS.apple,
  },
  countdownText: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.md,
  },
  gameArea: {
    backgroundColor: COLORS.white,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  dualBadges: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.sm,
  },
  targetBadge: {
    alignItems: 'center',
    backgroundColor: COLORS.backgroundCream,
    paddingHorizontal: LAYOUT.spacing.sm,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.md,
  },
  countBadge: {
    backgroundColor: COLORS.grapeLight,
  },
  badgeLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
  },
  targetBadgeEmoji: {
    fontSize: 20,
  },
  gameContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fruitContainer: {
    width: FRUIT_SIZE * 1.5,
    height: FRUIT_SIZE * 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameFruitEmoji: {
    fontSize: FRUIT_SIZE,
  },
  gameFooter: {
    alignItems: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  trialCounter: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  tapHint: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.apple,
    marginTop: LAYOUT.spacing.sm,
    height: 36,
  },
  countingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  countingEmoji: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.lg,
  },
  countingTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xxl,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.md,
    justifyContent: 'center',
    width: '100%',
  },
  optionButton: {
    width: (width - LAYOUT.screenPaddingHorizontal * 2 - LAYOUT.spacing.md) / 2,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    paddingVertical: LAYOUT.spacing.xl,
    alignItems: 'center',
    minHeight: LAYOUT.touchTarget.large,
  },
  optionText: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
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
  correctBox: {
    backgroundColor: COLORS.greenAppleLight,
  },
  wrongBox: {
    backgroundColor: COLORS.appleLight,
  },
  countResultEmoji: {
    fontSize: 28,
    marginBottom: LAYOUT.spacing.xs,
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
    backgroundColor: COLORS.greenAppleLight,
  },
  fruitBoxEmoji: {
    fontSize: 32,
  },
  fruitBoxValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.greenApple,
  },
  retryButton: {
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
    minHeight: LAYOUT.touchTarget.recommended,
    justifyContent: 'center',
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
