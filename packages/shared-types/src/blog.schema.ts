import { z } from 'zod';
import { productSchema } from './catalog.schema.js';

// ── Post Category ─────────────────────────────────────────────────────────────────

export const postCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type PostCategory = z.infer<typeof postCategorySchema>;

export const createPostCategoryBodySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type CreatePostCategoryBody = z.infer<typeof createPostCategoryBodySchema>;

export const updatePostCategoryBodySchema = createPostCategoryBodySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdatePostCategoryBody = z.infer<typeof updatePostCategoryBodySchema>;

// ── Cover Image ────────────────────────────────────────────────────────────────────

export const coverImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  alt: z.string().optional().default(''),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
});

export type CoverImage = z.infer<typeof coverImageSchema>;

// ── Post ──────────────────────────────────────────────────────────────────────────

export const postStatusSchema = z.enum(['draft', 'published']);
export type PostStatus = z.infer<typeof postStatusSchema>;

export const postSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string(),
  content: z.string(), // markdown
  coverImage: coverImageSchema.nullable(),
  category: z.object({ id: z.string(), name: z.string(), slug: z.string() }).nullable(),
  // relatedProducts: populated products — the conversion bridge between blog and shop
  relatedProducts: z.array(productSchema),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  status: postStatusSchema,
  publishedAt: z.string().nullable(),
  readingMinutes: z.number().int().nonnegative(),
  viewCount: z.number().int().nonnegative(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Post = z.infer<typeof postSchema>;

// ── Create/Update Post ────────────────────────────────────────────────────────────

export const createPostBodySchema = z.object({
  title: z.string().min(5, 'Tiêu đề tối thiểu 5 ký tự'),
  excerpt: z.string().min(20, 'Mô tả ngắn tối thiểu 20 ký tự'),
  content: z.string().min(50, 'Nội dung tối thiểu 50 ký tự'),
  categoryId: z.string().optional(),
  relatedProductIds: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  status: postStatusSchema.default('draft'),
});

export type CreatePostBody = z.infer<typeof createPostBodySchema>;

export const updatePostBodySchema = createPostBodySchema.partial();
export type UpdatePostBody = z.infer<typeof updatePostBodySchema>;

// ── Post Query ─────────────────────────────────────────────────────────────────────

export const postQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(50).default(9),
});

export type PostQuery = z.infer<typeof postQuerySchema>;
