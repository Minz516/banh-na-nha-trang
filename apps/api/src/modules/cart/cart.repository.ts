import mongoose from 'mongoose';
import { CartModel, type ICart } from './cart.model.js';

export const CartRepository = {
  async findByUserId(userId: string): Promise<ICart | null> {
    return CartModel.findOne({ userId });
  },

  async upsertItem(userId: string, productId: string, quantity: number): Promise<ICart> {
    const cart = await CartModel.findOne({ userId });
    if (!cart) {
      return CartModel.create({ userId, items: [{ productId, quantity, addedAt: new Date() }] });
    }
    const idx = cart.items.findIndex((i) => i.productId.toString() === productId);
    if (idx >= 0) {
      cart.items[idx].quantity = quantity;
    } else {
      cart.items.push({ _id: new mongoose.Types.ObjectId(), productId: new mongoose.Types.ObjectId(productId), quantity, addedAt: new Date() });
    }
    return cart.save();
  },

  async updateItem(userId: string, itemId: string, quantity: number): Promise<ICart | null> {
    return CartModel.findOneAndUpdate(
      { userId, 'items._id': itemId },
      { $set: { 'items.$.quantity': quantity } },
      { new: true }
    );
  },

  async removeItem(userId: string, itemId: string): Promise<ICart | null> {
    return CartModel.findOneAndUpdate(
      { userId },
      { $pull: { items: { _id: itemId } } },
      { new: true }
    );
  },

  async clearCart(userId: string): Promise<void> {
    await CartModel.findOneAndUpdate({ userId }, { $set: { items: [] } });
  },
};
