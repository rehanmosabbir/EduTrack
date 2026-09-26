# EduTrack

Academic Student Progress Management System for students in Bangladesh.

## Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, NextAuth, TanStack Query, Zustand, React Hook Form, Zod, Recharts
- **Backend:** Express.js, TypeScript, Prisma, PostgreSQL
- **Auth:** Google OAuth + email/password (Google first login auto-creates a student)

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
- New Google accounts are auto-created as `STUDENT`

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
├── frontend/                 # Next.js app (Vercel)
├── backend/                  # Express API + Prisma (Railway)
├── .github/workflows/        # CI + deploy on push to main
├── docker-compose.yml        # Local Postgres
├── railway.toml              # Railway build/start
├── vercel.json               # Optional root Vercel hints
├── frontend/vercel.json      # Vercel app config (Root Directory = frontend)
└── README.md
```

## Production deploy (Vercel + Railway)

Architecture: **Vercel** hosts the Next.js frontend; **Railway** hosts the Express API and Postgres. Pushing to `main` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml) (tests → deploy both).

### 1. Railway (API + database)

1. Create a project at [railway.app](https://railway.app) and add a **PostgreSQL** plugin.
2. Add a new **Empty Service** (or deploy from this GitHub repo). Root Directory = repo root (uses [railway.toml](railway.toml)).
3. Attach a **Volume** mounted at `/data/uploads` (persists note uploads across redeploys).
4. Set these variables on the API service:

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | From the Postgres plugin (reference variable) |
| `FRONTEND_URL` | Your Vercel URL, e.g. `https://your-app.vercel.app` |
| `JWT_SECRET` | Long random string (16+ chars) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Same as frontend (optional) |
| `STORAGE_PROVIDER` | `local` |
| `UPLOAD_DIR` | `/data/uploads` |
| `NODE_ENV` | `production` |

5. Generate a public domain for the API service (e.g. `https://edutrack-api.up.railway.app`). Health check: `GET /health`.
6. Create a **Railway API token** (Account → Tokens). Note the **Project ID** and **Service ID** from the Railway dashboard (or CLI).

Optional one-time seed in Railway shell:

```bash
npm run db:seed -w backend
```

### 2. Vercel (frontend)

1. Import the GitHub repo at [vercel.com](https://vercel.com). Set **Root Directory** to `frontend` (uses [frontend/vercel.json](frontend/vercel.json); install runs from the monorepo root).
2. Confirm **Install Command** is `cd .. && npm install` (set in `frontend/vercel.json`).
3. Set environment variables:

| Variable | Value |
|----------|--------|
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Long random string |
| `NEXT_PUBLIC_API_URL` | `https://your-railway-api.up.railway.app/api` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |

4. Link the project locally once (to capture IDs for GitHub Actions):

```bash
npx vercel link
```

When prompted, set the project root directory to `frontend`. Copy **Org ID** and **Project ID** from `.vercel/project.json`. Create a Vercel token under Account → Settings → Tokens.

5. Turn off Vercel’s automatic Git deploys if you want **only** GitHub Actions to deploy (Project → Settings → Git → Ignored Build Step: `exit 0`), otherwise both may deploy.

### 3. Google OAuth (production)

In [Google Cloud Console](https://console.cloud.google.com/) → Credentials → your OAuth client:

- Authorized JavaScript origins: `https://your-app.vercel.app`
- Authorized redirect URI: `https://your-app.vercel.app/api/auth/callback/google`

Keep the localhost entries for local development.

### 4. GitHub Actions secrets

Repository → Settings → Secrets and variables → Actions. Add:

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel account token |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |
| `RAILWAY_TOKEN` | Railway account token |
| `RAILWAY_PROJECT_ID` | Railway project ID |
| `RAILWAY_SERVICE_ID` | Railway API service ID |

After secrets are set, every push to `main` (or a manual **workflow_dispatch**) runs tests, then deploys frontend to Vercel and backend to Railway.

### CORS note

Backend `FRONTEND_URL` must exactly match the Vercel origin (scheme + host, no trailing slash) or browser API calls will be blocked.