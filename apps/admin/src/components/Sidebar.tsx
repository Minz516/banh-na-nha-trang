import { NavLink } from 'react-router-dom';
import { ShoppingBag, Users, Package, Store, BookOpen, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { to: '/', label: 'Đơn hàng', icon: ShoppingBag, end: true },
  { to: '/customers', label: 'Khách hàng', icon: Users },
  { to: '/products', label: 'Sản phẩm', icon: Package },
  { to: '/store', label: 'Cửa hàng', icon: Store },
  { to: '/blog', label: 'Bài viết', icon: BookOpen },
];

// Section 6.15 — same token system as storefront; the dark chrome uses
// color-text-primary (warm near-black-brown) rather than a cool gray-900,
// so even the "gray" surface in this app stays on-brand.
export function Sidebar({ onLogout }: { onLogout: () => void }) {
  return (
    <aside className="w-60 shrink-0 fixed left-0 top-0 bottom-0 z-50 flex flex-col bg-text-primary text-background">
      <div className="h-16 flex items-center px-5 shrink-0">
        <span className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          Nhà Na Admin
        </span>
      </div>

      <nav className="flex-1 flex flex-col gap-1 px-3 py-2 overflow-y-auto">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-background/70 hover:bg-white/8 hover:text-background'
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-white/10">
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 h-10 px-3 rounded-md text-sm font-medium text-background/70 hover:bg-danger/20 hover:text-background transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5 shrink-0" strokeWidth={1.5} />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
