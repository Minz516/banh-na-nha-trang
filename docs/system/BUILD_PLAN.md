# Build Plan — Next.js storefront

> Replaces `MIGRATION_TASKS.md`. No longer a refactor — a fresh build.
> Read `SEO_CONTEXT.md` and `API_CONTRACT.md` first.

---

## Architectural boundary

```
┌─────────────────────┐     ┌──────────────────┐
│  Next.js storefront │────▶│                  │
│  (new, TypeScript)  │     │  Express API     │
└─────────────────────┘     │  + MongoDB       │
                            │  (unchanged)     │
┌─────────────────────┐     │                  │
│  Admin (Vite SPA)   │────▶│                  │
│  (unchanged)        │     └──────────────────┘
└─────────────────────┘
```

Next.js is **not** the backend. It is a Node server whose job is rendering React and serving SEO. All business logic — auth, orders, stock, vouchers — stays in Express.

Do **not** move Express into Next API routes. The backend already has a clean module architecture, it works, and the admin SPA depends on it.

**One exception:** `next.config.ts` will proxy `/api/v1/*` to Express (Phase 5). That makes cookies same-origin and removes the entire `SameSite` problem in production.

---

## Carried over from the old storefront

| Keep | Drop |
|---|---|
| `tailwind.config.js` — brand amber palette | `src/pages/*` (all placeholders) |
| `utils/formatCurrency.js`, `formatDate.js` | `routes/AppRouter.jsx`, `ProtectedRoute.jsx` |
| `stores/cartStore.js` — the logic, not the code | `services/httpHelper.js` (`require()` bug) |
| `config/apiConfig.js` — as a reference | `components/layout/MainLayout.jsx` |

---

## Phase 0 — Fix backend blockers

Without a working API the frontend has nothing to render.

| Task | Work | Verification |
|---|---|---|
| T0.1 | `catalog.dto.js`: `productListResponse` calls `productDto` (undefined) → change to `catalogDto` | `GET /products` returns 200 |
| T0.2 | Replace `statusCode: 211` with `201` in every controller | `grep -r "211" server/src` is empty |
| T0.3 | `catalogService.queryProducts` reads `isFeatured`, `isNewArrival` from filters. Controller parses the `'true'` query string into a boolean | `GET /products?isFeatured=true` filters correctly |
| T0.4 | Add `metaTitle`, `metaDescription` to `Product`. Add `width`, `height` to `productImageSchema`. Expose via dto | Create a product → response carries the new fields |
| T0.5 | Extract `removeDiacritics` into `server/src/utils/slugify.js`, shared by `Product` and `Category` | Generated slugs unchanged |
| T0.6 | Indexes: `{ isActive: 1, isFeatured: 1 }` and `{ isActive: 1, categoryId: 1 }` | `.explain()` shows `IXSCAN` |

**Stop.** Report.

---

## Phase 1 — Blog module (backend)

Follow the `catalog` module pattern exactly: `model` → `repository` → `service` → `controller` → `routes` → `dto` → `validators`.

| Task | Work |
|---|---|
| T1.1 | `PostCategory` model — `name`, `slug`, `description`, `sortOrder`, `isActive`. Use `slugify.js` from T0.5 |
| T1.2 | `Post` model — shape in `API_CONTRACT.md`. Index `{ status: 1, publishedAt: -1 }` plus a text index on `title`/`excerpt` |
| T1.3 | Repository, service, dto, validators. `queryPosts` defaults to `published` and `publishedAt <= now`. `getPostBySlug` populates `categoryId` and `relatedProductIds` |
| T1.4 | Routes per `API_CONTRACT.md`. Register in `server/src/routes/index.js` |
| T1.5 | `readingMinutes` computed from `content` in a `pre('save')` hook |
| T1.6 | `server/scripts/seedBlog.js` — 2 categories, 4 published posts, each linked to ≥ 1 product. Add a `seed:blog` script |

`relatedProductIds` is the single most important field for SEO. It is what turns the blog into a sales channel rather than a cost.

**Stop.**

---

## Phase 2 — Next.js scaffold

This is where `SCAFFOLD_PROMPT.md` is used. Structure only, no logic.

| Task | Work |
|---|---|
| T2.1 | Define every type in `src/types/` — **complete, not stubbed** |
| T2.2 | Directory tree and placeholder files per `SEO_CONTEXT.md` section 7 |
| T2.3 | `tsc --noEmit` clean, `next build` succeeds |

**Mandatory stop.** Approve the architecture before real code is written.

---

## Phase 3 — Data layer

The easiest part to get wrong. Read `SEO_CONTEXT.md` section 6.1.

