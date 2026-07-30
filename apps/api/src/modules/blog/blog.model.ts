import mongoose, { Schema } from 'mongoose';
import { baseSchemaOptions } from '../../utils/baseSchemaOptions.js';
import { slugify } from '../../utils/slugify.js';

// ── Post Category ──────────────────────────────────────────────────────────────
export interface IPostCategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const postCategorySchema = new Schema<IPostCategory>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    description: { type: String },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions<IPostCategory>()
);

postCategorySchema.pre('save', function (next) {
  if (this.isModified('name')) this.slug = slugify(this.name);
  next();
});

export const PostCategoryModel = mongoose.model<IPostCategory>('PostCategory', postCategorySchema);

// ── Cover Image ────────────────────────────────────────────────────────────────
export interface ICoverImage {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
}

const coverImageSchema = new Schema<ICoverImage>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
    width: { type: Number, required: true },
    height: { type: Number, required: true },
  },
  { _id: false }
);

// ── Post ──────────────────────────────────────────────────────────────────────
export interface IPost {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // markdown
  coverImage?: ICoverImage;
  categoryId?: mongoose.Types.ObjectId;
  relatedProductIds: mongoose.Types.ObjectId[];
  metaTitle?: string;
  metaDescription?: string;
  status: 'draft' | 'published';
  publishedAt?: Date;
  readingMinutes: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const postSchema = new Schema<IPost>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    coverImage: { type: coverImageSchema },
    categoryId: { type: Schema.Types.ObjectId, ref: 'PostCategory', sparse: true },
    relatedProductIds: { type: [Schema.Types.ObjectId], ref: 'Product', default: [] },
    metaTitle: { type: String },
    metaDescription: { type: String },
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    publishedAt: { type: Date },
    readingMinutes: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  baseSchemaOptions<IPost>()
);

postSchema.index({ status: 1, publishedAt: -1 });
postSchema.index({ categoryId: 1, status: 1 });

// Expose populated refs under the field names the API contract (postSchema in
// shared-types) promises — `category`/`relatedProducts` — instead of the raw
// `categoryId`/`relatedProductIds` ref fields. Falls back to null/[] when the
// caller didn't populate (e.g. list views that only need the raw id).
postSchema.virtual('category').get(function (this: mongoose.HydratedDocument<IPost>) {
  return this.populated('categoryId') ? this.categoryId : null;
});

postSchema.virtual('relatedProducts').get(function (this: mongoose.HydratedDocument<IPost>) {
  return this.populated('relatedProductIds') ? this.relatedProductIds : [];
});

// Auto-generate slug and estimate reading time on save
postSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title);
  }
  if (this.isModified('content')) {
    const wordCount = this.content.trim().split(/\s+/).length;
    this.readingMinutes = Math.ceil(wordCount / 200);
  }
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

export const PostModel = mongoose.model<IPost>('Post', postSchema);
