export type CoverImage = {
  url: string;
  publicId: string;
  alt: string;
  width: number;
  height: number;
};

export type PostCategoryRow = {
  id: string;
  name: string;
  slug: string;
};

export type PostStatus = 'draft' | 'published';

export type PostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage: CoverImage | null;
  category: PostCategoryRow | null;
  relatedProducts: { id: string; name: string }[];
  metaTitle: string | null;
  metaDescription: string | null;
  status: PostStatus;
  publishedAt: string | null;
  readingMinutes: number;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
};

export type PostFormBody = {
  title: string;
  excerpt: string;
  content: string;
  coverImage?: CoverImage | null;
  categoryId?: string;
  relatedProductIds: string[];
  metaTitle?: string;
  metaDescription?: string;
  status: PostStatus;
};
