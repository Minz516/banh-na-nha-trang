import { env } from '../env';
import { ApiError } from './errors';
import { mockCategories, mockProducts } from '../data/mock-catalog';
import type {
  Product,
  Category,
  BlogPostMap,
  ProductMap
} from '@repo/shared-types';

// TEMPORARY: serves hardcoded products/categories for frontend testing until
// the catalog is seeded in the database. Flip to false to hit the real API.
const USE_MOCK_CATALOG = true;

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
    if (USE_MOCK_CATALOG) return mockCategories;
    return serverFetch<Category[]>('/categories');
  },
  async getCategoryBySlug(slug: string) {
    if (USE_MOCK_CATALOG) {
      const category = mockCategories.find((c) => c.slug === slug);
      if (!category) throw new ApiError(404, 'Không tìm thấy danh mục');
      return category;
    }
    return serverFetch<Category>(`/categories/${slug}`);
  },
  async getProducts() {
    if (USE_MOCK_CATALOG) return mockProducts;
    return serverFetch<Product[]>('/products');
  },
  async getProductBySlug(slug: string) {
    if (USE_MOCK_CATALOG) {
      const product = mockProducts.find((p) => p.slug === slug);
      if (!product) throw new ApiError(404, 'Không tìm thấy sản phẩm');
      return product;
    }
    return serverFetch<Product>(`/products/${slug}`);
  },
  async getFeaturedProducts() {
    const products = USE_MOCK_CATALOG ? mockProducts : await serverFetch<Product[]>('/products');
    return products.filter(p => p.isFeatured).slice(0, 8);
  },
  async getNewArrivals() {
    const products = USE_MOCK_CATALOG ? mockProducts : await serverFetch<Product[]>('/products');
    return products.filter(p => p.isNewArrival).slice(0, 8);
  },
  async getProductsByCategorySlug(categorySlug: string) {
    const products = USE_MOCK_CATALOG ? mockProducts : await serverFetch<Product[]>('/products');
    const category = await CatalogAPI.getCategoryBySlug(categorySlug);
    return products.filter(p => p.categoryId === category.id);
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
