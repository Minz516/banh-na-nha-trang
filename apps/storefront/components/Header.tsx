import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import { CatalogAPI } from '@/lib/api/server-public';
import { CartBadge } from '@/components/CartBadge';
import { MobileNav } from '@/components/MobileNav';
import { HeaderShell } from '@/components/HeaderShell';

// Tabs mirror the indexed sitemap (SEO_CONTEXT.md 3.1), which is itself derived from
// the catalog and blog modules SRS.md defines (§3.3 categories, §4 modules).
const NAV_LINKS = [
  { href: '/', label: 'Trang chủ' },
  { href: '/products', label: 'Sản phẩm' },
  { href: '/blog', label: 'Câu chuyện' },
  { href: '/about', label: 'Về chúng tôi' },
];

export async function Header() {
  const categories = await CatalogAPI.getCategories().catch(() => []);

  return (
    <HeaderShell>
      <div className="relative container mx-auto px-4 sm:px-6 max-w-7xl h-16 md:h-[72px] flex items-center justify-between">
        <Link href="/" className="font-display text-2xl text-text-primary shrink-0">
          Nhà Na<span className="text-primary">.</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) =>
            link.href === '/products' ? (
              <div key={link.href} className="group relative">
                <Link
                  href={link.href}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-[15px] font-medium text-text-secondary hover:text-primary hover:bg-background-alt transition-colors"
                >
                  {link.label}
                  {categories.length > 0 && <ChevronDown className="w-3.5 h-3.5" strokeWidth={1.5} />}
                </Link>
                {categories.length > 0 && (
                  <div className="absolute left-0 top-full pt-2 hidden group-hover:block group-focus-within:block">
                    <div className="min-w-[200px] rounded-lg border border-border bg-surface shadow-md py-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          href={`/collections/${category.slug}`}
                          className="block px-4 py-2 text-sm text-text-secondary hover:text-primary hover:bg-background-alt transition-colors"
                        >
                          {category.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 rounded-full text-[15px] font-medium text-text-secondary hover:text-primary hover:bg-background-alt transition-colors"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <CartBadge />
          <MobileNav navLinks={NAV_LINKS} categories={categories} />
        </div>
      </div>
    </HeaderShell>
  );
}
