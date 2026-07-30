import { useState } from 'react';
import { X } from 'lucide-react';
import type { VoucherFormBody, VoucherRow, VoucherType } from '../lib/voucherTypes';

type Props = {
  mode: 'create' | 'edit';
  voucher?: VoucherRow | null;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (body: VoucherFormBody) => void;
  onClose: () => void;
};

const inputClass =
  'w-full h-10 px-3 rounded-sm border border-border bg-surface text-sm outline-none focus:ring-2 focus:ring-[color:var(--color-focus-ring)]';
const labelClass = 'block text-sm font-semibold text-text-secondary mb-1';

function toDateInput(iso: string | null): string {
  if (!iso) return '';
  return iso.slice(0, 10);
}

export function VoucherFormModal({ mode, voucher, submitting, errorMessage, onSubmit, onClose }: Props) {
  const [code, setCode] = useState(voucher?.code ?? '');
  const [type, setType] = useState<VoucherType>(voucher?.type ?? 'fixed');
  const [value, setValue] = useState(voucher ? String(voucher.value) : '');
  const [minOrderValue, setMinOrderValue] = useState(voucher ? String(voucher.minOrderValue) : '0');
  const [hasMaxDiscount, setHasMaxDiscount] = useState(voucher?.maxDiscount != null);
  const [maxDiscount, setMaxDiscount] = useState(voucher?.maxDiscount != null ? String(voucher.maxDiscount) : '');
  const [hasUsageLimit, setHasUsageLimit] = useState(voucher?.usageLimit != null);
  const [usageLimit, setUsageLimit] = useState(voucher?.usageLimit != null ? String(voucher.usageLimit) : '');
  const [perUserLimit, setPerUserLimit] = useState(voucher ? String(voucher.perUserLimit) : '1');
  const [validFrom, setValidFrom] = useState(toDateInput(voucher?.validFrom ?? null));
  const [validUntil, setValidUntil] = useState(toDateInput(voucher?.validUntil ?? null));
  const [isActive, setIsActive] = useState(voucher?.isActive ?? true);

  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    const trimmedCode = code.trim().toUpperCase();
    const numValue = Number(value);
    const numMinOrder = Number(minOrderValue || 0);
    const numPerUserLimit = Number(perUserLimit || 1);

    if (trimmedCode.length < 3) return setValidationError('Mã voucher tối thiểu 3 ký tự.');
    if (!Number.isFinite(numValue) || numValue <= 0) return setValidationError('Số tiền/phần trăm giảm phải lớn hơn 0.');
    if (type === 'percentage' && numValue > 100) return setValidationError('Phần trăm giảm không được vượt quá 100%.');
    if (!Number.isFinite(numMinOrder) || numMinOrder < 0) return setValidationError('Đơn hàng tối thiểu không hợp lệ.');
    if (!Number.isInteger(numPerUserLimit) || numPerUserLimit <= 0) return setValidationError('Lượt dùng mỗi khách không hợp lệ.');

    let maxDiscountNum: number | null = null;
    if (hasMaxDiscount) {
      maxDiscountNum = Number(maxDiscount);
      if (maxDiscount.trim() === '' || !Number.isFinite(maxDiscountNum) || maxDiscountNum <= 0) {
        return setValidationError('Vui lòng nhập mức giảm tối đa hợp lệ.');
      }
    }

    let usageLimitNum: number | null = null;
    if (hasUsageLimit) {
      usageLimitNum = Number(usageLimit);
      if (usageLimit.trim() === '' || !Number.isInteger(usageLimitNum) || usageLimitNum <= 0) {
        return setValidationError('Vui lòng nhập tổng lượt dùng hợp lệ.');
      }
    }

    if (validFrom && validUntil && new Date(validFrom) > new Date(validUntil)) {
      return setValidationError('Ngày bắt đầu phải trước ngày hết hạn.');
    }

    onSubmit({
      code: trimmedCode,
      type,
      value: numValue,
      minOrderValue: numMinOrder,
      maxDiscount: maxDiscountNum,
      usageLimit: usageLimitNum,
      perUserLimit: numPerUserLimit,
      validFrom: validFrom ? new Date(`${validFrom}T00:00:00`).toISOString() : null,
      validUntil: validUntil ? new Date(`${validUntil}T23:59:59.999`).toISOString() : null,
      ...(mode === 'edit' ? { isActive } : {}),
    });
  }

  const displayError = validationError ?? errorMessage;

  return (
    <div className="fixed inset-0 z-[51] flex items-center justify-center p-4 bg-[rgba(43,29,20,0.4)]" onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="bg-card rounded-lg shadow-lg max-w-xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-text-primary">
            {mode === 'create' ? 'Tạo voucher' : `Sửa voucher — ${voucher?.code}`}
          </h2>
          <button type="button" onClick={onClose} className="text-text-secondary hover:text-text-primary cursor-pointer">
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label htmlFor="vf-code" className={labelClass}>Mã voucher</label>
            <input
              id="vf-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              className={`${inputClass} uppercase`}
              placeholder="NHANA20"
              disabled={mode === 'edit'}
            />
          </div>

          <div>
            <label htmlFor="vf-type" className={labelClass}>Loại giảm giá</label>
            <select
              id="vf-type"
              value={type}
              onChange={(e) => setType(e.target.value as VoucherType)}
              className={inputClass}
            >
              <option value="fixed">Giảm số tiền cố định</option>
              <option value="percentage">Giảm theo phần trăm</option>
            </select>
          </div>

          <div>
            <label htmlFor="vf-value" className={labelClass}>
              {type === 'fixed' ? 'Số tiền giảm (₫)' : 'Phần trăm giảm (%)'}
            </label>
            <input
              id="vf-value"
              type="number"
              min={0}
              step={type === 'fixed' ? 1000 : 1}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="vf-min-order" className={labelClass}>Đơn hàng tối thiểu (₫)</label>
            <input
              id="vf-min-order"
              type="number"
              min={0}
              step={1000}
              value={minOrderValue}
              onChange={(e) => setMinOrderValue(e.target.value)}
              className={inputClass}
            />
          </div>

          {type === 'percentage' && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="vf-max-discount" className="text-sm font-semibold text-text-secondary">Giảm tối đa (₫)</label>
                <label className="inline-flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasMaxDiscount}
                    onChange={(e) => {
                      setHasMaxDiscount(e.target.checked);
                      if (!e.target.checked) setMaxDiscount('');
                    }}
                    className="w-3.5 h-3.5 accent-primary cursor-pointer"
                  />
                  Giới hạn
                </label>
              </div>
              <input
                id="vf-max-discount"
                type="number"
                min={0}
                step={1000}
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                disabled={!hasMaxDiscount}
                className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
                placeholder="Không giới hạn"
              />
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="vf-usage-limit" className="text-sm font-semibold text-text-secondary">Tổng lượt dùng</label>
              <label className="inline-flex items-center gap-1.5 text-xs text-text-secondary cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasUsageLimit}
                  onChange={(e) => {
                    setHasUsageLimit(e.target.checked);
                    if (!e.target.checked) setUsageLimit('');
                  }}
                  className="w-3.5 h-3.5 accent-primary cursor-pointer"
                />
                Giới hạn
              </label>
            </div>
            <input
              id="vf-usage-limit"
              type="number"
              min={1}
              step={1}
              value={usageLimit}
              onChange={(e) => setUsageLimit(e.target.value)}
              disabled={!hasUsageLimit}
              className={`${inputClass} disabled:opacity-40 disabled:cursor-not-allowed`}
              placeholder="Không giới hạn"
            />
          </div>

          <div>
            <label htmlFor="vf-per-user-limit" className={labelClass}>Lượt dùng / khách</label>
            <input
              id="vf-per-user-limit"
              type="number"
              min={1}
              step={1}
              value={perUserLimit}
              onChange={(e) => setPerUserLimit(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="vf-valid-from" className={labelClass}>Bắt đầu (tùy chọn)</label>
            <input
              id="vf-valid-from"
              type="date"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="vf-valid-until" className={labelClass}>Ngày hết hạn (tùy chọn)</label>
            <input
              id="vf-valid-until"
              type="date"
              value={validUntil}
              onChange={(e) => setValidUntil(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {mode === 'edit' && (
          <label className="inline-flex items-center gap-2 text-sm text-text-primary cursor-pointer mb-4">
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="w-4 h-4 accent-primary cursor-pointer" />
            Kích hoạt (cho phép sử dụng)
          </label>
        )}

        {displayError && <p className="text-sm text-danger mb-4">{displayError}</p>}

        <div className="flex gap-3 pt-2 border-t border-divider mt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-10 rounded-md border border-border text-sm font-semibold text-text-secondary hover:bg-background-alt transition-colors cursor-pointer mt-4"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex-1 h-10 rounded-md bg-primary text-white text-sm font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all disabled:opacity-40 cursor-pointer mt-4"
          >
            {submitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo voucher' : 'Lưu thay đổi'}
          </button>
        </div>
      </form>
    </div>
  );
}
