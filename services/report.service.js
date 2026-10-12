const prisma = require('../config/prisma.config')

const getTransactionReportData = async (query) => {
    const { startDate, endDate, categoryId, orderType } = query
    
    const transaction = await prisma.transaction.findMany({
        where: {
            paymentStatus: 'paid',

            orderType: orderType || undefined,

            createdAt: (startDate || endDate)
                ? {
                    ...(startDate ? { gte: new Date(startDate) } : {}),
                    ...(endDate ? { lte: new Date(endDate) } : {}),
                }
                : undefined,

            transactionDetails: categoryId
                ? {
                    some: {
                        product: {
                            categoryId: Number(categoryId),
                        },
                    },
                }
                : undefined,
        },

        select: {
            id: true,
            createdAt: true,
            orderType: true,
            customerName: true,
            transactionDetails: {
                select: {
                    product: {
                        select: {
                            category: {
                                select: { name: true },
                            },
                        },
                    },
                },
                take: 1,
            },
        },

        orderBy: {
            createdAt: 'desc',
        },
    })


    return transaction.map(t => ({
        orderCode: `ORDR# ${t.id}`,
        orderDate: t.createdAt,
        orderType: t.orderType,
        category: t.transactionDetails[0]?.product.category.name || '-',
        customerName: t.customerName || '-'
    }))

}

module.exports = {
    getTransactionReportData
}