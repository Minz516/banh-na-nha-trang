import { AppError } from '../../middlewares/errorMiddleware.js';
import { CatalogRepository } from './catalog.repository.js';
import { eventBus, AppEvents } from '../../utils/eventBus.js';
import type { ProductQuery, CreateProductBody, UpdateProductBody, CreateCategoryBody, UpdateCategoryBody } from '@repo/shared-types';
import type { IProduct, ICategory } from './catalog.model.js';

const STOCK_LOW_THRESHOLD = 5;

export const CatalogService = {
  // ── Products ──────────────────────────────────────────────────────────────────

  async queryProducts(query: ProductQuery) {
    return CatalogRepository.queryProducts(query);
  },

  async getProductBySlug(slug: string): Promise<IProduct> {
    const product = await CatalogRepository.findProductBySlug(slug);
    if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');
    return product;
  },

  async createProduct(body: CreateProductBody): Promise<IProduct> {
    return CatalogRepository.createProduct(body as Partial<IProduct>);
  },

  async bulkCreateProducts(bodies: CreateProductBody[]): Promise<IProduct[]> {
    return Promise.all(bodies.map((b) => CatalogRepository.createProduct(b as Partial<IProduct>)));
  },

  async updateProduct(id: string, body: UpdateProductBody): Promise<IProduct> {
    const updated = await CatalogRepository.updateProduct(id, body as Partial<IProduct>);
    if (!updated) throw new AppError(404, 'Không tìm thấy sản phẩm');
    return updated;
  },

  async updateStock(id: string, body: { delta?: number; stock?: number }): Promise<IProduct> {
    let updated: IProduct | null;
    if (body.stock !== undefined) {
      updated = await CatalogRepository.setStock(id, body.stock);
    } else if (body.delta !== undefined) {
      if (body.delta < 0) {
        updated = await CatalogRepository.decrementStock(id, Math.abs(body.delta));
        if (!updated) throw new AppError(400, 'Không đủ hàng tồn kho');
      } else {
        updated = await CatalogRepository.incrementStock(id, body.delta);
      }
    } else {
      throw new AppError(400, 'Phải cung cấp delta hoặc stock');
    }
    if (!updated) throw new AppError(404, 'Không tìm thấy sản phẩm');
    if (updated.stock <= STOCK_LOW_THRESHOLD) {
      eventBus.emit(AppEvents.STOCK_LOW, { productId: updated._id.toString(), stock: updated.stock });
    }
    return updated;
  },

  async deleteProduct(id: string): Promise<void> {
    const product = await CatalogRepository.findProductById(id);
    if (!product) throw new AppError(404, 'Không tìm thấy sản phẩm');
    await CatalogRepository.deleteProduct(id);
  },

  // ── Categories ─────────────────────────────────────────────────────────────────

  async listCategories(): Promise<ICategory[]> {
    return CatalogRepository.listCategories();
  },

  async getCategoryBySlug(slug: string): Promise<ICategory> {
    const cat = await CatalogRepository.findCategoryBySlug(slug);
    if (!cat) throw new AppError(404, 'Không tìm thấy danh mục');
    return cat;
  },

  async createCategory(body: CreateCategoryBody): Promise<ICategory> {
    return CatalogRepository.createCategory(body as Partial<ICategory>);
  },

  async updateCategory(id: string, body: UpdateCategoryBody): Promise<ICategory> {
    const updated = await CatalogRepository.updateCategory(id, body as Partial<ICategory>);
    if (!updated) throw new AppError(404, 'Không tìm thấy danh mục');
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    const cat = await CatalogRepository.findCategoryById(id);
    if (!cat) throw new AppError(404, 'Không tìm thấy danh mục');
    await CatalogRepository.deleteCategory(id);
  },
};
