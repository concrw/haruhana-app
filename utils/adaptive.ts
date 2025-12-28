// 적응형 난이도 시스템 유틸리티

import { GAME_CONFIG } from '../constants/game';

interface TrialResult {
  isCorrect: boolean;
  reactionTime: number;
  timestamp: number;
}

/**
 * 최근 N개 시행의 정확도 계산
 */
export const calculateRecentAccuracy = (
  trials: TrialResult[],
  windowSize: number = GAME_CONFIG.adaptive.windowSize
): number => {
  if (trials.length === 0) return 0;

  const recentTrials = trials.slice(-windowSize);
  const correctCount = recentTrials.filter((t) => t.isCorrect).length;

  return correctCount / recentTrials.length;
};

/**
 * 새로운 난이도 계산 (적응형)
 */
export const calculateNewDifficulty = (
  currentLevel: number,
  recentAccuracy: number,
  config = GAME_CONFIG.adaptive
): number => {
  const { thresholdUp, thresholdDown, minLevel, maxLevel } = config;

  // 정확도가 높으면 난이도 상승
  if (recentAccuracy >= thresholdUp && currentLevel < maxLevel) {
    return currentLevel + 1;
  }

  // 정확도가 낮으면 난이도 하락
  if (recentAccuracy <= thresholdDown && currentLevel > minLevel) {
    return currentLevel - 1;
  }

  // 유지
  return currentLevel;
};

/**
 * 평균 반응 시간 계산
 */
export const calculateAverageReactionTime = (
  trials: TrialResult[],
  windowSize?: number
): number => {
  if (trials.length === 0) return 0;

  const relevantTrials = windowSize ? trials.slice(-windowSize) : trials;
  const correctTrials = relevantTrials.filter((t) => t.isCorrect);

  if (correctTrials.length === 0) return 0;

  const totalTime = correctTrials.reduce((sum, t) => sum + t.reactionTime, 0);
  return totalTime / correctTrials.length;
};

/**
 * 난이도별 게임 설정 가져오기
 */
export const getGameConfigForLevel = (
  gameType: 'goNoGo' | 'nBack' | 'taskSwitch',
  level: number
) => {
  const config = GAME_CONFIG[gameType];
  const levels = config.levels as Record<number, unknown>;

  // 유효한 레벨 범위 내로 조정
  const validLevel = Math.max(1, Math.min(level, Object.keys(levels).length));

  return levels[validLevel];
};

/**
 * Go/No-Go 게임 난이도 설정 가져오기
 */
export const getGoNoGoConfig = (level: number) => {
  return getGameConfigForLevel('goNoGo', level) as {
    fallSpeed: number;
    goRatio: number;
    interval: number;
    fruitCount: number;
  };
};

/**
 * N-Back 게임 난이도 설정 가져오기
 */
export const getNBackConfig = (level: number) => {
  return getGameConfigForLevel('nBack', level) as {
    nLevel: number;
    stimulusDuration: number;
    isi: number;
  };
};

/**
 * Task Switch 게임 난이도 설정 가져오기
 */
export const getTaskSwitchConfig = (level: number) => {
  return getGameConfigForLevel('taskSwitch', level) as {
    switchProbability: number;
    cueDisplayTime: number;
  };
};

/**
 * 성능 트렌드 분석 (상승/하락/유지)
 */
export const analyzePerformanceTrend = (
  recentSessions: { accuracy: number; date: Date }[],
  windowSize: number = 7
): 'improving' | 'declining' | 'stable' => {
  if (recentSessions.length < 2) return 'stable';

  const sessions = recentSessions.slice(-windowSize);
  const midPoint = Math.floor(sessions.length / 2);

  const firstHalfAvg =
    sessions.slice(0, midPoint).reduce((sum, s) => sum + s.accuracy, 0) / midPoint;
  const secondHalfAvg =
    sessions.slice(midPoint).reduce((sum, s) => sum + s.accuracy, 0) /
    (sessions.length - midPoint);

  const difference = secondHalfAvg - firstHalfAvg;

  if (difference > 0.05) return 'improving';
  if (difference < -0.05) return 'declining';
  return 'stable';
};

/**
 * 피드백 메시지 생성
 */
export const generateFeedback = (
  accuracy: number,
  reactionTime: number,
  isRecord: boolean = false
): string => {
  const { feedback } = GAME_CONFIG;

  if (isRecord) {
    return '🏆 새로운 최고 기록이에요!';
  }

  if (accuracy >= 0.9) {
    return feedback.perfect[Math.floor(Math.random() * feedback.perfect.length)];
  }

  if (accuracy >= 0.7) {
    return feedback.good[Math.floor(Math.random() * feedback.good.length)];
  }

  return feedback.okay[Math.floor(Math.random() * feedback.okay.length)];
};

/**
 * 점수 계산
 */
export const calculateScore = (
  correctCount: number,
  totalCount: number,
  avgReactionTime: number,
  streak: number,
  difficulty: number
): number => {
  const { scoring } = GAME_CONFIG;

  // 기본 점수
  const baseScore = correctCount * scoring.correctGo;

  // 스트릭 보너스
  const streakBonus = Math.min(
    streak * scoring.streakBonus,
    scoring.maxStreakBonus
  );

  // 난이도 배수 (난이도가 높을수록 점수 증가)
  const difficultyMultiplier = 1 + (difficulty - 1) * 0.2;

  // 반응 시간 보너스 (빠를수록 보너스)
  const speedBonus = avgReactionTime < 300 ? scoring.perfectTiming : 0;

  return Math.round((baseScore + streakBonus + speedBonus) * difficultyMultiplier);
};

/**
 * 연속 정답 체크 (스트릭)
 */
export const getConsecutiveCorrect = (trials: TrialResult[]): number => {
  let streak = 0;

  for (let i = trials.length - 1; i >= 0; i--) {
    if (trials[i].isCorrect) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
