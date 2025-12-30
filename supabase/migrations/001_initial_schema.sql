-- =====================================================
-- WELLING 전체 스키마 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- PART 1: 기본 테이블 생성
-- =====================================================

-- users 테이블 (사용자 프로필)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT,
  email TEXT,
  name TEXT NOT NULL,
  birth_date DATE,
  role TEXT NOT NULL CHECK (role IN ('senior', 'family')) DEFAULT 'senior',
  avatar_url TEXT,
  voice_preference TEXT CHECK (voice_preference IN ('male', 'female')) DEFAULT 'female',
  font_size TEXT CHECK (font_size IN ('normal', 'large', 'xlarge')) DEFAULT 'large',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- families 테이블 (가족 그룹)
CREATE TABLE IF NOT EXISTS families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_families_invite_code ON families(invite_code);

-- family_members 테이블 (가족 구성원)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL DEFAULT 'member',
  is_primary_senior BOOLEAN DEFAULT FALSE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(family_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_family_members_user ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family ON family_members(family_id);

-- rituals 테이블 (의식/루틴 정의)
CREATE TABLE IF NOT EXISTS rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT NOT NULL DEFAULT '☀️',
  default_time TIME,
  duration_minutes INTEGER NOT NULL DEFAULT 5,
  guide_steps JSONB DEFAULT '[]'::jsonb,
  is_system BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- user_rituals 테이블 (사용자별 의식 설정)
CREATE TABLE IF NOT EXISTS user_rituals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ritual_id UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  scheduled_time TIME NOT NULL,
  days_of_week INTEGER[] NOT NULL DEFAULT '{0,1,2,3,4,5,6}',
  is_active BOOLEAN DEFAULT TRUE,
  reminder_minutes INTEGER DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, ritual_id)
);

CREATE INDEX IF NOT EXISTS idx_user_rituals_user ON user_rituals(user_id);

-- ritual_completions 테이블 (의식 완료 기록)
CREATE TABLE IF NOT EXISTS ritual_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  ritual_id UUID NOT NULL REFERENCES rituals(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INTEGER,
  mood TEXT CHECK (mood IN ('great', 'good', 'okay', 'bad')),
  photo_url TEXT,
  voice_memo_url TEXT,
  notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_ritual_completions_user ON ritual_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_ritual_completions_date ON ritual_completions(completed_at);

-- game_sessions 테이블 (게임 세션)
CREATE TABLE IF NOT EXISTS game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  game_type TEXT NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  total_trials INTEGER NOT NULL DEFAULT 0,
  correct_responses INTEGER NOT NULL DEFAULT 0,
  incorrect_responses INTEGER NOT NULL DEFAULT 0,
  commission_errors INTEGER,
  omission_errors INTEGER,
  avg_reaction_time_ms INTEGER,
  n_level INTEGER,
  hit_rate DECIMAL(5,4),
  false_alarm_rate DECIMAL(5,4),
  accuracy_rate DECIMAL(5,4) NOT NULL DEFAULT 0,
  difficulty_adjusted BOOLEAN DEFAULT FALSE,
  new_difficulty_level INTEGER,
  score INTEGER NOT NULL DEFAULT 0,
  fruits_earned INTEGER NOT NULL DEFAULT 0,
  go_nogo_metrics JSONB,
  nback_metrics JSONB,
  task_switch_metrics JSONB
);

CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_game_sessions_date ON game_sessions(started_at);

-- user_stats 테이블 (사용자 통계)
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_rituals_completed INTEGER DEFAULT 0,
  total_game_sessions INTEGER DEFAULT 0,
  total_fruits_collected INTEGER DEFAULT 0,
  fruits_apple INTEGER DEFAULT 0,
  fruits_orange INTEGER DEFAULT 0,
  fruits_lemon INTEGER DEFAULT 0,
  fruits_grape INTEGER DEFAULT 0,
  fruits_green_apple INTEGER DEFAULT 0,
  avg_accuracy_7days DECIMAL(5,4),
  avg_reaction_time_7days INTEGER,
  last_activity_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- encouragements 테이블 (격려 메시지)
