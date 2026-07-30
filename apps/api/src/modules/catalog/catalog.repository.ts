import mongoose from 'mongoose';
import { ProductModel, CategoryModel, type IProduct, type ICategory } from './catalog.model.js';
import type { ProductQuery } from '@repo/shared-types';

export const CatalogRepository = {
  // ── Products ──────────────────────────────────────────────────────────────────

  async findProductBySlug(slug: string): Promise<IProduct | null> {
    return ProductModel.findOne({ slug, isActive: true });
  },

  async findProductById(id: string): Promise<IProduct | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    return ProductModel.findById(id);
  },

  async queryProducts(query: ProductQuery, includeInactive = false): Promise<{ products: IProduct[]; total: number }> {
    const filter: Record<string, unknown> = includeInactive ? {} : { isActive: true };

    if (query.category) {
      const cat = await CategoryModel.findOne({ slug: query.category, isActive: true });
      if (cat) filter.categoryId = cat._id;
      else return { products: [], total: 0 };
    }
    if (query.isFeatured !== undefined) filter.isFeatured = query.isFeatured;
    if (query.isNewArrival !== undefined) filter.isNewArrival = query.isNewArrival;
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      filter.basePrice = {};
      if (query.minPrice !== undefined) (filter.basePrice as Record<string, number>).$gte = query.minPrice;
      if (query.maxPrice !== undefined) (filter.basePrice as Record<string, number>).$lte = query.maxPrice;
    }
    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const page = query.page;
    const limit = query.limit;

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ProductModel.countDocuments(filter),
    ]);

    return { products, total };
  },

  async createProduct(data: Partial<IProduct>): Promise<IProduct> {
    return new ProductModel(data).save();
  },

  async updateProduct(id: string, data: Partial<IProduct>): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async deleteProduct(id: string): Promise<void> {
    await ProductModel.findByIdAndDelete(id);
  },

  /**
   * D4: Atomic stock decrement — prevents overselling when two customers order simultaneously.
   * Returns null if insufficient stock.
   */
  async decrementStock(productId: string, qty: number): Promise<IProduct | null> {
    return ProductModel.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(productId), stock: { $gte: qty }, isActive: true },
      { $inc: { stock: -qty } },
      { new: true }
    );
  },

  async incrementStock(productId: string, qty: number): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(productId, { $inc: { stock: qty } }, { new: true });
  },

  async setStock(id: string, stock: number): Promise<IProduct | null> {
    return ProductModel.findByIdAndUpdate(id, { $set: { stock } }, { new: true });
  },

  // ── Categories ─────────────────────────────────────────────────────────────────

  async findCategoryBySlug(slug: string): Promise<ICategory | null> {
    return CategoryModel.findOne({ slug, isActive: true });
  },

  async findCategoryById(id: string): Promise<ICategory | null> {
    return CategoryModel.findById(id);
  },

  async listCategories(): Promise<ICategory[]> {
    return CategoryModel.find({ isActive: true }).sort({ sortOrder: 1, createdAt: 1 });
  },

  async createCategory(data: Partial<ICategory>): Promise<ICategory> {
    return new CategoryModel(data).save();
  },

  async updateCategory(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
    return CategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async deleteCategory(id: string): Promise<void> {
    await CategoryModel.findByIdAndDelete(id);
  },

  async getProductsByIds(ids: string[]): Promise<IProduct[]> {
    const validIds = ids.filter((id) => mongoose.isValidObjectId(id));
    if (validIds.length === 0) return [];
    return ProductModel.find({ _id: { $in: validIds }, isActive: true });
  },
};
