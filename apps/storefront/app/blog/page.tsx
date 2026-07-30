import { BlogAPI } from '@/lib/api/server-public';
import Link from 'next/link';

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const { posts } = await BlogAPI.getPosts({ category }).catch(() => ({ posts: [] }));
  const categories = await BlogAPI.getCategories().catch(() => []);

  return (
    <div className="py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <header className="mb-16">
          <h1 className="font-display text-4xl text-text-primary mb-4 tracking-tight">Câu Chuyện Nhà Na</h1>
          <p className="text-lg text-text-secondary">Những góc nhìn văn hóa, công thức nấu ăn và mẹo vặt về Bánh Tráng Nha Trang.</p>
        </header>

        <div className="flex flex-col md:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <h3 className="font-semibold text-text-primary mb-6 uppercase tracking-wider text-sm">Chủ Đề</h3>
            <ul className="space-y-4">
              <li><Link href="/blog" className="text-primary font-medium">Tất cả bài viết</Link></li>
              {categories.map((cat) => (
                <li key={cat.slug}>
                  <Link href={`/blog?category=${cat.slug}`} className="text-text-secondary hover:text-text-primary transition-colors">{cat.name}</Link>
                </li>
              ))}
            </ul>
          </aside>

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {posts.map((post) => (
                <article key={post.slug} className="group">
                  <Link href={`/blog/${post.slug}`} className="block">
                    <div className="aspect-[16/9] bg-background-alt rounded-2xl overflow-hidden mb-6 relative">
                      {post.coverImage && (
                        <img src={post.coverImage.url} alt={post.coverImage.alt || post.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      {post.category && <span className="text-primary text-sm font-semibold">{post.category.name}</span>}
                      <span className="text-text-muted text-sm">•</span>
                      <time className="text-text-secondary text-sm">{new Date(post.publishedAt || post.createdAt).toLocaleDateString('vi-VN')}</time>
                    </div>
                    <h3 className="font-display text-2xl mb-3 text-text-primary group-hover:text-primary transition-colors leading-tight">{post.title}</h3>
                    <p className="text-text-secondary line-clamp-2 leading-relaxed">{post.excerpt}</p>
                  </Link>
                </article>
              ))}
              {posts.length === 0 && (
                <div className="col-span-2 text-center py-24 text-text-secondary">Chưa có bài viết nào.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
