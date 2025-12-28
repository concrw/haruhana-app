import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
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
import { useAuthStore } from '../../stores/authStore';

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요');
      return;
    }
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요');
      return;
    }

    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('로그인 실패', '이메일 또는 비밀번호를 확인해주세요');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 로고 및 환영 메시지 */}
        <View style={styles.header}>
          <Text style={styles.logo}>🌸</Text>
          <Text style={styles.title}>하루하나</Text>
          <Text style={styles.subtitle}>
            매일 작은 의식으로{'\n'}건강한 하루를 시작해요
          </Text>
        </View>

        {/* 입력 폼 */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>이메일</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor={COLORS.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>비밀번호</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="비밀번호를 입력해주세요"
                placeholderTextColor={COLORS.textLight}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                style={styles.showPasswordButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.showPasswordText}>
                  {showPassword ? '숨기기' : '보기'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <FruitButton
            variant="apple"
            label="로그인"
            size="large"
            onPress={handleLogin}
            disabled={isLoading}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push('/auth/forgot-password')}
          >
            <Text style={styles.forgotPasswordText}>비밀번호를 잊으셨나요?</Text>
          </TouchableOpacity>
        </View>

        {/* 회원가입 안내 */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>아직 계정이 없으신가요?</Text>
          <TouchableOpacity onPress={() => router.push('/auth/register')}>
            <Text style={styles.registerLink}>회원가입</Text>
          </TouchableOpacity>
        </View>

        {/* 도움말 */}
        <TouchableOpacity
          style={styles.helpButton}
          onPress={() => Alert.alert('도움이 필요하신가요?', '고객센터: 1588-0000')}
        >
          <Text style={styles.helpText}>❓ 도움이 필요하신가요?</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  scrollContent: {
    flexGrow: 1,
    padding: LAYOUT.screenPaddingHorizontal,
  },
  header: {
    alignItems: 'center',
    marginBottom: LAYOUT.spacing.xxl,
  },
  logo: {
    fontSize: 80,
    marginBottom: LAYOUT.spacing.md,
  },
  title: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.sm,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
    textAlign: 'center',
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.5,
  },
  form: {
    gap: LAYOUT.spacing.lg,
    marginBottom: LAYOUT.spacing.xxl,
  },
  inputGroup: {
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
    minHeight: LAYOUT.buttonHeight.large,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 80,
  },
  showPasswordButton: {
    position: 'absolute',
    right: LAYOUT.spacing.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  showPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.grape,
    fontWeight: '600',
  },
  forgotPassword: {
    alignItems: 'center',
    padding: LAYOUT.spacing.md,
  },
  forgotPasswordText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    textDecorationLine: 'underline',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.xl,
  },
  footerText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  registerLink: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '700',
    color: COLORS.grape,
  },
  helpButton: {
    alignItems: 'center',
    padding: LAYOUT.spacing.lg,
  },
  helpText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
});
