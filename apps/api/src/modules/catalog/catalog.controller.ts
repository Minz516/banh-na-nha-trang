import type { Request, Response, NextFunction } from 'express';
import { CatalogService } from './catalog.service.js';
import { CatalogDTO } from './catalog.dto.js';
import { productQuerySchema, createProductBodySchema, updateProductBodySchema, createCategoryBodySchema, updateCategoryBodySchema, updateStockBodySchema } from '@repo/shared-types';

export const CatalogController = {
  // ── Products (Public) ─────────────────────────────────────────────────────────

  async listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = productQuerySchema.parse(req.query);
      const { products, total } = await CatalogService.queryProducts(query);
      const totalPages = Math.ceil(total / query.limit);
      res.json({
        success: true,
        message: 'OK',
        data: products.map(CatalogDTO.productResponse),
        meta: { total, page: query.page, limit: query.limit, totalPages, hasNextPage: query.page < totalPages, hasPrevPage: query.page > 1 },
      });
    } catch (err) {
      next(err);
    }
  },

  async getProductBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const product = await CatalogService.getProductBySlug(req.params.slug!);
      res.json({ success: true, message: 'OK', data: CatalogDTO.productResponse(product), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async listCategories(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cats = await CatalogService.listCategories();
      res.json({ success: true, message: 'OK', data: cats.map(CatalogDTO.categoryResponse), meta: null });
    } catch (err) {
      next(err);
    }
  },

  // ── Products (Admin) ──────────────────────────────────────────────────────────

  async createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createProductBodySchema.parse(req.body);
      const product = await CatalogService.createProduct(body);
      res.status(201).json({ success: true, message: 'Tạo sản phẩm thành công', data: CatalogDTO.productResponse(product), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async bulkCreateProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bodies = (req.body as unknown[]).map((b) => createProductBodySchema.parse(b));
      const products = await CatalogService.bulkCreateProducts(bodies);
      res.status(201).json({ success: true, message: `Đã tạo ${products.length} sản phẩm`, data: products.map(CatalogDTO.productResponse), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateProductBodySchema.parse(req.body);
      const product = await CatalogService.updateProduct(req.params.id!, body);
      res.json({ success: true, message: 'Cập nhật sản phẩm thành công', data: CatalogDTO.productResponse(product), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async updateStock(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateStockBodySchema.parse(req.body);
      const product = await CatalogService.updateStock(req.params.id!, body as { delta?: number; stock?: number });
      res.json({ success: true, message: 'Cập nhật tồn kho thành công', data: CatalogDTO.productResponse(product), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CatalogService.deleteProduct(req.params.id!);
      res.json({ success: true, message: 'Xóa sản phẩm thành công', data: null, meta: null });
    } catch (err) {
      next(err);
    }
  },

  // ── Categories (Admin) ────────────────────────────────────────────────────────

  async createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createCategoryBodySchema.parse(req.body);
      const cat = await CatalogService.createCategory(body);
      res.status(201).json({ success: true, message: 'Tạo danh mục thành công', data: CatalogDTO.categoryResponse(cat), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateCategoryBodySchema.parse(req.body);
      const cat = await CatalogService.updateCategory(req.params.id!, body);
      res.json({ success: true, message: 'Cập nhật danh mục thành công', data: CatalogDTO.categoryResponse(cat), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CatalogService.deleteCategory(req.params.id!);
      res.json({ success: true, message: 'Xóa danh mục thành công', data: null, meta: null });
    } catch (err) {
      next(err);
    }
  },
};
