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
import { useAuthStore } from '../../stores/authStore';
import { GoNoGoTrial } from '../../types/game';

const { width } = Dimensions.get('window');
const FRUIT_SIZE = 120;

const FRUIT_LIST = Object.values(FRUITS);

export default function GoNoGoGameScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { currentDifficulty, startSession, endSession, addTrial, addFruit } = useGameStore();

  const [gameState, setGameState] = useState<'intro' | 'countdown' | 'playing' | 'result'>('intro');
  const [countdown, setCountdown] = useState(3);
  const [currentTrial, setCurrentTrial] = useState(0);
  const [targetFruit, setTargetFruit] = useState(FRUIT_LIST[0]);
  const [currentFruit, setCurrentFruit] = useState(FRUIT_LIST[0]);
  const [isGo, setIsGo] = useState(true);
  const [showFruit, setShowFruit] = useState(false);
  const [results, setResults] = useState<GoNoGoTrial[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const trialStartTime = useRef<number>(0);
  const hasResponded = useRef<boolean>(false);
  const responseTimeout = useRef<NodeJS.Timeout | null>(null);

  const config = GAME_CONFIG.goNoGo;
  const levelConfig = config.levels[currentDifficulty as 1 | 2 | 3 | 4 | 5] || config.levels[1];
  const totalTrials = config.trialsPerLevel;
  const stimulusDuration = levelConfig.stimulusDuration;
  const goRatio = levelConfig.goRatio;

  const scaleAnim = useRef(new Animated.Value(0)).current;

  // 게임 시작
  const startGame = () => {
    setGameState('countdown');
    setCountdown(3);

    // 목표 과일 선택
    const randomFruit = FRUIT_LIST[Math.floor(Math.random() * FRUIT_LIST.length)];
    setTargetFruit(randomFruit);

    // 세션 시작
    const newSessionId = startSession('go-nogo', currentDifficulty);
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
      showNextTrial();
    }
  }, [gameState, countdown]);

  // 다음 시행 표시
  const showNextTrial = useCallback(() => {
    if (currentTrial >= totalTrials) {
      finishGame();
      return;
    }

    hasResponded.current = false;

    // Go 또는 No-Go 결정
    const isGoTrial = Math.random() < goRatio;
    setIsGo(isGoTrial);

    // 과일 선택
    let fruit;
    if (isGoTrial) {
      fruit = targetFruit;
    } else {
      const otherFruits = FRUIT_LIST.filter((f) => f.id !== targetFruit.id);
      fruit = otherFruits[Math.floor(Math.random() * otherFruits.length)];
    }
    setCurrentFruit(fruit);

    // 애니메이션 시작
    scaleAnim.setValue(0);
    setShowFruit(true);
    trialStartTime.current = Date.now();

    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();

    // 시간 초과 처리
    responseTimeout.current = setTimeout(() => {
      if (!hasResponded.current) {
        handleResponse(false);
      }
    }, stimulusDuration);
  }, [currentTrial, totalTrials, targetFruit, goRatio, stimulusDuration]);

  // 응답 처리
  const handleResponse = useCallback((tapped: boolean) => {
    if (hasResponded.current) return;
    hasResponded.current = true;

    if (responseTimeout.current) {
      clearTimeout(responseTimeout.current);
    }

    const reactionTime = Date.now() - trialStartTime.current;
    const correct = (isGo && tapped) || (!isGo && !tapped);

    const trial: GoNoGoTrial = {
      id: `trial-${Date.now()}`,
      fruitType: currentFruit.id as any,
      isGoTrial: isGo,
      position: { x: 0, y: 0 },
      startTime: trialStartTime.current,
      responseTime: tapped ? reactionTime : undefined,
      reactionTime: tapped ? reactionTime : undefined,
      response: tapped ? 'go' : 'nogo',
      isCorrect: correct,
      correct,
    };

    setResults((prev) => [...prev, trial]);

    if (sessionId) {
      addTrial(sessionId, trial);
    }

    // 피드백 표시
    setShowFruit(false);

    // 다음 시행
    setTimeout(() => {
      setCurrentTrial((prev) => prev + 1);
    }, 500);
  }, [isGo, currentTrial, sessionId]);

  // 현재 시행 변경 시 다음 시행 표시
  useEffect(() => {
    if (gameState === 'playing' && currentTrial > 0 && currentTrial < totalTrials) {
      const timer = setTimeout(showNextTrial, 1000);
      return () => clearTimeout(timer);
    } else if (gameState === 'playing' && currentTrial >= totalTrials) {
      finishGame();
    }
  }, [currentTrial, gameState, totalTrials]);

  // 게임 종료
  const finishGame = () => {
    setGameState('result');

    if (sessionId) {
      const correctCount = results.filter((r) => r.correct).length;
      const fruitsEarned = Math.floor(correctCount / 5); // 5개 맞출 때마다 과일 1개

      endSession(sessionId, {
        correct: correctCount,
        incorrect: totalTrials - correctCount,
        averageReactionTime:
          results.filter((r) => r.reactionTime).reduce((sum, r) => sum + (r.reactionTime || 0), 0) /
          results.filter((r) => r.reactionTime).length || 0,
        fruitsEarned,
      });

      // 과일 추가
      if (fruitsEarned > 0) {
        addFruit(targetFruit.id, fruitsEarned);
      }
    }
  };

  // 화면 터치 처리
  const handleScreenTap = () => {
    if (gameState === 'playing' && showFruit) {
      handleResponse(true);
    }
  };

  // 나가기 확인
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

  // 인트로 화면
  if (gameState === 'intro') {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitButtonText}>← 뒤로</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.introContent}>
          <Text style={styles.introEmoji}>🍎</Text>
          <Text style={styles.introTitle}>과일 수확하기</Text>
          <Text style={styles.introDescription}>
            목표 과일이 나타나면 빠르게 터치하고{'\n'}
            다른 과일이 나타나면 참으세요!
          </Text>

          <View style={styles.ruleCard}>
            <Text style={styles.ruleTitle}>규칙</Text>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>✅</Text>
              <Text style={styles.ruleText}>목표 과일 → 터치!</Text>
            </View>
            <View style={styles.ruleItem}>
              <Text style={styles.ruleEmoji}>❌</Text>
              <Text style={styles.ruleText}>다른 과일 → 참기!</Text>
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

  // 카운트다운 화면
  if (gameState === 'countdown') {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.targetIntro}>
          <Text style={styles.targetLabel}>목표 과일</Text>
          <Text style={styles.targetEmoji}>{targetFruit.emoji}</Text>
          <Text style={styles.targetName}>{targetFruit.name}</Text>
        </View>
        <Text style={styles.countdownNumber}>{countdown}</Text>
        <Text style={styles.countdownText}>준비하세요!</Text>
      </View>
    );
  }

  // 게임 진행 화면
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
          <View style={styles.targetBadge}>
            <Text style={styles.targetBadgeEmoji}>{targetFruit.emoji}</Text>
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
            {showFruit && isGo ? '터치!' : showFruit ? '참기!' : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 결과 화면
  const correctCount = results.filter((r) => r.correct).length;
  const accuracy = Math.round((correctCount / totalTrials) * 100);
  const avgReactionTime = Math.round(
    results.filter((r) => r.reactionTime).reduce((sum, r) => sum + (r.reactionTime || 0), 0) /
    results.filter((r) => r.reactionTime).length || 0
  );
  const fruitsEarned = Math.floor(correctCount / 5);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.resultContent}>
        <Text style={styles.resultEmoji}>
          {accuracy >= 80 ? '🎉' : accuracy >= 60 ? '👍' : '💪'}
        </Text>
        <Text style={styles.resultTitle}>
          {accuracy >= 80 ? '훌륭해요!' : accuracy >= 60 ? '잘했어요!' : '다음엔 더 잘할 수 있어요!'}
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
            <Text style={styles.statBoxValue}>{correctCount}/{totalTrials}</Text>
            <Text style={styles.statBoxLabel}>정답</Text>
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
  targetLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.md,
  },
  targetEmoji: {
    fontSize: 100,
    marginBottom: LAYOUT.spacing.md,
  },
  targetName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
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
  targetBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetBadgeEmoji: {
    fontSize: 24,
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
  },
  retryButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
