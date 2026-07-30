import { useCallback, useEffect, useState } from 'react';
import { Search, Download, RefreshCw, ArrowLeft, FileText } from 'lucide-react';
import { apiClient, API_BASE_URL } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { STATUS_LABELS, STATUS_TONES, PAYMENT_LABELS, currency, dateFormat, dateTimeFormat } from '../lib/orderFormat';

type CustomerRow = {
  id: string;
  phone: string;
  fullName: string;
  email: string | null;
  totalOrders: number;
  totalSpent: number;
  createdAt: string;
};

type CustomerOrderRow = {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: string;
};

type OrderItem = {
  productSnapshot: { name: string; flavor: string | null };
  unitPrice: number;
  quantity: number;
  subtotal: number;
};

type OrderDetailRow = {
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

type ListEnvelope<T> = { data: T[]; meta: { total: number } | null };

// Customer records are already unique per phone (Customer.phone has a unique
// index; checkout upserts by phone — apps/api/customer.repository.ts), so this
// list is inherently "one row per phone number" already, using whichever
// fullName was given on that customer's most recent order.
export function Customers() {
  const [search, setSearch] = useState('');
  const [customers, setCustomers] = useState<CustomerRow[] | null>(null);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRow | null>(null);

  const load = useCallback(async (q: string) => {
    setError(false);
    try {
      const params: Record<string, string | number> = { limit: 50 };
      if (q.trim()) params.search = q.trim();
      const res = (await apiClient.get('/customers', { params })) as ListEnvelope<CustomerRow>;
      setCustomers(res.data);
    } catch {
      setError(true);
    }
  }, []);

  // Debounced search — refetches 300ms after the user stops typing.
  useEffect(() => {
    setCustomers(null);
    const timeout = setTimeout(() => load(search), 300);
    return () => clearTimeout(timeout);
  }, [search, load]);

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await load(search);
    } finally {
      setRefreshing(false);
    }
  }

  if (selectedCustomer) {
    return <CustomerDetail customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />;
  }

  return (
    <div>
      <PageHeader
        title="Khách hàng"
        description="Danh sách khách hàng đã mua, gộp theo số điện thoại."
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
            <a
              href={`${API_BASE_URL}/customers/export?format=pdf`}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors"
            >
              <FileText className="w-4 h-4" strokeWidth={1.5} />
              Xuất PDF
            </a>
            <a
              href={`${API_BASE_URL}/customers/export?format=csv`}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all"
            >
              <Download className="w-4 h-4" strokeWidth={1.5} />
              Xuất CSV
            </a>
          </div>
        }
      />

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên, số điện thoại, email..."
          className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
        />
      </div>

      <div className="bg-card rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[22%]" />
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[13%]" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-divider text-left text-text-secondary">
                <th className="px-5 py-3 font-medium">Tên khách hàng</th>
                <th className="px-5 py-3 font-medium">Số điện thoại</th>
                <th className="px-5 py-3 font-medium">Email</th>
                <th className="px-5 py-3 font-medium text-right">Đơn hàng</th>
                <th className="px-5 py-3 font-medium text-right">Tổng chi tiêu</th>
                <th className="px-5 py-3 font-medium">Khách hàng từ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {customers === null &&
                !error &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-5 py-4">
                      <div className="h-4 w-full max-w-xs rounded-sm bg-[color:var(--color-skeleton-base)] animate-pulse" />
                    </td>
                  </tr>
                ))}

              {error && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-secondary">
                    Không thể tải danh sách khách hàng.
                  </td>
                </tr>
              )}

              {customers !== null && customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-secondary">
                    Không tìm thấy khách hàng nào.
                  </td>
                </tr>
              )}

              {customers?.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => setSelectedCustomer(customer)}
                  className="hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 truncate">
                    <span className="font-medium text-primary truncate">{customer.fullName}</span>
                  </td>
                  <td className="px-5 py-3 text-text-secondary whitespace-nowrap">{customer.phone}</td>
                  <td className="px-5 py-3 text-text-secondary truncate">{customer.email ?? '—'}</td>
                  <td className="px-5 py-3 text-right text-text-secondary whitespace-nowrap">{customer.totalOrders}</td>
                  <td className="px-5 py-3 text-right font-medium text-text-primary whitespace-nowrap">
                    {currency.format(customer.totalSpent)}
                  </td>
                  <td className="px-5 py-3 text-text-secondary whitespace-nowrap">
                    {dateFormat.format(new Date(customer.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function CustomerDetail({ customer, onBack }: { customer: CustomerRow; onBack: () => void }) {
  const [orders, setOrders] = useState<CustomerOrderRow[] | null>(null);
  const [error, setError] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetailRow | null>(null);
  const [orderDetailError, setOrderDetailError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setOrders(null);
    setError(false);

    async function load() {
      try {
        const res = (await apiClient.get('/orders', {
          params: { customerId: customer.id, limit: 50 },
        })) as ListEnvelope<CustomerOrderRow>;
        if (!cancelled) setOrders(res.data);
      } catch {
        if (!cancelled) setError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [customer.id]);

  useEffect(() => {
    if (!selectedOrderId) return;
    let cancelled = false;
    setSelectedOrder(null);
    setOrderDetailError(false);

    async function load() {
      try {
        const order = (await apiClient.get(`/orders/${selectedOrderId}`)) as OrderDetailRow;
        if (!cancelled) setSelectedOrder(order);
      } catch {
        if (!cancelled) setOrderDetailError(true);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [selectedOrderId]);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Quay về danh sách khách hàng
      </button>

      <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold text-text-primary mb-6">
        {customer.fullName}
      </h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-card rounded-md shadow-sm p-4">
          <p className="text-xs text-text-muted mb-1">Số điện thoại</p>
          <p className="text-sm font-semibold text-text-primary">{customer.phone}</p>
        </div>
        <div className="bg-card rounded-md shadow-sm p-4">
          <p className="text-xs text-text-muted mb-1">Email</p>
          <p className="text-sm font-semibold text-text-primary truncate">{customer.email ?? '—'}</p>
        </div>
        <div className="bg-card rounded-md shadow-sm p-4">
          <p className="text-xs text-text-muted mb-1">Tổng đơn hàng</p>
          <p className="text-sm font-semibold text-text-primary">{customer.totalOrders}</p>
        </div>
        <div className="bg-card rounded-md shadow-sm p-4">
          <p className="text-xs text-text-muted mb-1">Tổng chi tiêu</p>
          <p className="text-sm font-semibold text-text-primary">{currency.format(customer.totalSpent)}</p>
        </div>
      </div>

      <h2 className="text-sm font-semibold text-text-primary mb-3">Lịch sử đơn hàng</h2>
      <div className="bg-card rounded-md shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[30%]" />
              <col className="w-[30%]" />
              <col className="w-[20%]" />
              <col className="w-[20%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-divider text-left text-text-secondary">
                <th className="px-5 py-3 font-medium">Mã đơn</th>
                <th className="px-5 py-3 font-medium">Ngày đặt</th>
                <th className="px-5 py-3 font-medium text-right">Tổng tiền</th>
                <th className="px-5 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-divider">
              {orders === null &&
                !error &&
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={4} className="px-5 py-4">
                      <div className="h-4 w-full max-w-xs rounded-sm bg-[color:var(--color-skeleton-base)] animate-pulse" />
                    </td>
                  </tr>
                ))}

              {error && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-text-secondary">
                    Không thể tải lịch sử đơn hàng.
                  </td>
                </tr>
              )}

              {orders !== null && orders.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-text-secondary">
                    Khách hàng chưa có đơn hàng nào.
                  </td>
                </tr>
              )}

              {orders?.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrderId(order.id)}
                  className="hover:bg-card-hover transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3 font-medium text-text-primary truncate">{order.orderNumber}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrderId && (
        <OrderDetailModal
          order={selectedOrder}
          error={orderDetailError}
          onClose={() => setSelectedOrderId(null)}
        />
      )}
    </div>
  );
}

function OrderDetailModal({
  order,
  error,
  onClose,
}: {
  order: OrderDetailRow | null;
  error: boolean;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <div
        className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {error && (
          <div className="py-8 text-center text-text-secondary text-sm">Không thể tải chi tiết đơn hàng.</div>
        )}

        {!error && !order && (
          <div className="h-40 rounded-sm bg-[color:var(--color-skeleton-base)] animate-pulse" />
        )}

        {!error && order && (
          <>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-3">
                <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">
                  {order.orderNumber}
                </h2>
                <span
                  className={`inline-block px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_TONES[order.status] ?? ''}`}
                >
                  {STATUS_LABELS[order.status] ?? order.status}
                </span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="text-sm font-medium text-text-secondary hover:text-text-primary cursor-pointer"
              >
                Đóng
              </button>
            </div>
            <p className="text-xs text-text-muted mb-4">{dateTimeFormat.format(new Date(order.createdAt))}</p>

            <table className="w-full text-sm mb-4">
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

            <div className="border-t border-divider pt-4 space-y-2 text-sm mb-4">
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

            <div className="border-t border-divider pt-4">
              <h3 className="text-sm font-semibold text-text-primary mb-3">Thông tin đơn hàng</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                {order.customerSnapshot.address && (
                  <div className="col-span-2">
                    <dt className="text-text-muted">Địa chỉ</dt>
                    <dd className="text-text-primary font-medium">{order.customerSnapshot.address}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-text-muted">Thanh toán</dt>
                  <dd className="text-text-primary font-medium">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</dd>
                </div>
                {order.note && (
                  <div className="col-span-2">
                    <dt className="text-text-muted">Ghi chú</dt>
                    <dd className="text-text-primary font-medium">{order.note}</dd>
                  </div>
                )}
              </dl>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
