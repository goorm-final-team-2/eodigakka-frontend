# 어디가까 프론트엔드 — Claude Code 가이드

## 프로젝트 개요

약속 조율 모바일 웹 서비스. 약속방 생성 → 장소 후보 등록 → 투표 → 최종 장소 확정 → 위치 공유 흐름을 한 페이지에서 관리한다.

## 기술 스택

- React 19 + TypeScript 6 + Vite 8
- Tailwind CSS v4 (`@tailwindcss/vite` 플러그인 방식, `tailwind.config.js` 없음)
- React Router 7 (SPA 라우팅)
- TanStack Query 5 (서버 상태)
- Zustand (클라이언트 전역 상태)
- Axios (HTTP 클라이언트)
- Kakao Maps JavaScript API (지도)

## 핵심 규칙 (반드시 지킬 것)

### 경로 별칭

`@/`는 `src/`를 가리킨다. 항상 `@/` 절대 경로 사용. 같은 폴더 내 파일만 `./` 허용.

```ts
// ✅
import AppointmentCard from '@/components/appointment/AppointmentCard';
import type { Appointment } from '@/types/appointment';

// ❌
import AppointmentCard from '../../components/appointment/AppointmentCard';
```

### Type import 규칙

`verbatimModuleSyntax`가 켜져 있어서 타입은 반드시 `import type` 사용. ESLint `consistent-type-imports`가 자동으로 잡아준다.

```ts
// ✅
import type { Appointment } from '@/types/appointment';

// ❌ (빌드 오류)
import { Appointment } from '@/types/appointment';
```

### Import 순서

`eslint-plugin-import-x`가 자동으로 검사하고 `--fix`로 자동 정렬된다. 그룹 사이에 빈 줄 하나.

```ts
// 1. Node 내장
import path from 'path';

// 2. 외부 패키지
import { useQuery } from '@tanstack/react-query';

// 3. 내부 (@/ 경로)
import type { Appointment } from '@/types/appointment';

// 4. 상대 경로
import './styles.css';
```

### 컴포넌트 작성

- 화살표 함수 + `export default`
- 파일 하나에 컴포넌트 하나
- PascalCase 파일명, `type XxxProps = { ... }` 형식

### API 호출

- axios 직접 호출은 `src/api/` 안에서만
- 컴포넌트/페이지에서는 TanStack Query 훅으로만 데이터 접근

### 환경 변수

- `import.meta.env.VITE_*` 형식만 사용 (`process.env` 사용 금지)

### 스타일

- Tailwind v4 유틸리티 클래스만 사용
- 커스텀 토큰은 CSS 파일의 `@theme` 블록에 정의 (config 파일 없음)
- 모바일 우선 360px~430px 기준
- `100dvh` 사용 (모바일 주소창 대응)
- hover 의존 UI 금지 (터치 환경)

### console

- `console.log` 커밋 시 ESLint 경고 (`no-console: warn`)
- 의도적으로 남길 경우 `// eslint-disable-next-line no-console` 주석 추가

## 디렉토리 역할

```
src/
├── api/              axios 인스턴스 + API 함수 모음
│   ├── index.ts      인스턴스, 인터셉터 (다른 모듈에서 재사용)
│   ├── auth.ts
│   ├── appointment.ts
│   ├── place.ts
│   ├── vote.ts
│   └── location.ts
├── components/       재사용 컴포넌트
│   ├── common/       버튼, 인풋, 모달 등
│   ├── map/          카카오맵 관련
│   ├── appointment/  약속방 관련
│   ├── vote/         투표 관련
│   └── location/     위치 공유 관련
├── hooks/            커스텀 훅 (useXxx.ts)
├── pages/            라우트 단위 페이지 (XxxPage.tsx)
├── stores/           Zustand 스토어
│   ├── authStore.ts  로그인 정보, 게스트 토큰
│   └── mapStore.ts   지도 상태
├── types/            TypeScript 타입 정의
│   ├── api.ts        공통 응답 타입
│   ├── appointment.ts
│   ├── place.ts
│   └── user.ts
├── constants/
│   ├── routes.ts     라우트 경로 상수
│   └── queryKeys.ts  TanStack Query 키 상수
└── utils/
    ├── distance.ts   Haversine 거리 계산
    └── format.ts     날짜, 주소 포맷
```

