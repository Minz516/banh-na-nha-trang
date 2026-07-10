import { env } from '../env';
import { ApiError } from './errors';
import type { 
  Product, 
  Category, 
  BlogPostMap,
  ProductMap
} from '@repo/shared-types';

/**
 * Server Component fetch utilities (Public Data).
 * Bypasses Next.js proxy and calls Express backend directly using env.API_URL.
 */

async function serverFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${env.API_URL}${path.startsWith('/') ? path : `/${path}`}`;
  
  // By default Next 15 doesn't cache fetch unless explicitly cached.
  // We can add caching configuration as needed per request.
  const res = await fetch(url, {
    ...init,
    next: {
      tags: ['public-data'],
      ...init?.next,
    }
  });

  const data = await res.json().catch(() => null);
  
  if (!res.ok) {
    throw new ApiError(res.status, data?.error?.message || res.statusText, data?.error?.cause);
  }
  
  return data?.data as T;
}

// ---- API Wrappers ----

export const CatalogAPI = {
  async getCategories() {
    return serverFetch<Category[]>('/categories');
  },
  async getCategoryBySlug(slug: string) {
    return serverFetch<Category>(`/categories/${slug}`);
  },
  async getProducts() {
    return serverFetch<Product[]>('/products');
  },
  async getProductBySlug(slug: string) {
    return serverFetch<Product>(`/products/${slug}`);
  },
  async getFeaturedProducts() {
    const products = await serverFetch<Product[]>('/products');
    return products.filter(p => p.isFeatured).slice(0, 8);
  },
  async getNewArrivals() {
    const products = await serverFetch<Product[]>('/products');
    return products.filter(p => p.isNewArrival).slice(0, 8);
  }
};

export const BlogAPI = {
  async getPosts() {
    return serverFetch<BlogPostMap['ListResponse']>('/blog/posts');
  },
  async getPostBySlug(slug: string) {
    return serverFetch<BlogPostMap['ItemResponse']>(`/blog/posts/${slug}`);
  },
  async getCategories() {
    return serverFetch<BlogPostMap['CategoryListResponse']>('/blog/categories');
  }
};
