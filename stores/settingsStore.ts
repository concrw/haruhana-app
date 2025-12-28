import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VoicePreference, FontSize } from '../types/user';

// Settings object type
interface Settings {
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;
  voicePreference: VoicePreference;
  soundEnabled: boolean;
  voiceGuidanceEnabled: boolean;
  hapticFeedbackEnabled: boolean;
  notificationsEnabled: boolean;
  ritualReminders: boolean;
  reminderMinutesBefore: number;
  familyNotifications: boolean;
  encouragementNotifications: boolean;
  shareActivityWithFamily: boolean;
  shareStatsWithFamily: boolean;
}

interface SettingsState {
  // Combined settings object
  settings: Settings;

  // Display settings
  fontSize: FontSize;
  highContrast: boolean;
  reduceMotion: boolean;

  // Sound settings
  voicePreference: VoicePreference;
  soundEnabled: boolean;
  voiceGuidanceEnabled: boolean;
  hapticFeedbackEnabled: boolean;

  // Notification settings
  notificationsEnabled: boolean;
  ritualReminders: boolean;
  reminderMinutesBefore: number;
  familyNotifications: boolean;
  encouragementNotifications: boolean;

  // Privacy settings
  shareActivityWithFamily: boolean;
  shareStatsWithFamily: boolean;

  // Actions
  updateSettings: (data: Partial<Settings>) => void;
  setFontSize: (size: FontSize) => void;
  setHighContrast: (enabled: boolean) => void;
  setReduceMotion: (enabled: boolean) => void;
  setVoicePreference: (preference: VoicePreference) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setVoiceGuidanceEnabled: (enabled: boolean) => void;
  setHapticFeedbackEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setRitualReminders: (enabled: boolean) => void;
  setReminderMinutesBefore: (minutes: number) => void;
  setFamilyNotifications: (enabled: boolean) => void;
  setEncouragementNotifications: (enabled: boolean) => void;
  setShareActivityWithFamily: (enabled: boolean) => void;
  setShareStatsWithFamily: (enabled: boolean) => void;
  resetToDefaults: () => void;
}

const defaultSettings = {
  // Display - 시니어 친화적 기본값
  fontSize: 'large' as FontSize,
  highContrast: false,
  reduceMotion: false,

  // Sound - 음성 안내 기본 활성화
  voicePreference: 'female' as VoicePreference,
  soundEnabled: true,
  voiceGuidanceEnabled: true,
  hapticFeedbackEnabled: true,

  // Notifications - 알림 기본 활성화
  notificationsEnabled: true,
  ritualReminders: true,
  reminderMinutesBefore: 10,
  familyNotifications: true,
  encouragementNotifications: true,

  // Privacy - 가족 공유 기본 활성화
  shareActivityWithFamily: true,
  shareStatsWithFamily: true,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      ...defaultSettings,
      settings: defaultSettings,

      // Update multiple settings at once
      updateSettings: (data) => {
        set((state) => ({
          ...data,
          settings: { ...state.settings, ...data },
        }));
      },

      // Display actions
      setFontSize: (size) => set({ fontSize: size }),
      setHighContrast: (enabled) => set({ highContrast: enabled }),
      setReduceMotion: (enabled) => set({ reduceMotion: enabled }),

      // Sound actions
      setVoicePreference: (preference) => set({ voicePreference: preference }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setVoiceGuidanceEnabled: (enabled) => set({ voiceGuidanceEnabled: enabled }),
      setHapticFeedbackEnabled: (enabled) => set({ hapticFeedbackEnabled: enabled }),

      // Notification actions
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setRitualReminders: (enabled) => set({ ritualReminders: enabled }),
      setReminderMinutesBefore: (minutes) => set({ reminderMinutesBefore: minutes }),
      setFamilyNotifications: (enabled) => set({ familyNotifications: enabled }),
      setEncouragementNotifications: (enabled) => set({ encouragementNotifications: enabled }),

      // Privacy actions
      setShareActivityWithFamily: (enabled) => set({ shareActivityWithFamily: enabled }),
      setShareStatsWithFamily: (enabled) => set({ shareStatsWithFamily: enabled }),

      // Reset
      resetToDefaults: () => set(defaultSettings),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

export default useSettingsStore;
