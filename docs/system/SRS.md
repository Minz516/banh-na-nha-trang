# Software Requirements Specification — Bánh Tráng Nhà Na

> Supersedes the original Vietnamese spec document where they disagree.
> The original spec is ambiguous in several places; every resolution is recorded here under **Decision**.
> Read alongside `SEO_CONTEXT.md`. Where this file and existing code disagree, **this file wins** — the code is being rebuilt.

---

## 1. What the system is

A single-brand e-commerce site for Vietnamese specialty snacks, with an owner-facing admin panel and an editorial blog.

Three surfaces:

| Surface | Users | Auth |
|---|---|---|
| Storefront (Next.js) | Public, guests and registered customers | Optional |
| Admin panel (Vite SPA) | Shop owner and staff | Required, `role: 'admin'` |
| API (Express) | Both of the above | JWT in httpOnly cookies |

**Checkout does not require an account.** This is a hard requirement and it shapes the customer model — see section 4.

---

## 2. Decisions taken (read before modelling)

The original spec contains internal contradictions. These are the resolutions. Do not revisit them without asking.

### D1 — No batch/lot tracking

The spec's product form includes an expiry date, which implies lot management. **Rejected.**

- No `Batch` collection.
- No `expiryDate` field.
- Stock is a single integer on `Product`, adjusted by the admin.
- "Add products in bulk" (spec B.4) is a **UI affordance only** — a form that submits several products in one request. It is not lot management.

### D2 — Products are flat. No variants.

The current code has `Product.variants[]`, each with its own SKU, price modifier, and stock. The spec has exactly one quantity field per product.

**Decision: remove variants entirely.**

- A product has one price, one stock count, one optional `flavor` string.
- Two flavours sold separately = two products.
- This is a **breaking change** that propagates into `Cart`, `Order`, `catalog.interfaces`, and every stock operation. See section 7.

### D3 — Five order statuses, one enum

The spec describes two different status vocabularies (customer view in A.5, owner view in B.1). They are not two state machines. They are **two label sets over one enum**.

| DB enum | Admin label | Customer label |
|---|---|---|
| `pending` | Chưa xử lí | Chờ xác nhận |
| `confirmed` | Đã xử lí | Đã xác nhận |
| `shipping` | Đang giao | Đang giao hàng |
| `completed` | Hoàn tất | Đã giao |
| `cancelled` | Hủy | Đã hủy |

Labels live in the frontend. The API returns the enum. Never store a label.

The spec's definition of "Hoàn tất" (`= đơn được thêm mới, tự động trừ tồn kho`) is corrupted text and is ignored.

### D4 — Stock is decremented at order placement, restored on cancellation

The spec says stock decrements when an order reaches `completed`. **Rejected.**

Reason: two customers ordering the last unit would both succeed, and the owner would discover the shortfall after confirming both. These are handmade goods; running out is routine.

- `POST /orders` atomically decrements `stock`. Insufficient stock → `400`, order not created.
- Transition to `cancelled` restores stock via an event listener.
- `completed` does **not** touch stock.
- The stock number the admin sees means "units still sellable", not "units in the warehouse".

### D5 — Customers are keyed by phone number, not by user account

Checkout requires no account, yet the spec asks for a customer management page with purchase history. Without this decision that page would always be empty.

- `Customer.phone` is unique and required. `Customer.userId` is nullable.
- Every order upserts a `Customer` by `phone`.
- Registering an account later links `userId` to the existing `Customer` row matched by phone.
- Purchase history is queried by `customerId`, never by `userId`.

### D6 — Vouchers keep percentage and fixed types

The spec mentions only percentage discounts and a usage cap. The existing model has more. Keep the richer model — it costs nothing and the owner will want it.

`validFrom` / `validUntil` become **optional**. A voucher with no dates is always valid.

### D7 — Invoice printing is allowed from `confirmed` onward

The spec says the print button appears once an order is "Đã xử lí". In-store orders (spec B.5) are created directly as `completed`, skipping `confirmed`.

Rule: printable when `status !== 'pending'` and `status !== 'cancelled'`. Reprints are unlimited; each increments `printCount`.

### D8 — Bluetooth POS printing is out of scope for the API

