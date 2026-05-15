# Security Audit Report — fullstack-starter

**Project:** `fullstack-starter` (NestJS API + Astro Web + Supabase)  
**Path:** `/Users/guyboireau/Dev/templates/fullstack-starter`  
**Date:** 2026-05-15  
**Auditor:** Security Agent (Claude Code)  
**Scope:** API (`apps/api`), Web (`apps/web`), Infrastructure (`docker-compose.yml`, `.github/workflows`, Supabase migrations)

---

## 1. Executive Summary

The `fullstack-starter` monorepo demonstrates a solid foundational security posture: **Row Level Security (RLS)** is properly enabled on all database tables, **input validation** is enforced via `class-validator` (API) and Zod (frontend), **authentication** is delegated to Supabase with JWT guards on all protected routes, and **Helmet** is installed on the API. However, several critical and high-severity gaps remain:

- **No rate limiting** on any endpoint, including authentication.
- **No CSRF protection** on state-changing POST forms in the web application.
- **A 1.5MB SQLite database (`ruvector.db`) is tracked in Git**, potentially leaking vector embeddings or other sensitive data.
- **The Astro middleware blocks the entire public site** (`/`) for unauthenticated users.
- **No Content Security Policy (CSP)** and missing security headers on the frontend.
- **External scripts loaded without Subresource Integrity (SRI)** hashes.

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High     | 6 |
| Medium   | 4 |
| Low      | 3 |

---

## 2. Scope & Methodology

**In-scope:**
- `apps/api/src` — NestJS controllers, services, guards, filters, DTOs, main bootstrap
- `apps/web/src` — Astro pages, layouts, components, middleware, services, schemas
- `supabase/migrations/` — SQL schema, RLS policies, triggers
- `docker-compose.yml`, `vercel.json`, `.github/workflows/ci.yml`
- `.env.example`, `.gitignore`, `package.json` (dependency analysis)

**Methodology:**
- Manual static code review (OWASP Top 10, CWE mapping)
- Secret and credential leakage scan (`.env*`, hardcoded keys, git history)
- SQL injection and XSS vector analysis
- AuthN/AuthZ flow review (JWT validation, RLS policies, guard coverage)
- Infrastructure and deployment configuration review
- Dependency manifest review (manual; `npm audit` was not executable in this environment)

> **Note:** The requested automated scans (`npx @claude-flow/cli@latest security scan/cve/report`) could not be executed because the CLI tool is not available in this environment. All findings below are the result of a rigorous manual audit.

---

## 3. Critical Findings

### 3.1 CRIT-001 — No Rate Limiting on API Endpoints
**Severity:** Critical  
**CWE:** CWE-770: Allocation of Resources Without Limits or Throttling  
**Files:** `apps/api/src/main.ts`, all controllers  
**Description:** The NestJS application does not implement any rate limiting (`@nestjs/throttler` or equivalent). All endpoints — including authentication-adjacent routes (`/auth/profile`, `/users/me`) and the full CRUD surface (`/items`) — are exposed to unlimited requests. This enables brute-force attacks on JWT tokens, credential stuffing (if local auth were added), and trivial DoS via resource exhaustion.

**Remediation:**
1. Install `@nestjs/throttler`:
   ```bash
   npm install @nestjs/throttler
   ```
2. Register `ThrottlerModule` in `AppModule` with sensible defaults (e.g., 10 req/s per IP):
   ```ts
   ThrottlerModule.forRoot([{
     ttl: 60000,
     limit: 10,
   }])
   ```
3. Apply `@SkipThrottle()` only to intentionally public, low-cost endpoints (if any).
4. Use a Redis-backed store (`ThrottlerStorageRedisService`) in production to share state across horizontally scaled instances.

---

### 3.2 CRIT-002 — CSRF Vulnerability on State-Changing Forms
**Severity:** Critical  
**CWE:** CWE-352: Cross-Site Request Forgery (CSRF)  
**Files:** `apps/web/src/pages/admin/items.astro`, `apps/web/src/pages/api/auth/signout.ts`  
**Description:** The web application uses traditional HTML forms with `method="POST"` for creating, updating, and deleting items, as well as for signing out. There are **no CSRF tokens** in these forms. Because Supabase SSR stores the session in cookies, an authenticated user's browser will automatically include session cookies when submitting a form (even if triggered by a malicious third-party site). An attacker can craft a cross-site POST request to `/admin/items` with `_action=delete` and an arbitrary `id`, causing the victim to delete their own items or be logged out.

