-- 안녕 (WELLING) Database Schema
-- Supabase PostgreSQL Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- 1. Users Table (확장된 프로필)
-- ==========================================
CREATE TABLE public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE,
    email TEXT UNIQUE,
    name TEXT NOT NULL,
    birth_date DATE,
    role TEXT NOT NULL CHECK (role IN ('senior', 'family', 'caregiver')),
    avatar_url TEXT,
    voice_preference TEXT DEFAULT 'female' CHECK (voice_preference IN ('female', 'male', 'child')),
    font_size TEXT DEFAULT 'large' CHECK (font_size IN ('medium', 'large', 'xlarge')),
    onboarding_completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 2. Families Table
-- ==========================================
CREATE TABLE public.families (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    invite_code TEXT UNIQUE NOT NULL,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. Family Members Table
-- ==========================================
CREATE TABLE public.family_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    nickname TEXT,
    relationship TEXT,
    role TEXT,
    is_primary_senior BOOLEAN DEFAULT false,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(family_id, user_id)
);

-- ==========================================
-- 4. Rituals Table (시스템 + 사용자 정의 의식)
-- ==========================================
CREATE TABLE public.rituals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL CHECK (category IN ('morning', 'exercise', 'meditation', 'health', 'mind', 'routine')),
    emoji TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 5,
    guide_steps JSONB, -- Array of {step, text, voiceUrl, duration}
    is_system BOOLEAN DEFAULT false,
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. User Rituals Table (사용자별 의식 설정)
-- ==========================================
CREATE TABLE public.user_rituals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ritual_id UUID REFERENCES public.rituals(id) ON DELETE CASCADE,
    scheduled_time TEXT NOT NULL, -- HH:mm format
    days_of_week INTEGER[] NOT NULL, -- [1,2,3,4,5,6,7]
    is_active BOOLEAN DEFAULT true,
    reminder_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, ritual_id)
);

-- ==========================================
-- 6. Ritual Completions Table (의식 완료 기록)
-- ==========================================
CREATE TABLE public.ritual_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    ritual_id UUID REFERENCES public.rituals(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'tired')),
    photo_url TEXT,
    voice_memo_url TEXT,
    notes TEXT,
    duration_seconds INTEGER
);

-- ==========================================
-- 7. Game Sessions Table (게임 세션)
-- ==========================================
CREATE TABLE public.game_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    game_type TEXT NOT NULL CHECK (game_type IN ('go_nogo', 'nback', 'task_switch', 'dual_task')),
    difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 5),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,

    -- Common metrics
    total_trials INTEGER DEFAULT 0,
    correct_responses INTEGER DEFAULT 0,
    incorrect_responses INTEGER DEFAULT 0,
    accuracy_rate NUMERIC(5,2),

    -- Go/No-Go specific
    commission_errors INTEGER,
    omission_errors INTEGER,
    avg_reaction_time_ms INTEGER,

    -- N-Back specific
    n_level INTEGER,
    hit_rate NUMERIC(5,2),
    false_alarm_rate NUMERIC(5,2),

    -- Adaptive metrics
    difficulty_adjusted BOOLEAN DEFAULT false,
    new_difficulty_level INTEGER,

    score INTEGER DEFAULT 0,
    fruits_earned INTEGER DEFAULT 0
);

-- ==========================================
-- 8. Game Trials Table (상세 시행 데이터)
-- ==========================================
CREATE TABLE public.game_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID REFERENCES public.game_sessions(id) ON DELETE CASCADE,
    trial_number INTEGER NOT NULL,
    stimulus_type TEXT,
    response TEXT,
    is_correct BOOLEAN,
    reaction_time_ms INTEGER,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB -- Additional trial-specific data
);

-- ==========================================
-- 9. Collected Fruits Table (과일 수확 기록)
-- ==========================================
CREATE TABLE public.collected_fruits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    fruit_type TEXT NOT NULL CHECK (fruit_type IN ('apple', 'orange', 'lemon', 'grape', 'greenApple')),
    quantity INTEGER DEFAULT 1,
    source TEXT CHECK (source IN ('game', 'ritual', 'achievement', 'gift')),
    source_id UUID, -- game_session_id or ritual_completion_id
    collected_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 10. Encouragements Table (가족 응원 메시지)
