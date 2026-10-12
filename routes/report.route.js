const express = require('express')
const router = express.Router()
const { reportController } = require('../controllers')
const { authMiddleware, adminOnly, adminOrCashier } = require('../middlewares/auth.middleware')

router.use(authMiddleware)

router.get('/dashboard', adminOrCashier, reportController.getDashboardSummary)
router.get('/transaction', adminOrCashier, reportController.getTransactionReport)
router.get('/export', adminOrCashier, reportController.exportTransactionExcel)
router.get('/category/:categoryId', adminOrCashier, reportController.getCategorySales)

module.exports = router