const rateLimit = require("express-rate-limit");

/**
 * General API Limiter:
 * - Applied to all non-auth routes.
 * - Limits each IP to 100 requests per 15 minutes.
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: {
    status: 429,
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});

/**
 * Auth Limiter:
 * - Applied specifically to login, register, and OTP routes.
 * - Stricter limit: 5 requests per 15 minutes.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: "Too many login/OTP attempts, please try again after 15 minutes",
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
};
