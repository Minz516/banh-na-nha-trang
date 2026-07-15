import type { Request, Response, NextFunction } from 'express';
import { createRequire } from 'node:module';
import PDFDocument from 'pdfkit';
import { CustomerService } from './customer.service.js';
import { CustomerDTO } from './customer.dto.js';
import { CustomerRepository } from './customer.repository.js';

// Vietnamese names/diacritics don't render with pdfkit's built-in Helvetica —
// embed real Unicode fonts instead. @fontsource ships Noto Sans pre-split into
// per-script subsets for browser <link rel=preload> use (the "vietnamese"
// subset alone has only ~139 glyphs — the Vietnamese-specific diacritic marks,
// none of the plain ASCII letters), so any name has to draw from *both* the
// "latin" and "vietnamese" subsets glyph-by-glyph — see drawMixedText below.
const require = createRequire(import.meta.url);
const FONT_LATIN_REGULAR = require.resolve('@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff');
const FONT_LATIN_BOLD = require.resolve('@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff');
const FONT_VIET_REGULAR = require.resolve('@fontsource/noto-sans/files/noto-sans-vietnamese-400-normal.woff');
const FONT_VIET_BOLD = require.resolve('@fontsource/noto-sans/files/noto-sans-vietnamese-700-normal.woff');

const pdfCurrency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' });

type FontRun = { text: string; font: string };

// Splits `text` into runs, each tagged with whichever registered font
// (`lat`/`lat-bold` or `viet`/`viet-bold`) actually has a glyph for those
// characters, so mixed strings like "Nguyễn Văn Ánh" render correctly.
function splitFontRuns(
  latinFont: { glyphForCodePoint(cp: number): { id: number } },
  vietFont: { glyphForCodePoint(cp: number): { id: number } },
  text: string,
  bold: boolean,
): FontRun[] {
  const runs: FontRun[] = [];
  for (const ch of text) {
    const cp = ch.codePointAt(0) ?? 0;
    const covered = latinFont.glyphForCodePoint(cp).id !== 0 ? 'lat' : vietFont.glyphForCodePoint(cp).id !== 0 ? 'viet' : 'lat';
    const font = bold ? `${covered}-bold` : covered;
    const last = runs[runs.length - 1];
    if (last && last.font === font) last.text += ch;
    else runs.push({ text: ch, font });
  }
  return runs;
}

function widthOfRuns(doc: PDFKit.PDFDocument, runs: FontRun[]): number {
  return runs.reduce((sum, run) => sum + doc.font(run.font).widthOfString(run.text), 0);
}

// Manual ellipsis truncation — pdfkit's built-in `{ ellipsis: true }` only
// works for a single-font text() call, not a sequence of mixed-font runs.
function truncateRuns(doc: PDFKit.PDFDocument, runs: FontRun[], maxWidth: number): FontRun[] {
  if (widthOfRuns(doc, runs) <= maxWidth) return runs;

  const ellipsisWidth = doc.font('lat').widthOfString('...');
  const budget = Math.max(0, maxWidth - ellipsisWidth);
  const out: FontRun[] = [];
  let used = 0;

  for (const run of runs) {
    doc.font(run.font);
    let partial = '';
    for (const ch of run.text) {
      const width = doc.widthOfString(partial + ch);
      if (used + width > budget) {
        if (partial) out.push({ text: partial, font: run.font });
        out.push({ text: '...', font: 'lat' });
        return out;
      }
      partial += ch;
    }
    out.push({ text: partial, font: run.font });
    used += doc.widthOfString(partial);
  }
  return out;
}

function drawMixedText(doc: PDFKit.PDFDocument, runs: FontRun[], x: number, y: number): void {
  if (runs.length === 0) return;
  runs.forEach((run, i) => {
    doc.font(run.font);
    if (i === 0) doc.text(run.text, x, y, { continued: i < runs.length - 1, lineBreak: false });
    else doc.text(run.text, { continued: i < runs.length - 1, lineBreak: false });
  });
}

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
        doc.registerFont('lat', FONT_LATIN_REGULAR);
        doc.registerFont('lat-bold', FONT_LATIN_BOLD);
        doc.registerFont('viet', FONT_VIET_REGULAR);
        doc.registerFont('viet-bold', FONT_VIET_BOLD);
        doc.pipe(res);

        // Glyph-coverage lookups for splitFontRuns — pulled off the
        // registered fonts' underlying fontkit instances (pdfkit's own
        // font-embedding layer), so no extra font-parsing dependency is needed.
        const latinFont = (doc.font('lat') as unknown as { _font: { font: { glyphForCodePoint(cp: number): { id: number } } } })._font.font;
        const vietFont = (doc.font('viet') as unknown as { _font: { font: { glyphForCodePoint(cp: number): { id: number } } } })._font.font;

        const columns = [
          { label: 'Tên khách hàng', width: 130 },
          { label: 'SĐT', width: 75 },
          { label: 'Email', width: 130 },
          { label: 'Đơn hàng', width: 55 },
          { label: 'Tổng chi tiêu', width: 95 },
        ] as const;
        const tableWidth = columns.reduce((sum, c) => sum + c.width, 0);
        const startX = doc.page.margins.left;

        function drawTitle(text: string) {
          doc.fontSize(16);
          const runs = splitFontRuns(latinFont, vietFont, text, true);
          drawMixedText(doc, runs, startX, doc.y);
          doc.moveDown();
        }

        function drawRow(values: string[], bold = false) {
          let x = startX;
          doc.fontSize(9);
          columns.forEach((col, i) => {
            const runs = splitFontRuns(latinFont, vietFont, values[i] ?? '', bold);
            const truncated = truncateRuns(doc, runs, col.width);
            doc.fontSize(9);
            drawMixedText(doc, truncated, x, y);
            x += col.width;
          });
          y += 20;
        }

        drawTitle('Danh sách khách hàng');
        let y = doc.y;

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
