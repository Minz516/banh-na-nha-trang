import { useCallback, useEffect, useMemo, useState } from 'react';
import { Minus, Package, Plus, Printer, Receipt, Search, Trash2, X } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { PageHeader } from '../components/PageHeader';
import { currency, dateTimeFormat } from '../lib/orderFormat';
import type { ProductRow } from '../lib/catalogTypes';

type ListEnvelope<T> = { data: T[]; meta: { total: number } | null };

type CartLine = {
  productId: string;
  name: string;
  flavor: string | null;
  image: string | null;
  unitPrice: number;
  stock: number;
  quantity: number;
};

type PaymentMethod = 'cod' | 'bank_transfer';

const POS_PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cod: 'Tiền mặt tại quầy',
  bank_transfer: 'Chuyển khoản',
};

type BillOrder = {
  id: string;
  orderNumber: string;
  customerSnapshot: { fullName: string; phone: string; address?: string; email?: string };
  items: Array<{ productSnapshot: { name: string; flavor: string | null }; unitPrice: number; quantity: number; subtotal: number }>;
  subtotal: number;
  discountAmount: number;
  voucherCode?: string | null;
  total: number;
  status: string;
  paymentMethod: PaymentMethod;
  note?: string | null;
  printCount: number;
  createdAt: string;
};

