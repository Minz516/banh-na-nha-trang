import { z } from 'zod';

// ── Product Image ─────────────────────────────────────────────────────────────────

export const productImageSchema = z.object({
  url: z.string().url(),
  publicId: z.string(),
  alt: z.string().optional().default(''),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  sortOrder: z.number().int().default(0),
});

export type ProductImage = z.infer<typeof productImageSchema>;

// ── Product ───────────────────────────────────────────────────────────────────────
// D2: flat product — no variants. One price, one stock count, one optional flavor.

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  categoryId: z.string(),
  flavor: z.string().optional().nullable(),
  images: z.array(productImageSchema),
  basePrice: z.number().nonnegative(),
  promoPrice: z.number().nonnegative().nullable(),
  stock: z.number().int().nonnegative(),
  tags: z.array(z.string()),
  isFeatured: z.boolean(),
  isNewArrival: z.boolean(),
  isActive: z.boolean(),
  metaTitle: z.string().optional().nullable(),
  metaDescription: z.string().optional().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Product = z.infer<typeof productSchema>;

// ── Create Product ────────────────────────────────────────────────────────────────

export const createProductBodySchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm tối thiểu 2 ký tự'),
  description: z.string().min(10, 'Mô tả tối thiểu 10 ký tự'),
  categoryId: z.string().min(1, 'Danh mục là bắt buộc'),
  flavor: z.string().optional(),
  basePrice: z.number().nonnegative('Giá không được âm'),
  promoPrice: z.number().nonnegative().nullable().optional(),
  stock: z.number().int().nonnegative().default(0),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

export type CreateProductBody = z.infer<typeof createProductBodySchema>;

// ── Update Product ────────────────────────────────────────────────────────────────

export const updateProductBodySchema = createProductBodySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateProductBody = z.infer<typeof updateProductBodySchema>;

// ── Update Product Stock ──────────────────────────────────────────────────────────

export const updateStockBodySchema = z.union([
  z.object({ delta: z.number().int() }),
  z.object({ stock: z.number().int().nonnegative() }),
]);

export type UpdateStockBody = z.infer<typeof updateStockBodySchema>;

// ── Product Query ─────────────────────────────────────────────────────────────────

export const productQuerySchema = z.object({
  category: z.string().optional(),
  search: z.string().optional(),
  isFeatured: z.coerce.boolean().optional(),
  isNewArrival: z.coerce.boolean().optional(),
  minPrice: z.coerce.number().nonnegative().optional(),
  maxPrice: z.coerce.number().nonnegative().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(12),
});

export type ProductQuery = z.infer<typeof productQuerySchema>;

// ── Category ──────────────────────────────────────────────────────────────────────

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryBodySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  image: z.string().optional(),
  sortOrder: z.number().int().default(0),
});

export type CreateCategoryBody = z.infer<typeof createCategoryBodySchema>;

export const updateCategoryBodySchema = createCategoryBodySchema.partial().extend({
  isActive: z.boolean().optional(),
});

export type UpdateCategoryBody = z.infer<typeof updateCategoryBodySchema>;
