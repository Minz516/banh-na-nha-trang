import { AppError } from '../../middlewares/errorMiddleware.js';
import { BlogRepository } from './blog.repository.js';
import type { CreatePostBody, UpdatePostBody, PostQuery, CreatePostCategoryBody, UpdatePostCategoryBody } from '@repo/shared-types';
import type { IPost, IPostCategory } from './blog.model.js';

export const BlogService = {
  // ── Public ────────────────────────────────────────────────────────────────────

  async queryPosts(q: PostQuery, publicOnly = true) {
    return BlogRepository.queryPosts(q, publicOnly);
  },

  async getPostBySlug(slug: string): Promise<IPost> {
    const post = await BlogRepository.findPostBySlug(slug);
    if (!post) throw new AppError(404, 'Không tìm thấy bài viết');
    // Increment view count asynchronously — do not block response
    BlogRepository.incrementViewCount(post._id.toString()).catch(() => null);
    return post;
  },

  async getLatestPosts(limit = 3): Promise<IPost[]> {
    return BlogRepository.getLatestPosts(limit);
  },

  async listCategories(): Promise<IPostCategory[]> {
    return BlogRepository.listCategories();
  },

  async getCategoryBySlug(slug: string): Promise<IPostCategory> {
    const cat = await BlogRepository.findCategoryBySlug(slug);
    if (!cat) throw new AppError(404, 'Không tìm thấy chủ đề');
    return cat;
  },

  // ── Admin ─────────────────────────────────────────────────────────────────────

  async createPost(body: CreatePostBody): Promise<IPost> {
    return BlogRepository.createPost(body as Partial<IPost>);
  },

  async updatePost(id: string, body: UpdatePostBody): Promise<IPost> {
    const existing = await BlogRepository.findPostById(id);
    if (!existing) throw new AppError(404, 'Không tìm thấy bài viết');
    const updated = await BlogRepository.updatePost(id, body as Partial<IPost>);
    if (!updated) throw new AppError(404, 'Không tìm thấy bài viết');
    return updated;
  },

  async deletePost(id: string): Promise<void> {
    const existing = await BlogRepository.findPostById(id);
    if (!existing) throw new AppError(404, 'Không tìm thấy bài viết');
    await BlogRepository.deletePost(id);
  },

  async createCategory(body: CreatePostCategoryBody): Promise<IPostCategory> {
    return BlogRepository.createCategory(body as Partial<IPostCategory>);
  },

  async updateCategory(id: string, body: UpdatePostCategoryBody): Promise<IPostCategory> {
    const updated = await BlogRepository.updateCategory(id, body as Partial<IPostCategory>);
    if (!updated) throw new AppError(404, 'Không tìm thấy chủ đề');
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    const existing = await BlogRepository.findCategoryById(id);
    if (!existing) throw new AppError(404, 'Không tìm thấy chủ đề');
    await BlogRepository.deleteCategory(id);
  },

  async getPostById(id: string): Promise<IPost> {
    const post = await BlogRepository.findPostById(id);
    if (!post) throw new AppError(404, 'Không tìm thấy bài viết');
    return post;
  },
};
