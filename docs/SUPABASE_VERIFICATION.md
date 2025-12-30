# Supabase 검증 리포트

## 1. 스키마 비교 분석

### 현재 정의된 테이블 (types/database.ts)

| 테이블 | 상태 | 비고 |
|--------|------|------|
| users | O 정의됨 | 기본 사용자 정보 |
| families | O 정의됨 | 가족 그룹 |
| family_members | O 정의됨 | 가족 구성원 |
| rituals | O 정의됨 | 리추얼 정의 |
| user_rituals | O 정의됨 | 사용자별 리추얼 설정 |
| ritual_completions | O 정의됨 | 리추얼 완료 기록 |
| game_sessions | O 정의됨 | 게임 세션 |
| encouragements | O 정의됨 | 응원 메시지 |
| rewards | O 정의됨 | 보상/업적 |
| user_stats | O 정의됨 | 사용자 통계 |

### 누락된 테이블 (코드에서 사용되지만 미정의)

| 테이블 | 사용 위치 | 필요 필드 |
|--------|----------|----------|
| collected_fruits | gameStore, walkingStore | user_id, fruit_type, quantity, earned_from, related_game_session_id |
| crew_members | crewStore | crew_id, user_id, role, joined_at |
| crews | 암묵적 | id, name, description, creator_id, goal_type, goal_value, invite_code |
| crew_savings | types/crew.ts | id, crew_id, goal_name, goal_amount, current_amount, status |
| crew_deposits | types/crew.ts | id, savings_id, depositor_id, depositor_type, for_member_id, amount |
| crew_messages | types/crew.ts | id, crew_id, sender_id, message, message_type, sent_at |
| walking_sessions | types/walking.ts | id, user_id, date, total_steps, distance_meters, goal_steps |
| daily_steps | types/walking.ts | user_id, date, total_steps, distance_meters |

### 타입 불일치 발견

| 위치 | 문제 | 권장 수정 |
|------|------|----------|
| lib/supabase.ts vs types/database.ts | users.role: 'caregiver' 추가됨 | 통일 필요 |
| lib/supabase.ts vs types/database.ts | users.voice_preference: 'child' 추가됨 | 통일 필요 |
| lib/supabase.ts vs types/database.ts | users.font_size: 'medium' vs 'normal' | 통일 필요 |
| lib/supabase.ts | users.email 필드 있음 | database.ts에도 추가 |
| lib/supabase.ts | users.onboarding_completed 필드 있음 | database.ts에도 추가 |

---

## 2. RLS 정책 제안서

### users 테이블

```sql
-- 사용자는 자신의 정보만 조회/수정 가능
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- 같은 가족 구성원 정보 조회 허용
CREATE POLICY "Users can view family members" ON users
  FOR SELECT USING (
    id IN (
      SELECT fm2.user_id FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid()
    )
  );
```

### families 테이블

```sql
-- 가족 생성자만 수정 가능
CREATE POLICY "Family creator can update" ON families
  FOR UPDATE USING (created_by = auth.uid());

-- 가족 구성원만 조회 가능
CREATE POLICY "Family members can view" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );
```

### family_members 테이블

```sql
-- 가족 구성원만 조회 가능
CREATE POLICY "Members can view own family" ON family_members
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- 가족 생성자만 멤버 추가 가능
CREATE POLICY "Creator can add members" ON family_members
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );
```

### game_sessions 테이블

```sql
-- 자신의 게임 세션만 조회/생성 가능
CREATE POLICY "Users can manage own sessions" ON game_sessions
  FOR ALL USING (user_id = auth.uid());

-- 가족은 시니어의 게임 기록 조회 가능
CREATE POLICY "Family can view senior sessions" ON game_sessions
  FOR SELECT USING (
    user_id IN (
      SELECT fm2.user_id FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid()
    )
  );
```

### collected_fruits 테이블

```sql
-- 자신의 과일만 관리 가능
CREATE POLICY "Users can manage own fruits" ON collected_fruits
  FOR ALL USING (user_id = auth.uid());
```

### ritual_completions 테이블

```sql
-- 자신의 완료 기록만 관리
CREATE POLICY "Users can manage own completions" ON ritual_completions
  FOR ALL USING (user_id = auth.uid());

-- 가족은 시니어의 기록 조회 가능
CREATE POLICY "Family can view senior completions" ON ritual_completions
  FOR SELECT USING (
    user_id IN (
      SELECT fm2.user_id FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid()
    )
  );
```

### encouragements 테이블

```sql
-- 보낸 사람 또는 받는 사람만 조회 가능
CREATE POLICY "Users can view own encouragements" ON encouragements
  FOR SELECT USING (from_user_id = auth.uid() OR to_user_id = auth.uid());

-- 같은 가족 구성원에게만 응원 가능
CREATE POLICY "Can send to family only" ON encouragements
  FOR INSERT WITH CHECK (
    to_user_id IN (
      SELECT fm2.user_id FROM family_members fm1
      JOIN family_members fm2 ON fm1.family_id = fm2.family_id
      WHERE fm1.user_id = auth.uid()
    )
  );
```

