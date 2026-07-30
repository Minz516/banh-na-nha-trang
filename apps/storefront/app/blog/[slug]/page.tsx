import { BlogAPI } from '@/lib/api/server-public';
import { generateSeoMetadata } from '@/lib/seo/metadata';
import { renderMarkdown } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await BlogAPI.getPostBySlug(slug).catch(() => null);
  if (!post) return generateSeoMetadata('Bài viết không tồn tại');
  return generateSeoMetadata(post.title, post.excerpt, post.coverImage?.url);
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await BlogAPI.getPostBySlug(slug).catch(() => null);

  if (!post) {
    notFound();
  }

  const htmlContent = await renderMarkdown(post.content);

  return (
    <article className="py-16">
      <div className="container mx-auto px-6 max-w-4xl">
        <header className="mb-12 text-center">
          <div className="flex items-center justify-center gap-3 mb-6 text-sm">
            {post.category && (
              <>
                <Link href={`/blog?category=${post.category.slug}`} className="text-primary font-bold uppercase tracking-wider hover:underline">
                  {post.category.name}
                </Link>
                <span className="text-border">•</span>
              </>
            )}
            <time className="text-text-secondary font-medium">
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}
            </time>
            <span className="text-border">•</span>
            <span className="text-text-secondary">~{post.readingMinutes} phút đọc</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-text-primary mb-8 leading-tight tracking-tight">{post.title}</h1>
          <p className="text-xl text-text-secondary max-w-3xl mx-auto leading-relaxed">{post.excerpt}</p>
        </header>

        {post.coverImage && (
          <div className="aspect-[21/9] bg-background-alt rounded-3xl overflow-hidden mb-16 relative shadow-lg">
            <img src={post.coverImage.url} alt={post.coverImage.alt || post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div
          className="max-w-none mx-auto
            [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-text-primary [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:tracking-tight
            [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-text-primary [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:tracking-tight
            [&_p]:leading-relaxed [&_p]:text-text-secondary [&_p]:mb-6 [&_p]:text-lg
            [&_a]:text-primary [&_a]:font-medium [&_a]:no-underline hover:[&_a]:underline
            [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_li]:text-text-secondary [&_li]:text-lg [&_li]:mb-2
            [&_strong]:text-text-primary [&_strong]:font-semibold
            [&_img]:rounded-2xl [&_img]:shadow-md"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />

        {post.relatedProducts.length > 0 && (
          <div className="mt-16 pt-12 border-t border-divider">
            <h2 className="font-display text-2xl text-text-primary mb-6 text-center">Sản phẩm nhắc đến trong bài</h2>
            <div className="flex flex-wrap justify-center gap-4">
              {post.relatedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="px-4 py-2 rounded-full border border-border text-sm font-medium text-text-primary hover:bg-background-alt transition-colors"
                >
                  {product.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
