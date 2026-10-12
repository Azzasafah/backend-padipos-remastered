const env = require('./env.config')
const midtrans = require('midtrans-client')

const snap = new midtrans.Snap({
    isProduction: env.MIDTRANS_IS_PRODUCTION,
    serverKey: env.MIDTRANS_SERVER_KEY
})

module.exports = snap