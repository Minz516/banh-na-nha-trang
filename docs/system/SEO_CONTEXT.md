# Context: Sitemap & SEO — Bánh Tráng Nhà Na

> This document describes the **problem** and the **constraints**. It is not a build guide.
> Read it before touching `BUILD_PLAN.md`.

---

## 1. Business goal

The site serves **two purposes at once**:

1. **Selling** — rice paper, banana chips, potato snacks, dried beef. Checkout must not require an account.
2. **Publishing** — informational articles (storage tips, production process, recipes) to earn organic traffic.

The real SEO value lives in **internal links from blog posts to product pages**. A reader searches "how long does bánh tráng keep", reads the article, and is led to the product. Skip that linkage and the blog is pure cost.

---

## 2. Root problem: a React SPA cannot rank

The storefront is currently **Vite + React 19 + react-router-dom**, rendered entirely on the client.

When Googlebot arrives, the HTML is just `<div id="root"></div>`. Google can execute JS, but:

- It burns crawl budget; indexing takes weeks instead of days
- Per-page `<title>` and `<meta description>` cannot differ in the source HTML
- Open Graph tags don't work when a link is shared to Facebook or Zalo — the primary channels in this market
- Bing and most social crawlers barely execute JS at all

**Decision**: rebuild the storefront on **Next.js App Router**.

**Scope of that decision:**

| Component | Treatment |
|---|---|
| `client/storefront` | Rebuilt in Next.js |
| `client/admin` | **Unchanged** Vite SPA — the admin panel needs no SEO |
| `server` | **Unchanged** Express + MongoDB. Not moved into Next API routes |

Why Express stays: the backend already has a clean module architecture (controller / service / repository / dto / events), it works, and the admin SPA depends on it. Rewriting it as Next API routes is risk with no payoff.

---

## 3. Target sitemap

### 3.1 Indexed pages (SEO priority)

| URL | Content | Rendering |
|---|---|---|
| `/` | Home, featured products, latest posts | ISR (revalidate 3600) |
| `/products` | All products, search and filters | SSR |
| `/products/[slug]` | Product detail | ISR (revalidate 300) |
| `/collections/[slug]` | Products by category | ISR (revalidate 600) |
| `/blog` | Post index | ISR (revalidate 600) |
| `/blog/[slug]` | Post detail | ISR (revalidate 3600) |
| `/blog/chu-de/[slug]` | Posts by topic | ISR (revalidate 3600) |
| `/about` | Story, production process | Static |
| `/lien-he` | Contact details | Static |

### 3.2 `noindex` pages (no search value)

```
/cart
/checkout
/checkout/success
/order-lookup
/login
/register
/account/*
```

These render on the client, set `robots: { index: false, follow: false }` in metadata, and are disallowed in `robots.txt`.

### 3.3 Changes from the current routing

| Old (react-router) | New (Next.js) | Reason |
|---|---|---|
| `/category/:slug` | `/collections/[slug]` | Frees the `category` namespace for the blog and removes the semantic collision |
| _(missing)_ | `/about` | Present in the spec doc, never implemented |
| _(missing)_ | `/blog/*` | New module |
| `/products/:slug` | `/products/[slug]` | Flat structure preserved |

---

## 4. Non-negotiable SEO rules

### 4.1 Product URLs stay flat

Right: `/products/banh-trang-muoi-tom`
Wrong: `/collections/banh-trang/products/banh-trang-muoi-tom`

A product in two categories would produce two URLs with identical content. Flat URLs guarantee exactly one canonical address per product.

### 4.2 The blog lives at `/blog`, not on a subdomain

Google treats `blog.example.com` as a separate site — its authority never flows to the store. Nested under a path, every article strengthens the main domain.

### 4.3 Filters use query params plus noindex

- `/products` → indexed
- `/collections/banh-trang` → indexed
- `/products?search=cay&page=2` → **noindex**, but still `follow`

Never mint a distinct URL per filter combination. That generates hundreds of thin pages.

### 4.4 Canonical on every page

Every page needs `<link rel="canonical">` pointing at itself, or at the unfiltered page when it is a filtered variant.

### 4.5 Schema markup (JSON-LD)

| Page | Schema |
|---|---|
| `/` | `Organization` + `LocalBusiness` |
| `/products/[slug]` | `Product` + `Offer` (price, availability) |
| `/blog/[slug]` | `Article` + `BreadcrumbList` |
| Every subpage | `BreadcrumbList` |

`Offer.availability` must reflect real `stockQuantity`. Declaring in-stock when sold out violates Google Merchant policy.

### 4.6 Breadcrumbs render visibly

Not only in JSON-LD. Users need to see them too: `Trang chủ › Bánh tráng › Bánh tráng muối tôm`

### 4.7 Vietnamese slugs without diacritics

The backend already has `removeDiacritics` in `server/src/modules/catalog/models/Product.model.js`. Reuse it for the blog's `Post` model. Do not rewrite it.

### 4.8 sitemap.xml and robots.txt are generated

