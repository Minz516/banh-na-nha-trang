import { CustomerModel, type ICustomer } from './customer.model.js';
import { CustomerRepository } from './customer.repository.js';

/**
 * Public interface for cross-module access to Customer data.
 * Other modules import from here, never from customer.service.ts or repository directly.
 */
export const CustomerInterfaces = {
  async upsertByPhone(data: {
    phone: string;
    fullName: string;
    email?: string;
    userId?: string;
  }): Promise<ICustomer> {
    return CustomerRepository.upsertByPhone(data);
  },

  async getCustomerSnapshot(customerId: string) {
    return CustomerRepository.getSnapshot(customerId);
  },

  async incrementStats(customerId: string, orderTotal: number): Promise<void> {
    return CustomerRepository.incrementStats(customerId, orderTotal);
  },

  async decrementStats(customerId: string, orderTotal: number): Promise<void> {
    return CustomerRepository.decrementStats(customerId, orderTotal);
  },

  async findByPhone(phone: string): Promise<ICustomer | null> {
    return CustomerRepository.findByPhone(phone);
  },
};

// Patch repository with findOne_byUserId helper (CustomerModel direct usage here only)
CustomerRepository.findOne_byUserId = async (userId: string) =>
  CustomerModel.findOne({ userId });

// Augment the type
declare module './customer.repository.js' {
  interface CustomerRepositoryType {
    findOne_byUserId(userId: string): Promise<ICustomer | null>;
  }
}