**Remediation:**
1. Implement a synchronizer token pattern:
   - Generate a cryptographically random CSRF token server-side on each page load.
   - Store it in the session or in a `csrf_token` cookie (double-submit cookie pattern works too).
   - Render it as a hidden field in every form:
     ```html
     <input type="hidden" name="csrf_token" value={csrfToken} />
     ```
2. In the POST handler, validate the submitted token against the stored value. Reject mismatches with `403 Forbidden`.
3. For the `/api/auth/signout` endpoint, consider using a same-site POST request with a custom header (`X-Requested-With`) or the same CSRF token validation.

---

### 3.3 CRIT-003 — Binary Database (`ruvector.db`) Tracked in Git
**Severity:** Critical  
**CWE:** CWE-538: Insertion of Sensitive Information into Externally-Accessible File or Directory  
**File:** `apps/web/ruvector.db` (1,589,248 bytes)  
**Description:** A 1.5MB SQLite database named `ruvector.db` is present in the working tree and **tracked by Git** (`git ls-files -s apps/web/ruvector.db` confirms it). Although `ruvector.db` is listed in `.gitignore` (line 40), the file was committed before the ignore rule was added. SQLite databases of this size in a web app context often contain vector embeddings, cached data, or locally-stored indexes that may include sensitive content, PII, or internal project metadata. Even if currently benign, committing large binaries bloats the repository forever and sets a precedent for future data leakage.

**Remediation:**
1. Remove the file from Git history immediately:
   ```bash
   git rm --cached apps/web/ruvector.db
   git commit -m "security: remove tracked ruvector.db from repository"
   ```
2. If the file has been pushed to a remote, use `git filter-repo` (or BFG Repo-Cleaner) to purge it from history:
   ```bash
   git filter-repo --path apps/web/ruvector.db --invert-paths
   ```
3. Add an explicit path rule to `.gitignore`:
   ```gitignore
   # Already present, but verify it matches exact paths
   ruvector.db
   **/ruvector.db
   *.db
   ```
4. Audit the file contents locally (if needed) to confirm whether any sensitive data was leaked.

---

## 4. High Findings

### 4.1 HIGH-001 — Missing Content Security Policy (CSP)
**Severity:** High  
**CWE:** CWE-693: Protection Mechanism Failure  
**Files:** `apps/web/src/layouts/Layout.astro`, `apps/web/src/layouts/AdminLayout.astro`, `apps/api/src/main.ts`  
**Description:** Neither the API nor the Astro frontend configures a Content Security Policy. Without CSP, the application is more susceptible to XSS (if an injection vector is ever introduced) and data exfiltration via injected scripts. The `Layout.astro` loads external scripts from `unpkg.com`, `fonts.googleapis.com`, and `plausible.io` inline, increasing the attack surface.

**Remediation:**
1. In `apps/api/src/main.ts`, add Helmet CSP configuration:
   ```ts
   app.use(helmet({
     contentSecurityPolicy: {
       directives: {
         defaultSrc: ["'self'"],
         scriptSrc: ["'self'", "'unsafe-inline'", "https://plausible.io"],
         styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
         fontSrc: ["'self'", "https://fonts.gstatic.com"],
         imgSrc: ["'self'", "data:", "https:"],
         connectSrc: ["'self'", process.env.SUPABASE_URL],
       },
     },
   }));
   ```
   (Adjust `scriptSrc` if you move inline scripts to nonces.)
2. For Astro/Vercel, add a `vercel.json` headers section or configure `astro.config.mjs` with a custom headers integration to emit CSP headers.
3. Prefer `nonce` over `'unsafe-inline'` for scripts once Astro supports nonce generation per-request.

---

### 4.2 HIGH-002 — External Scripts Loaded Without Subresource Integrity (SRI)
**Severity:** High  
**CWE:** CWE-830: Inclusion of Web Functionality from an Untrusted Source  
**Files:** `apps/web/src/layouts/Layout.astro` (lines 58, 83-88)  
**Description:** The application loads third-party scripts and stylesheets from external CDNs without integrity hashes:
- `https://fonts.googleapis.com/css2?family=...`
- `https://unpkg.com/@phosphor-icons/web`
- `https://plausible.io/js/script.js`
If any of these CDNs are compromised, malicious JavaScript or CSS could be injected into the application, leading to full XSS compromise.

**Remediation:**
1. Add `integrity` and `crossorigin` attributes to every external `<script>` and `<link>` tag.
   Example:
   ```html
   <script src="https://unpkg.com/@phosphor-icons/web"
     integrity="sha384-..."
     crossorigin="anonymous"></script>
   ```
