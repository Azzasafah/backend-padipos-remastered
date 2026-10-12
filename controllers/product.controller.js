const prisma = require('../config/prisma.config')
const { moneyFormat } = require('../utils/moneyFormat')
const { uploadMinio, deleteMinio } = require('../config/minio.config')
const buildMinioUrl = require('../utils/minioHelper')

const getAllProducts = async (req, res, next) => {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit
    const search = req.query.search || ''
    const categoryId = req.query.categoryId ? Number(req.query.categoryId) : undefined

    try {
        const where = {
            name: { contains: search },
            ...(categoryId ? { categoryId } : {})
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                include: { category: true },
                skip,
                take: limit,
                orderBy: { name: 'asc' }
            }),
            prisma.product.count({ where })
        ])

        const formatted = products.map(product => ({
            id: product.id.toString(),
            name: product.name,
            price: moneyFormat(product.price),
            rawPrice: Number(product.price),
            description: product.description,
            stock: product.stock,
            image: product.image,
            imageUrl: buildMinioUrl(product.image),
            category: product.category
        }))

        return res.status(200).json({
            message: 'Products read successfully',
            data: formatted,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                perPage: limit,
                total
            }
        })
    } catch (error) {
        next(error)
    }
}

const getProductById = async (req, res, next) => {
    const { id } = req.params

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) },
            include: {
                category: true
            }
        })

        if (!product) {
            const err = new Error('Product not found')
            err.status = 404
            throw err
        }

        return res.status(200).json({
            message: `Product id: ${id} read successfully`,
            product: {
                id: product.id.toString(),
                name: product.name,
                price: moneyFormat(product.price),
                rawPrice: Number(product.price),
                description: product.description,
                stock: product.stock,
                image: product.image,
                imageUrl: buildMinioUrl(product.image),
                category: product.category
            }
        })
    } catch (error) {
        next(error)
    }
}

const createProduct = async (req, res, next) => {
    const { categoryId, name, price, description, stock } = req.body

    try {
        if (!req.file) {
            const err = new Error('No file uploaded')
            err.status = 400
            throw err
        }

        const upload = await uploadMinio(req.file, 'product')

        const newProduct = await prisma.product.create({
            data: {
                name,
                price: Number(price),
                categoryId: Number(categoryId),
                description: description || null,
                stock: Number(stock),
                image: upload.filename,
            },
            include: {
                category: true
            }
        })

        return res.status(201).json({
            message: 'Product created successfully',
            product: {
                id: newProduct.id.toString(),
                name: newProduct.name,
                price: moneyFormat(newProduct.price),
                description: newProduct.description,
                stock: newProduct.stock,
                image: newProduct.image,
                imageUrl: buildMinioUrl(newProduct.image),
                category: newProduct.category
            }
        })
    } catch (error) {
        next(error)
    }
}

const updateProduct = async (req, res, next) => {
    const { id } = req.params
    const { name, price, description, stock, categoryId } = req.body

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        })

        if (!product) {
            const err = new Error('Product not found')
            err.status = 404
            throw err
        }

        let image = product.image

        if (req.file) {
            if (product.image) {
                await deleteMinio(product.image)
            }
            const upload = await uploadMinio(req.file, 'product')
            image = upload.filename
        }

        const updatedProduct = await prisma.product.update({
            where: { id: Number(id) },
            data: {
                categoryId: categoryId ? Number(categoryId) : product.categoryId,
                name: name || product.name,
                price: price !== undefined ? Number(price) : product.price,
                description: description !== undefined ? description : product.description,
                stock: stock !== undefined ? Number(stock) : product.stock,
                image,
            },
            include: {
                category: true
            }
        })

        return res.status(200).json({
            message: `Product id: ${id} updated successfully`,
            product: {
                id: updatedProduct.id.toString(),
                name: updatedProduct.name,
                price: moneyFormat(updatedProduct.price),
                description: updatedProduct.description,
                stock: updatedProduct.stock,
                image: updatedProduct.image,
                imageUrl: buildMinioUrl(updatedProduct.image),
                category: updatedProduct.category
            }
        })
    } catch (error) {
        next(error)
    }
}

const deleteProduct = async (req, res, next) => {
    const { id } = req.params

    try {
        const product = await prisma.product.findUnique({
            where: { id: Number(id) }
        })

        if (!product) {
            const err = new Error('Product not found')
            err.status = 404
            throw err
        }

        if (product.image) {
            await deleteMinio(product.image)
        }

        await prisma.product.delete({
            where: { id: Number(id) }
        })

        return res.status(200).json({
            message: `Product id: ${id} deleted successfully`,
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}