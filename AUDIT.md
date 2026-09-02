# Audit — Fullstack Starter

> Date : 2026-09-02
> Stack réelle : Astro 7 (SSR, adapter Vercel) + NestJS 11 + Supabase + TypeScript
>
> ⚠️ La version précédente de ce document (2026-04-29) décrivait un frontend
> **React 19 + Vite 7 + React Router** avec des fichiers (`Dashboard.tsx`,
> `Login.tsx`, `hooks/useAuth.ts`) qui n'existent plus : le front a été migré
> vers Astro sans que l'audit soit resynchronisé. Il induisait donc en erreur
> toute personne — ou tout agent — s'y fiant comme référence.

---

## 1. Vue d'ensemble

Template monorepo (npm workspaces) visant la production.

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | Astro 7 SSR + adapter Vercel + Tailwind 4 | Landing publique + panneau d'administration |
| Backend | NestJS 11 + Express | API REST protégée par JWT Supabase |
| Auth / DB | Supabase (Postgres 15) | Auth email/mot de passe + Row Level Security |
| DevOps | Docker Compose + GitHub Actions | Environnement local, CI lint + typecheck + tests |

**Architecture**
- Astro s'authentifie auprès de Supabase côté serveur (`@supabase/ssr`, session en cookies).
- Le JWT est relayé à l'API NestJS via l'en-tête `Authorization: Bearer`.
- `SupabaseAuthGuard` valide le token, puis les requêtes SQL s'exécutent sous RLS.
- Les formulaires modifiant la session sont protégés par CSRF (double-submit cookie).

---

## 2. Corrigé lors de cet audit — le starter ne fonctionnait pas en production

Ces quatre défauts se cumulaient : l'application était déployable mais
inutilisable, ce qui rendait toute démonstration impossible.

### 2.1. Variables d'environnement figées à `undefined` au build — bloquant

`src/lib/supabase.ts` lisait `import.meta.env.SUPABASE_URL` au niveau module.
Vite substitue ces expressions **au moment du build** : la variable étant absente
de l'environnement de build, le bundle déployé contenait littéralement

```js
var supabaseUrl = void 0;
var supabaseAnonKey = void 0;
throw new Error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars.");
```

Le `throw` devenait **inconditionnel** : toute requête touchant Supabase
(login, register, admin) échouait en production, quelle que soit la
configuration Vercel. Même mécanisme pour `import.meta.env.API_URL`, qui figeait
`http://localhost:3000` dans le bundle de production.

**Correction** : `src/lib/env.ts` expose `getEnv()` / `requireEnv()` lisant
`process.env` **à l'exécution**, appelés à l'intérieur des fonctions et non au
niveau module. `astro.config.mjs` recopie les fichiers `.env` dans `process.env`
au démarrage pour que le développement lise à la même source que la production.

### 2.2. Sortie de build introuvable par Vercel — bloquant

`@astrojs/vercel` écrit dans `apps/web/.vercel/output`, alors que Vercel ne lit
la Build Output API qu'à la racine du Root Directory. `vercel.json` déclarait de
surcroît `outputDirectory` + `framework`, incompatibles avec cette API.

**Correction** : `scripts/collect-vercel-output.mjs` remonte la sortie à la
racine, appelé par `npm run build:vercel` que `vercel.json` utilise désormais.

### 2.3. Documentation de déploiement contradictoire — bloquant

Le README demandait de configurer `PUBLIC_SUPABASE_URL` / `PUBLIC_SUPABASE_ANON_KEY`
sur Vercel, alors que le code lit `SUPABASE_URL` / `SUPABASE_ANON_KEY`. En
suivant la documentation, les variables n'étaient jamais trouvées.

**Correction** : section « Deploy » réécrite avec les noms exacts et l'avertissement
sur le préfixe `PUBLIC_`.

### 2.4. Landing page inaccessible aux visiteurs

Le middleware raisonnait par liste de routes *publiques*
(`['/login', '/register']`) : la page d'accueil, pourtant vitrine publique,
redirigeait les visiteurs anonymes vers `/login`.

**Correction** : raisonnement inversé — seuls les préfixes de
`PROTECTED_PREFIXES` (`/admin`) exigent une session.

### 2.5. Autres correctifs

- `docker-compose.yml` référençait `apps/api/Dockerfile` et `apps/web/Dockerfile`
  **inexistants** : `docker compose up` échouait. Les deux images sont créées,
  le port du front passe de 5173 (héritage Vite) à 4321.
- `apps/web/vitest.config.ts` contenait un **chemin absolu en dur**
  (`/home/user/...`) : l'alias `@` n'était résolvable que sur la machine où le
  fichier avait été écrit. Résolu relativement au fichier.
- CORS de l'API : origine par défaut alignée sur 4321 (au lieu de 5173).
- `.env.example` racine : variables `VITE_*` de l'ancien front React remplacées
  par les variables réellement lues.

### 2.6. Non-régression

`apps/web/src/lib/env.spec.ts` teste `getEnv`/`requireEnv` et **scanne les
sources** pour interdire tout nouvel accès `import.meta.env.MA_VARIABLE` en
dehors des clés intégrées à Vite et des variables `PUBLIC_*`. C'est ce garde-fou
qui manquait : la suite de tests était verte pendant que la production était
cassée, parce qu'aucun test ne couvrait la plomberie d'environnement.

---

## 3. Dette restante (non bloquante)

| Sujet | Détail |
|-------|--------|
| Couverture de tests | `auth.service.ts` et les trois contrôleurs NestJS restent sans test unitaire. |
| Types de retour | Les services NestJS n'ont pas de types de retour explicites : les `.d.ts` générés exposent `Promise<any>`. |
| `tsconfig.base.json` | Présent à la racine mais étendu par aucune app — fichier mort. |
| Postgres local | Le service `db` de Docker Compose n'est utilisé par aucune application (tout passe par Supabase) ; conservé pour rejouer les migrations hors ligne. |
| Warnings de lint | 11 avertissements `no-unused-vars` (variables `v` des variantes de design, `_id`/`_uid` de tests). |
| `z.string().uuid()` | Déprécié en Zod 4 au profit de `z.uuid()` — 16 hints au typecheck. |

---

## 4. Vérifications passées

```
npm run lint       → 0 erreur (11 warnings préexistants)
npm run typecheck  → 0 erreur
npm test           → 53 tests (23 API + 30 web)
npm run build      → OK (web + api)
npm run build:vercel → .vercel/output généré à la racine
```

Test de bout en bout avec un unique `.env` à la racine (la procédure du README) :
`/` → 200, `/login` → 200, `/admin` → 302 vers `/login`, aucune erreur d'environnement.

---

*Fin de l'audit.*