It is a browser concern (Web Bluetooth). The API's job is to return a printable payload. Nothing more.

---

## 3. Data model

All models use `baseSchemaOptions` (timestamps, `id` transform, `_id`/`__v` stripped).

### 3.1 `User`

Unchanged from current code. Authentication only.

```
email         String, unique, required
phone         String, unique, sparse
passwordHash  String, required, bcrypt on save
role          'customer' | 'admin', default 'customer'
isActive      Boolean, default true
lastLoginAt   Date
```

### 3.2 `Customer`

Changed. `userId` is now nullable; `phone` is the identity.

```
phone        String, unique, required, indexed
fullName     String, required
email        String, optional
userId       ObjectId → User, nullable, sparse unique
addresses    [Address]
dateOfBirth  Date, optional
totalOrders  Number, default 0      // denormalised, updated on order events
totalSpent   Number, default 0      // denormalised
notes        String, optional       // owner's private notes
```

`Address`: `{ label: 'home'|'work'|'other', fullAddress, ward, district, city, isDefault }`

### 3.3 `Category`

Unchanged. Product categories: bánh tráng, bánh chuối, khoai tây, khô bò.

```
name, slug (unique), description, image, sortOrder, isActive
```

### 3.4 `Product`

**Rewritten.** No variants.

```
name             String, required
slug             String, unique, auto-generated
description      String, required
categoryId       ObjectId → Category, required
flavor           String, optional          // e.g. "muối tôm", "phô mai"
images           [{ url, publicId, alt, width, height, sortOrder }]
basePrice        Number, required, min 0
promoPrice       Number, nullable          // null = no promotion
stock            Number, required, min 0, default 0
tags             [String]
searchName       String, indexed           // diacritics stripped
isFeatured       Boolean, default false
isNewArrival     Boolean, default false
isActive         Boolean, default true
metaTitle        String, optional
metaDescription  String, optional
```

Effective price: `promoPrice ?? basePrice`. No modifiers.

Indexes: `{ isActive: 1, isFeatured: 1 }`, `{ isActive: 1, categoryId: 1 }`, text index on `searchName` + `description`.

### 3.5 `Cart`

Simplified. Server-side cart exists **only for authenticated users**; guests keep theirs in localStorage.

```
userId  ObjectId → User, unique, required
items   [{ productId, quantity, addedAt }]
```

### 3.6 `Order`

```
orderNumber       String, unique          // BTNN-YYYYMMDD-NNN
customerId        ObjectId → Customer, required
userId            ObjectId → User, nullable
channel           'online' | 'pos', default 'online'
customerSnapshot  { fullName, phone, email, address }
items             [OrderItem]
subtotal          Number
discountAmount    Number, default 0
voucherCode       String, nullable
total             Number
status            'pending'|'confirmed'|'shipping'|'completed'|'cancelled'
statusHistory     [{ status, changedAt, changedBy }]
confirmedAt       Date, nullable
shippedAt         Date, nullable
completedAt       Date, nullable
cancelledAt       Date, nullable
cancelReason      String, nullable
note              String, optional
paymentMethod     'cod' | 'bank_transfer'
printCount        Number, default 0
```

`OrderItem`:
```
productSnapshot  { productId, name, slug, image, flavor }
unitPrice        Number
quantity         Number, min 1
subtotal         Number
```

Snapshots are immutable. A price change tomorrow must not alter yesterday's order.

The four timestamp fields exist because the admin order table needs columns for order date, processing date, and cancellation date (spec B.3).

Indexes: `{ status: 1, createdAt: -1 }`, `{ customerId: 1, createdAt: -1 }`, `{ orderNumber: 1 }`.

**Status transitions:**

```
pending    → confirmed | cancelled
confirmed  → shipping  | cancelled
shipping   → completed | cancelled
completed  → (terminal)
cancelled  → (terminal)
```

POS orders are created directly as `completed` with all four timestamps set to now.

Customers may only cancel from `pending`. Every other transition is admin-only.

### 3.7 `Voucher`

Mostly unchanged.

