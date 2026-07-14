import type { SchemaOptions } from 'mongoose';

function transform(_doc: unknown, ret: Record<string, unknown>) {
  ret.id = (ret._id as { toString(): string } | undefined)?.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
}

/**
 * Base schema options applied to every Mongoose model:
 * - timestamps: adds createdAt / updatedAt
 * - id transform: exposes _id as id (string)
 * - strips __v from responses
 *
 * Generic so each model gets `SchemaOptions<TDoc>` matching its own `new Schema<TDoc>(...)` —
 * a bare `SchemaOptions` constant collapses to `SchemaOptions<unknown>` and is not assignable
 * where a specific doc type is expected, which breaks statics/methods typing on every model.
 */
export function baseSchemaOptions<T = unknown>(): SchemaOptions<T> {
  return {
    timestamps: true,
    toJSON: { virtuals: true, transform },
    toObject: { virtuals: true, transform },
  };
}
