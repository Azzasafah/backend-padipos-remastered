const express = require('express')
const router = express.Router()
const { transactionController } = require('../controllers')
const midtransController = require('../controllers/midtrans.controller')
const { validateBody, validateParams } = require('../middlewares/validation.middleware')
const { authMiddleware, adminOrCashier } = require('../middlewares/auth.middleware')
const { createTransactionSchema, idParamSchema } = require('../utils/validators/schema.validator')


router.post('/', validateBody(createTransactionSchema), authMiddleware, adminOrCashier, transactionController.createTransaction)
router.post('/midtrans/callback', midtransController.midtransCallback)
router.get('/', authMiddleware, adminOrCashier, transactionController.getTransaction)
router.get('/:id', validateParams(idParamSchema), authMiddleware, adminOrCashier, transactionController.getTransactionById)
module.exports = router