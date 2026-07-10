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
          <div className="flex items-center justify-center gap-3 mb-6">
            <Link href={`/blog?category=${post.category?.slug}`} className="text-orange-500 text-sm font-bold uppercase tracking-wider hover:underline">
              {post.category?.name}
            </Link>
            <span className="text-gray-300">•</span>
            <time className="text-gray-500 text-sm font-medium">
              {new Date(post.publishedAt || new Date()).toLocaleDateString('vi-VN')}
            </time>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-8 leading-tight tracking-tight">{post.title}</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">{post.excerpt}</p>
        </header>

        {post.coverImage && (
          <div className="aspect-[21/9] bg-gray-100 rounded-3xl overflow-hidden mb-16 relative shadow-lg">
            <img src={post.coverImage.url} alt={post.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div 
          className="prose prose-lg prose-gray max-w-none mx-auto
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900
            prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:leading-relaxed prose-p:text-gray-700 prose-p:mb-6
            prose-a:text-orange-500 prose-a:font-medium prose-a:no-underline hover:prose-a:underline
            prose-li:text-gray-700
            prose-img:rounded-2xl prose-img:shadow-md"
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
        />
      </div>
    </article>
  );
}
