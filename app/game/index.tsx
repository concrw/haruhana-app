import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { Header, SectionHeader } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useGameStore } from '../../stores/gameStore';

const GAMES = [
  {
    id: 'go-nogo',
    title: '과일 수확하기',
    subtitle: 'Go/No-Go 게임',
    description: '맞는 과일만 터치하고\n틀린 과일은 피해요',
    emoji: '🍎',
    color: COLORS.apple,
    benefit: '집중력 향상',
  },
  {
    id: 'nback',
    title: '기억력 게임',
    subtitle: 'N-Back 게임',
    description: 'N번 전에 본 과일을\n기억해서 맞춰요',
    emoji: '🧠',
    color: COLORS.grape,
    benefit: '기억력 향상',
  },
  {
    id: 'task-switch',
    title: '분류하기',
    subtitle: 'Task Switch 게임',
    description: '규칙에 따라 과일을\n올바른 바구니에 넣어요',
    emoji: '🧺',
    color: COLORS.orange,
    benefit: '인지 유연성',
  },
];

export default function GameIndexScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { currentDifficulty, totalFruits, gameHistory } = useGameStore();

  const totalFruitCount = totalFruits;
  const todayGames = gameHistory.filter(
    (g) => new Date(g.startedAt).toDateString() === new Date().toDateString()
  ).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>두뇌 운동</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 오늘의 현황 */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🎮</Text>
            <Text style={styles.statValue}>{todayGames}</Text>
            <Text style={styles.statLabel}>오늘 플레이</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>🍎</Text>
            <Text style={styles.statValue}>{totalFruitCount}</Text>
            <Text style={styles.statLabel}>총 수확</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statEmoji}>⭐</Text>
            <Text style={styles.statValue}>{currentDifficulty}</Text>
            <Text style={styles.statLabel}>난이도</Text>
          </View>
        </View>

        {/* 게임 목록 */}
        <View style={styles.section}>
          <SectionHeader title="게임 선택" />
          <View style={styles.gameList}>
            {GAMES.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[styles.gameCard, { backgroundColor: game.color }]}
                onPress={() => router.push(`/game/${game.id}`)}
                activeOpacity={0.8}
              >
                <View style={styles.gameCardHeader}>
                  <Text style={styles.gameEmoji}>{game.emoji}</Text>
                  <View style={styles.benefitBadge}>
                    <Text style={styles.benefitText}>{game.benefit}</Text>
                  </View>
                </View>
                <View style={styles.gameCardContent}>
                  <Text style={styles.gameTitle}>{game.title}</Text>
                  <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
                  <Text style={styles.gameDescription}>{game.description}</Text>
                </View>
                <View style={styles.gameCardFooter}>
                  <Text style={styles.playText}>플레이하기 →</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 빠른 시작 */}
        <View style={styles.quickStart}>
          <Text style={styles.quickStartText}>
            어떤 게임을 할지 모르겠다면?
          </Text>
          <FruitButton
            variant="greenApple"
            label="랜덤 게임 시작"
            size="large"
            onPress={() => {
              const randomGame = GAMES[Math.floor(Math.random() * GAMES.length)];
              router.push(`/game/${randomGame.id}`);
            }}
          />
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: LAYOUT.screenPaddingHorizontal,
  },
  backButton: {
    padding: LAYOUT.spacing.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statEmoji: {
    fontSize: 28,
    marginBottom: LAYOUT.spacing.xs,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 50,
    backgroundColor: COLORS.backgroundCream,
  },
  section: {
    gap: LAYOUT.spacing.md,
  },
  gameList: {
    gap: LAYOUT.spacing.lg,
  },
  gameCard: {
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
  },
  gameCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: LAYOUT.spacing.md,
  },
  gameEmoji: {
    fontSize: 56,
  },
  benefitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.xs,
    borderRadius: LAYOUT.radius.full,
  },
  benefitText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: '600',
    color: COLORS.white,
  },
  gameCardContent: {
    marginBottom: LAYOUT.spacing.lg,
  },
  gameTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.xs,
  },
  gameSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: LAYOUT.spacing.md,
  },
  gameDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.white,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
  },
  gameCardFooter: {
    alignItems: 'flex-end',
  },
  playText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  quickStart: {
    alignItems: 'center',
    gap: LAYOUT.spacing.md,
    padding: LAYOUT.spacing.lg,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
  },
  quickStartText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
