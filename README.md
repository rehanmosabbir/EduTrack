# EduTrack — Coaching Student Management

Private coaching system for assigning individual homework, recording lesson evaluations and marks, tracking date-wise academic history, and communicating with guardians.

**Stack:** Next.js 15 (App Router) + TypeScript API routes, Prisma, PostgreSQL, NextAuth, Tailwind, TanStack Query, Zod, Recharts, Vitest.

No separate backend — everything runs on Next.js and deploys to **Vercel**.

## Roles

| Role | Portal |
|------|--------|
| TEACHER | `/teacher/*` |
| STUDENT | `/student/*` (read-only academics) |
| GUARDIAN | `/guardian/*` (linked children + comments) |

## Local setup

### 1. PostgreSQL

```bash
docker compose up -d
```

Postgres: `localhost:5433` (user/pass/db: `edutrack`).

### 2. Environment

Copy [`.env.example`](.env.example) to `.env.local` and set at least:

- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `JWT_SECRET`
- `NEXTAUTH_URL=http://localhost:3000`
- `NEXT_PUBLIC_API_URL=/api`

### 3. Install, migrate, seed

```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Seed accounts

| Role | Email | Password |
|------|-------|----------|
| Teacher | `teacher@edutrack.local` | `Teacher@123` |
| Student | `rahim@edutrack.local` | `Student@123` |
| Guardian | `guardian@edutrack.local` | `Guardian@123` |

## Tests

```bash
npm test
```

Covers marks math (missing ≠ zero), Zod validation, and authorization helpers.

## Deploy to Vercel (GitHub Actions)

Pushing to `main` / `master` runs [.github/workflows/deploy.yml](.github/workflows/deploy.yml): tests → production deploy via the Vercel CLI.

### 1. Create the Vercel project (once)

```bash
npm install -g vercel
vercel login
vercel link
```

Link from the repo root (Root Directory = `.`).  
Copy IDs from `.vercel/project.json`:

- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

Create a token at [vercel.com/account/tokens](https://vercel.com/account/tokens) → `VERCEL_TOKEN`.

### 2. GitHub secrets

Repo → **Settings → Secrets and variables → Actions**. Add:

| Secret | Source |
|--------|--------|
| `VERCEL_TOKEN` | Vercel account token |
| `VERCEL_ORG_ID` | `.vercel/project.json` → `orgId` |
| `VERCEL_PROJECT_ID` | `.vercel/project.json` → `projectId` |

### 3. Vercel environment variables

In the Vercel project → **Settings → Environment Variables** (Production):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Managed Postgres (Neon / Vercel Postgres / Supabase) |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | Long random string |
| `JWT_SECRET` | Long random string (16+) |
| `NEXT_PUBLIC_API_URL` | `/api` |

### 4. Avoid double deploys

If the GitHub repo is also connected in Vercel for automatic Git deploys, either:

- rely on **GitHub Actions only** and disable Vercel Git deploys (Project → Settings → Git → Ignored Build Step: `exit 0`), or  
- remove the Actions deploy job and use Vercel Git only.

### 5. Production migrations (once / when schema changes)

```bash
DATABASE_URL="..." npm run db:migrate:deploy
DATABASE_URL="..." npm run db:seed   # optional demo data
```

After secrets are set, every push to `main` deploys. You can also run the workflow manually via **Actions → CI and Deploy → Run workflow**.

## Project layout

```text
prisma/                 # schema, migrations, seed
src/app/api/            # Next.js API routes
src/app/teacher|student|guardian/
src/server/             # services, auth, validators
```

## Core features

- Individual homework (never auto-assigned to a whole class)
- Lesson preparation + homework completion + optional marks
- Date-wise history with filters
- Weighted subject averages: Σ obtained ÷ Σ maximum × 100
- Guardian comments / teacher replies (students excluded)
- Audit log for academic changes
- Private teacher notes stripped from student/guardian APIs
