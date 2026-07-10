import mongoose, { Schema } from 'mongoose';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';
import { slugify } from '../../utils/slugify.js';

// D2: Flat product — no variants. One price, one stock, one optional flavor.
export interface IProduct {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  categoryId: mongoose.Types.ObjectId;
  flavor?: string;
  images: Array<{ url: string; publicId: string; alt: string; width: number; height: number; sortOrder: number }>;
  basePrice: number;
  promoPrice?: number;
  stock: number;
  tags: string[];
  searchName: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: Date;
  updatedAt: Date;
}

const productImageSchema = new Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
    sortOrder: { type: Number, default: 0 },
  },
  { _id: false }
);

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String, required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    flavor: { type: String, trim: true },
    images: { type: [productImageSchema], default: [] },
    basePrice: { type: Number, required: true, min: 0 },
    promoPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    tags: { type: [String], default: [] },
    searchName: { type: String, index: true },
    isFeatured: { type: Boolean, default: false },
    isNewArrival: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    metaTitle: { type: String },
    metaDescription: { type: String },
  },
  baseSchemaOptions
);

// Compound indexes per SRS §3.4
productSchema.index({ isActive: 1, isFeatured: 1 });
productSchema.index({ isActive: 1, categoryId: 1 });
productSchema.index({ searchName: 'text', description: 'text' });

// Auto-generate slug and searchName on save
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name);
    this.searchName = slugify(this.name);
  }
  next();
});

export const ProductModel = mongoose.model<IProduct>('Product', productSchema);

// ── Category ──────────────────────────────────────────────────────────────────────

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String },
    image: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = slugify(this.name);
  next();
});

export const CategoryModel = mongoose.model<ICategory>('Category', categorySchema);
