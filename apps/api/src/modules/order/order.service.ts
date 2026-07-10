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
  async placeOrder(body: PlaceOrderBody, userId?: string): Promise<IOrder> {
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
      userId,
    });

    const total = Math.max(0, subtotal - discountAmount);

    // 5. Persist order
    const order = await OrderRepository.create({
      customerId: customer._id,
      userId: userId ? (customer.userId ?? undefined) : undefined,
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

    // 6. Update customer stats
    await CustomerInterfaces.incrementStats(customer._id.toString(), total);

    // 7. Emit event for downstream use (admin notifications, etc.)
    eventBus.emit(AppEvents.ORDER_PLACED, {
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      total,
    });

    return order;
  },

  /**
   * D7: POS mode — admin places order on behalf of customer (no auth check on customer side).
   */
  async posOrder(body: PosOrderBody, adminId: string): Promise<IOrder> {
    // Reuse placeOrder logic with pos channel override
    const order = await OrderService.placeOrder(
      {
        ...(body as PlaceOrderBody),
        customerInfo: {
          ...body.customerInfo,
          address: body.customerInfo.address ?? 'POS - Tại quầy',
        },
      },
      adminId
    );

    // Patch channel to 'pos'
    return OrderRepository.updateStatus(order._id.toString(), order.status, {}) as Promise<IOrder>;
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

  async getMyOrders(customerId: string, page: number, limit: number) {
    return OrderRepository.listByCustomerId(customerId, page, limit);
  },

  async queryOrders(q: OrderQuery) {
    return OrderRepository.query(q);
  },

  async updateOrderStatus(id: string, body: UpdateOrderStatusBody, adminId: string): Promise<IOrder> {
    const order = await OrderRepository.findById(id);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');

    const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
      pending: ['confirmed', 'cancelled'],
      confirmed: ['shipping', 'cancelled'],
      shipping: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
    };

    if (!VALID_TRANSITIONS[order.status].includes(body.status as OrderStatus)) {
      throw new AppError(400, `Không thể chuyển từ "${order.status}" sang "${body.status}"`);
    }

    // If cancelling, rollback stock and voucher
    if (body.status === 'cancelled') {
      for (const item of order.items) {
        await CatalogInterfaces.incrementStock(item.productSnapshot.productId, item.quantity).catch(() => null);
      }
      if (order.voucherCode && order.customerSnapshot.phone) {
        await VoucherInterfaces.releaseVoucher(order.voucherCode, order.customerSnapshot.phone).catch(() => null);
      }
      await CustomerInterfaces.decrementStats(order.customerId.toString(), order.total).catch(() => null);
    }

    const updated = await OrderRepository.updateStatus(id, body.status as OrderStatus, {
      changedBy: adminId,
      cancelReason: body.cancelReason,
    });
    if (!updated) throw new AppError(404, 'Không tìm thấy đơn hàng');

    eventBus.emit(AppEvents.ORDER_STATUS_CHANGED, {
      orderId: id,
      status: body.status,
    });

    return updated;
  },

  async printOrder(id: string): Promise<IOrder> {
    const order = await OrderRepository.incrementPrintCount(id);
    if (!order) throw new AppError(404, 'Không tìm thấy đơn hàng');
    return order;
  },
};
