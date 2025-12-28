// 게임 관련 타입 정의

import { FruitId, RottenFruitId } from '../constants/fruits';

export type GameType = 'go_nogo' | 'nback' | 'task_switch' | 'dual_task' | 'go-nogo' | 'task-switch';
export type SortingRule = 'color' | 'type' | 'size';
export type TrialResult = 'correct' | 'incorrect' | 'miss' | 'timeout';

export interface GameSession {
  id: string;
  userId: string;
  gameType: GameType;
  startedAt: Date;
  startTime?: Date;  // alias for startedAt
  endedAt: Date | null;
  difficultyLevel: number;

  // 공통 메트릭
  totalTrials: number;
  correctResponses: number;
  incorrectResponses: number;

  // Go/No-Go 전용
  commissionErrors?: number;  // No-Go에서 반응한 오류
  omissionErrors?: number;    // Go에서 미반응 오류
  avgReactionTimeMs?: number;

  // N-Back 전용
  nLevel?: number;
  hitRate?: number;
  falseAlarmRate?: number;

  // 적응형 메트릭
  accuracyRate: number;
  difficultyAdjusted: boolean;
  newDifficultyLevel?: number;

  score: number;
  fruitsEarned: number;
}

// Go/No-Go 게임
export interface GoNoGoTrial {
  id: string;
  fruitType: FruitId | RottenFruitId;
  isGoTrial: boolean;  // true: 수집해야 함, false: 피해야 함 (썩은 과일)
  position: { x: number; y: number };
  startTime: number;
  responseTime?: number;
  reactionTime?: number;  // alias for responseTime
  response?: 'collected' | 'avoided' | 'none' | 'go' | 'nogo';
  isCorrect?: boolean;
  correct?: boolean;  // alias for isCorrect
}

export interface GoNoGoMetrics {
  totalTrials: number;
  goTrials: number;
  noGoTrials: number;
  correctGo: number;      // Hit
  correctNoGo: number;    // Correct Rejection
  commissionError: number; // No-Go에 반응 (억제 실패)
  omissionError: number;   // Go에 미반응
  reactionTimes: number[]; // ms 단위
}

export interface GoNoGoConfig {
  fallSpeed: number;
  goRatio: number;
  interval: number;
  fruitCount: number;
}

// N-Back 게임
export interface NBackTrial {
  id: string;
  trialNumber?: number;
  fruitType: FruitId;
  isTarget: boolean;  // N개 전과 일치하는지
  startTime: number;
  responseTime?: number;
  reactionTime?: number;  // alias for responseTime
  response?: 'match' | 'no_match' | 'no-match' | 'none';
  isCorrect?: boolean;
  correct?: boolean;  // alias for isCorrect
}

export interface NBackMetrics {
  totalTrials: number;
  targets: number;
  nonTargets: number;
  hits: number;           // 일치 정확
  correctRejections: number; // 불일치 정확
  falseAlarms: number;    // 불일치인데 일치라고 응답
  misses: number;         // 일치인데 응답 없음
  reactionTimes: number[];
}

export interface NBackConfig {
  nLevel: number;
  stimulusDuration: number;
  isi: number;
}

// 과제전환 게임
export interface TaskSwitchTrial {
  id: string;
  fruitType: FruitId;
  rule: SortingRule;
  correctBasket: 'left' | 'right';
  isSwitchTrial: boolean; // 규칙 전환 직후 여부
  startTime: number;
  responseTime?: number;
  response?: 'left' | 'right' | 'none';
  isCorrect?: boolean;
}

export interface TaskSwitchMetrics {
  totalTrials: number;
  switchTrials: number;
  nonSwitchTrials: number;
  correctSwitch: number;
  correctNonSwitch: number;
  switchCost: number;  // 전환 시 반응시간 증가량
  reactionTimes: number[];
}

// 게임 결과
export interface GameResult {
  score: number;
  accuracy: number;
  avgReactionTime: number;
  fruitsEarned: number;
  newDifficulty?: number;
  achievements?: string[];
  feedback: string;
}

// 게임 상태
export interface GameState {
  currentSession: GameSession | null;
  currentTrial: number;
  totalTrials: number;
  currentDifficulty: number;
  score: number;
  streak: number;
  isPlaying: boolean;
  isPaused: boolean;

  // Go/No-Go 상태
  goNoGoMetrics?: GoNoGoMetrics;

  // N-Back 상태
  nBackMetrics?: NBackMetrics;
  nBackHistory?: FruitId[];

  // 과제전환 상태
  taskSwitchMetrics?: TaskSwitchMetrics;
  currentRule?: SortingRule;
}
