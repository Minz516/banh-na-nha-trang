import type { Request, Response, NextFunction } from 'express';
import { VoucherService } from './voucher.service.js';
import { VoucherDTO } from './voucher.dto.js';
import { validateVoucherBodySchema, createVoucherBodySchema, updateVoucherBodySchema } from '@repo/shared-types';

export const VoucherController = {
  async validate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = validateVoucherBodySchema.parse(req.body);
      const { voucher, discountAmount } = await VoucherService.validate(body.code, body.orderTotal, body.phone);
      res.json({
        success: true,
        message: 'Mã giảm giá hợp lệ',
        data: { voucherId: voucher._id.toString(), code: voucher.code, type: voucher.type, value: voucher.value, discountAmount },
        meta: null,
      });
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = parseInt((req.query.page as string) ?? '1');
      const limit = Math.min(parseInt((req.query.limit as string) ?? '20'), 100);
      const { vouchers, total } = await VoucherService.list(page, limit);
      const totalPages = Math.ceil(total / limit);
      res.json({
        success: true, message: 'OK',
        data: vouchers.map(VoucherDTO.response),
        meta: { total, page, limit, totalPages, hasNextPage: page < totalPages, hasPrevPage: page > 1 },
      });
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = createVoucherBodySchema.parse(req.body);
      const v = await VoucherService.create(body as Parameters<typeof VoucherService.create>[0]);
      res.status(201).json({ success: true, message: 'Tạo voucher thành công', data: VoucherDTO.response(v), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = updateVoucherBodySchema.parse(req.body);
      const v = await VoucherService.update(req.params.id as string, body as Parameters<typeof VoucherService.update>[1]);
      res.json({ success: true, message: 'Cập nhật thành công', data: VoucherDTO.response(v), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await VoucherService.delete(req.params.id as string);
      res.json({ success: true, message: 'Xóa thành công', data: null, meta: null });
    } catch (err) {
      next(err);
    }
  },
};
