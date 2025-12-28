// 날짜/시간 관련 유틸리티 함수

/**
 * 시간대별 인사말 생성
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return '좋은 새벽이에요';
  if (hour < 12) return '좋은 아침이에요';
  if (hour < 18) return '좋은 오후예요';
  if (hour < 22) return '좋은 저녁이에요';
  return '좋은 밤이에요';
};

/**
 * 오늘 날짜인지 확인
 */
export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

/**
 * 어제 날짜인지 확인
 */
export const isYesterday = (date: Date): boolean => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  );
};

/**
 * 상대적 시간 표시 (예: "방금 전", "5분 전")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return '방금 전';
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  if (diffHours < 24) return `${diffHours}시간 전`;
  if (diffDays < 7) return `${diffDays}일 전`;

  return formatDate(date, 'short');
};

/**
 * 날짜 포맷팅
 */
export const formatDate = (
  date: Date,
  format: 'short' | 'long' | 'full' = 'short'
): string => {
  let options: Intl.DateTimeFormatOptions;

  if (format === 'short') {
    options = { month: 'short', day: 'numeric' };
  } else if (format === 'long') {
    options = { year: 'numeric', month: 'long', day: 'numeric' };
  } else {
    options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  }

  return date.toLocaleDateString('ko-KR', options);
};

/**
 * 시간 포맷팅 (HH:mm)
 */
export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

/**
 * HH:mm 문자열을 Date 객체로 변환
 */
export const parseTimeString = (timeString: string): Date => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

/**
 * 오늘 요일 반환 (1=월요일, 7=일요일)
 */
export const getTodayDayOfWeek = (): number => {
  const day = new Date().getDay();
  return day === 0 ? 7 : day; // 일요일을 7로 변환
};

/**
 * 요일 이름 반환
 */
export const getDayName = (dayOfWeek: number): string => {
  const days = ['', '월', '화', '수', '목', '금', '토', '일'];
  return days[dayOfWeek] || '';
};

/**
 * 두 날짜 사이의 일수 계산
 */
export const getDaysBetween = (start: Date, end: Date): number => {
  const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * 주의 시작일 반환 (월요일 기준)
 */
export const getWeekStart = (date: Date = new Date()): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * 주의 마지막일 반환 (일요일 기준)
 */
export const getWeekEnd = (date: Date = new Date()): Date => {
  const weekStart = getWeekStart(date);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return weekEnd;
};

/**
 * 스트릭 계산 (연속 일수)
 */
export const calculateStreak = (completedDates: Date[]): number => {
  if (completedDates.length === 0) return 0;

  // 날짜만 추출하여 정렬
  const sortedDates = completedDates
    .map((d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()))
    .sort((a, b) => b.getTime() - a.getTime());

  // 중복 제거
  const uniqueDates = sortedDates.filter(
    (date, index, arr) =>
      index === 0 || date.getTime() !== arr[index - 1].getTime()
  );

  // 오늘 또는 어제부터 시작해야 함
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const latestDate = uniqueDates[0];
  if (latestDate.getTime() !== today.getTime() && latestDate.getTime() !== yesterday.getTime()) {
    return 0;
  }

  // 연속 일수 계산
  let streak = 1;
  for (let i = 1; i < uniqueDates.length; i++) {
    const diff = getDaysBetween(uniqueDates[i], uniqueDates[i - 1]);
    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
};
