/**
 * 구독 갱신 / 프리미엄 시작 화면
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import {
  SUBSCRIPTION_TEXTS,
  SUBSCRIPTION_PLANS,
  RECOMMENDED_PLAN,
  PAYMENT_METHODS,
} from '../../constants/subscription';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionService } from '../../services/subscription.service';
import type { SubscriptionDuration } from '../../types/subscription';

export default function RenewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    currentSubscription,
    isLoading,
    renewSubscription,
    checkSubscriptionStatus,
    fetchSubscription,
  } = useSubscriptionStore();

  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(RECOMMENDED_PLAN);
  const [selectedPayment, setSelectedPayment] = useState<string>('kakaopay');

  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
    }
  }, [user?.id]);

  const status = checkSubscriptionStatus();
  const isRenewal = status.isPremium;
  const plan = SUBSCRIPTION_PLANS[selectedDuration];
  const monthlyPrice = subscriptionService.calculateMonthlyPrice(selectedDuration);
  const savings = subscriptionService.calculateSavings(selectedDuration);

  const handlePurchase = async () => {
    if (!user?.id) return;

    // TODO: 실제 결제 연동
    Alert.alert(
      '결제 확인',
      `${plan.label} 구독을 ${subscriptionService.formatPrice(plan.price)}에 결제합니다.`,
      [
        { text: '취소', style: 'cancel' },
        {
          text: '결제하기',
          onPress: async () => {
            try {
              const success = await renewSubscription({
                userId: user.id,
                durationMonths: selectedDuration,
                amount: plan.price,
              });

              if (success) {
                Alert.alert(
                  isRenewal ? '갱신 완료!' : '프리미엄 시작!',
                  `${plan.label} 구독이 시작되었어요.`,
                  [
                    {
                      text: '확인',
                      onPress: () => router.replace('/subscription'),
                    },
                  ]
                );
              }
            } catch (error) {
              Alert.alert('오류', '결제에 실패했어요. 다시 시도해주세요.');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={isRenewal ? SUBSCRIPTION_TEXTS.renew.title : '프리미엄 시작'}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* 현재 상태 표시 (갱신 시) */}
        {isRenewal && currentSubscription && (
          <View style={styles.currentStatus}>
            <Text style={styles.currentStatusLabel}>현재 구독</Text>
            <Text style={styles.currentStatusExpiry}>
              {subscriptionService.formatDate(new Date(currentSubscription.expiresAt))} 만료 예정
            </Text>
            {status.isExpiringSoon && (
              <Text style={styles.warningText}>
                ⚠️ {subscriptionService.formatRemainingDays(status.daysRemaining)}
              </Text>
            )}
          </View>
        )}

        {/* 구독 플랜 선택 */}
        <Text style={styles.sectionTitle}>구독 기간 선택</Text>
        <View style={styles.planList}>
          {([1, 3, 6, 12] as SubscriptionDuration[]).map((duration) => {
            const planOption = SUBSCRIPTION_PLANS[duration];
            const isSelected = selectedDuration === duration;
            const optionMonthlyPrice = subscriptionService.calculateMonthlyPrice(duration);
            const optionSavings = subscriptionService.calculateSavings(duration);
            const recommendation = subscriptionService.getRecommendation(duration);

            return (
              <TouchableOpacity
                key={duration}
                style={[styles.planCard, isSelected && styles.planCardSelected]}
                onPress={() => setSelectedDuration(duration)}
              >
                {recommendation && (
                  <View style={styles.recommendBadge}>
                    <Text style={styles.recommendBadgeText}>{recommendation}</Text>
                  </View>
                )}

                <View style={styles.planRow}>
                  <View style={styles.planInfo}>
                    <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                      {planOption.label}
                    </Text>
                    <Text style={styles.planMonthly}>
                      월 {subscriptionService.formatPrice(optionMonthlyPrice)}
                    </Text>
                  </View>

                  <View style={styles.planPricing}>
                    <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                      {subscriptionService.formatPrice(planOption.price)}
                    </Text>
                    {optionSavings > 0 && (
                      <Text style={styles.planSavings}>
                        {subscriptionService.formatPrice(optionSavings)} 절약
                      </Text>
                    )}
                  </View>

                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* 결제 수단 선택 */}
        <Text style={styles.sectionTitle}>결제 수단</Text>
        <View style={styles.paymentList}>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentCard,
                selectedPayment === method.id && styles.paymentCardSelected,
              ]}
              onPress={() => setSelectedPayment(method.id)}
            >
              <Text style={styles.paymentEmoji}>{method.emoji}</Text>
              <Text style={styles.paymentLabel}>{method.label}</Text>
              <View style={[styles.radioOuter, selectedPayment === method.id && styles.radioOuterSelected]}>
                {selectedPayment === method.id && <View style={styles.radioInner} />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* 결제 요약 */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>구독 기간</Text>
            <Text style={styles.summaryValue}>{plan.label}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>정가</Text>
            <Text style={styles.summaryValue}>
              {subscriptionService.formatPrice(SUBSCRIPTION_PLANS[1].price * selectedDuration)}
            </Text>
          </View>
          {savings > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>할인</Text>
              <Text style={styles.summarySavings}>
                -{subscriptionService.formatPrice(savings)}
              </Text>
            </View>
          )}
          <View style={[styles.summaryRow, styles.summaryRowTotal]}>
            <Text style={styles.summaryTotalLabel}>결제 금액</Text>
            <Text style={styles.summaryTotalValue}>
              {subscriptionService.formatPrice(plan.price)}
            </Text>
          </View>
        </View>

        {/* 안내 문구 */}
        <Text style={styles.disclaimer}>
          * 결제 후 즉시 구독이 시작됩니다{'\n'}
          * 구독 기간 종료 후 자동 갱신되지 않습니다{'\n'}
          * 결제 관련 문의: help@welling.app
        </Text>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="apple"
          label={`${subscriptionService.formatPrice(plan.price)} 결제하기`}
          size="large"
          onPress={handlePurchase}
          disabled={isLoading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: LAYOUT.screenPaddingHorizontal,
    paddingBottom: LAYOUT.spacing.xxxl,
  },
  currentStatus: {
    backgroundColor: COLORS.lemonLight,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    marginBottom: LAYOUT.spacing.xl,
  },
  currentStatusLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
  },
  currentStatusExpiry: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginTop: LAYOUT.spacing.xs,
  },
  warningText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.orange,
    fontWeight: '600',
    marginTop: LAYOUT.spacing.sm,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  planList: {
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xxl,
  },
  planCard: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  planCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  recommendBadge: {
    position: 'absolute',
    top: -10,
    left: LAYOUT.spacing.md,
    backgroundColor: COLORS.apple,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  recommendBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  planLabelSelected: {
    color: COLORS.textDark,
  },
  planMonthly: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  planPricing: {
    alignItems: 'flex-end',
    marginRight: LAYOUT.spacing.lg,
  },
  planPrice: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  planPriceSelected: {
    color: COLORS.textDark,
  },
  planSavings: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.greenApple,
    fontWeight: '600',
    marginTop: LAYOUT.spacing.xs,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
  },
  paymentList: {
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xxl,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  paymentCardSelected: {
    borderColor: COLORS.primary,
  },
  paymentEmoji: {
    fontSize: 24,
    marginRight: LAYOUT.spacing.md,
  },
  paymentLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
  },
  summary: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    marginBottom: LAYOUT.spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  summaryRowTotal: {
    paddingTop: LAYOUT.spacing.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    marginBottom: 0,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
  },
  summarySavings: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.greenApple,
    fontWeight: '600',
  },
  summaryTotalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  summaryTotalValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.apple,
  },
  disclaimer: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    lineHeight: TYPOGRAPHY.fontSize.sm * 1.6,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
  },
});
