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
import { FRUITS } from '../../constants/fruits';
import { Header, SectionHeader } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useGameStore } from '../../stores/gameStore';
import { useAuthStore } from '../../stores/authStore';

const GAME_INFO = {
  'go-nogo': {
    title: '과일 수확하기',
    description: '맞는 과일만 골라서 터치해요',
    icon: '🍎',
    color: COLORS.apple,
  },
  'nback': {
    title: '기억력 게임',
    description: 'N번 전 과일을 기억해요',
    icon: '🧠',
    color: COLORS.grape,
  },
  'task-switch': {
    title: '분류하기',
    description: '규칙에 따라 과일을 분류해요',
    icon: '🧺',
    color: COLORS.orange,
  },
};

export default function OrchardScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { totalFruits, gameHistory } = useGameStore();

  const getTodayGames = () => {
    const today = new Date().toDateString();
    return gameHistory.filter(
      (game) => new Date(game.startedAt).toDateString() === today
    );
  };

  const todayGames = getTodayGames();

  // 과일별 개수 (mock data)
  const fruitCounts = {
    apple: Math.floor(totalFruits / 5),
    orange: Math.floor(totalFruits / 5),
    lemon: Math.floor(totalFruits / 5),
    grape: Math.floor(totalFruits / 5),
    greenApple: totalFruits - Math.floor(totalFruits / 5) * 4,
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="과수원" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 과일 수확 현황 */}
        <View style={styles.harvestCard}>
          <Text style={styles.harvestTitle}>내 과수원</Text>
          <View style={styles.fruitStats}>
            {Object.entries(FRUITS).map(([key, fruit]) => (
              <View key={key} style={styles.fruitItem}>
                <Text style={styles.fruitEmoji}>{fruit.emoji}</Text>
                <Text style={styles.fruitCount}>
                  {fruitCounts[key as keyof typeof fruitCounts] || 0}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.totalFruits}>
            총 {totalFruits}개 수확
          </Text>
        </View>

        {/* 오늘의 게임 현황 */}
        <View style={styles.section}>
          <SectionHeader
            title="오늘의 두뇌 운동"
            actionText={`${todayGames.length}회 완료`}
          />

          <View style={styles.todayProgress}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressNumber}>{todayGames.length}</Text>
              <Text style={styles.progressLabel}>오늘</Text>
            </View>
            <View style={styles.progressInfo}>
              <Text style={styles.progressText}>
                {todayGames.length === 0
                  ? '아직 오늘의 두뇌 운동을 하지 않았어요'
                  : todayGames.length < 3
                  ? '조금 더 운동하면 좋아요!'
                  : '오늘도 열심히 했어요! 👏'}
              </Text>
              <Text style={styles.recommendText}>
                하루 3회 권장
              </Text>
            </View>
          </View>
        </View>

        {/* 게임 선택 */}
        <View style={styles.section}>
          <SectionHeader title="게임 선택" />

          <View style={styles.gameList}>
            {Object.entries(GAME_INFO).map(([gameType, info]) => (
              <TouchableOpacity
                key={gameType}
                style={[styles.gameCard, { backgroundColor: info.color }]}
                onPress={() => router.push(`/game/${gameType}`)}
                activeOpacity={0.8}
              >
                <Text style={styles.gameIcon}>{info.icon}</Text>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameTitle}>{info.title}</Text>
                  <Text style={styles.gameDescription}>{info.description}</Text>
                </View>
                <Text style={styles.gameArrow}>→</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 빠른 시작 */}
        <View style={styles.section}>
          <SectionHeader title="빠른 시작" />
          <View style={styles.quickStart}>
            <FruitButton
              variant="apple"
              label="랜덤 게임 시작"
              size="large"
              onPress={() => {
                const games = Object.keys(GAME_INFO);
                const randomGame = games[Math.floor(Math.random() * games.length)];
                router.push(`/game/${randomGame}`);
              }}
            />
          </View>
        </View>

        {/* 하단 여백 */}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  harvestCard: {
    backgroundColor: COLORS.greenApple,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
  },
  harvestTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.lg,
  },
  fruitStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: LAYOUT.spacing.md,
  },
  fruitItem: {
    alignItems: 'center',
  },
  fruitEmoji: {
    fontSize: 36,
    marginBottom: LAYOUT.spacing.xs,
  },
  fruitCount: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.white,
  },
  totalFruits: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  section: {
    gap: LAYOUT.spacing.md,
  },
  todayProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.lg,
    gap: LAYOUT.spacing.lg,
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.backgroundCream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNumber: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: '700',
    color: COLORS.greenApple,
  },
  progressLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  progressInfo: {
    flex: 1,
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.xs,
  },
  recommendText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  gameList: {
    gap: LAYOUT.spacing.md,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.xl,
    gap: LAYOUT.spacing.md,
  },
  gameIcon: {
    fontSize: 48,
  },
  gameInfo: {
    flex: 1,
  },
  gameTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: '600',
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.xs,
  },
  gameDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
  },
  gameArrow: {
    fontSize: 28,
    color: COLORS.white,
  },
  quickStart: {
    alignItems: 'center',
  },
});
