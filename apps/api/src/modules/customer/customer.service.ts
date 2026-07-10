import { AppError } from '../../middlewares/errorMiddleware.js';
import { CustomerRepository } from './customer.repository.js';
import type { ICustomer } from './customer.model.js';

export const CustomerService = {
  async getMyProfile(userId: string): Promise<ICustomer> {
    const customer = await CustomerRepository.findOne_byUserId(userId);
    if (!customer) throw new AppError(404, 'Không tìm thấy thông tin khách hàng');
    return customer;
  },

  async updateProfile(userId: string, data: { fullName?: string; phone?: string; dateOfBirth?: string }): Promise<ICustomer> {
    const customer = await CustomerRepository.findOne_byUserId(userId);
    if (!customer) throw new AppError(404, 'Không tìm thấy thông tin khách hàng');

    const updated = await CustomerRepository.update(customer._id.toString(), {
      ...(data.fullName ? { fullName: data.fullName } : {}),
      ...(data.dateOfBirth ? { dateOfBirth: new Date(data.dateOfBirth) } : {}),
    });
    if (!updated) throw new AppError(500, 'Cập nhật thất bại');
    return updated;
  },

  async addAddress(userId: string, address: object): Promise<ICustomer> {
    const customer = await CustomerRepository.findOne_byUserId(userId);
    if (!customer) throw new AppError(404, 'Không tìm thấy thông tin khách hàng');
    const updated = await CustomerRepository.addAddress(customer._id.toString(), address);
    if (!updated) throw new AppError(500, 'Thêm địa chỉ thất bại');
    return updated;
  },

  async listCustomers(query: { search?: string; page: number; limit: number }) {
    return CustomerRepository.list(query);
  },

  async getCustomerById(id: string): Promise<ICustomer> {
    const customer = await CustomerRepository.findById(id);
    if (!customer) throw new AppError(404, 'Khách hàng không tồn tại');
    return customer;
  },
};
