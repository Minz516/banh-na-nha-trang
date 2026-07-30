import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pencil, Plus, RefreshCw, Search, Ticket, Trash2 } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { EmptyState } from '../components/EmptyState';
import { VoucherFormModal } from '../components/VoucherFormModal';
import { currency, dateFormat } from '../lib/orderFormat';
import { voucherStatus, type VoucherFormBody, type VoucherRow } from '../lib/voucherTypes';

type ListEnvelope<T> = { data: T[]; meta: { total: number } | null };
type StatusFilter = 'all' | 'available' | 'expired';

function DeleteConfirmModal({ code, submitting, onConfirm, onClose }: { code: string; submitting: boolean; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary mb-1">Xóa voucher</h2>
        <p className="text-sm text-text-secondary mb-5">
          Bạn có chắc muốn xóa mã <span className="font-medium text-text-primary">{code}</span>? Hành động này không thể hoàn tác.
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

export function Vouchers() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const [vouchers, setVouchers] = useState<VoucherRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [formState, setFormState] = useState<{ mode: 'create' | 'edit'; voucher: VoucherRow | null } | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<VoucherRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadVouchers = useCallback(async () => {
    setError(false);
    try {
      const res = (await apiClient.get('/vouchers', { params: { limit: 100 } })) as ListEnvelope<VoucherRow>;
      setVouchers(res.data);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    loadVouchers();
  }, [loadVouchers]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await loadVouchers();
    } finally {
      setRefreshing(false);
    }
  }

  const visibleVouchers = useMemo(() => {
    if (!vouchers) return null;
    const q = search.trim().toUpperCase();
    return vouchers.filter((v) => {
      if (statusFilter !== 'all' && voucherStatus(v) !== statusFilter) return false;
      if (q && !v.code.includes(q)) return false;
      return true;
    });
  }, [vouchers, statusFilter, search]);

  async function handleFormSubmit(body: VoucherFormBody) {
    setFormSubmitting(true);
    setFormError(null);
    try {
      if (formState?.mode === 'create') {
        await apiClient.post('/vouchers', body);
      } else if (formState?.voucher) {
        await apiClient.patch(`/vouchers/${formState.voucher.id}`, body);
      }
      setFormState(null);
      await loadVouchers();
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Không thể lưu voucher.';
      setFormError(message);
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/vouchers/${deleteTarget.id}`);
      setDeleteTarget(null);
      await loadVouchers();
    } catch {
      // Leave the confirm dialog open with its default state so staff can retry.
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Voucher"
        description="Tạo và quản lý mã giảm giá — trạng thái được tính tự động theo ngày hết hạn."
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
                setFormState({ mode: 'create', voucher: null });
              }}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
              Tạo voucher
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
            placeholder="Tìm theo mã voucher..."
            className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-10 px-3 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="available">Còn hiệu lực</option>
          <option value="expired">Đã hết hạn</option>
        </select>
      </div>

      {error && (
        <div className="bg-card rounded-md shadow-sm py-16 px-6 text-center text-text-secondary text-sm">
          Không thể tải danh sách voucher.
        </div>
      )}

      {!error && visibleVouchers !== null && visibleVouchers.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="Chưa có voucher nào"
          description="Nhấn “Tạo voucher” để đưa mã giảm giá đầu tiên vào sử dụng."
        />
      )}

      {!error && visibleVouchers === null && (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-md shadow-sm h-16 animate-pulse" />
          ))}
        </div>
      )}

      {!error && visibleVouchers !== null && visibleVouchers.length > 0 && (
        <div className="bg-card rounded-md shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm table-fixed">
              <colgroup>
                <col className="w-[14%]" />
                <col className="w-[16%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[14%]" />
                <col className="w-[13%]" />
                <col className="w-[15%]" />
              </colgroup>
              <thead>
                <tr className="border-b border-divider text-left text-text-secondary">
                  <th className="px-5 py-3 font-medium">Mã</th>
                  <th className="px-5 py-3 font-medium">Giảm giá</th>
                  <th className="px-5 py-3 font-medium">Đơn tối thiểu</th>
                  <th className="px-5 py-3 font-medium text-right">Đã dùng</th>
                  <th className="px-5 py-3 font-medium">Hết hạn</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-divider">
                {visibleVouchers.map((v) => {
                  const status = voucherStatus(v);
                  return (
                    <tr key={v.id} className="hover:bg-card-hover transition-colors">
                      <td className="px-5 py-3">
                        <span className="font-medium text-text-primary">{v.code}</span>
                        {!v.isActive && <span className="block text-xs text-text-muted">Đã tắt</span>}
                      </td>
                      <td className="px-5 py-3 text-text-secondary">
                        {v.type === 'fixed' ? currency.format(v.value) : `${v.value}%`}
                        {v.type === 'percentage' && v.maxDiscount != null && (
                          <span className="block text-xs text-text-muted">Tối đa {currency.format(v.maxDiscount)}</span>
                        )}
                      </td>
                      <td className="px-5 py-3 text-text-secondary whitespace-nowrap">
                        {v.minOrderValue > 0 ? currency.format(v.minOrderValue) : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-text-secondary whitespace-nowrap">
                        {v.usedCount}{v.usageLimit != null ? ` / ${v.usageLimit}` : ''}
                      </td>
                      <td className="px-5 py-3 text-text-secondary whitespace-nowrap">
                        {v.validUntil ? dateFormat.format(new Date(v.validUntil)) : 'Không giới hạn'}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${status === 'available' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}
                        >
                          {status === 'available' ? 'Còn hiệu lực' : 'Đã hết hạn'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setFormError(null);
                              setFormState({ mode: 'edit', voucher: v });
                            }}
                            className="w-8 h-8 rounded-md flex items-center justify-center text-text-secondary hover:bg-background-alt hover:text-primary cursor-pointer"
                            title="Sửa"
                          >
                            <Pencil className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(v)}
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
        <VoucherFormModal
          mode={formState.mode}
          voucher={formState.voucher}
          submitting={formSubmitting}
          errorMessage={formError}
          onSubmit={handleFormSubmit}
          onClose={() => setFormState(null)}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          code={deleteTarget.code}
          submitting={deleting}
          onConfirm={handleDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
