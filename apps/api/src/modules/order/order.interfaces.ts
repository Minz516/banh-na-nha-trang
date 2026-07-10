import { OrderRepository } from './order.repository.js';
import type { IOrder } from './order.model.js';

/**
 * Public interface for cross-module Order access.
 * Use this if another module (e.g., analytics) needs to read orders.
 */
export const OrderInterfaces = {
  async getOrderById(id: string): Promise<IOrder | null> {
    return OrderRepository.findById(id);
  },

  async getOrderByNumber(orderNumber: string): Promise<IOrder | null> {
    return OrderRepository.findByOrderNumber(orderNumber);
  },
};