| Task | Work |
|---|---|
| T3.1 | `lib/api/server.ts` — `serverFetch()`. Sends **no cookie** by default and allows caching. An opt-in `withAuth: true` forwards cookies via `cookies()` and **forces** `cache: 'no-store'`. Throw if a caller passes both `withAuth` and `revalidate` |
| T3.2 | `lib/api/client.ts` — fetch wrapper for Client Components, `credentials: 'include'`. On 401: refresh once, retry, then `router.push('/login')`. No `require()`, no `window.location.href` |
| T3.3 | `lib/api/products.ts`, `posts.ts`, `orders.ts`, `cart.ts`, `auth.ts`, `vouchers.ts` |
| T3.4 | **Cache-boundary test.** Log in as user A, open `/products` → the HTML contains no personal data. `/account/orders` returns different results for A and B. If they match, stop — that's a security bug |

**Stop.**

---

## Phase 4 — Public pages

Ordered from fewest dependencies.

| Task | Route | Rendering | Notes |
|---|---|---|---|
| T4.1 | `app/layout.tsx` | — | Header/Footer are Server Components. The cart badge is a separate `'use client'` component |
| T4.2 | `/about`, `/lien-he` | static | Built first to confirm the build pipeline works |
| T4.3 | `/products` | SSR | Any search param → `robots: { index: false, follow: true }`. Show `stockQuantity` |
| T4.4 | `/products/[slug]` | ISR 300s | `generateStaticParams`. `Product` + `Offer` JSON-LD, `availability` derived from `stockQuantity > 0`. `notFound()` when `!isActive`. Real breadcrumb in the UI |
| T4.5 | `/collections/[slug]` | ISR 600s | Replaces the old `/category/:slug` |
| T4.6 | `/blog`, `/blog/[slug]`, `/blog/chu-de/[slug]` | ISR | Markdown via `react-markdown` + **mandatory `rehype-sanitize`**. Each post ends with a "Related products" block from `relatedProducts` |
| T4.7 | `/` | ISR 3600s | Featured products (T0.3), 3 latest posts, `Organization` + `LocalBusiness` JSON-LD |
| T4.8 | — | — | `next/image` throughout. `remotePatterns` for `res.cloudinary.com` and `picsum.photos`. First image gets `priority` |

**Stop.** Run Lighthouse on `/products/[slug]` and `/blog/[slug]`.

---

## Phase 5 — Transactional pages and SEO infrastructure

### Transactional (noindex, client-side)

| Task | Work |
|---|---|
| T5.1 | `cartStore.ts` — `persist` with `skipHydration: true`. A `<CartHydration>` component calls `rehydrate()` in `useEffect`. Verify: reload a page with 3 items in the cart, console shows **no** hydration warning |
| T5.2 | `authStore.ts` and `<AuthProvider>`. `checkAuth` runs in `useEffect` |
| T5.3 | `/cart`, `/checkout`, `/checkout/success`, `/order-lookup`, `/login`, `/register`, `/account/orders`, `/account/orders/[id]` — all `robots: { index: false }` |
| T5.4 | `middleware.ts` checks that the `access_token` cookie exists. **A UX guard only** — it does not verify the JWT (no secret at the edge). Verification stays in Express |

### SEO

| Task | Work |
|---|---|
| T5.5 | `app/sitemap.ts` — static plus dynamic entries (active products, published posts, categories, blog categories). `lastModified` from `updatedAt` |
| T5.6 | `app/robots.ts` — disallow `/cart`, `/checkout`, `/order-lookup`, `/login`, `/register`, `/account`, `/api`. Point at the sitemap |
| T5.7 | `lib/seo/jsonld.ts` — helpers for `Product`, `Article`, `BreadcrumbList`, `Organization`, `LocalBusiness` |
| T5.8 | Canonical in every `generateMetadata`. Filtered pages canonicalise to the unfiltered page |
| T5.9 | `not-found.tsx`, `error.tsx` |
| T5.10 | Proxy `/api/v1/*` through `next.config.ts` rewrites. Update `client.ts` to use relative paths |

**Stop.** Run Google's Rich Results Test.

---

## Definition of done

- [ ] `curl` a product page → name, price, and description appear in the raw HTML
- [ ] Every page has its own `<title>` and `<meta description>`
- [ ] `/sitemap.xml` lists all active products and published posts
- [ ] `/robots.txt` blocks the transactional group
- [ ] Rich Results Test recognises `Product` and `Article`
- [ ] Lighthouse mobile: SEO ≥ 95, Performance ≥ 85
- [ ] Guest cart works with no hydration errors
- [ ] The admin SPA is unaffected
- [ ] `tsc --noEmit` clean, zero `any`

---

## Out of scope this round

- Moving admin to Next.js
- Moving Express into Next API routes
- Internationalisation
- An external CMS — the owner writes posts through the existing admin
- Deep Core Web Vitals tuning. Hitting the thresholds above is enough

---

## Open questions for the shop owner

1. **When stock is decremented.** The spec says on `HOÀN TẤT` (completed). The code decrements at order placement. The code is safer (no overselling) but contradicts the spec.
2. **Junk orders.** Spec section D raises the risk of prank orders when checkout requires no account. No mitigation yet. Options: OTP over SMS/Zalo above a certain order value, or rate limiting per phone number.
3. **Bluetooth receipt printing to a POS printer.** The spec asks for it. In a browser this requires the Web Bluetooth API (Chrome, HTTPS only). Confirm the printer model.
