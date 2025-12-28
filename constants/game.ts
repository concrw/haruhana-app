// 하루하나 게임 설정 상수

export const GAME_CONFIG = {
  // Go/No-Go 게임
  goNoGo: {
    sessionTrials: 30,
    trialsPerLevel: 6,
    stimulusDuration: 2000,
    goRatio: 0.8,
    fruitTypes: ['apple', 'orange', 'lemon', 'grape', 'greenApple'] as const,
    rottenIndicator: 'brown_spots',

    levels: {
      1: { fallSpeed: 2, goRatio: 0.8, interval: 2500, fruitCount: 6, stimulusDuration: 2500 },
      2: { fallSpeed: 2.5, goRatio: 0.75, interval: 2000, fruitCount: 7, stimulusDuration: 2000 },
      3: { fallSpeed: 3, goRatio: 0.7, interval: 1800, fruitCount: 8, stimulusDuration: 1800 },
      4: { fallSpeed: 3.5, goRatio: 0.65, interval: 1500, fruitCount: 9, stimulusDuration: 1500 },
      5: { fallSpeed: 4, goRatio: 0.6, interval: 1200, fruitCount: 9, stimulusDuration: 1200 },
    } as const,
  },

  // N-Back 게임
  nBack: {
    sessionTrials: 25,
    trialsPerLevel: 5,
    nValue: 1,
    matchRatio: 0.3,
    stimulusDuration: 2500,    // 과일 표시 시간 (ms)
    isi: 1000,                 // 자극 간 간격 (ms)
    targetRatio: 0.3,          // 일치 비율 30%
    startLevel: 1,             // 시니어용 1-back 시작

    levels: {
      1: { nLevel: 1, stimulusDuration: 3000, isi: 1500, matchRatio: 0.3 },
      2: { nLevel: 1, stimulusDuration: 2500, isi: 1200, matchRatio: 0.3 },
      3: { nLevel: 2, stimulusDuration: 2500, isi: 1000, matchRatio: 0.3 },
      4: { nLevel: 2, stimulusDuration: 2000, isi: 1000, matchRatio: 0.3 },
      5: { nLevel: 3, stimulusDuration: 2000, isi: 800, matchRatio: 0.3 },
    } as const,
  },

  // 과제전환 게임
  taskSwitch: {
    sessionTrials: 24,
    trialsPerLevel: 8,
    switchProbability: 0.33,   // 33% 확률로 규칙 전환
    cueDisplayTime: 1500,      // 규칙 안내 시간 (ms)
    responseTimeout: 5000,     // 응답 제한 시간 (ms)

    rules: ['color', 'type', 'size'] as const,

    levels: {
      1: { switchProbability: 0.2, cueDisplayTime: 2000 },
      2: { switchProbability: 0.25, cueDisplayTime: 1500 },
      3: { switchProbability: 0.33, cueDisplayTime: 1500 },
      4: { switchProbability: 0.4, cueDisplayTime: 1200 },
      5: { switchProbability: 0.5, cueDisplayTime: 1000 },
    } as const,
  },

  // 적응형 난이도 시스템
  adaptive: {
    windowSize: 10,          // 최근 10회 기준
    thresholdUp: 0.85,       // 85% 이상 → 난이도 상승
    thresholdDown: 0.60,     // 60% 이하 → 난이도 하락
    minLevel: 1,
    maxLevel: 5,
  },

  // 스테이지 구성
  stages: {
    basic: { start: 1, end: 10, features: ['grape'] },
    intermediate: { start: 11, end: 20, features: ['grape', 'apple'] },
    advanced: { start: 21, end: 30, features: ['apple', 'orange'] },
    expert: { start: 31, end: 40, features: ['orange', 'lemon'] },
    goNoGo: { start: 41, end: 50, features: ['rotten'] },
    nBack1: { start: 51, end: 60, features: ['1-back'] },
    taskSwitch: { start: 61, end: 70, features: ['task-switch'] },
    nBack2: { start: 71, end: 80, features: ['2-back'] },
    master: { start: 81, end: Infinity, features: ['all'] },
  },

  // 점수 시스템
  scoring: {
    correctGo: 100,           // Go 정확
    correctNoGo: 150,         // No-Go 정확 (억제 성공)
    commissionError: -50,     // No-Go 실패
    omissionError: -30,       // Go 미반응
    perfectTiming: 50,        // 완벽한 타이밍 보너스
    streakBonus: 10,          // 연속 성공 보너스 (per streak)
    maxStreakBonus: 100,      // 최대 스트릭 보너스
  },

  // 피드백 메시지
  feedback: {
    perfect: ['대단해요!', '완벽해요!', '훌륭해요!', '번개처럼 빠르세요!'],
    good: ['좋아요!', '잘하셨어요!', '멋져요!'],
    okay: ['괜찮아요!', '조금 더 빨리!', '할 수 있어요!'],
    miss: ['아쉬워요', '다음엔 잡아봐요!'],
    rottenCaught: ['앗! 썩은 과일이에요', '조심하세요!'],
    rottenAvoided: ['잘 피하셨어요!', '좋은 판단이에요!'],
  },
} as const;

export type GameType = 'go_nogo' | 'nback' | 'task_switch' | 'dual_task' | 'go-nogo' | 'task-switch';
export type SortingRule = 'color' | 'type' | 'size';
export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;
