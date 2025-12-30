/**
 * Supabase 연결 테스트 스크립트
 *
 * 실행: npx tsx scripts/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('\n🔍 Supabase 연결 테스트 시작...\n');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 환경 변수가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // 1. 시스템 의식(Rituals) 테이블 확인
    console.log('1️⃣ 시스템 의식 데이터 확인...');
    const { data: rituals, error: ritualsError } = await supabase
      .from('rituals')
      .select('title, category, icon')
      .eq('is_system', true);

    if (ritualsError) {
      console.error('❌ Rituals 테이블 에러:', ritualsError.message);
    } else {
      console.log(`✅ 시스템 의식 ${rituals?.length || 0}개 발견:`);
      rituals?.forEach((r) => console.log(`   ${r.icon} ${r.title} (${r.category})`));
    }

    // 2. Users 테이블 구조 확인
    console.log('\n2️⃣ Users 테이블 확인...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(1);

    if (usersError) {
      console.error('❌ Users 테이블 에러:', usersError.message);
    } else {
      console.log('✅ Users 테이블 접근 가능');
    }

    // 3. Families 테이블 확인
    console.log('\n3️⃣ Families 테이블 확인...');
    const { data: families, error: familiesError } = await supabase
      .from('families')
      .select('*')
      .limit(1);

    if (familiesError) {
      console.error('❌ Families 테이블 에러:', familiesError.message);
    } else {
      console.log('✅ Families 테이블 접근 가능');
    }

    // 4. Game Sessions 테이블 확인
    console.log('\n4️⃣ Game Sessions 테이블 확인...');
    const { data: sessions, error: sessionsError } = await supabase
      .from('game_sessions')
      .select('*')
      .limit(1);

    if (sessionsError) {
      console.error('❌ Game Sessions 테이블 에러:', sessionsError.message);
    } else {
      console.log('✅ Game Sessions 테이블 접근 가능');
    }

    console.log('\n✅ Supabase 연결 테스트 완료!\n');
    console.log('📊 다음 단계:');
    console.log('   1. 앱을 실행하세요: npx expo start');
    console.log('   2. 회원가입을 통해 첫 사용자를 생성하세요');
    console.log('   3. 의식과 게임을 진행하여 데이터를 확인하세요\n');

  } catch (error) {
    console.error('❌ 연결 테스트 실패:', error);
    process.exit(1);
  }
}

testConnection();
