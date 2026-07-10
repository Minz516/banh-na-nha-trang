// Order DTOs are derived from @repo/shared-types — no further local DTOs needed.
// This file re-exports the canonical DTO types for use within the order module.
export type {
  PlaceOrderBody,
  PosOrderBody,
  UpdateOrderStatusBody,
  OrderLookupBody,
  OrderQuery,
} from '@repo/shared-types';
