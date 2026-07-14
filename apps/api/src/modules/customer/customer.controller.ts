import type { Request, Response, NextFunction } from 'express';
import { createRequire } from 'node:module';
import PDFDocument from 'pdfkit';
import { CustomerService } from './customer.service.js';
import { CustomerDTO } from './customer.dto.js';
import { CustomerRepository } from './customer.repository.js';

// Vietnamese names/diacritics don't render with pdfkit's built-in Helvetica —
// embed a real Unicode font (Noto Sans, Vietnamese subset) instead.
const require = createRequire(import.meta.url);
const FONT_REGULAR = require.resolve('@fontsource/noto-sans/files/noto-sans-vietnamese-400-normal.woff');
const FONT_BOLD = require.resolve('@fontsource/noto-sans/files/noto-sans-vietnamese-700-normal.woff');

const pdfCurrency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

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
        return;
      }

      if (format === 'pdf') {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="customers.pdf"');

        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        doc.registerFont('body', FONT_REGULAR);
        doc.registerFont('body-bold', FONT_BOLD);
        doc.pipe(res);

        const columns = [
          { label: 'Tên khách hàng', width: 130 },
          { label: 'SĐT', width: 75 },
          { label: 'Email', width: 130 },
          { label: 'Đơn hàng', width: 55 },
          { label: 'Tổng chi tiêu', width: 95 },
        ] as const;
        const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
        const startX = doc.page.margins.left;

        doc.font('body-bold').fontSize(16).text('Danh sách khách hàng', startX, doc.y);
        doc.moveDown();
        let y = doc.y;

        function drawRow(values: string[], bold = false) {
          let x = startX;
          doc.font(bold ? 'body-bold' : 'body').fontSize(9);
          columns.forEach((col, i) => {
            doc.text(values[i] ?? '', x, y, { width: col.width, ellipsis: true });
            x += col.width;
          });
          y += 20;
        }

        drawRow(columns.map((c) => c.label), true);
        doc.moveTo(startX, y - 4).lineTo(startX + tableWidth, y - 4).strokeColor('#cccccc').stroke();

        for (const row of data) {
          if (y > doc.page.height - doc.page.margins.bottom - 20) {
            doc.addPage();
            y = doc.page.margins.top;
          }
          drawRow([row.fullName, row.phone, row.email ?? '—', String(row.totalOrders), pdfCurrency.format(row.totalSpent)]);
        }

        doc.end();
        return;
      }

      res.json({ success: true, message: 'OK', data, meta: null });
    } catch (err) {
      next(err);
    }
  },
};
