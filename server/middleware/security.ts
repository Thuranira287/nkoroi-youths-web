import { RequestHandler } from "express";

// Simple in-memory rate limiting store
interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

const rateLimitStore: RateLimitStore = {};

// Rate limiting middleware
export const rateLimit = (options: {
  windowMs: number;
  maxRequests: number;
  skipSuccessfulRequests?: boolean;
}): RequestHandler => {
  return (req, res, next) => {
    const clientId = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Clean up old entries
    Object.keys(rateLimitStore).forEach(key => {
      if (rateLimitStore[key].resetTime < windowStart) {
        delete rateLimitStore[key];
      }
    });

    // Get or create client entry
    if (!rateLimitStore[clientId]) {
      rateLimitStore[clientId] = {
        count: 0,
        resetTime: now + options.windowMs
      };
    }

    const clientData = rateLimitStore[clientId];

    // Reset if window has passed
    if (clientData.resetTime < now) {
      clientData.count = 0;
      clientData.resetTime = now + options.windowMs;
    }

    // Check rate limit
    if (clientData.count >= options.maxRequests) {
      const resetInMs = clientData.resetTime - now;
      res.set({
        'Retry-After': Math.ceil(resetInMs / 1000).toString(),
        'X-RateLimit-Limit': options.maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
      });

      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil(resetInMs / 1000)
      });
    }

    // Increment counter
    clientData.count++;

    // Set rate limit headers
    res.set({
      'X-RateLimit-Limit': options.maxRequests.toString(),
      'X-RateLimit-Remaining': (options.maxRequests - clientData.count).toString(),
      'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });

    next();
  };
};

// Input sanitization middleware
export const sanitizeInput: RequestHandler = (req, res, next) => {
  const sanitizeString = (str: string): string => {
    if (typeof str !== 'string') return str;
    
    // Remove or escape potentially dangerous characters
    return str
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
  };

  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return sanitizeString(obj);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitizeObject(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  // Sanitize request body
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }

  // Sanitize query parameters
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }

  next();
};

// CSRF-like protection using simple token validation
export const validateRequestOrigin: RequestHandler = (req, res, next) => {
  // Skip for GET requests and certain paths
  if (req.method === 'GET' || req.path.startsWith('/api/ping')) {
    return next();
  }

  const origin = req.get('Origin');
  const referer = req.get('Referer');
  
  // In development, allow localhost
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  // Check if request comes from allowed origins
  const allowedOrigins = [
    process.env.FRONTEND_URL,
    'http://localhost:3000',
    'https://localhost:3000',
    'https://merishooo.com' // For testing
  ].filter(Boolean);

  const isValidOrigin = origin && allowedOrigins.some(allowed => 
    origin.startsWith(allowed)
  );

  const isValidReferer = referer && allowedOrigins.some(allowed => 
    referer.startsWith(allowed)
  );

  if (!isValidOrigin && !isValidReferer) {
    return res.status(403).json({
      success: false,
      message: 'Invalid request origin'
    });
  }

  next();
};

// Request logging middleware
export const requestLogger: RequestHandler = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();
  
  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.path} - ${req.ip}`);

  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const status = res.statusCode;
    const level = status >= 400 ? 'ERROR' : 'INFO';
    
    console.log(`[${timestamp}] ${level} ${req.method} ${req.path} - ${status} (${duration}ms)`);
  });

  next();
};

// Security headers middleware
export const securityHeaders: RequestHandler = (req, res, next) => {
  // Set security headers
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  });

  next();
};
