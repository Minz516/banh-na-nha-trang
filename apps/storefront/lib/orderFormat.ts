import type { OrderStatus } from '@repo/shared-types';

// Customer label set — SRS.md D3: one status enum, two label sets (admin/customer).
// Never show the admin labels (apps/admin/src/lib/orderFormat.ts) to a customer.
export const CUSTOMER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao hàng',
  completed: 'Đã giao',
  cancelled: 'Đã hủy',
};

export const STATUS_TONES: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-accent/15 text-secondary',
  shipping: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

// The forward path a non-cancelled order travels — used to render the tracker.
export const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'completed'];

export const PAYMENT_LABELS: Record<string, string> = {
  cod: 'Thanh toán khi nhận hàng (COD)',
  bank_transfer: 'Chuyển khoản ngân hàng',
};

export const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

export const dateTimeFormat = new Intl.DateTimeFormat('vi-VN', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});
