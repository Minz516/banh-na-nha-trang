import mongoose, { Schema } from 'mongoose';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';

export interface ICartItem {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface ICart {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  items: ICartItem[];
  createdAt: Date;
  updatedAt: Date;
}

const cartItemSchema = new Schema<ICartItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const cartSchema = new Schema<ICart>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: { type: [cartItemSchema], default: [] },
  },
  baseSchemaOptions
);

export const CartModel = mongoose.model<ICart>('Cart', cartSchema);
