import { AppError } from '../../middlewares/errorMiddleware.js';
import { BlogRepository } from './blog.repository.js';
import { createTtlCache } from '../../utils/ttlCache.util.js';
import type { CreatePostBody, UpdatePostBody, PostQuery, CreatePostCategoryBody, UpdatePostCategoryBody } from '@repo/shared-types';
import type { IPost, IPostCategory } from './blog.model.js';

// Storefront-facing reads only — admin reads (publicOnly=false) always hit the DB
// directly, so staff always see current drafts. Cleared on any write.
const PUBLIC_CACHE_TTL_MS = 60_000;
const postListCache = createTtlCache<{ items: IPost[]; total: number; page: number; limit: number; totalPages: number }>(PUBLIC_CACHE_TTL_MS);
const postBySlugCache = createTtlCache<IPost>(PUBLIC_CACHE_TTL_MS);
const latestPostsCache = createTtlCache<IPost[]>(PUBLIC_CACHE_TTL_MS);
const categoryListCache = createTtlCache<IPostCategory[]>(PUBLIC_CACHE_TTL_MS);
const categoryBySlugCache = createTtlCache<IPostCategory>(PUBLIC_CACHE_TTL_MS);

function clearPublicBlogCache(): void {
  postListCache.clear();
  postBySlugCache.clear();
  latestPostsCache.clear();
  categoryListCache.clear();
  categoryBySlugCache.clear();
}

export const BlogService = {
  // ── Public ────────────────────────────────────────────────────────────────────

  async queryPosts(q: PostQuery, publicOnly = true) {
    if (!publicOnly) return BlogRepository.queryPosts(q, false);
    return postListCache.getOrSet(JSON.stringify(q), () => BlogRepository.queryPosts(q, true));
  },

  async getPostBySlug(slug: string): Promise<IPost> {
    const post = await postBySlugCache.getOrSet(slug, async () => {
      const p = await BlogRepository.findPostBySlug(slug);
      if (!p) throw new AppError(404, 'Không tìm thấy bài viết');
      return p;
    });
    // Increment view count asynchronously on every call, cache-hit or not
    BlogRepository.incrementViewCount(post._id.toString()).catch(() => null);
    return post;
  },

  async getLatestPosts(limit = 3): Promise<IPost[]> {
    return latestPostsCache.getOrSet(String(limit), () => BlogRepository.getLatestPosts(limit));
  },

  async listCategories(): Promise<IPostCategory[]> {
    return categoryListCache.getOrSet('all', () => BlogRepository.listCategories());
  },

  async getCategoryBySlug(slug: string): Promise<IPostCategory> {
    return categoryBySlugCache.getOrSet(slug, async () => {
      const cat = await BlogRepository.findCategoryBySlug(slug);
      if (!cat) throw new AppError(404, 'Không tìm thấy chủ đề');
      return cat;
    });
  },

  // ── Admin ─────────────────────────────────────────────────────────────────────

  async createPost(body: CreatePostBody): Promise<IPost> {
    const post = await BlogRepository.createPost(body as unknown as Partial<IPost>);
    clearPublicBlogCache();
    return post;
  },

  async updatePost(id: string, body: UpdatePostBody): Promise<IPost> {
    const existing = await BlogRepository.findPostById(id);
    if (!existing) throw new AppError(404, 'Không tìm thấy bài viết');
    const updated = await BlogRepository.updatePost(id, body as Partial<IPost>);
    if (!updated) throw new AppError(404, 'Không tìm thấy bài viết');
    clearPublicBlogCache();
    return updated;
  },

  async deletePost(id: string): Promise<void> {
    const existing = await BlogRepository.findPostById(id);
    if (!existing) throw new AppError(404, 'Không tìm thấy bài viết');
    await BlogRepository.deletePost(id);
    clearPublicBlogCache();
  },

  async createCategory(body: CreatePostCategoryBody): Promise<IPostCategory> {
    const cat = await BlogRepository.createCategory(body as Partial<IPostCategory>);
    clearPublicBlogCache();
    return cat;
  },

  async updateCategory(id: string, body: UpdatePostCategoryBody): Promise<IPostCategory> {
    const updated = await BlogRepository.updateCategory(id, body as Partial<IPostCategory>);
    if (!updated) throw new AppError(404, 'Không tìm thấy chủ đề');
    clearPublicBlogCache();
    return updated;
  },

  async deleteCategory(id: string): Promise<void> {
    const existing = await BlogRepository.findCategoryById(id);
    if (!existing) throw new AppError(404, 'Không tìm thấy chủ đề');
    await BlogRepository.deleteCategory(id);
    clearPublicBlogCache();
  },

  async getPostById(id: string): Promise<IPost> {
    const post = await BlogRepository.findPostById(id);
    if (!post) throw new AppError(404, 'Không tìm thấy bài viết');
    return post;
  },
};
