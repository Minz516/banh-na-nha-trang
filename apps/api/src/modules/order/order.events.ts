import { eventBus, AppEvents } from '../../utils/eventBus.js';

// Emit when a new order is placed
export function onOrderPlaced(
  handler: (payload: { orderId: string; orderNumber: string; total: number }) => void
): void {
  eventBus.on(AppEvents.ORDER_PLACED, handler);
}

// Emit when order status changes
export function onOrderStatusChanged(
  handler: (payload: { orderId: string; status: string }) => void
): void {
  eventBus.on(AppEvents.ORDER_STATUS_CHANGED, handler);
}
