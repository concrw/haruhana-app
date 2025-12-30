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
import { useAuthStore } from '../../stores/authStore';

export default function CreateFamilyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { createFamily, isLoading } = useFamilyStore();
  const { user } = useAuthStore();

  const [familyName, setFamilyName] = useState('');

  const handleCreate = async () => {
    if (!familyName.trim()) {
      Alert.alert('알림', '가족 이름을 입력해주세요');
      return;
    }

    try {
      await createFamily(familyName, user?.id || '');
      Alert.alert('완료', '가족이 생성되었어요!', [
        { text: '확인', onPress: () => router.back() },
      ]);
    } catch (error) {
      Alert.alert('오류', '가족 생성에 실패했어요. 다시 시도해주세요.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }}>
        <Header title="가족 만들기" showBack onBack={() => router.back()} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>👨‍👩‍👧‍👦</Text>
        </View>

        <Text style={styles.title}>새로운 가족을 만들어요</Text>
        <Text style={styles.description}>
          가족 이름을 정하면{'\n'}
          초대 코드가 생성돼요
        </Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>가족 이름</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 행복한 우리 가족"
            placeholderTextColor={COLORS.textLight}
            value={familyName}
            onChangeText={setFamilyName}
            maxLength={20}
          />
          <Text style={styles.hint}>{familyName.length}/20</Text>
        </View>
      </View>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        <FruitButton
          variant="apple"
          label="가족 만들기"
          size="large"
          onPress={handleCreate}
          disabled={isLoading || !familyName.trim()}
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
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textBlack,
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'right',
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
