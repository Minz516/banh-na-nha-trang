import { CartRepository } from './cart.repository.js';

export const CartInterfaces = {
  async clearCart(userId: string): Promise<void> {
    return CartRepository.clearCart(userId);
  },
};
