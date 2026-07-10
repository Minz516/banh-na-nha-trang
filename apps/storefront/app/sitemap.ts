import type { MetadataRoute } from 'next';
import { siteMetadata } from '@/lib/seo/metadata';
import { CatalogAPI, BlogAPI } from '@/lib/api/server-public';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemapEntries: MetadataRoute.Sitemap = [
    {
      url: siteMetadata.siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteMetadata.siteUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteMetadata.siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];

  try {
    // Re-use our server-side fetching utilities
    const products = await CatalogAPI.getProducts();
    const { posts } = await BlogAPI.getPosts();

    products.forEach((product) => {
      sitemapEntries.push({
        url: `${siteMetadata.siteUrl}/products/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.7,
      });
    });

    posts.forEach((post) => {
      sitemapEntries.push({
        url: `${siteMetadata.siteUrl}/blog/${post.slug}`,
        lastModified: new Date(post.publishedAt || new Date()),
        changeFrequency: 'monthly',
        priority: 0.6,
      });
    });
  } catch (err) {
    console.error('Error generating sitemap dynamic routes:', err);
  }

  return sitemapEntries;
}
