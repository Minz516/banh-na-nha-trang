import { z } from 'zod';

// ── Upload Response ────────────────────────────────────────────────────────────────

export const uploadResponseSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  format: z.string().optional(),
  bytes: z.number().int().nonnegative().optional(),
});

export type UploadResponse = z.infer<typeof uploadResponseSchema>;
