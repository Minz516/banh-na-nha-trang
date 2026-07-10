import { EventEmitter } from 'node:events';

/**
 * Application event bus — singleton pub/sub for cross-module side effects.
 * Events listed here should never block the request that triggered them.
 *
 * Event table:
 *   ORDER_PLACED     : order → customer (increment stats)
 *   ORDER_CANCELLED  : order → catalog (restock) + voucher (release) + customer (decrement)
 *   STOCK_LOW        : catalog → log only
 */

export const AppEvents = {
  ORDER_PLACED: 'ORDER_PLACED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
  ORDER_CANCELLED: 'ORDER_CANCELLED',
  STOCK_LOW: 'STOCK_LOW',
} as const;

export type AppEvent = (typeof AppEvents)[keyof typeof AppEvents];

class EventBus extends EventEmitter {}

export const eventBus = new EventBus();

// Prevent Node's default 10-listener warning — we have multiple cross-module listeners
eventBus.setMaxListeners(20);
