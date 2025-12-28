import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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

export default function JoinFamilyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { joinFamily, isLoading } = useFamilyStore();

  const [inviteCode, setInviteCode] = useState('');

  const handleJoin = async () => {
    if (!inviteCode.trim()) {
      Alert.alert('알림', '초대 코드를 입력해주세요');
      return;
    }

    try {
      await joinFamily(inviteCode);
      Alert.alert('환영해요!', '가족에 참여했어요!', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('오류', '초대 코드가 올바르지 않아요. 다시 확인해주세요.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }}>
        <Header title="가족 참여하기" showBack onBack={() => router.back()} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔑</Text>
        </View>

        <Text style={styles.title}>초대 코드로 참여해요</Text>
        <Text style={styles.description}>
          가족에게 받은 초대 코드를{'\n'}
          입력해주세요
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>초대 코드</Text>
          <TextInput
            style={styles.input}
            placeholder="예: ABC123"
            placeholderTextColor={COLORS.textLight}
            value={inviteCode}
            onChangeText={(text) => setInviteCode(text.toUpperCase())}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

        <View style={styles.helpCard}>
          <Text style={styles.helpIcon}>💡</Text>
          <Text style={styles.helpText}>
            초대 코드는 가족 관리 화면에서 확인할 수 있어요
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="grape"
          label="참여하기"
          size="large"
          onPress={handleJoin}
          disabled={isLoading || !inviteCode.trim()}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  content: {
    flex: 1,
    padding: LAYOUT.screenPaddingHorizontal,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: LAYOUT.spacing.xxl,
    marginBottom: LAYOUT.spacing.xl,
  },
  icon: {
    fontSize: 80,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
    textAlign: 'center',
  },
  description: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.xxl,
  },
  inputGroup: {
    width: '100%',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textBlack,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.xxl,
    color: COLORS.textBlack,
    textAlign: 'center',
    letterSpacing: 4,
    fontWeight: '600',
  },
  helpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    gap: LAYOUT.spacing.md,
    width: '100%',
  },
  helpIcon: {
    fontSize: 24,
  },
  helpText: {
    flex: 1,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    lineHeight: TYPOGRAPHY.fontSize.base * 1.4,
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
