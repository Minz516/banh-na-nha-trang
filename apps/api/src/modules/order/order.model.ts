import mongoose, { Schema } from 'mongoose';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';

// ── Product snapshot (immutable at order time) ─────────────────────────────────
export interface IProductSnapshot {
  productId: string;
  name: string;
  slug: string;
  image: string | null;
  flavor: string | null;
}

// ── Customer snapshot ──────────────────────────────────────────────────────────
export interface ICustomerSnapshot {
  fullName: string;
  phone: string;
  address?: string;
  email?: string;
}

// ── Order Item ─────────────────────────────────────────────────────────────────
export interface IOrderItem {
  productSnapshot: IProductSnapshot;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

// ── Status History Entry ───────────────────────────────────────────────────────
export interface IStatusHistoryEntry {
  status: string;
  changedAt: Date;
  changedBy?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

// ── Order ──────────────────────────────────────────────────────────────────────
export interface IOrder {
  _id: mongoose.Types.ObjectId;
  orderNumber: string;
  customerId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  channel: 'online' | 'pos';
  customerSnapshot: ICustomerSnapshot;
  items: IOrderItem[];
  subtotal: number;
  discountAmount: number;
  voucherCode?: string;
  total: number;
  status: OrderStatus;
  statusHistory: IStatusHistoryEntry[];
  confirmedAt?: Date;
  shippedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  cancelReason?: string;
  note?: string;
  paymentMethod: 'cod' | 'bank_transfer';
  printCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const productSnapshotSchema = new Schema<IProductSnapshot>(
  {
    productId: { type: String, required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true },
    image: { type: String, default: null },
    flavor: { type: String, default: null },
  },
  { _id: false }
);

const orderItemSchema = new Schema<IOrderItem>(
  {
    productSnapshot: { type: productSnapshotSchema, required: true },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const customerSnapshotSchema = new Schema<ICustomerSnapshot>(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String },
    email: { type: String },
  },
  { _id: false }
);

const statusHistorySchema = new Schema<IStatusHistoryEntry>(
  {
    status: { type: String, required: true },
    changedAt: { type: Date, required: true },
    changedBy: { type: String },
  },
  { _id: false }
);

// ── Order schema ───────────────────────────────────────────────────────────────

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    channel: { type: String, enum: ['online', 'pos'], default: 'online' },
    customerSnapshot: { type: customerSnapshotSchema, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0 },
    voucherCode: { type: String },
    total: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'],
      default: 'pending',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    confirmedAt: { type: Date },
    shippedAt: { type: Date },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
    note: { type: String },
    paymentMethod: { type: String, enum: ['cod', 'bank_transfer'], required: true },
    printCount: { type: Number, default: 0 },
  },
  baseSchemaOptions
);

orderSchema.index({ customerId: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

export const OrderModel = mongoose.model<IOrder>('Order', orderSchema);