-- ==========================================
CREATE TABLE public.encouragements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    to_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    family_id UUID REFERENCES public.families(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'photo', 'video', 'reaction')),
    content TEXT,
    media_url TEXT,
    related_ritual_id UUID REFERENCES public.rituals(id) ON DELETE SET NULL,
    related_game_session_id UUID REFERENCES public.game_sessions(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 11. Pre-recorded Messages Table
-- ==========================================
CREATE TABLE public.pre_recorded_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('morning_start', 'daily_complete', 'streak_7days', 'streak_30days', 'streak_100days', 'comeback', 'birthday', 'custom')),
    content TEXT,
    audio_url TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 12. Achievements Table (업적)
-- ==========================================
CREATE TABLE public.achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    emoji TEXT,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- ==========================================
-- Indexes for Performance
-- ==========================================

-- Users
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_users_email ON public.users(email);

-- Family Members
CREATE INDEX idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX idx_family_members_user_id ON public.family_members(user_id);

-- User Rituals
CREATE INDEX idx_user_rituals_user_id ON public.user_rituals(user_id);
CREATE INDEX idx_user_rituals_ritual_id ON public.user_rituals(ritual_id);

-- Ritual Completions
CREATE INDEX idx_ritual_completions_user_id ON public.ritual_completions(user_id);
CREATE INDEX idx_ritual_completions_ritual_id ON public.ritual_completions(ritual_id);
CREATE INDEX idx_ritual_completions_completed_at ON public.ritual_completions(completed_at);

-- Game Sessions
CREATE INDEX idx_game_sessions_user_id ON public.game_sessions(user_id);
CREATE INDEX idx_game_sessions_game_type ON public.game_sessions(game_type);
CREATE INDEX idx_game_sessions_started_at ON public.game_sessions(started_at);

-- Game Trials
CREATE INDEX idx_game_trials_session_id ON public.game_trials(session_id);

-- Collected Fruits
CREATE INDEX idx_collected_fruits_user_id ON public.collected_fruits(user_id);
CREATE INDEX idx_collected_fruits_collected_at ON public.collected_fruits(collected_at);

-- Encouragements
CREATE INDEX idx_encouragements_to_user_id ON public.encouragements(to_user_id);
CREATE INDEX idx_encouragements_from_user_id ON public.encouragements(from_user_id);
CREATE INDEX idx_encouragements_family_id ON public.encouragements(family_id);
CREATE INDEX idx_encouragements_is_read ON public.encouragements(is_read);

-- ==========================================
-- Row Level Security (RLS) Policies
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_rituals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ritual_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collected_fruits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.encouragements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pre_recorded_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Users: Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Families: Family members can view their family
CREATE POLICY "Family members can view family" ON public.families
    FOR SELECT USING (
        id IN (
            SELECT family_id FROM public.family_members
            WHERE user_id = auth.uid()
        )
    );

-- Family Members: Members can view other members in same family
CREATE POLICY "View family members" ON public.family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM public.family_members
            WHERE user_id = auth.uid()
        )
    );

-- User Rituals: Users can manage their own rituals
CREATE POLICY "Users can manage own rituals" ON public.user_rituals
    FOR ALL USING (auth.uid() = user_id);

-- Ritual Completions: Users can manage their own completions
CREATE POLICY "Users can manage own completions" ON public.ritual_completions
    FOR ALL USING (auth.uid() = user_id);

-- Game Sessions: Users can manage their own game sessions
CREATE POLICY "Users can manage own game sessions" ON public.game_sessions
    FOR ALL USING (auth.uid() = user_id);

-- Game Trials: Users can manage trials for their sessions
CREATE POLICY "Users can manage own game trials" ON public.game_trials
    FOR ALL USING (
        session_id IN (
            SELECT id FROM public.game_sessions
            WHERE user_id = auth.uid()
        )
    );

-- Collected Fruits: Users can manage their own fruits
CREATE POLICY "Users can manage own fruits" ON public.collected_fruits
    FOR ALL USING (auth.uid() = user_id);

