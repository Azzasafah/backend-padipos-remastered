const express = require('express')
const router = express.Router()
const { categoryController } = require('../controllers')
const { validateBody, validateParams, validateQuery } = require('../middlewares/validation.middleware')
const { authMiddleware, adminOnly, adminOrCashier } = require('../middlewares/auth.middleware')
const { createCategorySchema, updateCategorySchema, idParamSchema, paginationSchema } = require('../utils/validators/schema.validator')

router.use(authMiddleware)

router.get('/', validateQuery(paginationSchema), adminOrCashier, categoryController.getAllCategoryWithProduct)
router.get('/:id', validateParams(idParamSchema), adminOrCashier, categoryController.getCategoryWithProductById)
router.post('/', validateBody(createCategorySchema), adminOnly, categoryController.createCategory)
router.put('/:id', validateParams(idParamSchema), validateBody(updateCategorySchema), adminOnly, categoryController.updateCategory)
router.delete('/:id', validateParams(idParamSchema), adminOnly, categoryController.deleteCategory)

module.exports = router