```
code           String, unique, uppercase
type           'percentage' | 'fixed'
value          Number, min 1
minOrderValue  Number, default 0
maxDiscount    Number, nullable
usageLimit     Number, nullable
usedCount      Number, default 0
perUserLimit   Number, default 1
usedByPhones   [{ phone, count }]        // was usedByUsers — guests have no userId
validFrom      Date, nullable
validUntil     Date, nullable
isActive       Boolean, default true
```

`usedByUsers` becomes `usedByPhones` because guests can now redeem vouchers and have no `userId`.

### 3.8 `PostCategory`

```
name, slug (unique), description, sortOrder, isActive
```

### 3.9 `Post`

```
title              String, required
slug               String, unique, auto-generated
excerpt            String, required
content            String, required         // markdown
coverImage         { url, publicId, alt, width, height } | null
categoryId         ObjectId → PostCategory
relatedProductIds  [ObjectId → Product]
metaTitle          String, optional
metaDescription    String, optional
status             'draft' | 'published', default 'draft'
publishedAt        Date, nullable
readingMinutes     Number, computed from content
viewCount          Number, default 0
```

`relatedProductIds` is the point of the module. It renders the "Related products" block at the end of each article, which is where blog traffic converts. It is not optional metadata.

Indexes: `{ status: 1, publishedAt: -1 }`, text index on `title` + `excerpt`.

---

## 4. Modules

Follow the existing pattern in `server/src/modules/`:
`model` → `repository` → `service` → `controller` → `routes` → `dto` → `validators` → `interfaces` → `events`

Cross-module calls go through `*.interfaces.js`. Never import another module's service directly.

| Module | Owns | Exposes via interfaces |
|---|---|---|
| `auth` | `User`, JWT | `getUserById`, `getUserByEmail` |
| `customer` | `Customer` | `upsertByPhone`, `getCustomerSnapshot`, `incrementStats` |
| `catalog` | `Product`, `Category` | `getProductById`, `getProductSnapshot`, `decrementStock`, `incrementStock` |
| `cart` | `Cart` | `clearCart` |
| `order` | `Order` | `getOrderCountToday`, `getRecentOrders` |
| `voucher` | `Voucher` | `validateVoucher`, `consumeVoucher`, `releaseVoucher` |
| `blog` | `Post`, `PostCategory` | — |
| `media` | Cloudinary | `uploadImage`, `deleteImage` |

### Events (`utils/eventBus.js`)

| Event | Emitted by | Consumed by |
|---|---|---|
| `USER_REGISTERED` | auth | customer — links `userId` onto the `Customer` matched by phone |
| `ORDER_PLACED` | order | customer — increments `totalOrders`, `totalSpent` |
| `ORDER_CANCELLED` | order | catalog — restocks. voucher — releases usage. customer — decrements stats |
| `STOCK_LOW` | catalog | log only, for now |

---

## 5. API surface

Base: `/api/v1`. Envelope and error shapes as in `API_CONTRACT.md`.

### Public

```
GET    /products                  ?category&search&isFeatured&minPrice&maxPrice&page&limit
GET    /products/:slug
GET    /categories
GET    /posts                     ?category&search&page&limit
GET    /posts/:slug
GET    /post-categories
POST   /orders                    optional auth
POST   /orders/lookup             { orderNumber, phone }
POST   /vouchers/validate         optional auth
```

### Customer (auth required)

```
POST   /auth/register             { email, password, fullName, phone }
POST   /auth/login
POST   /auth/refresh-token
POST   /auth/logout
GET    /customers/me
PATCH  /customers/me
POST   /customers/addresses
GET    /cart
POST   /cart/items                { productId, quantity }
PATCH  /cart/items/:itemId        { quantity }
DELETE /cart/items/:itemId
DELETE /cart
GET    /orders/my-orders
GET    /orders/my-orders/:id
```

### Admin (`verifyToken` + `requireRole('admin')`)