-- Encouragements: Users can view sent/received messages in their family
CREATE POLICY "View family encouragements" ON public.encouragements
    FOR SELECT USING (
        auth.uid() IN (from_user_id, to_user_id) OR
        family_id IN (
            SELECT family_id FROM public.family_members
            WHERE user_id = auth.uid()
        )
    );

-- Pre-recorded Messages: Users can manage their own messages
CREATE POLICY "Users can manage own messages" ON public.pre_recorded_messages
    FOR ALL USING (auth.uid() = user_id);

-- Achievements: Users can view their own achievements
CREATE POLICY "Users can view own achievements" ON public.achievements
    FOR SELECT USING (auth.uid() = user_id);

-- ==========================================
-- Functions and Triggers
-- ==========================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Calculate streak function
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_streak INTEGER := 0;
    check_date DATE := CURRENT_DATE;
BEGIN
    LOOP
        IF EXISTS (
            SELECT 1 FROM public.ritual_completions
            WHERE user_id = p_user_id
            AND DATE(completed_at) = check_date
        ) THEN
            current_streak := current_streak + 1;
            check_date := check_date - INTERVAL '1 day';
        ELSE
            EXIT;
        END IF;
    END LOOP;

    RETURN current_streak;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- Initial System Rituals Data
-- ==========================================

INSERT INTO public.rituals (name, description, category, emoji, duration_minutes, guide_steps, is_system) VALUES
('아침 스트레칭', '가볍게 몸을 풀어요', 'morning', '🌅', 10,
    '[{"step": 1, "text": "편안하게 서서 천천히 숨을 들이마셔요"},
      {"step": 2, "text": "양팔을 위로 쭉 펴서 기지개를 켜요"},
      {"step": 3, "text": "목을 좌우로 천천히 돌려요"},
      {"step": 4, "text": "허리를 좌우로 천천히 돌려요"}]'::jsonb, true),

('명상하기', '마음을 평온하게', 'meditation', '🧘', 15,
    '[{"step": 1, "text": "편안한 자세로 앉아요"},
      {"step": 2, "text": "눈을 감고 호흡에 집중해요"},
      {"step": 3, "text": "들숨과 날숨을 느껴요"},
      {"step": 4, "text": "마음을 비워요"}]'::jsonb, true),

('산책하기', '밖에 나가서 걸어요', 'exercise', '🚶', 30,
    '[{"step": 1, "text": "편한 신발을 신어요"},
      {"step": 2, "text": "물 한 잔을 챙겨요"},
      {"step": 3, "text": "30분간 걸어요"},
      {"step": 4, "text": "집에 돌아와 물을 마셔요"}]'::jsonb, true),

('물 마시기', '하루 8잔의 물', 'health', '💧', 1,
    '[{"step": 1, "text": "큰 컵에 물을 준비해요"},
      {"step": 2, "text": "천천히 마셔요"}]'::jsonb, true),

('일기 쓰기', '오늘의 감정을 기록해요', 'mind', '📔', 10,
    '[{"step": 1, "text": "조용한 곳에 앉아요"},
      {"step": 2, "text": "오늘 있었던 일을 떠올려요"},
      {"step": 3, "text": "느낀 감정을 적어요"}]'::jsonb, true);

-- ==========================================
-- Views for Analytics
-- ==========================================

-- Daily stats view
CREATE OR REPLACE VIEW daily_user_stats AS
SELECT
    user_id,
    DATE(completed_at) as date,
    COUNT(DISTINCT ritual_id) as rituals_completed,
    COUNT(*) as total_completions
FROM public.ritual_completions
GROUP BY user_id, DATE(completed_at);

-- Game performance view
CREATE OR REPLACE VIEW user_game_performance AS
SELECT
    user_id,
    game_type,
    AVG(accuracy_rate) as avg_accuracy,
    AVG(avg_reaction_time_ms) as avg_reaction_time,
    COUNT(*) as sessions_played,
    SUM(fruits_earned) as total_fruits_earned
FROM public.game_sessions
WHERE ended_at IS NOT NULL
GROUP BY user_id, game_type;
