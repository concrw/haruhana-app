# 하루하나 (Haruhana) 배포 가이드

## 📋 목차
1. [사전 준비](#사전-준비)
2. [Supabase 설정](#supabase-설정)
3. [환경 변수 설정](#환경-변수-설정)
4. [로컬 개발](#로컬-개발)
5. [프로덕션 빌드](#프로덕션-빌드)
6. [앱 스토어 배포](#앱-스토어-배포)

---

## 사전 준비

### 필수 도구 설치
```bash
# Node.js 18+ 설치
# https://nodejs.org/

# EAS CLI 설치
npm install -g eas-cli

# Expo CLI 설치
npm install -g expo-cli
```

### 계정 생성
- [Expo 계정](https://expo.dev/) 생성
- [Supabase 계정](https://supabase.com/) 생성
- Apple Developer 계정 (iOS 배포시)
- Google Play Console 계정 (Android 배포시)

---

## Supabase 설정

### 1. 프로젝트 생성
1. [Supabase Dashboard](https://app.supabase.com/)에서 새 프로젝트 생성
2. 프로젝트 이름: `haruhana`
3. 데이터베이스 비밀번호 설정 및 저장

### 2. 데이터베이스 스키마 적용
1. Supabase Dashboard → SQL Editor로 이동
2. `supabase/schema.sql` 파일의 내용을 복사하여 실행
3. 모든 테이블, 함수, 정책이 생성되었는지 확인

### 3. API 키 획득
1. Settings → API로 이동
2. `Project URL` 복사
3. `anon public` 키 복사

---

## 환경 변수 설정

### 1. .env 파일 생성
```bash
cp .env.example .env
```

### 2. .env 파일 수정
```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App Configuration
EXPO_PUBLIC_APP_NAME=하루하나
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_ENVIRONMENT=production

# Feature Flags
EXPO_PUBLIC_ENABLE_TTS=true
EXPO_PUBLIC_ENABLE_HAPTICS=true
EXPO_PUBLIC_ENABLE_NOTIFICATIONS=true
```

---

## 로컬 개발

### 1. 의존성 설치
```bash
npm install --legacy-peer-deps
```

### 2. 개발 서버 시작

#### 웹 개발
```bash
npx expo start --web
```

#### iOS 시뮬레이터
```bash
npx expo start --ios
```

#### Android 에뮬레이터
```bash
npx expo start --android
```

### 3. TypeScript 타입 체크
```bash
npx tsc --noEmit
```

---

## 프로덕션 빌드

### 1. EAS 로그인
```bash
eas login
```

### 2. EAS 프로젝트 설정
```bash
eas build:configure
```

### 3. 프로덕션 빌드 실행

#### iOS 빌드
```bash
eas build --platform ios --profile production
```

#### Android 빌드
```bash
eas build --platform android --profile production
```

#### 두 플랫폼 동시 빌드
```bash
eas build --platform all --profile production
```

### 4. 빌드 상태 확인
```bash
eas build:list
```

---

## 앱 스토어 배포

### iOS (App Store)

#### 1. Apple Developer 설정
1. [Apple Developer](https://developer.apple.com/) 계정 준비
2. App Store Connect에서 새 앱 등록
3. Bundle ID: `com.haruhana.app`
4. 앱 이름, 스크린샷, 설명 등 메타데이터 입력

#### 2. EAS Submit으로 제출
```bash
eas submit --platform ios --latest
```

#### 3. 수동 제출 (선택사항)
1. EAS 빌드 완료 후 `.ipa` 파일 다운로드
2. Xcode → Organizer → Distribute App

### Android (Google Play)

#### 1. Google Play Console 설정
1. [Google Play Console](https://play.google.com/console/) 계정 준비
2. 새 앱 만들기
3. Package name: `com.haruhana.app`
4. 앱 콘텐츠, 스크린샷, 설명 등 작성

#### 2. Service Account 키 생성
1. Google Cloud Console → IAM & Admin → Service Accounts
2. 새 Service Account 생성
3. JSON 키 다운로드 → `google-service-account.json`으로 저장

#### 3. EAS Submit으로 제출
```bash
eas submit --platform android --latest
```

---

## 업데이트 배포

### OTA (Over-The-Air) 업데이트
```bash
# 프로덕션 업데이트
eas update --branch production --message "버그 수정 및 성능 개선"

# 스테이징 업데이트
eas update --branch preview --message "새 기능 테스트"
```

### 버전 업데이트
1. `app.json`에서 `version` 업데이트
2. iOS: `ios.buildNumber` 증가
3. Android: `android.versionCode` 증가
4. 새 빌드 생성 및 제출

---

## 트러블슈팅

### TypeScript 오류
```bash
# 타입 체크
npx tsc --noEmit

# 캐시 클리어
rm -rf node_modules .expo
npm install --legacy-peer-deps
```

### 빌드 실패
```bash
# EAS 캐시 클리어
eas build --clear-cache --platform all

# 로그 확인
eas build:list
eas build:view [build-id]
```

### Supabase 연결 실패
- `.env` 파일의 URL과 키 확인
- Supabase Dashboard에서 프로젝트 상태 확인
- RLS 정책이 올바르게 설정되었는지 확인

---

## 모니터링 및 분석

### Sentry (오류 추적)
```bash
npm install @sentry/react-native
```

### Analytics
- Firebase Analytics
- Amplitude
- Mixpanel

---

## 지원

문제가 발생하면 다음을 확인하세요:
- [Expo 문서](https://docs.expo.dev/)
- [Supabase 문서](https://supabase.com/docs)
- [프로젝트 GitHub Issues](https://github.com/your-repo/haruhana/issues)

---

**버전:** 1.0.0
**최종 업데이트:** 2025-12-02
