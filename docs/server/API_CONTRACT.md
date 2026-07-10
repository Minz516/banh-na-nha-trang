# API Contract — Bánh Tráng Nhà Na

> Extracted from `server/src/`. This is the **source of truth** for the frontend.
> If the code in `server/` disagrees with this document, report it — do not guess.

Base URL: `/api/v1`

---

## Response envelope

Every successful response:

```json
{ "success": true, "message": "...", "data": {}, "meta": null }
```

Every error response (`server/src/middlewares/errorHandler.js`):

```json
{ "success": false, "error": { "statusCode": 400, "message": "...", "cause": null } }
```

`meta` only appears on paginated endpoints:

```json
{ "total": 42, "page": 1, "limit": 10, "totalPages": 5, "hasNextPage": true, "hasPrevPage": false }
```

Pagination query: `?page=1&limit=10` (limit capped at 100).

**Note:** several controllers currently return `statusCode: 211` instead of `201`. This is a bug with a fix task (T0.2). The frontend must not depend on `211`.

---

## Authentication

- Mechanism: JWT in **httpOnly cookies** — `access_token` (15 min), `refresh_token` (7 days)
- No Bearer tokens. Tokens are not readable from JS
- Client-side fetch must set `credentials: 'include'`
- Server-side fetch (Next.js Server Component) must forward the cookie manually

`optionalVerifyToken` — some endpoints accept both guests and authenticated users: `POST /orders`, `POST /vouchers/validate`.

---

## Endpoints

### Auth — `/auth`

| Method | Path | Auth | Body |
|---|---|---|---|
| POST | `/auth/register` | — | `{ email, password, fullName, phone }` |
| POST | `/auth/login` | — | `{ email, password }` |
| POST | `/auth/refresh-token` | cookie | — |
| POST | `/auth/logout` | — | — |

`register` / `login` return `{ id, email, role, isActive }` and set cookies.

Validation: password ≥ 6 chars, valid email format, `fullName` + `phone` required on register.

### Customer — `/customers` (auth required)

| Method | Path | Notes |
|---|---|---|
| GET | `/customers/me` | Returns `{ id, fullName, phone, email, dateOfBirth, addresses[] }` |
| PATCH | `/customers/me` | `{ fullName?, phone?, dateOfBirth? }` |
| POST | `/customers/addresses` | `{ label?, fullAddress, ward?, district?, city?, isDefault? }` |

`label` ∈ `home` \| `work` \| `other`. The first address automatically becomes the default.

### Catalog — `/products`, `/categories`

| Method | Path | Auth |
|---|---|---|
| GET | `/products` | — |
| GET | `/products/:slug` | — |
| GET | `/categories` | — |
| POST | `/products` | admin |
| PATCH | `/products/:id` | admin |
| DELETE | `/products/:id` | admin |
| POST | `/categories` | admin |
| PATCH | `/categories/:id` | admin |
| DELETE | `/categories/:id` | admin |

`GET /products` query params: `category` (slug), `search`, `minPrice`, `maxPrice`, `page`, `limit`.

> `isFeatured` / `isNewArrival` are **not implemented in the service layer** — task T0.3 adds them. Until then, `?isFeatured=true` returns every product.

**Product shape:**

```ts
{
  id: string
  name: string
  slug: string
  description: string
  categoryId: string
  basePrice: number
  promoPrice: number | null       // null means no promotion
  isFeatured: boolean
  isNewArrival: boolean
  isActive: boolean
  tags: string[]
  images: { url, publicId, alt, sortOrder }[]
  variants: {
    id: string
    sku: string
    attributes: { size: string; flavor: string }
    priceModifier: number
    stockQuantity: number
    isActive: boolean
  }[]
}
```

**Pricing rule** (matches `catalog.interfaces.js`):

```
price = (promoPrice ?? basePrice) + variant.priceModifier
```

**Every product always has at least one variant.** The model auto-creates a default variant if none is supplied. The frontend never needs to handle an empty array.

### Cart — `/cart` (auth required)

| Method | Path | Body |
|---|---|---|
| GET | `/cart` | — |
| POST | `/cart/items` | `{ productId, variantId, quantity }` |
| PATCH | `/cart/items/:itemId` | `{ quantity }` |
| DELETE | `/cart/items/:itemId` | — |
| DELETE | `/cart` | — |

Returns `{ items[], totalItems, totalAmount }`.

