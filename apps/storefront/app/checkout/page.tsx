'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cartStore';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

type OrderResponse = { orderNumber: string };

type FormState = {
  fullName: string;
  phone: string;
  houseNumber: string;
  street: string;
  ward: string;
  city: string;
  email: string;
  paymentMethod: 'cod' | 'bank_transfer';
  note: string;
};

const INITIAL_FORM: FormState = {
  fullName: '',
  phone: '',
  houseNumber: '',
  street: '',
  ward: '',
  city: '',
  email: '',
  paymentMethod: 'cod',
  note: '',
};

// Checkout is guest-only (SRS.md D5): this form's fullName/phone/email upsert the
// Customer record by phone — there is no account, login, or saved-address step.
export default function CheckoutPage() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);

  const [hydrated, setHydrated] = useState(() => useCartStore.persist?.hasHydrated() ?? false);
  useEffect(() => {
    const unsubscribe = useCartStore.persist?.onFinishHydration(() => setHydrated(true));
    useCartStore.persist?.rehydrate();
    return unsubscribe;
  }, []);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    if (items.length === 0) return;

    const address = [form.houseNumber, form.street, form.ward, form.city]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ');

    setSubmitting(true);
    try {
      const result = await apiClient.post<OrderResponse>('/orders', {
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod: form.paymentMethod,
        customerInfo: {
          fullName: form.fullName,
          phone: form.phone,
          address,
          ...(form.email ? { email: form.email } : {}),
        },
        ...(form.note ? { note: form.note } : {}),
      });
      clearCart();
      setOrderNumber(result.orderNumber);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.cause && typeof err.cause === 'object') {
          const fieldErrors: Record<string, string> = {};
          for (const [key, messages] of Object.entries(err.cause as Record<string, string[]>)) {
            const flatKey = key.split('.').pop() ?? key;
            if (Array.isArray(messages) && messages[0]) fieldErrors[flatKey] = messages[0];
          }
          setErrors(fieldErrors);
          setFormError('Vui lòng kiểm tra lại thông tin bên dưới.');
        } else {
          setFormError(err.message);
        }
      } else {
        setFormError('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (orderNumber) {
    return (
      <div className="py-24 text-center px-6">
        <h1 className="font-display text-3xl text-text-primary mb-4">Cảm ơn bạn đã đặt hàng!</h1>
        <p className="text-text-secondary mb-2">
          Mã đơn hàng của bạn là <span className="font-semibold text-text-primary">{orderNumber}</span>
        </p>
        <p className="text-text-secondary mb-8">
          Chúng tôi sẽ liên hệ qua số điện thoại bạn đã cung cấp để xác nhận đơn hàng.
        </p>
        <Link
          href="/products"
          className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
        >
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  if (!hydrated) {
    return <div className="py-24" />;
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center px-6">
        <h1 className="font-display text-2xl text-text-primary mb-4">Không thể thanh toán</h1>
        <p className="text-text-secondary mb-8">Giỏ hàng của bạn đang trống.</p>
        <Link
          href="/cart"
          className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover transition-colors"
        >
          Quay lại giỏ hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="py-12 md:py-16 bg-background-alt min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <h1 className="font-display text-3xl text-text-primary mb-8">Thanh toán</h1>

        <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3 space-y-6">
            <div className="bg-card p-6 md:p-8 rounded-md shadow-sm">
              <h2 className="font-display text-xl text-text-primary mb-6">1. Thông tin giao hàng</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Họ tên</label>
                  <input
                    type="text"
                    required
                    value={form.fullName}
                    onChange={(e) => updateField('fullName', e.target.value)}
                    className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                    placeholder="Nguyễn Văn A"
                  />
                  {errors.fullName && <p className="text-sm text-danger mt-1">{errors.fullName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    value={form.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                    placeholder="09xxxxxxxx"
                  />
                  {errors.phone && <p className="text-sm text-danger mt-1">{errors.phone}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Email (không bắt buộc)</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="Để nhận thông báo đơn hàng"
                />
                {errors.email && <p className="text-sm text-danger mt-1">{errors.email}</p>}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Địa chỉ giao hàng</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      required
                      value={form.houseNumber}
                      onChange={(e) => updateField('houseNumber', e.target.value)}
                      className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                      placeholder="Số nhà"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={form.street}
                      onChange={(e) => updateField('street', e.target.value)}
                      className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                      placeholder="Tên đường"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={form.ward}
                      onChange={(e) => updateField('ward', e.target.value)}
                      className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                      placeholder="Phường/Xã"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      value={form.city}
                      onChange={(e) => updateField('city', e.target.value)}
                      className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                      placeholder="Tỉnh/Thành phố"
                    />
                  </div>
                </div>
                {errors.address && <p className="text-sm text-danger mt-1">{errors.address}</p>}
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Ghi chú (không bắt buộc)</label>
                <input
                  type="text"
                  value={form.note}
                  onChange={(e) => updateField('note', e.target.value)}
                  className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring"
                  placeholder="Ví dụ: giao giờ hành chính"
                />
              </div>
            </div>

            <div className="bg-card p-6 md:p-8 rounded-md shadow-sm">
              <h2 className="font-display text-xl text-text-primary mb-6">2. Phương thức thanh toán</h2>
              <div className="space-y-3">
                <label className="flex items-center p-4 rounded-sm border border-border cursor-pointer has-[:checked]:border-primary">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === 'cod'}
                    onChange={() => updateField('paymentMethod', 'cod')}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="ml-3 font-medium text-text-primary">Thanh toán khi nhận hàng (COD)</span>
                </label>
                <label className="flex items-center p-4 rounded-sm border border-border cursor-pointer has-[:checked]:border-primary">
                  <input
                    type="radio"
                    name="payment"
                    checked={form.paymentMethod === 'bank_transfer'}
                    onChange={() => updateField('paymentMethod', 'bank_transfer')}
                    className="w-4 h-4 accent-primary"
                  />
                  <span className="ml-3 font-medium text-text-primary">Chuyển khoản ngân hàng</span>
                </label>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-card p-6 md:p-8 rounded-md shadow-sm lg:sticky lg:top-24">
              <h2 className="font-display text-xl text-text-primary mb-6">Tóm tắt đơn hàng</h2>
              <ul className="space-y-3 mb-6">
                {items.map((item) => (
                  <li key={item.productId} className="flex justify-between items-start text-sm">
                    <span className="text-text-secondary flex-1 pr-4">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-text-primary">{currency.format(item.price * item.quantity)}</span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-divider pt-4 mb-4 flex justify-between items-end">
                <span className="font-semibold text-text-primary">Tổng cộng</span>
                <span className="text-2xl font-bold text-primary">{currency.format(total)}</span>
              </div>

              {formError && <p className="text-sm text-danger mb-4">{formError}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover active:bg-primary-active active:scale-[0.98] transition-all disabled:opacity-40"
              >
                {submitting ? 'Đang xử lý...' : 'Đặt hàng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
