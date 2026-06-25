# 어디가까 — 프론트엔드

약속 조율 **모바일 PWA 서비스** (모바일 우선 개발).  
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

## 모바일 우선 개발 원칙

**PC 웹이 아닌 모바일 앱이 메인 타겟입니다.** 모든 UI는 모바일 기준으로 먼저 만들고, PC는 나중에 고려합니다.

### 기준 뷰포트

| 구분 | 범위 | 비고 |
|------|------|------|
| 개발 기준 | 360px ~ 430px | Android 소형 ~ iPhone Pro Max |
| 권장 테스트 기기 | iPhone 14 Pro (393px) | Chrome DevTools에서 시뮬레이션 가능 |

Chrome DevTools → 기기 툴바(⌘⇧M) → **iPhone 14 Pro** 선택 후 개발하세요.

### 터치 환경 필수 규칙

- **hover 사용 금지** — 터치 화면에서는 hover 상태가 없습니다. `:hover`에만 의존하는 인터랙션은 구현하지 마세요.
- **최소 터치 타겟 44×44px** — 버튼, 링크, 아이콘 등 탭 가능한 요소의 최소 크기입니다.
- **`cursor: pointer` 불필요** — 전역으로 자동 적용됩니다.

### Safe Area (iPhone 노치 / 홈 인디케이터)

iPhone은 상단에 Dynamic Island(노치), 하단에 홈 인디케이터가 있어 UI가 가려질 수 있습니다.  
고정(fixed) 요소를 만들 때 반드시 safe area 유틸리티를 사용하세요.

```html
<!-- 상단 고정 헤더 — 노치 아래로 내려오게 -->
<header class="fixed top-0 inset-x-0 pt-safe bg-surface-black">...</header>

<!-- 하단 탭 내비게이션 — 홈 인디케이터 위로 올라오게 -->
<nav class="fixed bottom-0 inset-x-0 pb-safe bg-canvas">...</nav>

<!-- 하단 탭바 + 홈 인디케이터 높이를 한 번에 처리 -->
<nav class="fixed bottom-0 inset-x-0 pb-safe-nav">...</nav>

<!-- 콘텐츠 영역 — 상하 fixed 요소 높이 제외한 최소 높이 -->
<main class="min-h-content">...</main>
```

| 유틸리티 | 용도 |
|----------|------|
| `pt-safe` | 상단 노치 회피 |
| `pb-safe` | 하단 홈 인디케이터 회피 |
| `pb-safe-nav` | 하단 탭바 높이 + 홈 인디케이터 합산 |
| `min-h-content` | 콘텐츠 영역 최소 높이 (상하 fixed 요소 제외) |

> Safe area가 작동하려면 `index.html`의 `viewport-fit=cover`가 필수입니다. 이미 설정되어 있습니다.

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

## 디자인 토큰 (CSS 테마)

`src/styles/global.css`에 정의된 토큰을 Tailwind 유틸리티로 사용합니다.  
**hex 코드 직접 사용 금지 — 반드시 아래 토큰 이름으로 스타일링하세요.**

### 색상

```html
<!-- 배경 -->
<div class="bg-canvas">흰 배경</div>
<div class="bg-canvas-parchment">아이보리 배경 (섹션 교차, 푸터)</div>
<div class="bg-surface-tile-1">다크 타일</div>
<div class="bg-surface-black">글로벌 내비게이션</div>

<!-- 텍스트 -->
<p class="text-ink">기본 텍스트</p>
<p class="text-ink-muted-48">비활성 / 법률 문구</p>
<p class="text-on-dark">다크 배경 위 텍스트</p>

<!-- 인터랙션 (버튼, 링크) — 오직 이 토큰만 사용 -->
<button class="bg-primary text-on-primary">기본 버튼</button>
<a class="text-primary">링크</a>
<a class="text-primary-on-dark">다크 배경 위 링크</a>
```

| 토큰 | 색상 | 용도 |
|------|------|------|
| `primary` | #0066cc | 버튼, 링크, 포커스 링 — 유일한 인터랙션 색 |
| `primary-on-dark` | #2997ff | 다크 타일 위 링크 |
| `ink` | #1d1d1f | 라이트 배경 기본 텍스트 |
| `ink-muted-48` | #7a7a7a | 비활성, 법률 문구 |
| `canvas` | #ffffff | 기본 배경 |
| `canvas-parchment` | #f5f5f7 | 교차 섹션 배경, 푸터 |
| `surface-tile-1` | #272729 | 다크 타일 |
| `surface-black` | #000000 | 글로벌 내비게이션 |

전체 색상 목록은 `src/styles/global.css` 참조.

### 타이포그래피

```html
<!-- 폰트 패밀리 -->
<h1 class="font-display">헤딩 (SF Pro Display)</h1>
<p class="font-text">본문 (SF Pro Text)</p>

<!-- 폰트 크기 + 줄간격 (text-* 하나로 동시 적용) -->
<h1 class="font-display text-hero font-semibold tracking-hero">히어로 헤딩</h1>
<h2 class="font-display text-display-lg font-semibold">섹션 제목</h2>
<p class="font-text text-body tracking-body">본문</p>
<span class="font-text text-caption tracking-caption">캡션</span>
```

| 토큰 | 크기 | 주요 용도 |
|------|------|-----------|
| `text-hero` | 56px | 히어로 헤딩 |
| `text-display-lg` | 40px | 타일 섹션 제목 |
| `text-display-md` | 34px | 서브 섹션 제목 |
| `text-tagline` | 21px | 서브 내비, 태그라인 |
| `text-body` | 17px | 기본 본문 |
| `text-caption` | 14px | 캡션, 버튼 레이블 |
| `text-fine` | 12px | 내비 링크, 파인프린트 |

폰트 굵기: `font-light`(300) · `font-normal`(400) · `font-semibold`(600) · `font-bold`(700)

### 간격 · 라운드 · 그림자

```html
<!-- 간격 -->
<section class="py-section">타일 섹션 (상하 80px)</section>
<div class="p-lg gap-xs">카드 내부</div>

<!-- 라운드 -->
<button class="rounded-pill">프라이머리 CTA (시그니처 필)</button>
<div class="rounded-lg">카드</div>
<button class="rounded-sm">유틸리티 버튼</button>

<!-- 그림자 — 제품 이미지에만 사용 -->
<img class="shadow-product" src="..." />
```

| 토큰 | 값 | 용도 |
|------|-----|------|
| `spacing-section` | 80px | 타일 상하 패딩 |
| `spacing-lg` | 24px | 카드 내부 패딩 |
| `rounded-pill` | 9999px | 프라이머리 버튼, 검색창 |
| `rounded-lg` | 18px | 카드 |
| `rounded-sm` | 8px | 유틸리티 버튼 |
| `shadow-product` | — | 제품 이미지 전용 (카드·버튼에 사용 금지) |

### 컴포넌트 높이

| 변수 | 값 | 용도 |
|------|----|------|
| `--height-nav` | 44px | 상단 내비게이션 |
| `--height-bottom-nav` | 56px | 하단 탭 내비게이션 |
| `--height-sticky-bar` | 64px | 하단 플로팅 바 |

사용법: `h-[var(--height-bottom-nav)]`

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
