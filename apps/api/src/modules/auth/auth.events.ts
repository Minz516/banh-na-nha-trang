import { eventBus, AppEvents } from '../../utils/eventBus.js';
import { CustomerInterfaces } from '../customer/customer.interfaces.js';

/**
 * Auth module events.
 * Registered once at startup (from app.ts or index.ts).
 */
export function registerAuthEvents(): void {
  eventBus.on(
    AppEvents.USER_REGISTERED,
    async (payload: { userId: string; email: string; phone: string; fullName: string }) => {
      try {
        // Create or link the Customer record when a user registers
        await CustomerInterfaces.upsertByPhone({
          phone: payload.phone,
          fullName: payload.fullName,
          email: payload.email,
          userId: payload.userId,
        });
      } catch (err) {
        console.error('[auth.events] USER_REGISTERED handler error:', err);
      }
    }
  );
}
