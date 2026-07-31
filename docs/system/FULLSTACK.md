# FULLSTACK.md — Production-Readiness Checklist

Snapshot of which "complete fullstack web app" pillars this project has vs. hasn't, checked directly against the running code (not the docs' target design — see `CLAUDE.md`'s "Docs describe target design" section for where the two diverge). Re-check this file when any of the ✅/🟡/❌ items below change; it will drift otherwise.

Legend: ✅ implemented and real · 🟡 partial / present but incomplete · ❌ not implemented

---

## 1. Frontend — ✅ done (2026-07-31)

- **storefront** (`apps/storefront`): Next.js 16 App Router, public catalog/blog SSG/ISR via `lib/api/server-public.ts` (uses `fetch(..., { next: { revalidate } })`), `/cart` and `/checkout` as client-rendered flat routes. Product images via `ProductImageGallery.tsx`.
- **admin** (`apps/admin`): Vite + React 19 SPA. Real CRUD UIs for Orders, Customers, Products, Store/POS, Blog, and now Vouchers (`Vouchers.tsx`, `VoucherFormModal.tsx`).
- ✅ **Product search/filter UI added** (`app/products/page.tsx`) — the API already supported `search`/`category` query params (`productQuerySchema`), but the page never read `searchParams` at all: the category sidebar links (`?category=slug`) were dead, silently ignored. The page now reads `searchParams`, a GET `<form>` search box submits `?search=`, and category links correctly filter + highlight the active one. Verified live: searching returned only the matching product; a category link correctly threaded through the hidden form field.
- ✅ Dead `/about` link removed — the footer link was already gone (removed by the team before this pass); the header nav (`Header.tsx`) still pointed at it with no page behind it, so that link was removed too rather than building a page nobody asked for.
- 🟡 `ContactWidget.tsx` social links remain placeholder `href: '#'` — **intentional**, pending real links from the client. Not a gap to close now.

## 2. APIs & Backend Logic — ✅ done (2026-07-31)

