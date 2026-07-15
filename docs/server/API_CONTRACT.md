# API Contract — Bánh Tráng Nhà Na

> Extracted from `apps/api/src/`. This is the **source of truth** for the frontend.
> If the code in `apps/api/` disagrees with this document, report it — do not guess.
>
> Field/entity shapes are documented in full in `docs/server/MODELS.md` and
> `packages/shared-types/src/*.schema.ts` (the actual Zod schemas, shared by the API
> and both frontends). This document covers routes, auth, and request/response shape
> at the HTTP boundary — it does not repeat every model field.

Base URL: **`/api`** (there is no `/v1` segment in the running code, despite `docs/system/SRS.md` §5 specifying `/api/v1` — the code wins).

---

## Response envelope

Every successful response:

```json
{ "success": true, "message": "...", "data": {}, "meta": null }
```

`message` is present on most endpoints but a few return the bare `{ success, data }` shape without it (e.g. every `order` and `blog` route) — never assume `message` exists.

Every error response (`apps/api/src/middlewares/errorMiddleware.ts`):

```json
{ "success": false, "error": { "statusCode": 400, "message": "...", "cause": null } }
```

`cause` holds a per-field error object on `400` (Zod validation, or Mongoose validation), the duplicate key/value on `409`, and is `null` otherwise.

`meta` only appears on paginated list endpoints:

```json
{ "total": 42, "page": 1, "limit": 10, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
```

Pagination query: `?page=1&limit=10` (limit capped at 100, except `GET /blog` which caps at 50 with a default of 9).

---

## Authentication

- Mechanism: JWT in **httpOnly cookies** — `access_token` (15 min), `refresh_token` (7 days), both signed with `jsonwebtoken` (`HS256`, separate secrets for access vs. refresh).
- No Bearer tokens. Tokens are not readable from JS.
- Client-side fetch must set `credentials: 'include'`.
- Server-side fetch (Next.js Server Component) must forward the cookie manually — see `docs/system/SEO_CONTEXT.md` §6.1.
- Cookie attributes: in production, `Domain=.banhtrangnhana.com`, `Secure`, `SameSite=None` (so storefront and admin, both subdomains, can share it). In development, no `Domain` attribute and `SameSite=Lax` — `localhost` ports count as same-site.
- `verifyToken` — rejects unauthenticated requests. `optionalVerifyToken` — accepts both guests and authenticated users: used on `POST /orders` and `POST /vouchers/validate`, since checkout never requires an account.
- `requireRole('admin')` — used alongside `verifyToken` on every admin-only route.

**Note on admin route shape:** `docs/system/SRS.md` §5 specifies that admin routes should live uniformly under `/api/v1/admin/*` behind one middleware. **The running code does not do this.** Admin actions are mounted on the same resource router as their public counterpart, differentiated by HTTP method and `requireRole('admin')` per-route (e.g. `POST /api/products` is admin, `GET /api/products` is public, at the same base path). The blog module is the partial exception — it nests its admin-only reads under `/api/blog/admin/*` — but this isn't applied consistently elsewhere (`/api/orders/pos`, `/api/customers/export`, etc. are flat). Documented here as-is; do not assume a route is public or admin from its path alone — check the table below.

---

## Endpoints

### Auth — `/api/auth`

| Method | Path | Auth | Rate limit | Body |
|---|---|---|---|---|
| POST | `/auth/register` | — | `authRateLimit` | `{ email, password, fullName, phone }` |
| POST | `/auth/login` | — | `authRateLimit` | `{ email, password }` |
| POST | `/auth/refresh-token` | refresh cookie | — | — |
| POST | `/auth/logout` | — | — | — |

`authRateLimit`: 20 requests / 15 min per IP.

`register` (201) / `login` (200) issue both cookies and return `{ id, email, role, isActive }`.

Validation (`registerBodySchema`): `email` valid format, `password` ≥ 6 chars, `fullName` ≥ 2 chars, `phone` ≥ 9 chars.

`refresh-token` reads `refresh_token` from the cookie jar; `401` with `cause: null` if absent or invalid. On success, re-issues both cookies and returns `{ success: true, message, data: null }`.

### Customer — `/api/customers`

| Method | Path | Auth | Body / Query |
|---|---|---|---|
| GET | `/customers/me` | user | — |
| PATCH | `/customers/me` | user | `{ fullName?, phone?, dateOfBirth? }` |
| POST | `/customers/addresses` | user | `{ label?, fullAddress, ward?, district?, city?, isDefault? }` |
| GET | `/customers` | admin | `?search&page&limit` |
| GET | `/customers/export` | admin | `?format=json\|csv` |
| GET | `/customers/:id` | admin | — |

`label` ∈ `home` \| `work` \| `other`, default `home`. `fullAddress` min 5 chars.

`GET /customers/export?format=csv` responds with `Content-Type: text/csv` and a file attachment instead of the JSON envelope; `format=json` (default) returns the normal envelope.

### Catalog — `/api/products`, `/api/categories`

