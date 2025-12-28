// Supabase 데이터베이스 타입 정의

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          phone: string | null;
          name: string;
          birth_date: string | null;
          role: 'senior' | 'family';
          avatar_url: string | null;
          voice_preference: 'male' | 'female';
          font_size: 'normal' | 'large' | 'xlarge';
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };

      families: {
        Row: {
          id: string;
          name: string;
          invite_code: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['families']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['families']['Insert']>;
      };

      family_members: {
        Row: {
          id: string;
          family_id: string;
          user_id: string;
          relationship: string;
          is_primary_senior: boolean;
          joined_at: string;
        };
        Insert: Omit<Database['public']['Tables']['family_members']['Row'], 'id' | 'joined_at'>;
        Update: Partial<Database['public']['Tables']['family_members']['Insert']>;
      };

      rituals: {
        Row: {
          id: string;
          category: string;
          title: string;
          description: string | null;
          icon: string;
          default_time: string | null;
          duration_minutes: number;
          guide_steps: Record<string, unknown>[];
          is_system: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['rituals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['rituals']['Insert']>;
      };

      user_rituals: {
        Row: {
          id: string;
          user_id: string;
          ritual_id: string;
          scheduled_time: string;
          days_of_week: number[];
          is_active: boolean;
          reminder_minutes: number;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['user_rituals']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['user_rituals']['Insert']>;
      };

      ritual_completions: {
        Row: {
          id: string;
          user_id: string;
          ritual_id: string;
          completed_at: string;
          duration_seconds: number | null;
          mood: string | null;
          photo_url: string | null;
          voice_memo_url: string | null;
          notes: string | null;
        };
        Insert: Omit<Database['public']['Tables']['ritual_completions']['Row'], 'id' | 'completed_at'>;
        Update: Partial<Database['public']['Tables']['ritual_completions']['Insert']>;
      };

      game_sessions: {
        Row: {
          id: string;
          user_id: string;
          game_type: string;
          started_at: string;
          ended_at: string | null;
          difficulty_level: number;
          total_trials: number;
          correct_responses: number;
          incorrect_responses: number;
          commission_errors: number | null;
          omission_errors: number | null;
          avg_reaction_time_ms: number | null;
          n_level: number | null;
          hit_rate: number | null;
          false_alarm_rate: number | null;
          accuracy_rate: number;
          difficulty_adjusted: boolean;
          new_difficulty_level: number | null;
          score: number;
          fruits_earned: number;
        };
        Insert: Omit<Database['public']['Tables']['game_sessions']['Row'], 'id' | 'started_at'>;
        Update: Partial<Database['public']['Tables']['game_sessions']['Insert']>;
      };

      encouragements: {
        Row: {
          id: string;
          from_user_id: string;
          to_user_id: string;
          family_id: string;
          type: string;
          content: string | null;
          media_url: string | null;
          related_ritual_id: string | null;
          related_game_session_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['encouragements']['Row'], 'id' | 'created_at'>;
        Update: Partial<Database['public']['Tables']['encouragements']['Insert']>;
      };

      rewards: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          description: string | null;
          icon: string | null;
          earned_at: string;
          streak_days: number | null;
          fruit_type: string | null;
          fruit_count: number | null;
        };
        Insert: Omit<Database['public']['Tables']['rewards']['Row'], 'id' | 'earned_at'>;
        Update: Partial<Database['public']['Tables']['rewards']['Insert']>;
      };

      user_stats: {
        Row: {
          user_id: string;
          current_streak: number;
          longest_streak: number;
          total_rituals_completed: number;
          total_game_sessions: number;
          total_fruits_collected: number;
          fruits_apple: number;
          fruits_orange: number;
          fruits_lemon: number;
          fruits_grape: number;
          fruits_green_apple: number;
          avg_accuracy_7days: number | null;
          avg_reaction_time_7days: number | null;
          last_activity_at: string | null;
          updated_at: string;
        };
        Insert: Database['public']['Tables']['user_stats']['Row'];
        Update: Partial<Database['public']['Tables']['user_stats']['Insert']>;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
