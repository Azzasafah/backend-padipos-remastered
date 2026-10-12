const prisma = require("../config/prisma.config")
const snap = require('../config/midtrans.config')

const createTransaction = async (req, res, next) => {
    try {
        const { items, paymentMethod, orderType, customerName, tableNumber, note, paid } = req.body
        const paidAmount = Number(paid)
        const userId = parseInt(req.user.id)

        if (!items || items.length === 0) {
            const err = new Error('Items must not empty!')
            err.status = 400
            throw err
        }

        if (!['cash', 'midtrans'].includes(paymentMethod)) {
            const err = new Error('Payment not valid!')
            err.status = 400
            throw err
        }

        if (!['dine_in', 'take_away'].includes(orderType)) {
            const err = new Error('Order type not valid!')
            err.status = 400
            throw err
        }

        let totalAmount = 0
        const details = []

        // Verify products and calculate amounts
        for (const item of items) {
            const productId = Number(item.productId)
            const qty = item.qty

            const product = await prisma.product.findUnique({
                where: { id: productId }
            })

            if (!product) {
                const err = new Error(`Product id ${productId} not found!`)
                err.status = 404
                throw err
            }

            if (product.stock < qty) {
                const err = new Error(`Stock ${product.name} not enough`)
                err.status = 400
                throw err
            }

            const subtotal = Number(product.price) * qty
            totalAmount += subtotal

            details.push({
                productId: product.id,
                productName: product.name,
                quantity: qty,
                price: product.price,
                subtotal
            })
        }

        let changeAmount = null

        if (paymentMethod === 'cash') {
            if (isNaN(paidAmount) || paidAmount < totalAmount) {
                const err = new Error('Paid amount is less than total amount')
                err.status = 400
                throw err
            }
            changeAmount = paidAmount - totalAmount
        }

        // Cash flow: atomic database transaction
        if (paymentMethod === 'cash') {
            const transaction = await prisma.$transaction(async (tx) => {
                const created = await tx.transaction.create({
                    data: {
                        userId,
                        orderType,
                        customerName: customerName || null,
                        tableNumber: tableNumber ? Number(tableNumber) : null,
                        paymentMethod,
                        paymentStatus: 'paid',
                        totalAmount,
                        note: note || null,
                        paidAmount,
                        changeAmount,
                        paidAt: new Date(),
                        midtransOrderId: null,
                        midtransSnapToken: null,
                        transactionDetails: {
                            create: details
                        }
                    }
                })

                for (const item of items) {
                    await tx.product.update({
                        where: { id: Number(item.productId) },
                        data: {
                            stock: {
                                decrement: item.qty
                            }
                        }
                    })
                }

                return created
            })

            return res.status(201).json({
                success: true,
                message: 'Transaction paid (cash)',
                transactionId: transaction.id,
                paymentStatus: transaction.paymentStatus,
                paymentMethod: transaction.paymentMethod,
                paidAmount: transaction.paidAmount,
                changeAmount: transaction.changeAmount,
                totalAmount: transaction.totalAmount
            })
        }

        // Midtrans flow
        if (paymentMethod === 'midtrans') {
            const transaction = await prisma.transaction.create({
                data: {
                    userId,
                    orderType,
                    customerName: customerName || null,
                    tableNumber: tableNumber ? Number(tableNumber) : null,
                    paymentMethod,
                    paymentStatus: 'pending',
                    totalAmount,
                    note: note || null,
                    paidAmount: null,
                    changeAmount: null,
                    paidAt: null,
                    midtransOrderId: null,
                    midtransSnapToken: null,
                    transactionDetails: {
                        create: details
                    }
                }
            })

            const orderId = `ORDER-${Date.now()}-${transaction.id}`
            const snapResponse = await snap.createTransaction({
                transaction_details: {
                    order_id: orderId,
                    gross_amount: totalAmount
                },
                customer_details: {
                    first_name: customerName || 'Customer'
                }
            })

            await prisma.transaction.update({
                where: { id: transaction.id },
                data: {
                    midtransOrderId: orderId,
                    midtransSnapToken: snapResponse.token
                }
            })

            return res.status(200).json({
                success: true,
                message: 'Transaction (midtrans)',
                transactionId: transaction.id,
                orderId,
                snapId: snapResponse.token,
            })
        }
    } catch (error) {
        next(error)
    }
}

const getTransaction = async (req, res, next) => {
    const search = req.query.search || ''
    const orderType = req.query.orderType || undefined
    const paymentStatus = req.query.paymentStatus || undefined

    try {
        const transactions = await prisma.transaction.findMany({
            where: {
                customerName: {
                    contains: search
                },
                orderType,
                paymentStatus
            },
            select: {
                id: true,
                orderType: true,
                customerName: true,
                tableNumber: true,
                totalAmount: true,
                createdAt: true,
                note: true,
                paymentMethod: true,
                paymentStatus: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        return res.status(200).json({
            message: 'Transaction read successfully',
            data: transactions
        })
    } catch (error) {
        next(error)
    }
}

const getTransactionById = async (req, res, next) => {
    const { id } = req.params

    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: Number(id) },
            select: {
                id: true,
                orderType: true,
                customerName: true,
                tableNumber: true,
                totalAmount: true,
                paidAmount: true,
                changeAmount: true,
                createdAt: true,
                note: true,
                paymentMethod: true,
                paymentStatus: true,
                midtransOrderId: true,
                midtransSnapToken: true,
                paidAt: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        role: true
                    }
                },
                transactionDetails: true
            },
        })

        if (!transaction) {
            const err = new Error('Transaction not found')
            err.status = 404
            throw err
        }

        return res.status(200).json({
            message: `Transaction id: ${id} read successfully`,
            data: transaction
        })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    createTransaction,
    getTransaction,
    getTransactionById
}