# Audit — Fullstack Starter

> Date : 2026-04-29
> Projet : `/Users/guyboireau/Dev/fullstack-starter`
> Stack : React 19 + Vite 7 + NestJS 11 + Supabase + PostgreSQL + TypeScript

---

## 1. Vue d'ensemble

Template monorepo fullstack visant la production, utilisant les npm workspaces.

| Couche | Technologie | Rôle |
|--------|-------------|------|
| Frontend | React 19 + Vite 7 + React Router 7 | SPA authentifiée (login, register, dashboard CRUD) |
| Backend | NestJS 11 + Express | API REST protégée par JWT Supabase |
| Auth / DB | Supabase (Postgres 15) | Auth email/password + Row Level Security (RLS) |
| DevOps | Docker Compose + GitHub Actions | Base de données locale, CI lint + typecheck |

**Architecture retenue**
- Le frontend s'authentifie directement via Supabase Auth.
- Le token JWT est ensuite relayé au backend NestJS via le header `Authorization`.
- Le backend valide le token auprès de Supabase (`getUser`) puis effectue les requêtes SQL en respectant les RLS grâce à un client Supabase scopé par user.

**Points positifs**
- TypeScript strict activé côté web (`noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`).
- Validation DTO via `class-validator` / `class-transformer` sur l'API.
- RLS activé sur toutes les tables (`profiles`, `items`).
- CORS configuré explicitement.
- CI GitHub Actions fonctionnelle (lint + typecheck + build API).

---

## 2. Dépendances

### Versions installées (depuis `package-lock.json`)

| Package | Version installée | Déclarée | Statut |
|---------|-------------------|----------|--------|
| `react` | 19.2.4 | `^19.0.0` | À jour |
| `react-dom` | 19.2.4 | `^19.0.0` | À jour |
| `react-router-dom` | 7.14.0 | `^7.12.0` | À jour |
| `vite` | 7.3.2 | `^7.3.2` | À jour |
| `@nestjs/*` | 11.1.18 | `^11.0.0` | À jour |
| `typescript` | 5.9.3 | `^5.7.0` | À jour (lockfile plus récent) |
| `@supabase/supabase-js` | 2.105.0 | `^2.103.0` | Légèrement en retard — **mettre à jour** |
| `vitest` | 4.1.5 | `^4.1.5` | Très récent (écosystème encore majoritairement sur v3) — **surveiller la compatibilité** |
| `class-validator` | 0.14.4 | `^0.14.1` | À jour |
| `class-transformer` | 0.5.1 | `^0.5.1` | À jour |

### Observations
- `@supabase/supabase-js` : la v2.120+ apporte des améliorations de stabilité sur la gestion de session. Recommandé de monter la contrainte semver.
- `vitest` v4.x est sorti récemment ; la plupart des plugins et presets tiers ne sont pas encore testés dessus. Aucun problème détecté dans le starter, mais à surveiller si des tests sont ajoutés.
- Pas de `package.json` obsolète critique à signaler.

---

## 3. Dette technique

### 3.1. TODO / FIXME / HACK
- **Aucun marqueur trouvé** dans le code source. Bien.

### 3.2. Usage de `any` en TypeScript
- **Pas d'`any` explicite** dans le source (`src/`).
- **Retours implicites `any`** : les services NestJS (`items.service.ts`, `users.service.ts`) et les controllers n'ont pas de types de retour explicites. Les fichiers `.d.ts` générés exposent donc des `Promise<any>` et `Promise<any[]>`, ce qui casse le typage transverse web ↔ API.

### 3.3. Absence de tests
- **Zéro fichier de test** (aucun `*.test.*` ni `*.spec.*` dans `apps/web/src` ni `apps/api/src`).
- Les configs `vitest.config.ts` existent des deux côtés mais ne servent à rien.
- **Priorité haute** : au minimum des tests unitaires pour `useAuth`, `SupabaseAuthGuard`, `ItemsService`, et des tests de composant pour `Login` / `Dashboard`.

### 3.4. Fonctions / composants trop longs
- `apps/web/src/pages/Dashboard.tsx` : **342 lignes**. Gère la liste, les statistiques, le modal création/édition, les appels API + fallback Supabase. C'est un "god component".
- `apps/web/src/pages/Login.tsx` et `Register.tsx` : ~125 lignes chacun, dont ~80 % de markup/CSS dupliqué.

### 3.5. Duplication de code
- **UI d'authentification** : `Login.tsx` et `Register.tsx` dupliquent la structure `.auth-page`, `.auth-card`, `.auth-header`, les champs `form-group`, etc. Doit être extrait en `AuthLayout` et `AuthForm`.
- **Fallback Supabase** dans `Dashboard.tsx` : le pattern `try { fetch('/api/...') } catch { supabase.from(...) }` est dupliqué 3 fois (fetch, save, delete). C'est une antipattern d'architecture.
- **Gestion d'état de chargement / erreur** : reproduite à l'identique dans `Login`, `Register` et `Dashboard`.

