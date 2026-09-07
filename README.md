<p align="center">
  <img src=".github/dashboard-preview.png" alt="Fullstack Starter Dashboard" width="800" />
</p>

<h1 align="center">⚡ Fullstack Starter</h1>

<p align="center">
  <strong>Production-ready fullstack starter — Astro + NestJS + Supabase + PostgreSQL + Auth + CRUD. TypeScript everywhere.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Astro-6-FF5D01?style=flat-square&logo=astro&logoColor=white" alt="Astro" />
  <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-2.x-3FCF8E?style=flat-square&logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="MIT License" />
</p>

---

## 🚀 Getting Started

```bash
# 1. Clone the repo
git clone https://github.com/guyboireau/fullstack-starter.git && cd fullstack-starter

# 2. Install all dependencies
npm install

# 3. Configure environment variables
cp .env.example .env   # Then fill in your Supabase credentials

# 4. Start the dev servers
npm run dev
```

> **Frontend** → [http://localhost:4321](http://localhost:4321) &nbsp;|&nbsp; **API** → [http://localhost:3000](http://localhost:3000)

> ℹ️ `.env.example` still ships `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`, left over from the former React frontend — nothing reads them anymore. The variables actually in use are `SUPABASE_URL` and `SUPABASE_ANON_KEY` (web + api), plus `API_URL` (web, defaults to `http://localhost:3000`).

---

## 🏗️ Architecture

```
fullstack-starter/
├── apps/
│   ├── web/          → Astro 6 (SSR, output: 'server') + Tailwind 4 + Supabase SSR
│   └── api/          → NestJS 11 (REST API)
├── supabase/
│   ├── migrations/   → SQL migrations (profiles, items)
│   └── seed.sql      → Sample data
├── docker-compose.yml
└── .github/workflows/ci.yml
```

**How it works:** The Astro frontend authenticates users via **Supabase Auth** (email/password), server-side through `@supabase/ssr`. API calls are issued from the Astro server (page frontmatter), not from the browser. Authenticated requests hit the **NestJS API**, which validates JWTs using a custom `SupabaseAuthGuard`. All database operations go through Supabase's client library with **Row Level Security (RLS)** — each user can only access their own data. The API uses a user-scoped Supabase client that respects RLS policies automatically.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 **Authentication** | Login, Register, Logout via Supabase Auth |
| 📝 **CRUD** | Full Create, Read, Update, Delete on Items |
| 🛡️ **Auth Guard** | NestJS guard validates Supabase JWTs |
| 🔒 **Row Level Security** | PostgreSQL RLS — users only see their own data |
| 🎨 **Modern UI** | Dark mode, glassmorphism, gradient accents |
| 📊 **Dashboard** | Stats overview + item management |
| ✅ **Validation** | DTOs with `class-validator` on the API, Zod on the web side |
| 🐳 **Docker Compose** | ⚠️ **Not functional** — see [Docker](#-docker-current-state) |
| 🔄 **CI/CD** | ⚠️ **Broken on `apps/web`** — see [CI/CD](#-cicd-current-state) |
| 📦 **Monorepo** | npm workspaces — single `npm install` |

---

## 🗄️ Database Schema

### `profiles`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | References `auth.users` |
| `email` | TEXT | User email |
| `full_name` | TEXT | Display name |
| `avatar_url` | TEXT | Profile picture URL |
| `created_at` | TIMESTAMPTZ | Auto-set |

### `items`
| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID (PK) | Auto-generated |
| `user_id` | UUID (FK) | Owner reference |
| `title` | TEXT | Item title |
| `description` | TEXT | Optional details |
| `status` | TEXT | `todo` \| `in_progress` \| `done` |
| `created_at` | TIMESTAMPTZ | Auto-set |

---

## 🔑 API Endpoints

All endpoints under auth require a `Bearer` token in the `Authorization` header.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/auth/csrf` | ❌ | Issues a CSRF token (send it back as an `X-CSRF-Token` header on mutations — see `csrf.guard.ts`) |
| `GET` | `/auth/profile` | ✅ | Current user profile |
| `GET` | `/users/me` | ✅ | User profile from DB |
| `GET` | `/items` | ✅ | List all items |
| `GET` | `/items/:id` | ✅ | Get single item |
| `POST` | `/items` | ✅ | Create item |
| `PATCH` | `/items/:id` | ✅ | Update item |
| `DELETE` | `/items/:id` | ✅ | Delete item |

---

## ☁️ Deploy

### Frontend → Vercel

1. Import the `apps/web` directory on [Vercel](https://vercel.com)
2. Set the **Root Directory** to `apps/web`
3. Add environment variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `API_URL` (public URL of the deployed NestJS API)
4. Deploy 🚀

> ⚠️ These are `SUPABASE_URL` / `SUPABASE_ANON_KEY` **without the `VITE_` prefix**: `apps/web/src/lib/supabase.ts` reads `import.meta.env.SUPABASE_URL`. A deployment configured with `VITE_*` variables crashes at boot (`supabaseUrl is required`).

### Backend → Railway / Render

1. Create a new service on [Railway](https://railway.app) or [Render](https://render.com)
2. Set the **Root Directory** to `apps/api`
3. Build command: `npm run build`
4. Start command: `node dist/main`
5. Add environment variables from `.env.example`

---

## 🧰 Supabase Setup

1. Create a new project at [app.supabase.com](https://app.supabase.com)
2. Go to **SQL Editor** and run the migration files in order:
   - `supabase/migrations/00001_create_profiles.sql`
   - `supabase/migrations/00002_create_items.sql`
3. Copy your project URL + anon key from **Settings → API**
4. Paste them in your `.env` file

---

## 🐳 Docker (current state)

> ⚠️ **`docker compose up` does not work as-is.** `docker-compose.yml` declares `apps/api/Dockerfile` and `apps/web/Dockerfile` — **neither exists in the repo**. Building the `api` and `web` services fails immediately.
>
> The `db` service is the only one that doesn't depend on a Dockerfile (it pulls the `postgres:15-alpine` image directly), so it's the only one this blocker doesn't affect:
>
> ```bash
> docker compose up -d db
> ```
>
> Restoring the full stack requires writing the two missing Dockerfiles. Note also that the `web` service still maps port `5173` (a Vite leftover) while Astro serves on `4321`.

---

## 🔄 CI/CD (current state)

> ⚠️ **The `.github/workflows/ci.yml` workflow breaks at its first step.**
>
> It runs `npm run lint -w apps/web`, but `apps/web/package.json` defines **neither `lint` nor `typecheck`** (its only scripts are `dev`, `build`, `preview`, `astro`) → `Missing script: "lint"`. The `Lint (web)` and `Type check (web)` steps both fail.
>
> The workflow also injects `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` into the `apps/web` build — variables the code no longer reads (see [Deploy](#frontend--vercel)).
>
> On the `apps/api` side, `lint` and `typecheck` do exist and work.

---

## 📄 License

[MIT](./LICENSE) — use it, fork it, build with it.
