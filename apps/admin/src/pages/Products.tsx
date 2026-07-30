import { useCallback, useEffect, useMemo, useState } from 'react';
import { LayoutGrid, List, Package, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { ProductFormModal } from '../components/ProductFormModal';
import { currency } from '../lib/orderFormat';
import { LOW_STOCK_THRESHOLD, type CategoryRow, type ProductFormBody, type ProductRow } from '../lib/catalogTypes';

type ListEnvelope<T> = { data: T[]; meta: { total: number } | null };
type StatusFilter = 'all' | 'active' | 'inactive';

// Section 6.4 — Product Cards, reused here (with admin overlay controls) so
// staff see the exact same presentation a customer would on the storefront.
function ProductGridCard({
  product,
  categoryName,
  onEdit,
  onDelete,
}: {
  product: ProductRow;
  categoryName: string | undefined;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const image = product.images[0];
  const price = product.promoPrice ?? product.basePrice;
  const onSale = product.promoPrice != null && product.promoPrice < product.basePrice;
  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <div className="group relative bg-card rounded-md shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-[4/5] rounded-t-md overflow-hidden bg-background-alt">
        {image ? (
          <img src={image.url} alt={image.alt || product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">
            <Package className="w-8 h-8" strokeWidth={1.5} />
          </div>
        )}

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {onSale && (
            <span className="px-2 py-1 rounded-full bg-primary text-white text-xs font-semibold">
              -{Math.round(100 - (product.promoPrice! / product.basePrice) * 100)}%
            </span>
          )}
          {!product.isActive && (
            <span className="px-2 py-1 rounded-full bg-text-secondary text-white text-xs font-semibold">Ngừng bán</span>
          )}
          {outOfStock && (
            <span className="px-2 py-1 rounded-full bg-danger text-white text-xs font-semibold">Hết hàng</span>
          )}
          {lowStock && (
            <span className="px-2 py-1 rounded-full bg-warning text-white text-xs font-semibold">Sắp hết</span>
          )}
        </div>

        <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            type="button"
            onClick={onEdit}
            className="w-8 h-8 rounded-full bg-card shadow-sm flex items-center justify-center text-text-secondary hover:text-primary cursor-pointer"
            title="Sửa"
          >
            <Pencil className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-8 h-8 rounded-full bg-card shadow-sm flex items-center justify-center text-text-secondary hover:text-danger cursor-pointer"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs text-text-muted mb-1 truncate">{categoryName ?? '—'}</p>
        <h3 className="font-sans text-[16px] font-semibold text-text-primary leading-snug line-clamp-1">
          {product.name}
        </h3>
        {product.flavor && <p className="text-sm text-text-secondary mt-0.5 line-clamp-1">{product.flavor}</p>}
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-text-primary">{currency.format(price)}</span>
          {onSale && <span className="text-xs text-text-muted line-through">{currency.format(product.basePrice)}</span>}
        </div>
        <p className="mt-1.5 text-xs text-text-secondary">Tồn kho: {product.stock}</p>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ productName, submitting, onConfirm, onClose }: { productName: string; submitting: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary mb-1">
          Xóa sản phẩm
        </h2>
        <p className="text-sm text-text-secondary mb-5">
          Bạn có chắc muốn xóa <span className="font-medium text-text-primary">{productName}</span>? Hành động này không thể hoàn tác.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={onConfirm}
            className="flex-1 h-10 rounded-md bg-danger text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
          >
            {submitting ? 'Đang xóa...' : 'Xác nhận xóa'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Products() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; product: ProductRow | null } | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCategories = useCallback(async () => {
    try {
      const res = (await apiClient.get('/categories')) as ListEnvelope<CategoryRow>;
      setCategories(res.data);
    } catch {
      setCategories([]);
    }
  }, []);

  const loadProducts = useCallback(async (q: string) => {
    setError(false);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (q.trim()) params.search = q.trim();
      const res = (await apiClient.get('/products/admin/all', { params })) as ListEnvelope<ProductRow>;
      setProducts(res.data);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    setProducts(null);
    const timeout = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadProducts]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([loadCategories(), loadProducts(search)]);
    } finally {
      setRefreshing(false);
    }
  }

  const categoryMap = useMemo(() => new Map((categories ?? []).map((c) => [c.id, c.name])), [categories]);

  const visibleProducts = useMemo(() => {
    if (!products) return null;
    return products.filter((p) => {
      if (statusFilter !== 'all' && (statusFilter === 'active') !== p.isActive) return false;
      if (categoryFilter && p.categoryId !== categoryFilter) return false;
      return true;
    });
  }, [products, statusFilter, categoryFilter]);

  async function handleFormSubmit(body: ProductFormBody) {
    setFormSubmitting(true);
    setFormError(null);
    try {
      if (formState?.mode === 'create') {
        await apiClient.post('/products', body);
      } else if (formState?.product) {
        await apiClient.patch(`/products/${formState.product.id}`, body);
      }
      setFormState(null);
      await loadProducts(search);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Không thể lưu sản phẩm.';
      setFormError(message);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadProducts(search);
    } catch {
      // Leave the confirm dialog open with its default state so staff can retry.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Sản phẩm"
        description="Quản lý danh mục sản phẩm — xem như trên website, thêm, sửa và xóa."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors disabled:opacity-40 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              Làm mới
            </button>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                setFormState({ mode: 'create', product: null });
              }}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Thêm sản phẩm
            </button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên sản phẩm..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
        >
          <option value="">Tất cả danh mục</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-10 px-3 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang bán</option>
          <option value="inactive">Ngừng bán</option>
        </select>

        <div className="ml-auto flex items-center gap-1 rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => setViewMode('grid')}
            title="Xem như website"
            className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-alt'}`}
          >
            <LayoutGrid className="w-4 h-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            title="Xem dạng bảng"
            className={`w-8 h-8 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${viewMode === 'table' ? 'bg-primary text-white' : 'text-text-secondary hover:bg-background-alt'}`}
          >
            <List className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-card rounded-md shadow-sm py-16 px-6 text-center text-text-secondary text-sm">
          Không thể tải danh sách sản phẩm.
        </div>
      )}

      {!error && visibleProducts !== null && visibleProducts.length === 0 && (
        <EmptyState
          icon={Package}
          title="Chưa có sản phẩm nào"
          description="Nhấn “Thêm sản phẩm” để đưa sản phẩm đầu tiên lên cửa hàng."
        />
      )}

      {!error && visibleProducts === null && (
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5' : 'space-y-2'}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-card rounded-md shadow-sm h-64 animate-pulse" />
          ))}
        </div>
      )}

      {!error && visibleProducts !== null && visibleProducts.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-5">
          {visibleProducts.map((p) => (
            <ProductGridCard
              key={p.id}
              product={p}
              categoryName={categoryMap.get(p.categoryId)}
              onEdit={() => {
                setFormError(null);
                setFormState({ mode: 'edit', product: p });
              }}
              onDelete={() => setDeleteTarget(p)}
            />
          ))}
        </div>
      )}

      {!error && visibleProducts !== null && visibleProducts.length > 0 && viewMode === 'table' && (
        <div className="bg-card rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[8%]" />
                <col className="w-[27%]" />
                <col className="w-[15%]" />
                <col className="w-[15%]" />
                <col className="w-[12%]" />
                <col className="w-[13%]" />
                <col className="w-[10%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-divider text-left text-text-secondary">
                  <th className="px-5 py-3 font-medium">Ảnh</th>
                  <th className="px-5 py-3 font-medium">Sản phẩm</th>
                  <th className="px-5 py-3 font-medium">Danh mục</th>
                  <th className="px-5 py-3 font-medium text-right">Giá</th>
                  <th className="px-5 py-3 font-medium text-right">Tồn kho</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {visibleProducts.map((p) => {
                  const price = p.promoPrice ?? p.basePrice;
                  const onSale = p.promoPrice != null && p.promoPrice < p.basePrice;
                  const outOfStock = p.stock === 0;
                  const lowStock = !outOfStock && p.stock <= LOW_STOCK_THRESHOLD;
                  return (
                    <tr key={p.id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-10 h-10 rounded-sm overflow-hidden bg-background-alt shrink-0">
                          {p.images[0] ? (
                            <img src={p.images[0].url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Package className="w-4 h-4" strokeWidth={1.5} />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3 truncate">
                        <span className="font-medium text-text-primary truncate block">{p.name}</span>
                        {p.flavor && <span className="text-xs text-text-muted truncate block">{p.flavor}</span>}
                      </td>
                      <td className="px-5 py-3 text-text-secondary truncate">{categoryMap.get(p.categoryId) ?? '—'}</td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className="font-medium text-text-primary">{currency.format(price)}</span>
                        {onSale && <span className="block text-xs text-text-muted line-through">{currency.format(p.basePrice)}</span>}
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap">
                        <span className={lowStock || outOfStock ? 'font-medium text-danger' : 'text-text-secondary'}>{p.stock}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${p.isActive ? 'bg-success/10 text-success' : 'bg-text-secondary/10 text-text-secondary'}`}
                        >
                          {p.isActive ? 'Đang bán' : 'Ngừng bán'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setFormError(null);
                              setFormState({ mode: 'edit', product: p });
                            }}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-background-alt hover:text-primary cursor-pointer"
                            title="Sửa"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(p)}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-danger/10 hover:text-danger cursor-pointer"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formState && (
        <ProductFormModal
          mode={formState.mode}
          categories={categories ?? []}
          product={formState.product}
          submitting={formSubmitting}
          errorMessage={formError}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          productName={deleteTarget.name}
          submitting={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
