/**
 * 구독 선물하기 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
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
  GIFT_MESSAGE_PRESETS,
  RECOMMENDED_PLAN,
} from '../../constants/subscription';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useAuthStore } from '../../stores/authStore';
import { subscriptionService } from '../../services/subscription.service';
import type { SubscriptionDuration } from '../../types/subscription';

export default function GiftScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { sendGift, isLoading } = useSubscriptionStore();

  const [step, setStep] = useState<'duration' | 'recipient' | 'message'>('duration');
  const [selectedDuration, setSelectedDuration] = useState<SubscriptionDuration>(RECOMMENDED_PLAN);
  const [recipientPhone, setRecipientPhone] = useState('');
  const [message, setMessage] = useState('');
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  const handleNextStep = () => {
    if (step === 'duration') {
      setStep('recipient');
    } else if (step === 'recipient') {
      const validation = subscriptionService.validatePhone(recipientPhone);
      if (!validation.valid) {
        Alert.alert('알림', validation.error || '전화번호를 확인해주세요');
        return;
      }
      setStep('message');
    }
  };

  const handlePrevStep = () => {
    if (step === 'recipient') {
      setStep('duration');
    } else if (step === 'message') {
      setStep('recipient');
    } else {
      router.back();
    }
  };

  const handleSelectPreset = (index: number) => {
    setSelectedPreset(index);
    setMessage(GIFT_MESSAGE_PRESETS[index].text);
  };

  const handleSendGift = async () => {
    if (!user?.id) return;

    const plan = SUBSCRIPTION_PLANS[selectedDuration];

    try {
      const gift = await sendGift({
        senderId: user.id,
        recipientPhone,
        durationMonths: selectedDuration,
        amount: plan.price,
        message: message || undefined,
      });

      if (gift) {
        Alert.alert(
          SUBSCRIPTION_TEXTS.gift.successTitle,
          SUBSCRIPTION_TEXTS.gift.successMessage,
          [
            {
              text: '확인',
              onPress: () => router.replace('/subscription'),
            },
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '선물 전송에 실패했어요. 다시 시도해주세요.');
    }
  };

  const renderDurationStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>구독권 선택</Text>
      <Text style={styles.stepDescription}>
        선물할 구독 기간을 선택해주세요
      </Text>

      <View style={styles.planList}>
        {([1, 3, 6, 12] as SubscriptionDuration[]).map((duration) => {
          const plan = SUBSCRIPTION_PLANS[duration];
          const isSelected = selectedDuration === duration;
          const isRecommended = duration === RECOMMENDED_PLAN;
          const monthlyPrice = subscriptionService.calculateMonthlyPrice(duration);
          const savings = subscriptionService.calculateSavings(duration);
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

              <View style={styles.planHeader}>
                <Text style={[styles.planLabel, isSelected && styles.planLabelSelected]}>
                  {plan.label}
                </Text>
                {plan.discount > 0 && (
                  <Text style={styles.discountBadge}>{plan.discount}% OFF</Text>
                )}
              </View>

              <Text style={[styles.planPrice, isSelected && styles.planPriceSelected]}>
                {subscriptionService.formatPrice(plan.price)}
              </Text>

              <Text style={styles.planMonthly}>
                월 {subscriptionService.formatPrice(monthlyPrice)}
              </Text>

              {savings > 0 && (
                <Text style={styles.planSavings}>
                  {subscriptionService.formatPrice(savings)} 절약
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderRecipientStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>받는 분 정보</Text>
      <Text style={styles.stepDescription}>
        선물 받을 분의 전화번호를{'\n'}
        입력해주세요
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{SUBSCRIPTION_TEXTS.gift.recipientLabel}</Text>
        <TextInput
          style={styles.input}
          placeholder={SUBSCRIPTION_TEXTS.gift.recipientPlaceholder}
          placeholderTextColor={COLORS.textLight}
          value={recipientPhone}
          onChangeText={setRecipientPhone}
          keyboardType="phone-pad"
          maxLength={13}
        />
        <Text style={styles.inputHint}>
          * 카카오톡으로 선물 알림이 전송됩니다
        </Text>
      </View>

      <View style={styles.selectedPlanSummary}>
        <Text style={styles.summaryLabel}>선택한 구독권</Text>
        <Text style={styles.summaryValue}>
          {SUBSCRIPTION_PLANS[selectedDuration].label} -{' '}
          {subscriptionService.formatPrice(SUBSCRIPTION_PLANS[selectedDuration].price)}
        </Text>
      </View>
    </View>
  );

  const renderMessageStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>메시지 작성</Text>
      <Text style={styles.stepDescription}>
        함께 보낼 메시지를 선택하거나{'\n'}
        직접 작성해주세요
      </Text>

      <View style={styles.presetGrid}>
        {GIFT_MESSAGE_PRESETS.map((preset, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.presetButton,
              selectedPreset === index && styles.presetButtonSelected,
            ]}
            onPress={() => handleSelectPreset(index)}
          >
            <Text style={styles.presetEmoji}>{preset.emoji}</Text>
            <Text
              style={[
                styles.presetText,
                selectedPreset === index && styles.presetTextSelected,
              ]}
            >
              {preset.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>{SUBSCRIPTION_TEXTS.gift.messageLabel}</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={SUBSCRIPTION_TEXTS.gift.messagePlaceholder}
          placeholderTextColor={COLORS.textLight}
          value={message}
          onChangeText={(text) => {
            setMessage(text);
            setSelectedPreset(null);
          }}
          multiline
          numberOfLines={3}
          maxLength={100}
        />
        <Text style={styles.charCount}>{message.length}/100</Text>
      </View>

      <View style={styles.giftSummary}>
        <Text style={styles.summaryTitle}>선물 내용 확인</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>받는 분</Text>
          <Text style={styles.summaryValue}>
            {subscriptionService.maskPhone(recipientPhone)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>구독권</Text>
          <Text style={styles.summaryValue}>
            {SUBSCRIPTION_PLANS[selectedDuration].label}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>결제 금액</Text>
          <Text style={styles.summaryValueHighlight}>
            {subscriptionService.formatPrice(SUBSCRIPTION_PLANS[selectedDuration].price)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }}>
        <Header
          title={SUBSCRIPTION_TEXTS.gift.title}
          showBack
          onBack={handlePrevStep}
        />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: step === 'duration' ? '33%' : step === 'recipient' ? '66%' : '100%' },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 'duration' && renderDurationStep()}
        {step === 'recipient' && renderRecipientStep()}
        {step === 'message' && renderMessageStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step === 'message' ? (
          <FruitButton
            variant="apple"
            label={SUBSCRIPTION_TEXTS.gift.sendButton}
            size="large"
            onPress={handleSendGift}
            disabled={isLoading}
          />
        ) : (
          <FruitButton
            variant="orange"
            label="다음"
            size="large"
            onPress={handleNextStep}
            disabled={step === 'recipient' && !recipientPhone.trim()}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  progressBar: {
    height: 4,
    backgroundColor: COLORS.backgroundLight,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
  stepContent: {
    paddingTop: LAYOUT.spacing.xl,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.xxl,
  },
  planList: {
    gap: LAYOUT.spacing.md,
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
    right: LAYOUT.spacing.md,
    backgroundColor: COLORS.apple,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  recommendBadgeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '700',
    color: COLORS.white,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  planLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginRight: LAYOUT.spacing.sm,
  },
  planLabelSelected: {
    color: COLORS.textDark,
  },
  discountBadge: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.apple,
    backgroundColor: COLORS.appleLight,
    paddingVertical: 2,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.sm,
  },
  planPrice: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  planPriceSelected: {
    color: COLORS.textDark,
  },
  planMonthly: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  planSavings: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.greenApple,
    fontWeight: '600',
    marginTop: LAYOUT.spacing.xs,
  },
  inputGroup: {
    marginBottom: LAYOUT.spacing.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputHint: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.sm,
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'right',
    marginTop: LAYOUT.spacing.xs,
  },
  selectedPlanSummary: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  presetButton: {
    width: '48%',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.md,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  presetButtonSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  presetEmoji: {
    fontSize: 24,
    marginBottom: LAYOUT.spacing.xs,
  },
  presetText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
    textAlign: 'center',
  },
  presetTextSelected: {
    fontWeight: '600',
  },
  giftSummary: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.lg,
    paddingBottom: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  summaryValueHighlight: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.apple,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
