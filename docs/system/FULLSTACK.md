# FULLSTACK.md — Production-Readiness Checklist

Snapshot of which "complete fullstack web app" pillars this project has vs. hasn't, checked directly against the running code (not the docs' target design — see `CLAUDE.md`'s "Docs describe target design" section for where the two diverge). Re-check this file when any of the ✅/🟡/❌ items below change; it will drift otherwise.

Legend: ✅ implemented and real · 🟡 partial / present but incomplete · ❌ not implemented

---

## 1. Frontend — ✅ mostly done

- **storefront** (`apps/storefront`): Next.js 16 App Router, public catalog/blog SSG/ISR via `lib/api/server-public.ts` (uses `fetch(..., { next: { revalidate } })`), `/cart` and `/checkout` as client-rendered flat routes. Product images via `ProductImageGallery.tsx`.
- **admin** (`apps/admin`): Vite + React 19 SPA. Real CRUD UIs for Orders, Customers, Products, Store/POS, Blog, and now Vouchers (`Vouchers.tsx`, `VoucherFormModal.tsx`).
- 🟡 Gaps: storefront has no product search/filter UI even though the API supports `search`/`category` query params; footer links to `/about` and `/order-lookup` which don't exist (404); `ContactWidget.tsx` social links are placeholder `href: '#'`.

## 2. APIs & Backend Logic — ✅ done

- Express v5 + TypeScript + ESM, modular structure per domain (`auth`, `customer`, `catalog`, `order`, `voucher`, `blog`, `media`) — each with `routes → controller → service → repository → model`, Zod DTOs, and `*.interfaces.ts` for cross-module calls.
- Cross-module side effects via `utils/eventBus.ts` (`ORDER_PLACED`, `ORDER_CANCELLED`, `STOCK_LOW`).
- Centralized error handling (`errorMiddleware.ts`) maps Zod/Mongoose/custom `AppError` to a consistent JSON envelope.
- ❌ No dedicated `cart` API module — cart is client-side only (`storefront/stores/cartStore.ts`), despite `packages/shared-types/src/cart.schema.ts` existing.

## 3. Database & Storage — ✅ done

