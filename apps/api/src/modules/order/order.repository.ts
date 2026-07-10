import { OrderModel, type IOrder, type OrderStatus } from './order.model.js';
import type { OrderQuery } from '@repo/shared-types';

/** Generate a sequential-looking human-friendly order number */
function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `BTN-${ts}-${rand}`;
}

export const OrderRepository = {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    const order = new OrderModel({
      ...data,
      orderNumber: generateOrderNumber(),
      statusHistory: [{ status: data.status ?? 'pending', changedAt: new Date() }],
    });
    return order.save();
  },

  async findById(id: string): Promise<IOrder | null> {
    return OrderModel.findById(id).lean({ virtuals: true });
  },

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return OrderModel.findOne({ orderNumber }).lean({ virtuals: true });
  },

  async findByOrderNumberAndPhone(orderNumber: string, phone: string): Promise<IOrder | null> {
    return OrderModel.findOne({
      orderNumber,
      'customerSnapshot.phone': phone,
    }).lean({ virtuals: true });
  },

  async query(q: OrderQuery) {
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.from || q.to) {
      filter.createdAt = {};
      if (q.from) (filter.createdAt as Record<string, unknown>).$gte = new Date(q.from);
      if (q.to) (filter.createdAt as Record<string, unknown>).$lte = new Date(q.to);
    }
    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(q.limit).lean({ virtuals: true }),
      OrderModel.countDocuments(filter),
    ]);
    return { items, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) };
  },

  async updateStatus(
    id: string,
    status: OrderStatus,
    meta: { changedBy?: string; cancelReason?: string } = {}
  ): Promise<IOrder | null> {
    const now = new Date();
    const update: Record<string, unknown> = {
      status,
      $push: { statusHistory: { status, changedAt: now, changedBy: meta.changedBy } },
    };
    if (status === 'confirmed') update.confirmedAt = now;
    if (status === 'shipping') update.shippedAt = now;
    if (status === 'completed') update.completedAt = now;
    if (status === 'cancelled') {
      update.cancelledAt = now;
      if (meta.cancelReason) update.cancelReason = meta.cancelReason;
    }
    const { $push, ...setFields } = update;
    return OrderModel.findByIdAndUpdate(
      id,
      { $set: setFields, $push: $push as object },
      { new: true }
    ).lean({ virtuals: true });
  },

  async incrementPrintCount(id: string): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(id, { $inc: { printCount: 1 } }, { new: true }).lean({ virtuals: true });
  },
};
