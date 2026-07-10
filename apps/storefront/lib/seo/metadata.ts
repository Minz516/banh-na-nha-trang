import type { Metadata } from 'next/types';

export const siteMetadata = {
  title: 'Bánh Tráng Nhà Na',
  description: 'Đặc sản bánh tráng Đà Lạt chính gốc',
  siteUrl: 'https://banhtrangnhana.com',
};

export function generateSeoMetadata(
  title: string,
  description?: string,
  image?: string
): Metadata {
  return {
    title: `${title} | ${siteMetadata.title}`,
    description: description || siteMetadata.description,
    openGraph: {
      title: `${title} | ${siteMetadata.title}`,
      description: description || siteMetadata.description,
      images: image ? [{ url: image }] : [],
    },
  };
}
