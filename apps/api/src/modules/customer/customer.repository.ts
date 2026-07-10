import { CustomerModel, type ICustomer } from './customer.model.js';

export const CustomerRepository = {
  async findByPhone(phone: string): Promise<ICustomer | null> {
    return CustomerModel.findOne({ phone });
  },

  async findById(id: string): Promise<ICustomer | null> {
    return CustomerModel.findById(id);
  },

  async upsertByPhone(data: {
    phone: string;
    fullName: string;
    email?: string;
    userId?: string;
  }): Promise<ICustomer> {
    return CustomerModel.findOneAndUpdate(
      { phone: data.phone },
      {
        $set: {
          fullName: data.fullName,
          ...(data.email ? { email: data.email } : {}),
          ...(data.userId ? { userId: data.userId } : {}),
        },
        $setOnInsert: { phone: data.phone, totalOrders: 0, totalSpent: 0 },
      },
      { upsert: true, new: true }
    ) as Promise<ICustomer>;
  },

  async linkUser(phone: string, userId: string): Promise<void> {
    await CustomerModel.updateOne({ phone }, { $set: { userId } });
  },

  async incrementStats(customerId: string, orderTotal: number): Promise<void> {
    await CustomerModel.findByIdAndUpdate(customerId, {
      $inc: { totalOrders: 1, totalSpent: orderTotal },
    });
  },

  async decrementStats(customerId: string, orderTotal: number): Promise<void> {
    await CustomerModel.findByIdAndUpdate(customerId, {
      $inc: { totalOrders: -1, totalSpent: -orderTotal },
    });
  },

  async update(id: string, data: Partial<Pick<ICustomer, 'fullName' | 'email' | 'dateOfBirth'>>): Promise<ICustomer | null> {
    return CustomerModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async addAddress(customerId: string, address: object): Promise<ICustomer | null> {
    return CustomerModel.findByIdAndUpdate(
      customerId,
      { $push: { addresses: address } },
      { new: true }
    );
  },

  async list(query: { search?: string; page: number; limit: number }): Promise<{ customers: ICustomer[]; total: number }> {
    const filter = query.search
      ? {
          $or: [
            { phone: { $regex: query.search, $options: 'i' } },
            { fullName: { $regex: query.search, $options: 'i' } },
            { email: { $regex: query.search, $options: 'i' } },
          ],
        }
      : {};
    const [customers, total] = await Promise.all([
      CustomerModel.find(filter)
        .sort({ createdAt: -1 })
        .skip((query.page - 1) * query.limit)
        .limit(query.limit),
      CustomerModel.countDocuments(filter),
    ]);
    return { customers, total };
  },

  async getSnapshot(customerId: string): Promise<Pick<ICustomer, '_id' | 'phone' | 'fullName' | 'email'> | null> {
    return CustomerModel.findById(customerId).select('phone fullName email');
  },
};
