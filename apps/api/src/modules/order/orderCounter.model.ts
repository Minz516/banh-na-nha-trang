import mongoose, { Schema } from 'mongoose';

// Internal counter backing sequential daily order numbers (BTNN-YYYYMMDD-NNN).
// Never serialized to a client — no baseSchemaOptions needed.
interface IOrderCounter {
  _id: string; // e.g. "20260713"
  seq: number;
}

const orderCounterSchema = new Schema<IOrderCounter>({
  _id: { type: String, required: true },
  seq: { type: Number, required: true, default: 0 },
});

export const OrderCounterModel = mongoose.model<IOrderCounter>('OrderCounter', orderCounterSchema);
