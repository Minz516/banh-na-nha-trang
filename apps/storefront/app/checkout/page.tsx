'use client';

import Link from 'next/link';
import { useCheckoutForm } from '@/hooks/useCheckoutForm';
import { useCartHydrated } from '@/hooks/useCartHydrated';

const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export default function CheckoutPage() {
  const hydrated = useCartHydrated();
  const {
    items,
    total,
    form,
    errors,
    submitting,
    formError,
    orderNumber,
    voucherInput,
    appliedVoucher,
    voucherError,
    voucherChecking,
    discountAmount,
    payableTotal,
    hasUnappliedVoucherInput,
    updateField,
    updateVoucherInput,
    applyVoucher,
    removeVoucher,
    submit,
  } = useCheckoutForm();

  if (orderNumber) {
    return (
      <div className="py-24 text-center px-6">
        <h1 className="font-display text-3xl text-text-primary mb-4">Cảm ơn bạn đã đặt hàng!</h1>
        <p className="text-text-secondary mb-2">
          Mã đơn hàng của bạn là <span className="font-semibold text-text-primary">{orderNumber}</span>. Hay lưu lại mã này để tra cứu trạng thái đơn hàng.
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

        <form onSubmit={submit} className="flex flex-col lg:flex-row gap-8">
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

              <div className="mb-4">
                <label className="block text-sm font-medium text-text-secondary mb-1">Mã giảm giá</label>
                {appliedVoucher ? (
                  <div className="flex items-center justify-between h-11 px-4 rounded-sm border border-primary bg-primary/5">
                    <span className="text-sm font-medium text-text-primary">
                      {appliedVoucher.code}:  -{currency.format(appliedVoucher.discountAmount)}
                    </span>
                    <button
                      type="button"
                      onClick={removeVoucher}
                      className="text-sm text-text-secondary hover:text-danger transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={voucherInput}
                      onChange={(e) => updateVoucherInput(e.target.value)}
                      placeholder="Nhập mã giảm giá"
                      className="flex-1 h-11 px-1 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyVoucher}
                      disabled={voucherChecking || !voucherInput.trim()}
                      className="h-11 px-5 rounded-sm border border-border text-sm font-semibold text-text-primary hover:bg-background-alt transition-colors disabled:opacity-40"
                    >
                      {voucherChecking ? 'Đang kiểm tra...' : 'Áp dụng'}
                    </button>
                  </div>
                )}
                {voucherError && <p className="text-sm text-danger mt-1">{voucherError}</p>}
              </div>

              <div className="border-t border-divider pt-4 mb-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-text-secondary">Tạm tính</span>
                  <span className="text-text-primary">{currency.format(total)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Giảm giá</span>
                    <span className="text-success">-{currency.format(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-end pt-2">
                  <span className="font-semibold text-text-primary">Tổng cộng</span>
                  <span className="text-2xl font-bold text-primary">{currency.format(payableTotal)}</span>
                </div>
              </div>

              {formError && <p className="text-sm text-danger mb-4">{formError}</p>}

              <button
                type="submit"
                disabled={submitting || hasUnappliedVoucherInput}
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
