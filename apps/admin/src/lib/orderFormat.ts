export const STATUS_LABELS: Record<string, string> = {
  pending: 'Chờ xử lí',
  confirmed: 'Đã xử lí',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export const STATUS_TONES: Record<string, string> = {
  pending: 'bg-warning/10 text-warning',
  confirmed: 'bg-accent/15 text-secondary',
  shipping: 'bg-info/10 text-info',
  completed: 'bg-success/10 text-success',
  cancelled: 'bg-danger/10 text-danger',
};

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

export const dateFormat = new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
