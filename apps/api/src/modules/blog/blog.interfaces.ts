import { BlogRepository } from './blog.repository.js';
import type { IPost, IPostCategory } from './blog.model.js';

/**
 * Public interface for cross-module Blog access.
 */
export const BlogInterfaces = {
  async getLatestPosts(limit = 3): Promise<IPost[]> {
    return BlogRepository.getLatestPosts(limit);
  },

  async getPostBySlug(slug: string): Promise<IPost | null> {
    return BlogRepository.findPostBySlug(slug);
  },

  async listCategories(): Promise<IPostCategory[]> {
    return BlogRepository.listCategories();
  },
};
