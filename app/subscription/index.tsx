/**
 * 구독 현황 화면
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { SUBSCRIPTION_TEXTS, PREMIUM_FEATURES } from '../../constants/subscription';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionService } from '../../services/subscription.service';

export default function SubscriptionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    currentSubscription,
    isLoading,
    fetchSubscription,
    checkSubscriptionStatus,
  } = useSubscriptionStore();

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchSubscription(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchSubscription(user.id);
    }
    setRefreshing(false);
  };

  const status = checkSubscriptionStatus();

  if (isLoading && !currentSubscription) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title={SUBSCRIPTION_TEXTS.status.title} showBack onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 현재 구독 상태 */}
        <View style={styles.statusCard}>
          {status.isPremium ? (
            <>
              <View style={styles.premiumBadge}>
                <Text style={styles.premiumBadgeText}>
                  ✨ {SUBSCRIPTION_TEXTS.status.activeLabel}
                </Text>
              </View>
              <Text style={styles.expiryLabel}>
                {SUBSCRIPTION_TEXTS.status.expiresLabel}
              </Text>
              <Text style={styles.expiryDate}>
                {subscriptionService.formatDate(new Date(currentSubscription!.expiresAt))}
              </Text>
              <Text style={styles.remainingDays}>
                {subscriptionService.formatRemainingDays(status.daysRemaining)}
              </Text>

              {status.isExpiringSoon && (
                <View style={styles.expiryWarning}>
                  <Text style={styles.expiryWarningText}>
                    ⚠️ 구독이 곧 만료됩니다
                  </Text>
                  <TouchableOpacity
                    style={styles.renewLink}
                    onPress={() => router.push('/subscription/renew')}
                  >
                    <Text style={styles.renewLinkText}>갱신하기</Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          ) : (
            <>
              <Text style={styles.freeLabel}>{SUBSCRIPTION_TEXTS.status.freeLabel}</Text>
              <Text style={styles.freeDescription}>
                프리미엄으로 업그레이드하고{'\n'}
                모든 기능을 이용해보세요
              </Text>
            </>
          )}
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          {!status.isPremium && (
            <FruitButton
              variant="apple"
              label={SUBSCRIPTION_TEXTS.status.upgradeButton}
              size="large"
              onPress={() => router.push('/subscription/renew')}
            />
          )}
          <FruitButton
            variant="orange"
            label={SUBSCRIPTION_TEXTS.status.giftButton}
            size="large"
            onPress={() => router.push('/subscription/gift')}
          />
        </View>

        {/* 프리미엄 기능 목록 */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>프리미엄 기능</Text>
          <View style={styles.featuresList}>
            {PREMIUM_FEATURES.map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <Text style={styles.featureEmoji}>{feature.emoji}</Text>
                <View style={styles.featureInfo}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
                {status.isPremium ? (
                  <Text style={styles.featureCheck}>✓</Text>
                ) : (
                  <Text style={styles.featureLock}>🔒</Text>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* 선물 관련 링크 */}
        <View style={styles.quickLinks}>
          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push('/subscription/received')}
          >
            <Text style={styles.linkIcon}>🎁</Text>
            <Text style={styles.linkText}>받은 선물</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.linkCard}
            onPress={() => router.push('/subscription/gift')}
          >
            <Text style={styles.linkIcon}>💝</Text>
            <Text style={styles.linkText}>선물하기</Text>
            <Text style={styles.linkArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: LAYOUT.screenPaddingHorizontal,
    paddingBottom: LAYOUT.spacing.xxxl,
  },
  statusCard: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xxl,
    borderRadius: LAYOUT.radius.xl,
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  premiumBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingVertical: LAYOUT.spacing.sm,
    paddingHorizontal: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.full,
    marginBottom: LAYOUT.spacing.lg,
  },
  premiumBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  expiryLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xs,
  },
  expiryDate: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.sm,
  },
  remainingDays: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.grape,
    fontWeight: '600',
  },
  expiryWarning: {
    marginTop: LAYOUT.spacing.lg,
    backgroundColor: COLORS.lemonLight,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
  },
  expiryWarningText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textDark,
    flex: 1,
  },
  renewLink: {
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.md,
  },
  renewLinkText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.grape,
    fontWeight: '600',
  },
  freeLabel: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  freeDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.base * 1.5,
  },
  actions: {
    gap: LAYOUT.spacing.md,
    marginBottom: LAYOUT.spacing.xxl,
  },
  featuresSection: {
    marginBottom: LAYOUT.spacing.xxl,
  },
  featuresTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.lg,
  },
  featuresList: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  featureEmoji: {
    fontSize: 28,
    marginRight: LAYOUT.spacing.md,
  },
  featureInfo: {
    flex: 1,
  },
  featureTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  featureDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  featureCheck: {
    fontSize: 20,
    color: COLORS.greenApple,
    fontWeight: '700',
  },
  featureLock: {
    fontSize: 18,
  },
  quickLinks: {
    gap: LAYOUT.spacing.md,
  },
  linkCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  linkIcon: {
    fontSize: 24,
    marginRight: LAYOUT.spacing.md,
  },
  linkText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  linkArrow: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
