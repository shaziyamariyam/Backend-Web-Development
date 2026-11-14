'use strict';

// middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 5, // Maximum 5 attempts per IP

    standardHeaders: true,
    legacyHeaders: false,

    skipSuccessfulRequests: true,

    handler: (req, res, next, options) => {
        res.setHeader(
            'Retry-After',
            Math.ceil(options.windowMs / 1000)
        );

        res.status(429).json({
            message: 'Too many requests. Please try again later.'
        });
    }
});

// In a multi-instance deployment, a Redis-backed store
// (rate-limit-redis) can replace the default in-memory store.
// This allows all server instances behind a load balancer to
// share the same rate-limit counters. In-memory stores maintain
// separate counters per instance, allowing users to bypass
// limits by sending requests to different instances.

module.exports = authRateLimiter;