# Architecture Blueprint — Bánh Tráng Nhà Na (Greenfield Build)

> **Purpose:** This document is a scaffolding guide for an AI coding agent (Claude Code, Cursor, or similar) building this project from an empty repository. Nothing described here needs to be reconciled with, migrated from, or kept compatible with any prior implementation — there isn't one. Every decision below is derived directly from the project's requirements documents and stated as a decision, not an option.
>
> **Why the storefront is a Next.js App Router application from the first commit:** a client-rendered SPA ships `<div id="root"></div>` as its entire first response. Crawlers either don't execute JavaScript or apply a secondary, budget-limited render pass that frequently times out on an empty shell, and social-link unfurlers (Facebook, Zalo — the dominant sharing channels in this market) generally don't execute JavaScript at all. This product's core traffic loop — a blog article ranks, a reader clicks through to a product — depends entirely on both halves of that loop being visible in the raw HTML of the first response. Server-rendering the public, indexable surface is therefore a starting requirement, not a later optimization.

---

## 0. Foundational Decisions

Three questions don't have a single obvious answer and are decided explicitly here, with reasoning, rather than defaulted.

### 0.1 Backend language: TypeScript

The backend is built in **TypeScript**, not JavaScript. On a from-scratch build there's no migration cost to weigh against this — the usual case for "leave a working JS backend alone" doesn't exist here. Concretely, TypeScript on the backend enables a single `packages/shared-types` workspace package: one Zod schema per domain object, consumed by the API for request validation, and by both the storefront and the admin panel for form validation and typed fetch responses. That single source of truth is what keeps the documented API surface (`SRS.md` §5) and the running code from drifting apart — a real risk on any project with more than one client consuming the same API. Mongoose also has native TypeScript generic support (`Schema<TDocument>`), so the ORM layer isn't fighting the type system.

### 0.2 Workspace tooling: pnpm workspaces, Turborepo once it earns its keep

With three deployable apps (storefront, admin, API) and one shared package, a monorepo is justified on its own terms here — not inherited from a reference project. **pnpm workspaces** let `packages/shared-types` be imported by all three apps without publishing to a registry. **Turborepo** is added alongside it: with four packages in the workspace, caching `build`/`typecheck`/`test` per package and parallelizing them in CI pays for its own configuration cost immediately.

### 0.3 Admin panel stack: Vite + React + TypeScript SPA

The admin panel is an internal, authenticated back-office tool with no crawler or link-preview requirement — none of the rendering-strategy machinery that justifies Next.js for the storefront applies to it. A Vite-built React SPA gives the fastest dev loop and the simplest deploy model (a single static bundle) for that kind of tool. It's written in TypeScript specifically to consume `packages/shared-types` — the one piece of the Next.js stack decision that *does* carry over, since it costs nothing and buys the same drift protection against the API.

### 0.4 Where the requirement documents disagree

`SRS.md` and `API_CONTRACT.md` are both treated as authoritative, but they don't fully agree. Each conflict is resolved in favor of `SRS.md`, since it is the document that explicitly records deliberate decisions (`SRS.md` §2, D1–D8):

- **Order status enum value.** `SRS.md` uses `pending`; `API_CONTRACT.md` uses `pending_confirmation`. **Built as:** `pending`.
- **Product shape.** `API_CONTRACT.md` describes a `Product` with a `variants[]` array (per-variant SKU, price modifier, stock). `SRS.md` §2 (D2) specifies a flat product: one price, one stock count, one optional `flavor` string — two flavors of the same snack are two separate products. **Built as:** flat, no variants. This also means `Cart` items carry `productId` + `quantity` only, never a `variantId`.
- **Admin route prefix.** `SRS.md` §5 places every admin-only endpoint under `/api/v1/admin/*`, guarded by one middleware. `API_CONTRACT.md` shows some admin routes nested under their resource (`/orders/admin/status/:id`). **Built as:** `/api/v1/admin/*` uniformly — one middleware, one guard, no per-resource admin nesting.
- **Stock-decrement timing.** `SRS.md` §2 (D4) is explicit: stock decrements atomically at order placement and restores on cancellation, specifically to prevent overselling when two customers order the last unit. `API_CONTRACT.md` independently describes the same behavior and only flags a divergence against an older, superseded Vietnamese spec document — not against `SRS.md`. No conflict to resolve here; noted for completeness since it's exactly the kind of rule that's easy to get backwards.

`SRS.md` §9's open questions — junk-order protection and a `staff` role — are not specified, so nothing in this document builds a route, guard, or model field around either.

### 0.5 Where the reference blueprint's shape doesn't map cleanly

The formatting exemplar this document's structure is drawn from was written for a real-time multiplayer game. A few of its structural decisions are specific to that problem and are deliberately not reproduced:

- **No Socket.IO, no socket namespace, no socket-event schema.** There is no real-time surface in this product at all.
- **`packages/shared-types` holds REST Zod schemas here, not socket-event payloads** — an analogous role (one shared contract, two or three consumers) applied to a different transport.
- **Three deployable apps, not two.** The reference project's case for keeping the API a separate Express service rested on Socket.IO needing a persistent process incompatible with serverless Route Handlers. That reasoning doesn't apply here — there's no WebSocket. The actual reason the API stays its own Express service is simpler: it has two independent clients (the storefront and the admin panel) with different rendering models, and folding a shared backend into either app's framework would make it awkward for the other to consume.

---

## 1. Tech Stack Overview

### 1.1 Storefront — `apps/storefront`

