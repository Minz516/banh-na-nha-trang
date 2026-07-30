import { AppError } from '../../middlewares/errorMiddleware.js';
import { OrderRepository } from './order.repository.js';
import { CatalogInterfaces } from '../catalog/catalog.interfaces.js';
import { CustomerInterfaces } from '../customer/customer.interfaces.js';
import { VoucherInterfaces } from '../voucher/voucher.interfaces.js';
import { eventBus, AppEvents } from '../../utils/eventBus.js';
import type { PlaceOrderBody, PosOrderBody, OrderQuery, UpdateOrderStatusBody, OrderLookupBody } from '@repo/shared-types';
import type { IOrder, OrderStatus } from './order.model.js';

export const OrderService = {
  /**
   * D3: Place order — atomic stock decrement per item, voucher consumption, customer upsert.
   */
  async placeOrder(body: PlaceOrderBody): Promise<IOrder> {
    // 1. Resolve product snapshots and decrement stock atomically
    const resolvedItems: Array<{
      productSnapshot: { productId: string; name: string; slug: string; image: string | null; flavor: string | null };
      unitPrice: number;
      quantity: number;
      subtotal: number;
    }> = [];

    const decremented: Array<{ productId: string; qty: number }> = [];

    try {
      for (const item of body.items) {
        const snapshot = await CatalogInterfaces.getProductSnapshot(item.productId);
        if (!snapshot) throw new AppError(404, `Sản phẩm ${item.productId} không tồn tại`);

        const updated = await CatalogInterfaces.decrementStock(item.productId, item.quantity);
        if (!updated) throw new AppError(400, `Sản phẩm "${snapshot.name}" không đủ số lượng tồn kho`);
        decremented.push({ productId: item.productId, qty: item.quantity });

        const subtotal = snapshot.unitPrice * item.quantity;
        resolvedItems.push({
          productSnapshot: {
            productId: snapshot.productId,
            name: snapshot.name,
            slug: snapshot.slug,
            image: snapshot.image,
            flavor: snapshot.flavor,
          },
          unitPrice: snapshot.unitPrice,
          quantity: item.quantity,
          subtotal,
        });
      }
    } catch (err) {
      // Rollback stock decrements on error
      for (const { productId, qty } of decremented) {
        await CatalogInterfaces.incrementStock(productId, qty).catch(() => null);
      }
      throw err;
    }

    // 2. Compute totals
    const subtotal = resolvedItems.reduce((sum, i) => sum + i.subtotal, 0);

    // 3. Validate and consume voucher
    let discountAmount = 0;
    if (body.voucherCode) {
      try {
        const { discountAmount: d } = await VoucherInterfaces.validateVoucher(
          body.voucherCode,
          subtotal,
          body.customerInfo.phone
        );
        discountAmount = d;
        await VoucherInterfaces.consumeVoucher(body.voucherCode, body.customerInfo.phone);
      } catch (err) {
        // Rollback stock on voucher failure
        for (const { productId, qty } of decremented) {
          await CatalogInterfaces.incrementStock(productId, qty).catch(() => null);
        }
        throw err;
      }
    }

    // 4. Upsert customer record
    const customer = await CustomerInterfaces.upsertByPhone({
      phone: body.customerInfo.phone,
      fullName: body.customerInfo.fullName,
      email: body.customerInfo.email,
    });

    const total = Math.max(0, subtotal - discountAmount);

    // 5. Persist order
    const order = await OrderRepository.create({
      customerId: customer._id,
      channel: 'online',
      customerSnapshot: {
        fullName: body.customerInfo.fullName,
        phone: body.customerInfo.phone,
        address: body.customerInfo.address,
        email: body.customerInfo.email,
      },
      items: resolvedItems,
      subtotal,
      discountAmount,
      voucherCode: body.voucherCode,
      total,
      status: 'pending',
      paymentMethod: body.paymentMethod,
      note: body.note,
    });

    // 6. Emit event — customer.events listens for this to increment totalOrders/totalSpent.
    // Non-blocking by design (eventBus.ts): the response never waits on this.
    eventBus.emit(AppEvents.ORDER_PLACED, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      customerId: customer._id.toString(),
      total,
    });

    return order;
  },

  /**
   * D7: POS mode — admin places an order at the counter; the customer is never authenticated.
   */
  async posOrder(body: PosOrderBody): Promise<IOrder> {
    // Reuse placeOrder logic, then tag the record as a counter sale.
    const order = await OrderService.placeOrder({
      ...(body as PlaceOrderBody),
      customerInfo: {
        ...body.customerInfo,
        address: body.customerInfo.address ?? 'POS - Tại quầy',
      },
    });

    return (await OrderRepository.setChannel(order._id.toString(), 'pos')) ?? order;
  },

  async getOrderById(id: string): Promise<IOrder> {
    const order = await OrderRepository.findById(id);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
    return order;
  },

  async lookupOrder(body: OrderLookupBody): Promise<IOrder> {
    const order = await OrderRepository.findByOrderNumberAndPhone(body.orderNumber, body.phone);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng với thông tin này');
    return order;
  },

  async queryOrders(q: OrderQuery) {
    return OrderRepository.query(q);
  },

  async updateOrderStatus(id: string, body: UpdateOrderStatusBody, adminId: string): Promise<IOrder> {
    const order = await OrderRepository.findById(id);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

    const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
      // 'completed' is reachable directly from 'confirmed' — the admin UI's
      // simplified 4-status flow (pending/confirmed/cancelled/total) skips the
      // 'shipping' stage entirely, it's not surfaced as its own view anywhere.
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipping', 'completed', 'cancelled'],
      shipping: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!VALID_TRANSITIONS[order.status].includes(body.status as OrderStatus)) {
      throw new AppError(400, `Không thể chuyển từ "${order.status}" sang "${body.status}"`);
    }

    const updated = await OrderRepository.updateStatus(id, body.status as OrderStatus, {
      changedBy: adminId,
      cancelReason: body.cancelReason,
    });
    if (!updated) throw new AppError(404, 'Không tìm thấy đơn hàng');

    // D4/D6: restock, release the voucher, and decrement customer stats — all three are
    // handled by catalog.events / voucher.events / customer.events listening for this.
    // Non-blocking by design (eventBus.ts): the response never waits on these.
    if (body.status === 'cancelled') {
      eventBus.emit(AppEvents.ORDER_CANCELLED, {
        items: order.items.map((item) => ({
          productId: item.productSnapshot.productId,
          quantity: item.quantity,
        })),
        voucherCode: order.voucherCode,
        phone: order.customerSnapshot.phone,
        customerId: order.customerId.toString(),
        total: order.total,
      });
    }

    eventBus.emit(AppEvents.ORDER_STATUS_CHANGED, {
      orderId: id,
      status: body.status,
    });

    return updated;
  },

  /**
   * D7: printable once the order has left `pending` and hasn't been `cancelled`.
   * Reprints are unlimited; each call increments printCount.
   */
  async printOrder(id: string): Promise<IOrder> {
    const order = await OrderRepository.findById(id);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
    if (order.status === 'pending' || order.status === 'cancelled') {
      throw new AppError(400, `Không thể in đơn hàng ở trạng thái "${order.status}"`);
    }

    const updated = await OrderRepository.incrementPrintCount(id);
    if (!updated) throw new AppError(404, 'Không tìm thấy đơn hàng');
    return updated;
  },
};
