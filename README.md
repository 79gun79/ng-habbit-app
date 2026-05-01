# NG 습관 앱

Expo + React Native 기반의 크로스플랫폼 습관 트래커 앱입니다. iOS, Android, Web을 지원합니다.

## 시작하기

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm start
```

실행 후 다음 중 선택할 수 있습니다:
- iOS 시뮬레이터 (macOS)
- Android 에뮬레이터
- Expo Go 앱 (QR코드 스캔)
- 웹 브라우저

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm start` | Expo 개발 서버 시작 |
| `npm run android` | Android 에뮬레이터 실행 |
| `npm run ios` | iOS 시뮬레이터 실행 |
| `npm run web` | 웹 브라우저 실행 |
| `npm run lint` | ESLint 코드 검사 |
| `npm run reset-project` | 프로젝트 초기화 |

## 주요 기능

- **습관 관리**: 습관 추가, 삭제, 오늘 완료 토글
- **통계 화면**: 오늘의 달성률 원형 그래프 및 습관별 진행 바
- **Google 로그인**: Google OAuth를 통한 사용자 인증
- **다크/라이트 모드**: 시스템 설정 자동 반영

## 기술 스택

- **프레임워크**: Expo ~54 / React Native 0.81
- **라우팅**: expo-router (파일 기반)
- **저장소**: AsyncStorage (로컬)
- **인증**: expo-auth-session (Google OAuth)
- **언어**: TypeScript

## 문서

- [기여 가이드](docs/CONTRIB.md) - 개발 환경 설정, 워크플로우
- [운영 런북](docs/RUNBOOK.md) - 배포, 문제 해결, 롤백