| Category | Technology | Why |
|---|---|---|
| Framework | **Next.js 15** (App Router, React 19) | Server Components render real product and article HTML in the first response — see the header note. File-based routing maps 1:1 onto the sitemap in §7.1. |
| Language | **TypeScript 5** (strict mode) | Consumes `packages/shared-types` for both compile-time types and runtime form validation, matched against the same Zod schemas the API validates requests with. |
| Routing | App Router, two route groups: `(shop)`, `(auth)` | Route Groups segment noindex/CSR behavior without changing the URL — see §2.2. Everything else is served at the URL it appears at. |
| Rendering strategy | SSG/ISR for the public catalog and blog, SSR for `/products`, CSR islands for cart/checkout/account | The exact strategy per route is in §7.1 — the central design concern of this document, not a footnote. |
| State management | **Zustand v5** | Two jobs: the guest cart, persisted to browser storage (§3.4), and light client-only UI state (auth-display state, mobile nav). Nothing here backs a server render. |
| Data fetching (server lane) | Native `fetch()`, wrapped in `lib/api/server-public.ts` and `lib/api/server-authenticated.ts`, typed against `@repo/shared-types` | Two wrappers, not one — see the Dual Data-Fetching Lane Pattern in §3.3. A cacheable public fetch and a cookie-bearing one must never share a Server Component, or the cache can serve one visitor's data to the next. |
| Data fetching (client lane) | A small `fetch()`-based `apiClient`, not Axios | `fetch()` already provides what's needed (JSON handling, `AbortController`) once wrapped with a thin 401-retry helper; Axios would add roughly 13 KB gzipped to exactly the bundles — cart, checkout, account — this project cares most about keeping light. |
| Styling | **Tailwind CSS v4** | Maps directly onto the design system's tokens (see `DESIGN.md`, not reproduced here). |
| Fonts | **`next/font/google`** — Newsreader (headings) + Public Sans (body/UI), `subsets: ['vietnamese', 'latin']` | Self-hosted, no render-blocking external font request, no fallback-font layout jump. The Vietnamese subset is required, not optional — diacritics must render correctly at every weight. |
| Image optimization | **`next/image`** | Responsive `srcset`, lazy-loading, modern-format negotiation, and explicit width/height sourced from `Product.images[]` and `Post.coverImage` (`SRS.md` §3.4, §3.9) — prevents layout shift on every card and hero image. |
| Metadata / SEO | **Next.js Metadata API** (`generateMetadata`) | Resolved server-side, before the response is sent — see §7.2. |
| Markdown rendering | **`unified`/`remark`/`rehype`** pipeline (`remark-gfm` → `remark-rehype` → `rehype-sanitize` → `rehype-stringify`), run inside `blog.service.ts` | `Post.content` (`SRS.md` §3.9) is markdown authored in the admin panel. Converting it to sanitized HTML entirely on the server and rendering the resulting string in a Server Component ships zero markdown-parsing JavaScript to the client, and `rehype-sanitize` keeps admin-authored HTML from being trusted blindly on a page search engines crawl. |
| Runtime validation | **Zod**, via `@repo/shared-types` | The same schemas the API validates against drive the checkout and auth form validation here — one definition, not two kept in sync by hand. |
| Environment validation | `lib/env.ts`, Zod-parsed at import time | A small typed object built from `process.env`, failing fast on a missing or malformed variable. |
| Edge-safe JWT verification | **`jose`** | `middleware.ts` runs on the Edge Runtime, where Node's `crypto` module (which `jsonwebtoken` depends on) isn't available. `jose` is pure JavaScript and Edge-compatible — the only place it's used. |
| Build tool | Next.js compiler (Turbopack in dev) | Automatic per-route code splitting: a visitor on `/blog/[slug]` never downloads the checkout form's JavaScript. |
| Linting | ESLint 9 (flat config) + `eslint-config-next` | Includes the `next/core-web-vitals` ruleset. |
| Testing | Vitest + React Testing Library (unit); Playwright (e2e) | Playwright is what actually catches a hydration mismatch — a guest-checkout happy path and the login → account flow are the first two specs to write. |

### 1.2 API — `apps/api`

| Category | Technology | Why |
|---|---|---|
| Runtime | Node.js 20+ (ESM) | — |
| Language | **TypeScript 5** (strict mode), compiled to `dist/` via `tsc` for production, run in dev via `tsx watch` | See §0.1. |
| Framework | **Express v5** | A mature, well-understood REST framework for a modular-monolith API with two independent HTTP clients (storefront, admin) — no framework-level reason to reach for anything heavier. |
| Database | **MongoDB via Mongoose v8**, typed `Schema<TDocument>` per model | Document-shaped data (product catalog, orders with embedded snapshots) fits Mongo's model well; Mongoose's TypeScript generics keep the ODM layer type-checked. |
| Authentication | JWT (`jsonwebtoken`), HMAC-signed, stored in an httpOnly cookie (`access_token`, 15 min; `refresh_token`, 7 days) | No Bearer tokens — the token is never readable from client JavaScript. `optionalVerifyToken` middleware accepts both guests and authenticated users on endpoints like `POST /orders` and `POST /vouchers/validate`, since checkout never requires an account (`SRS.md` §1). |
| Runtime validation | **Zod**, defined once in `packages/shared-types` | Every route handler validates its request body against the same schema the storefront and admin panel use for client-side form validation. |
| Password hashing | `bcrypt` | — |
| File uploads | Multer + Cloudinary SDK | Product and post images are uploaded through `media.service.ts` and stored on Cloudinary; the API never persists image bytes itself. |
| Unique IDs | MongoDB `ObjectId` (default) | No additional ID scheme needed; `orderNumber` (`BTNN-YYYYMMDD-NNN`) is a separate, human-facing field, not the document's primary key. |
| Rate limiting | `express-rate-limit`, tuned separately for public catalog/blog routes (expect crawler and SSG-build traffic) versus authenticated routes (expect per-user abuse patterns) | — |
| Testing | Jest + Supertest + `mongodb-memory-server`, with `ts-jest` | Integration tests exercise the real Express app against an in-memory Mongo instance — no live database dependency in CI. |
| Dev server | `tsx watch` | Fast, ESM-native TypeScript execution without a separate compile step in development. |

### 1.3 Admin panel — `apps/admin`