---

## 3. 마이그레이션 SQL

### 누락 테이블 생성

```sql
-- collected_fruits 테이블
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

CREATE INDEX idx_collected_fruits_user ON collected_fruits(user_id);
CREATE INDEX idx_collected_fruits_created ON collected_fruits(created_at);

-- crews 테이블
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

CREATE UNIQUE INDEX idx_crews_invite_code ON crews(invite_code);

-- crew_members 테이블
CREATE TABLE IF NOT EXISTS crew_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('creator', 'member')) DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(crew_id, user_id)
);

CREATE INDEX idx_crew_members_user ON crew_members(user_id);

-- crew_savings 테이블
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

-- crew_deposits 테이블
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

-- crew_messages 테이블
CREATE TABLE IF NOT EXISTS crew_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  crew_id UUID NOT NULL REFERENCES crews(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  message_type TEXT NOT NULL CHECK (message_type IN ('text', 'image', 'system')) DEFAULT 'text',
  sent_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_crew_messages_crew ON crew_messages(crew_id, sent_at DESC);

-- walking_sessions 테이블
CREATE TABLE IF NOT EXISTS walking_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER DEFAULT 0,
  distance_meters INTEGER DEFAULT 0,
  goal_steps INTEGER NOT NULL,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  is_completed BOOLEAN DEFAULT FALSE,
  with_call BOOLEAN DEFAULT FALSE,
  call_duration_seconds INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE INDEX idx_walking_sessions_user_date ON walking_sessions(user_id, date DESC);

-- daily_steps 테이블 (집계용)
CREATE TABLE IF NOT EXISTS daily_steps (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  total_steps INTEGER DEFAULT 0,
  distance_meters INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (user_id, date)
);
```

### users 테이블 필드 추가

```sql
-- 누락 필드 추가
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE;

-- role 타입 확장
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check
  CHECK (role IN ('senior', 'family', 'caregiver'));

-- voice_preference 타입 확장
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_voice_preference_check;
ALTER TABLE users ADD CONSTRAINT users_voice_preference_check
  CHECK (voice_preference IN ('female', 'male', 'child'));

-- font_size 타입 통일
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_font_size_check;
ALTER TABLE users ADD CONSTRAINT users_font_size_check
  CHECK (font_size IN ('medium', 'large', 'xlarge'));
```

### game_sessions 테이블 필드 추가

```sql
-- 게임별 메트릭 저장을 위한 JSONB 필드
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS go_nogo_metrics JSONB;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS nback_metrics JSONB;
ALTER TABLE game_sessions ADD COLUMN IF NOT EXISTS task_switch_metrics JSONB;
```

### 트리거 함수 (자동 통계 업데이트)

```sql
-- user_stats 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- 리추얼 완료 시 통계 업데이트
  IF TG_TABLE_NAME = 'ritual_completions' THEN
    INSERT INTO user_stats (user_id, total_rituals_completed, last_activity_at, updated_at)
    VALUES (NEW.user_id, 1, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_rituals_completed = user_stats.total_rituals_completed + 1,
      last_activity_at = NOW(),
      updated_at = NOW();
  END IF;

  -- 게임 세션 완료 시 통계 업데이트
  IF TG_TABLE_NAME = 'game_sessions' AND NEW.ended_at IS NOT NULL THEN
    INSERT INTO user_stats (user_id, total_game_sessions, total_fruits_collected, last_activity_at, updated_at)
    VALUES (NEW.user_id, 1, NEW.fruits_earned, NOW(), NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      total_game_sessions = user_stats.total_game_sessions + 1,
      total_fruits_collected = user_stats.total_fruits_collected + NEW.fruits_earned,
      last_activity_at = NOW(),
      updated_at = NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ritual_completion_stats
  AFTER INSERT ON ritual_completions
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();

CREATE TRIGGER game_session_stats
  AFTER UPDATE OF ended_at ON game_sessions
  FOR EACH ROW EXECUTE FUNCTION update_user_stats();
```

---

## 4. 권장 사항

### 즉시 적용 필요
1. `collected_fruits` 테이블 생성 (게임/산책 과일 저장 실패 중)
2. `types/database.ts`와 `lib/supabase.ts`의 타입 통일

### 단기 적용 (1주일 내)
1. 모든 RLS 정책 적용
2. 크루 관련 테이블 생성
3. 산책 관련 테이블 생성

### 장기 적용
1. 실시간 구독 설정 (응원 메시지, 가족 활동)
2. Edge Functions로 알림 발송
3. 주간 통계 집계 CRON 작업

---

*생성일: 2024년*
