# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Bánh Tráng Nhà Na — an ecommerce site for a Vietnamese rice-paper-snack brand. A pnpm/Turborepo monorepo with three deployable apps sharing one Zod schema package.

## Commands

Run from repo root (Turborepo fans these out per-package, cached):

```
pnpm dev          # turbo run dev — all apps in parallel (persistent, uncached)
pnpm build        # turbo run build
pnpm lint         # turbo run lint
pnpm test         # turbo run test
pnpm typecheck    # turbo run typecheck
```

Per-app, use `pnpm --filter <name> <script>` (package names: `api`, `admin`, `storefront`, `@repo/shared-types`), or `cd` into the app directory directly.

- **api**: `tsx watch --env-file=.env src/index.ts` (dev), `jest --runInBand` (test — Supertest + `mongodb-memory-server`, no live DB needed), `eslint src` (lint). Run a single Jest test with `pnpm --filter api test -- <pattern>` or `cd apps/api && npx jest <pattern>`.
- **admin**: `vite` (dev), `oxlint` (lint, not ESLint), `tsc -b && vite build` (build).
- **storefront**: `next dev` (Turbopack dev server), `eslint` (flat config, `eslint-config-next`).

Seeding the API's MongoDB (`pnpm --filter api ...` or root shortcuts): `pnpm seed:admin`, `pnpm seed:catalog`, `pnpm seed:blog`, or `pnpm seed:all` for all three in order.

Copy `.env.example` to `.env` in each app before running dev servers — it documents required vars per app (API on port 5000, MongoDB URI, JWT secrets, Cloudinary creds, storefront/admin API origins).

## Architecture

Full rationale lives in `ARCHITECTURE_BLUEPRINT_GREENFIELD.md` (why each tech choice was made) and the requirement docs in `docs/system/SRS.md` (source of truth for business rules) and `docs/server/API_CONTRACT.md`. Where the two disagree, **SRS.md wins** — notably: order status is `pending` (not `pending_confirmation`), products are flat with no variants (one price/stock/optional `flavor` per product — two flavors are two separate products, so carts/orders carry `productId` + `quantity` only, never a `variantId`), and stock decrements atomically at order placement / restores on cancellation.

