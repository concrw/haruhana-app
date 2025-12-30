/**
 * 크루 모임통장 진행률 컴포넌트
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { crewService } from '../../services/crew.service';
import type { CrewSavings, CrewDeposit, CrewMember } from '../../types/crew';

interface SavingsProgressProps {
  savings: CrewSavings;
  onDepositPress?: () => void;
}

export const SavingsProgress: React.FC<SavingsProgressProps> = ({
  savings,
  onDepositPress,
}) => {
  const progress = savings.goalAmount
    ? Math.min((savings.currentAmount / savings.goalAmount) * 100, 100)
    : 0;
  const remaining = savings.goalAmount ? savings.goalAmount - savings.currentAmount : 0;
  const isComplete = savings.currentAmount >= (savings.goalAmount || 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>💰 크루 모임통장</Text>
        {isComplete && <Text style={styles.completeBadge}>목표 달성!</Text>}
      </View>

      <View style={styles.amountSection}>
        <View style={styles.amountRow}>
          <Text style={styles.currentLabel}>현재</Text>
          <Text style={styles.currentAmount}>
            {crewService.formatAmount(savings.currentAmount)}
          </Text>
        </View>
        {savings.goalAmount && (
          <View style={styles.amountRow}>
            <Text style={styles.goalLabel}>목표</Text>
            <Text style={styles.goalAmount}>
              {crewService.formatAmount(savings.goalAmount)}
            </Text>
          </View>
        )}
      </View>

      {savings.goalAmount && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
                isComplete && styles.progressComplete,
              ]}
            />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressPercent}>{Math.round(progress)}%</Text>
            {remaining > 0 && (
              <Text style={styles.remainingText}>
                {crewService.formatAmount(remaining)} 남음
              </Text>
            )}
          </View>
        </View>
      )}

      {onDepositPress && (
        <TouchableOpacity style={styles.depositButton} onPress={onDepositPress}>
          <Text style={styles.depositButtonText}>💸 입금하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// 크루원별 입금 현황
interface MemberContributionsProps {
  deposits: CrewDeposit[];
  members: CrewMember[];
}

export const MemberContributions: React.FC<MemberContributionsProps> = ({
  deposits,
  members,
}) => {
  // 멤버별 입금 총액 계산
  const memberTotals: Record<string, number> = {};
  deposits.forEach((d) => {
    memberTotals[d.depositorId] = (memberTotals[d.depositorId] || 0) + d.amount;
  });

  // 총 입금액
  const totalAmount = Object.values(memberTotals).reduce((sum, amount) => sum + amount, 0);

  return (
    <View style={styles.contributionsContainer}>
      <Text style={styles.contributionsTitle}>크루원별 입금 현황</Text>

      {members.map((member) => {
        const memberTotal = memberTotals[member.userId] || 0;
        const percentage = totalAmount > 0 ? (memberTotal / totalAmount) * 100 : 0;

        return (
          <View key={member.id} style={styles.contributionItem}>
            <View style={styles.contributionHeader}>
              <Text style={styles.contributionName}>
                {member.user?.name || '크루원'}
              </Text>
              <Text style={styles.contributionAmount}>
                {crewService.formatAmount(memberTotal)}
              </Text>
            </View>
            <View style={styles.contributionBar}>
              <View
                style={[
                  styles.contributionFill,
                  { width: `${percentage}%` },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
};

// 입금 내역 아이템
interface DepositHistoryItemProps {
  deposit: CrewDeposit;
  userName: string;
}

export const DepositHistoryItem: React.FC<DepositHistoryItemProps> = ({
  deposit,
  userName,
}) => {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <View style={styles.depositItem}>
      <View style={styles.depositIcon}>
        <Text style={styles.depositIconText}>💰</Text>
      </View>
      <View style={styles.depositInfo}>
        <Text style={styles.depositUserName}>{userName}</Text>
        <Text style={styles.depositDate}>{formatDate(deposit.depositedAt)}</Text>
      </View>
      <Text style={styles.depositAmount}>
        +{crewService.formatAmount(deposit.amount)}
      </Text>
    </View>
  );
};

// 목표 설정 카드
interface SavingsGoalCardProps {
  goalAmount?: number | null;
  currentAmount: number;
  onSetGoal?: () => void;
}

export const SavingsGoalCard: React.FC<SavingsGoalCardProps> = ({
  goalAmount,
  currentAmount,
  onSetGoal,
}) => {
  if (goalAmount) {
    const estimatedDate = crewService.estimateGoalDate(
      currentAmount,
      goalAmount,
      50000 // 예상 월 입금액
    );

    return (
      <View style={styles.goalCard}>
        <Text style={styles.goalCardTitle}>🎯 목표</Text>
        <Text style={styles.goalCardAmount}>
          {crewService.formatAmount(goalAmount)}
        </Text>
        {estimatedDate && (
          <Text style={styles.goalCardEstimate}>
            예상 달성: {estimatedDate.toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
            })}
          </Text>
        )}
      </View>
    );
  }

  return (
    <TouchableOpacity style={styles.setGoalCard} onPress={onSetGoal}>
      <Text style={styles.setGoalIcon}>🎯</Text>
      <Text style={styles.setGoalText}>목표 금액 설정하기</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.xl,
    shadowColor: COLORS.textDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  completeBadge: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.greenApple,
    backgroundColor: COLORS.greenAppleLight,
    paddingVertical: LAYOUT.spacing.xs,
    paddingHorizontal: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.full,
  },
  amountSection: {
    marginBottom: LAYOUT.spacing.lg,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.sm,
  },
  currentLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  currentAmount: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  goalAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  progressSection: {
    marginBottom: LAYOUT.spacing.lg,
  },
  progressBar: {
    height: 12,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.orange,
    borderRadius: 6,
  },
  progressComplete: {
    backgroundColor: COLORS.greenApple,
  },
  progressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: LAYOUT.spacing.sm,
  },
  progressPercent: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  remainingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  depositButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
  },
  depositButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // 크루원별 입금 현황
  contributionsContainer: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
  },
  contributionsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.lg,
  },
  contributionItem: {
    marginBottom: LAYOUT.spacing.md,
  },
  contributionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: LAYOUT.spacing.xs,
  },
  contributionName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textDark,
  },
  contributionAmount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  contributionBar: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 4,
    overflow: 'hidden',
  },
  contributionFill: {
    height: '100%',
    backgroundColor: COLORS.grape,
    borderRadius: 4,
  },

  // 입금 내역 아이템
  depositItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: LAYOUT.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundLight,
  },
  depositIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lemonLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositIconText: {
    fontSize: 18,
  },
  depositInfo: {
    flex: 1,
    marginLeft: LAYOUT.spacing.md,
  },
  depositUserName: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '500',
    color: COLORS.textDark,
  },
  depositDate: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  depositAmount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.greenApple,
  },

  // 목표 카드
  goalCard: {
    backgroundColor: COLORS.primaryLight,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
  },
  goalCardTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  goalCardAmount: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: LAYOUT.spacing.xs,
  },
  goalCardEstimate: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.sm,
  },
  setGoalCard: {
    backgroundColor: COLORS.backgroundLight,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
    borderStyle: 'dashed',
  },
  setGoalIcon: {
    fontSize: 32,
    marginBottom: LAYOUT.spacing.sm,
  },
  setGoalText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
});

export default SavingsProgress;
