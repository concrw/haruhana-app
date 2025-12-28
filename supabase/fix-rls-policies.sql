-- RLS 정책 수정 (무한 재귀 오류 해결)
-- Supabase SQL Editor에서 실행하세요

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Family members can view family" ON public.families;
DROP POLICY IF EXISTS "View family members" ON public.family_members;

-- 수정된 정책: 재귀 없이 직접 auth.uid() 비교
CREATE POLICY "Family members can view family" ON public.families
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_members fm
            WHERE fm.family_id = families.id
            AND fm.user_id = auth.uid()
        )
    );

CREATE POLICY "View family members in same family" ON public.family_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.family_members fm
            WHERE fm.family_id = family_members.family_id
            AND fm.user_id = auth.uid()
        )
    );

-- Families 테이블에 INSERT 정책 추가
CREATE POLICY "Users can create families" ON public.families
    FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Family Members 테이블에 INSERT 정책 추가
CREATE POLICY "Users can join families" ON public.family_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Rituals 읽기 정책 추가 (시스템 의식은 누구나 읽을 수 있음)
DROP POLICY IF EXISTS "Anyone can view system rituals" ON public.rituals;
CREATE POLICY "Anyone can view system rituals" ON public.rituals
    FOR SELECT USING (is_system = true OR created_by = auth.uid());

-- 사용자 생성 의식은 본인만 관리
CREATE POLICY "Users can manage own rituals" ON public.rituals
    FOR ALL USING (auth.uid() = created_by);
