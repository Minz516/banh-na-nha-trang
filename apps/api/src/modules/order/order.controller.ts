import type { Request, Response, NextFunction } from 'express';
import { OrderService } from './order.service.js';
import { validateRequest } from '../../middlewares/errorMiddleware.js';
import {
  placeOrderBodySchema,
  posOrderBodySchema,
  orderQuerySchema,
  orderLookupBodySchema,
  updateOrderStatusBodySchema,
} from '@repo/shared-types';

export const OrderController = {
  // POST /orders — guest places an order, no account involved
  placeOrder: [
    validateRequest(placeOrderBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const order = await OrderService.placeOrder(req.body);
        res.status(201).json({ success: true, data: order });
      } catch (err) {
        next(err);
      }
    },
  ],

  // POST /orders/pos — admin places POS order
  posOrder: [
    validateRequest(posOrderBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const order = await OrderService.posOrder(req.body);
        res.status(201).json({ success: true, data: order });
      } catch (err) {
        next(err);
      }
    },
  ],

  // POST /orders/lookup — guest order tracking
  lookup: [
    validateRequest(orderLookupBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const order = await OrderService.lookupOrder(req.body);
        res.json({ success: true, data: order });
      } catch (err) {
        next(err);
      }
    },
  ],

  // GET /admin/orders
  async listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const q = orderQuerySchema.parse(req.query);
      const { items, total, page, limit, totalPages } = await OrderService.queryOrders(q);
      res.json({
        success: true,
        data: items,
        meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
      });
    } catch (err) {
      next(err);
    }
  },

  // GET /admin/orders/:id
  async getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.getOrderById(req.params.id as string);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  // PATCH /admin/orders/:id/status
  updateStatus: [
    validateRequest(updateOrderStatusBodySchema),
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const order = await OrderService.updateOrderStatus(req.params.id as string, req.body, req.user!.userId);
        res.json({ success: true, data: order });
      } catch (err) {
        next(err);
      }
    },
  ],

  // POST /admin/orders/:id/print
  async printOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const order = await OrderService.printOrder(req.params.id as string);
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },
};
