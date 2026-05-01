# 기여 가이드

## 개요

NG 습관 앱은 Expo + React Native 기반의 습관 트래커 앱입니다. iOS, Android, Web을 모두 지원합니다.

## 개발 환경 설정

### 사전 요구사항

- Node.js 18+
- npm 또는 yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS: Xcode + iOS Simulator (macOS만)
- Android: Android Studio + Android Emulator

### 초기 설정

```bash
npm install
```

## 사용 가능한 스크립트

| 스크립트 | 명령어 | 설명 |
|----------|--------|------|
| 개발 서버 시작 | `npm start` | Expo 개발 서버 시작 (QR코드, 시뮬레이터 선택 가능) |
| Android 실행 | `npm run android` | Android 에뮬레이터에서 앱 실행 |
| iOS 실행 | `npm run ios` | iOS 시뮬레이터에서 앱 실행 |
| Web 실행 | `npm run web` | 브라우저에서 앱 실행 |
| 린트 검사 | `npm run lint` | ESLint로 코드 검사 |
| 프로젝트 초기화 | `npm run reset-project` | 스타터 코드를 app-example로 이동, 빈 app 디렉토리 생성 |

## 프로젝트 구조

```
native/
├── app/                    # 파일 기반 라우팅 (expo-router)
│   ├── (tabs)/             # 탭 네비게이션
│   │   ├── index.tsx       # 습관 목록 화면
│   │   └── explore.tsx     # 통계 화면
│   ├── _layout.tsx         # 루트 레이아웃
│   └── modal.tsx           # 모달 화면
├── components/             # 재사용 가능한 컴포넌트
│   ├── AddHabitModal.tsx   # 습관 추가 모달
│   ├── HabitItem.tsx       # 습관 목록 아이템
│   ├── ProfileSidebar.tsx  # 프로필 사이드바
│   └── ui/                 # 기본 UI 컴포넌트
├── constants/
│   └── theme.ts            # 색상, 폰트 테마 정의
├── hooks/
│   ├── use-color-scheme.ts # 다크/라이트 모드 훅
│   ├── use-google-auth.ts  # Google OAuth 훅
│   └── use-theme-color.ts  # 테마 색상 훅
├── utils/
│   └── storage.ts          # AsyncStorage 기반 습관 데이터 CRUD
├── assets/                 # 이미지, 폰트 등 정적 파일
├── app.json                # Expo 앱 설정
├── eas.json                # EAS Build 설정
└── tsconfig.json           # TypeScript 설정
```

## 환경 변수

현재 `.env.example` 파일이 없습니다. Google OAuth를 사용하려면 Expo의 `app.json` extra 필드 또는 환경 변수를 통해 OAuth 클라이언트 ID를 설정해야 합니다.

## 개발 워크플로우

1. **기능 개발 시** `planner` 에이전트로 구현 계획 수립
2. **TDD 접근**: 테스트 먼저 작성 → 구현 → 리팩토링
3. **코드 작성 후** `code-reviewer` 에이전트로 리뷰
4. **커밋**: 컨벤셔널 커밋 형식 준수 (`feat:`, `fix:`, `refactor:` 등)

## 코딩 컨벤션

- 불변성 패턴 사용 (객체 직접 수정 금지)
- 파일당 최대 800줄
- 함수당 최대 50줄
- 깊은 중첩(4레벨 초과) 금지
- `console.log` 사용 금지 (에러 로깅만 허용)
- 사용자 입력은 항상 검증

## 테스트

현재 테스트 설정이 없습니다. 테스트 추가 시 80%+ 커버리지를 목표로 합니다:
- 단위 테스트: `utils/storage.ts` 함수들
- 통합 테스트: 컴포넌트 렌더링
- E2E 테스트: 습관 추가/삭제/완료 흐름 (Playwright)
