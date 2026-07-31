'use client';

import { useState } from 'react';
import type { Order } from '@repo/shared-types';
import { apiClient } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import {
  CUSTOMER_STATUS_LABELS,
  STATUS_TONES,
  STATUS_STEPS,
  PAYMENT_LABELS,
  currency,
  dateTimeFormat,
} from '@/lib/orderFormat';

type FormState = { orderNumber: string; phone: string };

const INITIAL_FORM: FormState = { orderNumber: '', phone: '' };

// Guest order tracking (SRS.md D5): no account, keyed by orderNumber + phone —
// mirrors the same phone-first identity checkout uses (POST /orders/lookup).
export default function OrderLookupPage() {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [order, setOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await apiClient.post<Order>('/orders/lookup', {
        orderNumber: form.orderNumber.trim(),
        phone: form.phone.trim(),
      });
      setOrder(result);
    } catch (err) {
      setOrder(null);
      setError(err instanceof ApiError ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setOrder(null);
    setError(null);
    setForm(INITIAL_FORM);
  }

  return (
    <div className="py-12 md:py-16 bg-background-alt min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 max-w-2xl">
        <h1 className="font-display text-3xl text-text-primary mb-2">Tra cứu đơn hàng</h1>
        <p className="text-text-secondary mb-8">
          Nhập mã đơn hàng và số điện thoại đã dùng khi đặt hàng để xem tình trạng đơn.
        </p>

        {!order && (
          <form onSubmit={handleSubmit} className="bg-card p-6 md:p-8 rounded-md shadow-sm space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Mã đơn hàng</label>
              <input
                type="text"
                required
                value={form.orderNumber}
                onChange={(e) => updateField('orderNumber', e.target.value.toUpperCase())}
                className="w-full h-11 px-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-focus-ring uppercase"
                placeholder="VD: BTNN-20260731-001"
              />
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
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover active:bg-primary-active active:scale-[0.98] transition-all disabled:opacity-40"
            >
              {submitting ? 'Đang tra cứu...' : 'Tra cứu'}
            </button>
          </form>
        )}

        {order && <OrderResult order={order} onReset={handleReset} />}
      </div>
    </div>
  );
}

function OrderResult({ order, onReset }: { order: Order; onReset: () => void }) {
  const isCancelled = order.status === 'cancelled';
  const currentStepIndex = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 md:p-8 rounded-md shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="text-sm text-text-secondary mb-1">Mã đơn hàng</p>
            <p className="font-display text-xl text-text-primary">{order.orderNumber}</p>
          </div>
          <span className={`inline-flex items-center h-8 px-4 rounded-full text-sm font-semibold ${STATUS_TONES[order.status]}`}>
            {CUSTOMER_STATUS_LABELS[order.status]}
          </span>
        </div>

        {isCancelled ? (
          <div className="rounded-sm border border-danger/30 bg-danger/5 p-4">
            <p className="text-sm font-medium text-danger">Đơn hàng đã bị hủy</p>
            {order.cancelReason && <p className="text-sm text-text-secondary mt-1">Lý do: {order.cancelReason}</p>}
          </div>
        ) : (
          <ol className="flex items-center w-full">
            {STATUS_STEPS.map((step, i) => {
              const reached = i <= currentStepIndex;
              const isLast = i === STATUS_STEPS.length - 1;
              return (
                <li key={step} className={`flex items-center ${isLast ? 'flex-none' : 'flex-1'}`}>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        reached ? 'bg-primary text-white' : 'bg-border text-text-secondary'
                      }`}
                    >
                      {i + 1}
                    </div>
                    <span className={`text-xs max-w-20 ${reached ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                      {CUSTOMER_STATUS_LABELS[step]}
                    </span>
                  </div>
                  {!isLast && (
                    <div className={`h-0.5 flex-1 mx-2 mb-6 ${i < currentStepIndex ? 'bg-primary' : 'bg-border'}`} />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>

      <div className="bg-card p-6 md:p-8 rounded-md shadow-sm">
        <h2 className="font-display text-lg text-text-primary mb-4">Sản phẩm</h2>
        <ul className="space-y-3 mb-4">
          {order.items.map((item, i) => (
            <li key={i} className="flex justify-between items-start text-sm">
              <span className="text-text-secondary flex-1 pr-4">
                {item.quantity}x {item.productSnapshot.name}
                {item.productSnapshot.flavor && ` (${item.productSnapshot.flavor})`}
              </span>
              <span className="font-medium text-text-primary">{currency.format(item.subtotal)}</span>
            </li>
          ))}
        </ul>
        <div className="border-t border-divider pt-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-text-secondary">Tạm tính</span>
            <span className="text-text-primary">{currency.format(order.subtotal)}</span>
          </div>
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">Giảm giá{order.voucherCode ? ` (${order.voucherCode})` : ''}</span>
              <span className="text-success">-{currency.format(order.discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between items-end pt-2">
            <span className="font-semibold text-text-primary">Tổng cộng</span>
            <span className="text-xl font-bold text-primary">{currency.format(order.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-card p-6 md:p-8 rounded-md shadow-sm">
        <h2 className="font-display text-lg text-text-primary mb-4">Thông tin giao hàng</h2>
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-text-secondary">Người nhận</dt>
            <dd className="text-text-primary text-right">{order.customerSnapshot.fullName}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Điện thoại</dt>
            <dd className="text-text-primary text-right">{order.customerSnapshot.phone}</dd>
          </div>
          {order.customerSnapshot.address && (
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary shrink-0">Địa chỉ</dt>
              <dd className="text-text-primary text-right">{order.customerSnapshot.address}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-text-secondary">Thanh toán</dt>
            <dd className="text-text-primary text-right">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-text-secondary">Ngày đặt</dt>
            <dd className="text-text-primary text-right">{dateTimeFormat.format(new Date(order.createdAt))}</dd>
          </div>
          {order.note && (
            <div className="flex justify-between gap-4">
              <dt className="text-text-secondary shrink-0">Ghi chú</dt>
              <dd className="text-text-primary text-right">{order.note}</dd>
            </div>
          )}
        </dl>
      </div>

      <button
        type="button"
        onClick={onReset}
        className="w-full h-12 rounded-md border border-border text-text-primary font-semibold hover:bg-background-alt transition-colors"
      >
        Tra cứu đơn hàng khác
      </button>
    </div>
  );
}
