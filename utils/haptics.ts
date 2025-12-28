import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

// 햅틱 피드백 타입별 함수
export const hapticLight = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }
};

export const hapticMedium = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  }
};

export const hapticHeavy = () => {
  if (Platform.OS !== 'web') {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }
};

export const hapticSuccess = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }
};

export const hapticWarning = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  }
};

export const hapticError = () => {
  if (Platform.OS !== 'web') {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }
};

export const hapticSelection = () => {
  if (Platform.OS !== 'web') {
    Haptics.selectionAsync();
  }
};

// 게임 특화 햅틱
export const hapticCorrectAnswer = () => {
  hapticSuccess();
};

export const hapticWrongAnswer = () => {
  hapticError();
};

export const hapticButtonPress = () => {
  hapticLight();
};

export const hapticRitualComplete = () => {
  // 연속된 햅틱으로 축하 표현
  setTimeout(() => hapticMedium(), 0);
  setTimeout(() => hapticMedium(), 100);
  setTimeout(() => hapticSuccess(), 200);
};

export const hapticLevelUp = () => {
  setTimeout(() => hapticMedium(), 0);
  setTimeout(() => hapticHeavy(), 150);
};
