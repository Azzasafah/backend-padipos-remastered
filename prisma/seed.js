const { execSync } = require('child_process')
const path = require('path')

console.log('--- Starting Complete POS Database Seeding ---')

try {
    console.log('\n[1/3] Seeding Demo Users (Admin & Cashier)...')
    require('./seeders/user.seed.js')
} catch (e) {
    console.error('Error in user seed:', e)
}

setTimeout(() => {
    try {
        console.log('\n[2/3] Seeding Categories & Products with Images...')
        require('./seeders/product.seed.js')
    } catch (e) {
        console.error('Error in product seed:', e)
    }
}, 500)

setTimeout(() => {
    try {
        console.log('\n[3/3] Seeding Historical Transactions & Sales Data...')
        require('./seeders/transaction.seed.js')
    } catch (e) {
        console.error('Error in transaction seed:', e)
    }
}, 1000)
