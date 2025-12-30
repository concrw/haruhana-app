import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { Header, SectionHeader } from '../../components/layout/Header';
import { EncouragementCard } from '../../components/cards/EncouragementCard';
import { FamilyMemberCard } from '../../components/cards/FamilyCard';
import { FruitButton } from '../../components/common/FruitButton';
import { useAuthStore } from '../../stores/authStore';
import { useFamilyStore } from '../../stores/familyStore';

export default function FamilyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    family,
    familyMembers,
    encouragements,
    fetchFamily,
    fetchFamilyMembers,
    fetchEncouragements,
    isLoading,
  } = useFamilyStore();

  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (user?.id) {
      await Promise.all([
        fetchFamily(user.familyId || ''),
        fetchFamilyMembers(user.familyId || ''),
        fetchEncouragements(user.id),
      ]);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const unreadCount = encouragements.filter((e) => !e.isRead).length;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="가족"
        rightElement={
          unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          )
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* 가족이 없는 경우 */}
        {!family && (
          <View style={styles.emptyFamily}>
            <Text style={styles.emptyIcon}>👨‍👩‍👧‍👦</Text>
            <Text style={styles.emptyTitle}>가족과 함께해요</Text>
            <Text style={styles.emptyText}>
              가족을 초대하면 서로 응원 메시지를{'\n'}
              주고받을 수 있어요
            </Text>
            <FruitButton
              variant="apple"
              label="가족 만들기"
              size="medium"
              onPress={() => router.push('/family/create')}
            />
            <TouchableOpacity
              style={styles.joinButton}
              onPress={() => router.push('/family/join')}
            >
              <Text style={styles.joinButtonText}>초대 코드로 참여하기</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 가족이 있는 경우 */}
        {family && (
          <>
            {/* 가족 정보 */}
            <View style={styles.familyCard}>
              <Text style={styles.familyName}>{family.name}</Text>
              <Text style={styles.familyCode}>
                초대 코드: {family.inviteCode}
              </Text>
              <View style={styles.memberAvatars}>
                {familyMembers.slice(0, 5).map((member, index) => (
                  <View
                    key={member.id}
                    style={[
                      styles.memberAvatar,
                      { marginLeft: index > 0 ? -12 : 0 },
                    ]}
                  >
                    <Text style={styles.avatarEmoji}>
                      {(member.role || member.user?.role) === 'senior' ? '👵' : '👨'}
                    </Text>
                  </View>
                ))}
                {familyMembers.length > 5 && (
                  <View style={[styles.memberAvatar, { marginLeft: -12 }]}>
                    <Text style={styles.moreCount}>
                      +{familyMembers.length - 5}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* 가족 구성원 */}
            <View style={styles.section}>
              <SectionHeader
                title="가족 구성원"
                actionText="관리"
                onAction={() => router.push('/family/manage')}
              />
              <View style={styles.memberList}>
                {familyMembers.map((member) => (
                  <FamilyMemberCard
                    key={member.id}
                    member={member}
                    onPress={() =>
                      router.push({
                        pathname: '/family/member/[id]',
                        params: { id: member.id },
                      })
                    }
                  />
                ))}
              </View>
            </View>

            {/* 응원 메시지 */}
            <View style={styles.section}>
              <SectionHeader
                title="응원 메시지"
                actionText={unreadCount > 0 ? `${unreadCount}개 새 메시지` : undefined}
              />

              {encouragements.length === 0 ? (
                <View style={styles.emptyEncouragements}>
                  <Text style={styles.emptyEncouragementIcon}>💌</Text>
                  <Text style={styles.emptyEncouragementText}>
                    아직 응원 메시지가 없어요
                  </Text>
                </View>
              ) : (
                <View style={styles.encouragementList}>
                  {encouragements.slice(0, 5).map((encouragement) => (
                    <EncouragementCard
                      key={encouragement.id}
                      encouragement={encouragement}
                      showSender
                    />
                  ))}
                </View>
              )}

              {encouragements.length > 5 && (
                <TouchableOpacity
                  style={styles.viewMoreButton}
                  onPress={() => router.push('/family/messages')}
                >
                  <Text style={styles.viewMoreText}>
                    더 보기 ({encouragements.length - 5}개)
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 응원 보내기 버튼 */}
            <View style={styles.sendSection}>
              <FruitButton
                variant="orange"
                label="응원 메시지 보내기"
                size="large"
                onPress={() => router.push('/family/send')}
              />
            </View>
          </>
        )}

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
  badge: {
    backgroundColor: COLORS.apple,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  emptyFamily: {
    alignItems: 'center',
    padding: LAYOUT.spacing.xxl,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: LAYOUT.spacing.lg,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textAlign: 'center',
    marginBottom: LAYOUT.spacing.xl,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
  },
  joinButton: {
    marginTop: LAYOUT.spacing.md,
    padding: LAYOUT.spacing.md,
  },
  joinButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.grape,
    textDecorationLine: 'underline',
  },
  familyCard: {
    backgroundColor: COLORS.grape,
    borderRadius: LAYOUT.radius.xl,
    padding: LAYOUT.spacing.xl,
    alignItems: 'center',
  },
  familyName: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: LAYOUT.spacing.sm,
  },
  familyCode: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.white,
    opacity: 0.9,
    marginBottom: LAYOUT.spacing.lg,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.grape,
  },
  avatarEmoji: {
    fontSize: 24,
  },
  moreCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: '600',
    color: COLORS.grape,
  },
  section: {
    gap: LAYOUT.spacing.md,
  },
  memberList: {
    gap: LAYOUT.spacing.md,
  },
  encouragementList: {
    gap: LAYOUT.spacing.md,
  },
  emptyEncouragements: {
    alignItems: 'center',
    padding: LAYOUT.spacing.xl,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.xl,
  },
  emptyEncouragementIcon: {
    fontSize: 48,
    marginBottom: LAYOUT.spacing.md,
  },
  emptyEncouragementText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  viewMoreButton: {
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
  },
  viewMoreText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.grape,
  },
  sendSection: {
    alignItems: 'center',
  },
});
