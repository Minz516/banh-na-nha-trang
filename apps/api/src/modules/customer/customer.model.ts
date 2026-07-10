import mongoose, { Schema } from 'mongoose';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';

const addressSchema = new Schema(
  {
    label: { type: String, enum: ['home', 'work', 'other'], default: 'home' },
    fullAddress: { type: String, required: true },
    ward: { type: String },
    district: { type: String },
    city: { type: String },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

export interface ICustomer {
  _id: mongoose.Types.ObjectId;
  phone: string;
  fullName: string;
  email?: string;
  userId?: mongoose.Types.ObjectId;
  addresses: typeof addressSchema[];
  dateOfBirth?: Date;
  totalOrders: number;
  totalSpent: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const customerSchema = new Schema<ICustomer>(
  {
    phone: { type: String, required: true, unique: true, indexed: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    // D5: userId is nullable — customer exists before any account login
    userId: { type: Schema.Types.ObjectId, ref: 'User', sparse: true },
    addresses: { type: [addressSchema], default: [] },
    dateOfBirth: { type: Date },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    notes: { type: String },
  },
  baseSchemaOptions
);

export const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);
