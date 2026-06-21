# 어디가까 Frontend

어디가까 서비스의 React 기반 프론트엔드 웹 애플리케이션입니다.

## Branch Strategy

- main: 최종 배포/안정 브랜치
- develop: 기능 작업 통합 브랜치
- feature/*: 기능 작업 브랜치

## Workflow

1. develop 브랜치에서 feature 브랜치를 생성합니다.
2. 작업 완료 후 feature 브랜치에서 develop 브랜치로 Pull Request를 생성합니다.
3. PR 리뷰 및 검증 후 Squash Merge합니다.
4. 배포 전 develop 브랜치에서 main 브랜치로 Pull Request를 생성합니다.

## Merge Policy

- Squash Merge만 사용합니다.
- Merge Commit은 사용하지 않습니다.
- Rebase Merge는 사용하지 않습니다.
- 머지 후 feature 브랜치는 자동 삭제합니다.

## Branch Protection

- main, develop 브랜치는 Ruleset으로 보호합니다.
- 직접 push하지 않고 Pull Request를 통해서만 반영합니다.
- 프론트 CI 구성 후 필수 status check를 추가할 예정입니다.

## Environment

- 실제 환경변수 파일(.env)은 커밋하지 않습니다.
- 환경변수 예시는 .env.example에 작성합니다.
