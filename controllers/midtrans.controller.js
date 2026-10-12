const prisma = require("../config/prisma.config")

const midtransCallback = async (req, res, next) => {
    const { order_id, transaction_status, fraud_status } = req.body

    try {
        const transaction = await prisma.transaction.findFirst({
            where: { midtransOrderId: order_id },
            include: { transactionDetails: true }
        })

        if (!transaction) {
            return res.status(200).json({ message: 'Transaction not found!' })
        }

        if (transaction.paymentStatus === 'paid') {
            return res.status(200).json({ message: 'Already processed!' })
        }

        const isSuccess = transaction_status === 'settlement' ||
            (transaction_status === 'capture' && fraud_status === 'accept')

        if (isSuccess) {
            await prisma.$transaction(async (tx) => {
                await tx.transaction.update({
                    where: { id: transaction.id },
                    data: {
                        paymentStatus: 'paid',
                        paidAt: new Date()
                    }
                })

                for (const item of transaction.transactionDetails) {
                    await tx.product.update({
                        where: { id: item.productId },
                        data: {
                            stock: {
                                decrement: item.quantity
                            }
                        }
                    })
                }
            })
        }

        if (['expire', 'cancel', 'deny'].includes(transaction_status)) {
            await prisma.transaction.update({
                where: { id: transaction.id },
                data: { paymentStatus: 'failed' }
            })
        }

        return res.status(200).json({ message: 'OK' })
    } catch (error) {
        next(error)
    }
}

module.exports = {
    midtransCallback
}