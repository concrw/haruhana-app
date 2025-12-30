/**
 * 구독 관련 서비스
 * 가격 계산, 선물 링크 생성, 유효성 검사 등
 */

import { SUBSCRIPTION_PLANS, GIFT_VALIDITY_DAYS, NUDGE_TIMINGS } from '../constants/subscription';
import type {
  SubscriptionDuration,
  SubscriptionGift,
  Subscription,
  NudgeType,
} from '../types/subscription';

export class SubscriptionService {
  /**
   * 선물 만료일 계산
   */
  calculateGiftExpiry(): Date {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + GIFT_VALIDITY_DAYS);
    return expiryDate;
  }

  /**
   * 구독 만료일 계산
   */
  calculateSubscriptionExpiry(startDate: Date, durationMonths: SubscriptionDuration): Date {
    const expiryDate = new Date(startDate);
    expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
    return expiryDate;
  }

  /**
   * 가격 포맷팅
   */
  formatPrice(amount: number): string {
    return amount.toLocaleString('ko-KR') + '원';
  }

  /**
   * 할인 금액 계산
   */
  calculateSavings(durationMonths: SubscriptionDuration): number {
    const plan = SUBSCRIPTION_PLANS[durationMonths];
    const originalPrice = SUBSCRIPTION_PLANS[1].price * durationMonths;
    return originalPrice - plan.price;
  }

  /**
   * 월 환산 가격 계산
   */
  calculateMonthlyPrice(durationMonths: SubscriptionDuration): number {
    const plan = SUBSCRIPTION_PLANS[durationMonths];
    return Math.round(plan.price / durationMonths);
  }

  /**
   * 선물 링크 생성 (딥링크)
   */
  generateGiftLink(giftId: string): string {
    // 실제 앱 스키마로 변경 필요
    return `welling://gift/${giftId}`;
  }

  /**
   * 카카오톡 공유용 웹 링크 생성
   */
  generateWebGiftLink(giftId: string): string {
    // 실제 도메인으로 변경 필요
    return `https://welling.app/gift/${giftId}`;
  }

  /**
   * 전화번호 유효성 검사
   */
  validatePhone(phone: string): { valid: boolean; error?: string } {
    const cleaned = phone.replace(/\D/g, '');

    if (!cleaned) {
      return { valid: false, error: '전화번호를 입력해주세요' };
    }

    if (!/^01[0-9]{8,9}$/.test(cleaned)) {
      return { valid: false, error: '올바른 전화번호를 입력해주세요' };
    }

    return { valid: true };
  }

  /**
   * 전화번호 정규화 (하이픈 제거)
   */
  normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * 전화번호 마스킹
   */
  maskPhone(phone: string): string {
    const cleaned = this.normalizePhone(phone);
    if (cleaned.length === 11) {
      return `${cleaned.slice(0, 3)}-****-${cleaned.slice(7)}`;
    }
    if (cleaned.length === 10) {
      return `${cleaned.slice(0, 3)}-***-${cleaned.slice(6)}`;
    }
    return '***-****-****';
  }

  /**
   * 구독 만료까지 남은 일수 계산
   */
  getDaysUntilExpiry(expiresAt: Date): number {
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }

  /**
   * 넛지 타입 결정
   */
  getNudgeType(daysUntilExpiry: number): NudgeType | null {
    if (daysUntilExpiry === NUDGE_TIMINGS['2weeks']) {
      return '2weeks';
    }
    if (daysUntilExpiry === NUDGE_TIMINGS['1week']) {
      return '1week';
    }
    if (daysUntilExpiry === NUDGE_TIMINGS['last_day']) {
      return 'last_day';
    }
    return null;
  }

  /**
   * 구독 상태 확인
   */
  checkSubscriptionStatus(subscription: Subscription | null): {
    isActive: boolean;
    isPremium: boolean;
    isExpiringSoon: boolean;
    daysRemaining: number;
  } {
    if (!subscription) {
      return {
        isActive: false,
        isPremium: false,
        isExpiringSoon: false,
        daysRemaining: 0,
      };
    }

    const daysRemaining = this.getDaysUntilExpiry(new Date(subscription.expiresAt));
    const isActive = subscription.status === 'active' && daysRemaining > 0;
    const isPremium = subscription.planType === 'premium' && isActive;
    const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 14;

    return {
      isActive,
      isPremium,
      isExpiringSoon,
      daysRemaining,
    };
  }

  /**
   * 선물 상태 확인
   */
  checkGiftStatus(gift: SubscriptionGift): {
    isPending: boolean;
    isExpired: boolean;
    daysRemaining: number;
  } {
    const now = new Date();
    const expiresAt = new Date(gift.expiresAt);
    const daysRemaining = this.getDaysUntilExpiry(expiresAt);

    return {
      isPending: gift.status === 'pending',
      isExpired: gift.status === 'expired' || expiresAt < now,
      daysRemaining,
    };
  }

  /**
   * 날짜 포맷팅
   */
  formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}년 ${month}월 ${day}일`;
  }

  /**
   * 남은 기간 텍스트 생성
   */
  formatRemainingDays(days: number): string {
    if (days <= 0) return '만료됨';
    if (days === 1) return '내일 만료';
    if (days < 7) return `${days}일 남음`;
    if (days < 30) return `${Math.floor(days / 7)}주 남음`;
    return `${Math.floor(days / 30)}개월 남음`;
  }

  /**
   * 구독권 추천 문구 생성
   */
  getRecommendation(durationMonths: SubscriptionDuration): string | null {
    switch (durationMonths) {
      case 3:
        return '추천!';
      case 12:
        return '2개월 무료!';
      default:
        return null;
    }
  }
}

// 싱글톤 인스턴스
export const subscriptionService = new SubscriptionService();
