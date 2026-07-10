import type { MetadataRoute } from 'next';
import { siteMetadata } from '@/lib/seo/metadata';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/checkout/', '/cart/', '/api/', '/admin/'],
    },
    sitemap: `${siteMetadata.siteUrl}/sitemap.xml`,
  };
}