- MongoDB via Mongoose v8 (`apps/api/src/config/db.config.ts`), connection string from `MONGODB_URI` env var — MongoDB Atlas is a real cloud service, ready for production as-is.
- Indexes defined on `blog`, `catalog`, and `order` models.
- File/image storage via Cloudinary (`configureCloudinary()` in `app.ts`), consumed by the multi-image product schema (`productImageSchema`).
- 🟡 No documented backup/restore process for the database (relies entirely on Atlas's own backup tier, not verified/configured in this repo).

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

## 7. CI/CD & Version Control — 🟡 partial

- ✅ Git used properly (clear commit history, feature branches like `feat/voucher-for-shop`).
- ❌ No CI/CD pipeline at all — no `.github/workflows`, no other CI config found anywhere in the repo. Tests (`pnpm test`, Jest + Supertest + `mongodb-memory-server`) exist but nothing runs them automatically on push/PR.

## 8. Security & RLS — ✅ done (2026-07-31)

- ✅ CORS is an explicit allow-list (`CLIENT_ORIGIN`, `ADMIN_ORIGIN`) with `credentials: true`, not a wildcard.
- ✅ Zod validation at the request boundary (`validateRequest`), consistent error envelope, no leaking of raw Mongoose errors.
- ✅ **`helmet` added** (`apps/api/src/app.ts`, applied first, before CORS) — HSTS, `X-Content-Type-Options: nosniff`, `X-Frame-Options`, a default CSP, etc. `crossOriginResourcePolicy` is explicitly relaxed to `'cross-origin'` (helmet's own default is `'same-origin'`), because the storefront and admin are separate origins from the API by design (§1/§2) — CORP is enforced by the browser independently of CORS, so leaving the default would have silently blocked every legitimate cross-origin fetch despite CORS allowing it. Verified live: `/health` and `/api/products` both return `Access-Control-Allow-Origin` + `Cross-Origin-Resource-Policy: cross-origin` for an allow-listed origin.
- ✅ Row-level-security doesn't map onto this app's design, and that's a scope statement rather than a gap: MongoDB has no RLS primitive, and per `SRS.md` there is no per-owner/multi-tenant resource model to scope against — this is a single-shop back office where `admin`/`staff` (§4's `requireRole`) is the only authorization axis that exists or is required. If a future requirement introduces ownership (e.g. multiple shops, or staff scoped to their own orders), this would need revisiting — but nothing today calls for it.
- ✅ `JWT_SECRET`/`JWT_REFRESH_SECRET` rotated to cryptographically random values, and the seeded admin password rotated + synced to the live Atlas admin user via `pnpm seed:admin` (2026-07-31). Previously flagged in `docs/system/NOTE.md` as a launch blocker — resolved for local `.env`. **Still needed:** the same rotation must be repeated for whatever production `.env` gets provisioned at deploy time (this only fixed the dev-cluster values); production secrets should never reuse these — tracked under §5 Hosting & Deployment, not a blocker for this section.

## 9. Rate Limiting — ✅ done

- `express-rate-limit`-based tiers in `apps/api/src/middlewares/rateLimitMiddleware.ts`: `publicRateLimit` (500/15min, catalog/blog), `authRateLimit` (20/15min, login/register — brute-force mitigation), `apiRateLimit` (200/15min, admin), `checkoutRateLimit` (20/15min, guest-writable order placement + voucher validation — explicitly called out as a partial mitigation for SRS §9's prank/spam-order risk pending OTP).
- Applied per-route across auth, blog, catalog, category, customer, media, order, and voucher routes.

## 10. Caching & CDN — 🟡 partial

- ✅ Storefront ISR: public catalog/blog reads go through `lib/api/server-public.ts` using `fetch(..., { next: { revalidate } })` for per-route cache windows — no cookies involved, so it's safely cacheable.
- ✅ Cloudinary itself acts as a CDN for product/blog images.
- ❌ No application-level cache (Redis or similar) in front of MongoDB — every admin/auth-gated read hits the DB directly.
- ❌ No CDN in front of the API or the deployed frontends (moot until Hosting/Deployment exists).

## 11. Load Balancing & Scaling — ❌ not done

- Single Express process, no clustering (no Node `cluster` module or PM2 config), no horizontal-scaling setup, no load balancer config anywhere. Not reachable until Hosting/Deployment lands — currently a non-issue because nothing is deployed, but will need addressing at that point.

## 12. Error Tracking & Logs — 🟡 partial

- ✅ `debugLogMiddleware` logs every request; `errorMiddleware.ts` funnels all unhandled errors through `console.error('Unhandled error:', err)`.
- ✅ `GET /health` endpoint exists (`apps/api/src/app.ts`) reporting `{ status, env }` — usable by an uptime monitor once deployed.
- ❌ No structured logging library (no Winston/Pino) and no error-tracking service (no Sentry or equivalent) — errors only ever go to stdout/stderr, nothing is aggregated or alerted on.

## 13. Availability & Recovery — ❌ not done

- No documented disaster-recovery plan, no automated DB backup/restore scripts, no multi-region or failover setup, no deployment redundancy (single point of failure by construction, since nothing is deployed yet). Order-side compensating logic exists at the data level (stock rollback on `ORDER_CANCELLED` via the event bus) but that's business-logic consistency, not infrastructure availability.

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
| 7 | CI/CD & Version Control | 🟡 |
| 8 | Security & RLS | ✅ |
| 9 | Rate Limiting | ✅ |
| 10 | Caching & CDN | 🟡 |
| 11 | Load Balancing & Scaling | ❌ |
| 12 | Error Tracking & Logs | 🟡 |
| 13 | Availability & Recovery | ❌ |

**Bottom line:** the application layer (frontend/backend/DB/rate limiting) is solid and the core purchase flow works end-to-end. Everything below the application layer — actually putting this on the internet, keeping it secure once public, and knowing when it breaks — is the remaining work. This lines up with `docs/system/NOTE.md`'s conclusion: domain integration is straightforward, but launch readiness is blocked by ops/infra, not by missing product features.
