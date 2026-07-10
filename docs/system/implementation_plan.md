# Implementation Plan — Bánh Tráng Nhà Na (Greenfield Build)

This plan implements the full monorepo greenfield build described in `ARCHITECTURE_BLUEPRINT_GREENFIELD.md` from scratch. The target directory is `d:\Code\BanhTrangNhâN\banh-na-nha-trang\`.

---

## Summary

A pnpm monorepo with three deployable apps and one shared package:
- **`apps/storefront`** — Next.js 15 App Router, hybrid ISR/SSR/CSR, TypeScript, Tailwind v4
- **`apps/api`** — Express v5, MongoDB/Mongoose, TypeScript, 8 business modules
- **`apps/admin`** — Vite + React 19 SPA, TypeScript, Tailwind v4
- **`packages/shared-types`** — Zod schemas, one per domain object, consumed by all three apps

---

## Proposed Changes

### Phase 1 — Workspace Root

#### [NEW] `pnpm-workspace.yaml`
Declares `apps/*` and `packages/*` workspace patterns.

#### [NEW] `turbo.json`
Pipeline for `build`, `dev`, `lint`, `test`, `typecheck` — all four packages.

#### [NEW] `package.json` (root)
Root scripts only (`dev`, `build`, `lint`, `test`). No application code.

---

### Phase 2 — `packages/shared-types`

Eight schema files (one per domain object) + `index.ts`:

- `common.schema.ts` — Response envelope, pagination meta, error shape
- `auth.schema.ts` — Register/login bodies; User type
- `customer.schema.ts` — Customer, Address
- `catalog.schema.ts` — Product (flat, no variants), Category
- `cart.schema.ts` — GuestCartItem, ServerCartItem
- `order.schema.ts` — Order, OrderItem (with snapshot), place-order body
- `voucher.schema.ts` — Voucher, validate body
- `blog.schema.ts` — Post, PostCategory
- `media.schema.ts` — Upload response

All export Zod schemas AND `z.infer<>` TypeScript types.

---

### Phase 3 — `apps/api`

Full Express v5 API with 8 modules, each following the strict pattern:
`model → repository → service → controller → routes → dto → interfaces → events`

#### Config
- `src/config/env.ts` — Zod-validated; all `process.env` reads happen here
- `src/config/db.config.ts`, `cloudinary.config.ts`, `multer.config.ts`

#### Middlewares
- `authMiddleware.ts` — `verifyToken` / `optionalVerifyToken`
- `roleMiddleware.ts` — `requireRole('admin')`
- `errorMiddleware.ts` — maps Zod/Mongoose/app errors to standard envelope
- `rateLimitMiddleware.ts` — separate limits for public vs. authenticated routes

#### Utils
- `baseSchemaOptions.ts` — timestamps, `_id→id` transform, strips `__v`
- `slugify.ts` — Vietnamese diacritic-free slugs (shared by Product + Post)
- `token.util.ts` — issues JWT cookie with correct `Domain`/`SameSite` per env
- `eventBus.ts` — singleton pub/sub for cross-module side effects

#### Modules (8)
Each module has the same 8-file structure. Cross-module calls only through `*.interfaces.ts`.

1. **`auth`** — User model, JWT lifecycle, register/login/refresh/logout
2. **`customer`** — Customer keyed by phone (D5), nullable userId, purchase history
3. **`catalog`** — Flat Product (D2, no variants), Category, atomic stock ops (D4)
4. **`cart`** — Server-side cart for authenticated users; guests use localStorage
5. **`order`** — Transactional order placement, status machine (D3), POS mode (D7)
6. **`voucher`** — Percentage/fixed, usedByPhones (D6), phone-keyed usage limits
7. **`blog`** — Post + PostCategory, markdown content, relatedProductIds linkage
8. **`media`** — Cloudinary upload/delete via multer

#### Seed Scripts
- `seedAdmin.ts` — one admin user (idempotent)
- `seedCatalog.ts` — 4 categories, 12 products with real Vietnamese data
- `seedBlog.ts` — 2 post categories, 6 posts each linked to ≥1 product

> [!IMPORTANT]
> Order module must be built last — it depends on catalog, customer, and voucher via their interfaces.

---

### Phase 4 — `apps/storefront`

Next.js 15 App Router with hybrid rendering per §7.1 of the blueprint.

#### Lib Layer
- `lib/env.ts` — Zod-parsed env, fails at import on missing vars
- `lib/auth-edge.ts` — jose-based JWT verify (Edge Runtime compatible)
- `lib/api/server-public.ts` — cacheable, no cookies, ISR-capable
- `lib/api/server-authenticated.ts` — cookie-forwarded, `cache: 'no-store'`
- `lib/api/client.ts` — browser fetch wrapper, 401→refresh→retry interceptor
- `lib/api/errors.ts` — ApiError class
- `lib/seo/metadata.ts` — `buildMetadata()` with canonical always set
- `lib/seo/json-ld.tsx` — `<JsonLd>` component for structured data
- `lib/markdown.ts` — remark → rehype → sanitize pipeline (server-only)

#### Stores
- `stores/cartStore.ts` — persist + `skipHydration: true` + `hasHydrated` gate (§3.4)
- `stores/authStore.ts` — client-only display state

#### Middleware
- `middleware.ts` — Edge gate on `/account/*` using jose

#### App Routes (per §4.1 + §7.1)

| Route | Rendering | Key features |
|---|---|---|
| `/` | ISR 3600s | Featured products, latest 3 posts, Organization+LocalBusiness JSON-LD |
| `/products` | SSR | Filter params, noindex when any filter present |
| `/products/[slug]` | ISR 300s | Product+Offer JSON-LD, Breadcrumbs, notFound() if inactive |
| `/collections/[slug]` | ISR 600s | BreadcrumbList JSON-LD |
| `/blog` | ISR 600s | BreadcrumbList JSON-LD |
| `/blog/[slug]` | ISR 3600s | Article+BreadcrumbList JSON-LD, relatedProducts block |
| `/blog/chu-de/[slug]` | ISR 3600s | Post category listing |
| `/about` | Static | LocalBusiness JSON-LD |
| `/lien-he` | Static | Contact info |
| `(shop)/cart` | CSR, noindex | CartStore-driven |
| `(shop)/checkout` | CSR, noindex | Guest checkout, no account required |
| `(shop)/checkout/success` | CSR, noindex | Order confirmation |
| `(shop)/order-lookup` | CSR, noindex | Order tracking by phone + orderNumber |
| `(auth)/login` | CSR, noindex | Sets httpOnly cookie via API |
| `(auth)/register` | CSR, noindex | |
| `account/orders` | Dynamic, middleware-gated | fetchAuthenticated only |

#### Components
- `components/layout/` — Header (with cart badge island), Footer, Breadcrumbs
- `components/product/` — ProductCard, PriceTag
- `components/blog/` — PostCard, RelatedProducts
- `components/forms/` — shared form primitives

#### SEO Infrastructure
- `app/sitemap.ts` — fetches live products + posts, returns all indexable URLs
- `app/robots.ts` — disallows shop/auth/account routes

---

### Phase 5 — `apps/admin`

Vite + React SPA, internal tool, no SSR requirement.

- `src/services/apiClient.ts` — direct cross-origin, `credentials: 'include'`
- `src/stores/authStore.ts` — role: 'admin' guard
- Routes per §4.3: dashboard, products, categories, orders, customers, vouchers, blog, media

---

### Phase 6 — Cross-cutting

- CORS allow-list in `apps/api/src/app.ts` contains admin panel origin, `credentials: true`, no wildcard
- `token.util.ts` issues `Domain=.<registrabledomain>` in production, no Domain attr in dev
- Storefront `next.config.ts` rewrites `/api/:path*` → API origin
- `JWT_SECRET` shared as server-only env var between API and storefront's `lib/auth-edge.ts`

---

## Open Questions

> [!NOTE]
> These are unresolved per SRS §9—no action taken, noted for awareness:
> 1. **Junk order protection** — OTP, rate limit by phone, or accept risk. Shop owner decision.
> 2. **POS staff role** — currently admin-only. A `staff` role is not built.

---

## Verification Plan

### Automated
- `pnpm turbo typecheck` — `tsc --noEmit` across all packages, zero errors
- `pnpm turbo test` — Jest integration tests for API against mongodb-memory-server
- Seed scripts run idempotently (run twice, no duplicates)

### Manual
1. `curl` a product page → name, price, description in raw HTML (no JS)
2. Every route has distinct `<title>` + `<meta description>`
3. `/sitemap.xml` lists all active products + published posts
4. `/robots.txt` disallows `/cart`, `/checkout`, `/account`, `/login`
5. Guest cart: add items, reload page → zero hydration console errors
6. Admin panel: create product → storefront shows it within ISR window
7. Order placement: submit checkout → stock decrements atomically

### Execution Order

The phases must be executed in order due to dependency chain:

```
shared-types → api → storefront → admin → cross-cutting
```
