# NMR Scheduler

실험실 기기 예약 시스템 - KAIST 스타일의 NMR 분석기 예약 웹 애플리케이션

## Overview

NMR Scheduler는 연구실의 NMR 분석 기기 예약을 관리하기 위한 웹 애플리케이션입니다. 
24시간 10분 단위의 시간표, 회원가입/로그인, 관리자 승인 기능을 포함합니다.

## Features

- **24시간 시간표**: 00:00 ~ 23:50까지 10분 단위 예약 슬롯
- **30분 예약 제한**: 한 사람당 최대 3칸(30분) 연속 예약 가능
- **회원가입/로그인**: Replit Auth를 통한 인증
- **관리자 승인**: 새 사용자는 관리자 승인 후 예약 가능
- **날짜 네비게이션**: 달력을 통한 날짜 선택
- **다크 모드**: 라이트/다크 테마 전환

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (Neon)
- **Auth**: Replit OpenID Connect
- **ORM**: Drizzle ORM

## Project Structure

```
├── client/
│   ├── src/
│   │   ├── components/      # React 컴포넌트
│   │   │   ├── ui/          # Shadcn UI 컴포넌트
│   │   │   ├── Header.tsx   # 상단 네비게이션
│   │   │   ├── TimeTable.tsx    # 시간표 그리드
│   │   │   ├── DateNavigator.tsx # 날짜 네비게이션
│   │   │   └── ThemeToggle.tsx   # 테마 전환 버튼
│   │   ├── hooks/           # React 훅
│   │   ├── lib/             # 유틸리티
│   │   ├── pages/           # 페이지 컴포넌트
│   │   │   ├── Landing.tsx  # 랜딩 페이지
│   │   │   ├── Home.tsx     # 메인 예약 페이지
│   │   │   └── Admin.tsx    # 관리자 대시보드
│   │   └── App.tsx          # 메인 앱 컴포넌트
├── server/
│   ├── db.ts               # 데이터베이스 연결
│   ├── storage.ts          # 데이터 액세스 레이어
│   ├── replitAuth.ts       # Replit Auth 설정
│   └── routes.ts           # API 라우트
├── shared/
│   └── schema.ts           # 데이터베이스 스키마
└── design_guidelines.md    # 디자인 가이드라인
```

## Database Schema

### users
- id: 사용자 ID (Replit sub claim)
- email: 이메일
- firstName, lastName: 이름
- profileImageUrl: 프로필 이미지
- isApproved: 승인 여부
- isAdmin: 관리자 여부

### reservations
- id: 예약 ID
- userId: 사용자 ID
- date: 예약 날짜
- startTime, endTime: 시작/종료 시간
- userName: 예약자 이름

### sessions
- Replit Auth 세션 저장용

## API Routes

### Auth
- `GET /api/login` - 로그인 시작
- `GET /api/callback` - OAuth 콜백
- `GET /api/logout` - 로그아웃
- `GET /api/auth/user` - 현재 사용자 정보

### Reservations
- `GET /api/reservations?date=YYYY-MM-DD` - 날짜별 예약 조회
- `POST /api/reservations` - 예약 생성
- `DELETE /api/reservations/:id` - 예약 삭제

### Admin
- `GET /api/admin/users` - 전체 사용자 목록
- `GET /api/admin/users/pending` - 승인 대기 사용자
- `POST /api/admin/users/:id/approve` - 사용자 승인
- `POST /api/admin/users/:id/reject` - 사용자 거부
- `GET /api/admin/reservations` - 전체 예약 목록

## Running the Project

```bash
npm run dev
```

## Making First Admin

첫 번째 관리자를 설정하려면 데이터베이스에서 직접 사용자의 `is_admin`과 `is_approved`를 `true`로 설정하세요.

## Recent Changes

- December 2025: Full implementation complete
  - 24시간 10분 단위 시간표 구현
  - Replit Auth 통합 (OpenID Connect)
  - 관리자 대시보드 및 사용자 승인 시스템
  - 다크/라이트 모드 지원
  - Zod를 통한 서버 측 유효성 검사 (30분 예약 제한, 10분 단위, 중복 검증)
  - Material Design 3 / Ant Design 하이브리드 스타일
