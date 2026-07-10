import { AppError } from '../../middlewares/errorMiddleware.js';
import { CustomerRepository } from './customer.repository.js';
import type { ICustomer } from './customer.model.js';

export const CustomerService = {
  async listCustomers(query: { search?: string; page: number; limit: number }) {
    return CustomerRepository.list(query);
  },

  async getCustomerById(id: string): Promise<ICustomer> {
    const customer = await CustomerRepository.findById(id);
    if (!customer) throw new AppError(404, 'Khách hàng không tồn tại');
    return customer;
  },
};
