export type ProductImage = {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
  sortOrder: number;
};

export type ProductRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  flavor: string | null;
  images: ProductImage[];
  basePrice: number;
  promoPrice: number | null;
  stock: number;
  tags: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export type ProductFormBody = {
  name: string;
  description: string;
  categoryId: string;
  flavor?: string;
  basePrice: number;
  promoPrice: number | null;
  stock: number;
  tags: string[];
  images: ProductImage[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
};

export const LOW_STOCK_THRESHOLD = 5;
