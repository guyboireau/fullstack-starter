# 🤖 Guide de Développement — Fullstack Starter

> **Document de contexte pour agent IA de codage (Claude Code).**
> Décrit l'**état réel du code**, pas une spécification. Vérifie toujours dans le code avant d'agir.
> Dernière synchro : 2026-07-01.

---

## Contexte projet

Projet interne : **template / starter fullstack production-ready**, organisé en **monorepo npm workspaces**. Sert de base réutilisable pour démarrer une app avec front SSR, API REST, auth et CRUD prêts à l'emploi.

- **Auteur** : Guy Boireau — Licence MIT.
- Deux applications : `apps/web` (front Astro SSR) et `apps/api` (API NestJS), + `supabase/` (migrations SQL + seed).

> **Front = Astro 6 en SSR** (adapter Vercel), pas React/Vite (héritage retiré). Certains textes du `README.md` peuvent encore évoquer React — se fier au code.

---

## Stack technique (versions réelles depuis les `package.json`)

```yaml
Monorepo:      npm workspaces (apps/web, apps/api) + concurrently 9
Front (web):   Astro 6.3 (output: 'server' SSR) + adapter @astrojs/vercel 10
               Tailwind CSS v4 (@tailwindcss/vite) — config CSS, pas de tailwind.config
               @supabase/ssr 0.10 + @supabase/supabase-js 2.105 · Zod 4
API (api):     NestJS 11 (@nestjs/common/core/platform-express)
               @nestjs/config 4 · @nestjs/throttler 6 · helmet 8 · cookie-parser
               class-validator 0.14 + class-transformer · @supabase/supabase-js 2.105 · Zod 4
Language:      TypeScript 5.7 (strict étendu) — tout en TS
DB:            Supabase (PostgreSQL) + RLS · Postgres 15 en local (Docker)
Tests:         Vitest 4 (déclaré côté api ; aucun fichier *.test.ts présent à ce jour)
Lint:          ESLint 9 (flat config) + typescript-eslint 8 · eslint-plugin-astro (web)
Node:          >= 22.12 (requis par Astro 6 ; CI sur Node 22)
Déploiement:   Vercel (vercel.json → framework astro, build apps/web)
```

---

## Structure du monorepo

```
fullstack-starter/
├── package.json                # workspaces + scripts orchestrés (dev/build/lint/typecheck)
├── tsconfig.base.json          # base TS strict étendu (héritée par apps/api)
├── vercel.json                 # build apps/web, framework astro
├── docker-compose.yml          # Postgres 15 + api + web (Astro SSR)
├── .env.example
├── .github/workflows/ci.yml    # lint + typecheck + build (web & api), Node 22
├── supabase/
│   ├── migrations/00001_create_profiles.sql
│   ├── migrations/00002_create_items.sql
│   └── seed.sql
├── apps/web/                   # Astro 6 SSR
│   ├── astro.config.mjs        # output:'server', adapter vercel, alias @→/src
│   ├── tsconfig.json           # extends astro/tsconfigs/strict, paths @/*
│   ├── eslint.config.js        # ⭐ règle service-layer (no-restricted-imports)
│   └── src/
│       ├── middleware/index.ts # garde d'auth SSR (redirige vers /login)
│       ├── lib/supabase.ts     # createSupabaseServerClient (SSR, cookies)
│       ├── lib/csrf.ts         # CSRF formulaires Astro (cookie httpOnly + input _csrf)
│       ├── services/           # ⭐ auth.ts, items.ts — SEUL accès DB/API autorisé
│       ├── schemas/item.ts     # schémas Zod (item)
│       ├── config/site.ts      # config site unique (branding, contenus, variantes)
│       ├── pages/              # index, login, register, admin/*, api/auth/signout.ts
│       ├── layouts/            # Layout.astro, AdminLayout.astro
│       ├── components/         # Hero, Services, Pricing, ..., DesignSwitcher.astro
│       └── styles/global.css
└── apps/api/                   # NestJS 11
    ├── tsconfig.json           # extends ../../tsconfig.base.json (strict étendu)
    ├── eslint.config.mjs
    └── src/
        ├── main.ts             # bootstrap : helmet, cookie-parser, CSRF middleware, CORS, ValidationPipe
        ├── app.module.ts       # ConfigModule + Throttler + Auth/Users/Items ; APP_GUARD Throttler+Csrf ; APP_FILTER
        ├── auth/               # auth.controller/service, guards/supabase-auth.guard.ts
        ├── users/              # users.controller/service (GET /users/me)
        ├── items/              # items.controller/service + dto/{create,update}-item.dto.ts
        └── common/             # guards/csrf.guard.ts, filters/all-exceptions.filter.ts
```

---

## Architecture / fonctionnement

