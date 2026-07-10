# Prompt: Backend Rebuild

> Paste into a **fresh** Claude Code session.
> `SRS.md` must be at the repo root. `SEO_CONTEXT.md` is useful context but not required for this session.
> Replaces the earlier `BACKEND_PROMPT.md`.

---

Read `SRS.md` end to end before writing anything. It supersedes the original Vietnamese spec document and it supersedes the current code wherever they disagree.

This session rebuilds the backend data layer. Work in `server/` only. Do not touch `client/`.

## Ground rules

- **One task at a time.** Show the diff, state how you verified it, stop. Do not chain tasks.
- Every change ships with a verification step: a command I can run and the output I should see. "This should work" is not verification.
- Follow the existing module pattern — `model` → `repository` → `service` → `controller` → `routes` → `dto` → `validators` → `interfaces` → `events`. Read `server/src/modules/voucher/` first. Do not invent a different structure, a different error class, or a different response envelope.
- Cross-module calls go through `*.interfaces.js`. Never import another module's service directly.
- No new dependencies without asking.
- No tests this round.
- There is no production data. When a model change would need a migration, drop and re-seed instead.

## Order of work

### Step 1 — Read and report

Before changing a single file, read the current `server/src/modules/` and give me a written comparison against section 3 and section 7 of `SRS.md`.

I want to know: where does the existing code already match, where does it diverge, and did I miss anything in section 7. If `SRS.md` asks for something that will break code it does not list, tell me now.

Stop. Wait for approval.

### Step 2 — Shared foundations

- `server/src/utils/slugify.js` — extract from `Product.model.js`.

  Careful: `Category.model.js` and `Product.model.js` currently strip diacritics **differently**. `Category` uses a hand-written character map; `Product` uses `normalize('NFD')`, which does not handle `đ` on its own. They do not produce identical output. Show me both, say which is correct, and ask before choosing. Slugs must stay stable.

- Replace `statusCode: 211` with `201` in every controller.

- `utils/eventBus.js` — update the event list per `SRS.md` section 4.

Stop.

### Step 3 — Models

In this order, because of dependencies:

1. `Category` (unchanged, verify only)
2. `Product` — rewrite, no variants
3. `Customer` — `phone` unique, `userId` nullable
4. `Voucher` — `usedByPhones`, optional date range
5. `Cart` — drop `variantId`
6. `Order` — rewrite
7. `PostCategory`, `Post` — new

After each model: show me the schema and the indexes. Stop after model 2 and model 6 specifically — those two carry the most consequence.

### Step 4 — Services, repositories, DTOs, validators

Module by module: `catalog` → `customer` → `voucher` → `cart` → `order` → `blog`.

`order` last because it depends on all the others.

Watch for these. They are listed in `SRS.md` section 6 and they are the ones that get botched:

- Stock decrement is atomic: `findOneAndUpdate({ _id, stock: { $gte: qty } }, { $inc: { stock: -qty } })`. Never read-then-write.
- `placeOrder` runs inside a transaction. Decrement stock, consume voucher, upsert customer, create order. Any failure aborts everything.
- Guest voucher usage keys on `phone`, not `userId`.
- `POST /orders` takes `items[]` from the request body. It never reads the server cart.
- Order snapshots are copied at write time and carry no `ref`.
- A terminal order rejects further transitions **before** any event fires. Cancelling twice must not restock twice.
- `GET /posts` hides drafts and future-dated posts from non-admins.

Stop after `catalog` and again after `order`.

### Step 5 — Routes

Restructure admin endpoints under `/api/v1/admin/*` per `SRS.md` section 5. One middleware guards the prefix.

`client/admin/src/config/apiConfig.js` points at the old paths. **Do not edit it.** Note the mismatch in your report; the admin SPA gets updated in a later session.

### Step 6 — Seeds

- `seedAdmin.js` — keep, verify it still runs
- `seedCatalog.js` — new: 4 categories, 12 products with realistic Vietnamese names and prices, a few featured, a few out of stock
- `seedBlog.js` — new: 2 post categories, 4 published posts, each linked to at least one product via `relatedProductIds`

All seeds idempotent. Running twice must not duplicate rows.

### Step 7 — Verify

Boot the server and exercise, with output pasted:

```
GET  /products
GET  /products/:slug
GET  /posts
POST /orders                    # guest, valid
POST /orders                    # guest, quantity exceeds stock -> 400, no order created
PATCH /admin/orders/:id/status  # pending -> confirmed
PATCH /admin/orders/:id/status  # confirmed -> cancelled, stock restored
PATCH /admin/orders/:id/status  # cancelled -> cancelled, rejected, stock unchanged
GET  /admin/customers           # the guest from above appears here
```

The last two are the ones that catch real bugs. Do not skip them.

## Do not build

Section 8 of `SRS.md` lists what is out of scope. In particular: no payment gateway, no shipping integration, no batch tracking, no product variants, no reviews.

Section 9 lists two open questions — junk-order protection and a `staff` role. **Do not build either.** If you see relevant code, leave it and mention it.

## If something conflicts

If `SRS.md` contradicts the code in a way section 7 did not anticipate, or you see a better approach: stop, describe the problem, propose an option, wait. Do not decide on your own.
