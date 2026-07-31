import { z } from 'zod';

// Admin/staff login only — there is no customer-facing registration or account.
// Checkout is guest-only; Customer records come from the checkout form, not a User.

// ── Roles ────────────────────────────────────────────────────────────────────────
// 'admin' — the shop owner: everything, including destructive actions and
//   financial controls (vouchers, deleting products/categories/blog content,
//   exporting customer data, managing other Users).
// 'staff' — day-to-day operators: orders, POS, product/blog editing, uploads.
//   Cannot delete catalog/blog content, cannot touch vouchers, cannot export
//   customer PII, cannot manage Users.

export const userRoleSchema = z.enum(['admin', 'staff']);

export type UserRole = z.infer<typeof userRoleSchema>;

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
  role: userRoleSchema,
});

export type AuthUser = z.infer<typeof authUserSchema>;

// ── User management (admin only) ────────────────────────────────────────────────

export const createUserBodySchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(8, 'Mật khẩu tối thiểu 8 ký tự'),
  phone: z.string().trim().optional(),
  role: userRoleSchema.default('staff'),
});

export type CreateUserBody = z.infer<typeof createUserBodySchema>;

export const updateUserBodySchema = z
  .object({
    role: userRoleSchema.optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => data.role !== undefined || data.isActive !== undefined, {
    message: 'Cần ít nhất một trường để cập nhật',
  });

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

// ── JWT Payload ───────────────────────────────────────────────────────────────────
// Deliberately excludes `role`: role is re-read from the DB on every request
// (see authMiddleware.verifyToken) so a role change takes effect immediately
// instead of waiting up to 15 minutes for the holder's access_token to expire —
// the same reasoning the existing isActive re-check already uses.

export const jwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