| Method | Path | Auth | Rate limit |
|---|---|---|---|
| GET | `/products` | — | `publicRateLimit` |
| GET | `/products/:slug` | — | `publicRateLimit` |
| POST | `/products` | admin | — |
| POST | `/products/bulk` | admin | — |
| PATCH | `/products/:id` | admin | — |
| PATCH | `/products/:id/stock` | admin | — |
| DELETE | `/products/:id` | admin | — |
| GET | `/categories` | — | `publicRateLimit` |
| POST | `/categories` | admin | — |
| PATCH | `/categories/:id` | admin | — |
| DELETE | `/categories/:id` | admin | — |

`publicRateLimit`: 500 requests / 15 min per IP (sized for crawler + ISR build traffic).

`GET /products` query (`productQuerySchema`): `category` (slug), `search`, `isFeatured`, `isNewArrival`, `minPrice`, `maxPrice`, `page`, `limit` (default 12, max 100) — all implemented in the service layer.

**Product is flat — no variants** (see `MODELS.md` §4). Shape:

```ts
{
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  flavor: string | null
  images: { url, publicId, alt, width, height, sortOrder }[]
  basePrice: number
  promoPrice: number | null       // null means no promotion
  stock: number
  tags: string[]
  isFeatured: boolean
  isNewArrival: boolean
  isActive: boolean
  metaTitle: string | null
  metaDescription: string | null
  createdAt: string
  updatedAt: string
}
```

**Pricing rule:** `price = promoPrice ?? basePrice`. No modifiers, no variants.

`PATCH /products/:id/stock` body is a union: `{ delta: number }` (relative adjustment) or `{ stock: number }` (absolute set).

`POST /products/bulk` body: `CreateProductBody[]` — a UI convenience for adding several products in one request; it is not lot/batch tracking (SRS D1).

### Cart — not implemented

`packages/shared-types/src/cart.schema.ts` defines `GuestCartItem` and a server-cart shape, and earlier planning docs (`SRS.md` §5, `ARCHITECTURE_BLUEPRINT_GREENFIELD.md` §2.3) describe a `cart` API module (`GET /cart`, `POST /cart/items`, `PATCH /cart/items/:itemId`, `DELETE /cart/items/:itemId`, `DELETE /cart`, auth required) — **none of this exists in the running code.** There is no `cart` directory under `apps/api/src/modules`, and no `/cart` route is mounted in `app.ts`.

The cart lives entirely client-side, in the storefront's `stores/cartStore.ts` (browser storage), for both guests and logged-in users. `POST /orders` accepts `items[]` directly from the request body and never reads a server-side cart. If a server-side cart for authenticated users (multi-device sync) is ever built, it belongs here — see the shape already reserved in `cart.schema.ts`.

### Order — `/api/orders`

| Method | Path | Auth |
|---|---|---|
| POST | `/orders` | optional (`optionalVerifyToken`) |
| POST | `/orders/lookup` | — (`publicRateLimit`) |
| GET | `/orders/me` | user |
| GET | `/orders` | admin |
| POST | `/orders/pos` | admin |
| GET | `/orders/:id` | admin |
| PATCH | `/orders/:id/status` | admin |
| POST | `/orders/:id/print` | admin |

`POST /orders` body (`placeOrderBodySchema`):

```ts
{
  items: { productId: string, quantity: number }[]   // min 1 item
  paymentMethod: 'cod' | 'bank_transfer'
  customerInfo: { fullName, phone, address, email? }   // required for guests and members alike
  voucherCode?: string
  note?: string
}
```

`POST /orders/lookup` body: `{ orderNumber, phone }` — lets guests track an order without an account.

`POST /orders/pos` (admin, in-store counter sale) uses the same item shape; creates the order directly as `completed` with all four status timestamps set to now, skipping `confirmed`/`shipping`.

`GET /orders` (admin) query (`orderQuerySchema`): `status`, `from`, `to`, `page`, `limit` (default 20, max 100).

**Order number format:** `BTNN-YYYYMMDD-NNN` (e.g. `BTNN-20260710-001`).

**Order statuses** (one enum, two label sets — SRS D3; labels live in the frontend, never stored):

| DB enum | Admin label | Customer label |
|---|---|---|
| `pending` | Chưa xử lí | Chờ xác nhận |
| `confirmed` | Đã xử lí | Đã xác nhận |
| `shipping` | Đang giao | Đang giao hàng |
| `completed` | Hoàn tất | Đã giao |
| `cancelled` | Hủy | Đã hủy |

**Valid transitions** (enforced in `order.service.ts`, not the schema):

```
pending    → confirmed | cancelled
confirmed  → shipping  | cancelled
shipping   → completed | cancelled
completed  → (terminal)
cancelled  → (terminal)
```

Customers may only cancel from `pending` — every other transition is admin-only via `PATCH /orders/:id/status` (body: `{ status, cancelReason? }`).

**Stock decrements atomically at order placement, not at `completed`** (SRS D4) — `POST /orders` decrements `stock` in the same operation that creates the order; insufficient stock rejects with `400` and no order is created. A transition to `cancelled` restores stock via an event listener. This prevents two guests from both successfully ordering the last unit.