### 3.6. Imports non utilisés
- Pas d'import non utilisé visible dans le source. Néanmoins, `apps/api/tsconfig.json` a `noUnusedLocals: false` et `noUnusedParameters: false`, ce qui désactive la détection.

### 3.7. Mauvaises pratiques de sécurité
1. **Parser d'Authorization header fragile** (`apps/api/src/auth/guards/supabase-auth.guard.ts`) :
   ```ts
   const [type, token] = authHeader.split(' ');
   ```
   Si le header contient plusieurs espaces, le `token` inclut le reste de la chaîne. Utiliser `authHeader.split(' ')[1]` ou `authHeader.substring(7)` après vérification.

2. **Fallback direct Supabase dans le frontend** (`Dashboard.tsx`) :
   Si l'API NestJS est indisponible, le frontend parle directement à Supabase. Cela contourne toute la logique métier / validation du backend et crée une architecture hybride non maîtrisée. Le fallback doit être supprimé ; en cas d'indisponibilité API, afficher une erreur.

3. **Pas de rate limiting** sur l'API (login, register, CRUD).

4. **Pas de Helmet / en-têtes de sécurité HTTP** configurés dans NestJS (`main.ts`).

5. **Dockerfiles manquants** : `docker-compose.yml` référence `apps/api/Dockerfile` et `apps/web/Dockerfile`, mais ces fichiers n'existent pas. Le build Docker est donc cassé.

6. **`tsconfig.base.json` inutilisé** : à la racine du monorepo mais ni `apps/web/tsconfig.json` ni `apps/api/tsconfig.json` ne l'étendent. C'est un fichier mort.

---

## 4. Améliorations suggérées

### Performance
- Remplacer le state local de `Dashboard.tsx` par **TanStack Query (React Query)** pour le cache serveur, les re-fetchs automatiques et la gestion des mutations.
- Ajouter la **pagination** côté API (`skip` / `take` ou cursor) et côté UI pour la liste des items.
- Extraire la liste d'items en un composant `ItemList` mémoïsé (`React.memo`) pour éviter les re-rendus inutiles du modal.

### Accessibilité (a11y)
- Le modal de création/édition n'a pas de `role="dialog"`, `aria-modal="true"`, ni de **focus trap**. Il ne se ferme pas avec la touche `Escape`.
- Les emojis utilisés comme icônes (`📦`, `✏️`, `🗑️`, `⚡`) n'ont pas de texte alternatif (`aria-label` ou `role="img"` avec `aria-label`).
- Les badges de statut devraient utiliser des couleurs accompagnées d'indicateurs textuels explicites pour les daltoniens.

### SEO
- SPA sans SSR : le SEO est inexistant. Le `index.html` a un title et une description statiques, mais aucune page n'a de balises `<title>` ou `<meta>` dynamiques.
- Recommandation : utiliser `react-helmet-async` ou migrer vers Next.js si le SEO devient un besoin.

### Typage strict
- Ajouter des **return types explicites** sur tous les services et controllers NestJS.
- Créer des interfaces partagées (ou un package `shared/types`) pour les DTOs API afin de les réutiliser côté frontend.
- Étendre `tsconfig.base.json` dans les `tsconfig.json` des apps pour centraliser la configuration.
- Aligner `noUnusedLocals` et `noUnusedParameters` sur `true` dans l'API.

---

## 5. Fichiers critiques à refactorer

### 1. `apps/web/src/pages/Dashboard.tsx`
- **Problèmes** : 342 lignes, god component, fallback Supabase dupliqué 3 fois, modal non accessible, pas de tests.
- **Action** : découper en `DashboardLayout`, `StatsPanel`, `ItemList`, `ItemModal`. Supprimer le fallback Supabase. Utiliser React Query.

### 2. `apps/web/src/pages/Login.tsx` + `apps/web/src/pages/Register.tsx`
- **Problèmes** : ~80 % de duplication de markup et de logique de formulaire.
- **Action** : extraire un composant `AuthLayout` et un `AuthForm` générique. Laisser `Login` et `Register` comme de simples pages orchestre.

### 3. `apps/api/src/items/items.service.ts`
- **Problèmes** : pas de return types, pas de gestion fine des erreurs Supabase, pas de tests unitaires.
- **Action** : typer les retours (`Promise<ItemEntity>`), ajouter un intercepteur d'erreur, écrire des tests avec un mock Supabase.

### 4. `apps/web/src/hooks/useAuth.ts`
- **Problèmes** : pas de gestion d'erreur réseau (timeout), pas de retry, pas de rafraîchissement explicite du token, pas de tests.
- **Action** : wrapper dans React Query ou ajouter une logique de retry + gestion de `onAuthStateChange` plus robuste.

### 5. `apps/api/src/auth/guards/supabase-auth.guard.ts`
- **Problèmes** : parser d'Authorization header naïf, pas de tests.
- **Action** : corriger le split du Bearer token, ajouter des tests unitaires avec des requêtes mockées.

---

*Fin de l'audit.*
