import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
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
import { FruitButton } from '../../components/common/FruitButton';
import { Header } from '../../components/layout/Header';
import { useFamilyStore } from '../../stores/familyStore';
import { useAuthStore } from '../../stores/authStore';

const QUICK_MESSAGES = [
  { emoji: '💪', text: '오늘도 화이팅!' },
  { emoji: '❤️', text: '사랑해요!' },
  { emoji: '🌸', text: '오늘 하루도 행복하세요' },
  { emoji: '👏', text: '잘하고 있어요!' },
  { emoji: '🌞', text: '좋은 아침이에요!' },
  { emoji: '😊', text: '항상 응원해요!' },
  { emoji: '🙏', text: '건강하세요!' },
  { emoji: '🌈', text: '좋은 일만 가득하길!' },
];

export default function SendEncouragementScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { familyMembers, sendEncouragement, isLoading } = useFamilyStore();

  const [selectedMember, setSelectedMember] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  // 시니어 멤버만 필터링 (응원을 받을 수 있는 대상)
  const seniorMembers = familyMembers.filter(
    (m) => (m.role || m.user?.role) === 'senior' && m.userId !== user?.id
  );

  const handleQuickMessage = (quickMessage: typeof QUICK_MESSAGES[0]) => {
    setMessage(`${quickMessage.emoji} ${quickMessage.text}`);
  };

  const handleSend = async () => {
    if (!selectedMember) {
      Alert.alert('알림', '응원을 보낼 가족을 선택해주세요');
      return;
    }
    if (!message.trim()) {
      Alert.alert('알림', '메시지를 입력해주세요');
      return;
    }

    try {
      await sendEncouragement({
        fromUserId: user?.id || '',
        toUserId: selectedMember,
        familyId: user?.familyId || '',
        type: 'text',
        content: message,
      });
      Alert.alert('완료', '응원 메시지를 보냈어요! 💌', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('오류', '메시지 전송에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Header title="응원 보내기" showBack onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 받는 사람 선택 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>누구에게 보낼까요?</Text>
          <View style={styles.memberList}>
            {seniorMembers.length === 0 ? (
              <View style={styles.emptyMembers}>
                <Text style={styles.emptyText}>
                  응원을 보낼 가족이 없어요
                </Text>
              </View>
            ) : (
              seniorMembers.map((member) => (
                <TouchableOpacity
                  key={member.id}
                  style={[
                    styles.memberItem,
                    selectedMember === member.userId && styles.memberItemSelected,
                  ]}
                  onPress={() => setSelectedMember(member.userId)}
                >
                  <Text style={styles.memberEmoji}>👵</Text>
                  <Text
                    style={[
                      styles.memberName,
                      selectedMember === member.userId && styles.memberNameSelected,
                    ]}
                  >
                    {member.nickname || member.user?.name || '가족'}
                  </Text>
                  {selectedMember === member.userId && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        {/* 빠른 메시지 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>빠른 메시지</Text>
          <View style={styles.quickMessageGrid}>
            {QUICK_MESSAGES.map((quick, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickMessageItem}
                onPress={() => handleQuickMessage(quick)}
              >
                <Text style={styles.quickEmoji}>{quick.emoji}</Text>
                <Text style={styles.quickText}>{quick.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 직접 입력 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>직접 입력하기</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="따뜻한 응원 메시지를 입력해주세요"
            placeholderTextColor={COLORS.textLight}
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{message.length}/200</Text>
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="orange"
          label="응원 보내기 💌"
          size="large"
          onPress={handleSend}
          disabled={isLoading || !selectedMember || !message.trim()}
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
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.xl,
  },
  section: {
    gap: LAYOUT.spacing.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  memberList: {
    gap: LAYOUT.spacing.sm,
  },
  emptyMembers: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.xl,
    borderRadius: LAYOUT.radius.lg,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  memberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.md,
  },
  memberItemSelected: {
    backgroundColor: COLORS.orangeLight,
    borderWidth: 2,
    borderColor: COLORS.orange,
  },
  memberEmoji: {
    fontSize: 32,
  },
  memberName: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
  },
  memberNameSelected: {
    fontWeight: '600',
    color: COLORS.orange,
  },
  checkmark: {
    fontSize: 20,
    color: COLORS.orange,
    fontWeight: '700',
  },
  quickMessageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: LAYOUT.spacing.sm,
  },
  quickMessageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: LAYOUT.spacing.md,
    paddingVertical: LAYOUT.spacing.sm,
    borderRadius: LAYOUT.radius.full,
    gap: LAYOUT.spacing.xs,
  },
  quickEmoji: {
    fontSize: 16,
  },
  quickText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textBlack,
  },
  messageInput: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'right',
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
