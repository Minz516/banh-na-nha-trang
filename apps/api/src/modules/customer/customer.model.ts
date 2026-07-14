import mongoose, { Schema } from 'mongoose';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';

// Customers are created from the checkout form (fullName, phone, address, email) —
// there is no customer account/login, so this model never links to a User.
export interface ICustomer {
  _id: mongoose.Types.ObjectId;
  phone: string;
  fullName: string;
  email?: string;
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
    dateOfBirth: { type: Date },
    totalOrders: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    notes: { type: String },
  },
  baseSchemaOptions<ICustomer>()
);

export const CustomerModel = mongoose.model<ICustomer>('Customer', customerSchema);
