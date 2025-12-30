/**
 * 받은 선물 목록 화면
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { SUBSCRIPTION_TEXTS, SUBSCRIPTION_PLANS } from '../../constants/subscription';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionService } from '../../services/subscription.service';
import type { SubscriptionGift } from '../../types/subscription';

export default function ReceivedGiftsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    receivedGifts,
    isLoading,
    fetchReceivedGifts,
    acceptGift,
  } = useSubscriptionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchReceivedGifts(user.id);
    }
  }, [user?.id]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (user?.id) {
      await fetchReceivedGifts(user.id);
    }
    setRefreshing(false);
  };

  const handleAcceptGift = async (gift: SubscriptionGift) => {
    if (!user?.id) return;

    const giftStatus = subscriptionService.checkGiftStatus(gift);
    if (giftStatus.isExpired) {
      Alert.alert('알림', '만료된 선물입니다.');
      return;
    }

    setAcceptingId(gift.id);
    try {
      const success = await acceptGift(gift.id, user.id);
      if (success) {
        Alert.alert(
          '선물 수락 완료!',
          `${SUBSCRIPTION_PLANS[gift.durationMonths].label} 구독이 시작되었어요!`,
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      Alert.alert('오류', '선물 수락에 실패했어요. 다시 시도해주세요.');
    } finally {
      setAcceptingId(null);
    }
  };

  const renderGiftItem = ({ item }: { item: SubscriptionGift }) => {
    const giftStatus = subscriptionService.checkGiftStatus(item);
    const plan = SUBSCRIPTION_PLANS[item.durationMonths];
    const senderName = (item as any).sender?.name || '친구';

    return (
      <View style={styles.giftCard}>
        <View style={styles.giftHeader}>
          <Text style={styles.giftIcon}>🎁</Text>
          <View style={styles.giftInfo}>
            <Text style={styles.giftTitle}>{plan.label} 구독권</Text>
            <Text style={styles.giftSender}>
              {SUBSCRIPTION_TEXTS.received.from}: {senderName}
            </Text>
          </View>
          {item.status === 'pending' && !giftStatus.isExpired && (
            <View style={styles.newBadge}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
        </View>

        {item.message && (
          <View style={styles.messageContainer}>
            <Text style={styles.messageQuote}>"</Text>
            <Text style={styles.messageText}>{item.message}</Text>
            <Text style={styles.messageQuote}>"</Text>
          </View>
        )}

        <View style={styles.giftFooter}>
          {item.status === 'accepted' ? (
            <View style={styles.acceptedBadge}>
              <Text style={styles.acceptedText}>✓ 수락 완료</Text>
            </View>
          ) : giftStatus.isExpired ? (
            <View style={styles.expiredBadge}>
              <Text style={styles.expiredText}>
                {SUBSCRIPTION_TEXTS.received.expiredText}
              </Text>
            </View>
          ) : (
            <>
              <View style={styles.expiryInfo}>
                <Text style={styles.expiryLabel}>
                  {SUBSCRIPTION_TEXTS.received.expiresIn}
                </Text>
                <Text style={styles.expiryValue}>
                  {subscriptionService.formatRemainingDays(giftStatus.daysRemaining)}
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.acceptButton,
                  acceptingId === item.id && styles.acceptButtonDisabled,
                ]}
                onPress={() => handleAcceptGift(item)}
                disabled={acceptingId === item.id}
              >
                {acceptingId === item.id ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.acceptButtonText}>
                    {SUBSCRIPTION_TEXTS.received.acceptButton}
                  </Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={styles.giftDate}>
          {item.createdAt ? subscriptionService.formatDate(new Date(item.createdAt)) : ''}
        </Text>
      </View>
    );
  };

  if (isLoading && receivedGifts.length === 0) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={SUBSCRIPTION_TEXTS.received.title}
        showBack
        onBack={() => router.back()}
      />

      <FlatList
        data={receivedGifts}
        renderItem={renderGiftItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🎁</Text>
            <Text style={styles.emptyTitle}>
              {SUBSCRIPTION_TEXTS.received.emptyText}
            </Text>
            <Text style={styles.emptyDescription}>
              친구에게 선물을 받으면{'\n'}
              여기에 표시됩니다
            </Text>
          </View>
        }
      />
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
  listContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    paddingBottom: LAYOUT.spacing.xxxl,
  },
  giftCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    marginBottom: LAYOUT.spacing.lg,
  },
  giftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  giftIcon: {
    fontSize: 40,
    marginRight: LAYOUT.spacing.md,
  },
  giftInfo: {
    flex: 1,
  },
  giftTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  giftSender: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  newBadge: {
    backgroundColor: COLORS.apple,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  newBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: '700',
    color: COLORS.white,
  },
  messageContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundCream,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    marginBottom: LAYOUT.spacing.lg,
  },
  messageQuote: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textLight,
    lineHeight: TYPOGRAPHY.fontSize.xxl,
  },
  messageText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    textAlign: 'center',
    fontStyle: 'italic',
    marginHorizontal: LAYOUT.spacing.sm,
  },
  giftFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  expiryInfo: {},
  expiryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textGray,
  },
  expiryValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.orange,
    marginTop: LAYOUT.spacing.xs,
  },
  acceptButton: {
    backgroundColor: COLORS.apple,
    paddingVertical: LAYOUT.spacing.md,
    paddingHorizontal: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.lg,
  },
  acceptButtonDisabled: {
    backgroundColor: COLORS.backgroundLight,
  },
  acceptButtonText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.white,
  },
  acceptedBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
  },
  acceptedText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.greenApple,
  },
  expiredBadge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.md,
  },
  expiredText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  giftDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.textLight,
    textAlign: 'right',
    marginTop: LAYOUT.spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: LAYOUT.spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: LAYOUT.spacing.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.base * 1.5,
  },
});
