import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole, VoicePreference, FontSize } from '../types/user';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

interface AuthState {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Onboarding state
  onboardingStep: number;
  onboardingData: {
    role: UserRole | null;
    name: string;
    birthDate: Date | null;
    familyCode: string;
    voicePreference: VoicePreference;
  };

  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  loginWithOtp: (phone: string, otp: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (data: Partial<User> & { password?: string }) => Promise<boolean>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  initializeAuth: () => Promise<void>;

  // Onboarding actions
  setOnboardingStep: (step: number) => void;
  updateOnboardingData: (data: Partial<AuthState['onboardingData']>) => void;
  resetOnboarding: () => void;
  completeOnboarding: () => Promise<boolean>;
}

const initialOnboardingData = {
  role: null as UserRole | null,
  name: '',
  birthDate: null as Date | null,
  familyCode: '',
  voicePreference: 'female' as VoicePreference,
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      onboardingStep: 1,
      onboardingData: initialOnboardingData,

      // Basic setters
      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          error: null,
        }),

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      // Auth actions
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error('사용자 정보를 가져올 수 없어요.');

          // Get user profile from database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (userError) throw userError;

          const user: User = {
            id: userData.id,
            phone: userData.phone,
            email: userData.email,
            name: userData.name,
            birthDate: userData.birth_date ? new Date(userData.birth_date) : null,
            role: userData.role as UserRole,
            avatarUrl: userData.avatar_url,
            voicePreference: userData.voice_preference as VoicePreference,
            fontSize: userData.font_size as FontSize,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Login error:', error);
          set({
            error: '로그인에 실패했어요. 다시 시도해주세요.',
            isLoading: false,
          });
          return false;
        }
      },

      loginWithOtp: async (phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          const { data: authData, error: authError } = await supabase.auth.verifyOtp({
            phone,
            token: otp,
            type: 'sms',
          });

          if (authError) throw authError;
          if (!authData.user) throw new Error('사용자 정보를 가져올 수 없어요.');

          // Get user profile from database
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (userError) throw userError;

          const user: User = {
            id: userData.id,
            phone: userData.phone,
            email: userData.email,
            name: userData.name,
            birthDate: userData.birth_date ? new Date(userData.birth_date) : null,
            role: userData.role as UserRole,
            avatarUrl: userData.avatar_url,
            voicePreference: userData.voice_preference as VoicePreference,
            fontSize: userData.font_size as FontSize,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Login with OTP error:', error);
          set({
            error: '로그인에 실패했어요. 다시 시도해주세요.',
            isLoading: false,
          });
          return false;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error) {
          console.error('Logout error:', error);
          set({
            error: '로그아웃에 실패했어요.',
            isLoading: false,
          });
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { onboardingData } = get();

          // Sign up with email or phone
          let authData;
          if (data.email) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: data.email,
              password: data.password || Math.random().toString(36).slice(-8), // Generate random password if not provided
            });
            if (signUpError) throw signUpError;
            authData = signUpData;
          } else if (data.phone) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signInWithOtp({
              phone: data.phone,
            });
            if (signUpError) throw signUpError;
            // For phone sign up, we need to wait for OTP verification
            // This will be handled in the login flow
            set({ isLoading: false });
            return true;
          } else {
            throw new Error('이메일 또는 전화번호가 필요해요.');
          }

          if (!authData.user) throw new Error('회원가입에 실패했어요.');

          // Create user profile in database
          const { error: insertError } = await supabase.from('users').insert({
            id: authData.user.id,
            phone: data.phone || null,
            email: data.email || null,
            name: data.name || onboardingData.name,
            birth_date: onboardingData.birthDate?.toISOString().split('T')[0] || null,
            role: onboardingData.role || 'senior',
            voice_preference: onboardingData.voicePreference,
            font_size: 'large',
            onboarding_completed: false,
          });

          if (insertError) throw insertError;

          // Get the created user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', authData.user.id)
            .single();

          if (userError) throw userError;

          const newUser: User = {
            id: userData.id,
            phone: userData.phone,
            email: userData.email,
            name: userData.name,
            birthDate: userData.birth_date ? new Date(userData.birth_date) : null,
            role: userData.role as UserRole,
            avatarUrl: userData.avatar_url,
            voicePreference: userData.voice_preference as VoicePreference,
            fontSize: userData.font_size as FontSize,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          };

          set({
            user: newUser,
            isAuthenticated: true,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Register error:', error);
          set({
            error: '회원가입에 실패했어요. 다시 시도해주세요.',
            isLoading: false,
          });
          return false;
        }
      },

      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const { user } = get();
          if (!user) {
            throw new Error('로그인이 필요해요.');
          }

          // Prepare update data matching database schema
          const updateData: Partial<Database['public']['Tables']['users']['Update']> = {};
          if (data.name !== undefined) updateData.name = data.name;
          if (data.phone !== undefined) updateData.phone = data.phone;
          if (data.email !== undefined) updateData.email = data.email;
          if (data.birthDate !== undefined) updateData.birth_date = data.birthDate?.toISOString().split('T')[0] || null;
          if (data.avatarUrl !== undefined) updateData.avatar_url = data.avatarUrl;
          if (data.voicePreference !== undefined) updateData.voice_preference = data.voicePreference;
          if (data.fontSize !== undefined) updateData.font_size = data.fontSize;

          const { data: userData, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', user.id)
            .select()
            .single();

          if (updateError) throw updateError;

          const updatedUser: User = {
            id: userData.id,
            phone: userData.phone,
            email: userData.email,
            name: userData.name,
            birthDate: userData.birth_date ? new Date(userData.birth_date) : null,
            role: userData.role as UserRole,
            avatarUrl: userData.avatar_url,
            voicePreference: userData.voice_preference as VoicePreference,
            fontSize: userData.font_size as FontSize,
            createdAt: new Date(userData.created_at),
            updatedAt: new Date(userData.updated_at),
          };

          set({
            user: updatedUser,
            isLoading: false,
          });

          return true;
        } catch (error) {
          console.error('Update profile error:', error);
          set({
            error: '프로필 수정에 실패했어요.',
            isLoading: false,
          });
          return false;
        }
      },

      // Initialize auth - restore session on app start
      initializeAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error) throw error;

          if (session?.user) {
            // Get user profile from database
            const { data: userData, error: userError } = await supabase
              .from('users')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (userError) throw userError;

            const user: User = {
              id: userData.id,
              phone: userData.phone,
              email: userData.email,
              name: userData.name,
              birthDate: userData.birth_date ? new Date(userData.birth_date) : null,
              role: userData.role as UserRole,
              avatarUrl: userData.avatar_url,
              voicePreference: userData.voice_preference as VoicePreference,
              fontSize: userData.font_size as FontSize,
              createdAt: new Date(userData.created_at),
              updatedAt: new Date(userData.updated_at),
            };

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
            });
          } else {
            set({ isLoading: false });
          }

          // Setup auth state listener
          supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_OUT') {
              set({
                user: null,
                isAuthenticated: false,
              });
            } else if (event === 'SIGNED_IN' && session?.user) {
              const { data: userData } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

              if (userData) {
                const user: User = {
                  id: userData.id,
                  phone: userData.phone,
                  email: userData.email,
                  name: userData.name,
                  birthDate: userData.birth_date ? new Date(userData.birth_date) : null,
                  role: userData.role as UserRole,
                  avatarUrl: userData.avatar_url,
                  voicePreference: userData.voice_preference as VoicePreference,
                  fontSize: userData.font_size as FontSize,
                  createdAt: new Date(userData.created_at),
                  updatedAt: new Date(userData.updated_at),
                };

                set({
                  user,
                  isAuthenticated: true,
                });
              }
            }
          });
        } catch (error) {
          console.error('Initialize auth error:', error);
          set({ isLoading: false });
        }
      },

      // Onboarding actions
      setOnboardingStep: (step) => set({ onboardingStep: step }),

      updateOnboardingData: (data) =>
        set((state) => ({
          onboardingData: { ...state.onboardingData, ...data },
        })),

      resetOnboarding: () =>
        set({
          onboardingStep: 1,
          onboardingData: initialOnboardingData,
        }),

      completeOnboarding: async () => {
        const { onboardingData, register } = get();
        try {
          const success = await register({
            name: onboardingData.name,
            role: onboardingData.role || 'senior',
          });
          if (success) {
            set({
              onboardingStep: 1,
              onboardingData: initialOnboardingData,
            });
          }
          return success;
        } catch (error) {
          return false;
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
