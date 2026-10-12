const prisma = require('../../config/prisma.config')

async function main() {
    console.log('Seeding dummy transactions & sales data...')

    // Check existing products
    const products = await prisma.product.findMany()
    if (products.length === 0) {
        console.error('No products found to seed transactions!')
        return
    }

    const pNasi = products.find(p => p.name.includes('Nasi')) || products[0]
    const pBurger = products.find(p => p.name.includes('Burger')) || products[1]
    const pKopi = products.find(p => p.name.includes('Kopi')) || products[2]
    const pKentang = products.find(p => p.name.includes('Kentang')) || products[3]
    const pTeh = products.find(p => p.name.includes('Teh')) || products[4]

    const now = new Date()

    // 15 realistic transaction templates
    const dummyOrders = [
        {
            customerName: 'Budi Santoso',
            tableNumber: 3,
            orderType: 'dine_in',
            paymentMethod: 'cash',
            items: [
                { product: pNasi, qty: 2 },
                { product: pTeh, qty: 2 }
            ],
            daysAgo: 0,
            hoursAgo: 1,
            paid: 70000
        },
        {
            customerName: 'Siti Aisyah',
            tableNumber: null,
            orderType: 'take_away',
            paymentMethod: 'midtrans',
            items: [
                { product: pBurger, qty: 2 },
                { product: pKentang, qty: 1 },
                { product: pKopi, qty: 2 }
            ],
            daysAgo: 0,
            hoursAgo: 2,
            paid: null
        },
        {
            customerName: 'Dimas Pratama',
            tableNumber: 5,
            orderType: 'dine_in',
            paymentMethod: 'cash',
            items: [
                { product: pKopi, qty: 3 },
                { product: pKentang, qty: 2 }
            ],
            daysAgo: 0,
            hoursAgo: 3,
            paid: 100000
        },
        {
            customerName: 'Rina Marlina',
            tableNumber: 1,
            orderType: 'dine_in',
            paymentMethod: 'cash',
            items: [
                { product: pNasi, qty: 1 },
                { product: pKopi, qty: 1 }
            ],
            daysAgo: 0,
            hoursAgo: 4,
            paid: 50000
        },
        {
            customerName: 'Andi Wijaya',
            tableNumber: null,
            orderType: 'take_away',
            paymentMethod: 'midtrans',
            items: [
                { product: pBurger, qty: 1 },
                { product: pTeh, qty: 1 }
            ],
            daysAgo: 0,
            hoursAgo: 5,
            paid: null
        },
        {
            customerName: 'Meja 04 (Keluarga)',
            tableNumber: 4,
            orderType: 'dine_in',
            paymentMethod: 'cash',
            items: [
                { product: pNasi, qty: 3 },
                { product: pBurger, qty: 2 },
                { product: pKentang, qty: 2 },
                { product: pTeh, qty: 4 },
                { product: pKopi, qty: 1 }
            ],
            daysAgo: 1,
            hoursAgo: 12,
            paid: 250000
        },
        {
            customerName: 'Gita Permata',
            tableNumber: null,
            orderType: 'take_away',
            paymentMethod: 'midtrans',
            items: [
                { product: pKopi, qty: 4 },
                { product: pKentang, qty: 1 }
            ],
            daysAgo: 1,
            hoursAgo: 14,
            paid: null
        },
        {
            customerName: 'Hendra Setiawan',
            tableNumber: 2,
            orderType: 'dine_in',
            paymentMethod: 'cash',
            items: [
                { product: pNasi, qty: 2 },
                { product: pBurger, qty: 1 }
            ],
            daysAgo: 1,
            hoursAgo: 16,
            paid: 80000
        },
        {
            customerName: 'Lina Susanti',
            tableNumber: null,
            orderType: 'take_away',
            paymentMethod: 'cash',
            items: [
                { product: pKentang, qty: 3 },
                { product: pTeh, qty: 3 }
            ],
            daysAgo: 2,
            hoursAgo: 20,
            paid: 70000
        },
        {
            customerName: 'Fajar Nugraha',
            tableNumber: 6,
            orderType: 'dine_in',
            paymentMethod: 'midtrans',
            items: [
                { product: pBurger, qty: 3 },
                { product: pKopi, qty: 3 }
            ],
            daysAgo: 2,
            hoursAgo: 24,
            paid: null
        },
        {
            customerName: 'Dewi Lestari',
            tableNumber: null,
            orderType: 'take_away',
            paymentMethod: 'cash',
            items: [
                { product: pNasi, qty: 1 },
                { product: pTeh, qty: 1 }
            ],
            daysAgo: 2,
            hoursAgo: 26,
            paid: 40000
        },
        {
            customerName: 'Rizky Ramadhan',
            tableNumber: 7,
            orderType: 'dine_in',
            paymentMethod: 'cash',
            items: [
                { product: pNasi, qty: 2 },
                { product: pKentang, qty: 1 },
                { product: pKopi, qty: 2 }
            ],
            daysAgo: 3,
            hoursAgo: 30,
            paid: 110000
        },
        {
            customerName: 'Toko Sebelah (Karyawan)',
            tableNumber: null,
            orderType: 'take_away',
            paymentMethod: 'cash',
            items: [
                { product: pKopi, qty: 5 }
            ],
            daysAgo: 3,
            hoursAgo: 32,
            paid: 100000
        },
        {
            customerName: 'Walk-in Pelanggan',
            tableNumber: 8,
            orderType: 'dine_in',
            paymentMethod: 'midtrans',
            status: 'pending',
            items: [
                { product: pBurger, qty: 1 },
                { product: pKentang, qty: 1 }
            ],
            daysAgo: 0,
            hoursAgo: 0,
            paid: null
        }
    ]

    for (const order of dummyOrders) {
        let totalAmount = 0
        const detailsData = []

        for (const it of order.items) {
            const price = Number(it.product.price)
            const subtotal = price * it.qty
            totalAmount += subtotal
            detailsData.push({
                productId: it.product.id,
                productName: it.product.name,
                quantity: it.qty,
                price: price,
                subtotal: subtotal
            })
        }

        const isPending = order.status === 'pending'
        const createdAt = new Date(now.getTime() - (order.daysAgo * 86400000) - (order.hoursAgo * 3600000))
        const paidAt = isPending ? null : createdAt

        const paidAmount = isPending ? null : (order.paid ? order.paid : totalAmount)
        const changeAmount = isPending ? null : (order.paid ? order.paid - totalAmount : 0)

        await prisma.transaction.create({
            data: {
                userId: 2, // cashier2
                customerName: order.customerName,
                tableNumber: order.tableNumber,
                orderType: order.orderType,
                paymentMethod: order.paymentMethod,
                totalAmount: totalAmount,
                paymentStatus: isPending ? 'pending' : 'paid',
                paidAmount: paidAmount,
                changeAmount: changeAmount,
                paidAt: paidAt,
                createdAt: createdAt,
                transactionDetails: {
                    create: detailsData
                }
            }
        })
    }

    console.log('✓ Successfully seeded dummy transactions and sales data!')
}

main()
    .catch((e) => {
        console.error('Error seeding transactions:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