| Category | Technology | Why |
|---|---|---|
| Framework | **Vite + React 19** | See §0.3 — no SSR requirement, fastest dev loop for an internal tool. |
| Language | **TypeScript 5** | Consumes `@repo/shared-types` for typed API calls and form validation, same as the storefront. |
| Routing | `react-router-dom` v7 | A conventional client-side router is sufficient; there's no URL a search engine or a social unfurler will ever see. |
| Data fetching | The same lightweight `fetch()`-based `apiClient` pattern used in the storefront's client lane, duplicated rather than shared | The wrapper is roughly thirty lines; a second shared package to avoid duplicating it isn't justified by its size. |
| Styling | Tailwind CSS v4 | Consistent with the storefront's styling approach; the admin panel does not need to match the storefront's brand design system closely, only to be internally consistent and legible. |
| State management | Zustand | Auth/session display state and any multi-step form state (e.g., the product-creation form). No browser-storage persistence concerns here — see §3.4, which is specific to the storefront's guest cart. |
| Build tool | Vite | — |
| Deployment | Static bundle, any static host (Vercel, Netlify, or the same platform serving the storefront) | No server-rendering requirement means no framework lock-in on the hosting side. |

### 1.4 Workspace layout

```
repo-root/
├── apps/
│   ├── storefront/                  # Next.js App Router
│   ├── admin/                       # Vite + React SPA
│   └── api/                         # Express + MongoDB
├── packages/
│   └── shared-types/                # Zod schemas + inferred TS types
│       ├── src/
│       │   ├── common.schema.ts     # response envelope, pagination, error shape
│       │   ├── auth.schema.ts
│       │   ├── customer.schema.ts
│       │   ├── catalog.schema.ts    # Product, Category
│       │   ├── cart.schema.ts
│       │   ├── order.schema.ts
│       │   ├── voucher.schema.ts
│       │   ├── blog.schema.ts       # Post, PostCategory
│       │   ├── media.schema.ts
│       │   └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── turbo.json
└── package.json                     # root scripts only, no app code
```

`packages/shared-types` has no runtime dependency beyond `zod`. It is imported by `apps/api` for request validation and response typing, and by `apps/storefront` and `apps/admin` for form validation and typed fetch results — one definition per domain object, everywhere.

---

## 2. System Architecture

### 2.1 Storefront hybrid-rendering flow

```
Browser · Googlebot · Zalo/Facebook link-unfurler
              │
              ▼
┌───────────────────────────────────────────────────────────┐
│  apps/storefront (Next.js)                                   │
│                                                               │
│  Server Component  (page.tsx)                                │
│    • generateMetadata()                                      │
│    • fetch via lib/api/server-public.ts  ───────────┐        │
│    • renders the static shell, delegates interactive │        │
│      regions to a Client Component island            │        │
│              │                                        │        │
│              ▼                                        ▼        │
│  Client Component island                    catalog.service.ts│
│  ('use client': cart drawer,                 blog.service.ts  │
│   checkout form, account forms)                    │           │
│    • fetch via lib/api/client.ts                    │           │
│      (credentials: 'include')                       │           │
│              │                                        │           │
└──────────────┼────────────────────────────────────────┼─────────┘
               │                                        │
               ▼                                        ▼
        /api/* rewrite (next.config.ts)  ──────▶  apps/api (Express)
                                                          ▲
                                          CORS + credentialed cookie
                                                          │
                                              apps/admin (Vite SPA)
```

Public, cacheable reads (`catalog.service.ts`, `blog.service.ts`) go through the storefront's server lane and are ISR-eligible. Anything cookie-bearing — cart mutations, checkout, account — goes through the client lane and is never cached. The admin panel talks to `apps/api` directly, cross-origin, since it has no crawler constraint driving it toward a proxy — see §3.5.

### 2.2 Route groups mapped to the sitemap

| Route | Group | Index? | Rendering (§7.1) |
|---|---|---|---|
| `/` | — | index | ISR, revalidate 3600 |
| `/products` | — | index (filtered variants noindex,follow — §7.6) | SSR |
| `/products/[slug]` | — | index | ISR, revalidate 300 |
| `/collections/[slug]` | — | index | ISR, revalidate 600 |
| `/blog` | — | index | ISR, revalidate 600 |
| `/blog/[slug]` | — | index | ISR, revalidate 3600 |
| `/blog/chu-de/[slug]` | — | index | ISR, revalidate 3600 |
| `/about` | — | index | Static |
| `/lien-he` | — | index | Static |
| `/cart`, `/checkout`, `/checkout/success`, `/order-lookup` | `(shop)` | noindex, nofollow | CSR |
| `/login`, `/register` | `(auth)` | noindex, nofollow | CSR |
| `/account/*` | plain `account/` folder, middleware-gated | noindex, nofollow | CSR, dynamic (cookie-forwarded, never cached) |

### 2.3 API modules (`SRS.md` §4)

| Module | Owns | Exposes via `*.interfaces.ts` |
|---|---|---|
| `auth` | `User`, JWT issuance | `getUserById`, `getUserByEmail` |
| `customer` | `Customer` | `upsertByPhone`, `getCustomerSnapshot`, `incrementStats` |
| `catalog` | `Product`, `Category` | `getProductById`, `getProductSnapshot`, `decrementStock`, `incrementStock` |
| `cart` | `Cart` (authenticated users only — guests hold theirs client-side, §3.4) | `clearCart` |
| `order` | `Order` | `getOrderCountToday`, `getRecentOrders` |
| `voucher` | `Voucher` | `validateVoucher`, `consumeVoucher`, `releaseVoucher` |
| `blog` | `Post`, `PostCategory` | — |
| `media` | Cloudinary uploads | `uploadImage`, `deleteImage` |

Events (`utils/eventBus.ts`): `USER_REGISTERED` (auth → customer), `ORDER_PLACED` (order → customer), `ORDER_CANCELLED` (order → catalog, voucher, customer), `STOCK_LOW` (catalog → log only). Full detail in `SRS.md` §4 — not duplicated further here.

---

## 3. Design Patterns & Conventions

### 3.1 API patterns — the shape every module follows from its first commit

```
Route → Controller → Service → Repository → Mongoose Model
              ↓ (formats)
             DTO ← validated against → Zod schema (packages/shared-types)
```

