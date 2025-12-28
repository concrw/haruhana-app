/**
 * 크루 모임통장 화면
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_TEXTS, DEPOSIT_AMOUNTS, SAVINGS_DEFAULTS } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import {
  SavingsProgress,
  MemberContributions,
  DepositHistoryItem,
  SavingsGoalCard,
} from '../../components/crew/SavingsProgress';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';
import { crewService } from '../../services/crew.service';

export default function SavingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    currentCrew,
    members,
    savings,
    deposits,
    isLoading,
    fetchCrewDetails,
    fetchMembers,
    fetchSavings,
    fetchDeposits,
    createSavings,
    makeDeposit,
  } = useCrewStore();

  const [refreshing, setRefreshing] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [goalAmount, setGoalAmount] = useState('');

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    await fetchCrewDetails(id);
    await fetchMembers(id);
    await fetchSavings(id);
    await fetchDeposits(id);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleDeposit = async () => {
    if (!id || !user?.id) return;

    const amount = selectedAmount || parseInt(customAmount, 10);
    if (!amount || amount <= 0) {
      Alert.alert('알림', '입금 금액을 선택해주세요');
      return;
    }

    try {
      if (!savings) return;
      await makeDeposit({
        savingsId: savings.id,
        depositorId: user.id,
        depositorType: 'self',
        forMemberId: user.id,
        amount,
      });
      setShowDepositModal(false);
      setSelectedAmount(null);
      setCustomAmount('');
      Alert.alert('완료', `${crewService.formatAmount(amount)} 입금되었어요!`);
    } catch (error) {
      Alert.alert('오류', '입금에 실패했어요. 다시 시도해주세요.');
    }
  };

  const handleSetGoal = async () => {
    if (!id) return;

    const amount = parseInt(goalAmount, 10);
    if (!amount || amount < SAVINGS_DEFAULTS.minGoalAmount) {
      Alert.alert('알림', `최소 ${crewService.formatAmount(SAVINGS_DEFAULTS.minGoalAmount)} 이상 입력해주세요`);
      return;
    }

    try {
      await createSavings({
        crewId: id,
        goalName: '크루 목표',
        goalAmount: amount,
      });
      setShowGoalModal(false);
      setGoalAmount('');
    } catch (error) {
      Alert.alert('오류', '목표 설정에 실패했어요. 다시 시도해주세요.');
    }
  };

  const getMemberName = (userId: string) => {
    const member = members.find((m) => m.userId === userId);
    return member?.user?.name || '크루원';
  };

  if (isLoading && !savings) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title={CREW_TEXTS.savings.title}
        showBack
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 크루 이름 */}
        {currentCrew && (
          <Text style={styles.crewName}>{currentCrew.name}</Text>
        )}

        {/* 모임통장 현황 */}
        {savings ? (
          <SavingsProgress
            savings={savings}
            onDepositPress={() => setShowDepositModal(true)}
          />
        ) : (
          <View style={styles.emptySavings}>
            <Text style={styles.emptyIcon}>💰</Text>
            <Text style={styles.emptyTitle}>모임통장이 없어요</Text>
            <Text style={styles.emptyDescription}>
              크루 목표 달성을 위한{'\n'}
              모임통장을 시작해보세요
            </Text>
            <FruitButton
              variant="orange"
              label="모임통장 시작하기"
              size="medium"
              onPress={() => setShowGoalModal(true)}
            />
          </View>
        )}

        {/* 목표 설정 */}
        {savings && (
          <View style={styles.section}>
            <SavingsGoalCard
              goalAmount={savings.goalAmount}
              currentAmount={savings.currentAmount}
              onSetGoal={() => setShowGoalModal(true)}
            />
          </View>
        )}

        {/* 크루원별 입금 현황 */}
        {savings && members.length > 0 && (
          <View style={styles.section}>
            <MemberContributions deposits={deposits} members={members} />
          </View>
        )}

        {/* 입금 내역 */}
        {deposits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>입금 내역</Text>
            <View style={styles.historyCard}>
              {deposits.slice(0, 10).map((deposit) => (
                <DepositHistoryItem
                  key={deposit.id}
                  deposit={deposit}
                  userName={getMemberName(deposit.depositorId)}
                />
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      {/* 입금 모달 */}
      <Modal
        visible={showDepositModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDepositModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>입금하기</Text>
              <TouchableOpacity onPress={() => setShowDepositModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>금액 선택</Text>
            <View style={styles.amountGrid}>
              {DEPOSIT_AMOUNTS.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    selectedAmount === amount && styles.amountButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedAmount(amount);
                    setCustomAmount('');
                  }}
                >
                  <Text
                    style={[
                      styles.amountButtonText,
                      selectedAmount === amount && styles.amountButtonTextSelected,
                    ]}
                  >
                    {crewService.formatAmount(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>직접 입력</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="금액 입력"
              placeholderTextColor={COLORS.textLight}
              value={customAmount}
              onChangeText={(text) => {
                setCustomAmount(text.replace(/[^0-9]/g, ''));
                setSelectedAmount(null);
              }}
              keyboardType="number-pad"
            />

            <FruitButton
              variant="apple"
              label="입금하기"
              size="large"
              onPress={handleDeposit}
              disabled={!selectedAmount && !customAmount}
            />
          </View>
        </View>
      </Modal>

      {/* 목표 설정 모달 */}
      <Modal
        visible={showGoalModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowGoalModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>목표 금액 설정</Text>
              <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.modalLabel}>추천 금액</Text>
            <View style={styles.amountGrid}>
              {SAVINGS_DEFAULTS.suggestedAmounts.map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.amountButton,
                    goalAmount === String(amount) && styles.amountButtonSelected,
                  ]}
                  onPress={() => setGoalAmount(String(amount))}
                >
                  <Text
                    style={[
                      styles.amountButtonText,
                      goalAmount === String(amount) && styles.amountButtonTextSelected,
                    ]}
                  >
                    {crewService.formatAmount(amount)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>직접 입력</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="목표 금액 입력"
              placeholderTextColor={COLORS.textLight}
              value={goalAmount}
              onChangeText={(text) => setGoalAmount(text.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
            />

            <FruitButton
              variant="apple"
              label="목표 설정하기"
              size="large"
              onPress={handleSetGoal}
              disabled={!goalAmount}
            />
          </View>
        </View>
      </Modal>
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
  crewName: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  section: {
    marginTop: LAYOUT.spacing.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.md,
  },
  emptySavings: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xxl,
    borderRadius: LAYOUT.radius.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: LAYOUT.spacing.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.sm,
  },
  emptyDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.base * 1.5,
    marginBottom: LAYOUT.spacing.xl,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: LAYOUT.radius.xl,
    borderTopRightRadius: LAYOUT.radius.xl,
    padding: LAYOUT.screenPaddingHorizontal,
    paddingTop: LAYOUT.spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  modalTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  modalClose: {
    fontSize: 24,
    color: COLORS.textGray,
    padding: LAYOUT.spacing.sm,
  },
  modalLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  amountButton: {
    width: '48%',
    backgroundColor: COLORS.backgroundLight,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
  },
  amountButtonSelected: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  amountButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  amountButtonTextSelected: {
    color: COLORS.textDark,
  },
  modalInput: {
    backgroundColor: COLORS.backgroundLight,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.xl,
  },
});
