import { z } from 'zod';

// Admin/staff login only — there is no customer-facing registration or account.
// Checkout is guest-only; Customer records come from the checkout form, not a User.

// ── Login ────────────────────────────────────────────────────────────────────────

export const loginBodySchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(1, 'Vui lòng nhập mật khẩu'),
});

export type LoginBody = z.infer<typeof loginBodySchema>;

// ── Auth Response ─────────────────────────────────────────────────────────────────

export const authUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  isActive: z.boolean(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

// ── JWT Payload ───────────────────────────────────────────────────────────────────

export const jwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
