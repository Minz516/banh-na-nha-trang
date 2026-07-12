import type { Request, Response, NextFunction } from 'express';
import { CustomerService } from './customer.service.js';
import { CustomerDTO } from './customer.dto.js';
import { CustomerRepository } from './customer.repository.js';

export const CustomerController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, page = '1', limit = '20' } = req.query as Record<string, string>;
      const p = parseInt(page), l = Math.min(parseInt(limit), 100);
      const { customers, total } = await CustomerService.listCustomers({ search, page: p, limit: l });
      const totalPages = Math.ceil(total / l);
      res.json({
        success: true,
        message: 'OK',
        data: customers.map(CustomerDTO.listResponse),
        meta: { total, page: p, limit: l, totalPages, hasNextPage: p < totalPages, hasPrevPage: p > 1 },
      });
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const customer = await CustomerService.getCustomerById(req.params.id as string);
      res.json({ success: true, message: 'OK', data: CustomerDTO.profileResponse(customer), meta: null });
    } catch (err) {
      next(err);
    }
  },

  async export(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const format = (req.query.format as string) ?? 'json';
      const { customers } = await CustomerRepository.list({ page: 1, limit: 10000 });
      const data = customers.map(CustomerDTO.listResponse);
      if (format === 'csv') {
        const keys = Object.keys(data[0] ?? {});
        const rows = [keys.join(','), ...data.map((r) => keys.map((k) => JSON.stringify((r as Record<string,unknown>)[k] ?? '')).join(','))];
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="customers.csv"');
        res.send(rows.join('\n'));
      } else {
        res.json({ success: true, message: 'OK', data, meta: null });
      }
    } catch (err) {
      next(err);
    }
  },
};
