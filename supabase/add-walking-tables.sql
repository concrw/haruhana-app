-- 산책 트래킹 테이블 추가
-- Supabase SQL Editor에서 실행하세요

-- ==========================================
-- 산책 세션 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.walking_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,

    total_steps INT DEFAULT 0,
    distance_meters INT DEFAULT 0,
    goal_steps INT DEFAULT 5000,

    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    is_completed BOOLEAN DEFAULT false,

    with_call BOOLEAN DEFAULT false,
    call_duration_seconds INT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 일일 누적 통계 테이블
-- ==========================================
CREATE TABLE IF NOT EXISTS public.daily_steps (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    date DATE,
    total_steps INT DEFAULT 0,
    distance_meters INT DEFAULT 0,

    PRIMARY KEY (user_id, date)
);

-- ==========================================
-- 인덱스
-- ==========================================
CREATE INDEX IF NOT EXISTS idx_walking_sessions_user_id ON public.walking_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_walking_sessions_date ON public.walking_sessions(date);
CREATE INDEX IF NOT EXISTS idx_walking_sessions_user_date ON public.walking_sessions(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_steps_date ON public.daily_steps(date);

-- ==========================================
-- RLS 정책
-- ==========================================
ALTER TABLE public.walking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_steps ENABLE ROW LEVEL SECURITY;

-- 산책 세션: 본인만 관리
CREATE POLICY "Users can manage own walking sessions" ON public.walking_sessions
    FOR ALL USING (auth.uid() = user_id);

-- 일일 걸음 수: 본인 및 가족이 조회 가능
CREATE POLICY "Users can view own daily steps" ON public.daily_steps
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.family_members fm
            WHERE fm.user_id = daily_steps.user_id
            AND fm.family_id IN (
                SELECT family_id FROM public.family_members
                WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can manage own daily steps" ON public.daily_steps
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily steps" ON public.daily_steps
    FOR UPDATE USING (auth.uid() = user_id);

-- ==========================================
-- 트리거: daily_steps 자동 업데이트
-- ==========================================
CREATE OR REPLACE FUNCTION update_daily_steps()
RETURNS TRIGGER AS $$
BEGIN
    -- 완료된 세션만 처리
    IF NEW.is_completed = true THEN
        INSERT INTO public.daily_steps (user_id, date, total_steps, distance_meters)
        VALUES (NEW.user_id, NEW.date, NEW.total_steps, NEW.distance_meters)
        ON CONFLICT (user_id, date)
        DO UPDATE SET
            total_steps = daily_steps.total_steps + EXCLUDED.total_steps,
            distance_meters = daily_steps.distance_meters + EXCLUDED.distance_meters;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_daily_steps
    AFTER INSERT OR UPDATE ON public.walking_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_daily_steps();
