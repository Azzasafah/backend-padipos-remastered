const express = require('express')
const router = express.Router()

const authRoutes = require('./auth.route')
const categoryRoutes = require('./category.route')
const productRoutes = require('./product.route')
const transactionRoutes = require('./transaction.route')
const reportRoutes = require('./report.route')

router.use('/auth', authRoutes)
router.use('/categories', categoryRoutes)
router.use('/products', productRoutes)
router.use('/transactions', transactionRoutes)
router.use('/reports', reportRoutes)

module.exports = router