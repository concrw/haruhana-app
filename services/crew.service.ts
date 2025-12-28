/**
 * 크루 관련 서비스
 * 초대 코드 생성, 통계 계산, 리더보드 등
 */

import { INVITE_CODE_LENGTH, CREW_LIMITS } from '../constants/crew';
import type {
  Crew,
  CrewMember,
  CrewStats,
  CrewLeaderboardEntry,
} from '../types/crew';

export class CrewService {
  /**
   * 초대 코드 생성
   * 6자리 영숫자 코드
   */
  generateInviteCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * 초대 코드 유효성 검사
   */
  validateInviteCode(code: string): boolean {
    if (!code || code.length !== INVITE_CODE_LENGTH) {
      return false;
    }
    return /^[A-Z0-9]+$/.test(code.toUpperCase());
  }

  /**
   * 크루 이름 유효성 검사
   */
  validateCrewName(name: string): { valid: boolean; error?: string } {
    if (!name || name.trim().length === 0) {
      return { valid: false, error: '크루 이름을 입력해주세요' };
    }
    if (name.length > CREW_LIMITS.nameMaxLength) {
      return { valid: false, error: `이름은 ${CREW_LIMITS.nameMaxLength}자 이하로 입력해주세요` };
    }
    return { valid: true };
  }

  /**
   * 목표 진행률 계산
   */
  calculateProgress(currentValue: number, goalValue: number | null): number {
    if (!goalValue || goalValue === 0) return 0;
    const progress = (currentValue / goalValue) * 100;
    return Math.min(Math.round(progress), 100);
  }

  /**
   * 크루 통계 계산
   */
  calculateCrewStats(
    members: CrewMember[],
    todayCompletions: { userId: string }[],
    weeklyCompletions: { userId: string; date: string }[],
    goalType: string,
    goalValue: number | null
  ): CrewStats {
    const memberCount = members.length;

    // 오늘 완료 현황
    const todayCompletedUserIds = new Set(todayCompletions.map(c => c.userId));
    const todayCompleted = members.filter(m => todayCompletedUserIds.has(m.userId)).length;

    // 주간 완료 현황 (크루원 × 7일)
    const weeklyTotal = memberCount * 7;
    const weeklyCompleted = weeklyCompletions.length;
    const weeklyCompletionRate = weeklyTotal > 0 ? Math.round((weeklyCompleted / weeklyTotal) * 100) : 0;

    // 총 리추얼 수
    const totalRituals = weeklyCompletions.length; // 실제로는 전체 기간 조회 필요

    // 목표 진행률
    let goalProgress = 0;
    if (goalType === '30days_streak') {
      // 연속 달성 일수 계산
      goalProgress = this.calculateProgress(this.calculateStreakDays(members, weeklyCompletions), goalValue);
    } else if (goalType === '1000_rituals') {
      goalProgress = this.calculateProgress(totalRituals, goalValue);
    }

    return {
      todayCompleted,
      todayTotal: memberCount,
      weeklyCompleted,
      weeklyTotal,
      weeklyCompletionRate,
      totalRituals,
      goalProgress,
    };
  }

  /**
   * 연속 전원 달성 일수 계산
   */
  calculateStreakDays(
    members: CrewMember[],
    completions: { userId: string; date: string }[]
  ): number {
    if (members.length === 0) return 0;

    // 날짜별 완료 인원 집계
    const dateCompletions: Record<string, Set<string>> = {};

    completions.forEach(c => {
      if (!dateCompletions[c.date]) {
        dateCompletions[c.date] = new Set();
      }
      dateCompletions[c.date].add(c.userId);
    });

    // 오늘부터 역순으로 확인
    let streak = 0;
    const today = new Date();
    const memberCount = members.length;

    for (let i = 0; i < 365; i++) { // 최대 1년
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];

      const completedCount = dateCompletions[dateStr]?.size || 0;

      if (completedCount === memberCount) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * 리더보드 생성
   */
  generateLeaderboard(
    members: CrewMember[],
    weeklyCompletions: { userId: string; completedAt: string }[],
    fruitsData: { userId: string; quantity: number }[]
  ): CrewLeaderboardEntry[] {
    // 멤버별 통계 집계
    const memberStats: Record<string, {
      completions: number;
      firstFinishes: number;
      fruits: number;
    }> = {};

    // 초기화
    members.forEach(m => {
      memberStats[m.userId] = {
        completions: 0,
        firstFinishes: 0,
        fruits: 0,
      };
    });

    // 완료 횟수 집계
    weeklyCompletions.forEach(c => {
      if (memberStats[c.userId]) {
        memberStats[c.userId].completions++;
      }
    });

    // 날짜별 첫 완료자 계산
    const dateFirstCompletion: Record<string, { userId: string; time: Date }> = {};
    weeklyCompletions.forEach(c => {
      const date = c.completedAt.split('T')[0];
      const time = new Date(c.completedAt);

      if (!dateFirstCompletion[date] || time < dateFirstCompletion[date].time) {
        dateFirstCompletion[date] = { userId: c.userId, time };
      }
    });

    Object.values(dateFirstCompletion).forEach(({ userId }) => {
      if (memberStats[userId]) {
        memberStats[userId].firstFinishes++;
      }
    });

    // 과일 수 집계
    fruitsData.forEach(f => {
      if (memberStats[f.userId]) {
        memberStats[f.userId].fruits += f.quantity;
      }
    });

    // 리더보드 엔트리 생성 및 정렬
    const leaderboard: CrewLeaderboardEntry[] = members.map(m => ({
      userId: m.userId,
      userName: m.user?.name || '크루원',
      userAvatar: m.user?.avatarUrl || null,
      rank: 0,
      weeklyCompletions: memberStats[m.userId]?.completions || 0,
      firstFinishes: memberStats[m.userId]?.firstFinishes || 0,
      fruitsCollected: memberStats[m.userId]?.fruits || 0,
      currentStreak: 0, // 개별 스트릭은 별도 계산 필요
    }));

    // 완료 횟수 → 선착순 → 과일 순으로 정렬
    leaderboard.sort((a, b) => {
      if (b.weeklyCompletions !== a.weeklyCompletions) {
        return b.weeklyCompletions - a.weeklyCompletions;
      }
      if (b.firstFinishes !== a.firstFinishes) {
        return b.firstFinishes - a.firstFinishes;
      }
      return b.fruitsCollected - a.fruitsCollected;
    });

    // 순위 부여
    leaderboard.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return leaderboard;
  }

  /**
   * 금액 포맷팅
   */
  formatAmount(amount: number): string {
    return amount.toLocaleString('ko-KR') + '원';
  }

  /**
   * 전화번호 포맷팅
   */
  formatPhoneNumber(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
  }

  /**
   * 전화번호 유효성 검사
   */
  validatePhoneNumber(phone: string): boolean {
    const cleaned = phone.replace(/\D/g, '');
    return /^01[0-9]{8,9}$/.test(cleaned);
  }

  /**
   * 모임통장 목표 달성 예상 날짜 계산
   */
  estimateGoalDate(
    currentAmount: number,
    goalAmount: number,
    monthlyDeposit: number
  ): Date | null {
    if (currentAmount >= goalAmount) return new Date();
    if (monthlyDeposit <= 0) return null;

    const remaining = goalAmount - currentAmount;
    const monthsNeeded = Math.ceil(remaining / monthlyDeposit);

    const estimatedDate = new Date();
    estimatedDate.setMonth(estimatedDate.getMonth() + monthsNeeded);

    return estimatedDate;
  }
}

// 싱글톤 인스턴스
export const crewService = new CrewService();