## 주요 비즈니스 로직

### 약속 상태값

- `PLANNING` — 장소 후보 등록/투표 중
- `CONFIRMED` — 최종 장소 확정됨
- `CLOSED` — 약속 종료

### 참여자 타입 / 역할

- `member_type`: `USER` (로그인) | `GUEST` (비로그인)
- `role`: `HOST` (방장) | `MEMBER` (일반)

### 인증 헤더

- 로그인 사용자: `Authorization: Bearer {accessToken}`
- 게스트: `X-Guest-Token: {guestToken}`

### 도착 상태 계산 (`src/utils/distance.ts`)

- 확정 장소 기준 100m 이내 → `도착 근처`
- 100m 초과 → `이동 중`
- 미공유 → `미공유`
- Haversine 공식 사용

### 위치 공유

- 사용자 ON 설정 시에만 동작
- 약속 시간 1시간 전 ~ 종료 후 30분 활성화
- WebSocket/STOMP 우선, 실패 시 Polling 폴백

## API

로컬에서 `/api` 요청은 `vite.config.ts` 프록시로 `localhost:8080`으로 자동 전달된다. 별도 Base URL 설정 불필요.

Base URL: `import.meta.env.VITE_API_BASE_URL` (dev/prod 환경)

## API 호출 패턴

axios 인스턴스는 `src/api/index.ts` 하나만 만들고 모든 API 모듈에서 재사용한다.
컴포넌트에서 직접 axios 호출 금지 — 반드시 TanStack Query 훅을 통해서만 접근한다.

```ts
// src/api/index.ts — 인스턴스 생성
const apiClient = axios.create({ baseURL: '/api' });

// src/api/appointment.ts — API 함수
export const getAppointment = (id: number) =>
  apiClient.get<Appointment>(`/appointments/${id}`).then((res) => res.data);

// src/hooks/useAppointment.ts — Query 훅
export const useAppointment = (id: number) =>
  useQuery({ queryKey: QUERY_KEYS.appointment(id), queryFn: () => getAppointment(id) });

// 컴포넌트 — 훅만 사용
const { data } = useAppointment(id);
```

## 서버 상태 vs 클라이언트 상태

어떤 상태 관리 도구를 쓸지 헷갈릴 때 기준:

| 상태 종류            | 도구           | 예시                                           |
| -------------------- | -------------- | ---------------------------------------------- |
| 서버에서 오는 데이터 | TanStack Query | 약속방 정보, 장소 후보, 투표 현황, 참여자 위치 |
| 로그인/인증 정보     | Zustand        | accessToken, 로그인한 유저 정보, guestToken    |
| UI 전역 상태         | Zustand        | 지도 중심 좌표, 선택된 마커                    |
| 로컬 UI 상태         | useState       | 모달 열림 여부, 입력값                         |

## Query Key 관리

모든 쿼리 키는 `src/constants/queryKeys.ts`에 상수로 중앙 관리한다.
컴포넌트나 훅에 문자열 직접 쓰지 말 것.

```ts
// src/constants/queryKeys.ts
export const QUERY_KEYS = {
  appointment: (id: number) => ['appointment', id] as const,
  candidates: (appointmentId: number) => ['candidates', appointmentId] as const,
  votes: (appointmentId: number) => ['votes', appointmentId] as const,
  locations: (appointmentId: number) => ['locations', appointmentId] as const,
};

// ✅
useQuery({ queryKey: QUERY_KEYS.appointment(id), queryFn: () => getAppointment(id) });

// ❌
useQuery({ queryKey: ['appointment', id], queryFn: () => getAppointment(id) });
```

## 자주 쓰는 명령어

```bash
npm run dev          # 개발 서버 (포트 5173)
npm run check        # 타입 + 린트 + 포맷 전체 검사 (PR 전 필수)
npm run lint:fix     # ESLint 자동 수정 (import 순서 포함)
npm run format       # Prettier 포맷팅
npm run typecheck    # 타입 검사만
```
