# 운영 런북

## 배포 절차

### EAS Build 프로파일

`eas.json`에 세 가지 빌드 프로파일이 정의되어 있습니다.

| 프로파일 | 배포 방식 | 용도 |
|----------|-----------|------|
| `development` | 내부 배포 | 개발 클라이언트 빌드 (Expo Dev Client 포함) |
| `preview` | 내부 배포 | QA 및 테스트용 내부 배포 |
| `production` | 스토어 배포 | 앱스토어/플레이스토어 정식 배포 (버전 자동 증가) |

### 빌드 명령어

```bash
# EAS CLI 설치
npm install -g eas-cli

# EAS 로그인
eas login

# 개발 빌드
eas build --profile development --platform ios
eas build --profile development --platform android

# 프리뷰 빌드
eas build --profile preview --platform all

# 프로덕션 빌드
eas build --profile production --platform all
```

### 스토어 제출

```bash
# 앱스토어 제출
eas submit --platform ios

# 플레이스토어 제출
eas submit --platform android
```

## 앱 정보

| 항목 | iOS | Android |
|------|-----|---------|
| Bundle ID | `com.anonymous.xnative` | `com.anonymous.xnative` |
| EAS Project ID | `231fd8d2-6c5f-48bd-87d9-a48663893a04` | - |
| 방향 | 세로 고정 | 세로 고정 |

## 데이터 저장소

앱은 **AsyncStorage**를 로컬 데이터 저장소로 사용합니다.

- 저장 키: `@habit_tracker:habits`
- 데이터 형식: JSON 직렬화된 `Habit[]` 배열
- 위치: 기기 로컬 저장소 (클라우드 동기화 없음)

```typescript
interface Habit {
  id: string;        // Date.now() 기반 고유 ID
  name: string;      // 습관 이름
  createdAt: string; // ISO 8601 날짜 문자열
  lastDoneDate?: string | null; // 마지막 완료 날짜 (toDateString 형식)
}
```

## 일반적인 문제와 해결

### Metro 번들러가 시작되지 않을 때

```bash
# Metro 캐시 초기화
npx expo start --clear
```

### iOS 빌드 실패

```bash
# pod 재설치
cd ios && pod install && cd ..
```

### Android 빌드 실패

```bash
# Gradle 캐시 초기화
cd android && ./gradlew clean && cd ..
```

### 의존성 충돌

```bash
# node_modules 완전 재설치
rm -rf node_modules && npm install
```

### AsyncStorage 데이터 초기화 (개발 중)

Expo Dev Client에서 앱 설정 → 앱 데이터 삭제, 또는:

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage'
await AsyncStorage.clear()
```

## 롤백 절차

### OTA 업데이트 롤백

Expo EAS Update를 사용하는 경우:

```bash
# 이전 업데이트로 롤백
eas update --branch production --message "rollback to previous version"
```

### 스토어 빌드 롤백

- **iOS**: App Store Connect에서 이전 버전으로 제출 (최소 24시간 소요)
- **Android**: Google Play Console에서 이전 APK/AAB로 롤아웃 비율 조정

## 모니터링

현재 별도의 APM(Application Performance Monitoring) 도구가 설정되어 있지 않습니다. 추후 Sentry 또는 Expo Insights 연동을 권장합니다.

### 오류 추적 (향후 설정 권장)

```bash
# Sentry 연동
npx expo install @sentry/react-native
```

## 앱 버전 관리

- `app.json`의 `version` 필드로 앱 버전 관리
- `production` 빌드는 `autoIncrement: true`로 빌드 번호 자동 증가
- `eas.json`의 `appVersionSource: "remote"`로 원격 버전 소스 사용
