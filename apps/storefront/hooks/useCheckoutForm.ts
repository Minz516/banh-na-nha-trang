import { useState, type FormEvent } from 'react';
import type { VoucherValidationResult } from '@repo/shared-types';
import { useCartStore } from '@/stores/cartStore';
import { ApiError } from '@/lib/api/errors';
import { placeOrder, validateVoucher } from '@/lib/api/orders';

export type CheckoutFormState = {
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

const INITIAL_FORM: CheckoutFormState = {
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

// Checkout is guest-only (SRS.md D5): fullName/phone/email upsert the Customer
// record by phone — there is no account, login, or saved-address step.
export function useCheckoutForm() {
  const items = useCartStore((state) => state.items);
  const total = useCartStore((state) => state.total);
  const clearCart = useCartStore((state) => state.clearCart);

  const [form, setForm] = useState<CheckoutFormState>(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [voucherInput, setVoucherInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState<VoucherValidationResult | null>(null);
  const [voucherError, setVoucherError] = useState<string | null>(null);
  const [voucherChecking, setVoucherChecking] = useState(false);

  const discountAmount = appliedVoucher?.discountAmount ?? 0;
  const payableTotal = Math.max(total - discountAmount, 0);

  // A code typed but never successfully applied (or applied then edited) must
  // block checkout — the customer either fixes/removes it or applies it first.
  const hasUnappliedVoucherInput = voucherInput.trim() !== '' && appliedVoucher?.code !== voucherInput.trim().toUpperCase();

  function updateField<K extends keyof CheckoutFormState>(key: K, value: CheckoutFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateVoucherInput(value: string) {
    setVoucherInput(value.toUpperCase());
    setVoucherError(null);
  }

  async function applyVoucher() {
    const code = voucherInput.trim();
    if (!code) return;

    setVoucherChecking(true);
    setVoucherError(null);
    try {
      const result = await validateVoucher({
        code,
        orderTotal: total,
        ...(form.phone ? { phone: form.phone } : {}),
      });
      setAppliedVoucher(result);
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherInput('');
      setVoucherError(err instanceof ApiError ? err.message : 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setVoucherChecking(false);
    }
  }

  function removeVoucher() {
    setAppliedVoucher(null);
    setVoucherInput('');
    setVoucherError(null);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    setErrors({});

    if (items.length === 0) return;
    if (hasUnappliedVoucherInput) {
      setVoucherError('Vui lòng áp dụng hoặc xóa mã giảm giá trước khi đặt hàng.');
      return;
    }

    const address = [form.houseNumber, form.street, form.ward, form.city]
      .map((part) => part.trim())
      .filter(Boolean)
      .join(', ');

    setSubmitting(true);
    try {
      const result = await placeOrder({
        items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
        paymentMethod: form.paymentMethod,
        customerInfo: {
          fullName: form.fullName,
          phone: form.phone,
          address,
          ...(form.email ? { email: form.email } : {}),
        },
        ...(appliedVoucher ? { voucherCode: appliedVoucher.code } : {}),
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
        } else if (appliedVoucher && err.message.toLowerCase().includes('giảm giá')) {
          // The voucher was valid when applied but the order-time re-check rejected it
          // (e.g. someone else just used up the last slot) — reset it like an invalid code.
          setAppliedVoucher(null);
          setVoucherInput('');
          setVoucherError(err.message);
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

  return {
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
  };
}
