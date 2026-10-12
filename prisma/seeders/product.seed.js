const prisma = require('../../config/prisma.config')

async function main() {
    console.log('Seeding categories & dummy products...')

    // 1. Categories
    const catMakanan = await prisma.category.upsert({
        where: { id: 1 },
        update: { name: 'Makanan', icon: 'Utensils' },
        create: { id: 1, name: 'Makanan', icon: 'Utensils' }
    })

    const catMinuman = await prisma.category.upsert({
        where: { id: 2 },
        update: { name: 'Minuman', icon: 'Coffee' },
        create: { id: 2, name: 'Minuman', icon: 'Coffee' }
    })

    const catSnack = await prisma.category.upsert({
        where: { id: 3 },
        update: { name: 'Camilan & Snack', icon: 'Cookie' },
        create: { id: 3, name: 'Camilan & Snack', icon: 'Cookie' }
    })

    // 2. Dummy Products with generated images
    const dummyProducts = [
        {
            name: 'Nasi Goreng Spesial',
            price: 25000,
            categoryId: catMakanan.id,
            stock: 45,
            description: 'Nasi goreng rempah istimewa dengan telur mata sapi dan lalapan segar',
            image: '/products/nasi_goreng.jpg'
        },
        {
            name: 'Burger Sapi Keju (Beef Burger)',
            price: 28000,
            categoryId: catMakanan.id,
            stock: 25,
            description: 'Burger daging sapi panggang dengan keju cheddar leleh dan saus spesial',
            image: '/products/beef_burger.jpg'
        },
        {
            name: 'Kopi Susu Gula Aren',
            price: 18000,
            categoryId: catMinuman.id,
            stock: 60,
            description: 'Espresso house blend dipadu susu segar dan sirup gula aren premium',
            image: '/products/kopi_susu_aren.jpg'
        },
        {
            name: 'Kentang Goreng Crispy',
            price: 15000,
            categoryId: catSnack.id,
            stock: 30,
            description: 'French fries renyah bertabur garam gurih dan saus cocolan',
            image: '/products/beef_burger.jpg'
        },
        {
            name: 'Es Teh Manis Segar',
            price: 8000,
            categoryId: catMinuman.id,
            stock: 80,
            description: 'Teh seduh melati dingin dengan es batu segar',
            image: '/products/kopi_susu_aren.jpg'
        }
    ]

    for (const item of dummyProducts) {
        const existing = await prisma.product.findFirst({
            where: { name: item.name }
        })

        if (existing) {
            await prisma.product.update({
                where: { id: existing.id },
                data: item
            })
        } else {
            await prisma.product.create({
                data: item
            })
        }
    }

    console.log('✓ Successfully seeded categories and products with images!')
}

main()
    .catch((e) => {
        console.error('Error seeding products:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
