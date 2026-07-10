import { z } from 'zod';

// ── Guest Cart Item (localStorage) ────────────────────────────────────────────────
// D2: no variantId — just productId + quantity.
// There is no server-side cart: checkout is guest-only, and the cart lives entirely
// in the storefront's browser storage until it is submitted as POST /orders items[].

export const guestCartItemSchema = z.object({
  productId: z.string(),
  quantity: z.number().int().positive(),
  // Denormalised for display — not trusted for pricing at checkout
  name: z.string().optional(),
  price: z.number().nonnegative().optional(),
  imageUrl: z.string().optional(),
  slug: z.string().optional(),
  stock: z.number().int().nonnegative().optional(),
});

export type GuestCartItem = z.infer<typeof guestCartItemSchema>;
