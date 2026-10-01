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
| `npm run check:ia` | Pre-launch guard: blocks if the site still looks AI-made (see below) |

Deploying to Vercel goes through `npm run build:vercel` at the repository root: see the root README.

## Before putting a client site online

1. Copy `DESIGN.modele.md` to `DESIGN.md` and fill it in with the client
   (direction, colours, fonts, radius, tone, real proof, photos to take).
2. Fill in `src/config/site.ts`: every field in square brackets must go.
3. Replace the `placeholder-*.png` images with real photos of the client.
4. Set the admin brand colour once, in the `--color-primary-*` tokens of
   `src/styles/global.css` (login, register and items pages use `primary-*`).
5. Run `npm run check:ia`: it must answer « Aucun point bloquant ».

The template no longer ships AI-generated photos, hard-coded five-star ratings,
default indigo, or emojis used as icons. Testimonials are off by default
(`features.testimonials`): turn them on only with real reviews, each with its
rating and source.
