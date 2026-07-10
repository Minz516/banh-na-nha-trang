import type { IProduct, ICategory } from './catalog.model.js';

export const CatalogDTO = {
  productResponse(product: IProduct) {
    return {
      id: product._id.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      categoryId: product.categoryId.toString(),
      flavor: product.flavor ?? null,
      images: product.images,
      basePrice: product.basePrice,
      promoPrice: product.promoPrice ?? null,
      stock: product.stock,
      tags: product.tags,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isActive: product.isActive,
      metaTitle: product.metaTitle ?? null,
      metaDescription: product.metaDescription ?? null,
      createdAt: product.createdAt.toISOString(),
      updatedAt: product.updatedAt.toISOString(),
    };
  },

  categoryResponse(category: ICategory) {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description ?? null,
      image: category.image ?? null,
      sortOrder: category.sortOrder,
      isActive: category.isActive,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
    };
  },
};
