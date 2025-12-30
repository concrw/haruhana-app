/**
 * 크루 생성 화면
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../../constants/colors';
import { LAYOUT } from '../../constants/layout';
import { TYPOGRAPHY } from '../../constants/typography';
import { CREW_TEXTS, CREW_GOALS, CREW_LIMITS } from '../../constants/crew';
import { Header } from '../../components/layout/Header';
import { FruitButton } from '../../components/common/FruitButton';
import { useCrewStore } from '../../stores/crewStore';
import { useAuthStore } from '../../stores/authStore';
import { crewService } from '../../services/crew.service';
import type { CrewGoalType } from '../../types/crew';

export default function CreateCrewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { createCrew, isLoading } = useCrewStore();

  const [step, setStep] = useState<'name' | 'goal' | 'invite'>('name');
  const [crewName, setCrewName] = useState('');
  const [description, setDescription] = useState('');
  const [goalType, setGoalType] = useState<CrewGoalType>('continuous');
  const [customGoal, setCustomGoal] = useState('');
  const [invitePhones, setInvitePhones] = useState<string[]>(['']);

  const handleNextStep = () => {
    if (step === 'name') {
      const validation = crewService.validateCrewName(crewName);
      if (!validation.valid) {
        Alert.alert('알림', validation.error || '크루 이름을 확인해주세요');
        return;
      }
      setStep('goal');
    } else if (step === 'goal') {
      setStep('invite');
    }
  };

  const handlePrevStep = () => {
    if (step === 'goal') {
      setStep('name');
    } else if (step === 'invite') {
      setStep('goal');
    } else {
      router.back();
    }
  };

  const handleCreate = async () => {
    if (!user?.id) return;

    // 유효한 전화번호만 필터링
    const validPhones = invitePhones.filter((phone) =>
      crewService.validatePhoneNumber(phone)
    );

    if (invitePhones.filter((p) => p.trim()).length < CREW_LIMITS.minMembers - 1) {
      Alert.alert(
        '알림',
        `크루를 만들려면 최소 ${CREW_LIMITS.minMembers - 1}명의 친구를 초대해야 해요`
      );
      return;
    }

    try {
      const goalValue = goalType === 'custom' ? parseInt(customGoal, 10) || undefined : CREW_GOALS[goalType].value ?? undefined;

      const inviteCode = await createCrew({
        name: crewName.trim(),
        description: description.trim() || undefined,
        goalType,
        goalValue,
      });

      if (inviteCode) {
        // TODO: 초대 문자/카카오톡 발송
        Alert.alert(
          '크루 생성 완료!',
          `초대 코드: ${inviteCode}\n\n친구들에게 초대 코드를 공유해주세요!`,
          [{ text: '확인', onPress: () => router.replace('/crew') }]
        );
      }
    } catch (error) {
      Alert.alert('오류', '크루 생성에 실패했어요. 다시 시도해주세요.');
    }
  };

  const addPhoneField = () => {
    if (invitePhones.length < CREW_LIMITS.maxMembers - 1) {
      setInvitePhones([...invitePhones, '']);
    }
  };

  const updatePhone = (index: number, value: string) => {
    const updated = [...invitePhones];
    updated[index] = value;
    setInvitePhones(updated);
  };

  const removePhone = (index: number) => {
    if (invitePhones.length > 1) {
      setInvitePhones(invitePhones.filter((_, i) => i !== index));
    }
  };

  const renderNameStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>크루 이름을 정해주세요</Text>
      <Text style={styles.stepDescription}>
        함께할 친구들과 어울리는{'\n'}
        이름을 지어주세요
      </Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>크루 이름</Text>
        <TextInput
          style={styles.input}
          placeholder={CREW_TEXTS.create.namePlaceholder}
          placeholderTextColor={COLORS.textLight}
          value={crewName}
          onChangeText={setCrewName}
          maxLength={CREW_LIMITS.nameMaxLength}
        />
        <Text style={styles.hint}>{crewName.length}/{CREW_LIMITS.nameMaxLength}</Text>
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>크루 소개 (선택)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder={CREW_TEXTS.create.descriptionPlaceholder}
          placeholderTextColor={COLORS.textLight}
          value={description}
          onChangeText={setDescription}
          maxLength={CREW_LIMITS.descriptionMaxLength}
          multiline
          numberOfLines={3}
        />
      </View>
    </View>
  );

  const renderGoalStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>크루 목표를 선택하세요</Text>
      <Text style={styles.stepDescription}>
        함께 달성할 목표를 정해보세요
      </Text>

      <View style={styles.goalOptions}>
        {(Object.keys(CREW_GOALS) as CrewGoalType[]).map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.goalOption, goalType === type && styles.goalOptionSelected]}
            onPress={() => setGoalType(type)}
          >
            <Text style={[styles.goalLabel, goalType === type && styles.goalLabelSelected]}>
              {CREW_GOALS[type].label}
            </Text>
            <Text style={styles.goalDescription}>{CREW_GOALS[type].description}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {goalType === 'custom' && (
        <View style={styles.inputGroup}>
          <Text style={styles.label}>목표 값</Text>
          <TextInput
            style={styles.input}
            placeholder="예: 100"
            placeholderTextColor={COLORS.textLight}
            value={customGoal}
            onChangeText={setCustomGoal}
            keyboardType="number-pad"
          />
        </View>
      )}
    </View>
  );

  const renderInviteStep = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>친구를 초대하세요</Text>
      <Text style={styles.stepDescription}>
        최소 {CREW_LIMITS.minMembers - 1}명의 친구를 초대해야{'\n'}
        크루를 만들 수 있어요
      </Text>

      <View style={styles.phoneList}>
        {invitePhones.map((phone, index) => (
          <View key={index} style={styles.phoneInputRow}>
            <TextInput
              style={styles.phoneInput}
              placeholder="전화번호 입력"
              placeholderTextColor={COLORS.textLight}
              value={phone}
              onChangeText={(value) => updatePhone(index, value)}
              keyboardType="phone-pad"
              maxLength={13}
            />
            {invitePhones.length > 1 && (
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removePhone(index)}
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {invitePhones.length < CREW_LIMITS.maxMembers - 1 && (
        <TouchableOpacity style={styles.addButton} onPress={addPhoneField}>
          <Text style={styles.addButtonText}>+ 친구 추가</Text>
        </TouchableOpacity>
      )}

      <Text style={styles.inviteHint}>
        * 초대받은 친구들에게 초대 코드가 전송됩니다
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={{ paddingTop: insets.top }}>
        <Header title={CREW_TEXTS.create.title} showBack onBack={handlePrevStep} />
      </View>

      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: step === 'name' ? '33%' : step === 'goal' ? '66%' : '100%' },
          ]}
        />
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {step === 'name' && renderNameStep()}
        {step === 'goal' && renderGoalStep()}
        {step === 'invite' && renderInviteStep()}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        {step === 'invite' ? (
          <FruitButton
            variant="apple"
            label="크루 만들기"
            size="large"
            onPress={handleCreate}
            disabled={isLoading}
          />
        ) : (
          <FruitButton
            variant="orange"
            label="다음"
            size="large"
            onPress={handleNextStep}
            disabled={step === 'name' && !crewName.trim()}
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
  progressBar: {
    height: 4,
    backgroundColor: COLORS.backgroundLight,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
  stepContent: {
    paddingTop: LAYOUT.spacing.xl,
  },
  stepTitle: {
    fontSize: TYPOGRAPHY.fontSize.xxl,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.md,
  },
  stepDescription: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textGray,
    lineHeight: TYPOGRAPHY.fontSize.lg * 1.5,
    marginBottom: LAYOUT.spacing.xxl,
  },
  inputGroup: {
    marginBottom: LAYOUT.spacing.xl,
  },
  label: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.sm,
  },
  input: {
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'right',
    marginTop: LAYOUT.spacing.xs,
  },
  goalOptions: {
    gap: LAYOUT.spacing.md,
  },
  goalOption: {
    backgroundColor: COLORS.white,
    padding: LAYOUT.spacing.lg,
    borderRadius: LAYOUT.radius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  goalOptionSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  goalLabel: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: '600',
    color: COLORS.textDark,
    marginBottom: LAYOUT.spacing.xs,
  },
  goalLabelSelected: {
    color: COLORS.textDark,
  },
  goalDescription: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
  },
  phoneList: {
    gap: LAYOUT.spacing.md,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LAYOUT.spacing.sm,
  },
  phoneInput: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: LAYOUT.radius.lg,
    padding: LAYOUT.spacing.lg,
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.textDark,
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    fontSize: 18,
    color: COLORS.textGray,
  },
  addButton: {
    marginTop: LAYOUT.spacing.lg,
    paddingVertical: LAYOUT.spacing.md,
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    color: COLORS.grape,
    fontWeight: '600',
  },
  inviteHint: {
    marginTop: LAYOUT.spacing.xl,
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.textGray,
    textAlign: 'center',
  },
  footer: {
    padding: LAYOUT.screenPaddingHorizontal,
  },
});
