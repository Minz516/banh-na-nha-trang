/**
 * Vietnamese diacritic-free slug generator.
 * One implementation, imported by both Product.model.ts and Post.model.ts.
 * Never reimplemented per model — a single source of truth for slug format.
 */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // keep only alphanumeric, spaces, hyphens
    .replace(/[\s]+/g, '-') // spaces → hyphens
    .replace(/-+/g, '-') // collapse multiple hyphens
    .replace(/^-|-$/g, ''); // trim leading/trailing hyphens
}