CREATE TABLE IF NOT EXISTS encouragements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id UUID NOT NULL REFERENCES users(id),
  to_user_id UUID NOT NULL REFERENCES users(id),
  family_id UUID NOT NULL REFERENCES families(id),
  type TEXT NOT NULL CHECK (type IN ('message', 'emoji', 'voice', 'photo')),
  content TEXT,
  media_url TEXT,
  related_ritual_id UUID REFERENCES rituals(id),
  related_game_session_id UUID REFERENCES game_sessions(id),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_encouragements_to ON encouragements(to_user_id);
CREATE INDEX IF NOT EXISTS idx_encouragements_family ON encouragements(family_id);

-- rewards 테이블 (보상/뱃지)
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  earned_at TIMESTAMPTZ DEFAULT NOW(),
  streak_days INTEGER,
  fruit_type TEXT,
  fruit_count INTEGER
);

CREATE INDEX IF NOT EXISTS idx_rewards_user ON rewards(user_id);

-- =====================================================
-- PART 2: 구독 관련 테이블
-- =====================================================

-- subscriptions 테이블 (구독 정보)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'premium')) DEFAULT 'free',
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired', 'none')) DEFAULT 'none',
  started_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  gift_id UUID,
  auto_renew BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user ON subscriptions(user_id);

-- subscription_gifts 테이블 (구독 선물)
CREATE TABLE IF NOT EXISTS subscription_gifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_phone TEXT NOT NULL,
  recipient_id UUID REFERENCES users(id),
  duration_months INTEGER NOT NULL CHECK (duration_months IN (1, 3, 6, 12)),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')) DEFAULT 'pending',
  message TEXT,
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscription_gifts_recipient ON subscription_gifts(recipient_phone);
CREATE INDEX IF NOT EXISTS idx_subscription_gifts_sender ON subscription_gifts(sender_id);

-- renewal_nudges 테이블 (갱신 알림)
CREATE TABLE IF NOT EXISTS renewal_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id),
  sender_id UUID REFERENCES users(id),
  nudge_type TEXT NOT NULL CHECK (nudge_type IN ('2weeks', '1week', 'last_day')),
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_renewal_nudges_recipient ON renewal_nudges(recipient_id);

-- =====================================================
-- PART 3: 크루/모임 테이블
-- =====================================================

-- crews 테이블 (크루/모임)
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES users(id),
  goal_type TEXT NOT NULL CHECK (goal_type IN ('continuous', '30days_streak', '1000_rituals', 'custom')),
  goal_value INTEGER,
  invite_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_crews_invite_code ON crews(invite_code);

-- crew_members 테이블 (크루 멤버)
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_crew_members_user ON crew_members(user_id);
CREATE INDEX IF NOT EXISTS idx_crew_members_crew ON crew_members(crew_id);

-- crew_savings 테이블 (크루 저축/목표)
CREATE TABLE IF NOT EXISTS crew_savings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  goal_name TEXT NOT NULL,
  goal_amount INTEGER NOT NULL,
  current_amount INTEGER DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('active', 'achieved', 'cancelled')) DEFAULT 'active',
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- crew_deposits 테이블 (크루 입금 기록)
CREATE TABLE IF NOT EXISTS crew_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  savings_id UUID NOT NULL REFERENCES crew_savings(id) ON DELETE CASCADE,
  depositor_id UUID NOT NULL REFERENCES users(id),
  depositor_type TEXT NOT NULL CHECK (depositor_type IN ('self', 'family')),
  for_member_id UUID NOT NULL REFERENCES users(id),
  amount INTEGER NOT NULL,
  message TEXT,
  deposited_at TIMESTAMPTZ DEFAULT NOW()
);

-- crew_messages 테이블 (크루 채팅)
CREATE TABLE IF NOT EXISTS crew_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'system')) DEFAULT 'text',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_messages_crew ON crew_messages(crew_id, sent_at DESC);

-- =====================================================
-- PART 4: 산책/걸음 테이블
-- =====================================================

