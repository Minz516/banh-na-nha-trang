import { z } from 'zod';

// ── Customer ──────────────────────────────────────────────────────────────────────
// Created/updated only from the guest checkout form (fullName, phone, email) — there
// is no customer account, so this never links to a User and has no self-service update.

export const customerSchema = z.object({
  id: z.string(),
  phone: z.string(),
  fullName: z.string(),
  email: z.string().email().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  totalOrders: z.number(),
  totalSpent: z.number(),
  notes: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Customer = z.infer<typeof customerSchema>;

// ── Customer Snapshot (embedded in Order) ────────────────────────────────────────

export const customerSnapshotSchema = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type CustomerSnapshot = z.infer<typeof customerSnapshotSchema>;
