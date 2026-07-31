import { env } from '../env';
import { ApiError } from './errors';
import type {
  Product,
  Category,
  Post,
  PostCategory
} from '@repo/shared-types';

/**
 * Server Component fetch utilities (Public Data).
 * Bypasses Next.js proxy and calls Express backend directly using env.API_URL.
 */

async function serverFetch<T>(path: string, init?: RequestInit & { next?: { revalidate?: number | false; tags?: string[] } }): Promise<T> {
  const url = `${env.API_URL}${path.startsWith('/') ? path : `/${path}`}`;

  // Next's fetch defaults to no persistent caching unless `next.revalidate` is set —
  // every call site below passes an explicit window so ISR is actually active, matching
  // the Cache-Control windows the API itself now advertises for the same routes.
  const res = await fetch(url, {
    ...init,
    next: {
      tags: ['public-data'],
      ...init?.next,
    },
  });

  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || res.statusText, data?.error?.cause);
  }
  
  return data?.data as T;
}

// ---- API Wrappers ----

// Windows mirror the API's own Cache-Control s-maxage for the same routes
// (apps/api/src/modules/catalog/*.routes.ts) — categories change rarely, products
// (price/stock) more often.
const PRODUCTS_REVALIDATE = 60;
const CATEGORIES_REVALIDATE = 300;

export const CatalogAPI = {
  async getCategories() {
    return serverFetch<Category[]>('/categories', { next: { revalidate: CATEGORIES_REVALIDATE } });
  },
  async getCategoryBySlug(slug: string) {
    return serverFetch<Category>(`/categories/${slug}`, { next: { revalidate: CATEGORIES_REVALIDATE } });
  },
  async getProducts(params?: { category?: string; search?: string; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    return serverFetch<Product[]>(`/products${query ? `?${query}` : ''}`, { next: { revalidate: PRODUCTS_REVALIDATE } });
  },
  async getProductBySlug(slug: string) {
    return serverFetch<Product>(`/products/${slug}`, { next: { revalidate: PRODUCTS_REVALIDATE } });
  },
  async getFeaturedProducts() {
    const products = await serverFetch<Product[]>('/products', { next: { revalidate: PRODUCTS_REVALIDATE } });
    return products.filter(p => p.isFeatured).slice(0, 8);
  },
  async getNewArrivals() {
    const products = await serverFetch<Product[]>('/products', { next: { revalidate: PRODUCTS_REVALIDATE } });
    return products.filter(p => p.isNewArrival).slice(0, 8);
  },
  async getProductsByCategorySlug(categorySlug: string) {
    const products = await serverFetch<Product[]>('/products', { next: { revalidate: PRODUCTS_REVALIDATE } });
    const category = await CatalogAPI.getCategoryBySlug(categorySlug);
    return products.filter(p => p.categoryId === category.id);
  }
};

type PostListResult = { items: Post[]; total: number; page: number; limit: number; totalPages: number };

const POSTS_REVALIDATE = 120;
const POST_CATEGORIES_REVALIDATE = 300;

export const BlogAPI = {
  async getPosts(params?: { category?: string; search?: string; page?: number; limit?: number }) {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.limit) qs.set('limit', String(params.limit));
    const query = qs.toString();
    const result = await serverFetch<PostListResult>(`/blog${query ? `?${query}` : ''}`, { next: { revalidate: POSTS_REVALIDATE } });
    return { posts: result.items, total: result.total, totalPages: result.totalPages };
  },
  async getPostBySlug(slug: string) {
    return serverFetch<Post>(`/blog/${slug}`, { next: { revalidate: POSTS_REVALIDATE } });
  },
  async getCategories() {
    return serverFetch<PostCategory[]>('/blog/categories', { next: { revalidate: POST_CATEGORIES_REVALIDATE } });
  }
};
