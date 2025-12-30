-- =====================================================
-- WELLING 초기 스키마 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- PART 1: 누락 테이블 생성
-- =====================================================

-- collected_fruits 테이블 (게임/산책에서 획득한 과일)
CREATE TABLE IF NOT EXISTS collected_fruits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fruit_type TEXT NOT NULL CHECK (fruit_type IN ('apple', 'orange', 'lemon', 'grape', 'greenApple')),
  quantity INTEGER NOT NULL DEFAULT 1,
  earned_from TEXT NOT NULL CHECK (earned_from IN ('game', 'ritual', 'walking', 'reward')),
  related_game_session_id UUID,
  related_ritual_completion_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collected_fruits_user ON collected_fruits(user_id);
CREATE INDEX IF NOT EXISTS idx_collected_fruits_created ON collected_fruits(created_at);

-- crews 테이블 (크루/모임)
CREATE TABLE IF NOT EXISTS crews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  creator_id UUID NOT NULL REFERENCES auth.users(id),
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
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  depositor_id UUID NOT NULL REFERENCES auth.users(id),
  depositor_type TEXT NOT NULL CHECK (depositor_type IN ('self', 'family')),
  for_member_id UUID NOT NULL REFERENCES auth.users(id),
  amount INTEGER NOT NULL,
  message TEXT,
  deposited_at TIMESTAMPTZ DEFAULT NOW()
);

-- crew_messages 테이블 (크루 채팅)
CREATE TABLE IF NOT EXISTS crew_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'system')) DEFAULT 'text',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crew_messages_crew ON crew_messages(crew_id, sent_at DESC);

-- walking_sessions 테이블 (산책 세션)
CREATE TABLE IF NOT EXISTS walking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER DEFAULT 0,
  distance_meters INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);

-- =====================================================
-- PART 2: 기존 테이블 필드 추가/수정
-- =====================================================

-- game_sessions 테이블에 메트릭 필드 추가
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS go_nogo_metrics JSONB;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS nback_metrics JSONB;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS task_switch_metrics JSONB;

-- =====================================================
-- PART 3: RLS 정책 (Row Level Security)
-- =====================================================

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
-- PART 4: 트리거 함수 (자동 통계 업데이트)
-- =====================================================

-- user_stats 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_user_stats_on_game()
RETURNS TRIGGER AS $$
BEGIN
  -- 게임 세션 완료 시 통계 업데이트
  IF NEW.ended_at IS NOT NULL AND OLD.ended_at IS NULL THEN
    UPDATE user_stats SET
      total_game_sessions = total_game_sessions + 1,
      total_fruits_collected = total_fruits_collected + COALESCE(NEW.fruits_earned, 0),
      last_activity_at = NOW(),
      updated_at = NOW()
    WHERE user_id = NEW.user_id;

    -- user_stats가 없으면 생성
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

-- 트리거 생성
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

-- =====================================================
-- PART 5: 초대 코드 생성 함수
-- =====================================================

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

-- =====================================================
-- 완료!
-- =====================================================
