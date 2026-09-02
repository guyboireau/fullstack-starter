<p align="center">
  <img src=".github/dashboard-preview.png" alt="Fullstack Starter Dashboard" width="800" />
</p>

<h1 align="center">⚡ Fullstack Starter</h1>

<p align="center">
  <strong>Production-ready fullstack starter — Astro SSR + NestJS + Supabase + PostgreSQL + Auth + CRUD + CSRF. TypeScript everywhere.</strong>
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

> **Prerequisites:** Node.js **≥ 22.12** (required by Astro 6) and npm.

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

---

## 🏗️ Architecture

```
fullstack-starter/
├── apps/
│   ├── web/          → Astro 6 SSR + Vercel adapter (landing + admin panel)
│   │   ├── eslint.config.js  → flat config + service-layer rule
│   │   └── src/services/     → sole entry point for DB/auth access
│   └── api/          → NestJS 11 (REST API)
├── supabase/
│   ├── migrations/   → SQL migrations (profiles, items)
│   └── seed.sql      → Sample data
├── docker-compose.yml
└── .github/workflows/ci.yml
```

**How it works:** The Astro SSR frontend authenticates users via **Supabase Auth** (email/password). Authenticated requests hit the **NestJS API**, which validates JWTs with a custom `SupabaseAuthGuard`. Session-changing forms (login, register, signout, items) are protected by a **CSRF guard** (double-submit cookie pattern) — Bearer-token requests bypass it automatically. All database operations use Supabase's client library with **Row Level Security (RLS)** — each user can only access their own data.

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🔐 **Authentication** | Login, Register, Logout via Supabase Auth |
| 📝 **CRUD** | Full Create, Read, Update, Delete on Items |
| 🛡️ **Auth Guard** | NestJS guard validates Supabase JWTs |
| 🔒 **Row Level Security** | PostgreSQL RLS — users only see their own data |
| 🔑 **CSRF Protection** | Double-submit cookie on all session-mutating forms; Bearer bypasses |
| 🎨 **Design System** | 8-variant design switcher (A→H) — demo multiple client styles |
| 📊 **Admin Panel** | Astro SSR admin panel (items management, dashboard) |
| ✅ **Validation** | DTOs with `class-validator` on the API |
| 🧹 **Service-Layer Rule** | ESLint `no-restricted-imports` forbids direct Supabase imports in pages/components — all DB access goes through `src/services/` |
| 🧭 **Strict TypeScript** | `strict` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature` |
| 🐳 **Docker Compose** | One-command local dev environment |
| 🔄 **CI/CD** | GitHub Actions (Node 22): lint + typecheck on every PR |
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
| `GET` | `/auth/profile` | ✅ | Current user profile |
| `GET` | `/users/me` | ✅ | User profile from DB |
| `GET` | `/items` | ✅ | List all items |
| `GET` | `/items/:id` | ✅ | Get single item |
| `POST` | `/items` | ✅ | Create item |
| `PATCH` | `/items/:id` | ✅ | Update item |
| `DELETE` | `/items/:id` | ✅ | Delete item |

---

## 🔒 Security

### CSRF Protection

The API includes CSRF middleware to protect state-mutating endpoints (`POST`, `PUT`, `PATCH`, `DELETE`).

- CSRF tokens are generated server-side and verified on every non-safe request
- The token is expected in the `X-CSRF-Token` header (set automatically by the frontend)
- **Bearer token bypass**: requests from machine clients (CI, scripts, mobile) that include a valid `Authorization: Bearer <token>` header skip CSRF verification

The guard lives in `apps/api/src/common/guards/csrf.guard.ts`; the Astro side
(token generation and form validation) is in `apps/web/src/lib/csrf.ts`.

---

## 🧹 Code Quality

### Service-Layer Rule (ESLint)

`apps/web/eslint.config.js` (flat config: `@eslint/js` + `typescript-eslint` + `eslint-plugin-astro`) enforces a `no-restricted-imports` rule that **blocks direct Supabase imports in pages and components**. All database and auth access must go through `src/services/` (e.g. `@/services/auth`). This keeps data access centralized and typed — the same pattern eliminated 142 TypeScript errors on a downstream client project.

```bash
npm run lint   # astro check && eslint src (in apps/web)
```

### Strict TypeScript

Beyond `strict: true`, `apps/web/tsconfig.json` enables three extra guards to catch silent errors at compile time:

- `noUncheckedIndexedAccess` — array/record access returns `T | undefined`
- `exactOptionalPropertyTypes` — `undefined` is not assignable to optional props implicitly
- `noPropertyAccessFromIndexSignature` — index-signature access requires bracket notation (e.g. `process.env['KEY']`)

---

## ☁️ Deploy

### Frontend → Vercel

1. Import the repository on [Vercel](https://vercel.com)
2. Leave the **Root Directory** at the repository root (the default)
3. Add these environment variables — the names must match exactly, they are read
   at runtime by the SSR function:

   | Variable | Example |
   |----------|---------|
   | `SUPABASE_URL` | `https://your-project.supabase.co` |
   | `SUPABASE_ANON_KEY` | `eyJhbGciOi…` |
   | `API_URL` | public URL of the deployed NestJS API |

   > These are **server-side** variables and must **not** be prefixed with
   > `PUBLIC_`. A `PUBLIC_` prefix would expose them to the browser *and* they
   > would no longer match what the code reads.

4. `vercel.json` runs `npm run build:vercel`, which builds the Astro app and
   moves the Build Output API directory to `.vercel/output` at the repository
   root — where Vercel expects it in a monorepo
5. Deploy 🚀

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

## 🐳 Docker (optional)

```bash
# Start all services (PostgreSQL + API + Web)
docker compose up -d

# View logs
docker compose logs -f

# Stop everything
docker compose down
```

---

## 🏆 Built with this stack

This isn't a tutorial copy-paste — it's the production stack I use for real client projects:

- **[Niido](https://niido.fr)** — Rental management platform
- **[La Lucarne](https://lalucarne.fr)** — Real estate agency
- **[Les Cours de Clara](https://lescoursdeclara.fr)** — Online tutoring platform

---

## 📄 License

[MIT](./LICENSE) — use it, fork it, build with it.
