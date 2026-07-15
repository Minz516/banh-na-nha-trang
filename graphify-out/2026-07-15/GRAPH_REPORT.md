# Graph Report - .  (2026-07-15)

## Corpus Check
- 162 files · ~75,711 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 896 nodes · 1331 edges · 50 communities (41 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 10 edges (avg confidence: 0.82)
- Token cost: 178,181 input · 0 output

## Community Hubs (Navigation)
- Admin Panel UI Components
- API Bootstrap & Config
- DB Connection & Blog Model
- Storefront Public Pages
- Admin Package Dependencies
- API Package Dependencies
- Blog Zod Schema
- Order/Customer Event Bus
- Project Docs & Known Bugs
- Storefront Cart/Checkout UI
- API Test Tooling Deps
- Storefront tsconfig
- Turborepo Pipeline Config
- API Module Map (SRS)
- Shared-Types tsconfig
- Admin App tsconfig
- Customer PDF Export (Vietnamese fonts)
- Storefront Layout & Contact Widget
- Admin Node tsconfig
- Root Workspace Package Config
- Order Zod Schema
- Auth Module (API)
- Storefront Dev Dependencies
- Shared-Types Package Config
- Storefront Runtime Dependencies
- Voucher Module (API)
- Design System & Anti-Slop Rules
- API tsconfig
- Voucher Zod Schema
- Admin Oxlint Config
- Root Package Scripts
- Common/Error Zod Schema
- Auth Zod Schema
- Cart & Media Zod Schema
- Customer Zod Schema
- Storefront tsconfig References
- Storefront ESLint Config
- lucide-react (cross-app dep)
- next (cross-app dep)
- react (cross-app dep)
- remark-rehype (cross-app dep)
- @repo/shared-types (cross-app dep)
- PostCSS Config
- SRS D8 - Bluetooth Printing Out of Scope

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 18 edges
2. `compilerOptions` - 18 edges
3. `react` - 16 edges
4. `compilerOptions` - 16 edges
5. `compilerOptions` - 15 edges
6. `CatalogAPI` - 15 edges
7. `verifyToken()` - 11 edges
8. `useCartStore` - 11 edges
9. `compilerOptions` - 11 edges
10. `CLAUDE.md — Project Instructions` - 11 edges

## Surprising Connections (you probably didn't know these)
- `docs/client/DESIGN.MD — Premium Artisanal Narrative` --semantically_similar_to--> `DESIGN_RULES.MD — Bánh Tráng Nhà Na Design System v2.1`  [INFERRED] [semantically similar]
  docs/client/DESIGN.MD → .claude/skills/DESIGN_RULES.MD
- `Color System (chili-red primary, cream background, semantic tokens)` --semantically_similar_to--> `docs/client/DESIGN.MD — Premium Artisanal Narrative`  [INFERRED] [semantically similar]
  .claude/skills/DESIGN_RULES.MD → docs/client/DESIGN.MD
- `Gap: no cart API module — cart state lives client-side only` --conceptually_related_to--> `docs/server/API_CONTRACT.md`  [AMBIGUOUS]
  CLAUDE.md → docs/server/API_CONTRACT.md
- `Premium-Consumer Palette Ban — beige/cream + brass/clay/oxblood + espresso banned as default` --conceptually_related_to--> `docs/client/DESIGN.MD — Premium Artisanal Narrative`  [AMBIGUOUS]
  .claude/skills/TASTE.MD → docs/client/DESIGN.MD
- `Gap: storefront has no auth-gated surface (no middleware.ts, no (auth) group, no account pages)` --conceptually_related_to--> `docs/system/SRS.md — Software Requirements Specification`  [INFERRED]
  CLAUDE.md → docs/system/SRS.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **SRS.md Decisions D1–D8 resolving spec ambiguity for the rebuild** — docs_system_srs_d1_no_batch_tracking, docs_system_srs_d2_flat_products_no_variants, docs_system_srs_d3_order_status_enum, docs_system_srs_d4_atomic_stock_decrement, docs_system_srs_d5_customer_keyed_by_phone, docs_system_srs_d6_voucher_types, docs_system_srs_d7_invoice_printing_rule, docs_system_srs_d8_bluetooth_printing_out_of_scope [EXTRACTED 1.00]
- **Three deployable apps (api, storefront, admin) sharing one packages/shared-types package via pnpm workspace** — architecture_blueprint_greenfield, docs_system_implementation_plan, pnpm_workspace, claude [INFERRED 0.85]
- **Eight API modules (auth, customer, catalog, cart, order, voucher, blog, media) all following the same eight-file route→controller→service→repository→model→dto→interfaces→events structure** — api_module_auth, api_module_customer, api_module_catalog, api_module_cart, api_module_order, api_module_voucher, api_module_blog, api_module_media [EXTRACTED 1.00]

## Communities (50 total, 9 thin omitted)

### Community 0 - "Admin Panel UI Components"
Cohesion: 0.06
Nodes (40): AdminLayout(), App(), router, CancelOrderModal(), Props, EmptyState(), Props, PageHeader() (+32 more)

### Community 1 - "API Bootstrap & Config"
Cohesion: 0.08
Nodes (36): createApp(), configureCloudinary(), envSchema, _parsed, ALLOWED_MIME_TYPES, upload, main(), Express (+28 more)

### Community 2 - "DB Connection & Blog Model"
Cohesion: 0.09
Nodes (36): connectDB(), disconnectDB(), AppError, UserModel, BlogInterfaces, coverImageSchema, ICoverImage, IPost (+28 more)

### Community 3 - "Storefront Public Pages"
Cohesion: 0.08
Nodes (28): BlogPage(), BlogPostPage(), generateMetadata(), CollectionPage(), generateMetadata(), HomePage(), metadata, TRUST_SIGNALS (+20 more)

### Community 4 - "Admin Package Dependencies"
Cohesion: 0.05
Nodes (43): dependencies, axios, lucide-react, react, react-dom, react-router-dom, @repo/shared-types, zustand (+35 more)

### Community 5 - "API Package Dependencies"
Cohesion: 0.05
Nodes (41): dependencies, bcrypt, cloudinary, cookie-parser, cors, express, express-rate-limit, @fontsource/noto-sans (+33 more)

### Community 6 - "Blog Zod Schema"
Cohesion: 0.05
Nodes (36): CoverImage, coverImageSchema, CreatePostBody, createPostBodySchema, CreatePostCategoryBody, createPostCategoryBodySchema, Post, PostCategory (+28 more)

### Community 7 - "Order/Customer Event Bus"
Cohesion: 0.10
Nodes (24): CustomerInterfaces, OrderInterfaces, customerSnapshotSchema, ICustomerSnapshot, IOrder, IOrderItem, IProductSnapshot, IStatusHistoryEntry (+16 more)

### Community 8 - "Project Docs & Known Bugs"
Cohesion: 0.10
Nodes (32): apps/admin/index.html, apps/storefront/AGENTS.md, apps/storefront/CLAUDE.md, Bug: catalog.dto.js calls undefined productDto instead of catalogDto, Bug: httpHelper.js uses require() and window.location.href inside ESM/SSR context, Bug: invalid HTTP statusCode 211 used instead of 201, CLAUDE.md — Project Instructions, Admin CRUD missing — only Orders tab functional, Products/Customers/Store placeholders (+24 more)

### Community 9 - "Storefront Cart/Checkout UI"
Cohesion: 0.09
Nodes (22): CartPage(), CheckoutPage(), currency, FormState, INITIAL_FORM, OrderResponse, AddToCartButton(), Props (+14 more)

### Community 10 - "API Test Tooling Deps"
Cohesion: 0.07
Nodes (29): devDependencies, jest, mongodb-memory-server, supertest, ts-jest, tsx, @types/bcrypt, @types/cookie-parser (+21 more)

### Community 11 - "Storefront tsconfig"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 12 - "Turborepo Pipeline Config"
Cohesion: 0.08
Nodes (26): ^build, coverage/**, .env*, ^lint, !.next/cache/**, $TURBO_DEFAULT$, ^typecheck, dependsOn (+18 more)

### Community 13 - "API Module Map (SRS)"
Cohesion: 0.13
Nodes (25): API module: auth, API module: blog, API module: cart, API module: catalog, API module: customer, API module: media, API module: order, API module: voucher (+17 more)

### Community 14 - "Shared-Types tsconfig"
Cohesion: 0.08
Nodes (24): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+16 more)

### Community 15 - "Admin App tsconfig"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 16 - "Customer PDF Export (Vietnamese fonts)"
Cohesion: 0.15
Nodes (15): FONT_LATIN_BOLD, FONT_LATIN_REGULAR, FONT_VIET_BOLD, FONT_VIET_REGULAR, FontRun, pdfCurrency, require, truncateRuns() (+7 more)

### Community 17 - "Storefront Layout & Contact Widget"
Cohesion: 0.13
Nodes (15): metadata, newsreader, publicSans, clamp(), ContactWidget(), Edge, positionFor(), SOCIAL_LINKS (+7 more)

### Community 18 - "Admin Node tsconfig"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 19 - "Root Workspace Package Config"
Cohesion: 0.10
Nodes (19): devDependencies, turbo, engines, node, pnpm, turbo, name, packageManager (+11 more)

### Community 20 - "Order Zod Schema"
Cohesion: 0.10
Nodes (19): Order, OrderItem, orderItemSchema, OrderLookupBody, orderLookupBodySchema, OrderQuery, orderQuerySchema, orderSchema (+11 more)

### Community 21 - "Auth Module (API)"
Cohesion: 0.22
Nodes (11): AuthController, AuthDTO, IUser, userSchema, AuthRepository, AuthService, clearTokenCookies(), issueTokenCookies() (+3 more)

### Community 22 - "Storefront Dev Dependencies"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 23 - "Shared-Types Package Config"
Cohesion: 0.12
Nodes (16): dependencies, zod, devDependencies, typescript, exports, typescript, zod, main (+8 more)

### Community 24 - "Storefront Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, jose, react-dom, rehype-sanitize, rehype-stringify, remark, zod, zustand (+7 more)

### Community 25 - "Voucher Module (API)"
Cohesion: 0.27
Nodes (7): VoucherController, VoucherDTO, IVoucher, VoucherModel, voucherSchema, VoucherRepository, VoucherService

### Community 26 - "Design System & Anti-Slop Rules"
Cohesion: 0.19
Nodes (14): DESIGN_RULES.MD — Bánh Tráng Nhà Na Design System v2.1, TASTE.MD — Anti-Slop Frontend Skill, Anti-Default Discipline (reject AI-purple gradients, generic hero patterns), Brief Inference — reading the room before generating, Premium-Consumer Palette Ban — beige/cream + brass/clay/oxblood + espresso banned as default, Serif Discipline — serif display fonts strongly discouraged as default; Fraunces/Instrument_Serif banned, The Three Dials — DESIGN_VARIANCE / MOTION_INTENSITY / VISUAL_DENSITY, Brand Philosophy — Modern Editorial Food Commerce (+6 more)

### Community 27 - "API tsconfig"
Cohesion: 0.14
Nodes (13): compilerOptions, composite, declaration, declarationMap, module, moduleResolution, outDir, rootDir (+5 more)

### Community 28 - "Voucher Zod Schema"
Cohesion: 0.15
Nodes (12): CreateVoucherBody, createVoucherBodySchema, UpdateVoucherBody, updateVoucherBodySchema, ValidateVoucherBody, validateVoucherBodySchema, Voucher, voucherSchema (+4 more)

### Community 29 - "Admin Oxlint Config"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 30 - "Root Package Scripts"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 31 - "Common/Error Zod Schema"
Cohesion: 0.25
Nodes (6): ErrorResponse, errorResponseSchema, PaginationMeta, paginationMetaSchema, PaginationQuery, paginationQuerySchema

### Community 32 - "Auth Zod Schema"
Cohesion: 0.29
Nodes (6): AuthUser, authUserSchema, JwtPayload, jwtPayloadSchema, LoginBody, loginBodySchema

### Community 33 - "Cart & Media Zod Schema"
Cohesion: 0.29
Nodes (4): GuestCartItem, guestCartItemSchema, UploadResponse, uploadResponseSchema

### Community 34 - "Customer Zod Schema"
Cohesion: 0.40
Nodes (4): Customer, customerSchema, CustomerSnapshot, customerSnapshotSchema

## Ambiguous Edges - Review These
- `docs/client/DESIGN.MD — Premium Artisanal Narrative` → `Premium-Consumer Palette Ban — beige/cream + brass/clay/oxblood + espresso banned as default`  [AMBIGUOUS]
  .claude/skills/TASTE.MD · relation: conceptually_related_to
- `docs/server/API_CONTRACT.md` → `Gap: no cart API module — cart state lives client-side only`  [AMBIGUOUS]
  docs/server/API_CONTRACT.md · relation: conceptually_related_to
- `Typography — Fraunces/Lora serif + Inter/Public Sans body pairing` → `Serif Discipline — serif display fonts strongly discouraged as default; Fraunces/Instrument_Serif banned`  [AMBIGUOUS]
  .claude/skills/TASTE.MD · relation: conceptually_related_to

## Knowledge Gaps
- **400 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+395 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `docs/client/DESIGN.MD — Premium Artisanal Narrative` and `Premium-Consumer Palette Ban — beige/cream + brass/clay/oxblood + espresso banned as default`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `docs/server/API_CONTRACT.md` and `Gap: no cart API module — cart state lives client-side only`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Typography — Fraunces/Lora serif + Inter/Public Sans body pairing` and `Serif Discipline — serif display fonts strongly discouraged as default; Fraunces/Instrument_Serif banned`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `Admin Panel UI Components` to `Storefront Cart/Checkout UI`, `Storefront Public Pages`, `Admin Oxlint Config`, `Storefront Layout & Contact Widget`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `.next/**` connect `Storefront Public Pages` to `Storefront Layout & Contact Widget`, `Turborepo Pipeline Config`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `outputs` connect `Turborepo Pipeline Config` to `Storefront Public Pages`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _400 weakly-connected nodes found - possible documentation gaps or missing edges._