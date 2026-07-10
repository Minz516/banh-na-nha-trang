import { z } from 'zod';

// ── Register ─────────────────────────────────────────────────────────────────────

export const registerBodySchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu tối thiểu 6 ký tự'),
  fullName: z.string().min(2, 'Tên tối thiểu 2 ký tự'),
  phone: z.string().min(9, 'Số điện thoại không hợp lệ'),
});

export type RegisterBody = z.infer<typeof registerBodySchema>;

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
  role: z.enum(['customer', 'admin']),
  isActive: z.boolean(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

// ── JWT Payload ───────────────────────────────────────────────────────────────────

export const jwtPayloadSchema = z.object({
  userId: z.string(),
  email: z.string(),
  role: z.enum(['customer', 'admin']),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