1. **Auth Supabase → API NestJS (JWT Bearer)**
   - Le front (Astro SSR) authentifie via `@supabase/ssr` (cookies) : `login.astro`, `register.astro`, middleware SSR.
   - `src/middleware/index.ts` protège toutes les routes sauf `/login` et `/register` : si pas d'utilisateur → redirection `/login`.
   - Les appels à l'API portent le JWT Supabase en header `Authorization: Bearer <token>`.
   - Côté API, `SupabaseAuthGuard` (`auth/guards/supabase-auth.guard.ts`) extrait le token, le valide via `AuthService.validateToken()` (client service-role), puis attache `req.user` + `req.accessToken`.

2. **RLS respectée par client scopé**
   - `AuthService.getClientForUser(accessToken)` crée un client Supabase **anon** avec le header `Authorization` de l'utilisateur → les **policies RLS** s'appliquent.
   - Les services (`items.service.ts`, `users.service.ts`) utilisent ce client scopé. Le filtre `.eq('user_id', ...)` est redondant avec la RLS (defense in depth).
   - Le client **service-role** n'est utilisé que pour valider le JWT.

3. **CSRF — deux mécanismes distincts**
   - **API NestJS (double-submit cookie)** : `main.ts` pose un cookie `csrf-secret` (non httpOnly, 24h) ; `CsrfGuard` (global via `APP_GUARD`) exige l'en-tête `X-CSRF-Token` égal au cookie sur les méthodes non-safe. **Bypass** : GET/HEAD/OPTIONS, et requêtes avec `Authorization: Bearer ` (le Bearer prévient déjà le CSRF). Token exposé via `GET /auth/csrf`.
   - **Formulaires Astro** : `lib/csrf.ts` — cookie `astro-csrf-token` httpOnly (1h) + champ caché `_csrf` ; `validateCsrfToken()` vérifie le POST (ex. `pages/api/auth/signout.ts`).

4. **Sécurité API** : `helmet()`, CORS restreint à `CORS_ORIGIN` (credentials), `ThrottlerModule` (10 req / 10 s global), `ValidationPipe` global (`whitelist` + `forbidNonWhitelisted` + `transform`), `AllExceptionsFilter` global.

---

## Base de données (`supabase/migrations/`)

| Table | Colonnes clés | RLS |
|-------|---------------|-----|
| `profiles` | `id` (PK, FK `auth.users`, ON DELETE CASCADE), `email` NOT NULL, `full_name`, `avatar_url`, `created_at`, `updated_at` | SELECT/UPDATE/INSERT limités à `auth.uid() = id`. Auto-créée à l'inscription via trigger `on_auth_user_created` → fonction `handle_new_user()` (SECURITY DEFINER). |
| `items` | `id` (UUID PK), `user_id` (FK `auth.users`, CASCADE, NOT NULL), `title` NOT NULL, `description`, `status` (`todo`/`in_progress`/`done`, défaut `todo`), `created_at`, `updated_at` | SELECT/INSERT/UPDATE/DELETE limités à `auth.uid() = user_id`. Index sur `user_id`, `status`, `created_at DESC`. |

RLS activée sur les deux tables. Seed : `supabase/seed.sql`.

---

## API endpoints

Base URL par défaut : `http://localhost:3000` (front : `import.meta.env.API_URL`).

| Méthode | Endpoint | Auth | Description |
|---------|----------|------|-------------|
| GET | `/auth/csrf` | Non | Retourne le token CSRF (double-submit) |
| GET | `/auth/profile` | Bearer | Profil issu du JWT (`id`, `email`, `user_metadata`, `created_at`) |
| GET | `/users/me` | Bearer | Ligne `profiles` de l'utilisateur (client scopé RLS) |
| GET | `/items` | Bearer | Liste des items de l'utilisateur (tri `created_at` desc) |
| GET | `/items/:id` | Bearer | Un item (404 sinon) |
| POST | `/items` | Bearer | Crée un item (`CreateItemDto`) |
| PATCH | `/items/:id` | Bearer | Met à jour un item (`UpdateItemDto`) |
| DELETE | `/items/:id` | Bearer | Supprime un item |

`ItemsController` protège toute la ressource via `@UseGuards(SupabaseAuthGuard)`. Les mutations passent aussi le `CsrfGuard` global (bypass si Bearer). DTOs validés par class-validator + trim via class-transformer.

---

## Qualité de code

1. **⭐ Règle service-layer (ESLint web)** — `apps/web/eslint.config.js` : `no-restricted-imports` (niveau **error**) interdit d'importer `**/lib/supabase` ou `@/lib/supabase` depuis `src/pages/**` et `src/components/**`. **Tout accès DB/Supabase doit passer par `src/services/`.** Message : « Les pages/composants ne doivent pas importer Supabase directement. Passez par un service de src/services/. »
2. **TypeScript strict étendu** — `tsconfig.base.json` (hérité par `apps/api`) active `strict` + `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`. `apps/web/tsconfig.json` étend `astro/tsconfigs/strict` (preset strict Astro) avec alias `@/*` → `src/*`.
3. **Node >= 22.12** — imposé par `apps/web/package.json` (`engines`) et Astro 6. CI (`.github/workflows/ci.yml`) tourne sur Node 22.
4. **CI** : lint + typecheck + build pour web et api. Aucun step `test` en CI (Vitest présent côté api mais pas de fichiers de test).

