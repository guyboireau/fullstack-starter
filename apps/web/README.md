# web — Astro frontend

The Astro 7 SSR app of the [Fullstack Starter](../../README.md) monorepo: the public landing page, the login and register pages, and the admin panel (`/admin`).

- **Rendering**: `output: 'server'` with the `@astrojs/vercel` adapter (`astro.config.mjs`). Tailwind CSS 4 is loaded through its Vite plugin.
- **Auth**: Supabase Auth through `@supabase/ssr`, with the session kept in cookies. `src/middleware/index.ts` only protects `/admin` and its sub-routes; every other page is public.
- **Data access**: pages and components go through `src/services/` (`auth.ts`, `items.ts`). ESLint (`eslint.config.js`) forbids them from importing `lib/supabase` directly. Items are read and written through the NestJS API.
- **CSRF**: the login, register, items and sign-out forms carry a double-submit token (`src/lib/csrf.ts`).
- **Environment**: `SUPABASE_URL`, `SUPABASE_ANON_KEY` and `API_URL` are read at runtime from `process.env` (`src/lib/env.ts`), never inlined at build time. In development, `astro.config.mjs` loads `apps/web/.env` first, then the root `.env`.

## Commands

From this folder, or from the repository root with `-w apps/web`:

| Command | Action |
| :-- | :-- |
| `npm run dev` | Dev server on `localhost:4321` |
| `npm run build` | Production build (Vercel Build Output in `apps/web/.vercel/output`) |
| `npm run lint` | `astro check` + ESLint |
| `npm run typecheck` | `astro check` |
| `npm run test` | Vitest |

Deploying to Vercel goes through `npm run build:vercel` at the repository root: see the root README.
