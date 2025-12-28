import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not found. Using mock mode.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database type definitions (auto-generated from schema)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string | null;
          email: string | null;
          name: string;
          birth_date: string | null;
          role: 'senior' | 'family' | 'caregiver';
          avatar_url: string | null;
          voice_preference: 'female' | 'male' | 'child';
          font_size: 'medium' | 'large' | 'xlarge';
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      // Add other table types as needed
    };
  };
};