- Express v5 + TypeScript + ESM, modular structure per domain (`auth`, `customer`, `catalog`, `order`, `voucher`, `blog`, `media`) — each with `routes → controller → service → repository → model`, Zod DTOs, and `*.interfaces.ts` for cross-module calls.
- Cross-module side effects via `utils/eventBus.ts` (`ORDER_PLACED`, `ORDER_CANCELLED`, `STOCK_LOW`).
- Centralized error handling (`errorMiddleware.ts`) maps Zod/Mongoose/custom `AppError` to a consistent JSON envelope.
- ✅ There is still no dedicated `cart` API module — but this is now a confirmed, intentional design choice rather than an open gap: `packages/shared-types/src/cart.schema.ts` was deleted (2026-07-31) after confirming it had zero importers anywhere in the codebase (the storefront's `cartStore.ts` already defined its own local `CartItem` type and never used it). Cart state lives client-side only, by design (SRS.md D5 guest checkout). If a server-side cart is ever needed (e.g. multi-device sync for logged-in users), its shape would need to be added back to `shared-types` at that point — see `docs/server/API_CONTRACT.md`'s Cart section.

## 3. Database & Storage — ✅ done (2026-07-31)

- MongoDB via Mongoose v8 (`apps/api/src/config/db.config.ts`), connection string from `MONGODB_URI` env var — MongoDB Atlas is a real cloud service, ready for production as-is.
- Indexes defined on `blog`, `catalog`, and `order` models.
- File/image storage via Cloudinary (`configureCloudinary()` in `app.ts`), consumed by the multi-image product schema (`productImageSchema`).
- ✅ **Backup/restore process now documented** — `docs/system/BACKUP_RESTORE.md` covers both layers: Atlas's own automated backups (baseline, tier-dependent, no repo-side setup needed) and a repo-native `pnpm backup:db`/`restore:db` (`apps/api/src/scripts/backup.ts`/`restore.ts`, wrapping `mongodump`/`mongorestore`) for a portable, tested-from-this-repo snapshot independent of Atlas's schedule. Verified live 2026-07-31: a full backup-then-restore round trip returned all 30 documents across every collection with zero failures. See also `docs/system/DISASTER_RECOVERY.md` for when/how this fits into an incident response.

## 4. Auth & Permissions — ✅ done (2026-07-31)

- JWT in httpOnly cookies (`access_token` 15min, `refresh_token` 7d), never Bearer tokens. `verifyToken` middleware re-checks the account (`isActive` **and now `role`**) from the DB on every request, not just signature/expiry — a role change or deactivation takes effect immediately, without waiting for the token to expire.
- `optionalVerifyToken` middleware supports guest checkout.
- ✅ **Role-based permission system added.** `User.role` is `'admin' | 'staff'` (`apps/api/src/modules/auth/auth.model.ts`), and `apps/api/src/middlewares/roleMiddleware.ts` exports `requireRole(...roles)`, stacked after `verifyToken`. Applied to every destructive/financial route: deleting products/categories/blog posts/blog categories, all voucher writes (`POST|PATCH|DELETE /vouchers*`), `GET /customers/export` (PII), and all of `/auth/users/*`. Every other admin route (reads, order status updates, product/blog editing, media upload, POS) only requires `verifyToken` — any active staff account can use them. Full breakdown in `docs/server/API_CONTRACT.md` §Authentication.
  - New admin-only endpoints (`GET/POST /auth/users`, `PATCH /auth/users/:id`) let an `admin` create/manage additional staff or admin accounts — previously the only account was the single seeded admin, with no way to provision a second one short of editing the DB directly. `AuthService.updateUser` blocks an admin from demoting or deactivating their own account (self-lockout guard).
  - Seeded owner account (`pnpm seed:admin`, keyed by `ADMIN_EMAIL`) is now explicitly `role: 'admin'`; any account created afterward defaults to `role: 'staff'`.
  - **Known follow-up, not done:** the admin SPA doesn't yet hide destructive buttons (delete product/voucher/blog, export customers) from `staff` users in the UI — they'd get a 403 from the API if they tried, not a hidden button. Low priority until a second (non-admin) account actually exists, since only the one `admin` account has ever been provisioned.
- ✅ No customer-facing auth — this remains **intentional**, not a gap: checkout is guest-only by design (`SRS.md` D5, `Customer` upserted by phone), consistent with `CLAUDE.md`'s note that customer auth was deliberately removed. `SRS.md` describes later account-linking by phone as a possible *future* enhancement, not a current requirement, so it's excluded from this checklist's scope.

## 5. Hosting & Deployment — ❌ not done

- **Nothing has ever been deployed.** No Dockerfile, no `vercel.json`, no docker-compose, no platform config of any kind found in the repo.
- Cookie domain logic already exists for production (`apps/api/src/utils/token.util.ts`) but is **hardcoded** to `.banhtrangnhana.com` — must be updated to match the real domain when purchased.
- `.env` files exist per app (`apps/api/.env`, `apps/admin/.env`, `apps/storefront/.env`) documenting required vars, but current values include placeholder secrets (see Security below).

## 6. Cloud & Compute — 🟡 partial

- Database (MongoDB Atlas) and media storage (Cloudinary) are both real managed cloud services — no self-hosting needed there.
- ❌ No compute layer chosen/provisioned for the three apps themselves (API server process, storefront SSR/ISR host, admin static host) — see Hosting above.

## 7. CI/CD & Version Control — ✅ done (2026-07-31)

- ✅ Git used properly (clear commit history, feature branches like `feat/voucher-for-shop`).
- ✅ **GitHub Actions pipeline added** (`.github/workflows/ci.yml`) — runs `pnpm lint` → `typecheck` → `test` → `build` (via Turborepo, so per-package) on every push to `main` and every PR. Verified locally end-to-end before wiring it up: all four gates pass clean at the repo root today.
  - Fixed what actually blocked this: `apps/api` had no `eslint.config.js` at all (`pnpm lint` hard-failed) — added one (`typescript-eslint` recommended, `no-unused-vars`/`no-explicit-any` as warnings) and fixed the 3 real violations it surfaced (an unused import, a stale `eslint-disable` comment, and the one legitimate case — Express's own `declare global { namespace Express }` augmentation — annotated with a targeted disable instead of removed). Also fixed 4 pre-existing `tsc --noEmit` errors in `catalog.service.ts`/`blog.service.ts`/`blog.controller.ts` (unused param, and `Partial<IProduct>`/`Partial<IPost>` casts through `unknown` — Mongoose accepts a string for a `ref` field at runtime despite the stricter `ObjectId` type, so this doesn't change behavior) that were blocking `pnpm typecheck`.
  - Also found `eslint`/`typescript-eslint` were never actually declared as `apps/api` dependencies — the working local `eslint src` was silently riding on hoisting from other workspace packages. Declared them explicitly so a clean `--frozen-lockfile` install (what CI does) doesn't depend on that accident.
  - Added a `typecheck` script to `apps/storefront` (had a valid `tsconfig.json` but no script wired to it) so CI's typecheck step actually covers 3 of the 4 workspace packages (`admin`'s type safety is covered by its `build` step, which already runs `tsc -b`).
  - **Known, disclosed gap, not silently hidden:** `apps/api` has zero test files despite `CLAUDE.md`/this doc's earlier text describing a Jest+Supertest suite — that suite was never actually written. Rather than block CI on a suite that doesn't exist, `jest --runInBand --passWithNoTests` was added so an empty suite doesn't fail the pipeline; this is standard practice while a real suite is built out incrementally, not a way of pretending tests exist. Writing that suite is separate, larger work not covered here.