```
POST   /products
POST   /products/bulk             [{ ...product }]          <- D1: UI convenience
PATCH  /products/:id
PATCH  /products/:id/stock        { delta } or { stock }
DELETE /products/:id

POST   /categories
PATCH  /categories/:id
DELETE /categories/:id

GET    /admin/orders              ?status&from&to&page&limit
GET    /admin/orders/:id
PATCH  /admin/orders/:id/status   { status, cancelReason? }
POST   /admin/orders/pos          creates a completed order at the counter
GET    /admin/orders/:id/invoice  printable payload; increments printCount
GET    /admin/stats

GET    /admin/customers           ?search&page&limit
GET    /admin/customers/:id       includes order history
GET    /admin/customers/export    ?format=csv|json

GET    /vouchers
POST   /vouchers
PATCH  /vouchers/:id
DELETE /vouchers/:id

POST   /posts
PATCH  /posts/:id
DELETE /posts/:id
POST   /post-categories
PATCH  /post-categories/:id
DELETE /post-categories/:id

POST   /media/upload
DELETE /media/:publicId
```

Admin routes move under `/admin/*` rather than `/orders/admin/*`. Cleaner, and it lets one middleware guard the whole prefix.

**Customer export**: CSV and JSON server-side. PDF and Google Sheets are client concerns — do not build them into the API.

---

## 6. Rules that are easy to get wrong

1. **Stock decrement must be atomic.** `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. Never read-then-write.
2. **Order creation is a transaction.** Decrement stock, consume voucher, upsert customer, create order. Any failure aborts all of it.
3. **Guest voucher limits key on phone**, not `userId`.
4. **`POST /orders` accepts `items[]` directly.** It does not read from the server cart. Guests have no server cart; authenticated users may have a stale one.
5. **Order snapshots are never populated.** `productSnapshot` is copied at write time. Do not add a `ref`.
6. **`GET /posts` must exclude drafts and future-dated posts** unless the caller is an admin.
7. **Cancelled orders restore stock exactly once.** Terminal states are terminal; a second `cancelled` transition must be rejected before any event fires.

---

## 7. What this changes in the existing code

The current backend runs, but the model has moved. This is a rebuild of the data layer, not a patch.

| File | Action |
|---|---|
| `catalog/models/Product.model.js` | Rewrite — remove `variants`, add `stock`, `flavor`, `metaTitle`, `metaDescription`, image dimensions |
| `catalog/catalog.service.js` | Rewrite `decrementStock`, `incrementStock`, `queryProducts`. Remove `getVariantById` |
| `catalog/catalog.interfaces.js` | Remove `getVariantById`. `getProductSnapshot` drops `variantSnapshot` |
| `catalog/catalog.dto.js` | Rewrite. **Also fixes the `productDto` → `catalogDto` bug** |
| `cart/models/Cart.model.js` | Remove `variantId` from items |
| `cart/cart.service.js`, `cart.dto.js` | Rewrite — no variant lookups |
| `order/models/Order.model.js` | Rewrite — remove `variantSnapshot`, add `customerId`, `channel`, four timestamps, `printCount` |
| `order/order.service.js` | Rewrite `placeOrder`, `transitionStatus`. Add `createPosOrder` |
| `customer/models/Customer.model.js` | `userId` nullable, `phone` unique, add `totalOrders`, `totalSpent`, `notes` |
| `customer/customer.service.js` | Add `upsertByPhone`, `linkUserAccount`, `incrementStats` |
| `voucher/models/Voucher.model.js` | `usedByUsers` → `usedByPhones`. `validFrom`/`validUntil` optional |
| `blog/*` | New module |
| `routes/index.js` | Restructure admin routes under `/admin` |
| `utils/slugify.js` | New — extracted from `Product.model.js` |
| All controllers | Replace `statusCode: 211` with `201` |

**Data migration is not required.** There is no production data. Drop the database and re-seed.

---

## 8. Out of scope

- Payment gateway integration (COD and manual bank transfer only)
- Shipping carrier integration. The owner tracks delivery in a separate app; the site only records that an order has entered `shipping`
- Real-time notifications
- Multi-language
- Product reviews and ratings
- Batch/lot tracking (D1)
- Product variants (D2)

---

## 9. Still unanswered

1. **Junk orders.** The spec raises the risk of prank orders when checkout requires no account, and offers no mitigation. Options: OTP over SMS/Zalo above a value threshold; rate limit by phone; or accept the risk and let the owner cancel manually. Needs an answer from the shop owner. Nothing is built for this yet.
2. **Who may create POS orders?** Currently `role: 'admin'` only. If staff need counter access without full admin rights, a `staff` role is required. Not built.