`POST /orders/:id/print` (admin) is allowed once `status` is neither `pending` nor `cancelled` (SRS D7); each call increments `printCount` and returns the full order (the printable payload — Bluetooth POS printing itself is a browser/admin-panel concern, out of scope for the API per SRS D8).

### Voucher — `/api/vouchers`

| Method | Path | Auth |
|---|---|---|
| POST | `/vouchers/validate` | optional (`optionalVerifyToken`) |
| GET | `/vouchers` | admin |
| POST | `/vouchers` | admin |
| PATCH | `/vouchers/:id` | admin |
| DELETE | `/vouchers/:id` | admin |

`validate` body: `{ code, orderTotal, phone? }` → `{ voucherId, code, type, value, discountAmount }`. `phone` is used to check `perUserLimit` for guests, since vouchers are redeemed by phone number, not `userId` (SRS D6).

`type` ∈ `percentage` \| `fixed`. Constraints: `minOrderValue`, `maxDiscount`, `usageLimit`, `perUserLimit`, `validFrom`/`validUntil` (both optional — a voucher with neither is always valid).

### Blog — `/api/blog`, post categories at `/api/blog/categories`

| Method | Path | Auth |
|---|---|---|
| GET | `/blog/latest` | — |
| GET | `/blog/categories` | — |
| GET | `/blog/categories/:slug` | — |
| GET | `/blog` | — |
| GET | `/blog/:slug` | — |
| GET | `/blog/admin/all` | admin |
| GET | `/blog/admin/:id` | admin |
| POST | `/blog` | admin |
| PATCH | `/blog/:id` | admin |
| DELETE | `/blog/:id` | admin |
| POST | `/blog/categories` | admin |
| PATCH | `/blog/categories/:id` | admin |
| DELETE | `/blog/categories/:id` | admin |

`GET /blog` query (`postQuerySchema`): `category` (slug), `search`, `page`, `limit` (default 9, max 50). Public reads (`GET /blog`, `GET /blog/:slug`, `GET /blog/latest`) exclude drafts and future-dated posts; `GET /blog/admin/all` and `GET /blog/admin/:id` include them.

`GET /blog/latest?limit=3` (default 3) powers the homepage's latest-posts strip.

Post shape:

```ts
{
  id: string
  title: string
  slug: string
  excerpt: string
  content: string                          // markdown, sanitized to HTML by the storefront — never stored as HTML
  coverImage: { url, publicId, alt, width, height } | null
  category: { id, name, slug } | null
  relatedProducts: Product[]               // resolved, not a bare id array — powers the post→product conversion bridge
  metaTitle: string | null
  metaDescription: string | null
  status: 'draft' | 'published'
  publishedAt: string | null                // ISO
  readingMinutes: number                    // auto-computed from content on save
  viewCount: number
}
```

`createPostBodySchema`: `title` ≥ 5 chars, `excerpt` ≥ 20 chars, `content` ≥ 50 chars, `relatedProductIds: string[]` (default `[]` — sent as ids, resolved to `relatedProducts` on read).

### Media — `/api/media` (admin only, every route)

| Method | Path |
|---|---|
| POST | `/media/upload` |
| DELETE | `/media/:publicId` |

`POST /media/upload` — multipart, **field name `file`** (not `image`), JPEG/PNG/WebP only, 5 MB max (`multer.config.ts`). Returns `{ url, publicId, width, height, format, bytes }`.

`DELETE /media/:publicId` — `publicId` must be URL-encoded by the caller (Cloudinary public IDs can contain `/`). Returns `{ result: 'ok' | 'not found' }`; anything else throws `500`.

When `CLOUDINARY_CLOUD_NAME`/`CLOUDINARY_API_KEY`/`CLOUDINARY_API_SECRET` are unconfigured, image URLs elsewhere in the system fall back to `picsum.photos` stub images — allow that domain in `apps/storefront/next.config.ts` (already done) during development.

---

## Health check

`GET /health` (unauthenticated, no `/api` prefix) → `{ success: true, data: { status: 'ok', env } }`. Not part of the versioned API surface; used for uptime checks only.

---

## Common errors

| Status | Meaning |
|---|---|
| 400 | Validation failure (Zod or Mongoose). `cause` holds a per-field error object |
| 401 | Not authenticated, or token expired/invalid |
| 403 | Wrong role, or operation not permitted |
| 404 | Not found |
| 409 | Duplicate key (Mongoose `E11000`) — `cause` holds the conflicting field/value |
| 429 | Rate limited — see the per-route limiter above |
| 500 | Unhandled error |

`verifyToken` (`apps/api/src/middlewares/authMiddleware.ts`) distinguishes an expired token from an invalid one: `cause === 'JWT_EXPIRED'` on a `401` means the access token specifically expired (`TokenExpiredError`) — retry after `POST /auth/refresh-token`. Any other `401` (`cause: null`) means missing or otherwise invalid token; refreshing won't help, redirect to `/login` immediately. `optionalVerifyToken` (used on `POST /orders`, `POST /vouchers/validate`) never returns a 401 for a bad/absent token — it silently treats the request as a guest.
