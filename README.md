# 하루하나 (Haruhana) 🌸

> **시니어를 위한 일상 의식과 인지 게임 앱**

하루하나는 시니어들이 건강한 일상 루틴을 유지하고 인지 능력을 향상시킬 수 있도록 돕는 모바일 애플리케이션입니다.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React_Native-0.76-purple)](https://reactnative.dev/)
[![Expo SDK](https://img.shields.io/badge/Expo-54-black)](https://expo.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

---

## ✨ 주요 기능

### 👵 시니어 모드
- **일상 의식**: 아침 스트레칭, 약 복용, 산책 등 건강한 루틴 관리
- **인지 게임**: Go/No-Go, N-Back, Task-Switch 게임으로 두뇌 훈련
- **과일 수집**: 게임 완료 시 귀여운 과일 수집 시스템
- **음성 안내 (TTS)**: 모든 과정을 음성으로 안내
- **큰 폰트**: 시니어 친화적 UI (18pt+ 폰트, 56pt+ 터치 영역)

### 👨‍👩‍👧‍👦 가족 모드
- **원격 응원**: 가족이 시니어에게 응원 메시지 전송
- **활동 모니터링**: 시니어의 의식 및 게임 진행 상황 확인
- **주간 리포트**: 한 주 동안의 활동 요약
- **사진/음성 메시지**: 멀티미디어로 따뜻한 메시지 전달

### 🎮 인지 게임
1. **Go/No-Go**: 반응 억제 능력 훈련
2. **N-Back**: 작업 기억력 향상
3. **Task-Switch**: 인지 유연성 증진
4. **적응형 난이도**: 사용자 수준에 맞춰 자동 조정

### 🔔 스마트 알림
- 의식 리마인더
- 게임 추천 알림
- 가족 응원 알림

---

## 🏗️ 기술 스택

### Frontend
- **React Native** with Expo SDK 54
- **Expo Router** (File-based navigation)
- **TypeScript** (Strict mode)
- **Zustand** (State management)
- **React Native Reanimated** (Animations)

### Backend
- **Supabase** (PostgreSQL Database)
- **Supabase Auth** (Authentication)
- **Supabase Storage** (File storage)
- **Row Level Security** (RLS)

### Native Features
- **expo-speech**: 음성 안내 (TTS)
- **expo-notifications**: 푸시 알림
- **expo-haptics**: 촉각 피드백
- **expo-image-picker**: 사진 선택/촬영

---

## 📁 프로젝트 구조

```
haruhana/
├── app/                    # 화면 (Expo Router)
│   ├── (tabs)/            # 탭 네비게이션
│   ├── auth/              # 인증 화면
│   ├── game/              # 게임 화면
│   ├── ritual/            # 의식 화면
│   └── family/            # 가족 기능
├── components/            # 재사용 가능한 컴포넌트
│   ├── common/           # 공통 컴포넌트
│   ├── game/             # 게임 컴포넌트
│   └── layout/           # 레이아웃 컴포넌트
├── stores/               # Zustand 스토어
│   ├── authStore.ts      # 인증 상태
│   ├── gameStore.ts      # 게임 상태
│   ├── ritualStore.ts    # 의식 상태
│   └── familyStore.ts    # 가족 상태
├── types/                # TypeScript 타입 정의
├── constants/            # 상수 (색상, 레이아웃, 게임 설정)
├── utils/                # 유틸리티 함수
├── lib/                  # 라이브러리 설정
│   └── supabase.ts       # Supabase 클라이언트
└── supabase/             # Supabase 스키마
    └── schema.sql        # 데이터베이스 스키마
```

---

## 🚀 시작하기

### 사전 요구사항
- Node.js 18+
- npm or yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### 설치
```bash
# 저장소 클론
git clone https://github.com/your-username/haruhana.git
cd haruhana

# 의존성 설치
npm install --legacy-peer-deps

# 환경 변수 설정
cp .env.example .env
# .env 파일 수정 (Supabase URL 및 Key 입력)
```

### 개발 서버 실행

```bash
# 웹
npx expo start --web

# iOS (Mac only)
npx expo start --ios

# Android
npx expo start --android
```

---

## 📊 데이터베이스 스키마

### 주요 테이블
- **users**: 사용자 정보
- **families**: 가족 그룹
- **family_members**: 가족 구성원
- **rituals**: 시스템 의식 템플릿
- **user_rituals**: 사용자 설정 의식
- **ritual_completions**: 의식 완료 기록
- **game_sessions**: 게임 세션
- **game_trials**: 게임 시도 기록
- **collected_fruits**: 수집한 과일
- **encouragements**: 응원 메시지
- **achievements**: 업적 시스템

---

## 🎨 디자인 시스템

### 색상 팔레트
- **Background Cream**: `#FFF9F0`
- **Orange**: `#FF9E5A` (Primary)
- **Apple Green**: `#8BC34A`
- **Lemon Yellow**: `#FDD835`
- **Grape Purple**: `#9C27B0`

### 타이포그래피
- Hero: 36pt
- XXL: 28pt
- XL: 24pt
- LG: 20pt
- Base: 16pt

### 터치 영역
- Small: 44pt
- Medium: 56pt
- Large: 64pt

---

## 🧪 테스트

```bash
# TypeScript 타입 체크
npx tsc --noEmit

# 빌드 테스트
npx expo export
```

---

## 📦 배포

배포 가이드는 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참조하세요.

### 빠른 빌드
```bash
# iOS 빌드
eas build --platform ios --profile production

# Android 빌드
eas build --platform android --profile production
```

---

## 🤝 기여하기

기여를 환영합니다! 다음 단계를 따라주세요:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

---

## 👥 팀

**개발자**: Brand Activist
**디자인**: UX/UI Team
**프로젝트 관리**: PM Team

---

## 📞 지원

- 📧 Email: support@haruhana.app
- 🌐 Website: https://haruhana.app
- 📱 GitHub Issues: [github.com/your-username/haruhana/issues](https://github.com/your-username/haruhana/issues)

---

## 🙏 감사의 말

이 프로젝트는 시니어들의 건강하고 행복한 일상을 위해 만들어졌습니다.

**Made with ❤️ for our beloved seniors**

---

## 📸 스크린샷

> 추후 추가 예정

---

**버전:** 1.0.0
**마지막 업데이트:** 2025-12-02