Use Next.js `app/sitemap.ts` and `app/robots.ts`. The sitemap must fetch products and posts from the API — never hardcode.

---

## 5. Existing bugs that must be fixed first

These are real defects in the current codebase. They will block or mislead the rebuild.

### 5.1 `catalog.dto.js` — guaranteed runtime error

```js
productListResponse: (products) => {
  return products.map(productDto.productResponse);  // productDto does not exist
}
```

It should be `catalogDto.productResponse`. `GET /products` currently crashes. That is the endpoint the entire product surface depends on.

### 5.2 `httpHelper.js` — `require()` inside an ESM file

Both `client/storefront/src/services/httpHelper.js` and `client/admin/src/services/httpHelper.js`:

```js
const { useAuthStore } = require('@/stores/authStore');  // does not work in ESM
window.location.href = '/login';                          // does not work on the server
```

The API layer must be rewritten from scratch for Next.js — see section 6.

### 5.3 The featured-products endpoint is not implemented

`client/storefront/src/config/apiConfig.js` declares `FEATURED: '/products?isFeatured=true'`, but `catalogService.queryProducts` never reads `isFeatured` from the filters. The homepage would return the entire catalogue.

### 5.4 HTTP status code `211`

`sendSuccess(res, { statusCode: 211 })` appears across several controllers. `211` is not a valid code. `201 Created` was intended.

### 5.5 Missing `isFeatured` index and SEO fields on Product

The `Product` model has no `metaTitle` or `metaDescription`. Images carry no `width`/`height` — required by `next/image` to avoid layout shift, which is a Core Web Vitals input.

---

## 6. Three technical traps in this rebuild

This is the section most likely to be gotten wrong. Read carefully.

### 6.1 Auth cookies do not travel with server-side fetches

Today: the browser sends `access_token` automatically because `axios.withCredentials = true`.

In Next.js, when a **Server Component** calls the API, the request originates from Node, not the browser. The cookie **is not attached automatically**.

It must be forwarded by hand:

```ts
import { cookies } from 'next/headers';

const cookieStore = await cookies();
fetch(url, {
  headers: { Cookie: cookieStore.toString() },
});
```

Architectural consequence:

- **Public** pages (products, blog) fetch without cookies → safe to cache and ISR
- **Personalised** pages (cart, account) need cookies → must be dynamic, never cached

The two **must not** be mixed inside one Server Component. Mixing them means the cache can serve one user's data to another — a serious security defect.

### 6.2 Cross-origin cookies in production

Cookies are currently set with `sameSite: 'Lax'`. With `SameSite=Lax` a cookie is **not sent** on cross-site requests.

In development (`localhost:3000` → `localhost:5000`) `localhost` counts as same-site, so it works. In production, if the frontend is `banhtrangnhana.com` and the API is `api.banhtrangnhana.com`, that is still the same registrable domain, so `Lax` still works.

But if the API ends up on an unrelated domain (a `xxx.onrender.com` from Render or Railway), you must switch to `SameSite=None; Secure` — and Safari/iOS blocks that by default.

**Recommendation**: use a subdomain of the same registrable domain, or reverse-proxy `/api/*` through Next.js itself. The latter is the safest.

### 6.3 Zustand `persist` causes hydration mismatch

`client/storefront/src/stores/cartStore.js` uses `persist`, reading from `localStorage`.

The server renders an empty cart; the client hydrates a cart with three items; React throws a hydration error and may discard the DOM.

Fix: set `skipHydration: true`, call `rehydrate()` inside `useEffect`, and render the cart badge only once `mounted === true`.

---

## 7. Target directory structure

```
client/
  storefront/        <- Next.js App Router (rebuilt)
    src/app/
      layout.tsx
      page.tsx                       /
      products/
        page.tsx                     /products
        [slug]/page.tsx              /products/[slug]
      collections/[slug]/page.tsx
      blog/
        page.tsx
        [slug]/page.tsx
        chu-de/[slug]/page.tsx
      about/page.tsx
      lien-he/page.tsx
      (shop)/                        <- route group, noindex
        cart/page.tsx
        checkout/page.tsx
        order-lookup/page.tsx
      (auth)/
        login/page.tsx
        register/page.tsx
      account/orders/page.tsx
      sitemap.ts
      robots.ts
    src/lib/
      api/                           <- data layer, server/client split
      seo/                           <- metadata + JSON-LD helpers
    src/components/
    src/stores/
  admin/             <- unchanged Vite SPA
server/              <- unchanged Express
```

---

## 8. What "done" means

- [ ] `curl` a product page and see name, price, and description in the raw HTML — no JS required
- [ ] Every page has a distinct `<title>` and `<meta name="description">`
- [ ] `/sitemap.xml` lists every active product and published post
- [ ] `/robots.txt` disallows `/cart`, `/checkout`, `/account`, `/login`
- [ ] Google's Rich Results Test recognises `Product` and `Article`
- [ ] Lighthouse mobile: SEO ≥ 95, Performance ≥ 85
- [ ] The guest cart works with no hydration errors
- [ ] `/admin` (Vite SPA) still runs, untouched