## 8. Security & RLS — ✅ done (2026-07-31)

- ✅ CORS is an explicit allow-list (`CLIENT_ORIGIN`, `ADMIN_ORIGIN`) with `credentials: true`, not a wildcard.
- ✅ Zod validation at the request boundary (`validateRequest`), consistent error envelope, no leaking of raw Mongoose errors.
- ✅ **`helmet` added** (`apps/api/src/app.ts`, applied first, before CORS) — HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, a default CSP, etc. `crossOriginResourcePolicy` is explicitly relaxed to `'cross-origin'` (helmet's own default is `'same-origin'`), because the storefront and admin are separate origins from the API by design (§1/§2) — CORP is enforced by the browser independently of CORS, so leaving the default would have silently blocked every legitimate cross-origin fetch despite CORS allowing it. Verified live: `/health` and `/api/products` both return `Access-Control-Allow-Origin` + `Cross-Origin-Resource-Policy: cross-origin` for an allow-listed origin.
- ✅ Row-level-security doesn't map onto this app's design, and that's a scope statement rather than a gap: MongoDB has no RLS primitive, and per `SRS.md` there is no per-owner/multi-tenant resource model to scope against — this is a single-shop back office where `admin`/`staff` (§4's `requireRole`) is the only authorization axis that exists or is required. If a future requirement introduces ownership (e.g. multiple shops, or staff scoped to their own orders), this would need revisiting — but nothing today calls for it.
- ✅ `JWT_SECRET`/`JWT_REFRESH_SECRET` rotated to cryptographically random values, and the seeded admin password rotated + synced to the live Atlas admin user via `pnpm seed:admin` (2026-07-31). Previously flagged in `docs/system/NOTE.md` as a launch blocker — resolved for local `.env`. **Still needed:** the same rotation must be repeated for whatever production `.env` gets provisioned at deploy time (this only fixed the dev-cluster values); production secrets should never reuse these — tracked under §5 Hosting & Deployment, not a blocker for this section.

## 9. Rate Limiting — ✅ done