-- collected_fruits 테이블 (획득한 과일)
CREATE TABLE IF NOT EXISTS collected_fruits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  fruit_type TEXT NOT NULL CHECK (fruit_type IN ('apple', 'orange', 'lemon', 'grape', 'greenApple')),
  quantity INTEGER NOT NULL DEFAULT 1,
  earned_from TEXT NOT NULL CHECK (earned_from IN ('game', 'ritual', 'walking', 'reward')),
  related_game_session_id UUID REFERENCES game_sessions(id),
  related_ritual_completion_id UUID REFERENCES ritual_completions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collected_fruits_user ON collected_fruits(user_id);
CREATE INDEX IF NOT EXISTS idx_collected_fruits_created ON collected_fruits(created_at);

-- walking_sessions 테이블 (산책 세션)
CREATE TABLE IF NOT EXISTS walking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER DEFAULT 0,
  distance_meters INTEGER DEFAULT 0,
  goal_steps INTEGER NOT NULL DEFAULT 3000,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  with_call BOOLEAN DEFAULT FALSE,
  call_duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_walking_sessions_user_date ON walking_sessions(user_id, date DESC);

-- daily_steps 테이블 (일일 걸음 수 집계)
CREATE TABLE IF NOT EXISTS daily_steps (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER DEFAULT 0,
  distance_meters INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- =====================================================
-- PART 5: RLS 정책 (Row Level Security)
-- =====================================================

-- users RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- families RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view family" ON families;
CREATE POLICY "Family members can view family" ON families
  FOR SELECT USING (
    id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
    OR created_by = auth.uid()
  );

DROP POLICY IF EXISTS "Users can create families" ON families;
CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- family_members RLS
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Family members can view members" ON family_members;
CREATE POLICY "Family members can view members" ON family_members
  FOR SELECT USING (
    family_id IN (SELECT family_id FROM family_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can join families" ON family_members;
CREATE POLICY "Users can join families" ON family_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave families" ON family_members;
CREATE POLICY "Users can leave families" ON family_members
  FOR DELETE USING (auth.uid() = user_id);

-- rituals RLS
ALTER TABLE rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view rituals" ON rituals;
CREATE POLICY "Anyone can view rituals" ON rituals
  FOR SELECT USING (true);

-- user_rituals RLS
ALTER TABLE user_rituals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own rituals" ON user_rituals;
CREATE POLICY "Users can manage own rituals" ON user_rituals
  FOR ALL USING (auth.uid() = user_id);

-- ritual_completions RLS
ALTER TABLE ritual_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own completions" ON ritual_completions;
CREATE POLICY "Users can view own completions" ON ritual_completions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own completions" ON ritual_completions;
CREATE POLICY "Users can insert own completions" ON ritual_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- game_sessions RLS
ALTER TABLE game_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own game sessions" ON game_sessions;
CREATE POLICY "Users can manage own game sessions" ON game_sessions
  FOR ALL USING (auth.uid() = user_id);

-- user_stats RLS
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own stats" ON user_stats;
CREATE POLICY "Users can update own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own stats" ON user_stats;
CREATE POLICY "Users can insert own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- encouragements RLS
ALTER TABLE encouragements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own encouragements" ON encouragements;
CREATE POLICY "Users can view own encouragements" ON encouragements
  FOR SELECT USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);

DROP POLICY IF EXISTS "Users can send encouragements" ON encouragements;
CREATE POLICY "Users can send encouragements" ON encouragements
  FOR INSERT WITH CHECK (auth.uid() = from_user_id);

-- rewards RLS
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own rewards" ON rewards;
CREATE POLICY "Users can view own rewards" ON rewards
  FOR SELECT USING (auth.uid() = user_id);

-- subscriptions RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own subscription" ON subscriptions;
CREATE POLICY "Users can manage own subscription" ON subscriptions
  FOR ALL USING (auth.uid() = user_id);

-- subscription_gifts RLS
ALTER TABLE subscription_gifts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view relevant gifts" ON subscription_gifts;
CREATE POLICY "Users can view relevant gifts" ON subscription_gifts
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

DROP POLICY IF EXISTS "Users can send gifts" ON subscription_gifts;
CREATE POLICY "Users can send gifts" ON subscription_gifts
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Recipients can update gifts" ON subscription_gifts;
CREATE POLICY "Recipients can update gifts" ON subscription_gifts
  FOR UPDATE USING (auth.uid() = recipient_id);

-- renewal_nudges RLS
ALTER TABLE renewal_nudges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own nudges" ON renewal_nudges;
CREATE POLICY "Users can view own nudges" ON renewal_nudges
  FOR SELECT USING (auth.uid() = recipient_id);

-- collected_fruits RLS
ALTER TABLE collected_fruits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own fruits" ON collected_fruits;
CREATE POLICY "Users can view own fruits" ON collected_fruits
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own fruits" ON collected_fruits;
CREATE POLICY "Users can insert own fruits" ON collected_fruits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- crews RLS
ALTER TABLE crews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view crews" ON crews;
CREATE POLICY "Anyone can view crews" ON crews
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create crews" ON crews;
CREATE POLICY "Users can create crews" ON crews
  FOR INSERT WITH CHECK (auth.uid() = creator_id);

DROP POLICY IF EXISTS "Creator can update crew" ON crews;
CREATE POLICY "Creator can update crew" ON crews
  FOR UPDATE USING (auth.uid() = creator_id);

-- crew_members RLS
ALTER TABLE crew_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view crew members" ON crew_members;
CREATE POLICY "Members can view crew members" ON crew_members
  FOR SELECT USING (
    crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
    OR auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can join crews" ON crew_members;
CREATE POLICY "Users can join crews" ON crew_members
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave crews" ON crew_members;
CREATE POLICY "Users can leave crews" ON crew_members
  FOR DELETE USING (auth.uid() = user_id);

-- crew_messages RLS
ALTER TABLE crew_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view messages" ON crew_messages;
CREATE POLICY "Members can view messages" ON crew_messages
  FOR SELECT USING (
    crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Members can send messages" ON crew_messages;
CREATE POLICY "Members can send messages" ON crew_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
  );

-- crew_savings RLS
ALTER TABLE crew_savings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view savings" ON crew_savings;
CREATE POLICY "Members can view savings" ON crew_savings
  FOR SELECT USING (
    crew_id IN (SELECT crew_id FROM crew_members WHERE user_id = auth.uid())
  );

-- crew_deposits RLS
ALTER TABLE crew_deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view deposits" ON crew_deposits;
CREATE POLICY "Members can view deposits" ON crew_deposits
  FOR SELECT USING (
    savings_id IN (
      SELECT cs.id FROM crew_savings cs
      JOIN crew_members cm ON cs.crew_id = cm.crew_id
      WHERE cm.user_id = auth.uid()
    )
  );

-- walking_sessions RLS
ALTER TABLE walking_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own walking sessions" ON walking_sessions;
CREATE POLICY "Users can manage own walking sessions" ON walking_sessions
  FOR ALL USING (auth.uid() = user_id);

-- daily_steps RLS
ALTER TABLE daily_steps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own daily steps" ON daily_steps;
CREATE POLICY "Users can manage own daily steps" ON daily_steps
  FOR ALL USING (auth.uid() = user_id);

-- =====================================================
-- PART 6: 트리거 함수
-- =====================================================

-- user_stats 자동 업데이트 함수 (게임 완료 시)
CREATE OR REPLACE FUNCTION update_user_stats_on_game()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    UPDATE user_stats SET
      total_game_sessions = total_game_sessions + 1,
      total_fruits_collected = total_fruits_collected + COALESCE(NEW.fruits_earned, 0),
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;

    IF NOT FOUND THEN
      INSERT INTO user_stats (
        user_id,
        total_game_sessions,
        total_fruits_collected,
        current_streak,
        longest_streak,
        total_rituals_completed,
        last_activity_at,
        updated_at
      ) VALUES (
        NEW.user_id,
        1,
        COALESCE(NEW.fruits_earned, 0),
        0,
        0,
        0,
        NOW(),
        NOW()
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS game_session_stats_trigger ON game_sessions;
CREATE TRIGGER game_session_stats_trigger
  AFTER UPDATE ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_stats_on_game();

-- 과일 수집 시 통계 업데이트 함수
CREATE OR REPLACE FUNCTION update_fruit_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_stats SET
    total_fruits_collected = total_fruits_collected + NEW.quantity,
    updated_at = NOW()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS fruit_collection_trigger ON collected_fruits;
CREATE TRIGGER fruit_collection_trigger
  AFTER INSERT ON collected_fruits
  FOR EACH ROW EXECUTE FUNCTION update_fruit_stats();

-- users 업데이트 시 updated_at 자동 갱신
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_updated_at ON users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- PART 7: 유틸리티 함수
-- =====================================================

-- 초대 코드 생성 함수
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  code TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    code := code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- 크루 생성 시 자동으로 초대 코드 생성
CREATE OR REPLACE FUNCTION set_crew_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS crew_invite_code_trigger ON crews;
CREATE TRIGGER crew_invite_code_trigger
  BEFORE INSERT ON crews
  FOR EACH ROW EXECUTE FUNCTION set_crew_invite_code();

-- 가족 생성 시 자동으로 초대 코드 생성
CREATE OR REPLACE FUNCTION set_family_invite_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS family_invite_code_trigger ON families;
CREATE TRIGGER family_invite_code_trigger
  BEFORE INSERT ON families
  FOR EACH ROW EXECUTE FUNCTION set_family_invite_code();

-- =====================================================
-- PART 8: 기본 의식 데이터 삽입
-- =====================================================

INSERT INTO rituals (category, title, description, icon, default_time, duration_minutes, guide_steps, is_system) VALUES
  ('morning', '아침 기상', '오늘도 좋은 하루를 시작해요', '🌅', '07:00', 5, '[{"step": 1, "text": "기지개를 펴며 일어나세요"}, {"step": 2, "text": "창문을 열어 신선한 공기를 마셔요"}]', true),
  ('morning', '아침 약 먹기', '건강을 위한 약을 챙겨요', '💊', '08:00', 3, '[{"step": 1, "text": "물 한 잔을 준비해요"}, {"step": 2, "text": "약을 복용해요"}]', true),
  ('morning', '아침 식사', '든든한 아침을 먹어요', '🍚', '08:30', 30, '[{"step": 1, "text": "식사를 준비해요"}, {"step": 2, "text": "천천히 맛있게 드세요"}]', true),
  ('daytime', '물 마시기', '건강을 위해 물을 마셔요', '💧', '10:00', 2, '[{"step": 1, "text": "물 한 잔을 마셔요"}]', true),
  ('daytime', '점심 식사', '맛있는 점심을 먹어요', '🍱', '12:00', 30, '[{"step": 1, "text": "점심을 준비해요"}, {"step": 2, "text": "맛있게 드세요"}]', true),
  ('daytime', '낮잠', '잠깐 쉬어가요', '😴', '14:00', 30, '[{"step": 1, "text": "편안한 곳에 누워요"}, {"step": 2, "text": "30분 정도 쉬세요"}]', true),
  ('evening', '저녁 식사', '오늘의 마지막 식사예요', '🍽️', '18:00', 30, '[{"step": 1, "text": "저녁을 준비해요"}, {"step": 2, "text": "가족과 함께 드세요"}]', true),
  ('evening', '저녁 약 먹기', '저녁 약을 챙겨요', '💊', '19:00', 3, '[{"step": 1, "text": "물을 준비해요"}, {"step": 2, "text": "약을 복용해요"}]', true),
  ('night', '취침 준비', '숙면을 위해 준비해요', '🌙', '21:00', 15, '[{"step": 1, "text": "양치질을 해요"}, {"step": 2, "text": "편안한 옷으로 갈아입어요"}]', true),
  ('night', '잠자리', '편안한 밤 되세요', '😴', '22:00', 5, '[{"step": 1, "text": "불을 끄세요"}, {"step": 2, "text": "편안하게 주무세요"}]', true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 완료!
-- =====================================================
