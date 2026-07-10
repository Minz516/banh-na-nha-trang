# DESIGN.md
### Bánh Tráng Nhà Na — Design System v2.0
**Status:** Authoritative. This document is the single source of truth for every AI-generated interface (Google Stitch, Taste Skill, Antigravity, Claude, Cursor, Copilot, and future coding agents).

> **Priority rule:** If Taste Skill, a component library, or any generation tool ever conflicts with this document, **this document wins.** Taste Skill may improve implementation quality (spacing precision, code cleanliness, micro-polish) but must never redefine color, type, layout philosophy, or brand voice.

### Changelog
- **v2.1** — Audit pass. Closed a broken cross-reference (v2.0's changelog promised a Section 25 Governance, which had not actually been written — it is now restored/expanded as Section 25). Added a Table of Contents for faster agent/human lookup across 25 sections. Added Section 26 (Component Relationship & Cross-Reference Rules) to make combinatorial rules — how a badge, card, sticky CTA, and trust signal behave *together* on the same screen — explicit rather than left for an agent to infer from separate sections. Clarified Dark Mode activation logic (3.10, 22.3) since the original spec fully defined the token *values* but not *when* dark mode should trigger, which was a genuine ambiguity an agent could resolve inconsistently. Added a "no search results" empty-state row to 14.3. **No v2.0 or v1.0 decision was altered, removed, or simplified** — every existing color, type, spacing, component, motion, photography, and accessibility rule remains exactly as specified.
- **v2.0** — Extended v1.0 with implementation-level depth: Brand DNA, Photography Direction, Image Treatment, Iconography, Illustration System, Visual Density, Layout Composition Rules, Ecommerce UX Rules, Complete Design Token System, Responsive Philosophy, expanded Motion Language, expanded Accessibility, Future Scalability, AI Agent Instructions, and Tailwind Mapping. **No v1.0 decision was altered, removed, or simplified** — every original color, type, spacing, component, motion, and accessibility rule remains exactly as specified; Sections 1–9 are unchanged verbatim. Governance moved to Section 25 to make room for the new material.
- **v1.0** — Original foundational system (Brand Philosophy, Design Principles, Color, Typography, Spacing, Components, Motion, Accessibility, Rejected Patterns, Governance).

---

## Table of Contents

**Foundation:** [0. How to Use This Document](#0-how-to-use-this-document) · [1. Brand Philosophy](#1-brand-philosophy) · [2. The 18 Timeless Design Principles](#2-the-18-timeless-design-principles)

**Core Tokens:** [3. Color System](#3-color-system) · [4. Typography](#4-typography) · [5. Spacing & Grid](#5-spacing--grid) · [6. Component Language](#6-component-language) · [7. Motion](#7-motion) · [8. Accessibility Checklist](#8-accessibility-checklist-applies-to-every-generated-screen) · [9. Explicitly Rejected Patterns](#9-explicitly-rejected-patterns)

**Brand Depth:** [10. Brand DNA](#10-brand-dna) · [11. Photography Direction](#11-photography-direction) · [12. Image Treatment](#12-image-treatment) · [13. Iconography System](#13-iconography-system) · [14. Illustration System](#14-illustration-system)

**Layout & Commerce:** [15. Visual Density](#15-visual-density) · [16. Layout Composition Rules](#16-layout-composition-rules) · [17. Ecommerce UX Rules](#17-ecommerce-ux-rules)

**Implementation:** [18. Complete Design Token System](#18-complete-design-token-system) · [19. Responsive Philosophy](#19-responsive-philosophy) · [20. Motion Language (Expanded)](#20-motion-language-expanded) · [21. Accessibility Beyond WCAG](#21-accessibility-beyond-wcag) · [22. Future Scalability](#22-future-scalability)

**AI & Engineering:** [23. AI Agent Instructions](#23-ai-agent-instructions) · [24. Tailwind Mapping](#24-tailwind-mapping) · [25. Governance](#25-governance) · [26. Component Relationship & Cross-Reference Rules](#26-component-relationship--cross-reference-rules)

**Quick lookup for AI agents:** if you're generating a screen and unsure where to look — *what color/type/space to use* → Section 18 or 24; *what a screen's layout should be* → Section 16; *how a component behaves combined with others* → Section 26; *whether something is allowed at all* → Section 9 and Section 23.

---

## 0. How to Use This Document

- Read **Section 1 (Philosophy)** before touching any token — it explains *why*, not just *what*.
- Every token in Sections 3–5 has a **reason**, a **usage rule**, and a **do-not** clause. Do not substitute a token because it "looks close enough."
- This system is built to last **10 years**. Trend-driven choices (neumorphism, glassmorphism, neon, heavy gradients) are permanently rejected — see Section 9.
- Built mobile-first. Desktop is an expansion of the mobile system, never a separate design.

---

## 1. Brand Philosophy

### 1.1 What this brand is
Bánh Tráng Nhà Na sells **handmade Vietnamese rice paper snacks** — a street-food category defined by chili, char, crunch, and shared eating. The brand is standing up its own storefront to build trust and repeat purchases independent of Shopee/marketplace UX.

### 1.2 What this brand is NOT
- Not luxury food. Not fine dining. Not a restaurant.
- Not a flash-sale marketplace (Shopee/TikTok Shop/Lazada visual language is explicitly rejected).
- Not a tech product. No cyberpunk, glassmorphism, neon, or "AI-generated" aesthetic.

### 1.3 The emotional target
A first-time visitor, scrolling from a TikTok or Facebook link on their phone, should feel within 2 seconds:

> **"This looks delicious. This feels like a real brand. I trust this shop."**

Every layout decision is judged against that sentence.

### 1.4 Core design thesis
**Modern Editorial Food Commerce** — Apple's restraint governing the grid, Starbucks' warmth governing the palette, Shopify's commerce logic governing conversion, Notion's readability governing content density, Linear's precision governing spacing/motion, Stripe's hierarchy governing what the eye sees first, Airbnb's friendliness governing how components invite touch.

None of these brands are copied. Their *principles* are extracted; their *identities* (fintech blue, travel imagery, developer chrome, coffee-shop darkness) are discarded.

---

## 2. The 18 Timeless Design Principles

1. **One idea per screen.** Never compete two CTAs, two heroes, or two color-loud elements on the same viewport.
2. **Photography is the hero, not decoration.** Food photography carries more trust than any illustration or icon set ever will.
3. **Warmth over coldness, always.** When restraint and warmth conflict, warmth wins — this is a food brand, not a tech brand.
4. **Spacing is a hierarchy tool, not filler.** Generous space around a product photo signals quality; cramped space signals a bargain bin.
5. **Every color must be traceable to the product.** No color exists because it "looks nice" — it exists because it's roasted rice paper, chili red, or turmeric gold.
6. **Price is never hidden, never shouted.** Confident, legible, calm — never neon, never blinking, never oversized relative to product name.
7. **Trust signals sit near the decision point**, not buried in a footer (reviews near price, guarantee near checkout button).
8. **Touch targets are generous by default** (min 44×44px) — this is a phone-first, one-thumb-scrolling audience.
9. **Motion explains state change; it never performs.** If a micro-interaction doesn't clarify what just happened, delete it.
10. **Text hierarchy beats color hierarchy.** Reach for size/weight/spacing before reaching for a new color.
11. **Consistency beats novelty.** A repeat customer should never have to re-learn the interface.
12. **Every component must survive a bad photo.** Design the frame so an imperfect product shot still looks intentional.
13. **Mobile is the primary canvas; desktop is an extension, not a redesign.**
14. **Contrast is non-negotiable.** No text-over-image without a scrim. No decorative-only contrast failures.
15. **The system scales down before it scales up.** Design the smallest, cheapest, fastest-loading version first.
16. **Editorial calm over marketplace noise.** No countdown timers, no aggressive red banners, no "only 2 left!" urgency tricks — that is Shopee's language, not ours.
17. **Every screen answers "why trust this shop"** somewhere above the fold, implicitly or explicitly.
18. **Craft is shown, not claimed.** Prefer a close-up of hands rolling rice paper over a badge that says "handmade."

---

## 3. Color System

Derived from: roasted rice paper (warm tan/brown), dried chili (red-orange), turmeric and fried garlic (gold), fresh herbs (muted green), charcoal grill marks (near-black), unbleached paper/kraft packaging (cream/off-white), morning sunlight (warm neutral light).

**Format:** all values are HSL for easy tinting; hex given for direct use.

### 3.1 Primary Palette

| Token | Value | Reason | Usage |
|---|---|---|---|
| `color-primary` | `#C1401C` (chili red-orange) | Derived from dried red chili flakes on the product — the single most recognizable visual cue of the category | Primary CTA buttons, active nav state, key brand accents |
| `color-primary-hover` | `#A6350F` | Darkened 10% for pressed-state feedback | Button hover on desktop |
| `color-primary-active` | `#8C2C0C` | Darkened further for tactile "pressed" feedback | Button active/mousedown state |
| `color-secondary` | `#8A5A2B` (roasted rice-paper brown) | The literal color of the toasted product itself | Secondary buttons, category dividers, icon accents |
| `color-accent` | `#E0A526` (turmeric/fried-garlic gold) | Warm accent used for badges, ratings, highlights — evokes seasoning, not sale | Star ratings, "bestseller" tags, subtle highlights |

**Do-not:** Never use `color-primary` for large background fills — chili red at scale reads as a sale/marketplace banner, not an appetite trigger. Use it for small, high-intent elements only (buttons, icons, key numbers).

### 3.2 Backgrounds & Surfaces

| Token | Value | Reason |
|---|---|---|
| `color-background` | `#FDF8F1` (warm kraft-paper cream) | Mimics unbleached packaging paper — warmer than pure white, reduces glare on mobile, feels handmade rather than clinical |
| `color-background-alt` | `#F5EDE0` | Slightly deeper cream for alternating section rhythm without hard dividing lines |
| `color-surface` | `#FFFFFF` | Pure white reserved for product cards/images so photography reads at full color accuracy |
| `color-surface-elevated` | `#FFFFFF` + shadow (see 6.2) | Modals, bottom sheets, elevated dialogs |
| `color-card` | `#FFFFFF` | Default product card background |
| `color-card-hover` | `#FBF4E8` | Warm tint on hover/tap-highlight — signals interactivity without a harsh shadow jump |

**Do-not:** Never use pure `#FFFFFF` as the page background — it reads clinical/medical, undermining "handmade" warmth. Reserve pure white for surfaces that hold food photography.

### 3.3 Borders & Structure

| Token | Value | Reason |
|---|---|---|
| `color-border` | `#E5D9C6` | Warm neutral, visible but never harsh — structural, not decorative |
| `color-divider` | `#EFE6D8` | Lighter than border; used inside cards/lists where a border would feel heavy |
| `color-focus-ring` | `#C1401C` at 40% opacity, 3px | Matches primary for brand-consistent accessibility, always visible on keyboard nav |

### 3.4 Text

| Token | Value | Reason / Contrast |
|---|---|---|
| `color-text-primary` | `#2B1D14` (near-black warm brown, not pure black) | Pure black on cream background feels harsh; warm near-black keeps the palette cohesive. Passes WCAG AAA on `color-background`. |
| `color-text-secondary` | `#5C4A3A` | Body copy, descriptions — WCAG AA compliant on all light surfaces |
| `color-text-muted` | `#8A7A68` | Metadata, timestamps, helper text — AA on white/cream, not for body copy |
| `color-disabled` | `#B9AC9A` | Disabled buttons/inputs — intentionally low-contrast to signal non-interactivity |
| `color-placeholder` | `#A69783` | Form placeholder text |

### 3.5 Semantic / Status

| Token | Value | Reason |
|---|---|---|
| `color-success` | `#3F7A4E` (herb green) | Order confirmed, in-stock — pulled from fresh herb garnish, stays in-palette rather than generic green |
| `color-warning` | `#C98A1A` | Low stock, delivery delay — warm amber, distinct from accent gold by saturation |
| `color-danger` | `#B23A2E` | Errors, out of stock — deliberately *not* identical to `color-primary` so errors never look like a CTA |
| `color-info` | `#5B7A94` | Neutral informational messages (shipping notes, policy notices) |

### 3.6 Commerce-Specific

| Token | Value | Reason |
|---|---|---|
| `color-price` | `color-text-primary` (`#2B1D14`) | Price should read as confident information, not a shouted promotion — no special color needed for standard price |
| `color-sale` | `#B23A2E` | Strikethrough original price / sale price — same family as danger but used only in pricing context |
| `color-discount-badge-bg` | `#C1401C` | Small badge only (e.g. "-15%"), never a full banner |
| `color-discount-badge-text` | `#FFFFFF` | 8.9:1 contrast on badge bg |
| `color-rating` | `#E0A526` (accent gold) | Star ratings — universally recognized, matches accent |

**Do-not:** Never render prices in red by default. Red is reserved for genuine markdowns, not as decoration — this preserves red's urgency signal for when it's real.

### 3.7 Badge / Category / Tag Colors
Use low-saturation tints of the core palette, not arbitrary hues, so every tag still feels "on-brand":

| Category | Background | Text |
|---|---|---|
| Spicy / Chili | `#F7E3DC` | `#8C2C0C` |
| Bestseller | `#FBEBC9` | `#8A5A2B` |
| New | `#E4EEE6` | `#3F7A4E` |
| Vegetarian | `#EAF0E8` | `#4A6B3E` |

### 3.8 Skeleton / Loading
`color-skeleton-base`: `#EFE6D8` · `color-skeleton-shimmer`: `#F7F1E6` — warm-toned shimmer, never cool gray (cool gray skeletons feel like a generic SaaS app).

### 3.9 Charts / Admin Data Viz
Use the full semantic palette in this order for categorical series: primary → secondary → accent → success → info → warning. Never introduce a hue outside this system for charts.

### 3.10 Dark Mode

| Token | Value | Reason |
|---|---|---|
| `color-background` (dark) | `#1C140D` | Charcoal-grill-mark brown-black, not pure black — keeps warmth even in dark mode |
| `color-surface` (dark) | `#2B2018` | Elevated card surface |
| `color-primary` (dark) | `#E05A34` | Brightened chili red for sufficient contrast on dark backgrounds |
| `color-text-primary` (dark) | `#F5EDE0` | Warm off-white, mirrors light-mode cream |
| `color-border` (dark) | `#3D2F22` | Subtle warm border |

**Accessibility note:** All text/background pairs above have been chosen to meet or exceed WCAG AA (4.5:1 body text, 3:1 large text/UI components). `color-text-primary` on `color-background` exceeds AAA (7:1+). Color is never the sole carrier of meaning (e.g., "out of stock" always pairs a color with a label/icon, for color-blind users).

**Activation logic (clarifying an implicit gap):** Dark mode follows `prefers-color-scheme` (system setting) by default, with an optional manual override toggle in account settings that persists per-user. It is never the default regardless of system setting, and it is never auto-triggered by time of day — this is a food-appetite interface, and appetite photography (Section 11) is tuned for the light palette; dark mode exists for user comfort in low-light environments, not as an equal-weight alternative aesthetic. Photography itself never inverts or color-shifts in dark mode — only chrome (backgrounds, surfaces, text, borders) responds to the dark tokens.

---

## 4. Typography

### 4.1 Font Pairing
- **Display / Heading:** A humanist serif or high-contrast serif with warmth and editorial feel — e.g. **"Fraunces"** (variable, expressive but controllable) or **"Lora"** as a safer fallback. Used sparingly, large sizes only.
- **Body / UI / Navigation / Buttons / Prices:** A clean humanist sans — e.g. **"Inter"** or **"Public Sans"** — chosen for exceptional mobile legibility, wide language support (Vietnamese diacritics must render cleanly at all weights), and neutral-but-friendly character.

**Reason:** A serif display + sans body pairing is the classic "editorial food brand" signal (used across mature food/lifestyle brands) — it separates "storytelling" moments (hero headlines, product names) from "functional" moments (navigation, prices, forms) without ever feeling cold or corporate.

**Vietnamese diacritics requirement:** Verify full Vietnamese character set (ạ, ắ, ẩ, ễ, ộ, ữ, etc.) renders correctly at all weights before shipping — this is non-negotiable given the target market.

### 4.2 Type Scale (mobile-first, rem @ 16px base)

| Role | Font | Size (mobile) | Size (desktop) | Weight | Line-height |
|---|---|---|---|---|---|
| Display (hero) | Fraunces | 2.25rem (36px) | 3.5rem (56px) | 600 | 1.15 |
| H1 | Fraunces | 1.75rem (28px) | 2.5rem (40px) | 600 | 1.2 |
| H2 | Fraunces | 1.5rem (24px) | 2rem (32px) | 600 | 1.25 |
| H3 | Inter | 1.125rem (18px) | 1.375rem (22px) | 600 | 1.3 |
| Body | Inter | 1rem (16px) | 1.0625rem (17px) | 400 | 1.6 |
| Body Small | Inter | 0.875rem (14px) | 0.9375rem (15px) | 400 | 1.5 |
| Caption / Meta | Inter | 0.75rem (12px) | 0.8125rem (13px) | 500 | 1.4 |
| Button Label | Inter | 0.9375rem (15px) | 1rem (16px) | 600 | 1 |
| Price (product card) | Inter | 1.125rem (18px) | 1.25rem (20px) | 700 | 1.2 |
| Price (PDP hero) | Inter | 1.5rem (24px) | 1.875rem (30px) | 700 | 1.2 |
| Nav Label | Inter | 0.9375rem (15px) | 0.9375rem (15px) | 500 | 1 |

**Rules:**
- Never use the display serif below 18px — it loses legibility and its editorial purpose.
- Body text minimum is 16px on mobile (prevents iOS auto-zoom on input focus, aids readability for fast scrollers).
- Line-height of 1.6 on body copy is deliberate — this is a scanning audience, generous leading improves scan speed, not just aesthetics.

---

## 5. Spacing & Grid

### 5.1 Base Unit
**4px base unit.** All spacing is a multiple of 4, matching Linear-style discipline for pixel-perfect consistency across agents/tools.

### 5.2 Spacing Scale

| Token | Value |
|---|---|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |
| `space-20` | 80px |
| `space-24` | 96px |

### 5.3 Grid & Containers

| Breakpoint | Container width | Columns | Gutter |
|---|---|---|---|
| Mobile (<640px) | 100%, 16px side padding | 4 | 16px |
| Tablet (640–1024px) | 90%, max 720px | 8 | 20px |
| Desktop (1024–1440px) | max 1200px | 12 | 24px |
| Wide (>1440px) | max 1320px | 12 | 32px |

### 5.4 Section & Component Rhythm
- **Section vertical padding:** `space-16` (mobile) → `space-24` (desktop) top/bottom.
- **Component internal padding:** cards use `space-4`–`space-5`; buttons use `space-3` vertical / `space-6` horizontal.
- **Product grid gap:** `space-4` (mobile), `space-6` (desktop).
- **Never** place two sections back-to-back with less than `space-12` between them — this is what causes the "cramped marketplace" feeling this brand explicitly rejects.

---

## 6. Component Language

General shape philosophy: **rounded, soft, touchable** (Airbnb-derived) but never bubbly/childish. Radius communicates "handmade care," not "playful app."

### 6.1 Radius Scale
`radius-sm` 6px (inputs, small chips) · `radius-md` 12px (buttons, cards) · `radius-lg` 20px (modals, bottom sheets, hero images) · `radius-full` 999px (pills, avatar, category chips)

### 6.2 Elevation / Shadow
Soft, warm-toned shadows only — never pure black shadows (they read cold/digital).
- `shadow-sm`: `0 1px 2px rgba(43,29,20,0.06)` — cards at rest
- `shadow-md`: `0 4px 12px rgba(43,29,20,0.10)` — hover state, dropdowns
- `shadow-lg`: `0 12px 32px rgba(43,29,20,0.16)` — modals, bottom sheets

### 6.3 Buttons

| State | Style |
|---|---|
| Primary / default | `color-primary` bg, white text, `radius-md`, `shadow-sm` |
| Primary / hover | `color-primary-hover`, `shadow-md`, no size shift |
| Primary / active | `color-primary-active`, scale 0.98 (tactile press) |
| Primary / disabled | `color-disabled` bg, `color-text-muted` text, no shadow |
| Secondary | Transparent bg, `color-primary` border + text |
| Ghost/tertiary | No border, `color-text-secondary`, underline on hover |

Min touch target: 44×44px. Button label always sentence case, never ALL CAPS (all-caps reads as shouting/marketplace urgency).

### 6.4 Product Cards
- White (`color-surface`) card, `radius-md`, `shadow-sm` at rest → `shadow-md` + `color-card-hover` tint on hover/tap.
- Image occupies top 60–65% of card, square or 4:5 ratio — food photography is the hero (Principle #2).
- Below image: product name (H3), short descriptor (Body Small, `color-text-secondary`), rating (accent gold stars + review count in `color-text-muted`), price (bold, `color-price`).
- Add-to-cart is a small icon-button in the card corner on mobile, full-width button on hover-capable desktop — avoids clutter on small screens.

### 6.5 Category Chips
Pill-shaped (`radius-full`), `color-background-alt` at rest, `color-primary` bg + white text when active/selected. Horizontal scroll on mobile with no visible scrollbar.

### 6.6 Navigation
Sticky top bar, `color-background` with 1px `color-border` bottom on scroll (not on initial load, to keep hero unobstructed). Logo left, nav center/right, cart icon with `color-primary` badge showing item count.

### 6.7 Search
Rounded input (`radius-full` or `radius-md`), `color-surface` bg, `color-border`, placeholder in `color-placeholder`. Icon-left, clear-icon-right when populated.

### 6.8 Filters
Bottom sheet on mobile (`radius-lg` top corners), sidebar on desktop. Filter chips mirror category chip styling for consistency.

### 6.9 Cart
Slide-in panel (mobile: bottom sheet or full-screen; desktop: right-side drawer). Each line item: thumbnail, name, quantity stepper (rounded, `color-border` outline), price, remove (ghost icon button). Sticky footer with subtotal + primary CTA "Checkout."

### 6.10 Checkout
Linear, single-column flow on mobile (Shopify-derived conversion logic). Progress indicator at top (3 steps max: Info → Shipping → Payment). Trust signals (secure payment icons, return policy) directly above/below the final CTA — never buried in footer only.

### 6.11 Forms
Label above input (never placeholder-as-label — accessibility). Input: `radius-sm`, `color-border`, `color-focus-ring` on focus (3px, 40% opacity). Error state: `color-danger` border + inline message below field, never a color-only signal.

### 6.12 Dialogs / Modals
Centered (desktop) or bottom-sheet (mobile), `radius-lg`, `shadow-lg`, scrim `rgba(43,29,20,0.4)` behind. Close via X icon top-right and tap-outside.

### 6.13 Badges
Small, `radius-full` or `radius-sm`, max one badge per product card to avoid visual noise (Principle #16 — no marketplace clutter).

### 6.14 Reviews
Star rating (accent gold) + review count inline. Review text in Body/Body Small, reviewer name in `color-text-secondary` weight 600. Verified-purchase indicator uses `color-success` + checkmark icon, never color alone.

### 6.15 Admin Dashboard
Same token system as storefront (not a separate visual language) — `color-background-alt` canvas, `color-surface` cards, data tables with `color-divider` row separators, charts using the Section 3.9 categorical order. Density is higher here (tighter spacing scale, `space-2`/`space-3`) since this is an internal power-user tool, not a scanning consumer surface.

---

## 7. Motion

**Philosophy:** motion clarifies, never performs (Principle #9). Linear-derived precision, not flashy.

| Interaction | Duration | Easing |
|---|---|---|
| Button hover/press | 120–150ms | ease-out |
| Card hover elevation | 150ms | ease-out |
| Modal/sheet open | 200–250ms | ease-in-out |
| Page/route transition | none or 100ms fade only | linear |
| Add-to-cart confirmation | 200ms micro-bounce on cart icon only | ease-out |
| Skeleton shimmer | 1.4s loop | linear |

**Never:** parallax scrolling, page-transition slides/wipes, bouncy spring overshoot on anything larger than an icon, auto-playing carousels without user control.

---

## 8. Accessibility Checklist (applies to every generated screen)

- [ ] Body text contrast ≥ 4.5:1, large text/UI ≥ 3:1 (all Section 3 pairs pre-verified)
- [ ] Touch targets ≥ 44×44px
- [ ] Color never the sole signal (status = color + icon/label)
- [ ] All interactive elements keyboard-reachable, visible `color-focus-ring`
- [ ] Form inputs have real `<label>` elements, not placeholder-only
- [ ] Images have descriptive alt text (product name + key descriptor, not "image1.jpg")
- [ ] Minimum body font size 16px on mobile forms (prevents iOS zoom)
- [ ] Tested against protanopia/deuteranopia — primary/danger/success are distinguishable by more than hue alone (verified via shape/icon pairing, not color alone)

---

## 9. Explicitly Rejected Patterns

Do not generate, under any circumstance:

- Flash-sale countdown timers, blinking "X left in stock," aggressive marketplace red banners
- Glassmorphism, neumorphism, neon glows, heavy gradients/mesh backgrounds
- Cyberpunk or "AI-generated" abstract geometric branding
- Oversized full-bleed tech-style hero video sections
- Dark, moody "luxury dining" presentation
- All-caps button labels or headlines used for urgency
- More than one badge per product card
- Cool-gray skeleton loaders or cool-blue focus rings (breaks palette warmth)
- Pure black (`#000000`) or pure white (`#FFFFFF`) as a page background

---

## 10. Brand DNA

*This section deepens Section 1 (Brand Philosophy) — it does not replace it. Section 1 defines what the brand feels like on screen; this section defines who the brand is as an entity, so every future copywriting, tone, and interaction decision has a consistent source of truth.*

### 10.1 Brand Archetype
**The Caregiver, with a streak of the Everyman.** Primary archetype: Caregiver — the brand exists to nourish, to make people feel looked after ("Nhà" means home; this is food from someone's home, not a factory). Secondary archetype: Everyman — approachable, unpretentious, shared at a plastic stool on a sidewalk, not a white tablecloth.

**Reason this matters for interface design:** Caregiver brands (think: a trusted neighborhood cook) build interfaces around reassurance and generosity — clear return policies, warm photography of hands at work, generous portions implied in copy and imagery. Everyman brands avoid anything that feels exclusive or intimidating — no velvet-rope language, no "members only" visual weight anywhere except an actual loyalty feature (Section 22.7).

### 10.2 Brand Personality (Big Five mapping)
| Trait | Level | Interface implication |
|---|---|---|
| Warmth (Agreeableness) | Very High | Rounded shapes, cream backgrounds, friendly copy tone |
| Conscientiousness | High | Consistent components, no broken states, careful photography |
| Openness | Medium-High | Willing to show process/craft (behind-the-scenes), not experimental UI |
| Extraversion | Medium | Confident CTAs, but never loud/shouting visual language |
| Neuroticism (inverse: Stability) | Very Low | Calm motion, no urgency tactics, no anxiety-inducing countdowns |

### 10.3 Brand Values (in priority order)
1. **Honesty** — show the real product, real ingredients, real process. Never retouch food to look artificial.
2. **Craft** — every visual choice should imply a human made this, not a factory.
3. **Warmth** — the interface should feel like it's speaking to a friend, not a customer.
4. **Accessibility of joy** — delicious food shouldn't require a luxury budget or a luxury interface.
5. **Consistency** — a returning customer should feel the same trusted "home" every visit.

### 10.4 Brand Voice & Tone

**Voice** (constant, never changes): Warm, direct, a little playful, never corporate, never marketplace-loud.

**Tone** (adapts to context — voice stays constant, delivery shifts):
| Context | Tone | Example direction |
|---|---|---|
| Homepage hero | Inviting, sensory | Focus on taste/craft language, not sales language |
| Product description | Descriptive, honest, specific | Name real ingredients and process, avoid vague superlatives like "the best ever" |
| Error states | Calm, apologetic, solution-first | Never blame the user; always offer the next step |
| Checkout | Reassuring, efficient | Short sentences, confidence-building, no upsell pressure at the final step |
| Order confirmation | Warm, personal | Should feel like a thank-you note, not a transaction receipt |
| Marketing/promo | Confident but never urgent | No "HURRY," no all-caps, no fake scarcity language |

**Do not:** Use corporate jargon ("leverage," "solutions," "curated experience"), fitness/diet-culture language, or marketplace urgency language ("flash sale," "last chance," "don't miss out").

### 10.5 Emotional Hierarchy
When emotional goals conflict, resolve in this order:
1. **Trust** (is this real, is this safe to buy from) — always wins first.
2. **Appetite** (does this look delicious) — wins second.
3. **Warmth** (does this feel like home/craft) — wins third.
4. **Delight** (small moments of joy — a nice micro-interaction, a warm confirmation message) — wins last, and never at the expense of 1–3.

### 10.6 How the Interface Should Behave
- Respond immediately to every action (loading state within 100ms, never a frozen tap).
- Never surprise the user with unexpected navigation, pop-ups, or auto-playing media.
- Always show the user where they are and what happens next (progress indicators, breadcrumbs on desktop).
- Recover gracefully from errors — offer a next step, never a dead end.

### 10.7 How the Interface Should NEVER Behave
- Never nag (no repeated newsletter pop-ups, no exit-intent modals stacked on top of each other).
- Never manufacture urgency that isn't real (no fake countdown timers, no fabricated "3 people are viewing this").
- Never hide the true price until checkout.
- Never make canceling, unsubscribing, or account deletion harder to find than signing up.

### 10.8 If This Brand Were a Person
A warm, capable home cook in their early 30s who grew up rolling rice paper with their grandmother, now runs a small but serious business — proud of the craft, direct about what's in the bag, quick to laugh, never condescending, never trying to seem fancier than they are. They'd rather under-promise and over-deliver than oversell. They remember your last order.

---

## 11. Photography Direction

*Photography is the single highest-leverage design element in this system (Principle #2). This section is deliberately exhaustive — an AI agent or photographer should be able to brief a shoot from this section alone.*

### 11.1 Lighting
- **Primary light:** Natural, warm, directional (mimics morning/late-afternoon sunlight through a window) — never flat, shadowless studio lighting.
- **Color temperature:** Warm (2800K–3500K equivalent) — reinforces the cream/roasted-brown palette; never cool/blue-white light, which reads clinical.
- **Shadow behavior:** Soft, natural falloff shadows on one side — implies dimension and a real kitchen, not a lightbox.
- **Reason:** Cold, shadowless lighting is the signature look of stock/marketplace catalog photography — the single fastest way to make handmade food look mass-produced.

### 11.2 Camera Angle
- **Hero/lifestyle shots:** 30–45° angle (slightly above, looking down) — mimics how a person actually looks at food on a table.
- **Product/catalog shots:** Top-down (flat lay) or 45° — consistent angle across the whole catalog for scannability.
- **Macro/detail shots:** Close, shallow depth of field, texture-forward (crispy edges, chili flake detail, oil sheen).
- **Never:** Straight-on eye-level "menu board" angles — reads like a fast-food chain, not handmade.

### 11.3 Cropping & Composition
- Generous negative space around the hero subject — do not crop tight to fill the frame; this is Apple/Notion-derived restraint applied to food photography.
- Rule of thirds for lifestyle shots; centered symmetry acceptable only for top-down flat lays.
- Always leave breathing room on one side of hero images for text overlay (with scrim per Principle #14) — never place text over a busy part of the photo.

### 11.4 Texture Signals to Capture Deliberately
- **Crispiness:** visible fracture lines, slight char/roast marks, catching light on ridged rice-paper texture.
- **Oil sheen:** a light, appetizing glisten — never a greasy pool (greasy reads unhealthy/low-quality).
- **Steam:** only for genuinely hot items, captured thin and wispy — never CG-added fog effects.
- **Fresh ingredients:** herbs, chili, lime shown whole and unwilted alongside the product to signal freshness sourcing.

### 11.5 Props & Environment
- **Approved surfaces:** raw wood, kraft paper, woven bamboo trays, simple ceramic or enamel Vietnamese tableware.
- **Approved props:** fresh herbs, whole chilies, a rolling hand mid-craft, simple chopsticks.
- **Rejected props:** anything glossy/plastic, fine china, cutlery that reads "fine dining," neon-colored backgrounds.

### 11.6 Photography by Placement

| Placement | Style | Ratio | Notes |
|---|---|---|---|
| Hero (homepage/landing) | Lifestyle, 30–45°, generous negative space for text | 16:9 (desktop), 4:5 (mobile) | Must include a human element (hand, craft moment) at least seasonally |
| Category thumbnail | Top-down or 45°, consistent angle within a category | 1:1 | Consistency across a grid matters more than individual creativity |
| Product card | 45° or top-down, single product, clean background | 4:5 | Must survive a small mobile card size — no fine detail that disappears at 200px wide |
| Product detail (PDP) hero | Macro + full-product shot, multiple angles in a gallery | 1:1 or 4:5 | Include at least one texture/macro shot per product |
| Checkout / confirmation | Warm, small supporting image only (e.g., packaging), never the main focus | 1:1, small | Reassurance, not selling — user has already decided |
| Review section | User-submitted photos, lightly moderated for quality, NOT re-shot/staged | Native ratio | Authenticity over polish — real customer photos build more trust here than professional ones |

### 11.7 Explicitly Rejected Photography Styles
- Stock photography (recognizable generic "Asian food" stock imagery)
- CG/3D renders of food
- Oversaturated, punched-up color grading (a common Shopee/marketplace trick)
- Cold, flat studio catalog lighting
- Plastic-looking, overly glossy food styling
- Any photography that could not plausibly have come from this brand's own kitchen

---

## 12. Image Treatment

*Governs how photography (Section 11) is framed and rendered in the UI once captured — expands Section 6 (Component Language) implementation detail.*

### 12.1 Image Ratios by Context
| Context | Ratio | Reason |
|---|---|---|
| Hero (desktop) | 16:9 | Cinematic, editorial, matches Section 11.6 |
| Hero (mobile) | 4:5 | Taller ratio performs better in a vertical scroll |
| Product card | 4:5 | Matches Section 6.4; leaves room for name/price below without a bloated card |
| Category tile | 1:1 | Predictable grid rhythm |
| PDP gallery | 1:1 primary, 4:5 secondary | 1:1 for the "hero" product shot, 4:5 for lifestyle/context shots |
| Avatar / reviewer photo | 1:1, circular mask | Standard, unobtrusive |
| Thumbnail (cart line item) | 1:1, small (56–64px) | Recognition only, not detail |

### 12.2 Corner Radius on Images
Images inherit the container's radius token (Section 6.1) — never a separate, larger radius than the card that holds them, and never sharp 0px corners (breaks the "soft, handmade" shape language system-wide).

### 12.3 Image Padding
Product images sit with **zero internal padding** against their card edges at the top (bleeds to the card's top corners) but respect `space-4` padding on text content below — this creates the "photo-forward" hierarchy from Principle #2 while keeping text readable.

### 12.4 Hover Effects
- Desktop hover: subtle scale (1.02–1.03x) over 200ms ease-out, contained within the card's overflow so it never breaks grid alignment.
- Never: hover effects that flip, rotate, or reveal a second hidden image via crossfade on the *first* interaction — this feels gimmicky for a food brand. A second image may appear via a small dot indicator the user taps/swipes (galleries), not an automatic hover-swap.

### 12.5 Loading States
- Use the warm-toned skeleton system (Section 3.8) sized to the exact final image ratio (prevents layout shift).
- Progressive blur-up (low-res placeholder → full image fade-in over 200ms) preferred over a blank skeleton-to-snap-in transition — feels more polished and food-appropriate (soft focus resolving into appetite).

### 12.6 Fallback States
If a product image fails to load: show a simple line-icon placeholder (Section 13) on `color-background-alt`, never a broken-image icon or a generic gray box. Never fall back to a stock photo.

### 12.7 Compression & Mobile Optimization
- Serve WebP/AVIF with JPEG fallback; target perceptual quality over strict file size — food photography quality is a trust signal and should never look visibly compressed/blocky.
- Responsive `srcset` mandatory: mobile devices must never download desktop-hero-resolution images.
- Lazy-load all below-the-fold images; hero/first-viewport image should be prioritized (`fetchpriority="high"`) for fast perceived load, since this is a fast-scanning, mobile-data-conscious audience.

---

## 13. Iconography System

### 13.1 Icon Philosophy
Icons are **functional wayfinding, never decoration.** They should be nearly invisible when working correctly — the user shouldn't consciously notice an icon, only understand instantly what it means.

### 13.2 Style Specification
- **Stroke width:** 1.5px at 24px icon size (scales proportionally) — consistent with Linear-derived precision, thin enough to feel refined, not flimsy.
- **Corner style:** Rounded joins and caps — matches the brand's soft radius language (Section 6.1); never sharp/mitered joins.
- **Style:** Outline (stroke) icons as the default system-wide. **Filled** variant reserved exclusively for the active/selected state of navigation icons (e.g., active tab bar icon) — this is the *only* place filled icons appear, so the filled state always communicates "currently selected."
- **Recommended libraries:** Lucide (matches this stroke weight and corner style natively) or Phosphor (regular weight only — never Phosphor's "fill" or "duotone" sets, which break the single-weight consistency rule).

**Do not mix icon systems.** Every icon on every screen must come from the same library at the same weight — mixing (e.g., a Material filled icon next to a Lucide outline icon) is one of the fastest ways to make an interface look AI-generated/unintentional.

### 13.3 Sizing
| Context | Size |
|---|---|
| Inline with body text | 16px |
| Buttons, form fields | 20px |
| Navigation, tab bar | 24px |
| Empty state / large feature icon | 48–64px |

### 13.4 Spacing
Icon-to-label spacing: `space-2` (8px), consistent everywhere an icon sits beside text (buttons, nav labels, list items).

### 13.5 Interaction Rules
- Icon-only buttons (no visible label) require an accessible label (`aria-label`) and a minimum 44×44px tap target even if the icon itself renders smaller (Section 8).
- Icons in interactive contexts (buttons, nav) inherit the surrounding text color — never a separate, uncoordinated icon color, to keep hierarchy calm (Principle #10).

### 13.6 Semantic Icon Meaning (must stay consistent site-wide)
| Meaning | Icon concept |
|---|---|
| Add to cart | Simple bag/basket outline |
| Favorite/wishlist | Outline heart (filled only once actively saved) |
| Search | Magnifying glass |
| Filter | Horizontal sliders |
| Success/confirmed | Circle with checkmark, `color-success` |
| Warning | Triangle with exclamation, `color-warning` |
| Error | Circle with exclamation, `color-danger` |
| Spicy indicator | Custom chili-pepper glyph (brand-specific exception — matches product reality, drawn in the same stroke weight as the rest of the system) |

---

## 14. Illustration System

### 14.1 Philosophy
Illustration is used **only** where photography cannot function (empty states, error states, abstract system states) — per Principle #2, photography always wins where both are possible. Illustration must never compete with food photography for "hero" visual weight anywhere on the site.

### 14.2 Style Direction
- Simple, warm, hand-drawn-feeling line illustrations with a single spot-color fill from the accent palette (Section 3) — never flat corporate-SaaS blob illustrations, never generic "AI-generated" isometric or gradient-mesh illustration styles.
- Line weight matches the iconography stroke width (1.5–2px) for family consistency between icons and illustrations.
- Subject matter should reference the brand world where possible (a rice-paper basket, a simple chili motif, a paper bag) rather than generic abstract shapes.

**Do not** use AI-generated illustration styles (recognizable by inconsistent line weight, warped perspective, or generic "friendly robot/gradient blob" aesthetics common to default AI image generators). Every illustration should look hand-drawn by a single consistent illustrator.

### 14.3 Illustration Use Cases
| Context | Direction |
|---|---|
| Empty cart | Simple line illustration of an empty basket, warm and inviting copy ("Your basket's a little hungry") — never a sad/negative emotional tone |
| 404 | Light, on-brand illustration (e.g., a dropped rice-paper roll) with clear "back to shop" CTA — never a scary or jarring visual |
| Success (order placed) | Warm checkmark/celebration illustration — subtle, brief animation on entrance only |
| Error (system) | Calm, apologetic illustration — never alarming imagery even for genuine errors |
| Loading (long processes) | Prefer skeleton screens (Section 3.8) over illustration for loading — illustration only for very long waits (e.g., first-time onboarding setup) |
| Seasonal campaigns | Small decorative line motifs (e.g., Tết/Lunar New Year accents) used sparingly as section dividers — never replacing product photography as the hero |
| Support/help graphics | Simple, friendly line icons paired with FAQ categories |
| No search results | Simple line illustration (e.g., a magnifying glass over an empty basket) with warm, non-blaming copy ("Nothing matched that — try a different word?") plus a suggestion of popular categories or bestsellers below, so the user always has a next step rather than a dead end (Principle #17 — even a "nothing found" screen should still answer "why trust this shop" by surfacing real products) |
| Background decoration | Extremely subtle, low-opacity line patterns only (e.g., a faint chili/herb motif at <8% opacity) — must never reduce text contrast below Section 8 minimums |

---

## 15. Visual Density

### 15.1 Overall Density Philosophy
This interface should feel **editorially calm, not sparse and not crowded** — closer to Notion's readable rhythm and Airbnb's comfortable card spacing than to Linear's information-dense professional tooling (except in the Admin Dashboard, Section 6.15, which is intentionally denser).

**Why:** The target audience scans fast on mobile, arriving from social media with low patience for cognitive load — but a food brand that feels *too* sparse can read as cold/expensive (Section 1's warmth thesis) or, worse, unfinished. The right density signals "curated, not empty" and "abundant, not cluttered."

### 15.2 Whitespace Amount by Context
| Context | Density level | Reason |
|---|---|---|
| Homepage / landing | Low density (generous whitespace) | First impression — must feel premium-but-warm, unhurried |
| Product listing grid | Medium density | Enough products visible per scroll to feel abundant, without crowding photography |
| Product detail page | Low-medium density | Photography needs room to breathe; description content can be moderately dense once past the fold |
| Cart / checkout | Medium density | Efficiency matters here — user wants to complete the task, not linger |
| Admin dashboard | High density | Internal tool, power-user context, information-per-screen matters more than ambiance |

### 15.3 Reading Rhythm
Body copy line-length target: 60–75 characters per line (optimal reading measure) — never let product descriptions stretch full-width on desktop; always constrain to a readable column even inside a wider layout.

### 15.4 Mobile vs. Desktop Rhythm
- **Mobile:** Single-column, one dominant element per screen height (Principle #1), generous vertical section spacing (`space-16`, Section 5.4) to create clear "chapters" while scrolling.
- **Desktop:** Multi-column where it aids scanning (product grids, filters-beside-content) but never multi-column for narrative/editorial text — desktop expands the canvas, it does not increase content competing for attention (Principle #13).

---

## 16. Layout Composition Rules

*Reusable page-level patterns. Every new page an AI agent generates should map to one of these templates rather than inventing a new structure.*

### 16.1 Landing / Homepage
**Order:** Hero (lifestyle photo + one-sentence value proposition + single primary CTA) → Trust strip (small, calm — ratings, "handmade daily," shipping info) → Featured/bestseller product grid → Brand story moment (craft photography + short narrative) → Category navigation → Reviews/social proof → Footer.
**CTA position:** One primary CTA in hero, repeated contextually in each product card — never more than one *loud* CTA per screen height (Principle #1).
**Trust placement:** Immediately below the hero, above the fold on desktop — first-time visitors need trust signals before they'll scroll to browse.

### 16.2 Product Listing (PLP)
**Order:** Category header + short description → Filter/sort bar (sticky on scroll, Section 6.8) → Product grid → Pagination/infinite scroll.
**Hierarchy:** Filters never outweigh products visually — filter bar uses `color-background-alt`, never `color-primary`.

### 16.3 Product Detail (PDP)
**Order (mobile):** Image gallery (swipeable) → Product name + price → Rating summary → Primary CTA (Add to Cart, sticky on scroll) → Short description → Ingredients/ what's-in-the-bag → Trust signals (shipping, returns) → Reviews → Related/cross-sell products.
**CTA position:** Add-to-cart CTA becomes sticky (bottom of viewport, mobile) once the user scrolls past the initial button — never lose the primary action.
**Trust placement:** Directly beneath the CTA — shipping estimate and return policy visible without additional taps.

### 16.4 Cart
**Order:** Line items → order summary (subtotal, shipping estimate, total) → sticky primary CTA "Checkout" → cross-sell row ("You might also like," max 3–4 items, low visual weight vs. the cart itself).
**Rule:** Cross-sell never pushes the checkout CTA below the fold on mobile.

### 16.5 Checkout
**Order:** Progress indicator → Contact/shipping info → Shipping method → Payment → Order review → Confirm CTA.
**Rule:** Order summary remains visible (collapsed/expandable on mobile, persistent sidebar on desktop) throughout — never make the user lose sight of what they're paying for.

### 16.6 Account
**Order:** Greeting (personalized, warm tone per Section 10.4) → Order history (most recent first) → Saved/favorite products → Address & payment management → Support/help link.

### 16.7 Admin Dashboard
**Order:** Key metrics summary (top) → Primary task table (orders/inventory, densest area) → Secondary navigation (sidebar, desktop-only pattern — no bottom-sheet metaphor here since this is an internal desktop-first tool).
**Note:** This is the one context where desktop is the primary canvas, not mobile — internal operators use this at a desk (documented exception to Principle #13).

### 16.8 Authentication (Login/Signup)
**Order:** Minimal — logo → single-purpose form → primary CTA → alternate action link (e.g., "New here? Create an account"). No marketing content, no product imagery competing with the task.

### 16.9 About Page
**Order:** Founder/craft story (photography-led, per Section 11) → values (Section 10.3, told through imagery+short copy, not a bullet list) → team/process moment → soft CTA back to shop.

### 16.10 FAQ
**Order:** Categorized accordion (never a long unstructured wall of Q&A) → search/filter for long lists → contact CTA at the bottom for unresolved questions.

### 16.11 Contact
**Order:** Simple form (name, email, message) → alternate contact channels (social/Zalo/phone, since this audience lives on Facebook/TikTok) → response-time expectation set clearly (trust/honesty per Section 10.3).

### 16.12 Reviews Page (full listing)
**Order:** Aggregate rating summary (large, top) → filter by rating/photo → individual review cards (Section 6.14) → pagination.

---

## 17. Ecommerce UX Rules

*Modern ecommerce conversion best practice — explicitly not marketplace (Shopee-style) patterns, per Principle #16.*

### 17.1 Conversion Hierarchy
Within any commerce screen, visual weight should follow: **Product photography > Price/CTA > Trust signals > Secondary information > Cross-sell.** Cross-sell and upsell must never visually outrank the primary product or CTA.

### 17.2 Trust Hierarchy
Trust signals escalate in specificity as the user gets closer to paying:
- Browsing (PLP): general trust (ratings visible on cards).
- Considering (PDP): specific trust (detailed reviews, ingredient transparency, shipping estimate).
- Deciding (Cart/Checkout): transactional trust (secure payment badges, clear return policy, order total transparency — no surprise fees at the last step).

### 17.3 Checkout Psychology
- Never introduce new costs (shipping, fees) for the first time at the final payment step — surface shipping estimates as early as the cart.
- Guest checkout always available — never force account creation before purchase (a top cause of cart abandonment).
- Minimize form fields to the essential; use address autocomplete where possible.

### 17.4 Product Comparison
Where relevant (e.g., flavor/spice-level variants), present differences in a simple, scannable table or side-by-side card — never force the user to open multiple tabs to compare.

### 17.5 Pricing Hierarchy
Base price is always the most prominent number on a PDP. If a discount applies, the original price is shown struck-through in `color-text-muted`, sale price in `color-sale` — but the *emphasis* (size/weight) still favors clarity over urgency (no oversized "SALE" treatment, per Principle #16).

### 17.6 Discount Hierarchy
Site-wide discounts (e.g., seasonal) are communicated through a single, calm banner — never through per-product flashing badges stacked with countdowns. One honest signal beats five loud ones.

### 17.7 Review Placement
Reviews appear in two tiers: a lightweight rating+count on every product card (builds trust while scanning) and a full review section on the PDP (builds trust while deciding). Never fabricate or pre-fill reviews.

### 17.8 Shipping Information
State shipping cost/estimate **before** the user reaches checkout — visible on PDP and cart, not hidden until the final step (Section 17.3).

### 17.9 CTA Priority
Exactly one primary (filled, `color-primary`) CTA per screen; all other actions are secondary/ghost style (Section 6.3). Never two primary-styled buttons competing on the same view.

### 17.10 Sticky Elements
- Mobile PDP: sticky "Add to Cart" bar once the user scrolls past the initial button.
- Cart/Checkout: sticky order summary/total.
- Never make navigation *and* a promo banner *and* a CTA all sticky simultaneously — stickiness is a scarce resource; use it only for the single most important element per screen.

### 17.11 Cart Behavior
Adding an item gives immediate, calm confirmation (small toast or cart-icon micro-bounce, Section 7) — never a jarring full-screen interstitial or auto-redirect to cart (breaks the browsing flow).

### 17.12 Cross-Selling & Upselling
Presented as genuine recommendation ("Pairs well with...") in the brand voice (Section 10.4), positioned after the primary decision point (below Add-to-Cart on PDP, below line items in Cart) — never as a pop-up or interstitial blocking the primary task.

---

## 18. Complete Design Token System

*Expands and consolidates every token category referenced across Sections 3–7 plus new implementation-level tokens not yet formalized. This is the canonical token table — component sections above remain the source of truth for *when* to use a token; this section is the source of truth for the *exact value*.*

### 18.1 Radius
`radius-sm` 6px · `radius-md` 12px · `radius-lg` 20px · `radius-full` 999px *(as defined in 6.1 — repeated here for completeness)*

### 18.2 Shadow / Elevation
`shadow-sm`, `shadow-md`, `shadow-lg` *(as defined in 6.2)*
- `shadow-focus`: `0 0 0 3px rgba(193,64,28,0.4)` — focus ring shadow, pairs with `color-focus-ring`

### 18.3 Opacity Scale
`opacity-disabled`: 0.4 · `opacity-hover-overlay`: 0.08 · `opacity-scrim`: 0.4 (modal backdrops, Section 6.12) · `opacity-decorative-max`: 0.08 (background illustration motifs, Section 14.3 — hard ceiling to protect contrast)

### 18.4 Z-Index Scale
`z-base`: 0 · `z-sticky-nav`: 10 · `z-dropdown`: 20 · `z-sticky-cta`: 30 · `z-drawer`: 40 · `z-modal-scrim`: 50 · `z-modal`: 51 · `z-toast`: 60
**Reason:** A fixed scale prevents ad hoc z-index wars between agents generating different components independently.

### 18.5 Blur
`blur-scrim`: none by default (this brand rejects glassmorphism, Section 9) — if a blur is ever required for a legitimate reason (e.g., a translucent sticky nav on scroll), cap at `blur-sm`: 8px and always pair with a solid-color fallback for reduced-transparency accessibility settings.

### 18.6 Spacing / Container / Grid / Breakpoints
*As defined in Section 5 — repeated here for single-lookup convenience.*
Spacing: `space-1`(4px) through `space-24`(96px). Breakpoints: mobile <640px, tablet 640–1024px, desktop 1024–1440px, wide >1440px.

### 18.7 Animation / Timing / Transition Curves
`ease-out`: `cubic-bezier(0.16, 1, 0.3, 1)` — default for entrances/hover
`ease-in-out`: `cubic-bezier(0.4, 0, 0.2, 1)` — default for modals/sheets
`duration-instant`: 100ms · `duration-fast`: 150ms · `duration-base`: 200ms · `duration-slow`: 250ms · `duration-shimmer`: 1400ms
*(Maps directly onto the timings already specified in Section 7 — this table exists so agents have a single named-token lookup instead of hardcoding ms values.)*

### 18.8 Border & Stroke Widths
`border-width-default`: 1px · `border-width-emphasis`: 2px (e.g., selected filter chip, error input) · `stroke-width-icon`: 1.5px (Section 13.2)

### 18.9 Component Dimensions
| Token | Value |
|---|---|
| `button-height-md` | 44px (meets Section 8 touch target) |
| `button-height-sm` | 36px (desktop-only dense contexts, e.g., admin) |
| `input-height` | 44px |
| `nav-height-mobile` | 56px |
| `nav-height-desktop` | 72px |
| `modal-width-sm` | 400px |
| `modal-width-md` | 560px |
| `bottom-sheet-max-height` | 90vh |
| `table-row-height-default` | 48px (storefront contexts) |
| `table-row-height-dense` | 36px (admin dashboard, Section 6.15) |

---

## 19. Responsive Philosophy

### 19.1 Mobile-First Foundation
Every component is designed and token-assigned at mobile size *first* (Principle #13, #15). Desktop styles are additive overrides, never a parallel design.

### 19.2 Tablet Expansion
Tablet (640–1024px) introduces the first multi-column moments (2-column product grid, side-by-side filters) but retains mobile's single-focus vertical rhythm for narrative sections (hero, brand story).

### 19.3 Desktop Expansion
Desktop (1024–1440px) expands grids further (3–4 column product grid), introduces persistent sidebars where useful (filters, cart summary in checkout), and increases type sizes per Section 4.2 — but **never rearranges the fundamental content order** established on mobile. If mobile order is Hero → Trust → Grid, desktop is the same order, just wider.

### 19.4 Large Monitor Behavior (>1440px)
Content is centered within `max 1320px` (Section 5.3) — never let text lines or product grids stretch edge-to-edge on ultra-wide monitors; excess space becomes additional side margin, not additional content density.

### 19.5 Component Adaptation Examples
- Navigation: bottom-anchored icon actions on mobile (cart/search) → full horizontal top nav on desktop.
- Filters: bottom sheet on mobile (Section 6.8) → persistent sidebar on desktop.
- Cart: full-screen or bottom-sheet on mobile → right-side drawer on desktop.

### 19.6 Touch Targets & Safe Areas
Minimum 44×44px touch targets hold at every breakpoint, including desktop with touch-screens (Surface, touch laptops). Respect iOS safe-area insets (`env(safe-area-inset-*)`) for any fixed bottom bar (sticky CTA, bottom nav) so content never sits under a home-indicator or notch.

### 19.7 Foldable Devices
Avoid fixed-height full-screen takeovers (e.g., modals pinned to 100vh) that could be clipped by a fold seam — prefer `max-height: 90vh` with internal scroll (Section 18.9) so content reflows safely around unpredictable viewport splits.

---

## 20. Motion Language (Expanded)

*Section 7 defines the core motion timing table and philosophy — this section expands implementation detail across every interaction surface. Section 7's rules remain unchanged and authoritative for timing/easing values.*

### 20.1 Motion Philosophy Restated
Motion answers "what just happened," never "look how fancy this app is" (Principle #9). Every animation must be justifiable in one sentence describing the state change it clarifies.

### 20.2 Scroll Behavior
Native momentum scroll only. No scroll-jacking, no custom scroll-hijack libraries, no scroll-triggered pinning of sections beyond a simple sticky nav/CTA (Section 17.10). Reveal-on-scroll animations for content (e.g., fade-up as sections enter viewport) are permitted at a subtle level — `duration-base` (200ms), 8–12px translate maximum — never a dramatic slide-in from off-screen.

### 20.3 Page Transitions
None, or a simple `duration-instant`–`duration-fast` (100–150ms) crossfade only. Never slide/wipe/3D-flip transitions between routes (Section 7 "Never" list).

### 20.4 Drawer & Bottom Sheet Motion
Slide in from the relevant edge (bottom for mobile sheets, right for desktop drawers) over `duration-slow` (250ms) with `ease-in-out`. Scrim fades in simultaneously. Dismissal is the reverse at the same duration — never faster on the way out, which reads jarring.

### 20.5 Drag Behavior
Bottom sheets may be drag-to-dismiss with a visible handle affordance; the sheet should track the finger 1:1 during drag (no lag/elastic overshoot beyond a small natural rubber-band at the boundary) and snap back or dismiss based on velocity/distance threshold, not a fixed timer.

### 20.6 Parallax Policy
**Not used**, anywhere, under any circumstance. Parallax reads as a marketing-site trend, not an editorial food-commerce interface, and ages poorly (Section 9 permanently rejects it).

### 20.7 What Should Never Animate
- Price changes (must update instantly and legibly — animating a price can read as manipulative)
- Critical error messages (appear instantly, no fade delay — delay reads as the system hiding something)
- Text content reflow (never animate paragraph reflow/line-height changes; it's disorienting, not delightful)

---

## 21. Accessibility Beyond WCAG

*Section 8 is the baseline compliance checklist and remains unchanged. This section addresses the specific human contexts of this brand's real audience.*

### 21.1 Keyboard Navigation
Full site must be operable via keyboard alone: logical tab order matching visual order, visible `color-focus-ring` on every focusable element (never `outline: none` without a replacement), and an accessible "skip to content" link as the first focusable element on every page.

### 21.2 Focus Management
On modal/bottom-sheet open, focus moves to the first interactive element inside it; on close, focus returns to the element that triggered it. Focus is never silently lost (e.g., after an "Add to Cart" toast appears, focus should not jump unexpectedly away from the button the user just pressed).

### 21.3 Screen Readers
All meaningful images require descriptive alt text (Section 8); purely decorative images (background motifs, Section 14.3) use empty `alt=""` so screen readers skip them. Price, discount, and stock-status changes are announced via `aria-live="polite"` regions so screen-reader users aren't left behind by silent UI updates (e.g., cart count changing).

### 21.4 Touch Ergonomics
Primary actions (Add to Cart, Checkout CTA) are positioned within comfortable one-thumb reach on mobile — lower half of the screen — reflecting how this audience actually holds a phone while scrolling with one hand on Facebook/TikTok referral traffic.

### 21.5 Vietnamese Readability
- Body font must render all Vietnamese diacritical marks (tonal marks especially) with clear, unclipped spacing at every weight — verify line-height (1.6, Section 4.2) accommodates stacked diacritics (e.g., "ễ," "ữ") without visual crowding.
- Never rely on all-caps for Vietnamese headlines — diacritics can become harder to read in all-caps rendering in some fonts; sentence case preserves legibility (this also aligns with Principle #16's rejection of all-caps urgency language).

### 21.6 Older or Less Tech-Confident Users
Even though the core audience is 18–35, gift-buyers and family members may be older/less tech-fluent. Maintain generous tap targets (Section 8), avoid gesture-only interactions without a visible fallback button (e.g., swipe-to-delete in cart must also have a visible "Remove" text/icon button), and avoid jargon in error messages.

### 21.7 Contrast Philosophy
Contrast is checked not just numerically (Section 3.10 note) but perceptually against real photography backdrops — text over any photo must pass contrast against the *busiest* likely region of that photo, not just an average sample, hence the mandatory scrim rule (Principle #14).

### 21.8 Form Validation
Validate inline, on blur (not on every keystroke, which feels punitive) — show success state as a subtle `color-success` check, not just the absence of an error. Error messages are specific and actionable ("Enter a valid phone number" not "Invalid input").

### 21.9 Reduced Motion
Respect `prefers-reduced-motion`: disable non-essential motion (hover scale, scroll-reveal, shimmer) and replace with instant state changes; essential feedback (e.g., a loading spinner) remains but drops any decorative easing/bounce.

### 21.10 Color Blindness
Beyond Section 8's baseline: the spice-level indicator (Section 13.6) never relies on a red/green scale alone — use a numeric scale (1–3 chili icons) so protanopia/deuteranopia users aren't dependent on hue discrimination for a genuinely important purchase decision (allergy/tolerance-adjacent).

---

## 22. Future Scalability

### 22.1 New Product Categories
New categories (e.g., beyond rice-paper snacks) inherit the full token system unchanged — only new category-tag colors (Section 3.7 pattern: low-saturation tint pairs) may be added, following the existing derivation rule (traceable to the real product, never arbitrary).

### 22.2 Seasonal Campaigns (e.g., Tết/Lunar New Year)
Seasonal moments may introduce temporary accent illustration motifs (Section 14.3) and limited-time hero photography — but must never override core tokens (no seasonal reskinning of `color-primary`, no seasonal font swaps). Seasonality lives in *content*, not in the *system*.

### 22.3 Dark Mode
Fully specified in Section 3.10 — future components must be built with both light and dark token sets from day one, never retrofitted. Activation logic (system-preference default, manual override, photography exempt from inversion) is defined in Section 3.10's closing note — treat that as binding, not just the color values.

### 22.4 Internationalization
If the brand expands beyond Vietnamese-speaking markets, typography (Section 4.1) must be re-validated for the new language's script support before launch; layout spacing should remain unchanged (the system's rhythm is language-agnostic), but copy length assumptions (Section 10.4 tone examples) will need re-authoring per locale, not machine-translated as-is.

### 22.5 Admin Expansion
New admin modules (e.g., inventory forecasting, supplier management) follow the Section 6.15 dense-mode token set (`table-row-height-dense`, `space-2`/`space-3`) rather than inventing a new internal design language.

### 22.6 Loyalty Programs
A future loyalty/points system should visualize progress using the existing `color-accent` (gold) family (already associatively "reward"-coded via ratings, Section 3.6) rather than introducing a new "premium" color like purple or navy, which would fracture the palette's single warm-toned identity.

### 22.7 Membership Tiers
If introduced, membership must avoid velvet-rope visual language (Section 10.1 Everyman archetype) — favor "regulars get treated well" framing (warm, inclusive) over "exclusive elite tier" framing (cold, aspirational), even if the underlying business model is tiered.

### 22.8 Future Branding Updates
Any future rebrand must pass a single test: **does the new decision still trace back to the real product (rice paper, chili, craft, warmth)?** If a proposed change can't answer that, it doesn't belong in this system, regardless of trend pressure (Principle #16, Section 9).

---

## 23. AI Agent Instructions

*This section exists specifically to reduce ambiguity for Taste Skill, Antigravity, Google Stitch, Claude Code, Cursor, Copilot, and any future AI coding agent generating interfaces from this document.*

1. **Never invent colors.** Only use tokens defined in Section 3 and Section 18. If a new semantic need arises (e.g., a new category tag), derive it using the existing low-saturation-tint pattern (Section 3.7) — do not introduce a new hue family.
2. **Never invent spacing.** Only use the `space-*` scale (Section 5.2/18.6). No arbitrary pixel values (e.g., no `padding: 13px`).
3. **Never invent typography.** Only use the defined font pairing (Section 4.1) and type scale (Section 4.2). No introducing a third typeface, no arbitrary font-weights outside 400/500/600/700.
4. **Never use values outside defined design tokens** — radius, shadow, duration, easing, z-index all have a fixed enumerated set (Section 18). If a value isn't in this document, it doesn't exist yet — flag it rather than guessing.
5. **Never randomly change component styles between pages.** A button on the homepage and a button on checkout must be pixel-identical in style unless this document explicitly differentiates them.
6. **Always prioritize consistency over novelty.** A boring, correct, on-system screen is always better than a creative but off-system one. This document optimizes for a 10-year lifespan, not this week's trend.
7. **Always use photography before illustration** wherever both could work (Section 11/14) — illustration is a fallback for states where photography is structurally impossible (empty states, errors), never a creative alternative to it.
8. **Always optimize for mobile first**, then verify the desktop expansion follows Section 19's rules (same content order, expanded grid — never a redesign).
9. **Always preserve hierarchy** — one primary CTA per screen (Section 17.9), one hero idea per viewport (Principle #1). If a generated screen has two loud elements, that's a bug, not a stylistic choice.
10. **Always cross-reference the Explicitly Rejected Patterns (Section 9)** before finalizing any new screen — treat it as a pre-flight checklist, not a one-time read.
11. **When uncertain, choose the calmer option.** Between a subtle and a dramatic version of any component, motion, or color choice, this brand's answer is always the subtler one (Section 10.2's low-Neuroticism personality mapping).
12. **Treat this document as version-controlled.** If you (the agent) believe a token or rule is missing, propose an addition in the format used throughout (value/reason/usage/do-not) rather than silently working around the gap with an ad hoc value.

---

## 24. Tailwind Mapping

*Semantic-to-implementation bridge. All CSS custom properties below map 1:1 to the tokens defined in Sections 3, 4, 5, and 18 — implementers should extend `tailwind.config` with these as the theme source rather than using Tailwind's default palette/spacing scale.*

### 24.1 Color
```
--color-brand-primary: #C1401C;
--color-brand-primary-hover: #A6350F;
--color-brand-primary-active: #8C2C0C;
--color-brand-secondary: #8A5A2B;
--color-brand-accent: #E0A526;

--color-background-default: #FDF8F1;
--color-background-alt: #F5EDE0;
--color-surface-default: #FFFFFF;
--color-surface-card: #FFFFFF;
--color-surface-card-hover: #FBF4E8;

--color-border-default: #E5D9C6;
--color-border-divider: #EFE6D8;
--color-border-focus: rgba(193,64,28,0.4);

--color-text-primary: #2B1D14;
--color-text-secondary: #5C4A3A;
--color-text-muted: #8A7A68;
--color-text-disabled: #B9AC9A;
--color-text-placeholder: #A69783;

--color-status-success: #3F7A4E;
--color-status-warning: #C98A1A;
--color-status-danger: #B23A2E;
--color-status-info: #5B7A94;

--color-commerce-price: var(--color-text-primary);
--color-commerce-sale: #B23A2E;
--color-commerce-discount-bg: #C1401C;
--color-commerce-discount-text: #FFFFFF;
--color-commerce-rating: #E0A526;
```

### 24.2 Radius
```
--radius-card: 12px;      /* radius-md */
--radius-input: 6px;      /* radius-sm */
--radius-surface: 20px;   /* radius-lg — modals, sheets, hero images */
--radius-pill: 999px;     /* radius-full — chips, badges, avatars */
```

### 24.3 Shadow
```
--shadow-surface: 0 1px 2px rgba(43,29,20,0.06);      /* shadow-sm */
--shadow-elevated: 0 4px 12px rgba(43,29,20,0.10);    /* shadow-md */
--shadow-overlay: 0 12px 32px rgba(43,29,20,0.16);    /* shadow-lg */
--shadow-focus: 0 0 0 3px rgba(193,64,28,0.4);
```

### 24.4 Spacing
```
--space-section: 4rem;      /* space-16, mobile section rhythm */
--space-section-lg: 6rem;   /* space-24, desktop section rhythm */
--space-component: 1rem;    /* space-4 */
--space-grid-gap: 1rem;     /* space-4 mobile / space-6 desktop, see 24.7 responsive notes */
```

### 24.5 Typography
```
--font-display: 'Fraunces', serif;
--font-body: 'Inter', sans-serif;
--text-display: 2.25rem;  /* mobile — see 4.2 for desktop clamp */
--text-h1: 1.75rem;
--text-h2: 1.5rem;
--text-h3: 1.125rem;
--text-body: 1rem;
--text-body-sm: 0.875rem;
--text-caption: 0.75rem;
```

### 24.6 Motion
```
--ease-out-brand: cubic-bezier(0.16, 1, 0.3, 1);
--ease-inout-brand: cubic-bezier(0.4, 0, 0.2, 1);
--duration-instant: 100ms;
--duration-fast: 150ms;
--duration-base: 200ms;
--duration-slow: 250ms;
```

### 24.7 Implementation Note for Agents
Extend Tailwind's theme (`tailwind.config.js` `theme.extend`) using these variables rather than Tailwind's default `slate`/`red`/`blue` palettes or default spacing/radius scale. Never reference a raw Tailwind utility like `bg-red-500` or `rounded-xl` directly in generated components — always route through the mapped semantic classes/variables above so the system stays a single source of truth (Section 23, Rule 4).

---

## 25. Governance

*This section restores and expands the governance model referenced in the v2.0 changelog. It defines who can change this document, how, and what threshold a change must clear — so the system stays a living standard rather than either (a) frozen and unable to absorb real product growth, or (b) eroded one well-intentioned exception at a time.*

### 25.1 Ownership
This document is owned by the brand/design function, not by any individual contributor, tool, or AI agent. No single generation (Antigravity, Claude, Copilot, Cursor, Google Stitch, Taste Skill, or any future agent) has authority to permanently alter a token, principle, or rule — an agent may *propose* a change (Section 23, Rule 12) but may not silently apply one.

### 25.2 What Requires a Version Bump
Any change to a value in Sections 3–9, 18, or 24 (a color, a type size, a spacing value, a motion timing, a rejected-pattern list) requires a version bump and a changelog entry, even if the change looks small. A one-pixel radius adjustment is still a system-wide decision, because every future agent will treat the old value as ground truth until told otherwise.

### 25.3 What Does Not Require a Version Bump
Purely additive clarifications that resolve an existing ambiguity without changing a value — e.g., adding a missing empty-state row, adding a cross-reference, adding a Table of Contents entry — may be folded into the next version's changelog as a single audit entry (see v2.1 above) rather than each requiring its own major version.

### 25.4 Change Threshold
A proposed change should be rejected by default. It should only be accepted if it demonstrably improves at least one of: consistency, scalability, clarity, maintainability, AI readability, brand cohesion, accessibility, or ecommerce UX — and does not weaken any other item on that list as a side effect. "I have another opinion" is never sufficient justification on its own (this mirrors the audit constraint this document itself was produced under).

### 25.5 Deprecation, Not Deletion
When a rule is superseded, mark it superseded in the changelog and point to its replacement rather than silently deleting it — future agents (and future humans) reading an old cached copy of this document, or a linked discussion referencing an old section number, should be able to trace what changed and why, not encounter a rule that has simply vanished.

### 25.6 Section Numbering Stability
Section numbers are permanent once published — a section may be marked deprecated or have content moved out of it, but its number is never reassigned to unrelated content. This is why Section 25 was reserved as "Governance" in the v2.0 changelog even before it was written: agents and humans may have already cited "Section 25" in tickets, prompts, or comments, and a silent renumbering would break every one of those references.

### 25.7 Conflict Resolution
If two sections appear to conflict (e.g., a general rule in Section 17 and a specific exception in Section 22), the more specific, more recently versioned section wins — but this should be treated as a bug to fix in the next audit pass, not a permanent ambiguity to route around indefinitely.

### 25.8 Who This Document Serves, in Priority Order
1. The end customer's trust and experience (does this rule serve Section 1.3's 2-second test).
2. The brand's long-term coherence (does this rule still hold in year 10, per Section 0).
3. Engineering/implementation efficiency (does this rule reduce, not add, ambiguity for the people and agents building from it).
Governance decisions that trade #1 for #3 (e.g., simplifying a rule purely because it's easier to code) should be flagged, not made silently.

---

## 26. Component Relationship & Cross-Reference Rules

*Sections 6, 16, and 17 each define individual components and page templates correctly, but a real screen stacks several of them at once — a product card carries a badge AND a rating AND a hover state; a PDP has a sticky CTA AND a trust signal AND a review section all competing for the same limited vertical space. This section makes those combinations explicit so an AI agent isn't left to infer priority when two correct-in-isolation rules meet on the same screen.*

### 26.1 Card + Badge + Rating + Price (Product Card, full stack)
When all four elements appear on one card (Section 6.4, 6.13, 3.6): badge sits top-left or top-right corner overlaying the image (never pushing the image down), rating sits directly below the product name, price sits last and bottom-aligned within the card regardless of description length — cards in the same grid row must have their price baseline aligned even if descriptions vary in length (use a fixed-height description area or flex-grow spacer, never let price float at different heights row-to-row).

### 26.2 Sticky CTA + Trust Signal + Navigation (Mobile PDP, full stack)
Section 17.10 already rules that only one element should be sticky at a time — when the sticky Add-to-Cart bar (16.3) is active, the trust signal (17.2, "free shipping over X" / return policy) lives directly *inside* that same sticky bar as small-print beneath or beside the CTA, rather than as a second independently-positioned sticky element. Two separately-sticking bars stacking at the bottom of the viewport is a bug, not a design choice.

### 26.3 Discount Badge + Sale Price + Strikethrough (Pricing, full stack)
When a product is both badged "-15%" (3.6) and shown with a struck-through original price (17.5): the badge communicates the *offer*, the strikethrough communicates the *comparison* — do not duplicate the percentage inside both the badge and a second nearby text label; state the discount once, let the two elements do distinct jobs.

### 26.4 Empty State + Cross-Sell (Cart Empty, Search Empty)
Per 14.3, an empty state always pairs its illustration/copy with a concrete next step (bestsellers, popular categories) — that next-step content uses the same product card component (6.4) as everywhere else in the system, not a simplified or differently-styled "recommendation" card. Consistency (Principle #11) applies even to states most systems treat as an afterthought.

### 26.5 Modal/Sheet + Scrim + Sticky Element Interaction
When a modal or bottom sheet (6.12) opens over a screen that has a sticky CTA or sticky nav (17.10), the sticky element is visually behind the scrim (`z-modal-scrim`, 18.4) and must not remain interactive or visible above the scrim — a sticky Add-to-Cart bar peeking above a modal's scrim is a z-index bug, not an intentional layering choice.

### 26.6 Review Verified-Badge + Star Rating + Photo
On an individual review (6.14), when a reviewer includes a photo, the verified-purchase indicator and star rating remain in their standard position (above/beside the reviewer name) — the photo does not get promoted to replace or crowd out the rating, even though user photos are a strong trust signal (11.6); rating stays the primary scannable trust element, photo is supporting evidence.

### 26.7 Priority Rule When Two Guidelines Genuinely Compete
If following two component rules simultaneously would violate Principle #1 (one idea per screen) or Section 17.9 (one primary CTA per screen), resolve using the Emotional Hierarchy in Section 10.5 (Trust > Appetite > Warmth > Delight) — the element serving the higher-priority emotional goal keeps its full visual weight; the other steps back to a secondary/ghost treatment (Section 6.3) rather than both competing at full strength.

---