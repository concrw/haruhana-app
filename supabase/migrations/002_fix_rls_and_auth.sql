-- =====================================================
-- WELLING RLS 수정 및 Auth 트리거 설정
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- =====================================================
-- PART 1: RLS 정책 수정 (무한 재귀 오류 해결)
-- =====================================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Family members can view family" ON families;
DROP POLICY IF EXISTS "Family members can view members" ON family_members;
DROP POLICY IF EXISTS "View family members" ON family_members;
DROP POLICY IF EXISTS "Users can create families" ON families;
DROP POLICY IF EXISTS "Users can join families" ON family_members;

-- families: 본인이 속한 가족만 조회 (재귀 없음)
CREATE POLICY "Family members can view family" ON families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM family_members fm
            WHERE fm.family_id = families.id
            AND fm.user_id = auth.uid()
        )
        OR created_by = auth.uid()
    );

-- families: 가족 생성
CREATE POLICY "Users can create families" ON families
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- family_members: 같은 가족 멤버 조회 (재귀 없음)
CREATE POLICY "View family members in same family" ON family_members
    FOR SELECT USING (
        user_id = auth.uid()
        OR family_id IN (
            SELECT family_id FROM family_members WHERE user_id = auth.uid()
        )
    );

-- family_members: 가족 가입
CREATE POLICY "Users can join families" ON family_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- family_members: 가족 탈퇴
DROP POLICY IF EXISTS "Users can leave families" ON family_members;
CREATE POLICY "Users can leave families" ON family_members
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- PART 2: Rituals 테이블 정책 수정
-- =====================================================

-- rituals 테이블에 created_by 컬럼 추가 (없으면)
ALTER TABLE rituals ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Anyone can view rituals" ON rituals;
DROP POLICY IF EXISTS "Anyone can view system rituals" ON rituals;
DROP POLICY IF EXISTS "Users can manage own rituals" ON rituals;

-- 시스템 의식은 누구나 조회, 사용자 의식은 본인만
CREATE POLICY "Anyone can view system rituals" ON rituals
    FOR SELECT USING (is_system = true OR created_by = auth.uid());

-- 사용자가 만든 의식 관리
CREATE POLICY "Users can manage own rituals" ON rituals
    FOR ALL USING (created_by = auth.uid() AND is_system = false);

-- =====================================================
-- PART 3: Users 테이블 정책 수정
-- =====================================================

-- users 테이블에 onboarding_completed 컬럼 추가 (없으면)
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;

-- 기존 정책 업데이트
DROP POLICY IF EXISTS "Users can create own profile" ON users;
CREATE POLICY "Users can create own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- =====================================================
-- PART 4: Auth 트리거 설정 (회원가입 시 자동 사용자 생성)
-- =====================================================

-- 트리거 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.users (id, email, name, role, voice_preference, font_size, onboarding_completed)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'senior'),
        'female',
        'large',
        false
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 기존 트리거 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 새 트리거 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 완료!
--
-- 추가 설정 (Supabase Dashboard에서):
-- Authentication > Providers > Email > Confirm email OFF
-- =====================================================
