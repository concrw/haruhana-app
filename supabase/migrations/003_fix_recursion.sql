-- =====================================================
-- RLS 무한 재귀 최종 수정
-- Supabase SQL Editor에서 실행하세요
-- =====================================================

-- 모든 기존 family_members 정책 삭제
DROP POLICY IF EXISTS "View family members in same family" ON family_members;
DROP POLICY IF EXISTS "Members can view crew members" ON family_members;
DROP POLICY IF EXISTS "Family members can view members" ON family_members;
DROP POLICY IF EXISTS "Users can join families" ON family_members;
DROP POLICY IF EXISTS "Users can leave families" ON family_members;

-- 단순한 정책: 본인 레코드만 조회 (재귀 없음)
CREATE POLICY "Users can view own membership" ON family_members
    FOR SELECT USING (auth.uid() = user_id);

-- 가족 가입
CREATE POLICY "Users can join families" ON family_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 가족 탈퇴
CREATE POLICY "Users can leave families" ON family_members
    FOR DELETE USING (auth.uid() = user_id);

-- families 정책도 단순화
DROP POLICY IF EXISTS "Family members can view family" ON families;
CREATE POLICY "Users can view families" ON families
    FOR SELECT USING (true);

-- =====================================================
-- 완료!
-- =====================================================
