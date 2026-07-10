import { VoucherModel, type IVoucher } from './voucher.model.js';

export const VoucherRepository = {
  async findByCode(code: string): Promise<IVoucher | null> {
    return VoucherModel.findOne({ code: code.toUpperCase() });
  },

  async findById(id: string): Promise<IVoucher | null> {
    return VoucherModel.findById(id);
  },

  async list(page: number, limit: number): Promise<{ vouchers: IVoucher[]; total: number }> {
    const [vouchers, total] = await Promise.all([
      VoucherModel.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      VoucherModel.countDocuments(),
    ]);
    return { vouchers, total };
  },

  async create(data: Partial<IVoucher>): Promise<IVoucher> {
    return new VoucherModel(data).save();
  },

  async update(id: string, data: Partial<IVoucher>): Promise<IVoucher | null> {
    return VoucherModel.findByIdAndUpdate(id, { $set: data }, { new: true });
  },

  async delete(id: string): Promise<void> {
    await VoucherModel.findByIdAndDelete(id);
  },

  async consumeByPhone(code: string, phone: string): Promise<void> {
    await VoucherModel.findOneAndUpdate(
      { code: code.toUpperCase(), 'usedByPhones.phone': phone },
      { $inc: { usedCount: 1, 'usedByPhones.$.count': 1 } }
    );
    // If phone not yet in array, push it
    await VoucherModel.findOneAndUpdate(
      { code: code.toUpperCase(), 'usedByPhones.phone': { $ne: phone } },
      { $inc: { usedCount: 1 }, $push: { usedByPhones: { phone, count: 1 } } }
    );
  },

  async releaseByPhone(code: string, phone: string): Promise<void> {
    await VoucherModel.findOneAndUpdate(
      { code: code.toUpperCase() },
      { $inc: { usedCount: -1, 'usedByPhones.$[el].count': -1 } },
      { arrayFilters: [{ 'el.phone': phone }] }
    );
  },
};
