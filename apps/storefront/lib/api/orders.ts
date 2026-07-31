import type { Order, PlaceOrderBody, OrderLookupBody, ValidateVoucherBody, VoucherValidationResult } from '@repo/shared-types';
import { apiClient } from './client';

export type PlaceOrderResult = { orderNumber: string };

export function placeOrder(body: PlaceOrderBody) {
  return apiClient.post<PlaceOrderResult>('/orders', body);
}

export function lookupOrder(body: OrderLookupBody) {
  return apiClient.post<Order>('/orders/lookup', body);
}

export function validateVoucher(body: ValidateVoucherBody) {
  return apiClient.post<VoucherValidationResult>('/vouchers/validate', body);
}
