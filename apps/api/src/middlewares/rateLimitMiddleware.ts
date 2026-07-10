import rateLimit from 'express-rate-limit';

/**
 * Public rate limiter — for catalog/blog routes.
 * Higher limit to handle crawler + SSG build traffic without throttling.
 */
export const publicRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau', cause: null },
  },
});

/**
 * Auth rate limiter — strict cap on login/register to slow brute-force.
 */
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Quá nhiều lần thử, vui lòng thử lại sau 15 phút', cause: null },
  },
});

/**
 * Authenticated/API rate limiter — for admin routes.
 */
export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau', cause: null },
  },
});

/**
 * Checkout rate limiter — guest-writable endpoints (place order, validate voucher).
 * Tighter than publicRateLimit: these mutate state or can be used to brute-force
 * voucher codes, unlike a cacheable catalog/blog read. SRS.md §9 flags prank/spam
 * orders as an unresolved risk — this is the partial mitigation until OTP lands.
 */
export const checkoutRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { statusCode: 429, message: 'Quá nhiều yêu cầu, vui lòng thử lại sau', cause: null },
  },
});
