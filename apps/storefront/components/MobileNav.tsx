'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import type { Category } from '@repo/shared-types';

type NavLink = { href: string; label: string };

export function MobileNav({ navLinks, categories }: { navLinks: NavLink[]; categories: Category[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? 'Đóng menu' : 'Mở menu'}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-11 h-11 -mr-2 text-text-primary"
      >
        {open ? <X className="w-6 h-6" strokeWidth={1.5} /> : <Menu className="w-6 h-6" strokeWidth={1.5} />}
      </button>

      {open && (
        <div className="absolute inset-x-0 top-full bg-background border-b border-border shadow-md">
          <nav className="flex flex-col px-6 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="py-3 text-[15px] font-medium text-text-primary border-b border-divider last:border-none"
              >
                {link.label}
              </Link>
            ))}
            {categories.length > 0 && (
              <div className="pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-text-muted mb-2">Danh mục</p>
                <div className="flex flex-wrap gap-2 pb-2">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/collections/${category.slug}`}
                      onClick={() => setOpen(false)}
                      className="px-4 py-2 rounded-full bg-background-alt text-sm text-text-secondary"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
