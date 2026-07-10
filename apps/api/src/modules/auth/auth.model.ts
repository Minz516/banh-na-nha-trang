import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';

export interface IUser {
  _id: mongoose.Types.ObjectId;
  email: string;
  phone?: string;
  passwordHash: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, unique: true, sparse: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
  },
  baseSchemaOptions
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  next();
});

export const UserModel = mongoose.model<IUser>('User', userSchema);
