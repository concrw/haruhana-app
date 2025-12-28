/**
 * 산책 트래킹 서비스
 * Expo Sensors (Pedometer) 연동
 */

import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';
import { STRIDE_COEFFICIENTS, DEFAULT_STRIDE_LENGTH } from '../constants/walking';
import type { WalkingSession, DailySteps } from '../types/walking';

export class WalkingService {
  private subscription: { remove: () => void } | null = null;
  private stepCountStart: number = 0;

  /**
   * Pedometer 사용 가능 여부 확인
   */
  async isPedometerAvailable(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const available = await Pedometer.isAvailableAsync();
      return available;
    } catch (error) {
      console.error('Pedometer availability check failed:', error);
      return false;
    }
  }

  /**
   * 실시간 걸음 수 측정 시작
   */
  startPedometer(onStepUpdate: (steps: number) => void): void {
    if (Platform.OS === 'web') {
      console.warn('Pedometer not available on web');
      return;
    }

    // 기존 구독 정리
    this.stopPedometer();

    // 실시간 걸음 수 구독
    this.subscription = Pedometer.watchStepCount((result) => {
      const steps = result.steps;
      onStepUpdate(steps);
    });
  }

  /**
   * 걸음 수 측정 중지
   */
  stopPedometer(): void {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
  }

  /**
   * 특정 시간 범위의 걸음 수 가져오기
   */
  async getStepCount(start: Date, end: Date): Promise<number> {
    if (Platform.OS === 'web') {
      return 0;
    }

    try {
      const result = await Pedometer.getStepCountAsync(start, end);
      return result.steps;
    } catch (error) {
      console.error('Failed to get step count:', error);
      return 0;
    }
  }

  /**
   * 오늘 걸음 수 가져오기
   */
  async getTodaySteps(): Promise<number> {
    const end = new Date();
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    return this.getStepCount(start, end);
  }

  /**
   * 거리 계산 (걸음 수 → 미터)
   * @param steps 걸음 수
   * @param userHeight 사용자 신장 (cm), 없으면 기본값 사용
   */
  calculateDistance(steps: number, userHeight?: number): number {
    let strideLengthCm: number;

    if (userHeight) {
      // 신장 기반 계산 (시니어용 계수 0.40)
      strideLengthCm = userHeight * STRIDE_COEFFICIENTS.senior;
    } else {
      // 기본 보폭 사용
      strideLengthCm = DEFAULT_STRIDE_LENGTH;
    }

    // 거리 = 걸음 수 × 보폭 (cm) ÷ 100
    const distanceMeters = (steps * strideLengthCm) / 100;

    return Math.round(distanceMeters);
  }

  /**
   * 칼로리 소모량 추정 (간략 계산)
   * @param steps 걸음 수
   * @param userWeight 사용자 체중 (kg), 없으면 기본값 65kg
   */
  calculateCalories(steps: number, userWeight: number = 65): number {
    // 간단한 추정식: 걸음 수 × 체중 × 0.0004
    const calories = steps * userWeight * 0.0004;
    return Math.round(calories);
  }

  /**
   * 목표 달성률 계산
   */
  calculateProgress(currentSteps: number, goalSteps: number): number {
    if (goalSteps === 0) return 0;
    const progress = (currentSteps / goalSteps) * 100;
    return Math.min(Math.round(progress), 100);
  }

  /**
   * 주간 평균 걸음 수 계산
   */
  calculateWeeklyAverage(weeklyData: DailySteps[]): number {
    if (weeklyData.length === 0) return 0;

    const totalSteps = weeklyData.reduce((sum, day) => sum + day.totalSteps, 0);
    return Math.round(totalSteps / weeklyData.length);
  }

  /**
   * 스트릭 계산 (연속 달성 일수)
   */
  calculateStreak(dailyRecords: DailySteps[], goalSteps: number): number {
    if (dailyRecords.length === 0) return 0;

    // 날짜 역순 정렬 (최신순)
    const sorted = [...dailyRecords].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < sorted.length; i++) {
      const recordDate = new Date(sorted[i].date);
      recordDate.setHours(0, 0, 0, 0);

      // 예상 날짜 계산
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      // 날짜가 일치하고 목표를 달성한 경우
      if (
        recordDate.getTime() === expectedDate.getTime() &&
        sorted[i].totalSteps >= goalSteps
      ) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 권한 요청 (iOS 14 이상)
   */
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }

    try {
      const { status } = await Pedometer.requestPermissionsAsync();
      return status === 'granted';
    } catch (error) {
      console.error('Failed to request pedometer permissions:', error);
      return false;
    }
  }

  /**
   * 권한 상태 확인
   */
  async getPermissionStatus(): Promise<string> {
    if (Platform.OS === 'web') {
      return 'unavailable';
    }

    try {
      const { status } = await Pedometer.getPermissionsAsync();
      return status;
    } catch (error) {
      console.error('Failed to get pedometer permission status:', error);
      return 'undetermined';
    }
  }
}

// 싱글톤 인스턴스
export const walkingService = new WalkingService();
