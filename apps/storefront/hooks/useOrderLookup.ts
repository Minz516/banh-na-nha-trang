import { useState, type FormEvent } from 'react';
import type { Order } from '@repo/shared-types';
import { ApiError } from '@/lib/api/errors';
import { lookupOrder } from '@/lib/api/orders';

export type OrderLookupFormState = { orderNumber: string; phone: string };

const INITIAL_FORM: OrderLookupFormState = { orderNumber: '', phone: '' };

// Guest order tracking (SRS.md D5): no account, keyed by orderNumber + phone —
// mirrors the same phone-first identity checkout uses (POST /orders/lookup).
export function useOrderLookup() {
  const [form, setForm] = useState<OrderLookupFormState>(INITIAL_FORM);
  const [order, setOrder] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField<K extends keyof OrderLookupFormState>(key: K, value: OrderLookupFormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = await lookupOrder({
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

  function reset() {
    setOrder(null);
    setError(null);
    setForm(INITIAL_FORM);
  }

  return { form, order, submitting, error, updateField, submit, reset };
}
