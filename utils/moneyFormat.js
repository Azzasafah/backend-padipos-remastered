const moneyFormat = (number) => {
    return Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR'
    }).format(number)
}

module.exports = { moneyFormat }