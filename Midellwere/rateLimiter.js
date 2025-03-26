// middleware/rateLimiter.js
import rateLimit from 'express-rate-limit';

/**
 * Creates a rate limiter middleware with customizable options
 * 
 * @param {Object} options - Configuration options for the rate limiter
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum number of requests per window
 * @param {string} options.message - Custom error message (optional)
 * @param {string} options.keyGenerator - Custom function to generate keys (optional)
 * @returns {Function} Express middleware function
 */
export const rateLimiter = (options = {}) => {
  return rateLimit({
    // Time window
    windowMs: options.windowMs || 15 * 60 * 1000, // Default: 15 minutes
    
    // Request limit
    max: options.max || 100, // Default: 100 requests per windowMs
    
    // Error message
    message: options.message || {
      status: 'error',
      message: 'Too many requests from this IP. Please try again later.'
    },
    
    // Optional custom key generator (defaults to IP-based)
    keyGenerator: options.keyGenerator || ((req) => req.ip),
    
    // Set appropriate headers
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false,  // Disable the `X-RateLimit-*` headers
    
    // Skip certain requests (optional)
    skip: options.skip || ((req) => false),
    
    // Response handler
    handler: (req, res, next, options) => {
      res.status(429).json(options.message);
    },
    
    // Store configuration (defaults to memory store)
    store: options.store
  });
};

/**
 * Specialized rate limiter for sensitive operations
 * Uses both IP and username/email for tracking
 */
export const advancedRateLimiter = (options = {}) => {
  return rateLimit({
    windowMs: options.windowMs || 60 * 60 * 1000, // Default: 1 hour
    max: options.max || 5, // Default: 5 requests per hour
    message: options.message || {
      status: 'error',
      message: 'Account protection activated. Please try again later.'
    },
    // Use both IP and username/email as key
    keyGenerator: options.keyGenerator || ((req) => {
      const identifier = req.body.email || req.body.username || '';
      return `${req.ip}-${identifier.toLowerCase()}`;
    }),
    standardHeaders: true,
    legacyHeaders: false
  });
};

/**
 * Pre-configured rate limiters for common use cases
 */
export const rateLimiters = {
  // For general API endpoints
  standard: rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
  }),
  
  // For authentication endpoints
  auth: rateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 requests per hour
    message: {
      status: 'error',
      message: 'Too many login attempts. Please try again later.'
    }
  }),
  
  // For password reset
  passwordReset: advancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3 // 3 requests per hour
  }),
  
  // For public APIs
  publicApi: rateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30 // 30 requests per minute
  })
};