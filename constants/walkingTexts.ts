// 산책 관련 텍스트 상수

export const WALKING_TEXTS = {
  // 홈 화면
  home: {
    title: '오늘의 산책',
    todaySteps: '오늘 걸음 수',
    goal: '목표',
    distance: '거리',
    startButton: '산책 시작하기',
    continueButton: '산책 계속하기',
    completeButton: '산책 완료',
    noDataToday: '아직 걸지 않으셨어요',
    goalAchieved: '목표 달성! 🎉',
  },

  // 산책 중 화면
  session: {
    title: '산책하기',
    steps: '걸음',
    currentProgress: '현재 진행률',
    timeElapsed: '경과 시간',
    pauseButton: '일시정지',
    resumeButton: '다시 시작',
    completeButton: '완료하기',
    callWithFamily: '가족과 통화하며 걷기',
  },

  // 기록 화면
  history: {
    title: '산책 기록',
    today: '오늘',
    thisWeek: '이번 주',
    thisMonth: '이번 달',
    allTime: '전체',
    noHistory: '아직 기록이 없어요',
    totalSteps: '총 걸음 수',
    totalDistance: '총 거리',
    avgSteps: '평균 걸음 수',
    daysActive: '활동 일수',
  },

  // 통계 화면
  stats: {
    title: '산책 통계',
    weeklyChart: '주간 걸음 수',
    monthlyChart: '월간 걸음 수',
    currentStreak: '연속 달성',
    longestStreak: '최고 기록',
    days: '일',
    avgPerDay: '일평균',
  },

  // 목표 설정
  goals: {
    title: '목표 설정',
    light: '가볍게',
    moderate: '적당하게',
    active: '활발하게',
    lightDesc: '3,000보 (약 2km)',
    moderateDesc: '5,000보 (약 3.5km)',
    activeDesc: '7,000보 (약 5km)',
    customGoal: '직접 설정',
  },

  // 보상
  rewards: {
    goalAchieved: '목표 달성!',
    goalAchievedDesc: '사과 2개를 획득했어요',
    goalExceeded: '목표 초과!',
    goalExceededDesc: '오렌지 1개를 추가로 획득했어요',
    streak7days: '7일 연속 달성!',
    streak7daysDesc: '포도 5개를 획득했어요',
    monthlyGoal: '월간 목표 달성!',
    monthlyGoalDesc: '청사과 10개를 획득했어요',
  },

  // 권한
  permissions: {
    title: '걸음 수 측정 권한',
    message: '걸음 수를 자동으로 측정하려면 센서 권한이 필요해요.',
    allowButton: '허용하기',
    denyButton: '나중에',
    denied: '권한이 거부되었어요',
    deniedMessage: '설정에서 권한을 허용해주세요.',
  },

  // 에러 메시지
  errors: {
    noPermission: '걸음 수 측정 권한이 필요해요',
    notAvailable: '이 기기에서는 걸음 수를 측정할 수 없어요',
    sessionNotFound: '진행 중인 산책이 없어요',
    failedToStart: '산책을 시작할 수 없어요',
    failedToComplete: '산책을 완료할 수 없어요',
    failedToFetch: '데이터를 불러올 수 없어요',
  },

  // 단위
  units: {
    steps: '보',
    km: 'km',
    meters: 'm',
    minutes: '분',
    hours: '시간',
    kcal: 'kcal',
  },
} as const;
