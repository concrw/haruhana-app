-- Supabase Auth 트리거 설정
-- 이 SQL을 Supabase SQL Editor에서 실행하세요
-- (Supabase Dashboard > SQL Editor > New Query)

-- 1. users 테이블에 INSERT 정책 추가 (인증된 사용자가 자신의 프로필 생성 가능)
DROP POLICY IF EXISTS "Users can create own profile" ON public.users;
CREATE POLICY "Users can create own profile" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. Auth 사용자 생성 시 자동으로 public.users에 레코드 생성하는 트리거
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

-- 기존 트리거 삭제 (있으면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 새 트리거 생성
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Email Confirmation 비활성화 (Supabase Dashboard에서 설정)
-- Authentication > Providers > Email > Confirm email 옵션을 OFF로 설정하세요
