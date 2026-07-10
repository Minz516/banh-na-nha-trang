import { PostModel, PostCategoryModel, type IPost, type IPostCategory } from './blog.model.js';
import type { PostQuery } from '@repo/shared-types';

export const BlogRepository = {
  // ── Posts ───────────────────────────────────────────────────────────────────

  async queryPosts(q: PostQuery, publicOnly = true) {
    const filter: Record<string, unknown> = {};
    if (publicOnly) filter.status = 'published';
    if (q.category) filter.categoryId = await PostCategoryModel.findOne({ slug: q.category }).select('_id').lean();
    if (q.search) filter.$text = { $search: q.search };
    const skip = (q.page - 1) * q.limit;
    const [items, total] = await Promise.all([
      PostModel.find(filter)
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(q.limit)
        .populate('categoryId', 'name slug')
        .lean({ virtuals: true }),
      PostModel.countDocuments(filter),
    ]);
    return { items, total, page: q.page, limit: q.limit, totalPages: Math.ceil(total / q.limit) };
  },

  async findPostBySlug(slug: string): Promise<IPost | null> {
    return PostModel.findOne({ slug })
      .populate('categoryId', 'name slug')
      .populate('relatedProductIds')
      .lean({ virtuals: true });
  },

  async findPostById(id: string): Promise<IPost | null> {
    return PostModel.findById(id).lean({ virtuals: true });
  },

  async createPost(data: Partial<IPost>): Promise<IPost> {
    const post = new PostModel(data);
    return post.save();
  },

  async updatePost(id: string, data: Partial<IPost>): Promise<IPost | null> {
    return PostModel.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true }).lean({ virtuals: true });
  },

  async deletePost(id: string): Promise<void> {
    await PostModel.findByIdAndDelete(id);
  },

  async incrementViewCount(id: string): Promise<void> {
    await PostModel.findByIdAndUpdate(id, { $inc: { viewCount: 1 } });
  },

  async getLatestPosts(limit = 3): Promise<IPost[]> {
    return PostModel.find({ status: 'published' })
      .sort({ publishedAt: -1 })
      .limit(limit)
      .populate('categoryId', 'name slug')
      .lean({ virtuals: true });
  },

  // ── Post Categories ─────────────────────────────────────────────────────────

  async listCategories(): Promise<IPostCategory[]> {
    return PostCategoryModel.find({ isActive: true }).sort({ sortOrder: 1 }).lean({ virtuals: true });
  },

  async findCategoryBySlug(slug: string): Promise<IPostCategory | null> {
    return PostCategoryModel.findOne({ slug }).lean({ virtuals: true });
  },

  async findCategoryById(id: string): Promise<IPostCategory | null> {
    return PostCategoryModel.findById(id).lean({ virtuals: true });
  },

  async createCategory(data: Partial<IPostCategory>): Promise<IPostCategory> {
    const cat = new PostCategoryModel(data);
    return cat.save();
  },

  async updateCategory(id: string, data: Partial<IPostCategory>): Promise<IPostCategory | null> {
    return PostCategoryModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean({ virtuals: true });
  },

  async deleteCategory(id: string): Promise<void> {
    await PostCategoryModel.findByIdAndDelete(id);
  },
};
