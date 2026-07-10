import { AppError } from '../../middlewares/errorMiddleware.js';
import { CartRepository } from './cart.repository.js';
import { CatalogInterfaces } from '../catalog/catalog.interfaces.js';
import type { ICart } from './cart.model.js';

export const CartService = {
  async getCart(userId: string): Promise<ICart> {
    const cart = await CartRepository.findByUserId(userId);
    if (!cart) return { items: [] } as unknown as ICart;
    return cart;
  },

  async addItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    const product = await CatalogInterfaces.getProductById(productId);
    if (!product || !product.isActive) throw new AppError(404, 'Sản phẩm không tồn tại');
    if (product.stock < quantity) throw new AppError(400, `Chỉ còn ${product.stock} sản phẩm trong kho`);
    return CartRepository.upsertItem(userId, productId, quantity);
  },

  async updateItem(userId: string, itemId: string, quantity: number): Promise<ICart | null> {
    return CartRepository.updateItem(userId, itemId, quantity);
  },

  async removeItem(userId: string, itemId: string): Promise<ICart | null> {
    return CartRepository.removeItem(userId, itemId);
  },

  async clearCart(userId: string): Promise<void> {
    return CartRepository.clearCart(userId);
  },
};
