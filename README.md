# EduTrack

Academic Student Progress Management System for students in Bangladesh.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, NextAuth, TanStack Query, Zustand, React Hook Form, Zod, Recharts
- **Backend:** Express.js, TypeScript, Prisma, PostgreSQL
- **Auth:** Google OAuth — accounts must be pre-registered (no auto-signup)

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

PostgreSQL is exposed on **localhost:5433** (to avoid conflicts with local Postgres on 5432).

### 2. Configure environment

Copy `.env.example` values into:

- `backend/.env`
- `frontend/.env.local`

Set Google OAuth credentials from [Google Cloud Console](https://console.cloud.google.com/):

- Authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

### 3. Install & migrate

```bash
npm install
npm run db:generate -w backend
npm run db:migrate -w backend
npm run db:seed -w backend
```

### 4. Run apps

```bash
# Terminal 1
npm run dev:backend

# Terminal 2
npm run dev:frontend
```

- Frontend: http://localhost:3000  
- API: http://localhost:4000  
- Health: http://localhost:4000/health  

## Seed accounts

Email/password (after `npm run db:seed -w backend`):

| Role    | Email                  | Password     |
|---------|------------------------|--------------|
| Admin   | `admin@edutrack.local` | `Admin@123`  |
| Student | `rahim@edutrack.local` | `Student@123`|
| Student | `karim@edutrack.local` | `Student@123`|
| Student | `sadia@edutrack.local` | `Student@123`|

Or open `/register` to create a new student account.

Google OAuth is optional — set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` in `frontend/.env.local`.

## Roles & redirects

- `ADMIN` / `TEACHER` → `/admin/dashboard`
- `STUDENT` → `/student/dashboard`
- Unregistered Google accounts → login error: **Account not registered**

## API overview

| Area        | Base path            |
|-------------|----------------------|
| Auth        | `/api/auth`          |
| Students    | `/api/students`      |
| Subjects    | `/api/subjects`      |
| Study logs  | `/api/study-logs`    |
| Scores      | `/api/scores`        |
| Notes       | `/api/notes`         |
| Goals       | `/api/goals`         |
| Dashboard   | `/api/dashboard`     |
| Activities  | `/api/activities`    |
| Reports     | `/api/reports`       |

All responses use `{ success, data, error?, meta? }`.

## File uploads

Default storage is local (`STORAGE_PROVIDER=local`, files under `backend/uploads`).  
S3 / Cloudinary can be wired via the same storage abstraction.

## State management

- **Server state:** TanStack Query via hooks in `frontend/src/hooks/use-server-state.ts` (centralized keys in `lib/query-keys.ts`)
- **UI state only:** Zustand (`stores/uiStore.ts` — sidebar open/close)
- Imperative downloads (CSV / note files) call `services/api` directly; everything else is cached through Query

## Project structure

```text
EduTrack/
├── frontend/     # Next.js app
├── backend/      # Express API + Prisma
├── docker-compose.yml
└── README.md
```
