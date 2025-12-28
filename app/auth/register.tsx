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
import { StepProgressBar } from '../../components/common/ProgressBar';
import { useAuthStore } from '../../stores/authStore';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { register, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const validateStep1 = () => {
    if (!name.trim()) {
      Alert.alert('알림', '이름을 입력해주세요');
      return false;
    }
    if (name.trim().length < 2) {
      Alert.alert('알림', '이름은 2글자 이상 입력해주세요');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!email.trim()) {
      Alert.alert('알림', '이메일을 입력해주세요');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('알림', '올바른 이메일 형식을 입력해주세요');
      return false;
    }
    return true;
  };

  const validateStep3 = () => {
    if (!password.trim()) {
      Alert.alert('알림', '비밀번호를 입력해주세요');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('알림', '비밀번호는 6자 이상 입력해주세요');
      return false;
    }
    if (password !== passwordConfirm) {
      Alert.alert('알림', '비밀번호가 일치하지 않아요');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    } else if (step === 3 && validateStep3()) {
      setStep(4);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleRegister = async () => {
    try {
      await register({ name, email });
      router.replace('/auth/onboarding');
    } catch (error) {
      Alert.alert('회원가입 실패', '다시 시도해주세요');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>반가워요! 👋</Text>
            <Text style={styles.stepDescription}>
              이름을 알려주세요
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>이름</Text>
              <TextInput
                style={styles.input}
                placeholder="홍길동"
                placeholderTextColor={COLORS.textLight}
                value={name}
                onChangeText={setName}
                autoFocus
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>{name}님, 안녕하세요! 🌸</Text>
            <Text style={styles.stepDescription}>
              로그인에 사용할 이메일을 입력해주세요
            </Text>
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
                autoFocus
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>비밀번호 설정 🔐</Text>
            <Text style={styles.stepDescription}>
              안전한 비밀번호를 만들어주세요
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호</Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="6자 이상 입력해주세요"
                  placeholderTextColor={COLORS.textLight}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoFocus
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
            <View style={styles.inputGroup}>
              <Text style={styles.label}>비밀번호 확인</Text>
              <TextInput
                style={styles.input}
                placeholder="비밀번호를 다시 입력해주세요"
                placeholderTextColor={COLORS.textLight}
                value={passwordConfirm}
                onChangeText={setPasswordConfirm}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>
        );

      case 4:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>거의 다 됐어요! 🎉</Text>
            <Text style={styles.stepDescription}>
              태어난 연도를 알려주시면{'\n'}맞춤 서비스를 제공해드려요
            </Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>태어난 연도 (선택)</Text>
              <TextInput
                style={styles.input}
                placeholder="예: 1960"
                placeholderTextColor={COLORS.textLight}
                value={birthYear}
                onChangeText={setBirthYear}
                keyboardType="number-pad"
                maxLength={4}
                autoFocus
              />
            </View>
          </View>
        );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Text style={styles.backButtonText}>← 뒤로</Text>
        </TouchableOpacity>
        <StepProgressBar currentStep={step} totalSteps={4} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {renderStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step < 4 ? (
          <FruitButton
            variant="orange"
            label="다음"
            size="large"
            onPress={handleNext}
          />
        ) : (
          <FruitButton
            variant="apple"
            label="회원가입 완료"
            size="large"
            onPress={handleRegister}
            disabled={isLoading}
          />
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundCream,
  },
  header: {
    padding: LAYOUT.screenPaddingHorizontal,
    gap: LAYOUT.spacing.lg,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: LAYOUT.spacing.sm,
  },
  backButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
  },
  scrollContent: {
    flexGrow: 1,
    padding: LAYOUT.screenPaddingHorizontal,
  },
  stepContent: {
    flex: 1,
    paddingTop: LAYOUT.spacing.xl,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.hero,
    fontWeight: '700',
    color: COLORS.textBlack,
    marginBottom: LAYOUT.spacing.md,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    color: COLORS.textGray,
    lineHeight: TYPOGRAPHY.fontSize.xl * 1.5,
    marginBottom: LAYOUT.spacing.xxl,
  },
  inputGroup: {
    gap: LAYOUT.spacing.sm,
    marginBottom: LAYOUT.spacing.lg,
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
    fontSize: TYPOGRAPHY.fontSize.xl,
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
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
