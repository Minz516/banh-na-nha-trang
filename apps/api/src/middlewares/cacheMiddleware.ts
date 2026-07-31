import type { Request, Response, NextFunction } from 'express';

// Marks a public GET response as safely cacheable by any CDN/reverse proxy placed
// in front of the API later. max-age=0 so browsers always revalidate; s-maxage is
// what a shared cache (CDN) honors. Never apply to auth-gated or write routes.
export function publicCache(seconds: number) {
  return (_req: Request, res: Response, next: NextFunction): void => {
    res.set('Cache-Control', `public, max-age=0, s-maxage=${seconds}, stale-while-revalidate=${seconds * 5}`);
    next();
  };
}
