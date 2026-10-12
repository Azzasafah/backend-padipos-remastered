const jwt = require('jsonwebtoken')
const env = require('../config/env.config')

// middleware untuk verify JWT Token
const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'No token provided!'
            })
        }

        const token = authHeader.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                message: 'No token provided!'
            })
        }

        // verify token
        const decoded = jwt.verify(token, env.JWT_SECRET)
        req.user = decoded
        next()
    } catch (error) {
        return res.status(401).json({
            error: 'Invalid or expired token',
        })
    }
}

// middleware untuk cek user === admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Access denied. Admin only'
        })
    }
    next()
}

const adminOrCashier = (req, res, next) => {
    const allowedRoles = ['admin', 'cashier']

    if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
            error: 'Access denied'
        })
    }
    next()
}

module.exports = {
    authMiddleware,
    adminOnly,
    adminOrCashier
}
