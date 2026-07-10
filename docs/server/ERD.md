# Entity-Relationship Diagram — Bánh Tráng Nhà Na

> Companion to `docs/server/MODELS.md`, which has the full field-by-field breakdown.
> This diagram shows only the fields relevant to understanding relationships —
> not every field on every model. Rendered with Mermaid (GitHub renders this natively).

```mermaid
erDiagram
    USER {
        ObjectId id PK
        string email UK
        string phone UK
        string passwordHash
        string role "customer | admin"
        boolean isActive
    }

    CUSTOMER {
        ObjectId id PK
        string phone UK "identity key, not userId"
        string fullName
        ObjectId userId FK "nullable, sparse-unique"
        number totalOrders "denormalised"
        number totalSpent "denormalised"
    }

    CATEGORY {
        ObjectId id PK
        string name
        string slug UK
        number sortOrder
    }

    PRODUCT {
        ObjectId id PK
        string name
        string slug UK
        ObjectId categoryId FK
        string flavor "optional, no variants"
        number basePrice
        number promoPrice "nullable"
        number stock
        boolean isFeatured
        boolean isNewArrival
    }

    CART {
        ObjectId id PK
        ObjectId userId FK,UK "one cart per user, authenticated only"
    }

    CART_ITEM {
        ObjectId productId FK
        number quantity
        Date addedAt
    }

    ORDER {
        ObjectId id PK
        string orderNumber UK "BTNN-YYYYMMDD-NNN"
        ObjectId customerId FK
        ObjectId userId FK "nullable"
        string channel "online | pos"
        string status "pending|confirmed|shipping|completed|cancelled"
        string voucherCode "string, not a ref"
        number total
        number printCount
    }

    ORDER_ITEM {
        string productSnapshot "copied, immutable — not a ref"
        number unitPrice
        number quantity
        number subtotal
    }

    VOUCHER {
        ObjectId id PK
        string code UK
        string type "percentage | fixed"
        number value
        number usedCount
        number perUserLimit
    }

    POST_CATEGORY {
        ObjectId id PK
        string name
        string slug UK
    }

    POST {
        ObjectId id PK
        string title
        string slug UK
        ObjectId categoryId FK "sparse, optional"
        string status "draft | published"
        Date publishedAt
    }

    USER ||--o| CUSTOMER : "linked on register (userId)"
    USER ||--o| CART : "one server cart, auth only"
    USER ||--o{ ORDER : "userId (nullable)"

    CUSTOMER ||--o{ ORDER : "customerId (required)"

    CATEGORY ||--o{ PRODUCT : "categoryId"

    PRODUCT ||--o{ CART_ITEM : "productId"
    CART ||--o{ CART_ITEM : "items[]"

    PRODUCT ||--o{ ORDER_ITEM : "copied into productSnapshot at write time"
    ORDER ||--o{ ORDER_ITEM : "items[]"

    VOUCHER |o..o{ ORDER : "voucherCode (String, not populated)"

    POST_CATEGORY ||--o{ POST : "categoryId"
    POST }o--o{ PRODUCT : "relatedProductIds[]"
```

## Reading this diagram

- **Solid lines (`||--o{`, `||--o|`)** are real Mongoose `ref`s — the referenced document can be populated.
- **Dotted line (`..o{`)** from `VOUCHER` to `ORDER` is deliberately not a `ref`: `Order.voucherCode` is a plain string, not an ObjectId, so a voucher can be deleted without needing to touch historical orders.
- **`ORDER_ITEM.productSnapshot`** is drawn as a relationship for readability, but it is a **copied value, not a live reference** — this is the single most important rule in the whole schema (`docs/system/SRS.md` §6, rule 5). An order's line items must read the same a year from now even if the product's name, price, or images change or the product is deleted entirely.
- **`CART`** only exists for authenticated users. A guest's cart lives in the storefront's browser storage and is never written to this collection — there is no "guest cart" entity in the database at all.
- **`CUSTOMER`** is the identity root for purchase history, not `USER`. `Customer.userId` starts `null` and is only set once the phone number's owner registers or logs in — this is what makes guest checkout compatible with a "customer" admin view (SRS D5).
