const rateLimit = require('express-rate-limit')

const globalLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 menit
    max: 500,
    message: {
        success: false,
        message: 'Too many requests. Please try again in 1 minutes'
    }
})

const loginLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 menit 
    max: 50, // 50x attempt
    message: {
        success: false,
        message: 'Too many login requests. Please try again in 5 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
})

const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000,
    max: 5,
    message: {
        success: false,
        message: 'Too many OTP requests. Please try again in 5 minutes '
    }
})

module.exports = {
    globalLimiter,
    loginLimiter,
    otpLimiter
}