**Important:** the server-side cart exists **only for authenticated users**. Guests keep their cart in localStorage and submit `items[]` directly at checkout. On login, merge the local cart into the server cart.

### Order — `/orders`

| Method | Path | Auth |
|---|---|---|
| POST | `/orders` | optional |
| POST | `/orders/lookup` | — |
| GET | `/orders/my-orders` | user |
| GET | `/orders/my-orders/:id` | user (or admin) |
| GET | `/orders/admin/list` | admin |
| PATCH | `/orders/admin/status/:id` | admin |
| GET | `/orders/admin/stats` | admin |

`POST /orders` body:

```ts
{
  items: { productId, variantId, quantity }[]
  paymentMethod: 'cod' | 'bank_transfer'
  customerInfo: { fullName, phone, address, email? }   // required for guests
  voucherCode?: string
  note?: string
}
```

`POST /orders/lookup` body: `{ orderNumber, phone }` — lets guests track an order.

**Order number format:** `BTNN-YYYYMMDD-NNN` (e.g. `BTNN-20260710-001`).

**Order statuses:**

| Backend enum | Vietnamese label (per spec doc) |
|---|---|
| `pending_confirmation` | Chưa xử lí |
| `confirmed` | Đã xử lí (confirmed by phone) |
| `shipping` | Đang giao hàng |
| `completed` | Hoàn tất |
| `cancelled` | Hủy |

**Valid transitions** (`order.validators.js`):

```
pending_confirmation → confirmed | cancelled
confirmed            → shipping  | cancelled
shipping             → completed | cancelled
completed            → (terminal)
cancelled            → (terminal)
```

Customers may **only** cancel while the order is still `pending_confirmation`. Every other transition is admin-only.

> **Divergence from the spec doc:** the spec says stock is decremented when an order is marked `HOÀN TẤT` (completed). The current code decrements **at order placement** (`placeOrder` calls `decrementStock`) and restocks on cancellation (`catalog.events.js`). The code's behaviour is technically safer — it prevents overselling — but it contradicts the spec. Confirm with the shop owner before changing either side.

### Voucher — `/vouchers`

| Method | Path | Auth |
|---|---|---|
| POST | `/vouchers/validate` | optional |
| GET | `/vouchers` | admin |
| POST | `/vouchers` | admin |
| PATCH | `/vouchers/:id` | admin |
| DELETE | `/vouchers/:id` | admin |

`validate` body: `{ code, orderTotal }` → returns `{ voucherId, code, type, value, discountAmount }`.

`type` ∈ `percentage` \| `fixed`. Constraints: `minOrderValue`, `maxDiscount`, `usageLimit`, `perUserLimit`, `validFrom`, `validUntil`.

### Media — `/media` (admin)

| Method | Path |
|---|---|
| POST | `/media/upload` (multipart, field `image`) |
| DELETE | `/media/:publicId` |

Accepts JPEG / PNG / WebP only, 5 MB max. Returns `{ url, publicId }`.

When `CLOUDINARY_CLOUD_NAME` is unconfigured the service returns a stub URL from `picsum.photos` — remember to allow that domain in `next.config.ts` during development.

---

## Blog — `/posts` (DOES NOT EXIST YET)

Built in Phase 1. The frontend defines its types up front against the shape below.

| Method | Path | Auth |
|---|---|---|
| GET | `/posts` | — |
| GET | `/posts/:slug` | — |
| GET | `/post-categories` | — |
| POST | `/posts` | admin |
| PATCH | `/posts/:id` | admin |
| DELETE | `/posts/:id` | admin |

```ts
{
  id: string
  title: string
  slug: string
  excerpt: string
  content: string                  // markdown
  coverImage: { url, publicId, alt, width, height } | null
  category: { id, name, slug }
  relatedProducts: Product[]       // populated — powers internal links from post to product
  metaTitle: string | null
  metaDescription: string | null
  status: 'draft' | 'published'
  publishedAt: string | null       // ISO
  readingMinutes: number
  viewCount: number
}
```

---

## Common errors

| Status | Meaning |
|---|---|
| 400 | Validation failure. `cause` holds a per-field error object |
| 401 | Not authenticated, or token expired. `cause === 'JWT_EXPIRED'` → refresh, then retry |
| 403 | Wrong role, or operation not permitted |
| 404 | Not found |

Retry **once** after a refresh. If the refresh also returns 401, redirect to `/login`.
