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

- **api**: `tsx watch src/index.ts` (dev), `jest --runInBand` (test — Supertest + `mongodb-memory-server`, no live DB needed), `eslint src` (lint). Run a single Jest test with `pnpm --filter api test -- <pattern>` or `cd apps/api && npx jest <pattern>`.
- **admin**: `vite` (dev), `oxlint` (lint, not ESLint), `tsc -b && vite build` (build).
- **storefront**: `next dev` (Turbopack dev server), `eslint` (flat config, `eslint-config-next`).

Seeding the API's MongoDB (`pnpm --filter api ...` or root shortcuts): `pnpm seed:admin`, `pnpm seed:catalog`, `pnpm seed:blog`, or `pnpm seed:all` for all three in order.

Copy `.env.example` to `.env` in each app before running dev servers — it documents required vars per app (API on port 5000, MongoDB URI, JWT secrets, Cloudinary creds, storefront/admin API origins).

## Architecture

Full rationale lives in `ARCHITECTURE_BLUEPRINT_GREENFIELD.md` (why each tech choice was made) and the requirement docs in `docs/system/SRS.md` (source of truth for business rules) and `docs/server/API_CONTRACT.md`. Where the two disagree, **SRS.md wins** — notably: order status is `pending` (not `pending_confirmation`), products are flat with no variants (one price/stock/optional `flavor` per product — two flavors are two separate products, so carts/orders carry `productId` + `quantity` only, never a `variantId`), all admin routes live under `/api/v1/admin/*` behind one guard middleware, and stock decrements atomically at order placement / restores on cancellation.

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

### API module structure (`apps/api/src/modules/*`)

Each domain module (`auth`, `customer`, `catalog`, `cart`, `order`, `voucher`, `blog`, `media`) follows the same file split: `*.routes.ts` → `*.controller.ts` → `*.service.ts` → `*.repository.ts` → `*.model.ts` (Mongoose schema), plus `*.dto.ts` (Zod validation) and `*.interfaces.ts` (the module's public API for cross-module calls — e.g. `catalog.interfaces.ts` exposes `getProductById`, `decrementStock`). Modules don't import each other's repositories/models directly; cross-module reads/writes go through `*.interfaces.ts`, and side effects fan out via `utils/eventBus.ts` (e.g. `ORDER_PLACED` → customer stats update, `ORDER_CANCELLED` → stock/voucher/customer rollback). Auth uses JWT in httpOnly cookies (`access_token` 15min, `refresh_token` 7d) — never Bearer tokens; `optionalVerifyToken` middleware allows guest checkout.

### Storefront rendering strategy (`apps/storefront`)

This is the one area that requires the most care — see `ARCHITECTURE_BLUEPRINT_GREENFIELD.md` §2.1–2.2 for the full route table. The core rule: **public, cacheable reads and cookie-bearing reads must never share a Server Component.**

- Public catalog/blog data goes through `lib/api/server-public.ts` (ISR-eligible, no cookies) — used by SSG/ISR routes like `/products/[slug]`, `/blog/[slug]`, `/`.
- Cookie-bearing data (account, cart mutations) goes through `lib/api/server-authenticated.ts` server-side, or `lib/api/client.ts` (fetch-based, `credentials: 'include'`, not Axios) from Client Components — never cached.
- `middleware.ts` runs on the Edge Runtime and verifies JWTs with `jose` (not `jsonwebtoken`, since Node's `crypto` isn't available at the edge).
- Route groups `(shop)` (cart/checkout/order-lookup) and `(auth)` (login/register) are `noindex,nofollow` + CSR; everything else (home, products, collections, blog) is indexed and server-rendered (ISR with per-route revalidate windows).
- Markdown blog content is converted to sanitized HTML server-side in `blog.service.ts` (remark/rehype pipeline) — never parsed client-side.
- The admin panel talks to `apps/api` directly, cross-origin — it isn't proxied through the storefront.

### Design system

`docs/client/DESIGN.MD` is the authoritative design system ("Bánh Tráng Nhà Na — Design System") for every UI surface, human- or AI-generated. It governs color, type, spacing, layout, motion, and component behavior in detail (26 sections) and takes priority over any component library or styling tool if they conflict. Read it before making visual/UI decisions in the storefront or admin panel — key entry points: §18/§24 for tokens and Tailwind mapping, §16 for layout composition, §26 for how components combine, §9 for explicitly rejected patterns (no glassmorphism/neon/heavy gradients — this is a food brand, not a tech brand).

The storefront also has its own `CLAUDE.md` (imports `AGENTS.md`) noting that its Next.js version may differ from training data — check `node_modules/next/dist/docs/` for API/convention changes before writing Next.js code there.
