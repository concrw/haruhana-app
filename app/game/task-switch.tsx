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

const { width } = Dimensions.get('window');
const FRUIT_LIST = Object.values(FRUITS);

type RuleType = 'color' | 'size';

interface Trial {
  trialNumber: number;
  rule: RuleType;
  fruit: typeof FRUIT_LIST[0];
  correctAnswer: 'left' | 'right';
  response: 'left' | 'right' | null;
  correct: boolean;
  reactionTime: number | null;
  isSwitchTrial: boolean;
}

export default function TaskSwitchGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDifficulty, startSession, endSession, addFruit } = useGameStore();

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'result'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [currentFruit, setCurrentFruit] = useState(FRUIT_LIST[0]);
  const [currentRule, setCurrentRule] = useState<RuleType>('color');
  const [showFruit, setShowFruit] = useState(false);
  const [results, setResults] = useState<Trial[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);

  const trialStartTime = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);
  const previousRule = useRef<RuleType>('color');

  const config = GAME_CONFIG.taskSwitch;
  const levelConfig = config.levels[currentDifficulty as 1 | 2 | 3 | 4 | 5] || config.levels[1];
  const totalTrials = config.trialsPerLevel;
  const switchProbability = levelConfig.switchProbability;

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const ruleAnim = useRef(new Animated.Value(1)).current;

  // 과일 색상 분류 (따뜻한 색 vs 차가운 색)
  const isWarmColor = (fruitId: string) => {
    return ['apple', 'orange', 'lemon'].includes(fruitId);
  };

  // 과일 크기 분류 (큰 것 vs 작은 것)
  const isBigFruit = (fruitId: string) => {
    return ['apple', 'orange', 'watermelon'].includes(fruitId);
  };

  // 게임 시작
  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);
    const newSessionId = startSession('task-switch', currentDifficulty);
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
      setCurrentRule('color');
      previousRule.current = 'color';
    }
  }, [gameState, countdown]);

  // 시행 시작
  useEffect(() => {
    if (gameState === 'playing' && currentTrial < totalTrials) {
      showNextTrial();
    } else if (gameState === 'playing' && currentTrial >= totalTrials) {
      finishGame();
    }
  }, [gameState, currentTrial, totalTrials]);

  const showNextTrial = () => {
    hasResponded.current = false;
    setFeedback(null);

    // 규칙 전환 결정
    const shouldSwitch = currentTrial > 0 && Math.random() < switchProbability;
    if (shouldSwitch) {
      const newRule = currentRule === 'color' ? 'size' : 'color';
      setCurrentRule(newRule);

      // 규칙 변경 애니메이션
      Animated.sequence([
        Animated.timing(ruleAnim, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(ruleAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // 랜덤 과일 선택
    const fruit = FRUIT_LIST[Math.floor(Math.random() * FRUIT_LIST.length)];
    setCurrentFruit(fruit);

    // 정답 결정
    const correctAnswer = currentRule === 'color'
      ? (isWarmColor(fruit.id) ? 'left' : 'right')
      : (isBigFruit(fruit.id) ? 'left' : 'right');

    // 애니메이션
    scaleAnim.setValue(0);
    setShowFruit(true);
    trialStartTime.current = Date.now();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    previousRule.current = currentRule;
  };

  // 응답 처리
  const handleResponse = useCallback((response: 'left' | 'right') => {
    if (hasResponded.current) return;
    hasResponded.current = true;

    const reactionTime = Date.now() - trialStartTime.current;

    const correctAnswer = currentRule === 'color'
      ? (isWarmColor(currentFruit.id) ? 'left' : 'right')
      : (isBigFruit(currentFruit.id) ? 'left' : 'right');

    const correct = response === correctAnswer;
    const isSwitchTrial = currentTrial > 0 && currentRule !== previousRule.current;

    const trial: Trial = {
      trialNumber: currentTrial + 1,
      rule: currentRule,
      fruit: currentFruit,
      correctAnswer,
      response,
      correct,
      reactionTime,
      isSwitchTrial,
    };

    setResults((prev) => [...prev, trial]);
    setFeedback(correct ? 'correct' : 'incorrect');

    // 다음 시행
    setTimeout(() => {
      setShowFruit(false);
      setTimeout(() => {
        setCurrentTrial((prev) => prev + 1);
      }, 300);
    }, 500);
  }, [currentRule, currentFruit, currentTrial]);

  // 게임 종료
  const finishGame = () => {
    setGameState('result');

    if (sessionId) {
      const correctCount = results.filter((r) => r.correct).length;
      const fruitsEarned = Math.floor(correctCount / 4);

      endSession(sessionId, {
        correct: correctCount,
        incorrect: results.length - correctCount,
        averageReactionTime:
          results.reduce((sum, r) => sum + (r.reactionTime || 0), 0) / results.length || 0,
        fruitsEarned,
      });

      if (fruitsEarned > 0) {
        addFruit('orange', fruitsEarned);
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
          <Text style={styles.introEmoji}>🧺</Text>
          <Text style={styles.introTitle}>분류하기</Text>
          <Text style={styles.introDescription}>
            규칙에 따라 과일을{'\n'}
            올바른 바구니에 넣어요!
          </Text>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>규칙</Text>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>🎨 색상</Text>
              <Text style={styles.ruleText}>
                따뜻한 색 → 왼쪽 | 차가운 색 → 오른쪽
              </Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleLabel}>📏 크기</Text>
              <Text style={styles.ruleText}>
                큰 과일 → 왼쪽 | 작은 과일 → 오른쪽
              </Text>
            </View>
            <Text style={styles.ruleNote}>
              ⚠️ 규칙이 갑자기 바뀔 수 있어요!
            </Text>
          </View>

          <Text style={styles.difficultyText}>
            난이도: {currentDifficulty}단계
          </Text>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
          <FruitButton variant="orange" label="시작하기" size="large" onPress={startGame} />
        </View>
      </View>
    );
  }

  // 카운트다운
  if (gameState === 'countdown') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.countdownNumber}>{countdown}</Text>
        <Text style={styles.countdownText}>준비하세요!</Text>
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
          <View style={styles.trialBadge}>
            <Text style={styles.trialBadgeText}>{currentTrial + 1}/{totalTrials}</Text>
          </View>
        </View>

        {/* 현재 규칙 표시 */}
        <Animated.View
          style={[styles.ruleIndicator, { transform: [{ scale: ruleAnim }] }]}
        >
          <Text style={styles.ruleIndicatorEmoji}>
            {currentRule === 'color' ? '🎨' : '📏'}
          </Text>
          <Text style={styles.ruleIndicatorText}>
            {currentRule === 'color' ? '색상으로 분류' : '크기로 분류'}
          </Text>
        </Animated.View>

        <View style={styles.gameContent}>
          {showFruit && (
            <Animated.View
              style={[styles.fruitContainer, { transform: [{ scale: scaleAnim }] }]}
            >
              <Text style={styles.gameFruitEmoji}>{currentFruit.emoji}</Text>
              {feedback && (
                <View style={[
                  styles.feedbackBadge,
                  feedback === 'correct' ? styles.correctFeedback : styles.incorrectFeedback,
                ]}>
                  <Text style={styles.feedbackText}>
                    {feedback === 'correct' ? '✓' : '✗'}
                  </Text>
                </View>
              )}
            </Animated.View>
          )}
        </View>

        {/* 바구니 버튼 */}
        <View style={[styles.basketRow, { paddingBottom: insets.bottom + 20 }]}>
          <TouchableOpacity
            style={[styles.basketButton, styles.leftBasket]}
            onPress={() => handleResponse('left')}
            disabled={hasResponded.current}
          >
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={styles.basketLabel}>
              {currentRule === 'color' ? '따뜻한 색' : '큰 과일'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.basketButton, styles.rightBasket]}
            onPress={() => handleResponse('right')}
            disabled={hasResponded.current}
          >
            <Text style={styles.basketEmoji}>🧺</Text>
            <Text style={styles.basketLabel}>
              {currentRule === 'color' ? '차가운 색' : '작은 과일'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // 결과
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = Math.round((correctCount / results.length) * 100);
  const avgReactionTime = Math.round(
    results.reduce((sum, r) => sum + (r.reactionTime || 0), 0) / results.length
  );
  const switchTrials = results.filter((r) => r.isSwitchTrial);
  const switchAccuracy = switchTrials.length > 0
    ? Math.round((switchTrials.filter((r) => r.correct).length / switchTrials.length) * 100)
    : 0;
  const fruitsEarned = Math.floor(correctCount / 4);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.resultContent}>
        <Text style={styles.resultEmoji}>
          {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
        </Text>
        <Text style={styles.resultTitle}>
          {accuracy >= 80 ? '완벽해요!' : accuracy >= 60 ? '잘했어요!' : '다음엔 더 잘할 수 있어요!'}
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
            <Text style={styles.statBoxValue}>{switchAccuracy}%</Text>
            <Text style={styles.statBoxLabel}>규칙 전환 정확도</Text>
          </View>
          <View style={[styles.statBox, styles.fruitBox]}>
            <Text style={styles.fruitBoxEmoji}>🍊</Text>
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
    marginBottom: LAYOUT.spacing.md,
  },
  ruleLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.orange,
    marginBottom: LAYOUT.spacing.xs,
  },
  ruleText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  ruleNote: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.apple,
    marginTop: LAYOUT.spacing.md,
    fontWeight: '500',
  },
  difficultyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.md,
  },
  countdownNumber: {
    fontSize: 120,
    fontWeight: '700',
    color: COLORS.orange,
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
  trialBadge: {
    backgroundColor: COLORS.orange,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.full,
  },
  trialBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  ruleIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.orange,
    marginHorizontal: LAYOUT.screenPaddingHorizontal,
    paddingVertical: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.sm,
  },
  ruleIndicatorEmoji: {
    fontSize: 24,
  },
  ruleIndicatorText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
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
  feedbackBadge: {
    position: 'absolute',
    top: -10,
    right: -10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  correctFeedback: {
    backgroundColor: COLORS.greenApple,
  },
  incorrectFeedback: {
    backgroundColor: COLORS.apple,
  },
  feedbackText: {
    fontSize: 24,
    color: COLORS.white,
    fontWeight: '700',
  },
  basketRow: {
    flexDirection: 'row',
    gap: LAYOUT.spacing.md,
    padding: LAYOUT.screenPaddingHorizontal,
  },
  basketButton: {
    flex: 1,
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
    minHeight: LAYOUT.buttonHeight.large,
  },
  leftBasket: {
    backgroundColor: COLORS.apple,
  },
  rightBasket: {
    backgroundColor: COLORS.grape,
  },
  basketEmoji: {
    fontSize: 40,
    marginBottom: LAYOUT.spacing.sm,
  },
  basketLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
    textAlign: 'center',
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
    textAlign: 'center',
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
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
    textAlign: 'center',
  },
  fruitBox: {
    backgroundColor: COLORS.orangeLight,
  },
  fruitBoxEmoji: {
    fontSize: 32,
  },
  fruitBoxValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.orange,
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
