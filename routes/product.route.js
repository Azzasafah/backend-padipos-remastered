const express = require('express')
const router = express.Router()
const { productController } = require('../controllers')
const upload = require('../config/multer.config')
const { validateBody, validateParams } = require('../middlewares/validation.middleware')
const { authMiddleware, adminOnly, adminOrCashier } = require('../middlewares/auth.middleware')
const { createProductSchema, updateProductSchema, idParamSchema } = require('../utils/validators/schema.validator')

router.use(authMiddleware)

router.get('/', adminOrCashier, productController.getAllProducts)
router.get('/:id', validateParams(idParamSchema), adminOrCashier, productController.getProductById)
router.post('/', upload.single('image'), validateBody(createProductSchema), adminOnly, productController.createProduct)
router.put('/:id', upload.single('image'), validateParams(idParamSchema), validateBody(updateProductSchema), adminOnly, productController.updateProduct)
router.delete('/:id', adminOnly, productController.deleteProduct)

module.exports = router