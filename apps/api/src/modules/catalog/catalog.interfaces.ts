import { CatalogRepository } from './catalog.repository.js';
import type { IProduct } from './catalog.model.js';

/**
 * Public interface for cross-module catalog access.
 * Order and voucher modules import from here.
 */
export const CatalogInterfaces = {
  async getProductById(id: string): Promise<IProduct | null> {
    return CatalogRepository.findProductById(id);
  },

  /**
   * Returns a snapshot for embedding in an order item (immutable at order time).
   */
  async getProductSnapshot(productId: string) {
    const product = await CatalogRepository.findProductById(productId);
    if (!product) return null;
    return {
      productId: product._id.toString(),
      name: product.name,
      slug: product.slug,
      image: product.images[0]?.url ?? null,
      flavor: product.flavor ?? null,
      unitPrice: product.promoPrice ?? product.basePrice,
    };
  },

  /**
   * D4: Atomic stock decrement — returns null if insufficient stock.
   */
  async decrementStock(productId: string, qty: number): Promise<IProduct | null> {
    return CatalogRepository.decrementStock(productId, qty);
  },

  async incrementStock(productId: string, qty: number): Promise<IProduct | null> {
    return CatalogRepository.incrementStock(productId, qty);
  },

  async getProductsByIds(ids: string[]): Promise<IProduct[]> {
    return CatalogRepository.getProductsByIds(ids);
  },
};
