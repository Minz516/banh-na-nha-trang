import type { Request, Response, NextFunction } from 'express';
import { CartService } from './cart.service.js';
import { CartDTO } from './cart.dto.js';
import { CartRepository } from './cart.repository.js';
import { CatalogInterfaces } from '../catalog/catalog.interfaces.js';
import { addToCartBodySchema, updateCartItemBodySchema } from '@repo/shared-types';

export const CartController = {
  async getCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.getCart(req.user!.userId);
      const productIds = cart.items?.map((i) => i.productId.toString()) ?? [];
      const products = productIds.length ? await CatalogInterfaces.getProductsByIds(productIds) : [];
      res.json({ success: true, message: 'OK', data: CartDTO.cartResponse(cart, products), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async addItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = addToCartBodySchema.parse(req.body);
      const cart = await CartService.addItem(req.user!.userId, body.productId, body.quantity);
      res.status(201).json({ success: true, message: 'Đã thêm vào giỏ hàng', data: cart, meta: null });
    } catch (err) {
      next(err);
    }
  },

  async updateItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateCartItemBodySchema.parse(req.body);
      const cart = await CartService.updateItem(req.user!.userId, req.params.itemId!, body.quantity);
      res.json({ success: true, message: 'Cập nhật giỏ hàng thành công', data: cart, meta: null });
    } catch (err) {
      next(err);
    }
  },

  async removeItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const cart = await CartService.removeItem(req.user!.userId, req.params.itemId!);
      res.json({ success: true, message: 'Đã xóa sản phẩm khỏi giỏ hàng', data: cart, meta: null });
    } catch (err) {
      next(err);
    }
  },

  async clearCart(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await CartService.clearCart(req.user!.userId);
      res.json({ success: true, message: 'Đã xóa giỏ hàng', data: null, meta: null });
    } catch (err) {
      next(err);
    }
  },
};
