const prisma = require('../config/prisma.config')
const { moneyFormat } = require('../utils/moneyFormat')
const { getTransactionReportData } = require('../services/report.service')
const ExcelJS = require('exceljs')

const getDashboardSummary = async (req, res, next) => {
    try {
        const totalOrders = await prisma.transaction.count({
            where: { paymentStatus: 'paid' }
        })

        const totalOmzet = await prisma.transaction.aggregate({
            where: { paymentStatus: 'paid' },
            _sum: {
                totalAmount: true
            }
        })

        const totalItems = await prisma.transactionDetail.aggregate({
            where: {
                transaction: { paymentStatus: 'paid' }
            },
            _sum: {
                quantity: true
            }
        })

        const categorySales = await prisma.transactionDetail.groupBy({
            by: ['productId'],
            where: {
                transaction: { paymentStatus: 'paid' }
            },
            _sum: {
                quantity: true
            }
        })

        const products = await prisma.product.findMany({
            select: {
                id: true,
                category: {
                    select: {
                        name: true
                    }
                }
            }
        })

        const categoryMap = {}
        for (const sale of categorySales) {
            const product = products.find(p => p.id === sale.productId)
            if (!product) continue

            const categoryName = product.category.name
            categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (sale._sum.quantity || 0)
        }

        return res.status(200).json({
            success: true,
            message: 'data report dashboard',
            data: {
                totalOrders,
                totalOmzet: moneyFormat(totalOmzet._sum.totalAmount || 0),
                totalItems: totalItems._sum.quantity || 0,
                categories: categoryMap
            }
        })
    } catch (error) {
        next(error)
    }
}

const getCategorySales = async (req, res, next) => {
    const categoryId = Number(req.params.categoryId)

    try {
        const sales = await prisma.transactionDetail.groupBy({
            by: ['productId', 'productName'],
            _sum: {
                quantity: true
            },
            where: {
                transaction: { paymentStatus: 'paid' },
                product: { categoryId }
            },
            orderBy: {
                _sum: {
                    quantity: 'desc'
                }
            }
        })

        const result = sales.map(item => ({
            menuName: item.productName,
            totalSales: item._sum.quantity || 0
        }))

        return res.status(200).json({
            success: true,
            message: 'data report category',
            data: result
        })
    } catch (error) {
        next(error)
    }
}

const getTransactionReport = async (req, res, next) => {
    try {
        const transactionreport = await getTransactionReportData(req.query)
        return res.status(200).json({
            success: true,
            data: transactionreport
        })
    } catch (error) {
        next(error)
    }
}

const exportTransactionExcel = async (req, res, next) => {
    try {
        const data = await getTransactionReportData(req.query)

        const workbook = new ExcelJS.Workbook()
        const worksheet = workbook.addWorksheet('Transaction Report')

        // HEADER
        worksheet.columns = [
            { header: 'No Order', key: 'orderCode', width: 20 },
            { header: 'Order Date', key: 'orderDate', width: 25 },
            { header: 'Order Type', key: 'orderType', width: 15 },
            { header: 'Category', key: 'category', width: 15 },
            { header: 'Customer Name', key: 'customerName', width: 20 },
        ]

        // ISI DATA
        data.forEach(row => {
            worksheet.addRow({
                ...row,
                orderDate: new Date(row.orderDate).toLocaleString(),
            })
        })

        // RESPONSE HEADER
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        res.setHeader(
            'Content-Disposition',
            'attachment; filename=transaction-report.xlsx'
        )

        await workbook.xlsx.write(res)
        res.end()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    getDashboardSummary,
    getCategorySales,
    getTransactionReport,
    exportTransactionExcel
}