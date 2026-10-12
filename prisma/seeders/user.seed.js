const prisma = require('../../config/prisma.config')
const bcrypt = require('bcryptjs')

async function main() {
    const adminPassword = await bcrypt.hash('password', 10)
    const cashierPassword = await bcrypt.hash('Wa1234567@', 10)

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: adminPassword,
            role: 'admin',
            email: 'admin@mail.com'
        },
        create: {
            username: 'admin',
            email: 'admin@mail.com',
            password: adminPassword,
            role: 'admin'
        }
    })

    const cashier = await prisma.user.upsert({
        where: { username: 'cashier2' },
        update: {
            password: cashierPassword,
            role: 'cashier',
            email: 'cashier2@mail.com'
        },
        create: {
            username: 'cashier2',
            email: 'cashier2@mail.com',
            password: cashierPassword,
            role: 'cashier'
        }
    })

    console.log('✓ Seeding complete:')
    console.log(`  Admin:   username=${admin.username}, email=${admin.email}, role=${admin.role}`)
    console.log(`  Cashier: username=${cashier.username}, email=${cashier.email}, role=${cashier.role}`)
}

main()
    .catch((e) => {
        console.error('Error during seeding:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })