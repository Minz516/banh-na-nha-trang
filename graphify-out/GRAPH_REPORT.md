# Graph Report - .  (2026-07-31)

## Corpus Check
- 34 files · ~86,913 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1545 nodes · 1960 edges · 121 communities (109 shown, 12 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.76)
- Token cost: 52,018 input · 0 output

## Community Hubs (Navigation)
- admin/.oxlintrc
- blog/blog.model
- admin/package
- api/package
- skills/TASTE
- server/API_CONTRACT
- src/blog.schema
- system/SRS
- api/package
- storefront/tsconfig
- system/implementation_plan
- system/SEO_CONTEXT
- turbo
- order/order.model
- api/tsconfig
- admin/tsconfig.app
- middlewares/authMiddleware
- customer/customer.controller
- system/SRS
- admin/tsconfig.node
- components/ContactWidget
- package
- src/order.schema
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- storefront/package
- shared-types/package
- skills/DESIGN_RULES
- app/page
- storefront/package
- voucher/voucher.model
- system/BUILD_PLAN
- shared-types/tsconfig
- middlewares/errorMiddleware
- checkout/page
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- CLAUDE
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- server/BACKEND_REBUILD_PROMPT
- src/voucher.schema
- skills/TASTE
- server/MODELS
- stores/cartStore
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- system/NOTE
- src/app
- catalog/catalog.dto
- utils/eventBus
- data/mock-catalog
- skills/DESIGN_RULES
- skills/TASTE
- skills/TASTE
- config/multer.config
- [slug]/page
- storefront/package
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- README
- [slug]/page
- components/AddToCartButton
- components/Header
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/TASTE
- src/common.schema
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- skills/DESIGN_RULES
- skills/TASTE
- skills/TASTE
- skills/TASTE
- src/auth.schema
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- CLAUDE
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/DESIGN_RULES
- skills/TASTE
- skills/TASTE
- skills/TASTE
- skills/TASTE
- src/customer.schema
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- ARCHITECTURE_BLUEPRINT_GREENFIELD
- skills/DESIGN_RULES
- skills/TASTE
- src/media.schema
- admin/tsconfig
- storefront/AGENTS
- storefront/eslint.config
- storefront/package
- storefront/package
- storefront/package
- storefront/package
- storefront/package
- storefront/postcss.config
- admin/vite.config
- blog/blog.dto
- blog/blog.events
- media/media.dto
- media/media.interfaces
- order/order.dto
- system/SRS
- Products.tsx
- Store.tsx
- SRS D8 Bluetooth Printing (Out of Scope)

## God Nodes (most connected - your core abstractions)
1. `DESIGN.md` - 31 edges
2. `react` - 24 edges
3. `compilerOptions` - 18 edges
4. `compilerOptions` - 18 edges
5. `compilerOptions` - 16 edges
6. `6. Component Language` - 16 edges
7. `tasteskill: Anti-Slop Frontend Skill` - 16 edges
8. `compilerOptions` - 15 edges
9. `Appendix B - Canonical Sources (read these before reinventing)` - 15 edges
10. `CatalogAPI` - 15 edges

## Surprising Connections (you probably didn't know these)
- `Route → Controller → Service → Repository → Model module pattern` --implements--> `API module: auth`  [EXTRACTED]
  ARCHITECTURE_BLUEPRINT_GREENFIELD.md → docs/system/SRS.md
- `Route → Controller → Service → Repository → Model module pattern` --implements--> `API module: cart`  [EXTRACTED]
  ARCHITECTURE_BLUEPRINT_GREENFIELD.md → docs/system/SRS.md
- `Route → Controller → Service → Repository → Model module pattern` --implements--> `API module: media`  [EXTRACTED]
  ARCHITECTURE_BLUEPRINT_GREENFIELD.md → docs/system/SRS.md
- `HomePage()` --references--> `CatalogAPI`  [EXTRACTED]
  apps/storefront/app/page.tsx → apps/storefront/lib/api/server-public.ts
- `ProductsPage()` --references--> `CatalogAPI`  [EXTRACTED]
  apps/storefront/app/products/page.tsx → apps/storefront/lib/api/server-public.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Gaps between docs and running code** — claude_md_no_cart_api_module, claude_md_no_customer_auth_gap, claude_md_no_role_middleware, claude_md_mock_catalog_ts_removed [INFERRED 0.80]
- **Order event lifecycle via eventBus** — claude_md_event_bus_ts, claude_md_order_placed_event, claude_md_order_cancelled_event [INFERRED 0.85]
- **Admin catalog CRUD UI components** — claude_md_products_tsx, claude_md_product_form_modal_tsx, claude_md_catalog_types_ts [INFERRED 0.85]
- **Cart gap: docs described a cart module that was never built, replaced by client-side store** — docs_server_api_contract_cart_not_implemented, packages_shared_types_src_cart_schema, docs_system_srs_md, architecture_blueprint_greenfield_md, apps_storefront_stores_cart_store_ts, docs_server_api_contract_order_module [INFERRED 0.85]
- **Order lifecycle: statuses, transitions, stock decrement, and order numbering form one cohesive checkout flow** — docs_server_api_contract_order_module, docs_server_api_contract_order_statuses, docs_server_api_contract_order_transitions, docs_server_api_contract_stock_decrement_rule, docs_server_api_contract_order_number_format [INFERRED 0.85]
- **Auth model: JWT cookie mechanism, role-gating gap, and token-error handling together define the security posture** — docs_server_api_contract_authentication, docs_server_api_contract_admin_route_shape_gap, docs_server_api_contract_verifytoken_vs_optionalverifytoken, apps_api_src_middlewares_auth_middleware_ts [INFERRED 0.80]
- **Three deployable apps (api, storefront, admin) sharing one packages/shared-types package via pnpm workspace** — architecture_blueprint_greenfield, docs_system_implementation_plan, pnpm_workspace, claude [INFERRED 0.85]
- **Eight API modules (auth, customer, catalog, cart, order, voucher, blog, media) all following the same eight-file route→controller→service→repository→model→dto→interfaces→events structure** — api_module_auth, api_module_customer, api_module_catalog, api_module_cart, api_module_order, api_module_voucher, api_module_blog, api_module_media [EXTRACTED 1.00]

## Communities (121 total, 12 thin omitted)

### Community 0 - "admin/.oxlintrc"
Cohesion: 0.05
Nodes (49): apps/admin (Vite + React 19 SPA), apps/admin/src/App.tsx (router), apps/api (Express v5 + MongoDB), docs/server/API_CONTRACT.md, API module structure (routes/controller/service/repository/model), apps/api/src/app.ts, ARCHITECTURE_BLUEPRINT_GREENFIELD.md, Bánh Tráng Nhà Na (ecommerce project) (+41 more)

### Community 1 - "blog/blog.model"
Cohesion: 0.06
Nodes (45): multer.config.ts, order.service.ts, apps/api/src/app.ts, apps/api/src/middlewares/authMiddleware.ts, apps/api/src/middlewares/errorMiddleware.ts, apps/api/src/modules (module directories), apps/storefront stores/cartStore.ts, ARCHITECTURE_BLUEPRINT_GREENFIELD.md (+37 more)

### Community 2 - "admin/package"
Cohesion: 0.05
Nodes (43): dependencies, axios, lucide-react, react, react-dom, react-router-dom, @repo/shared-types, zustand (+35 more)

### Community 3 - "api/package"
Cohesion: 0.05
Nodes (41): dependencies, bcrypt, cloudinary, cookie-parser, cors, express, express-rate-limit, @fontsource/noto-sans (+33 more)

### Community 4 - "skills/TASTE"
Cohesion: 0.05
Nodes (39): Anti-Default Discipline (reject AI-purple gradients, generic hero patterns), APPENDICES - Real Source-Backed Reference Material, Appendix A - Install Commands per Design System, Appendix B - Canonical Sources (read these before reinventing), Appendix C - Apple Liquid Glass: Honest Web Approximation, Apple Liquid Glass (Apple platforms only), Atlassian, Bootstrap (+31 more)

### Community 5 - "server/API_CONTRACT"
Cohesion: 0.11
Nodes (28): connectDB(), disconnectDB(), BlogInterfaces, coverImageSchema, ICoverImage, IPost, IPostCategory, PostCategoryModel (+20 more)

### Community 6 - "src/blog.schema"
Cohesion: 0.05
Nodes (36): CoverImage, coverImageSchema, CreatePostBody, createPostBodySchema, CreatePostCategoryBody, createPostCategoryBodySchema, Post, PostCategory (+28 more)

### Community 7 - "system/SRS"
Cohesion: 0.08
Nodes (23): OrderInterfaces, customerSnapshotSchema, ICustomerSnapshot, IOrder, IOrderItem, IProductSnapshot, IStatusHistoryEntry, orderItemSchema (+15 more)

### Community 8 - "api/package"
Cohesion: 0.08
Nodes (25): CancelOrderModal(), Props, PageHeader(), Props, Props, StatCard(), Tone, TONE_CLASSES (+17 more)

### Community 9 - "storefront/tsconfig"
Cohesion: 0.10
Nodes (31): API module: auth, API module: blog, API module: cart, API module: catalog, API module: customer, API module: media, API module: order, API module: voucher (+23 more)

### Community 10 - "system/implementation_plan"
Cohesion: 0.07
Nodes (29): devDependencies, jest, mongodb-memory-server, supertest, ts-jest, tsx, @types/bcrypt, @types/cookie-parser (+21 more)

### Community 11 - "system/SEO_CONTEXT"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 12 - "turbo"
Cohesion: 0.07
Nodes (28): App Routes (per §4.1 + §7.1), Automated, Components, Config, Execution Order, Implementation Plan — Bánh Tráng Nhà Na (Greenfield Build), Lib Layer, Manual (+20 more)

### Community 13 - "order/order.model"
Cohesion: 0.07
Nodes (28): 1. Business goal, 2. Root problem: a React SPA cannot rank, 3.1 Indexed pages (SEO priority), 3.2 `noindex` pages (no search value), 3.3 Changes from the current routing, 3. Target sitemap, 4.1 Product URLs stay flat, 4.2 The blog lives at `/blog`, not on a subdomain (+20 more)

### Community 14 - "api/tsconfig"
Cohesion: 0.08
Nodes (26): ^build, coverage/**, .env*, ^lint, !.next/cache/**, $TURBO_DEFAULT$, ^typecheck, dependsOn (+18 more)

### Community 15 - "admin/tsconfig.app"
Cohesion: 0.08
Nodes (24): compilerOptions, declaration, declarationMap, esModuleInterop, forceConsistentCasingInFileNames, lib, module, moduleResolution (+16 more)

### Community 16 - "middlewares/authMiddleware"
Cohesion: 0.08
Nodes (23): compilerOptions, allowArbitraryExtensions, allowImportingTsExtensions, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+15 more)

### Community 17 - "customer/customer.controller"
Cohesion: 0.15
Nodes (15): FONT_LATIN_BOLD, FONT_LATIN_REGULAR, FONT_VIET_BOLD, FONT_VIET_REGULAR, FontRun, pdfCurrency, require, truncateRuns() (+7 more)

### Community 18 - "system/SRS"
Cohesion: 0.09
Nodes (19): This is NOT the Next.js you know, Admin CRUD missing — only Orders tab functional, Products/Customers/Store placeholders, Domain integration readiness — cloud services ready, no deploy config yet, hardcoded secrets must be rotated, 1. Tích hợp tên miền, 2. Có bán được hàng không, Chặn bán hàng thực sự — không tự vận hành được, Kết luận ngắn gọn, NOTE.md — Đánh giá khả năng tích hợp domain & bán hàng thực tế (+11 more)

### Community 19 - "admin/tsconfig.node"
Cohesion: 0.09
Nodes (22): 1. What the system is, 3.1 `User`, 3.2 `Customer`, 3.3 `Category`, 3.4 `Product`, 3.5 `Cart`, 3.6 `Order`, 3.7 `Voucher` (+14 more)

### Community 20 - "components/ContactWidget"
Cohesion: 0.10
Nodes (19): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, noEmit, noFallthroughCasesInSwitch (+11 more)

### Community 21 - "package"
Cohesion: 0.10
Nodes (19): devDependencies, turbo, engines, node, pnpm, turbo, name, packageManager (+11 more)

### Community 22 - "src/order.schema"
Cohesion: 0.10
Nodes (19): Order, OrderItem, orderItemSchema, OrderLookupBody, orderLookupBodySchema, OrderQuery, orderQuerySchema, orderSchema (+11 more)

### Community 23 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.19
Nodes (13): apps/admin/index.html, Bug: catalog.dto.js calls undefined productDto instead of catalogDto, Bug: httpHelper.js uses require() and window.location.href inside ESM/SSR context, CSR + noindex,nofollow route groups (shop)/(auth)/account, ISR rendering strategy (catalog/blog routes), SSR rendering strategy (/products filter route), Open question — junk-order protection, Open question — staff role for POS orders (+5 more)

### Community 24 - "storefront/package"
Cohesion: 0.18
Nodes (15): CoverImage, PostCategoryRow, PostFormBody, PostRow, PostStatus, escapeHtml(), inline(), renderMarkdownPreview() (+7 more)

### Community 25 - "shared-types/package"
Cohesion: 0.22
Nodes (11): AuthDTO, IUser, UserModel, userSchema, AuthRepository, AuthService, clearTokenCookies(), issueTokenCookies() (+3 more)

### Community 26 - "skills/DESIGN_RULES"
Cohesion: 0.18
Nodes (12): createApp(), configureCloudinary(), envSchema, _parsed, main(), debugLogMiddleware(), errorMiddleware(), router (+4 more)

### Community 27 - "app/page"
Cohesion: 0.29
Nodes (10): Express, optionalVerifyToken(), Request, verifyToken(), apiRateLimit, checkoutRateLimit, publicRateLimit, AuthInterfaces (+2 more)

### Community 28 - "storefront/package"
Cohesion: 0.12
Nodes (17): devDependencies, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react, @types/react-dom (+9 more)

### Community 29 - "voucher/voucher.model"
Cohesion: 0.12
Nodes (16): dependencies, zod, devDependencies, typescript, exports, typescript, zod, main (+8 more)

### Community 30 - "system/BUILD_PLAN"
Cohesion: 0.12
Nodes (16): 6.10 Checkout, 6.11 Forms, 6.12 Dialogs / Modals, 6.13 Badges, 6.14 Reviews, 6.15 Admin Dashboard, 6.1 Radius Scale, 6.2 Elevation / Shadow (+8 more)

### Community 31 - "shared-types/tsconfig"
Cohesion: 0.17
Nodes (8): router, NAV_ITEMS, Sidebar(), Blog(), CategoryListEnvelope, PostListEnvelope, StatusFilter, react

### Community 32 - "middlewares/errorMiddleware"
Cohesion: 0.17
Nodes (9): metadata, newsreader, publicSans, Footer(), Header(), NAV_LINKS, HeaderShell(), MobileNav() (+1 more)

### Community 33 - "checkout/page"
Cohesion: 0.19
Nodes (8): HomePage(), metadata, TRUST_SIGNALS, VALUES, JsonLd(), siteMetadata, nextConfig, .next/**

### Community 34 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.13
Nodes (15): dependencies, jose, react-dom, rehype-sanitize, rehype-stringify, remark, zod, zustand (+7 more)

### Community 35 - "CLAUDE"
Cohesion: 0.24
Nodes (9): ProductFormModal(), Props, CategoryRow, ProductFormBody, ProductImage, ProductRow, ListEnvelope, Products() (+1 more)

### Community 36 - "skills/DESIGN_RULES"
Cohesion: 0.25
Nodes (10): Props, toDateInput(), VoucherFormModal(), VoucherFormBody, VoucherRow, voucherStatus(), VoucherType, ListEnvelope (+2 more)

### Community 37 - "skills/DESIGN_RULES"
Cohesion: 0.14
Nodes (14): Architectural boundary, Build Plan — Next.js storefront, Carried over from the old storefront, Definition of done, Open questions for the shop owner, Out of scope this round, Phase 0 — Fix backend blockers, Phase 1 — Blog module (backend) (+6 more)

### Community 38 - "skills/DESIGN_RULES"
Cohesion: 0.14
Nodes (13): compilerOptions, composite, declaration, declarationMap, module, moduleResolution, outDir, rootDir (+5 more)

### Community 39 - "server/BACKEND_REBUILD_PROMPT"
Cohesion: 0.26
Nodes (7): registerCustomerEvents(), CustomerInterfaces, registerVoucherEvents(), VoucherInterfaces, AppEvent, AppEvents, EventBus

### Community 40 - "src/voucher.schema"
Cohesion: 0.23
Nodes (10): clamp(), ContactWidget(), Edge, positionFor(), SOCIAL_LINKS, FacebookIcon(), IconProps, InstagramIcon() (+2 more)

### Community 41 - "skills/TASTE"
Cohesion: 0.15
Nodes (13): 7.10 The three rules this build gets right from the start, 7.11 Core Web Vitals levers, 7.12 "Done" checklist, 7.1 Rendering strategy per route group, 7.2 Metadata correctness, 7.3 Structured data (JSON-LD), 7.4 Visible breadcrumbs, 7.5 Flat product URLs (+5 more)

### Community 42 - "server/MODELS"
Cohesion: 0.15
Nodes (13): 0. How to Use This Document, 23. AI Agent Instructions, 2. The 18 Timeless Design Principles, 4.1 Font Pairing, 4.2 Type Scale (mobile-first, rem @ 16px base), 4. Typography, 7. Motion, 8. Accessibility Checklist (applies to every generated screen) (+5 more)

### Community 43 - "stores/cartStore"
Cohesion: 0.15
Nodes (13): 16.10 FAQ, 16.11 Contact, 16.12 Reviews Page (full listing), 16.1 Landing / Homepage, 16.2 Product Listing (PLP), 16.3 Product Detail (PDP), 16.4 Cart, 16.5 Checkout (+5 more)

### Community 44 - "skills/DESIGN_RULES"
Cohesion: 0.15
Nodes (13): 17.10 Sticky Elements, 17.11 Cart Behavior, 17.12 Cross-Selling & Upselling, 17.1 Conversion Hierarchy, 17.2 Trust Hierarchy, 17.3 Checkout Psychology, 17.4 Product Comparison, 17.5 Pricing Hierarchy (+5 more)

### Community 45 - "skills/DESIGN_RULES"
Cohesion: 0.15
Nodes (12): CreateVoucherBody, createVoucherBodySchema, UpdateVoucherBody, updateVoucherBodySchema, ValidateVoucherBody, validateVoucherBodySchema, Voucher, voucherSchema (+4 more)

### Community 46 - "system/NOTE"
Cohesion: 0.21
Nodes (8): validateRequest(), authRateLimit, AuthController, router, BlogController, BlogService, OrderController, OrderService

### Community 47 - "src/app"
Cohesion: 0.26
Nodes (6): CatalogController, registerCatalogEvents(), CatalogInterfaces, CatalogRepository, router, CatalogService

### Community 48 - "catalog/catalog.dto"
Cohesion: 0.27
Nodes (7): BlogPage(), BlogPostPage(), generateMetadata(), sitemap(), BlogAPI, PostListResult, renderMarkdown()

### Community 49 - "utils/eventBus"
Cohesion: 0.26
Nodes (9): CollectionPage(), generateMetadata(), generateMetadata(), ProductDetailPage(), FALLBACK_IMAGE, ProductImageGallery(), Props, CatalogAPI (+1 more)

### Community 50 - "data/mock-catalog"
Cohesion: 0.17
Nodes (12): 4.10 Quotes & Testimonials, 4.11 Page Theme Lock (Light / Dark Mode Consistency), 4.1 Typography, 4.2 Color Calibration, 4.3 Layout Diversification, 4.4 Materiality, Shadows, Cards, 4.5 Interactive UI States, 4.6 Data & Form Patterns (+4 more)

### Community 51 - "skills/DESIGN_RULES"
Cohesion: 0.17
Nodes (12): Do not build, Ground rules, If something conflicts, Order of work, Prompt: Backend Rebuild, Step 1 — Read and report, Step 2 — Shared foundations, Step 3 — Models (+4 more)

### Community 52 - "skills/TASTE"
Cohesion: 0.17
Nodes (12): 10. Model relationships, 1. User, 2. Customer, 3. Category, 4. Product, 5. Cart, 6. Order, 7. Voucher (+4 more)

### Community 53 - "skills/TASTE"
Cohesion: 0.29
Nodes (7): CartPage(), CartBadge(), ProductDetailAddToCart(), Props, CartItem, CartState, useCartStore

### Community 54 - "config/multer.config"
Cohesion: 0.18
Nodes (11): 21.10 Color Blindness, 21.1 Keyboard Navigation, 21.2 Focus Management, 21.3 Screen Readers, 21.4 Touch Ergonomics, 21.5 Vietnamese Readability, 21.6 Older or Less Tech-Confident Users, 21.7 Contrast Philosophy (+3 more)

### Community 55 - "[slug]/page"
Cohesion: 0.18
Nodes (11): 3.10 Dark Mode, 3.1 Primary Palette, 3.2 Backgrounds & Surfaces, 3.3 Borders & Structure, 3.4 Text, 3.5 Semantic / Status, 3.6 Commerce-Specific, 3.7 Badge / Category / Tag Colors (+3 more)

### Community 56 - "storefront/package"
Cohesion: 0.20
Nodes (10): 18.1 Radius, 18.2 Shadow / Elevation, 18.3 Opacity Scale, 18.4 Z-Index Scale, 18.5 Blur, 18.6 Spacing / Container / Grid / Breakpoints, 18.7 Animation / Timing / Transition Curves, 18.8 Border & Stroke Widths (+2 more)

### Community 57 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.20
Nodes (10): 10. REFERENCE VOCABULARY (Pattern Names the Agent Should Know), Animation Library Choice, Cards & Containers, Galleries & Media, Hero Paradigms, Layout & Grids, Micro-Interactions & Effects, Navigation & Menus (+2 more)

### Community 58 - "skills/DESIGN_RULES"
Cohesion: 0.20
Nodes (10): 13. OUT OF SCOPE, 14. FINAL PRE-FLIGHT CHECK, 1.A Dial Inference (design read → dial values), 1.B Use-Case Presets, 1.C How the Dials Drive Output, 1. THE THREE DIALS (Core Configuration), 2.A When to reach for a real design system (use official packages), 2.B When the brief is an aesthetic, not a system (+2 more)

### Community 59 - "skills/DESIGN_RULES"
Cohesion: 0.22
Nodes (8): plugins, rules, react/only-export-components, react/rules-of-hooks, $schema, oxc, typescript, warn

### Community 60 - "skills/DESIGN_RULES"
Cohesion: 0.22
Nodes (6): CustomerOrderRow, CustomerRow, Customers(), ListEnvelope, OrderDetailRow, OrderItem

### Community 61 - "README"
Cohesion: 0.28
Nodes (5): ALLOWED_MIME_TYPES, upload, AppError, MediaController, router

### Community 62 - "[slug]/page"
Cohesion: 0.22
Nodes (8): name, private, scripts, build, dev, lint, start, version

### Community 63 - "components/AddToCartButton"
Cohesion: 0.22
Nodes (9): 6. Scaffolding Instructions (For AI), Phase 1 — Initialize the workspace, Phase 2 — `packages/shared-types`, Phase 3 — `apps/api`, Phase 4 — `apps/storefront`, Phase 5 — `apps/admin`, Phase 6 — Cross-cutting concerns, Phase 7 — Structured data and breadcrumbs (+1 more)

### Community 64 - "components/Header"
Cohesion: 0.22
Nodes (9): 10.1 Brand Archetype, 10.2 Brand Personality (Big Five mapping), 10.3 Brand Values (in priority order), 10.4 Brand Voice & Tone, 10.5 Emotional Hierarchy, 10.6 How the Interface Should Behave, 10.7 How the Interface Should NEVER Behave, 10.8 If This Brand Were a Person (+1 more)

### Community 65 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.22
Nodes (9): 22.1 New Product Categories, 22.2 Seasonal Campaigns (e.g., Tết/Lunar New Year), 22.3 Dark Mode, 22.4 Internationalization, 22.5 Admin Expansion, 22.6 Loyalty Programs, 22.7 Membership Tiers, 22.8 Future Branding Updates (+1 more)

### Community 66 - "skills/DESIGN_RULES"
Cohesion: 0.22
Nodes (9): 25.1 Ownership, 25.2 What Requires a Version Bump, 25.3 What Does Not Require a Version Bump, 25.4 Change Threshold, 25.5 Deprecation, Not Deletion, 25.6 Section Numbering Stability, 25.7 Conflict Resolution, 25.8 Who This Document Serves, in Priority Order (+1 more)

### Community 67 - "skills/DESIGN_RULES"
Cohesion: 0.25
Nodes (6): BillOrder, CartLine, ListEnvelope, PaymentMethod, POS_PAYMENT_LABELS, Store()

### Community 68 - "skills/DESIGN_RULES"
Cohesion: 0.32
Nodes (5): ProductsPage(), AddToCartButton(), Props, currency, ProductCard()

### Community 69 - "skills/DESIGN_RULES"
Cohesion: 0.25
Nodes (8): 3.1 API patterns — the shape every module follows from its first commit, 3.2 Server Component page + Client Component island, 3.3 Dual data-fetching lane pattern, 3.4 Guest cart, hydration-safe from the start, 3.5 Cross-origin cookies — two apps, two strategies, 3.6 Route protection pattern, 3.7 Naming conventions, 3. Design Patterns & Conventions

### Community 70 - "skills/DESIGN_RULES"
Cohesion: 0.25
Nodes (8): 11.1 Lighting, 11.2 Camera Angle, 11.3 Cropping & Composition, 11.4 Texture Signals to Capture Deliberately, 11.5 Props & Environment, 11.6 Photography by Placement, 11.7 Explicitly Rejected Photography Styles, 11. Photography Direction

### Community 71 - "skills/DESIGN_RULES"
Cohesion: 0.25
Nodes (8): 12.1 Image Ratios by Context, 12.2 Corner Radius on Images, 12.3 Image Padding, 12.4 Hover Effects, 12.5 Loading States, 12.6 Fallback States, 12.7 Compression & Mobile Optimization, 12. Image Treatment

### Community 72 - "skills/TASTE"
Cohesion: 0.25
Nodes (8): 19.1 Mobile-First Foundation, 19.2 Tablet Expansion, 19.3 Desktop Expansion, 19.4 Large Monitor Behavior (>1440px), 19.5 Component Adaptation Examples, 19.6 Touch Targets & Safe Areas, 19.7 Foldable Devices, 19. Responsive Philosophy

### Community 73 - "src/common.schema"
Cohesion: 0.25
Nodes (8): 20.1 Motion Philosophy Restated, 20.2 Scroll Behavior, 20.3 Page Transitions, 20.4 Drawer & Bottom Sheet Motion, 20.5 Drag Behavior, 20.6 Parallax Policy, 20.7 What Should Never Animate, 20. Motion Language (Expanded)

### Community 74 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.25
Nodes (8): 24.1 Color, 24.2 Radius, 24.3 Shadow, 24.4 Spacing, 24.5 Typography, 24.6 Motion, 24.7 Implementation Note for Agents, 24. Tailwind Mapping

### Community 75 - "skills/DESIGN_RULES"
Cohesion: 0.25
Nodes (8): 26.1 Card + Badge + Rating + Price (Product Card, full stack), 26.2 Sticky CTA + Trust Signal + Navigation (Mobile PDP, full stack), 26.3 Discount Badge + Sale Price + Strikethrough (Pricing, full stack), 26.4 Empty State + Cross-Sell (Cart Empty, Search Empty), 26.5 Modal/Sheet + Scrim + Sticky Element Interaction, 26.6 Review Verified-Badge + Star Rating + Photo, 26.7 Priority Rule When Two Guidelines Genuinely Compete, 26. Component Relationship & Cross-Reference Rules

### Community 76 - "skills/TASTE"
Cohesion: 0.25
Nodes (8): 9.A Visual & CSS, 9. AI TELLS (Forbidden Patterns), 9.B Typography, 9.C Layout & Spacing, 9.D Content & Data ("Jane Doe" Effect), 9.E External Resources & Components, 9.F Production-Test Tells (banned outright), 9.G EM-DASH BAN (the single most-violated Tell)

### Community 77 - "skills/TASTE"
Cohesion: 0.25
Nodes (6): ErrorResponse, errorResponseSchema, PaginationMeta, paginationMetaSchema, PaginationQuery, paginationQuerySchema

### Community 78 - "skills/TASTE"
Cohesion: 0.29
Nodes (5): currency, FormState, INITIAL_FORM, OrderResponse, VoucherValidationResult

### Community 79 - "src/auth.schema"
Cohesion: 0.38
Nodes (4): apiClient, fetchBase(), getBaseUrl(), ApiError

### Community 80 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.29
Nodes (7): 2.1 Storefront hybrid-rendering flow, 2.2 Route groups mapped to the sitemap, 2.3 API modules (`SRS.md` §4), 2. System Architecture, 8. Production-Readiness Checklist, 9. Portability Notes, Architecture Blueprint — Bánh Tráng Nhà Na (Greenfield Build)

### Community 81 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.33
Nodes (3): Bug: invalid HTTP statusCode 211 used instead of 201, Entity-Relationship Diagram — Bánh Tráng Nhà Na, Reading this diagram

### Community 82 - "CLAUDE"
Cohesion: 0.29
Nodes (7): 13.1 Icon Philosophy, 13.2 Style Specification, 13.3 Sizing, 13.4 Spacing, 13.5 Interaction Rules, 13.6 Semantic Icon Meaning (must stay consistent site-wide), 13. Iconography System

### Community 83 - "skills/DESIGN_RULES"
Cohesion: 0.29
Nodes (7): 11.A Detect the Mode (first action), 11.B Audit Before Touching, 11.C Preservation Rules, 11.D Modernisation Levers (priority order), 11.E Decision Tree: Targeted Evolution vs Full Redesign, 11.F What Never Changes Silently, 11. REDESIGN PROTOCOL

### Community 84 - "skills/DESIGN_RULES"
Cohesion: 0.29
Nodes (7): 3.A Stack, 3.B State, 3.C Icons, 3.D Emoji Policy, 3. DEFAULT ARCHITECTURE & CONVENTIONS, 3.E Responsiveness & Layout Mechanics, 3.F Dependency Verification (mandatory)

### Community 85 - "skills/DESIGN_RULES"
Cohesion: 0.29
Nodes (7): 6.A Hardware Acceleration, 6.B Reduced Motion (mandatory), 6.C Dark Mode (mandatory for any consumer-facing page), 6.D Core Web Vitals Targets, 6.E DOM Cost, 6.F Z-Index Restraint, 6. PERFORMANCE & ACCESSIBILITY GUARDRAILS

### Community 86 - "skills/TASTE"
Cohesion: 0.29
Nodes (6): AuthUser, authUserSchema, JwtPayload, jwtPayloadSchema, LoginBody, loginBodySchema

### Community 87 - "skills/TASTE"
Cohesion: 0.29
Nodes (4): GuestCartItem, guestCartItemSchema, UploadResponse, uploadResponseSchema

### Community 88 - "skills/TASTE"
Cohesion: 0.33
Nodes (6): 0.1 Backend language: TypeScript, 0.2 Workspace tooling: pnpm workspaces, Turborepo once it earns its keep, 0.3 Admin panel stack: Vite + React + TypeScript SPA, 0.4 Where the requirement documents disagree, 0.5 Where the reference blueprint's shape doesn't map cleanly, 0. Foundational Decisions

### Community 89 - "skills/TASTE"
Cohesion: 0.40
Nodes (5): 1.1 Storefront — `apps/storefront`, 1.2 API — `apps/api`, 1.3 Admin panel — `apps/admin`, 1.4 Workspace layout, 1. Tech Stack Overview

### Community 90 - "src/customer.schema"
Cohesion: 0.40
Nodes (5): 15.1 Overall Density Philosophy, 15.2 Whitespace Amount by Context, 15.3 Reading Rhythm, 15.4 Mobile vs. Desktop Rhythm, 15. Visual Density

### Community 91 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.40
Nodes (5): 1.1 What this brand is, 1.2 What this brand is NOT, 1.3 The emotional target, 1.4 Core design thesis, 1. Brand Philosophy

### Community 92 - "ARCHITECTURE_BLUEPRINT_GREENFIELD"
Cohesion: 0.40
Nodes (5): 5.1 Base Unit, 5.2 Spacing Scale, 5.3 Grid & Containers, 5.4 Section & Component Rhythm, 5. Spacing & Grid

### Community 93 - "skills/DESIGN_RULES"
Cohesion: 0.40
Nodes (5): 0.A Read these signals first, 0.B Output a one-line "Design Read" before generating, 0. BRIEF INFERENCE (Read the Room Before Anything Else), 0.C If the brief is ambiguous, ask one question, do not guess, 0.D Anti-Default Discipline

### Community 94 - "skills/TASTE"
Cohesion: 0.40
Nodes (5): 12.A File Location, 12.B Required Frontmatter, 12.C Required Body Sections, 12.D Block-Library Discipline, 12. THE BLOCK LIBRARY (Contract - Implementations Land Here Iteratively)

### Community 95 - "src/media.schema"
Cohesion: 0.40
Nodes (5): 5.A Sticky-Stack - Canonical Skeleton, 5.B Horizontal-Pan - Canonical Skeleton, 5.C Scroll-Reveal Stagger - Canonical Skeleton (lighter alternative), 5. CONTEXT-AWARE PROACTIVITY, 5.D Forbidden Animation Patterns

### Community 96 - "admin/tsconfig"
Cohesion: 0.40
Nodes (5): 8.A Token Strategy (pick one, stick to it), 8.B Do Not Prescribe Specific Colors Here, 8.C Default Mode, 8.D Test in Both Modes Before Finishing, 8. DARK MODE PROTOCOL

### Community 97 - "storefront/AGENTS"
Cohesion: 0.40
Nodes (4): Customer, customerSchema, CustomerSnapshot, customerSnapshotSchema

### Community 98 - "storefront/eslint.config"
Cohesion: 0.50
Nodes (3): IOrderCounter, OrderCounterModel, orderCounterSchema

### Community 99 - "storefront/package"
Cohesion: 0.50
Nodes (4): 4.1 `apps/storefront/src/`, 4.2 `apps/api/src/` — one module shown as the pattern every module follows, 4.3 `apps/admin/src/`, 4. Folder & Module Structure

### Community 100 - "storefront/package"
Cohesion: 0.50
Nodes (4): 5.1 Storefront, 5.2 API (`SRS.md` §4/§5), 5.3 Admin panel, 5. Module Responsibilities

### Community 101 - "storefront/package"
Cohesion: 0.50
Nodes (4): 14.1 Philosophy, 14.2 Style Direction, 14.3 Illustration Use Cases, 14. Illustration System

### Community 102 - "storefront/package"
Cohesion: 0.50
Nodes (4): 7. DIAL DEFINITIONS (Technical Reference), DESIGN_VARIANCE (Level 1-10), MOTION_INTENSITY (Level 1-10), VISUAL_DENSITY (Level 1-10)

## Ambiguous Edges - Review These
- `DESIGN.MD` → `Premium-Consumer Palette Ban — beige/cream + brass/clay/oxblood + espresso banned as default`  [AMBIGUOUS]
  .claude/skills/TASTE.MD · relation: conceptually_related_to
- `Typography — Fraunces/Lora serif + Inter/Public Sans body pairing` → `Serif Discipline — serif display fonts strongly discouraged as default; Fraunces/Instrument_Serif banned`  [AMBIGUOUS]
  .claude/skills/TASTE.MD · relation: conceptually_related_to
- `Storefront rendering strategy (cacheable vs cookie-bearing separation)` → `storefront's own CLAUDE.md (imports AGENTS.md)`  [AMBIGUOUS]
  CLAUDE.md · relation: conceptually_related_to

## Knowledge Gaps
- **899 isolated node(s):** `$schema`, `typescript`, `oxc`, `react/rules-of-hooks`, `warn` (+894 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **12 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `DESIGN.MD` and `Premium-Consumer Palette Ban — beige/cream + brass/clay/oxblood + espresso banned as default`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Typography — Fraunces/Lora serif + Inter/Public Sans body pairing` and `Serif Discipline — serif display fonts strongly discouraged as default; Fraunces/Instrument_Serif banned`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **What is the exact relationship between `Storefront rendering strategy (cacheable vs cookie-bearing separation)` and `storefront's own CLAUDE.md (imports AGENTS.md)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `react` connect `shared-types/tsconfig` to `middlewares/errorMiddleware`, `checkout/page`, `CLAUDE`, `skills/DESIGN_RULES`, `skills/DESIGN_RULES`, `skills/DESIGN_RULES`, `api/package`, `src/voucher.schema`, `skills/TASTE`, `utils/eventBus`, `skills/TASTE`, `storefront/package`, `skills/DESIGN_RULES`, `skills/DESIGN_RULES`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `DESIGN.md` connect `server/MODELS` to `skills/TASTE`, `system/BUILD_PLAN`, `stores/cartStore`, `skills/DESIGN_RULES`, `config/multer.config`, `[slug]/page`, `storefront/package`, `components/Header`, `ARCHITECTURE_BLUEPRINT_GREENFIELD`, `skills/DESIGN_RULES`, `skills/DESIGN_RULES`, `skills/DESIGN_RULES`, `skills/TASTE`, `src/common.schema`, `ARCHITECTURE_BLUEPRINT_GREENFIELD`, `skills/DESIGN_RULES`, `CLAUDE`, `src/customer.schema`, `ARCHITECTURE_BLUEPRINT_GREENFIELD`, `ARCHITECTURE_BLUEPRINT_GREENFIELD`, `storefront/package`?**
  _High betweenness centrality (0.028) - this node is a cross-community bridge._
- **Why does `Cart — not implemented` connect `blog/blog.model` to `skills/TASTE`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `typescript`, `oxc` to the rest of the system?**
  _899 weakly-connected nodes found - possible documentation gaps or missing edges._