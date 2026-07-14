import { useCallback, useEffect, useState } from 'react';
import { Clock, CheckCircle2, XCircle, ShoppingBag, ArrowLeft, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { CancelOrderModal } from '../components/CancelOrderModal';
import { STATUS_LABELS, STATUS_TONES, PAYMENT_LABELS, currency, dateTimeFormat } from '../lib/orderFormat';

type OrderStatusFilter = 'pending' | 'confirmed' | 'cancelled' | null;

type OrderItem = {
  productSnapshot: { name: string; flavor: string | null };
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

type OrderRow = {
  id: string;
  orderNumber: string;
  customerSnapshot: { fullName: string; phone: string; address?: string; email?: string };
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  voucherCode?: string;
  total: number;
  status: string;
  paymentMethod: 'cod' | 'bank_transfer';
  note?: string;
  createdAt: string;
};

type ListEnvelope = { data: OrderRow[]; meta: { total: number } | null };

type Counts = {
  pending: number | null;
  confirmed: number | null;
  cancelled: number | null;
  total: number | null;
};

export function Orders() {
  const [counts, setCounts] = useState<Counts>({ pending: null, confirmed: null, cancelled: null, total: null });
  // Focus: the pending card is the default, primary view of this page.
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('pending');
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [listError, setListError] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<OrderRow | null>(null);
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadCounts = useCallback(async () => {
    const [pending, confirmed, cancelledRes, total] = await Promise.allSettled([
      apiClient.get('/orders', { params: { limit: 1, status: 'pending' } }) as Promise<ListEnvelope>,
      apiClient.get('/orders', { params: { limit: 1, status: 'confirmed' } }) as Promise<ListEnvelope>,
      apiClient.get('/orders', { params: { limit: 1, status: 'cancelled' } }) as Promise<ListEnvelope>,
      apiClient.get('/orders', { params: { limit: 1 } }) as Promise<ListEnvelope>,
    ]);

    setCounts({
      pending: pending.status === 'fulfilled' ? (pending.value.meta?.total ?? 0) : 0,
      confirmed: confirmed.status === 'fulfilled' ? (confirmed.value.meta?.total ?? 0) : 0,
      cancelled: cancelledRes.status === 'fulfilled' ? (cancelledRes.value.meta?.total ?? 0) : 0,
      total: total.status === 'fulfilled' ? (total.value.meta?.total ?? 0) : 0,
    });
  }, []);

  const loadList = useCallback(async (status: OrderStatusFilter) => {
    setOrders(null);
    setListError(false);
    try {
      const params: Record<string, string | number> = { limit: 20 };
      if (status) params.status = status;
      const res = (await apiClient.get('/orders', { params })) as ListEnvelope;
      setOrders(res.data);
    } catch {
      setListError(true);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  useEffect(() => {
    loadList(selectedStatus);
  }, [selectedStatus, loadList]);

  async function handleAdvance(order: OrderRow, nextStatus: 'confirmed' | 'completed') {
    setProcessingId(order.id);
    try {
      await apiClient.patch(`/orders/${order.id}/status`, { status: nextStatus });
      await Promise.all([loadCounts(), loadList(selectedStatus)]);
    } catch {
      // Left in place — the row simply doesn't move; the button re-enables so staff can retry.
    } finally {
      setProcessingId(null);
    }
  }

  async function handleConfirmCancel(reason: string) {
    if (!cancelTarget) return;
    setCancelSubmitting(true);
    try {
      await apiClient.patch(`/orders/${cancelTarget.id}/status`, { status: 'cancelled', cancelReason: reason });
      setCancelTarget(null);
      await Promise.all([loadCounts(), loadList(selectedStatus)]);
    } catch {
      // Keep the modal open on failure so staff can retry without re-typing.
    } finally {
      setCancelSubmitting(false);
    }
  }

  function handleBackToPending() {
    setSelectedOrder(null);
    setSelectedStatus('pending');
  }

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([loadCounts(), loadList(selectedStatus)]);
    } finally {
      setRefreshing(false);
    }
  }

  if (selectedOrder) {
    return <OrderDetail order={selectedOrder} onBack={handleBackToPending} />;
  }

  // Only pending/confirmed orders have a next valid action (advance or cancel) —
  // the "Đơn đã hủy" and "Tổng đơn hàng" views never show the actions column.
  const showActions = selectedStatus === 'pending' || selectedStatus === 'confirmed';
  const columnCount = showActions ? 7 : 6;

  return (
    <div>
      <PageHeader
        title="Quản lý đơn hàng"
        description="Bấm vào một mục để xem danh sách đơn hàng tương ứng."
        actions={
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} strokeWidth={1.5} />
            Làm mới
          </button>
        }
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Đơn chờ xử lí"
          value={counts.pending}
          icon={Clock}
          tone="warning"
          active={selectedStatus === 'pending'}
          onClick={() => setSelectedStatus('pending')}
        />
        <StatCard
          label="Đơn đã xử lí"
          value={counts.confirmed}
          icon={CheckCircle2}
          tone="accent"
          active={selectedStatus === 'confirmed'}
          onClick={() => setSelectedStatus('confirmed')}
        />
        <StatCard
          label="Đơn đã hủy"
          value={counts.cancelled}
          icon={XCircle}
          tone="primary"
          active={selectedStatus === 'cancelled'}
          onClick={() => setSelectedStatus('cancelled')}
        />
        <StatCard
          label="Tổng đơn hàng"
          value={counts.total}
          icon={ShoppingBag}
          tone="success"
          active={selectedStatus === null}
          onClick={() => setSelectedStatus(null)}
        />
      </div>

      <div className="bg-card rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              {showActions ? (
                <>
                  <col className="w-[14%]" />
                  <col className="w-[18%]" />
                  <col className="w-[12%]" />
                  <col className="w-[14%]" />
                  <col className="w-[11%]" />
                  <col className="w-[11%]" />
                  <col className="w-[20%]" />
                </>
              ) : (
                <>
                  <col className="w-[18%]" />
                  <col className="w-[24%]" />
                  <col className="w-[15%]" />
                  <col className="w-[17%]" />
                  <col className="w-[13%]" />
                  <col className="w-[13%]" />
                </>
              )}
            </colgroup>
            <thead>
              <tr className="border-b border-divider text-left text-text-secondary">
                <th className="px-5 py-3 font-medium">Mã đơn</th>
                <th className="px-5 py-3 font-medium">Khách hàng</th>
                <th className="px-5 py-3 font-medium">Số điện thoại</th>
                <th className="px-5 py-3 font-medium">Ngày đặt</th>
                <th className="px-5 py-3 font-medium text-right">Tổng tiền</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
                {showActions && <th className="px-5 py-3 font-medium text-right">Hành động</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {orders === null &&
                !listError &&
                Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={columnCount} className="px-5 py-4">
                      <div className="h-4 w-full max-w-xs rounded-sm bg-[color:var(--color-skeleton-base)] animate-pulse" />
                    </td>
                  </tr>
                ))}

              {listError && (
                <tr>
                  <td colSpan={columnCount} className="px-5 py-8 text-center text-text-secondary">
                    Không thể tải danh sách đơn hàng.
                  </td>
                </tr>
              )}

              {orders !== null && orders.length === 0 && (
                <tr>
                  <td colSpan={columnCount} className="px-5 py-8 text-center text-text-secondary">
                    Không có đơn hàng nào.
                  </td>
                </tr>
              )}

              {orders?.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-medium text-text-primary truncate">{order.orderNumber}</td>
                  <td className="px-5 py-3 text-text-secondary truncate">{order.customerSnapshot.fullName}</td>
                  <td className="px-5 py-3 text-text-secondary whitespace-nowrap">{order.customerSnapshot.phone}</td>
                  <td className="px-5 py-3 text-text-secondary whitespace-nowrap">
                    {dateTimeFormat.format(new Date(order.createdAt))}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-text-primary whitespace-nowrap">
                    {currency.format(order.total)}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_TONES[order.status] ?? ''}`}
                    >
                      {STATUS_LABELS[order.status] ?? order.status}
                    </span>
                  </td>
                  {showActions && (
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {order.status === 'pending' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvance(order, 'confirmed');
                            }}
                            disabled={processingId === order.id}
                            className="h-8 px-3 rounded-md bg-primary text-white text-xs font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap"
                          >
                            {processingId === order.id ? 'Đang xử lí...' : 'Đánh dấu đã xử lí'}
                          </button>
                        )}
                        {order.status === 'confirmed' && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAdvance(order, 'completed');
                            }}
                            disabled={processingId === order.id}
                            className="h-8 px-3 rounded-md bg-success text-white text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer whitespace-nowrap"
                          >
                            {processingId === order.id ? 'Đang xử lí...' : 'Đánh dấu hoàn tất'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCancelTarget(order);
                          }}
                          className="h-8 px-3 rounded-md border border-danger text-danger text-xs font-semibold hover:bg-danger/10 active:scale-[0.98] transition-all cursor-pointer whitespace-nowrap"
                        >
                          Hủy đơn
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {cancelTarget && (
        <CancelOrderModal
          orderNumber={cancelTarget.orderNumber}
          submitting={cancelSubmitting}
          onConfirm={handleConfirmCancel}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

function OrderDetail({ order, onBack }: { order: OrderRow; onBack: () => void }) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={3.5} />
        
      </button>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary">
          {order.orderNumber}
        </h1>
        <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_TONES[order.status] ?? ''}`}>
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-card rounded-md shadow-sm p-5">
          <h2 className="text-sm font-semibold text-text-primary mb-4">Chi tiết đơn hàng</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-divider text-left text-text-secondary">
                <th className="pb-2 font-medium">Sản phẩm</th>
                <th className="pb-2 font-medium text-right">Đơn giá</th>
                <th className="pb-2 font-medium text-right">Số lượng</th>
                <th className="pb-2 font-medium text-right">Thành tiền</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {order.items.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-text-primary">
                    {item.productSnapshot.name}
                    {item.productSnapshot.flavor && (
                      <span className="text-text-muted"> — {item.productSnapshot.flavor}</span>
                    )}
                  </td>
                  <td className="py-3 text-right text-text-secondary">{currency.format(item.unitPrice)}</td>
                  <td className="py-3 text-right text-text-secondary">{item.quantity}</td>
                  <td className="py-3 text-right font-medium text-text-primary">{currency.format(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-divider mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-text-secondary">
              <span>Tạm tính</span>
              <span>{currency.format(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-text-secondary">
              <span>Voucher</span>
              <span>{order.voucherCode ? `${order.voucherCode} (-${currency.format(order.discountAmount)})` : 'Không sử dụng'}</span>
            </div>
            <div className="flex justify-between text-base font-semibold text-text-primary pt-2 border-t border-divider">
              <span>Tổng cộng</span>
              <span>{currency.format(order.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-md shadow-sm p-5 space-y-4 text-sm">
          <div>
            <h2 className="text-sm font-semibold text-text-primary mb-3">Khách hàng</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-text-muted">Họ tên</dt>
                <dd className="text-text-primary font-medium">{order.customerSnapshot.fullName}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Số điện thoại</dt>
                <dd className="text-text-primary font-medium">{order.customerSnapshot.phone}</dd>
              </div>
              {order.customerSnapshot.email && (
                <div>
                  <dt className="text-text-muted">Email</dt>
                  <dd className="text-text-primary font-medium">{order.customerSnapshot.email}</dd>
                </div>
              )}
              {order.customerSnapshot.address && (
                <div>
                  <dt className="text-text-muted">Địa chỉ</dt>
                  <dd className="text-text-primary font-medium">{order.customerSnapshot.address}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="border-t border-divider pt-4">
            <h2 className="text-sm font-semibold text-text-primary mb-3">Thông tin đơn hàng</h2>
            <dl className="space-y-2">
              <div>
                <dt className="text-text-muted">Ngày đặt</dt>
                <dd className="text-text-primary font-medium">{dateTimeFormat.format(new Date(order.createdAt))}</dd>
              </div>
              <div>
                <dt className="text-text-muted">Thanh toán</dt>
                <dd className="text-text-primary font-medium">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</dd>
              </div>
              {order.note && (
                <div>
                  <dt className="text-text-muted">Ghi chú</dt>
                  <dd className="text-text-primary font-medium">{order.note}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