2. For Google Fonts, self-host the font files (download via `fontsource` packages) to eliminate CDN trust entirely.
3. For Plausible, self-host the script or pin the exact version and add SRI.

---

### 4.3 HIGH-003 — Missing Security Headers on Frontend
**Severity:** High  
**CWE:** CWE-693: Protection Mechanism Failure  
**Files:** `apps/web/astro.config.mjs`, `vercel.json`  
**Description:** The Astro application does not explicitly set security headers such as `Strict-Transport-Security` (HSTS), `X-Frame-Options`, `X-Content-Type-Options`, or `Referrer-Policy`. While Helmet covers the API, the SSR frontend is unprotected. This exposes the app to clickjacking, MIME-sniffing attacks, and insecure framing.

**Remediation:**
1. Update `vercel.json` to emit security headers for all routes:
   ```json
   {
     "headers": [
       {
         "source": "/(.*)",
         "headers": [
           { "key": "X-Frame-Options", "value": "DENY" },
           { "key": "X-Content-Type-Options", "value": "nosniff" },
           { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
           { "key": "Strict-Transport-Security", "value": "max-age=63072000; includeSubDomains; preload" }
         ]
       }
     ]
   }
   ```
2. For non-Vercel deployments, add a custom Astro middleware that sets these headers on every response.

---

### 4.4 HIGH-004 — Cookie Security Settings Not Explicitly Configured
**Severity:** High  
**CWE:** CWE-614: Sensitive Cookie in HTTPS Session Without 'Secure' Attribute  
**File:** `apps/web/src/lib/supabase.ts`  
**Description:** The `createSupabaseServerClient` function configures `@supabase/ssr` with cookie `getAll`/`setAll` handlers but does **not** explicitly set `secure`, `httpOnly`, or `sameSite` attributes on the cookies passed to `cookies.set(name, value, options)`. In production, if the application is served over HTTPS, cookies must be `Secure` and `SameSite=Lax` (or `Strict` for auth cookies) to prevent session hijacking and CSRF. The current implementation inherits whatever defaults Supabase SSR chooses, which may not be strict enough.

**Remediation:**
1. Explicitly configure cookie options in `createSupabaseServerClient`:
   ```ts
   cookies: {
     getAll() { ... },
     setAll(cookiesToSet) {
       cookiesToSet.forEach(({ name, value, options }) => {
         cookies.set(name, value, {
           ...options,
           secure: process.env.NODE_ENV === 'production',
           httpOnly: true,
           sameSite: 'lax',
           path: '/',
         });
       });
     },
   }
   ```
2. Ensure `NODE_ENV=production` is set in the production Vercel environment.

---

### 4.5 HIGH-005 — Astro Middleware Blocks Entire Public Site
**Severity:** High  
**CWE:** CWE-284: Improper Access Control  
**File:** `apps/web/src/middleware/index.ts`  
**Description:** The middleware defines only `/login` and `/register` as public paths. Every other route — including the public landing page `/`, `/services`, `/a-propos`, etc. — redirects unauthenticated users to `/login`. This effectively disables the public site, which appears to be a client-facing landing page. This is a severe availability and access-control defect.

**Remediation:**
1. Restrict auth enforcement to `/admin/*` routes only:
   ```ts
   const PUBLIC_PATHS = ['/login', '/register', '/', '/services', '/a-propos', '/blog', '/contact', '/realisations'];
   // or better:
   const PROTECTED_PREFIXES = ['/admin'];
   ```
   ```ts
   export const onRequest = defineMiddleware(async ({ url, cookies, redirect }, next) => {
     if (!PROTECTED_PREFIXES.some(p => url.pathname.startsWith(p))) return next();
     if (PUBLIC_PATHS.includes(url.pathname)) return next();
     // ... auth check
   });
   ```
2. Alternatively, use Astro's `middleware` matching or route-specific guards.

---

### 4.6 HIGH-006 — Error Filter May Leak Internal Details
**Severity:** High  
**CWE:** CWE-209: Generation of Error Message Containing Sensitive Information  
**File:** `apps/api/src/common/filters/all-exceptions.filter.ts`  
**Description:** For `HttpException`s, the filter returns the full exception `message` to the client (line 29). If a service or library throws an exception containing internal paths, SQL fragments, or stack traces wrapped in an `HttpException`, this information is leaked to the attacker. Non-HttpExceptions are masked to `"Internal server error"`, which is correct.