- **Repository** — the only layer that talks to Mongoose directly.
- **Service** — business logic; the only layer that calls a repository or another module's `interfaces.ts`.
- **Controller** — thin: parses the request, calls a service, formats the response through a DTO.
- **Interface** (`*.interfaces.ts`) — the only way one module reaches into another. A service never imports a different module's service or repository directly.
- **DTO** (`*.dto.ts`) — maps a Mongoose document to the response shape defined in `packages/shared-types`.
- **EventBus** — a singleton pub/sub for cross-module side effects (§2.3's event table) that shouldn't block the request that triggered them.
- **Standardized error response**, built once in the global error handler and used everywhere:

```ts
// success
{ success: true, message: string, data: T, meta: PaginationMeta | null }

// error
{ success: false, error: { statusCode: number, message: string, cause: unknown | null } }
```

Route-level request validation is a single line per route: `validateRequest(CatalogSchemas.createProductSchema)`, imported directly from `@repo/shared-types` — no module maintains its own copy of a validator.

### 3.2 Server Component page + Client Component island

Every route's `page.tsx` is a Server Component by default. It owns `generateMetadata`, the initial public fetch, and the static shell, and delegates anything stateful to a Client Component.

```
app/products/[slug]/
├── page.tsx                    Server Component: metadata + product fetch (ISR)
├── _components/
│   └── AddToCartButton.tsx     'use client' — the only interactive piece
└── _services/
    └── product.service.ts      wraps lib/api/server-public.ts for this route
```

`_components/`, `_hooks/`, `_services/` — underscore-prefixed folders opt out of route resolution; without the prefix, Next.js would treat a `page.tsx` inside one as a routable segment. Omit whichever of the three a given route has no content for.

### 3.3 Dual data-fetching lane pattern

| | Server lane | Client lane |
|---|---|---|
| Where | `generateMetadata`, `page.tsx`, `layout.tsx` | `'use client'` components — hooks, event handlers |
| File | `lib/api/server-public.ts` / `lib/api/server-authenticated.ts` | `lib/api/client.ts` |
| Auth | Public: none. Authenticated: cookie forwarded by hand via `next/headers` — Server Components never receive the browser's cookies automatically | Browser sends `access_token` automatically, `credentials: 'include'` |
| Caching | Public: Next's `fetch` cache + `revalidate`. Authenticated: `cache: 'no-store'`, route segment marked `export const dynamic = 'force-dynamic'` | Never cached |
| Used for | `/products`, `/products/[slug]`, `/collections/[slug]`, `/blog*`, `/about`, `/lien-he`, `sitemap.ts` | Cart mutations, checkout submission, login/register, `/account/*` |
| Rule | If a piece of data needs to be in the HTML a crawler sees, it goes through the public wrapper. Anything cookie-bearing goes through the authenticated wrapper — the two must never share a Server Component, or the cache can serve one visitor's session data to the next. | |

```ts
// lib/api/server-public.ts — cacheable, no cookies
export async function fetchPublic<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${env.API_ORIGIN}/api/v1${path}`, { next: { revalidate } });
  if (!res.ok) throw await ApiError.fromResponse(res);
  return (await res.json()).data as T;
}

// lib/api/server-authenticated.ts — dynamic, forwards the session cookie
import { cookies } from 'next/headers';

