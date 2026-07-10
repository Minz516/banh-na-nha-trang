import type { ICustomer } from './customer.model.js';

export const CustomerDTO = {
  profileResponse(customer: ICustomer) {
    return {
      id: customer._id.toString(),
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email ?? null,
      dateOfBirth: customer.dateOfBirth?.toISOString() ?? null,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      createdAt: customer.createdAt.toISOString(),
      updatedAt: customer.updatedAt.toISOString(),
    };
  },

  listResponse(customer: ICustomer) {
    return {
      id: customer._id.toString(),
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email ?? null,
      totalOrders: customer.totalOrders,
      totalSpent: customer.totalSpent,
      createdAt: customer.createdAt.toISOString(),
    };
  },
};