**Remediation:**
1. Sanitize or mask all client-facing messages:
   ```ts
   message = 'An error occurred. Please try again later.';
   // Log the real message server-side only
   this.logger.warn(`[${request.method}] ${request.url} ${statusCode} - ${realMessage}`);
   ```
2. For validation errors (`BadRequestException` from `ValidationPipe`), the message is controlled by class-validator and is usually safe, but consider intercepting it to return a generic `Validation failed` with a structured `errors` array.

---

## 5. Medium Findings

### 5.1 MED-001 — Weak Password Policy (Client-Side Only)
**Severity:** Medium  
**CWE:** CWE-521: Weak Password Requirements  
**Files:** `apps/web/src/pages/login.astro`, `apps/web/src/pages/register.astro`  
**Description:** Password validation enforces only a minimum length of 6 characters (`z.string().min(6)`). There is no requirement for uppercase, lowercase, numbers, or special characters. Because authentication is delegated to Supabase, the API does not validate password strength at all. Supabase projects can be configured with stronger policies, but the starter template does not document or enforce this.

**Remediation:**
1. Strengthen the Zod schema in `register.astro`:
   ```ts
   password: z.string()
     .min(12, 'Minimum 12 caractères')
     .regex(/[A-Z]/, 'Au moins une majuscule')
     .regex(/[a-z]/, 'Au moins une minuscule')
     .regex(/[0-9]/, 'Au moins un chiffre')
     .regex(/[^A-Za-z0-9]/, 'Au moins un caractère spécial'),
   ```
2. Document in `README.md` that the Supabase project should have **"Enforce stronger passwords"** enabled in Authentication > Policies.

---

### 5.2 MED-002 — Docker Compose Default Weak Credentials
**Severity:** Medium  
**CWE:** CWE-798: Use of Hard-coded Credentials  
**File:** `docker-compose.yml`  
**Description:** The `docker-compose.yml` file uses `postgres/postgres` as fallback credentials for the local PostgreSQL container. While these are meant for local development, the `README.md` should strongly warn users to override these in production. If a developer copies this compose file to a staging or production server without changing defaults, the database is trivially accessible.

**Remediation:**
1. Add a `README` section or `.env.example` comment:
   ```
   # WARNING: Change POSTGRES_PASSWORD before deploying to any shared environment.
   ```
2. Consider adding a `docker-compose.prod.yml` override that removes volume mounts and uses secrets or environment-only configuration.

---

### 5.3 MED-003 — Timing Attack Vector in Auth Guard
**Severity:** Medium  
**CWE:** CWE-208: Observable Timing Discrepancy  
**File:** `apps/api/src/auth/guards/supabase-auth.guard.ts`  
**Description:** The guard returns two distinct error paths:
- `"Missing authorization token"` when no token is present.
- `"Invalid or expired token"` when token validation fails.
An attacker can measure response times to determine whether a request reached the Supabase validation step, which could aid in user enumeration or token probing.

**Remediation:**
1. Unify the error message and return it after a constant-time delay:
   ```ts
   if (!token) {
     await this.authService.validateToken('dummy-token-for-timing'); // burn time
     throw new UnauthorizedException('Invalid or missing token');
   }
   ```
   Or simply return the same generic message for both branches without logging differentiation to the client (server-side logging can remain distinct).

---

### 5.4 MED-004 — Missing Input Length Limit on `description` in Update DTO
**Severity:** Medium  
**CWE:** CWE-20: Improper Input Validation  
**File:** `apps/api/src/items/dto/update-item.dto.ts`  
**Description:** `UpdateItemDto.description` has `@IsString()` and `@IsOptional()` but no `@MaxLength()`. While the frontend schema limits it to 1000 characters (`z.string().max(1000)`), a direct API call could bypass this. Combined with missing rate limiting, an attacker could submit extremely large payloads, causing memory pressure or DoS.

**Remediation:**
1. Add `@MaxLength(1000)` to `UpdateItemDto.description`:
   ```ts
   @IsString()
   @IsOptional()
   @MaxLength(1000)
   description?: string;
   ```
2. Add `@MaxLength(200)` to `UpdateItemDto.title` for consistency.

---

## 6. Low Findings

### 6.1 LOW-001 — `console.log` Used Instead of Structured Logger
**Severity:** Low  
**CWE:** CWE-532: Insertion of Sensitive Information into Log File  
**File:** `apps/api/src/main.ts` (line 29)  
**Description:** The bootstrap function uses `console.log` to announce the server start. While this specific message is harmless, relying on `console.*` instead of NestJS's built-in `Logger` breaks log aggregation, structured logging, and severity levels in production.