- `express-rate-limit`-based tiers in `apps/api/src/middlewares/rateLimitMiddleware.ts`: `publicRateLimit` (500/15min, catalog/blog), `authRateLimit` (20/15min, login/register — brute-force mitigation), `apiRateLimit` (200/15min, admin), `checkoutRateLimit` (20/15min, guest-writable order placement + voucher validation — explicitly called out as a partial mitigation for SRS §9's prank/spam-order risk pending OTP).
- Applied per-route across auth, blog, catalog, category, customer, media, order, and voucher routes.

## 10. Caching & CDN — ✅ done (2026-07-31)

- ✅ **Storefront ISR is now actually active** — `lib/api/server-public.ts`'s `serverFetch` previously set `next.tags` but never `next.revalidate`, so despite this file's own comment about Next's fetch defaulting to no persistent cache, no call site ever opted in: every public route was either fetching on every request or (once built) caching indefinitely with no revalidation window. Every `CatalogAPI`/`BlogAPI` call now passes an explicit window: products/categories 60s/300s, blog posts/categories 120s/300s.
- ✅ **Application-level cache added in front of MongoDB** for the read-heavy public paths — `apps/api/src/utils/ttlCache.util.ts` (in-process TTL cache, single-instance — would need Redis if the API ever scales to more than one process) wraps `CatalogService`'s and `BlogService`'s public reads (product/category list & by-slug, post list/by-slug/latest, blog categories). Admin-gated reads (`includeInactive`/`publicOnly=false` paths, e.g. `/admin/all`) always bypass the cache, so staff always see current state including drafts/inactive items. Every write path — including the ones that bypass the service layer entirely, like `catalog.interfaces.ts`'s `decrementStock`/`incrementStock` called from the order module at checkout — explicitly clears the relevant cache, verified live: creating then deleting a category via the admin API showed up on the public `/api/categories` list immediately, not after the TTL.
- ✅ **`Cache-Control` headers added** on every public GET route (`middlewares/cacheMiddleware.ts`'s `publicCache(seconds)`, applied per-route in `catalog.routes.ts`/`category.routes.ts`/`blog.routes.ts`) — `s-maxage` matching the ISR windows above, `stale-while-revalidate` for a 5x grace window. This makes the API itself CDN-cacheable; an actual CDN in front of it is still contingent on Hosting existing (§5) — that part isn't self-contained work, not something to fake here.
- ✅ Cloudinary itself acts as a CDN for product/blog images.
- 🟡 One accepted tradeoff: blog post view-count increments (`BlogService.getPostBySlug`) still fire on every request regardless of cache, but once a real CDN sits in front of the API and starts actually serving from edge cache, those requests won't reach the API at all — view counts become approximate under real CDN caching. Normal for this kind of counter, not treated as a blocker.

## 11. Load Balancing & Scaling — ❌ not done

- Single Express process, no clustering (no Node `cluster` module or PM2 config), no horizontal-scaling setup, no load balancer config anywhere. Not reachable until Hosting/Deployment lands — currently a non-issue because nothing is deployed, but will need addressing at that point.

## 12. Error Tracking & Logs — ✅ done (2026-07-31)

- ✅ **Structured logging added** — `apps/api/src/config/logger.config.ts` (Pino), pretty-printed in dev (`pino-pretty`), plain JSON in production so any log aggregator can parse it. Replaced every `console.log`/`console.error`/`console.warn` in the steady-state server path: `debugLogMiddleware`, `errorMiddleware`, `index.ts`'s startup/fatal logs, `db.config.ts`, `cloudinary.config.ts`, and the three cross-module event handlers (`catalog.events.ts`, `customer.events.ts`, `voucher.events.ts`) that previously swallowed async errors into a bare `console.error`. (One-off CLI seed scripts under `src/seed/` were left on `console.log` — they're not part of the running server, converting them wasn't part of this pass.)
- ✅ **Error-tracking service added** — `@sentry/node` (`apps/api/src/config/sentry.config.ts`), gated on an optional `SENTRY_DSN` env var: unset (the default, e.g. local dev) means `Sentry.init()` never runs and `Sentry.captureException()` calls are safe no-ops, so nothing extra is required to keep developing locally. Wired into `errorMiddleware.ts` for both the "unknown/unhandled" branch and any `AppError` with a 5xx status, into the three event handlers above, and into `db.config.ts`'s connection-error handler. Verified live: a forced 500 (temporary throwing route, removed after the test) produced both a full structured Pino stack trace and a `Sentry.captureException` call.
- ✅ `GET /health` endpoint exists (`apps/api/src/app.ts`) reporting `{ status, env }` — usable by an uptime monitor once deployed.

## 13. Availability & Recovery — ✅ done for what's actionable pre-deployment (2026-07-31)

- ✅ **Disaster-recovery plan documented** — `docs/system/DISASTER_RECOVERY.md`: scope (Atlas DB only — Cloudinary and app code have their own recovery stories), failure scenarios in scope with likelihood/impact, RPO (≤24h) and RTO (≤1h) targets, a numbered response procedure, and an honestly-labeled "known gaps" section (no off-machine copy of local backups yet, no scheduled trigger, no alerting on backup failure — see below).
- ✅ **Automated backup/restore scripts added** — `apps/api/src/scripts/backup.ts`/`restore.ts` (same ones built for §3), wrapping `mongodump`/`mongorestore`, with automatic retention pruning (keeps last 7) and a hard `--yes` confirmation gate on restore (it's `--drop`, i.e. destructive by design). "Automated" here means *scriptable/repeatable*, not yet *scheduled* — see the gap below.
- 🟡 **Honest gap, not hidden:** nothing runs the backup script on a timer yet — it's a manual `pnpm backup:db` today. There's also no off-machine copy (backups sit in `apps/api/backups/`, gitignored, local disk only) and no alerting if a scheduled run were to fail. Both are called out explicitly in `DISASTER_RECOVERY.md`'s "Known gaps" section as follow-ups once real hosting exists to run a cron/scheduled job from — genuinely contingent on §5 Hosting & Deployment, not something to fake here.
- Multi-region/failover and deployment redundancy remain out of scope, as before — those need real infrastructure to exist first (§5/§11), and are explicitly descoped in the DR plan as disproportionate to a single-shop application at this stage.
- Order-side compensating logic still exists at the data level (stock rollback on `ORDER_CANCELLED` via the event bus) — business-logic consistency, unrelated to but complementary to the above.

---

## Summary table

| # | Pillar | Status |
|---|---|---|
| 1 | Frontend | ✅ |
| 2 | APIs & Backend Logic | ✅ |
| 3 | Database & Storage | ✅ |
| 4 | Auth & Permissions | ✅ |
| 5 | Hosting & Deployment | ❌ |
| 6 | Cloud & Compute | 🟡 |
| 7 | CI/CD & Version Control | ✅ |
| 8 | Security & RLS | ✅ |
| 9 | Rate Limiting | ✅ |
| 10 | Caching & CDN | ✅ |
| 11 | Load Balancing & Scaling | ❌ |
| 12 | Error Tracking & Logs | ✅ |
| 13 | Availability & Recovery | ✅ |

**Bottom line (updated 2026-07-31):** every pillar that's implementable independent of a hosting decision is now done: frontend, backend, database, auth, security, rate limiting, caching, CI/CD, structured logging + error tracking, and a documented/tested backup-restore + disaster-recovery story. What's left — §5 Hosting & Deployment, §6 Cloud & Compute, and §11 Load Balancing & Scaling — is, by this project's own repeated finding, all downstream of one decision: where this actually runs. Those three are explicitly deferred as the intended final step, not overlooked. This still lines up with `docs/system/NOTE.md`'s original conclusion: domain integration is straightforward, and now the only remaining blocker is genuinely ops/infra, not missing product features or missing groundwork.