---

## Variables d'environnement (réellement lues par le code)

```bash
# Front (Astro, import.meta.env — SSR)
SUPABASE_URL=                 # lib/supabase.ts
SUPABASE_ANON_KEY=            # lib/supabase.ts
API_URL=                      # services/items.ts (défaut http://localhost:3000)

# API (NestJS, process.env / ConfigService)
SUPABASE_URL=                 # auth.service.ts
SUPABASE_ANON_KEY=            # auth.service.ts (client scopé RLS)
SUPABASE_SERVICE_ROLE_KEY=    # auth.service.ts (validation JWT)
API_PORT=                     # main.ts (défaut 3000)
CORS_ORIGIN=                  # main.ts (défaut http://localhost:5173)
NODE_ENV=                     # main.ts (cookie secure en production)

# Docker / Postgres local (docker-compose.yml, .env)
POSTGRES_USER= POSTGRES_PASSWORD= POSTGRES_DB= POSTGRES_PORT= DATABASE_URL=
```

> Le front Astro et l'API lisent **`SUPABASE_URL` / `SUPABASE_ANON_KEY`** (sans préfixe `VITE_`). Le `.env.example` et la CI ont été alignés dessus (les anciens `VITE_*` ont été retirés) ; `API_URL` figure désormais dans `.env.example`.

---

## Design system

`apps/web/src/components/DesignSwitcher.astro` : sélecteur flottant de **8 variantes A→H** (A Classique, B Clean, C Édito, D Forge, E Le Salon, F Stade, G Verveine, H ABPM). Applique une classe `v-<lettre>` sur `<body>`, persistée en `localStorage` (`demo-variant`). Outil de démo. `src/config/site.ts` centralise branding/contenus/variantes par client (config unique).

Docker : `docker-compose.yml` lance Postgres 15 (healthcheck), l'API et le web (Dockerfiles référencés `apps/api/Dockerfile`, `apps/web/Dockerfile` — vérifier leur présence avant de compter dessus).

---

## État du projet

Starter fonctionnel : auth Supabase SSR, API NestJS sécurisée (JWT + CSRF + throttling + helmet), CRUD `items` complet avec RLS, pages admin, design switcher. Points de vigilance : le `README.md` peut encore évoquer « React + Vite » (le front est Astro) ; pas de tests exécutés en CI.

---

## Points d'attention pour l'agent IA

1. **Accès DB via services uniquement (web)** : ne jamais importer `@/lib/supabase` dans `pages/` ou `components/` — passer par `src/services/` (règle ESLint bloquante).
2. **Front = Astro 6 SSR**, pas React. Ne pas réintroduire de code React/Vite malgré le README/docker.
3. **TS strict étendu** : gérer `noUncheckedIndexedAccess` (indices potentiellement `undefined`), `exactOptionalPropertyTypes`, `noPropertyAccessFromIndexSignature` (accès par crochets sur les index signatures). Le code utilise `process.env['CLE']` (crochets) volontairement.
4. **CSRF** : deux systèmes séparés — double-submit cookie côté API (bypass Bearer, header `X-CSRF-Token`) ; cookie httpOnly + champ `_csrf` côté formulaires Astro. Ne pas les confondre.
5. **RLS d'abord** : utiliser le client scopé (`getClientForUser`) dans les services API ; réserver le service-role à la validation du JWT.
6. **Bon workspace** : commandes ciblées via `-w apps/web` / `-w apps/api`. Node >= 22.12 obligatoire.
7. **Auth Bearer** : les endpoints protégés attendent `Authorization: Bearer <jwt Supabase>` ; sans lui → 401 (et le CSRF s'active pour les cookies-only).
8. **Validation** : DTOs API via class-validator (`ValidationPipe` global, `forbidNonWhitelisted`) ; front via Zod (`src/schemas/`). Valider des deux côtés.
9. **Migrations** : ajouter les changements de schéma dans `supabase/migrations/` (numérotées) ; ne pas oublier RLS + policies + index.
10. **Env** : le front lit `SUPABASE_URL`/`SUPABASE_ANON_KEY` (pas `VITE_*`). `.env.example` et la CI sont alignés ; ne pas réintroduire de préfixe `VITE_`.

---

## Commandes

```bash
# Racine (monorepo)
npm run dev            # web + api en parallèle (concurrently)
npm run dev:web        # front Astro seul
npm run dev:api        # API NestJS seule
npm run build          # build web puis api
npm run lint           # lint web + api
npm run typecheck      # typecheck web + api

# Ciblé
npm run dev  -w apps/web        # astro dev
npm run build -w apps/api       # nest build
npm run lint -w apps/web        # astro check + eslint src
npm run typecheck -w apps/api   # tsc --noEmit
npm run test -w apps/api        # vitest run (aucun test pour l'instant)

# Infra
docker compose up -d            # Postgres 15 + api + web
```

---

*Guide synchronisé avec le code — fullstack-starter.*
