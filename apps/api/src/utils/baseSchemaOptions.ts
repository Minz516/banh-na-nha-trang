import type { SchemaOptions } from 'mongoose';

/**
 * Base schema options applied to every Mongoose model:
 * - timestamps: adds createdAt / updatedAt
 * - id transform: exposes _id as id (string)
 * - strips __v from responses
 */
export const baseSchemaOptions: SchemaOptions = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
  toObject: {
    virtuals: true,
    transform: (_doc, ret) => {
      ret.id = ret._id?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  },
};
