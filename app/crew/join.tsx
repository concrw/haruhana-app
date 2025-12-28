/**
 * 크루 참여 화면 (초대 코드 입력)
 */

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
import { INVITE_CODE_LENGTH } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';
import { crewService } from '../../services/crew.service';

export default function JoinCrewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { joinCrew, isLoading } = useCrewStore();

  const [inviteCode, setInviteCode] = useState('');

  const handleCodeChange = (text: string) => {
    // 대문자로 변환하고 영숫자만 허용
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInviteCode(cleaned.slice(0, INVITE_CODE_LENGTH));
  };

  const handleJoin = async () => {
    if (!user?.id) return;

    if (!crewService.validateInviteCode(inviteCode)) {
      Alert.alert('알림', '올바른 초대 코드를 입력해주세요');
      return;
    }

    try {
      const success = await joinCrew(inviteCode);
      if (success) {
        Alert.alert(
          '환영합니다!',
          '크루에 참여했어요!',
          [{ text: '확인', onPress: () => router.replace('/crew') }]
        );
      } else {
        Alert.alert('오류', '초대 코드를 찾을 수 없어요. 다시 확인해주세요.');
      }
    } catch (error) {
      Alert.alert('오류', '크루 참여에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }}>
        <Header title="크루 참여하기" showBack onBack={() => router.back()} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🎟️</Text>
        </View>

        <Text style={styles.title}>초대 코드 입력</Text>
        <Text style={styles.description}>
          크루장에게 받은{'\n'}
          초대 코드를 입력해주세요
        </Text>

        <View style={styles.codeInputContainer}>
          <TextInput
            style={styles.codeInput}
            value={inviteCode}
            onChangeText={handleCodeChange}
            placeholder="XXXXXX"
            placeholderTextColor={COLORS.textLight}
            maxLength={INVITE_CODE_LENGTH}
            autoCapitalize="characters"
            autoCorrect={false}
            textAlign="center"
          />
          <View style={styles.codeUnderlines}>
            {Array.from({ length: INVITE_CODE_LENGTH }).map((_, index) => (
              <View
                key={index}
                style={[
                  styles.codeUnderline,
                  inviteCode.length > index && styles.codeUnderlineActive,
                ]}
              />
            ))}
          </View>
        </View>

        <Text style={styles.hint}>
          * 초대 코드는 {INVITE_CODE_LENGTH}자리 영문/숫자입니다
        </Text>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="apple"
          label="참여하기"
          size="large"
          onPress={handleJoin}
          disabled={isLoading || inviteCode.length !== INVITE_CODE_LENGTH}
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
    color: COLORS.textDark,
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
  codeInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xl,
  },
  codeInput: {
    fontSize: TYPOGRAPHY.fontSize.xxxl,
    fontWeight: '700',
    color: COLORS.textDark,
    letterSpacing: 8,
    paddingVertical: LAYOUT.spacing.lg,
  },
  codeUnderlines: {
    flexDirection: 'row',
    gap: 12,
  },
  codeUnderline: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 2,
  },
  codeUnderlineActive: {
    backgroundColor: COLORS.primary,
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