export async function fetchAuthenticated<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const res = await fetch(`${env.API_ORIGIN}/api/v1${path}`, {
    headers: { Cookie: cookieStore.toString() },
    cache: 'no-store',
  });
  if (!res.ok) throw await ApiError.fromResponse(res);
  return (await res.json()).data as T;
}
```

Every `account/**/page.tsx` sets `export const dynamic = 'force-dynamic'` and imports only `fetchAuthenticated`.

### 3.4 Guest cart, hydration-safe from the start

Checkout never requires an account (`SRS.md` §1, §3.5), so the guest cart lives in browser storage. Any store backed by browser storage renders differently on the server (which has none) than on the client (which may already have a populated cart), which is exactly the shape of a hydration mismatch if handled naively. The standing convention for every such store:

```ts
// stores/cartStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface CartState {
  items: GuestCartItem[];
  hasHydrated: boolean;
  setHasHydrated: (v: boolean) => void;
  // ...add/remove/update actions
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      hasHydrated: false,
      setHasHydrated: (v) => set({ hasHydrated: v }),
      // ...
    }),
    {
      name: 'btnn-guest-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // the server renders an empty cart; nothing hydrates until asked
    }
  )
);
```

```tsx
// app/layout.tsx or a top-level 'use client' provider
useEffect(() => {
  useCartStore.persist.rehydrate();
  useCartStore.getState().setHasHydrated(true);
}, []);
```

Any component reading `items` for display (the header's cart badge, the cart drawer) gates on `hasHydrated` and renders a neutral state until it's `true`. This is what makes the server's empty-cart render and the client's real cart converge without React discarding the DOM. On login, the guest cart's contents are posted to `POST /cart/items` one item at a time and the local store is cleared.

### 3.5 Cross-origin cookies — two apps, two strategies

The storefront and the admin panel reach `apps/api` differently, because only one of them has a crawler-facing constraint.

**Storefront → API: reverse proxy.** `next.config.ts` rewrites `/api/*` to the API's real origin:

```ts
// next.config.ts (apps/storefront)
const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: '/api/:path*', destination: `${process.env.API_ORIGIN}/api/:path*` }];
  },
  images: { remotePatterns: [{ hostname: 'res.cloudinary.com' }] },
};
```

The client lane calls relative paths (`/api/v1/products`); from the browser's perspective this is a same-origin request, so the `Set-Cookie` response that comes back through the proxy is set against the storefront's own host. No `Domain` configuration, no `SameSite=None`, no Safari cross-site cookie blocking to reason about. Server Components bypass the rewrite and call `API_ORIGIN` directly, since that's a server-to-server call with no browser cookie jar involved.

**Admin panel → API: direct cross-origin call, CORS + a shared parent domain.** The admin panel is deployed on its own origin (e.g., `admin.banhtrangnhana.com`) and calls the API directly (e.g., `api.banhtrangnhana.com`). In production, the JWT cookie is issued with `Domain=.banhtrangnhana.com` so both hosts, sharing a registrable domain, can read and send it, and the API's CORS configuration explicitly allow-lists the admin origin with `credentials: true` — never a wildcard, which is incompatible with credentialed cookies. In local development this needs no special handling: browsers treat `localhost:3000` and `localhost:5000` as same-site regardless of port for `SameSite=Lax` purposes, so the cookie already works across ports without a proxy.

### 3.6 Route protection pattern

Only `/account/*` is gated in the storefront's `middleware.ts` — there is no admin-role check here, since the admin panel is a separate application with its own login and its own role check.

```ts
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyEdgeToken } from '@/lib/auth-edge'; // jose-based, Edge-compatible

export const config = { matcher: ['/account/:path*'] };

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('access_token')?.value;
  const session = token ? await verifyEdgeToken(token) : null;
  if (!session) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}
```

`apps/admin` implements its own equivalent check as a client-side route guard around `role: 'admin'`, since a Vite SPA has no server-side middleware layer to run before the bundle loads.

### 3.7 Naming conventions

| Artifact | Convention | Example |
|---|---|---|
| Server Components | PascalCase `.tsx`, no directive | `page.tsx` default export |
| Client Components | PascalCase `.tsx`, `'use client'` at top | `AddToCartButton.tsx` |
| Route hooks | `useXxx.hook.ts` | `useCheckoutForm.hook.ts` |
| Route services | `xxx.service.ts` | `product.service.ts` |
| Zustand stores | `useXxxStore.ts` | `useCartStore.ts` |
| Zod schemas (shared) | `xxx.schema.ts` | `catalog.schema.ts` |
| Private (non-route) folders under `app/` | `_camelCase/` | `_components/`, `_services/` |
| Route Groups | `(camelCase)` | `(shop)`, `(auth)` |
| Dynamic segments | `[paramName]` | `products/[slug]/page.tsx` |
| Next.js special files | fixed lowercase names | `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `sitemap.ts`, `robots.ts` |
| API services/repositories/DTOs/controllers | `XxxService`, `XxxRepository`, `XxxDTO`, `XxxController` (plain object exports) | `CatalogService` |
| Env vars | `SCREAMING_SNAKE_CASE`; client-exposed ones prefixed `NEXT_PUBLIC_` (storefront) or `VITE_` (admin) | `NEXT_PUBLIC_SITE_URL`, `VITE_API_URL`, `API_ORIGIN` (server-only) |
| API route prefix | `/api/v1/<resource>` | `/api/v1/products` |

---

## 4. Folder & Module Structure

### 4.1 `apps/storefront/src/`

```
apps/storefront/src/
  app/
    layout.tsx                     root layout: next/font vars, providers, default metadata
    page.tsx                       /
    products/
      page.tsx                     /products (SSR)
      [slug]/
        page.tsx                   /products/[slug] (ISR 300)
        _components/
    collections/
      [slug]/
        page.tsx                   /collections/[slug] (ISR 600)
    blog/
      page.tsx                     /blog (ISR 600)
      [slug]/
        page.tsx                   /blog/[slug] (ISR 3600)
      chu-de/
        [slug]/
          page.tsx                 /blog/chu-de/[slug] (ISR 3600)
    about/
      page.tsx                     /about (Static)
    lien-he/
      page.tsx                     /lien-he (Static)
    (shop)/
      cart/
        page.tsx                   /cart — noindex, CSR
      checkout/
        page.tsx                   /checkout — noindex, CSR
        success/
          page.tsx                 /checkout/success — noindex, CSR
      order-lookup/
        page.tsx                   /order-lookup — noindex, CSR
    (auth)/
      login/
        page.tsx                   /login — noindex, CSR
      register/
        page.tsx                   /register — noindex, CSR
    account/
      orders/
        page.tsx                   /account/orders — noindex, dynamic, middleware-gated
    sitemap.ts
    robots.ts
  lib/
    api/
      server-public.ts             §3.3
      server-authenticated.ts      §3.3
      client.ts                    §3.3, client lane
      errors.ts                    ApiError, built from the API's error envelope
    seo/
      metadata.ts                  buildMetadata()
      json-ld.tsx                  <JsonLd>
    markdown.ts                    remark/rehype pipeline
    env.ts                         Zod-parsed env object
    auth-edge.ts                   jose-based verification for middleware.ts
  components/
    layout/                        Header, Footer, Breadcrumbs
    product/                       ProductCard, PriceTag
    blog/                          PostCard, RelatedProducts
    forms/                         shared form primitives
  stores/
    cartStore.ts                   §3.4
    authStore.ts                   client-only display state, not the access-control layer
  middleware.ts                    §3.6
next.config.ts                     §3.5
tailwind.config.ts
tsconfig.json
```

### 4.2 `apps/api/src/` — one module shown as the pattern every module follows

```
apps/api/src/
  index.ts                         bootstrap: env → DB → HTTP server → listen
  app.ts                           Express config: CORS, cookie-parser, JSON body,
                                    rate limiter, route mounts, error handler
  config/
    env.ts                         Zod-validated env object
    db.config.ts
    cloudinary.config.ts
    multer.config.ts
  middlewares/
    authMiddleware.ts               verifyToken / optionalVerifyToken
    roleMiddleware.ts                requireRole('admin')
    errorMiddleware.ts               maps Zod/Mongoose/app errors to the standard envelope
    rateLimitMiddleware.ts
  modules/
    catalog/
      catalog.model.ts
      catalog.repository.ts
      catalog.service.ts
      catalog.controller.ts
      catalog.routes.ts
      catalog.dto.ts
      catalog.interfaces.ts
      catalog.events.ts
    auth/ … customer/ … cart/ … order/ … voucher/ … blog/ … media/    (same eight files each)
  utils/
    baseSchemaOptions.ts            timestamps, `_id → id` transform, strips `__v`
    slugify.ts                      one implementation, imported by Product.model.ts
                                     and Post.model.ts — never reimplemented per model
    token.util.ts                   issues the JWT cookie, Domain/SameSite per environment
    eventBus.ts
  seed/
    seedAdmin.ts
    seedCatalog.ts
    seedBlog.ts
  tests/
```

### 4.3 `apps/admin/src/`

```
apps/admin/src/
  routes/
    dashboard/
    products/
    categories/
    orders/
    customers/
    vouchers/
    blog/
    media/
  services/
    apiClient.ts                   §3.5 — direct cross-origin calls, credentials: 'include'
  stores/
    authStore.ts                   role: 'admin' gate
  components/
```

---

## 5. Module Responsibilities

### 5.1 Storefront

| Path | Responsibility |
|---|---|
| `src/app/layout.tsx` | Root Server Component: `<html lang="vi">`, `next/font` variables, global providers, default site-wide metadata. |
| `src/app/sitemap.ts` | Fetches active products and published posts via the public server lane; returns every indexable URL from §2.2 with `lastModified`. |
| `src/app/robots.ts` | Disallows `(shop)`, `(auth)`, `/account`; points `sitemap:` at the generated sitemap — built from the same route-group source of truth `middleware.ts`'s matcher reads, so the two can't drift apart. |
| `middleware.ts` | Edge gate for `/account/*` — §3.6. |
| `lib/api/server-public.ts` / `server-authenticated.ts` | The two server-side fetch lanes — §3.3. |
| `lib/api/client.ts` | Client-side fetch wrapper with a 401 → refresh → retry-once interceptor. |
| `lib/markdown.ts` | Markdown → sanitized HTML, server-only. |
| `stores/cartStore.ts` | Guest cart, browser-storage-persisted — §3.4. Merges into the server cart on login. |
| `app/products/page.tsx` | `/products` — SSR, reads filter query params, sets `robots: {index:false, follow:true}` when any filter is present (§7.6). |
| `app/products/[slug]/page.tsx` | Product detail — ISR 300, `Product`+`Offer` JSON-LD. |
| `app/blog/[slug]/page.tsx` | Post detail — ISR 3600, `Article`+`BreadcrumbList` JSON-LD, renders the `relatedProducts` block. |
| `app/(shop)/*`, `app/(auth)/*` | CSR, client lane only, `noindex,nofollow`. |
| `app/account/orders/page.tsx` | Dynamic, authenticated lane only, middleware-gated. |

### 5.2 API (`SRS.md` §4/§5)

| Module | Responsibility |
|---|---|
| `auth` | Registration, login, refresh, logout; JWT cookie lifecycle. |
| `customer` | `Customer` keyed by phone (`SRS.md` D5); purchase history, address book. |
| `catalog` | `Product`/`Category` CRUD, atomic stock decrement/restock (`SRS.md` D4). |
| `cart` | Server-side cart for authenticated users. |
| `order` | Transactional order placement, status transitions (`SRS.md` §3.6), POS orders, invoice payload. |
| `voucher` | Percentage/fixed vouchers, phone-keyed usage limits (`SRS.md` D6). |
| `blog` | `Post`/`PostCategory`, including the `relatedProductIds` linkage that powers blog-to-product internal links. |
| `media` | Cloudinary upload/delete. |

### 5.3 Admin panel

| Route | Responsibility |
|---|---|
| `routes/dashboard/` | Order/revenue summary, pulled from `GET /admin/stats`. |
| `routes/products/`, `routes/categories/` | Catalog CRUD, stock adjustment. |
| `routes/orders/` | Order list, status transitions, invoice printing. |
| `routes/customers/` | Customer list with purchase history, CSV/JSON export. |
| `routes/vouchers/` | Voucher CRUD. |
| `routes/blog/` | Post/PostCategory CRUD, including the markdown editor and `relatedProductIds` picker. |
| `routes/media/` | Direct-to-Cloudinary image upload used by the product and blog forms. |

---

## 6. Scaffolding Instructions (For AI)

Run these in order against an empty repository.

### Phase 1 — Initialize the workspace

1. Create the repo root. `pnpm init`, then `pnpm-workspace.yaml` declaring `apps/*` and `packages/*`.
2. `pnpm add -Dw turbo`; create `turbo.json` with pipeline tasks for `build`, `dev`, `lint`, `test`, `typecheck`.
3. Create empty `apps/storefront/`, `apps/admin/`, `apps/api/`, and `packages/shared-types/` directories.

### Phase 2 — `packages/shared-types`

1. `pnpm init` inside the package; install `zod`; set `"type": "module"`.
2. Create one `*.schema.ts` file per domain (§1.4's tree), each exporting Zod schemas and their `z.infer` types.
3. Create `src/index.ts` re-exporting every schema file.

### Phase 3 — `apps/api`

1. `pnpm init`; add `@repo/shared-types` as a workspace dependency (`"workspace:*"`); install Express, Mongoose, `jsonwebtoken`, `bcrypt`, `multer`, `cloudinary`, `express-rate-limit`, `cookie-parser`, plus `typescript`, `tsx`, `@types/node`, `@types/express`.
2. `tsconfig.json`: `strict: true`, `outDir: "dist"`.
3. `src/config/env.ts` first — every other file reads `env.X`, never `process.env.X` directly.
4. `src/app.ts`: CORS (explicit origin allow-list including the admin panel's origin, `credentials: true`), cookie-parser, `express.json`, rate limiter, route mounts under `/api/v1`, 404 handler, global error handler emitting the standard envelope.
5. `src/index.ts`: load env → connect MongoDB → create HTTP server → listen.
6. `src/middlewares/`: `authMiddleware.ts`, `roleMiddleware.ts`, `errorMiddleware.ts`, `rateLimitMiddleware.ts`.
7. `src/utils/`: `baseSchemaOptions.ts`, `slugify.ts` (imported by both `catalog` and `blog` — one implementation), `token.util.ts`, `eventBus.ts`.
8. For each module in `SRS.md` §4 (`auth`, `customer`, `catalog`, `cart`, `order`, `voucher`, `blog`, `media`), create the eight-file structure from §4.2. Cross-module calls only through `*.interfaces.ts`. Build `order` last — it depends on `catalog`, `customer`, and `voucher` through their interfaces.
9. `src/seed/`: `seedAdmin.ts` (one admin `User`), `seedCatalog.ts` (categories + products per `SRS.md` §3.3–3.4), `seedBlog.ts` (post categories + posts, each linked to at least one product via `relatedProductIds`). All idempotent — running twice must not duplicate rows.
10. `src/tests/`: Jest + Supertest + `mongodb-memory-server`.

### Phase 4 — `apps/storefront`

1. `pnpm create next-app@latest apps/storefront --typescript --tailwind --app --src-dir --import-alias "@/*"`. Confirm App Router.
2. Add `@repo/shared-types` as a workspace dependency; install Zustand, `jose`, the `unified`/`remark`/`rehype` packages; dev-install Vitest, React Testing Library, Playwright.
3. `next.config.ts`: the `/api/*` rewrite and `images.remotePatterns` from §3.5.
4. `src/lib/env.ts`, `src/lib/auth-edge.ts`.
5. `middleware.ts` at the project root — §3.6.
6. `src/lib/api/` — the three fetch wrappers, §3.3.
7. `src/lib/seo/`, `src/lib/markdown.ts`.
8. `src/stores/cartStore.ts`, `src/stores/authStore.ts`.
9. Build `src/app/` exactly per §4.1, route by route: `page.tsx` + `generateMetadata` (or static `metadata`) + only the `_components/`/`_services/` folders each route actually needs.
10. `src/app/sitemap.ts`, `src/app/robots.ts` — fetched from live API data, never hardcoded.

### Phase 5 — `apps/admin`

1. `pnpm create vite@latest apps/admin -- --template react-ts`.
2. Add `@repo/shared-types` as a workspace dependency; install `react-router-dom`, Zustand, Tailwind CSS.
3. `src/services/apiClient.ts` — direct cross-origin calls to the API, `credentials: 'include'` — §3.5.
4. `src/stores/authStore.ts` with a `role: 'admin'` client-side route guard.
5. Build `src/routes/` per §4.3, one folder per backend module (§5.3).

### Phase 6 — Cross-cutting concerns

1. Confirm `apps/api`'s CORS allow-list contains the admin panel's production origin, `credentials: true`, no wildcard.
2. Confirm `token.util.ts` issues the cookie with `Domain=.<registrable-domain>` in production and no `Domain` attribute in development (§3.5).
3. Confirm the storefront's `middleware.ts` `matcher` and the API's JWT secret (`JWT_SECRET`, shared as a server-only env var between `apps/api` and `apps/storefront`'s `lib/auth-edge.ts`) are both wired.

### Phase 7 — Structured data and breadcrumbs

Build `<JsonLd>` and wire it into: `Organization`+`LocalBusiness` on the root layout, `Product`+`Offer` on product pages, `Article`+`BreadcrumbList` on post pages, `BreadcrumbList` on every other indexed page. Add a visible `<Breadcrumbs>` component alongside it — §7.4.

### Phase 8 — Seed and verify

1. Run `seedAdmin`, `seedCatalog`, `seedBlog` against a local MongoDB instance.
2. `curl` a product page and confirm name, price, and description are present in the raw HTML with no JavaScript execution.
3. Confirm every route in §2.2 has a distinct `<title>`/`<meta description>`.
4. Confirm `/sitemap.xml` lists every active product and published post, and `/robots.txt` disallows `(shop)`, `(auth)`, `/account`.
5. Run Google's Rich Results Test against a product page and a blog post.
6. Lighthouse (mobile): SEO ≥ 95, Performance ≥ 85.
7. Add an item to the guest cart, reload, confirm zero hydration console errors.
8. Log into the admin panel and confirm it can create a product visible moments later on the storefront (respecting the relevant ISR window).

---

## 7. SEO & Performance Architecture

### 7.1 Rendering strategy per route group

| Route | Strategy | Revalidate |
|---|---|---|
| `/` | ISR | 3600s |
| `/products` | SSR | — |
| `/products/[slug]` | ISR | 300s |
| `/collections/[slug]` | ISR | 600s |
| `/blog` | ISR | 600s |
| `/blog/[slug]` | ISR | 3600s |
| `/blog/chu-de/[slug]` | ISR | 3600s |
| `/about`, `/lien-he` | Static | — |
| `(shop)`, `(auth)`, `/account/*` | CSR | — (noindex; excluded from the table above entirely) |

`/products` is SSR rather than ISR because its result set depends on live filter query params (`category`, `search`, `minPrice`, `maxPrice`, `page`) — there's no fixed set of pages to pre-render, and no single revalidate window that would make sense across every filter combination.

### 7.2 Metadata correctness

Metadata resolved client-side (injected after hydration, the way a plain SPA would have to do it) is invisible to a crawler that doesn't execute JavaScript, or that applies only a secondary, budget-limited render pass — which is how Googlebot's second-wave indexing and most social unfurlers behave in practice. Every route in §7.1's index set exports `generateMetadata`, resolved server-side, so the first response already carries the correct `<title>`, `<meta name="description">`, and Open Graph tags.

### 7.3 Structured data (JSON-LD)

| Page | Schema |
|---|---|
| `/` | `Organization` + `LocalBusiness` |
| `/products/[slug]` | `Product` + `Offer` — `Offer.availability` computed from `product.stock > 0` (`InStock` / `OutOfStock`), never hardcoded, since declaring in-stock when sold out violates Google Merchant policy. |
| `/blog/[slug]` | `Article` + `BreadcrumbList` |
| Every other subpage | `BreadcrumbList` |

### 7.4 Visible breadcrumbs

Rendered in the UI, not only as JSON-LD: `Trang chủ › Bánh tráng › Bánh tráng muối tôm`. A shared `<Breadcrumbs>` component derives its trail from the current route segment and feeds the same data into `<JsonLd>`'s `BreadcrumbList`.

### 7.5 Flat product URLs

`/products/banh-trang-muoi-tom`, never `/collections/banh-trang/products/banh-trang-muoi-tom`. A product belonging to two categories must resolve to exactly one canonical address — the flat `Product` model (§0.4) makes this the natural shape, not a workaround layered on top.

### 7.6 Filtered pages: noindex, follow — not a distinct URL

`/products` and `/collections/[slug]` are indexed. `/products?search=cay&page=2` is not, but stays crawlable (`follow: true`) so internal links inside it are still discoverable; it is **not** disallowed in `robots.txt`, since a disallow rule would stop Google from ever reaching the page to see its `noindex` meta tag in the first place.

```ts
export async function generateMetadata({ searchParams }: { searchParams: Record<string, string> }): Promise<Metadata> {
  const hasFilters = Object.keys(searchParams).length > 0;
  return buildMetadata({
    robots: hasFilters ? { index: false, follow: true } : { index: true, follow: true },
    canonical: '/products', // filtered variants canonicalize to the unfiltered page
  });
}
```

This is distinct from `(shop)`/`(auth)`/`account/*`, which are `index: false, follow: false` **and** disallowed in `robots.txt` (§2.2) — those pages carry no crawl value at all, where filtered product listings still do via `follow`.

### 7.7 Canonical tags

Every page sets `alternates.canonical`, either pointing at itself or, for a filtered variant, at the unfiltered page (§7.6) — handled centrally in `buildMetadata()` so no individual route can forget it.

### 7.8 Vietnamese diacritic-free slugs

One `slugify` utility (`apps/api/src/utils/slugify.ts`) is imported by both `Product.model.ts` and `Post.model.ts`'s slug-generation logic — a single implementation, never two independently written ones that could produce different output for the same input.

### 7.9 `sitemap.ts` / `robots.ts` from live data

Both are Next.js special files (code, not static assets). `sitemap.ts` calls the public server lane for every active product and published post; `robots.ts` builds its `disallow` list from the same route-group source of truth `middleware.ts`'s matcher reads.

### 7.10 The three rules this build gets right from the start

**Cookie forwarding in Server Components.** A Server Component's `fetch()` runs from Node, not the browser — the session cookie is never attached automatically. `lib/api/server-authenticated.ts` (§3.3) forwards it explicitly via `next/headers` and is never cached.

**Cross-origin cookie behavior in production.** Solved architecturally per app, not per-request: the storefront avoids the problem entirely via the reverse proxy (§3.5); the admin panel solves it with a shared-parent-domain cookie and an explicit CORS allow-list.

**Hydration-safe browser-storage state.** Every store backed by `localStorage` — starting with the guest cart — uses `skipHydration: true`, an explicit `rehydrate()` call in a `useEffect`, and a `hasHydrated` gate on anything that reads it for display. The full pattern is in §3.4.

### 7.11 Core Web Vitals levers

- **LCP** — `next/image` with correctly sized, modern-format product/post images; ISR/SSG routes have near-zero server compute per request.
- **CLS** — `next/image`'s enforced dimensions; `next/font` self-hosted with no fallback-font jump.
- **INP** — automatic per-route code splitting, and the markdown renderer (§1.1) ships no client JavaScript at all.
- **TTFB** — ISR/static routes served from the CDN edge with no origin round-trip.

### 7.12 "Done" checklist

- [ ] `curl` a product page and see name, price, and description in the raw HTML — no JS required
- [ ] Every page has a distinct `<title>` and `<meta name="description">`
- [ ] `/sitemap.xml` lists every active product and published post
- [ ] `/robots.txt` disallows `/cart`, `/checkout`, `/account`, `/login`
- [ ] Google's Rich Results Test recognizes `Product` and `Article`
- [ ] Lighthouse mobile: SEO ≥ 95, Performance ≥ 85
- [ ] The guest cart works with no hydration errors
- [ ] The admin panel is reachable and can authenticate against the API from its own origin

---

## 8. Production-Readiness Checklist

- [ ] All env vars validated via `config/env.ts` (API) and `lib/env.ts` (storefront) — no bare `process.env.X` reads outside those files.
- [ ] `middleware.ts`'s `matcher` reviewed against the actual route tree on every new `/account/*` route addition.
- [ ] API's CORS allow-list contains the admin panel's exact production origin, `credentials: true`, no wildcard.
- [ ] Cookie `Domain`/`SameSite`/`Secure` behavior for the admin panel verified in a staging environment that mirrors the production subdomain split before the first production deploy.
- [ ] `next.config.ts`'s `images.remotePatterns` allow-lists the Cloudinary hostname.
- [ ] Rate limiting tuned separately for public catalog/blog routes versus authenticated routes.
- [ ] `tsc --noEmit` across all three apps and `packages/shared-types`, unit tests, and Lighthouse CI all wired as required checks, not just locally runnable scripts.
- [ ] `sitemap.ts`/`robots.ts` verified against the live deployment's actual `/sitemap.xml` and `/robots.txt` output post-deploy.
- [ ] Facebook Sharing Debugger and a manual Zalo link-preview check performed against a live product page and blog post before any marketing push.
- [ ] Guest checkout exercised end-to-end with zero hydration console errors (a Playwright spec, not a manual click-through).
- [ ] Admin panel confirmed reachable and functioning against the same API from its production origin, including image upload through `media`.

---

## 9. Portability Notes

**Generic to any Next.js-storefront-plus-Express-API project:**
- The Dual Data-Fetching Lane Pattern (§3.3) — the public/cacheable vs. personalized/dynamic split, and the rule that they must never mix inside one Server Component.
- The two-strategy Cross-Origin Cookie approach (§3.5) — reverse-proxy for a crawler-facing client, direct CORS + shared-parent-domain cookie for an internal one — a distinction that recurs on any project with more than one client consuming the same API.
- The SEO rendering-strategy-per-route-group table shape (§7.1) and the noindex-disallow vs. noindex-follow distinction (§7.6).
- The `hasHydrated`-gated browser-storage Zustand pattern (§3.4) — applies to any client-only persisted store in any Next.js app.
- The `packages/shared-types` Zod-schema-as-single-source-of-truth pattern (§0.1, §1.4) — applies to any project where a TypeScript backend serves more than one TypeScript client.

**Specific to Bánh Tráng Nhà Na:**
- The actual module names (`catalog`, `blog`, `voucher`, …) and their ownership table (§2.3).
- The actual sitemap (`/lien-he`, `/blog/chu-de/[slug]`), and Zalo/Facebook link-unfurling as the stated reason for OG-tag correctness in this specific market.
- The decision to build the admin panel as a separate Vite SPA rather than folding it into the Next.js app (§0.3) — a project without a second, non-public client wouldn't face this choice at all.
- The markdown-to-sanitized-HTML server-side rendering pipeline (§1.1) — specific to this project having an admin-authored-markdown blog.