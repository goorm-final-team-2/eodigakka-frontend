# 어디가까 — 프론트엔드

약속 조율 모바일 웹 서비스.  
약속방 생성 → 장소 후보 등록 → 투표 → 최종 장소 확정 → 위치 공유 흐름을 한 페이지에서 관리합니다.

---

## 기술 스택

| 분류            | 라이브러리                                                   |
| --------------- | ------------------------------------------------------------ |
| UI              | React 19 + TypeScript 6 + Vite 8                             |
| 스타일          | Tailwind CSS v4 (`@tailwindcss/vite` 방식, config 파일 없음) |
| 라우팅          | React Router 7                                               |
| 서버 상태       | TanStack Query 5                                             |
| 클라이언트 상태 | Zustand 5                                                    |
| HTTP            | Axios                                                        |
| 지도            | Kakao Maps JavaScript API                                    |

---

## 로컬 개발 환경 설정

```bash
# 1. 의존성 설치
npm install

# 2. 환경 변수 설정
cp .env.example .env.local
# .env.local 편집 후 VITE_API_BASE_URL 등 값 채우기

# 3. 개발 서버 실행 (포트 5173)
npm run dev
```

---

## 자주 쓰는 명령어

```bash
npm run dev          # 개발 서버 실행
npm run build        # 타입 검사 + 프로덕션 빌드
npm run lint         # ESLint 검사 (max-warnings 0)
npm run lint:fix     # ESLint 자동 수정 (import 순서 포함)
npm run format       # Prettier 포맷팅
npm run format:check # Prettier 포맷 검사
```

> PR 올리기 전 `npm run build && npm run lint` 로 타입 오류 + 린트를 확인하세요.

---

## 커밋 메시지 컨벤션

`husky` + `commitlint`로 커밋 시 자동 검사됩니다. 형식에 맞지 않으면 커밋이 거부됩니다.

```
<type>: <subject>
```

**허용 타입**

| 타입       | 용도                                    |
| ---------- | --------------------------------------- |
| `feat`     | 새로운 기능                             |
| `fix`      | 버그 수정                               |
| `docs`     | 문서 수정                               |
| `style`    | 코드 포맷, 세미콜론 등 (로직 변경 없음) |
| `refactor` | 리팩토링 (기능 변경 없음)               |
| `test`     | 테스트 추가/수정                        |
| `chore`    | 빌드, 패키지, 설정 등 기타              |

**예시**

```
feat: 약속방 생성 페이지 구현
fix: 투표 중복 제출 방지 처리
chore: ESLint 설정 추가
```

- 제목 72자 이내, 마침표 없이
- 한국어 커밋 메시지 사용 가능

---

## 브랜치 전략

```
develop        # 기본 브랜치 (PR 대상)
feat/<이슈번호>-<기능명>
fix/<이슈번호>-<버그명>
chore/<이슈번호>-<작업명>
```

예: `feat/12-appointment-create`, `fix/7-vote-duplicate`

---

## 코드 컨벤션 핵심 요약

**경로 별칭** — `@/`는 `src/`를 가리킵니다. 항상 절대 경로 사용.

```ts
// ✅
import AppointmentCard from '@/components/appointment/AppointmentCard';
// ❌
import AppointmentCard from '../../components/appointment/AppointmentCard';
```

**타입 import** — `verbatimModuleSyntax`가 켜져 있어서 타입은 반드시 `import type`.

```ts
// ✅
import type { Appointment } from '@/types/appointment';
// ❌ (빌드 오류)
import { Appointment } from '@/types/appointment';
```

**상태 관리 기준**

| 상태 종류                               | 도구           |
| --------------------------------------- | -------------- |
| 서버 데이터 (약속방 정보, 투표 현황 등) | TanStack Query |
| 인증 정보 (accessToken, guestToken)     | Zustand        |
| UI 전역 상태 (지도 좌표, 마커 등)       | Zustand        |
| 로컬 UI 상태 (모달 열림, 입력값)        | useState       |

**API 호출 규칙**

- axios 직접 호출은 `src/api/` 안에서만
- 컴포넌트에서는 TanStack Query 훅으로만 접근

---

## 폴더 구조

```
src/
├── api/          axios 인스턴스 + API 함수
├── components/   재사용 컴포넌트
│   ├── common/   버튼, 인풋, 모달 등
│   ├── map/      카카오맵 관련
│   ├── appointment/
│   ├── vote/
│   └── location/
├── hooks/        커스텀 훅 (useXxx.ts)
├── pages/        라우트 단위 페이지 (XxxPage.tsx)
├── stores/       Zustand 스토어
├── types/        TypeScript 타입 정의
├── constants/    라우트 경로, Query Key 상수
└── utils/        거리 계산, 날짜/주소 포맷
```

---

## Git 훅 동작

커밋 시 `lint-staged`가 자동으로 실행됩니다.

- `*.ts`, `*.tsx` → ESLint 자동 수정 → Prettier 포맷팅
- `*.css`, `*.json`, `*.md` → Prettier 포맷팅
- `commit-msg` → commitlint로 커밋 메시지 형식 검사

별도로 실행하지 않아도 커밋 전 자동 정리됩니다.
