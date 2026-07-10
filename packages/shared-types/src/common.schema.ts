import { z } from 'zod';

// ── Response Envelope ────────────────────────────────────────────────────────────

export const paginationMetaSchema = z.object({
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPrevPage: z.boolean(),
});

export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

export const successResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
    meta: paginationMetaSchema.nullable(),
  });

export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    statusCode: z.number(),
    message: z.string(),
    cause: z.unknown().nullable(),
  }),
});

export type ErrorResponse = z.infer<typeof errorResponseSchema>;

// ── Pagination Query ─────────────────────────────────────────────────────────────

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