**Docs describe the target design; the running code is behind it in a few specific ways — check before assuming a doc'd piece exists:**
- Routes are mounted at `/api/*` in `apps/api/src/app.ts`, not `/api/v1/*` as SRS/blueprint specify. There is no single `/api/v1/admin/*` guard — "admin" endpoints are just `verifyToken`-gated routes scattered per module (e.g. `POST /api/products`, `GET /api/blog/admin/all`). RBAC is now real: `UserRole` (`packages/shared-types/src/auth.schema.ts`) is `'admin' | 'staff'` — staff can do day-to-day operator work (orders, POS, product/blog editing, uploads) but `requireRole('admin')` (`apps/api/src/middlewares/roleMiddleware.ts`, run after `verifyToken`) gates destructive/financial actions: deleting products/categories/blog posts, voucher CRUD, customer export, and managing Users.
- There is no `cart` API module (no `/api/cart/*` routes) and no `cart.schema.ts` in `packages/shared-types` either — it was deleted (2026-07-31) after confirming nothing imported it; the storefront's `stores/cartStore.ts` defines its own local `CartItem` type instead. Cart state lives client-side only.
- The storefront has no auth-gated surface at all right now (no `middleware.ts`, no `(auth)` route group, no account pages) — customer auth was intentionally ripped out (see git log). Don't assume `/login`, `/account/*`, or `/checkout/success` exist without checking. Catalog data is no longer mocked — `lib/data/mock-catalog.ts` has been removed and `/products/[slug]` etc. fetch live from the API via `lib/api/server-public.ts`.
- The admin app (`apps/admin/src`) has a real login flow and router (`App.tsx`) with routes `/` (Orders), `/customers`, `/products`, `/store`, `/blog`, `/blog/new`, `/blog/:id`. All have real, built-out UIs: Orders/Customers are CRUD screens; `Products.tsx` is a full catalog CRUD UI (grid/table views, search/filter, `ProductFormModal.tsx`, delete confirm); `Store.tsx` is an in-person POS (product picker, cart, customer form, creates orders via `POST /orders/pos`, auto-confirm→complete flow, printable bill); `Blog.tsx`/`BlogEditor.tsx` are the post list and create/edit editor. Shared admin catalog types live in `apps/admin/src/lib/catalogTypes.ts` (`ProductRow`, `CategoryRow`, `ProductFormBody`, `LOW_STOCK_THRESHOLD`). There is now a `/vouchers` route (`Vouchers.tsx`) for voucher CRUD, gated `admin`-only on the API side.
- The storefront now has `/cart`, `/checkout`, and `/order-lookup` pages (flat routes, not under a `(shop)` route group — that grouping described in the blueprint isn't applied yet). Checkout is guest-only per SRS D5: the form upserts the `Customer` record by phone, with no login/account/saved-address step — this is intentional, not a gap to fill in. `/order-lookup` (linked from the footer as "Tra cứu đơn hàng") lets a guest look up order status, also without any auth.

### Workspace layout

```
apps/
  api/          Express v5 + MongoDB(Mongoose v8), TypeScript, ESM
  storefront/   Next.js 16 App Router, the public/indexable site
  admin/        Vite + React 19 SPA, internal back-office tool
packages/
  shared-types/ Zod schemas + inferred TS types — the single source of truth
                for request/response shapes, consumed by all three apps
```

`packages/shared-types` has no runtime dependency beyond `zod`. Its schemas drive: API request validation, storefront/admin form validation, and typed fetch calls in all three apps. When changing a domain shape (Product, Order, Cart, Voucher, Post, etc.), edit the schema here first — the type change then surfaces via TS errors in every consumer.

Products carry a real multi-image array (`productImageSchema` in `catalog.schema.ts`: `url`, `publicId`, `alt`, `width`, `height`, `sortOrder`) backed by Cloudinary — consumed by `apps/storefront/components/ProductImageGallery.tsx` and the image grids in admin's `Products.tsx`.

### API module structure (`apps/api/src/modules/*`)

Each domain module (`auth`, `customer`, `catalog`, `order`, `voucher`, `blog`, `media` — no `cart` module, see gaps above) follows the same file split: `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.repository.ts` → `*.model.ts` (Mongoose schema), plus `*.dto.ts` (Zod validation) and `*.interfaces.ts` (the module's public API for cross-module calls — e.g. `catalog.interfaces.ts` exposes `getProductById`, `decrementStock`). Modules don't import each other's repositories/models directly; cross-module reads/writes go through `*.interfaces.ts`, and side effects fan out via `utils/eventBus.ts` (e.g. `ORDER_PLACED` → customer stats update, `ORDER_CANCELLED` → stock/voucher/customer rollback). Auth uses JWT in httpOnly cookies (`access_token` 15min, `refresh_token` 7d) — never Bearer tokens; `optionalVerifyToken` middleware allows guest checkout.

### Storefront rendering strategy (`apps/storefront`)

This is the one area that requires the most care — see `ARCHITECTURE_BLUEPRINT_GREENFIELD.md` §2.1–2.2 for the full route table. The core rule: **public, cacheable reads and cookie-bearing reads must never share a Server Component.**

- Public catalog/blog data goes through `lib/api/server-public.ts` (ISR-eligible, no cookies) — used by SSG/ISR routes like `/products/[slug]`, `/blog/[slug]`, `/`.
- Cookie-bearing data (account, cart mutations) is meant to go through a server-side `lib/api/server-authenticated.ts` (not yet created — only `server-public.ts` exists there today), or `lib/api/client.ts` (fetch-based, `credentials: 'include'`, not Axios) from Client Components — never cached.
- `middleware.ts` runs on the Edge Runtime and verifies JWTs with `jose` (not `jsonwebtoken`, since Node's `crypto` isn't available at the edge).
- Route groups `(shop)` (cart/checkout/order-lookup) and `(auth)` (login/register) are `noindex,nofollow` + CSR; everything else (home, products, collections, blog) is indexed and server-rendered (ISR with per-route revalidate windows).
- Markdown blog content is converted to sanitized HTML server-side in `blog.service.ts` (remark/rehype pipeline) — never parsed client-side.
- The admin panel talks to `apps/api` directly, cross-origin — it isn't proxied through the storefront.

### Design system

`docs/client/DESIGN.MD` is the authoritative design system ("Bánh Tráng Nhà Na — Design System") for every UI surface, human- or AI-generated. It governs color, type, spacing, layout, motion, and component behavior in detail (26 sections) and takes priority over any component library or styling tool if they conflict. Read it before making visual/UI decisions in the storefront or admin panel — key entry points: §18/§24 for tokens and Tailwind mapping, §16 for layout composition, §26 for how components combine, §9 for explicitly rejected patterns (no glassmorphism/neon/heavy gradients — this is a food brand, not a tech brand).

The storefront also has its own `CLAUDE.md` (imports `AGENTS.md`) noting that its Next.js version may differ from training data — check `node_modules/next/dist/docs/` for API/convention changes before writing Next.js code there.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