**Remediation:**
1. Replace with `Logger.log()`:
   ```ts
   const logger = new Logger('Bootstrap');
   logger.log(`API running on http://localhost:${port}`);
   ```

---

### 6.2 LOW-002 — `user_metadata` Exposed via `/auth/profile`
**Severity:** Low  
**CWE:** CWE-359: Exposure of Private Personal Information to an Unauthorized Actor  
**File:** `apps/api/src/auth/auth.controller.ts`  
**Description:** The `/auth/profile` endpoint returns the entire `user_metadata` object from the Supabase `User` type. If a user or an admin stores sensitive data in `user_metadata` (e.g., phone number, address), it is fully exposed without filtering.

**Remediation:**
1. Whitelist only necessary fields:
   ```ts
   return {
     id: req.user.id,
     email: req.user.email,
     full_name: req.user.user_metadata?.full_name,
   };
   ```

---

### 6.3 LOW-003 — No Security Tests
**Severity:** Low  
**CWE:** CWE-1108: Insufficient Test Coverage for Security Features  
**Scope:** `apps/api/src`  
**Description:** No test files (`*.spec.ts`, `*.test.ts`) were found in the API source tree. Security-critical code — auth guards, RLS-enforced service calls, exception filtering — is not covered by automated tests, increasing the risk of regressions.

**Remediation:**
1. Add Vitest tests for:
   - `SupabaseAuthGuard` (missing token, invalid token, valid token)
   - `ItemsService` (ensure `user_id` filters are always present)
   - `AllExceptionsFilter` (ensure internal errors are masked)
   - DTO validation (ensure `forbidNonWhitelisted` rejects unknown fields)

---

## 7. Positive Security Controls

The following controls are implemented correctly and should be preserved:

| Control | Implementation |
|---------|---------------|
| **Row Level Security (RLS)** | Enabled on `items` and `profiles` tables with `auth.uid()` policies. |
| **Input Validation** | `ValidationPipe` with `whitelist: true` and `forbidNonWhitelisted: true`. Zod schemas on the frontend. |
| **Auth Guard Coverage** | `SupabaseAuthGuard` is applied at the controller level for `/items` and `/users/me`. |
| **Helmet** | `helmet()` is applied globally in `main.ts`. |
| **Secure Secret Handling** | No real `.env` files committed to Git. Only `.env.example` placeholders present. |
| **SQL Injection Prevention** | All database access uses the Supabase JS client, which parameterizes queries. No raw SQL in application code. |
| **No Hardcoded Secrets** | No API keys, tokens, or passwords found in source code. |
| **XSS Prevention (Astro)** | Astro auto-escapes expressions (`{variable}`). No `set:html` used with user input. |
| **Open Redirect Prevention** | All `redirect()` calls use hardcoded paths. |
| **Path Traversal Prevention** | No file upload or filesystem access in the application layer. |
| **Git Secret Scan (History)**** | No leaked secrets found in `.env` file history. |

---

## 8. Remediation Roadmap

### Immediate (Critical — within 24-48h)
1. **Remove `ruvector.db` from Git history** and ensure `.gitignore` blocks it permanently.
2. **Add rate limiting** (`@nestjs/throttler`) to the API.
3. **Implement CSRF tokens** for all state-changing POST forms in the web app.

### Short-term (High — within 1 week)
4. **Fix middleware** so only `/admin/*` routes require authentication.
5. **Add CSP and security headers** to both API and Astro frontend.
6. **Add SRI hashes** to all external CDN scripts/styles.
7. **Explicitly configure cookie security** (`Secure`, `HttpOnly`, `SameSite`).
8. **Sanitize error messages** in `AllExceptionsFilter` to prevent information leakage.

### Medium-term (Medium — within 2 weeks)
9. **Strengthen password validation** (backend and frontend) and document Supabase auth policies.
10. **Add `@MaxLength()` decorators** to all optional string DTO fields.
11. **Docker Compose hardening** — remove default credentials from any non-local deployment.
12. **Unify auth guard error messages** to prevent timing attacks.

### Ongoing (Low — within 1 month)
13. **Add security-focused unit and integration tests**.
14. **Replace `console.log`** with NestJS `Logger`.
15. **Filter `user_metadata`** in `/auth/profile` to expose only whitelisted fields.
16. **Run `npm audit`** in the local environment and update any vulnerable dependencies.
17. **Conduct a dependency review** for `@supabase/supabase-js`, `astro`, `@astrojs/vercel`, and `helmet` to ensure latest patch versions are installed.

---

*End of Report*