function BillModal({ order, onClose, onPrinted }: { order: BillOrder; onClose: () => void; onPrinted: () => void }) {
  const [printing, setPrinting] = useState(false);

  async function handlePrint() {
    setPrinting(true);
    try {
      await apiClient.post(`/orders/${order.id}/print`);
      onPrinted();
    } catch {
      // Printing the physical bill shouldn't be blocked by a printCount tracking failure.
    } finally {
      setPrinting(false);
      window.print();
    }
  }

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <div className="bg-card rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">
            Hóa đơn {order.orderNumber}
          </h2>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div id="pos-print-area" className="text-sm">
          <div className="text-center mb-4">
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">Bánh Tráng Nhà Na</p>
            <p className="text-xs text-text-secondary">Đặc sản Nha Trang</p>
          </div>

          <div className="border-t border-dashed border-border pt-3 mb-3 text-xs text-text-secondary space-y-1">
            <div className="flex justify-between"><span>Số hóa đơn</span><span className="font-medium text-text-primary">{order.orderNumber}</span></div>
            <div className="flex justify-between"><span>Ngày</span><span>{dateTimeFormat.format(new Date(order.createdAt))}</span></div>
            <div className="flex justify-between"><span>Khách hàng</span><span className="font-medium text-text-primary">{order.customerSnapshot.fullName}</span></div>
            <div className="flex justify-between"><span>SĐT</span><span>{order.customerSnapshot.phone}</span></div>
          </div>

          <table className="w-full text-xs mb-3">
            <thead>
              <tr className="border-b border-border text-left text-text-secondary">
                <th className="py-1 font-medium">Sản phẩm</th>
                <th className="py-1 font-medium text-right">SL</th>
                <th className="py-1 font-medium text-right">Đơn giá</th>
                <th className="py-1 font-medium text-right">T.Tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item, i) => (
                <tr key={i} className="border-b border-dashed border-divider">
                  <td className="py-1.5 text-text-primary">
                    {item.productSnapshot.name}
                    {item.productSnapshot.flavor && <span className="text-text-muted"> ({item.productSnapshot.flavor})</span>}
                  </td>
                  <td className="py-1.5 text-right text-text-secondary">{item.quantity}</td>
                  <td className="py-1.5 text-right text-text-secondary">{currency.format(item.unitPrice)}</td>
                  <td className="py-1.5 text-right text-text-primary">{currency.format(item.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t border-dashed border-border pt-2 space-y-1 text-xs text-text-secondary">
            <div className="flex justify-between"><span>Tạm tính</span><span>{currency.format(order.subtotal)}</span></div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between">
                <span>Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ''}</span>
                <span>-{currency.format(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-semibold text-text-primary pt-1.5 border-t border-divider">
              <span>Tổng cộng</span>
              <span>{currency.format(order.total)}</span>
            </div>
            <div className="flex justify-between pt-1"><span>Thanh toán</span><span>{POS_PAYMENT_LABELS[order.paymentMethod]}</span></div>
          </div>

          <p className="text-center text-[11px] text-text-muted mt-4">Cảm ơn quý khách đã ủng hộ Nhà Na!</p>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            onClick={handlePrint}
            disabled={printing}
            className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
          >
            <Printer className="w-4 h-4" strokeWidth={1.5} />
            In hóa đơn
          </button>
        </div>
      </div>
    </div>
  );
}

export function Store() {
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [productsError, setProductsError] = useState(false);

  const [cart, setCart] = useState<CartLine[]>([]);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [note, setNote] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bill, setBill] = useState<BillOrder | null>(null);

  const loadProducts = useCallback(async (q: string) => {
    setProductsError(false);
    try {
      const params: Record<string, string | number> = { limit: 100 };
      if (q.trim()) params.search = q.trim();
      const res = (await apiClient.get('/products', { params })) as ListEnvelope<ProductRow>;
      setProducts(res.data);
    } catch {
      setProductsError(true);
    }
  }, []);

  useEffect(() => {
    setProducts(null);
    const timeout = setTimeout(() => loadProducts(search), 300);
    return () => clearTimeout(timeout);
  }, [search, loadProducts]);

  function addToCart(product: ProductRow) {
    if (product.stock <= 0) return;
    setCart((prev) => {
      const existing = prev.find((l) => l.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((l) => (l.productId === product.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          flavor: product.flavor,
          image: product.images[0]?.url ?? null,
          unitPrice: product.promoPrice ?? product.basePrice,
          stock: product.stock,
          quantity: 1,
        },
      ];
    });
  }

  function changeQuantity(productId: string, delta: number) {
    setCart((prev) =>
      prev
        .map((l) => (l.productId === productId ? { ...l, quantity: Math.min(l.stock, Math.max(0, l.quantity + delta)) } : l))
        .filter((l) => l.quantity > 0)
    );
  }

  function removeLine(productId: string) {
    setCart((prev) => prev.filter((l) => l.productId !== productId));
  }

  const cartTotal = useMemo(() => cart.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0), [cart]);

  function resetForm() {
    setCart([]);
    setFullName('');
    setPhone('');
    setAddress('');
    setEmail('');
    setNote('');
    setPaymentMethod('cod');
  }

  async function handleCreateBill(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const trimmedName = fullName.trim();
    const trimmedPhone = phone.trim();

    if (cart.length === 0) return setSubmitError('Vui lòng chọn ít nhất một sản phẩm.');
    if (trimmedName.length < 2) return setSubmitError('Tên khách hàng tối thiểu 2 ký tự.');
    if (trimmedPhone.length < 9) return setSubmitError('Số điện thoại không hợp lệ.');

    setSubmitting(true);
    try {
      const created = (await apiClient.post('/orders/pos', {
        items: cart.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        paymentMethod,
        customerInfo: {
          fullName: trimmedName,
          phone: trimmedPhone,
          address: address.trim() || undefined,
          email: email.trim() || undefined,
        },
        note: note.trim() || undefined,
      })) as { data: BillOrder };

      // A POS sale is paid and handed over at the counter immediately — walk it
      // straight through to "completed" so it's printable right away, rather
      // than sitting in "pending" like an online order awaiting confirmation.
      let finalOrder = created.data;
      try {
        const confirmed = (await apiClient.patch(`/orders/${finalOrder.id}/status`, { status: 'confirmed' })) as { data: BillOrder };
        finalOrder = confirmed.data;
        const completed = (await apiClient.patch(`/orders/${finalOrder.id}/status`, { status: 'completed' })) as { data: BillOrder };
        finalOrder = completed.data;
      } catch {
        // Stock is already decremented and the sale recorded — leave status as far
        // advanced as it got; staff can still print (confirmed+ is printable) or
        // finish the transition later from the Đơn hàng tab.
      }

      setBill(finalOrder);
      resetForm();
      await loadProducts(search);
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Không thể tạo hóa đơn.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <PageHeader title="Cửa hàng" description="Lên hóa đơn khi khách mua trực tiếp tại quầy." />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
        {/* Product picker */}
        <div>
          <div className="relative max-w-sm mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" strokeWidth={1.5} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm sản phẩm..."
              className="w-full h-10 pl-9 pr-4 rounded-md border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
            />
          </div>

          {productsError && (
            <div className="bg-card rounded-md shadow-sm py-16 px-6 text-center text-text-secondary text-sm">
              Không thể tải danh sách sản phẩm.
            </div>
          )}

          {!productsError && products === null && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-card rounded-md shadow-sm h-44 animate-pulse" />
              ))}
            </div>
          )}

          {!productsError && products !== null && products.length === 0 && (
            <div className="bg-card rounded-md shadow-sm py-16 px-6 text-center text-text-secondary text-sm">
              Không tìm thấy sản phẩm nào đang bán.
            </div>
          )}

          {!productsError && products !== null && products.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {products.map((p) => {
                const price = p.promoPrice ?? p.basePrice;
                const inCart = cart.find((l) => l.productId === p.id);
                const atStockLimit = !!inCart && inCart.quantity >= p.stock;
                const outOfStock = p.stock <= 0;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addToCart(p)}
                    disabled={outOfStock || atStockLimit}
                    className="text-left bg-card rounded-md shadow-sm hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer overflow-hidden"
                  >
                    <div className="aspect-square bg-background-alt relative">
                      {p.images[0] ? (
                        <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-text-muted">
                          <Package className="w-6 h-6" strokeWidth={1.5} />
                        </div>
                      )}
                      {outOfStock && (
                        <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-danger text-white text-[11px] font-semibold">
                          Hết hàng
                        </span>
                      )}
                      {inCart && (
                        <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                          {inCart.quantity}
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-sm font-medium text-text-primary line-clamp-1">{p.name}</p>
                      {p.flavor && <p className="text-xs text-text-secondary line-clamp-1">{p.flavor}</p>}
                      <div className="mt-1 flex items-center justify-between">
                        <span className="text-sm font-semibold text-text-primary">{currency.format(price)}</span>
                        <span className="text-xs text-text-muted">Còn {p.stock}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Cart + bill form */}
        <div className="bg-card rounded-md shadow-sm p-5 h-fit lg:sticky lg:top-6">
          <h2 className="text-sm font-semibold text-text-primary mb-3">Giỏ hàng</h2>

          {cart.length === 0 ? (
            <p className="text-sm text-text-secondary py-6 text-center">Chưa chọn sản phẩm nào.</p>
          ) : (
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto pr-1">
              {cart.map((line) => (
                <div key={line.productId} className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-sm overflow-hidden bg-background-alt shrink-0">
                    {line.image ? (
                      <img src={line.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-muted">
                        <Package className="w-4 h-4" strokeWidth={1.5} />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-text-primary truncate">{line.name}</p>
                    <p className="text-xs text-text-secondary">{currency.format(line.unitPrice)}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => changeQuantity(line.productId, -1)}
                      className="w-6 h-6 rounded-sm border border-border flex items-center justify-center text-text-secondary hover:bg-background-alt cursor-pointer"
                    >
                      <Minus className="w-3 h-3" strokeWidth={2} />
                    </button>
                    <span className="w-5 text-center text-xs font-medium text-text-primary">{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => changeQuantity(line.productId, 1)}
                      disabled={line.quantity >= line.stock}
                      className="w-6 h-6 rounded-sm border border-border flex items-center justify-center text-text-secondary hover:bg-background-alt disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" strokeWidth={2} />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeLine(line.productId)}
                      className="w-6 h-6 rounded-sm flex items-center justify-center text-text-secondary hover:text-danger cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-between text-sm font-semibold text-text-primary pt-3 border-t border-divider mb-4">
            <span>Tổng cộng</span>
            <span>{currency.format(cartTotal)}</span>
          </div>

          <form onSubmit={handleCreateBill}>
            <label htmlFor="pos-name" className="block text-xs font-semibold text-text-secondary mb-1">Tên khách hàng</label>
            <input
              id="pos-name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full h-9 px-3 mb-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="Nguyễn Văn A"
            />

            <label htmlFor="pos-phone" className="block text-xs font-semibold text-text-secondary mb-1">Số điện thoại</label>
            <input
              id="pos-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-9 px-3 mb-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
              placeholder="09xxxxxxxx"
            />

            <label htmlFor="pos-address" className="block text-xs font-semibold text-text-secondary mb-1">Địa chỉ (tùy chọn)</label>
            <input
              id="pos-address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full h-9 px-3 mb-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
            />

            <label htmlFor="pos-email" className="block text-xs font-semibold text-text-secondary mb-1">Email (tùy chọn)</label>
            <input
              id="pos-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-9 px-3 mb-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
            />

            <label htmlFor="pos-payment" className="block text-xs font-semibold text-text-secondary mb-1">Thanh toán</label>
            <select
              id="pos-payment"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full h-9 px-3 mb-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]"
            >
              <option value="cod">Tiền mặt tại quầy</option>
              <option value="bank_transfer">Chuyển khoản</option>
            </select>

            <label htmlFor="pos-note" className="block text-xs font-semibold text-text-secondary mb-1">Ghi chú (tùy chọn)</label>
            <textarea
              id="pos-note"
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3 py-2 mb-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] resize-none"
            />

            {submitError && <p className="text-sm text-danger mb-3">{submitError}</p>}

            <button
              type="submit"
              disabled={submitting || cart.length === 0}
              className="w-full inline-flex items-center justify-center gap-2 h-11 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
            >
              <Receipt className="w-4 h-4" strokeWidth={1.5} />
              {submitting ? 'Đang tạo...' : 'Tạo hóa đơn'}
            </button>
          </form>
        </div>
      </div>

      {bill && (
        <BillModal
          order={bill}
          onClose={() => setBill(null)}
          onPrinted={() => setBill((prev) => (prev ? { ...prev, printCount: prev.printCount + 1 } : prev))}
        />
      )}
    </div>
  );
}
