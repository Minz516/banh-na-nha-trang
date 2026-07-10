# Data Models — Bánh Tráng Nhà Na

> Source of truth: `apps/api/src/modules/*/*.model.ts`. This document describes the
> Mongoose models as implemented in code today. Where a decision behind a field is
> non-obvious, it references the relevant decision in `docs/system/SRS.md` §2 (D1–D8).
>
> Every model uses `baseSchemaOptions` (`apps/api/src/utils/baseSchemaOptions.ts`):
> `timestamps: true` (adds `createdAt`/`updatedAt`), and a `toJSON`/`toObject` transform
> that renames `_id` → `id` (string) and strips `__v`. This is omitted from the field
> tables below since it applies uniformly.

## Table of contents

1. [User](#1-user) — `auth` module
2. [Customer](#2-customer) — `customer` module
3. [Category](#3-category) — `catalog` module
4. [Product](#4-product) — `catalog` module
5. [Cart](#5-cart) — `cart` module
6. [Order](#6-order) — `order` module
7. [Voucher](#7-voucher) — `voucher` module
8. [PostCategory](#8-postcategory) — `blog` module
9. [Post](#9-post) — `blog` module
10. [Model relationships](#10-model-relationships)

---

## 1. User

`apps/api/src/modules/auth/auth.model.ts` — Mongoose model name: `User`. Authentication only; no profile/purchase data lives here (see [Customer](#2-customer)).

| Field | Type | Constraints |
|---|---|---|
| `email` | String | required, unique, lowercase, trimmed |
| `phone` | String | unique, sparse, trimmed |
| `passwordHash` | String | required; bcrypt-hashed (cost 12) in a `pre('save')` hook whenever modified |
| `role` | `'customer' \| 'admin'` | default `'customer'` |
| `isActive` | Boolean | default `true` |
| `lastLoginAt` | Date | optional |

No indexes beyond the unique constraints on `email` and `phone`.

---

## 2. Customer

`apps/api/src/modules/customer/customer.model.ts` — Mongoose model name: `Customer`. Keyed by phone number, not by account (SRS D5) — this is what allows guest checkout to still build a purchase history.

| Field | Type | Constraints |
|---|---|---|
| `phone` | String | required, unique — the identity key |
| `fullName` | String | required, trimmed |
| `email` | String | optional, trimmed, lowercase |
| `userId` | ObjectId → `User` | sparse, **nullable** — set only once the phone owner registers/logs in (D5) |
| `addresses` | `Address[]` | default `[]` |
| `dateOfBirth` | Date | optional |
| `totalOrders` | Number | default `0` — denormalised, updated on order events |
| `totalSpent` | Number | default `0` — denormalised |
| `notes` | String | optional — owner's private notes |

**`Address` subdocument** (has its own `_id`):

| Field | Type | Constraints |
|---|---|---|
| `label` | `'home' \| 'work' \| 'other'` | default `'home'` |
| `fullAddress` | String | required |
| `ward` | String | optional |
| `district` | String | optional |
| `city` | String | optional |
| `isDefault` | Boolean | default `false` |

---

## 3. Category

`apps/api/src/modules/catalog/catalog.model.ts` — Mongoose model name: `Category`.

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trimmed |
| `slug` | String | unique — auto-generated from `name` via `slugify()` in `pre('save')` |
| `description` | String | optional |
| `image` | String | optional |
| `sortOrder` | Number | default `0` |
| `isActive` | Boolean | default `true` |

---

## 4. Product

`apps/api/src/modules/catalog/catalog.model.ts` — Mongoose model name: `Product`. **Flat — no variants** (SRS D2): one price, one stock count, one optional `flavor`. Two flavors of the same snack are two separate `Product` documents.

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trimmed |
| `slug` | String | unique — auto-generated from `name` |
| `description` | String | required |
| `categoryId` | ObjectId → `Category` | required |
| `flavor` | String | optional, trimmed — e.g. "muối tôm", "phô mai" |
| `images` | `ProductImage[]` | default `[]` |
| `basePrice` | Number | required, min `0` |
| `promoPrice` | Number | optional, min `0` — `null`/absent means no promotion; effective price is `promoPrice ?? basePrice` |
| `stock` | Number | required, min `0`, default `0` — means "units still sellable," decremented atomically at order placement (D4) |
| `tags` | String[] | default `[]` |
| `searchName` | String | indexed — diacritics-stripped copy of `name`, auto-set alongside `slug` |
| `isFeatured` | Boolean | default `false` |
| `isNewArrival` | Boolean | default `false` |
| `isActive` | Boolean | default `true` |
| `metaTitle` | String | optional |
| `metaDescription` | String | optional |

**`ProductImage` subdocument** (no `_id`): `url`, `publicId`, `alt` (default `''`), `width`, `height`, `sortOrder` (default `0`) — all required except `alt`/`sortOrder`.

**Indexes:** `{ isActive: 1, isFeatured: 1 }`, `{ isActive: 1, categoryId: 1 }`, text index on `searchName` + `description`.

---

## 5. Cart

`apps/api/src/modules/cart/cart.model.ts` — Mongoose model name: `Cart`. Server-side cart exists **only for authenticated users** — guests keep their cart in the storefront's browser storage, never in this collection.

| Field | Type | Constraints |
|---|---|---|
| `userId` | ObjectId → `User` | required, unique — one cart document per user |
| `items` | `CartItem[]` | default `[]` |

**`CartItem` subdocument** (has its own `_id`):

| Field | Type | Constraints |
|---|---|---|
| `productId` | ObjectId → `Product` | required |
| `quantity` | Number | required, min `1` |
| `addedAt` | Date | default `Date.now` |

No `variantId` — carts carry `productId` + `quantity` only (D2).

---

## 6. Order

`apps/api/src/modules/order/order.model.ts` — Mongoose model name: `Order`.

| Field | Type | Constraints |
|---|---|---|
| `orderNumber` | String | required, unique — human-facing (`BTNN-YYYYMMDD-NNN`), not the primary key |
| `customerId` | ObjectId → `Customer` | required |
| `userId` | ObjectId → `User` | sparse, nullable |
| `channel` | `'online' \| 'pos'` | default `'online'` |
| `customerSnapshot` | `CustomerSnapshot` | required — immutable copy at order time |
| `items` | `OrderItem[]` | required |
| `subtotal` | Number | required, min `0` |
| `discountAmount` | Number | default `0` |
| `voucherCode` | String | optional |
| `total` | Number | required, min `0` |
| `status` | `OrderStatus` | enum `'pending' \| 'confirmed' \| 'shipping' \| 'completed' \| 'cancelled'`, default `'pending'` (SRS D3) |
| `statusHistory` | `StatusHistoryEntry[]` | default `[]` |
| `confirmedAt` / `shippedAt` / `completedAt` / `cancelledAt` | Date | optional — one per status transition, needed for admin order-table columns |
| `cancelReason` | String | optional |
| `note` | String | optional |
| `paymentMethod` | `'cod' \| 'bank_transfer'` | required |
| `printCount` | Number | default `0` — incremented on every invoice reprint (D7) |

**`ProductSnapshot`** (embedded in each order item, no `_id`): `productId` (String), `name`, `slug`, `image` (nullable), `flavor` (nullable) — copied at write time, **never a `ref`/populate** (order history must not change if the product changes later).

**`OrderItem`** (no `_id`): `productSnapshot`, `unitPrice` (min `0`), `quantity` (min `1`), `subtotal` (min `0`).

**`CustomerSnapshot`** (no `_id`): `fullName`, `phone` (both required), `address` (optional), `email` (optional).

**`StatusHistoryEntry`** (no `_id`): `status` (String), `changedAt` (required), `changedBy` (optional).

**Indexes:** `{ customerId: 1, createdAt: -1 }`, `{ status: 1, createdAt: -1 }`.

**Status transitions** (enforced in the service layer, not the schema):
```
pending    → confirmed | cancelled
confirmed  → shipping  | cancelled
shipping   → completed | cancelled
completed  → (terminal)
cancelled  → (terminal)
```
Customers may only cancel from `pending`; every other transition is admin-only. POS orders (`channel: 'pos'`) are created directly as `completed` with all four timestamp fields set to the creation time.

---

## 7. Voucher

`apps/api/src/modules/voucher/voucher.model.ts` — Mongoose model name: `Voucher`.

| Field | Type | Constraints |
|---|---|---|
| `code` | String | required, unique, uppercased, trimmed |
| `type` | `'percentage' \| 'fixed'` | required |
| `value` | Number | required, min `1` |
| `minOrderValue` | Number | default `0` |
| `maxDiscount` | Number | optional |
| `usageLimit` | Number | optional — no limit if absent |
| `usedCount` | Number | default `0` |
| `perUserLimit` | Number | default `1` |
| `usedByPhones` | `{ phone: String, count: Number (default 1) }[]` | default `[]` — keyed by phone, not `userId`, so guests can redeem (D6) |
| `validFrom` | Date | optional — no lower bound if absent |
| `validUntil` | Date | optional — no upper bound if absent |
| `isActive` | Boolean | default `true` |

---

## 8. PostCategory

`apps/api/src/modules/blog/blog.model.ts` — Mongoose model name: `PostCategory`.

| Field | Type | Constraints |
|---|---|---|
| `name` | String | required, trimmed |
| `slug` | String | unique — auto-generated from `name` |
| `description` | String | optional |
| `sortOrder` | Number | default `0` |
| `isActive` | Boolean | default `true` |

---

## 9. Post

`apps/api/src/modules/blog/blog.model.ts` — Mongoose model name: `Post`.

| Field | Type | Constraints |
|---|---|---|
| `title` | String | required, trimmed |
| `slug` | String | unique — auto-generated from `title` |
| `excerpt` | String | required |
| `content` | String | required — markdown, rendered to sanitized HTML by the storefront, never stored as HTML |
| `coverImage` | `CoverImage` | optional |
| `categoryId` | ObjectId → `PostCategory` | sparse, optional |
| `relatedProductIds` | ObjectId[] → `Product` | default `[]` — **not optional metadata**: this is what drives the "related products" block that converts blog traffic |
| `metaTitle` | String | optional |
| `metaDescription` | String | optional |
| `status` | `'draft' \| 'published'` | default `'draft'` |
| `publishedAt` | Date | optional — auto-set to now the first time `status` transitions to `'published'` |
| `readingMinutes` | Number | default `0` — auto-computed from `content` word count on save (`ceil(wordCount / 200)`) |
| `viewCount` | Number | default `0` |

**`CoverImage` subdocument** (no `_id`): `url`, `publicId` (both required), `alt` (default `''`), `width`, `height` (both required).

**Indexes:** `{ status: 1, publishedAt: -1 }`, `{ categoryId: 1, status: 1 }`.

`GET /posts` must exclude drafts and future-dated posts unless the caller is an admin (enforced in the service layer).

---

## 10. Model relationships

```
User ───────────────┐ (0..1, via userId)
                     ▼
Customer ◄───────────── Order.customerId (required)
   │                        │
   │ addresses[]            ├─ items[].productSnapshot  (copied, not a ref)
   │                        └─ customerSnapshot          (copied, not a ref)
   │
   ▼
Category ◄── Product.categoryId
                │
                ├─◄ Cart.items[].productId   (authenticated users only)
                ├─◄ Post.relatedProductIds[]
                └─◄ Order.items[] (via productSnapshot, immutable copy)

PostCategory ◄── Post.categoryId

Voucher — referenced by Order.voucherCode (String, not a ref) and tracks
          redemptions in usedByPhones[] keyed by Customer.phone
```

Two rules worth restating because they're easy to get backwards (`docs/system/SRS.md` §6):

- **Order snapshots are never populated.** `productSnapshot` and `customerSnapshot` are plain copied data, not Mongoose `ref`s — a price change or profile edit tomorrow must never alter yesterday's order.
- **Guests have no `Cart` document.** `POST /orders` accepts `items[]` directly from the request body; it never reads from the server-side cart, since guests have none and an authenticated user's server cart may be stale.
