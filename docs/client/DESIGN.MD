---
name: Premium Artisanal Narrative
colors:
  surface: '#fff8f6'
  surface-dim: '#edd5cf'
  surface-bright: '#fff8f6'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1ed'
  surface-container: '#ffe9e4'
  surface-container-high: '#fce3dd'
  surface-container-highest: '#f6ddd7'
  on-surface: '#261815'
  on-surface-variant: '#59413b'
  inverse-surface: '#3c2d29'
  inverse-on-surface: '#ffede9'
  outline: '#8d7169'
  outline-variant: '#e1bfb7'
  surface-tint: '#ad320e'
  primary: '#9f2803'
  on-primary: '#ffffff'
  primary-container: '#c1401c'
  on-primary-container: '#ffebe6'
  inverse-primary: '#ffb5a1'
  secondary: '#835425'
  on-secondary: '#ffffff'
  secondary-container: '#febf87'
  on-secondary-container: '#794c1e'
  tertiary: '#005793'
  on-tertiary: '#ffffff'
  tertiary-container: '#0070bb'
  on-tertiary-container: '#e8f0ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a1'
  on-primary-fixed: '#3c0800'
  on-primary-fixed-variant: '#881f00'
  secondary-fixed: '#ffdcc0'
  secondary-fixed-dim: '#f8ba82'
  on-secondary-fixed: '#2d1600'
  on-secondary-fixed-variant: '#673d10'
  tertiary-fixed: '#d1e4ff'
  tertiary-fixed-dim: '#9ecaff'
  on-tertiary-fixed: '#001d36'
  on-tertiary-fixed-variant: '#00497d'
  background: '#fff8f6'
  on-background: '#261815'
  surface-variant: '#f6ddd7'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 48px
    fontWeight: '600'
    lineHeight: 56px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-md:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Newsreader
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 26px
  body-lg:
    fontFamily: Public Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Public Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Public Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Public Sans
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  container-max: 1200px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 40px
---

## Brand & Style
The design system is anchored in an **Editorial Minimalism** aesthetic that blends "Apple-level restraint" with the tactile warmth of high-end Vietnamese craft. It targets a discerning audience that values heritage, quality, and the story behind their food.

The visual narrative is built on:
- **Quiet Luxury:** Using generous white space and high-contrast typography to create an uncluttered, calm environment.
- **Warm Hospitality:** Eschewing clinical whites for organic, cream-based tones that evoke handmade paper and natural ingredients.
- **Modern Heritage:** Pairing traditional humanist serifs with precise, systematic sans-serifs to bridge the gap between ancient craft and modern convenience.
- **Iconography:** Strokes are strictly 1.5px, utilizing thin, open paths to maintain an airy and sophisticated feel.

## Colors
The palette is inspired by natural spices and earth tones found in Vietnamese cuisine.

- **Primary (#C1401C):** A vibrant chili-red reserved for high-intent actions, primary buttons, and active navigational states.
- **Secondary (#8A5A2B):** A roasted brown used for structural elements and grounding the brand's premium feel.
- **Backgrounds:** The interface lives on **Warm Cream (#FDF8F1)** to reduce eye strain and provide a "paper-like" canvas. Use the **Alt Background (#F5EDE0)** for section differentiation.
- **Surface:** Pure white is used exclusively for product cards to make the items "pop" against the cream background.
- **Hierarchy:** All text follows a strict hierarchy from near-black primary text to earthy muted tones for metadata.

## Typography
This design system uses a curated pairing of **Newsreader** (Serif) and **Public Sans** (Sans-Serif).

- **Tone:** Use Newsreader for all editorial headings to establish a storytelling tone. Public Sans is used for functional UI and long-form body text for maximum clarity.
- **Casing:** Apply **sentence case** for all headings, labels, and buttons to maintain a friendly, approachable voice. Avoid all-caps even for small labels.
- **Scale:** Maintain generous line heights (1.5x for body) to preserve the airy, editorial feel. 
- **Hierarchy:** Reserve the larger Display sizes for hero sections and product titles on landing pages.

## Layout & Spacing
The layout philosophy is based on a **Fluid Grid with Generous Margins**.

- **Grid Model:** 12-column grid for desktop, 4-column for mobile.
- **Rhythm:** An 8px base unit (with a 4px half-step for tight UI) governs all spacing.
- **Negative Space:** Elements should feel like they have room to "breathe." Use `xl` (40px) or `xxl` (64px) spacing between major content sections to reinforce the premium editorial feel.
- **Safe Areas:** Maintain a minimum 16px margin on mobile devices to prevent content from touching the screen edges.

## Elevation & Depth
Depth is created through subtle tonal shifts and soft, ambient shadows rather than harsh borders or heavy gradients.

- **The "Paper" Stack:** The main background (#FDF8F1) is the lowest level. Secondary sections use the Alt Background (#F5EDE0) to create a visual "recess."
- **Soft Shadows:** Use a single, extra-diffused shadow for elevated elements: `0px 4px 20px rgba(43, 29, 20, 0.08)`. This shadow has a slight brown tint to remain harmonious with the warm palette.
- **Product Elevation:** White cards (#FFFFFF) should always carry the soft shadow to distinguish them from the cream canvas.
- **Interaction:** On hover, buttons and cards should slightly increase their shadow spread to simulate physical lifting.

## Shapes
The shape language is "Softly Geometric," avoiding sharp industrial edges in favor of organic, friendly curves.

- **Standard Elements:** Buttons, input fields, and product cards use a **12px** radius.
- **Featured Elements:** Modals, hero images, and primary banners use a more pronounced **20px** radius to feel more inviting.
- **Pill Shapes:** Reserved exclusively for tags, badges, and chips to clearly differentiate them from actionable buttons.

## Components
Consistent application of the design system across core components:

- **Buttons:**
  - **Primary:** Chili Red-Orange background, White text, 12px radius. 
  - **Secondary:** Transparent with a 1.5px border in Roasted Brown or standard Border color.
- **Product Cards:** Must be Pure White (#FFFFFF) with a 12px radius and the soft ambient shadow. Product names in Newsreader 18px.
- **Chips/Badges:** Pill-shaped. Use Turmeric Gold (#E0A526) for ratings or "Handmade" callouts.
- **Input Fields:** 12px radius, Warm Cream (#FDF8F1) or White fill with a thin 1px border (#E5D9C6). Labels in Public Sans 14px Semibold.
- **Lists:** Use the Divider color (#EFE6D8) for thin, horizontal separations. Provide at least 16px of vertical padding between list items.
- **Iconography:** Use thin-stroke (1.5px) icons. Icons should be monochrome using the Secondary Text color (#5C4A3A) unless active.