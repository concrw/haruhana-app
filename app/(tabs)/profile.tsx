import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { Header, SectionHeader } from '../../components/layout/Header';
import { StreakBanner, FruitCollectionCard } from '../../components/cards/RewardCard';
import { FruitButton } from '../../components/common/FruitButton';
import { useAuthStore } from '../../stores/authStore';
import { useRitualStore } from '../../stores/ritualStore';
import { useGameStore } from '../../stores/gameStore';
import { useSettingsStore } from '../../stores/settingsStore';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const { currentStreak, userRituals } = useRitualStore();
  const { totalFruits, gameHistory } = useGameStore();
  const settingsStore = useSettingsStore();

  const totalGames = gameHistory.length;
  const totalFruitCount = totalFruits;

  // Settings에서 필요한 값들 가져오기
  const settings = {
    notificationsEnabled: settingsStore.notificationsEnabled,
    soundEnabled: settingsStore.soundEnabled,
    hapticFeedbackEnabled: settingsStore.hapticFeedbackEnabled,
    fontSize: settingsStore.fontSize,
  };

  const updateSettings = (data: { soundEnabled?: boolean; hapticFeedbackEnabled?: boolean }) => {
    if (data.soundEnabled !== undefined) {
      settingsStore.setSoundEnabled(data.soundEnabled);
    }
    if (data.hapticFeedbackEnabled !== undefined) {
      settingsStore.setHapticFeedbackEnabled(data.hapticFeedbackEnabled);
    }
  };

  // 과일 컬렉션 데이터 (mock)
  const fruitCollection = {
    apple: Math.floor(totalFruits / 5),
    orange: Math.floor(totalFruits / 5),
    lemon: Math.floor(totalFruits / 5),
    grape: Math.floor(totalFruits / 5),
    greenApple: totalFruits - Math.floor(totalFruits / 5) * 4,
  };

  const handleLogout = () => {
    Alert.alert(
      '로그아웃',
      '정말 로그아웃 하시겠어요?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '로그아웃',
          style: 'destructive',
          onPress: () => {
            logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    label,
    value,
    onPress,
  }: {
    icon: string;
    label: string;
    value?: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={styles.settingIcon}>{icon}</Text>
      <Text style={styles.settingLabel}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Text style={styles.settingArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="내 정보" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 프로필 카드 */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👵</Text>
          </View>
          <Text style={styles.userName}>{user?.name || '사용자'}</Text>
          <Text style={styles.userEmail}>{user?.email}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentStreak}</Text>
              <Text style={styles.statLabel}>연속 일수</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userRituals.length}</Text>
              <Text style={styles.statLabel}>나의 의식</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{totalFruitCount}</Text>
              <Text style={styles.statLabel}>수확 과일</Text>
            </View>
          </View>
        </View>

        {/* 스트릭 배너 */}
        {currentStreak > 0 && (
          <StreakBanner
            currentStreak={currentStreak}
            longestStreak={currentStreak}
          />
        )}

        {/* 과일 컬렉션 */}
        <View style={styles.section}>
          <SectionHeader title="과일 컬렉션" />
          <FruitCollectionCard fruits={fruitCollection} totalFruits={totalFruitCount} />
        </View>

        {/* 의식 관리 */}
        <View style={styles.section}>
          <SectionHeader
            title="나의 의식"
            actionText="관리"
            onAction={() => router.push('/profile/rituals')}
          />
          <View style={styles.ritualSummary}>
            <Text style={styles.ritualSummaryText}>
              {userRituals.length > 0
                ? `${userRituals.length}개의 의식을 실천하고 있어요`
                : '아직 설정한 의식이 없어요'}
            </Text>
            <FruitButton
              variant="greenApple"
              label={userRituals.length > 0 ? '의식 관리하기' : '의식 추가하기'}
              size="medium"
              onPress={() => router.push('/profile/rituals')}
            />
          </View>
        </View>

        {/* 크루 & 구독 */}
        <View style={styles.section}>
          <SectionHeader title="크루 & 구독" />
          <View style={styles.settingsCard}>
            <SettingItem
              icon="👥"
              label="내 크루"
              onPress={() => router.push('/crew')}
            />
            <SettingItem
              icon="✨"
              label="구독 관리"
              onPress={() => router.push('/subscription')}
            />
            <SettingItem
              icon="🎁"
              label="받은 선물"
              onPress={() => router.push('/subscription/received')}
            />
          </View>
        </View>

        {/* 설정 */}
        <View style={styles.section}>
          <SectionHeader title="설정" />
          <View style={styles.settingsCard}>
            <SettingItem
              icon="🔔"
              label="알림 설정"
              value={settings.notificationsEnabled ? '켜짐' : '꺼짐'}
              onPress={() => {}}
            />
            <SettingItem
              icon="🔊"
              label="소리 설정"
              value={settings.soundEnabled ? '켜짐' : '꺼짐'}
              onPress={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            />
            <SettingItem
              icon="📱"
              label="진동 설정"
              value={settings.hapticFeedbackEnabled ? '켜짐' : '꺼짐'}
              onPress={() => updateSettings({ hapticFeedbackEnabled: !settings.hapticFeedbackEnabled })}
            />
            <SettingItem
              icon="🔤"
              label="글자 크기"
              value={settings.fontSize === 'large' ? '크게' : settings.fontSize === 'xlarge' ? '아주 크게' : '보통'}
              onPress={() => {}}
            />
          </View>
        </View>

        {/* 기타 */}
        <View style={styles.section}>
          <SectionHeader title="기타" />
          <View style={styles.settingsCard}>
            <SettingItem
              icon="❓"
              label="도움말"
              onPress={() => router.push('/profile/help')}
            />
            <SettingItem
              icon="📞"
              label="고객센터"
              onPress={() => router.push('/profile/support')}
            />
            <SettingItem
              icon="📋"
              label="이용약관"
              onPress={() => router.push('/profile/terms')}
            />
            <SettingItem
              icon="🔒"
              label="개인정보처리방침"
              onPress={() => router.push('/profile/privacy')}
            />
            <SettingItem
              icon="ℹ️"
              label="앱 정보"
              value="v1.0.0"
              onPress={() => router.push('/profile/about')}
            />
          </View>
        </View>

        {/* 로그아웃 */}
        <View style={styles.logoutSection}>
          <FruitButton
            variant="lemon"
            label="로그아웃"
            size="large"
            onPress={handleLogout}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.backgroundCream,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: LAYOUT.spacing.md,
  },
  avatarEmoji: {
    fontSize: 56,
  },
  userName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginBottom: LAYOUT.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: LAYOUT.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundCream,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: '700',
    color: COLORS.greenApple,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    marginTop: LAYOUT.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.backgroundCream,
  },
  section: {
    gap: LAYOUT.spacing.md,
  },
  ritualSummary: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
    gap: LAYOUT.spacing.lg,
  },
  ritualSummaryText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.backgroundCream,
    minHeight: LAYOUT.buttonHeight.large,
  },
  settingIcon: {
    fontSize: 24,
    marginRight: LAYOUT.spacing.md,
  },
  settingLabel: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  settingValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  settingArrow: {
    fontSize: 24,
    color: COLORS.textLight,
  },
  logoutSection: {
    alignItems: 'center',
    paddingTop: LAYOUT.spacing.lg,
  },
});
