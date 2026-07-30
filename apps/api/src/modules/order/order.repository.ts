import mongoose from 'mongoose';
import { OrderModel, type IOrder, type OrderStatus } from './order.model.js';
import { OrderCounterModel } from './orderCounter.model.js';
import type { OrderQuery } from '@repo/shared-types';

/** BTNN-YYYYMMDD-NNN, atomically sequential per day (API_CONTRACT.md, SRS.md §3.6) */
async function generateOrderNumber(): Promise<string> {
  const now = new Date();
  const dateKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;

  const counter = await OrderCounterModel.findByIdAndUpdate(
    dateKey,
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );

  return `BTNN-${dateKey}-${String(counter.seq).padStart(3, '0')}`;
}

export const OrderRepository = {
  async create(data: Partial<IOrder>): Promise<IOrder> {
    const order = new OrderModel({
      ...data,
      orderNumber: await generateOrderNumber(),
      statusHistory: [{ status: data.status ?? 'pending', changedAt: new Date() }],
    });
    return order.save();
  },

  // Note: no .lean() here — lean() skips the schema's toJSON transform (the
  // _id → id rename in baseSchemaOptions.ts), so callers relying on `.id` on
  // a single-document fetch would silently get `_id`/`__v` instead.
  async findById(id: string): Promise<IOrder | null> {
    return OrderModel.findById(id);
  },

  async findByOrderNumber(orderNumber: string): Promise<IOrder | null> {
    return OrderModel.findOne({ orderNumber });
  },

  async findByOrderNumberAndPhone(orderNumber: string, phone: string): Promise<IOrder | null> {
    return OrderModel.findOne({
      orderNumber,
      'customerSnapshot.phone': phone,
    });
  },

  async query(q: OrderQuery) {
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.customerId && mongoose.isValidObjectId(q.customerId)) filter.customerId = q.customerId;
    if (q.from || q.to) {
      filter.createdAt = {};
      if (q.from) (filter.createdAt as Record<string, unknown>).$gte = new Date(q.from);
      if (q.to) (filter.createdAt as Record<string, unknown>).$lte = new Date(q.to);
    }
    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      OrderModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(q.limit),
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
    );
  },

  async incrementPrintCount(id: string): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(id, { $inc: { printCount: 1 } }, { new: true });
  },

  async setChannel(id: string, channel: IOrder['channel']): Promise<IOrder | null> {
    return OrderModel.findByIdAndUpdate(id, { $set: { channel } }, { new: true });
  },
};
