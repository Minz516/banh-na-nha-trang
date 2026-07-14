import { useState } from 'react';

type Props = {
  orderNumber: string;
  submitting: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

// Section 6.12 — centered dialog, radius-lg, shadow-lg, scrim behind.
// Reason is required: staff must record why an order was cancelled.
export function CancelOrderModal({ orderNumber, submitting, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <div
        className="bg-card rounded-lg shadow-lg max-w-sm w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary mb-1">
          Hủy đơn {orderNumber}
        </h2>
        <p className="text-sm text-text-secondary mb-4">Vui lòng ghi lí do hủy đơn hàng này.</p>

        <label htmlFor="cancel-reason" className="block text-sm font-semibold text-text-secondary mb-1">
          Lí do hủy
        </label>
        <textarea
          id="cancel-reason"
          rows={3}
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ví dụ: khách không nghe máy, khách đổi ý..."
          className="w-full px-4 py-2.5 mb-4 rounded-sm border border-border bg-surface outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)] resize-none"
        />

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer"
          >
            Đóng
          </button>
          <button
            type="button"
            disabled={!trimmed || submitting}
            onClick={() => onConfirm(trimmed)}
            className="flex-1 h-10 rounded-md bg-danger text-white text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer"
          >
            {submitting ? 'Đang hủy...' : 'Xác nhận hủy'}
          </button>
        </div>
      </div>
    </div>
  );
}
