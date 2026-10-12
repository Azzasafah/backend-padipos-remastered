const prisma = require('../config/prisma.config')

const verifyOtp = async (req, res, next) => {
    try {
        const { email, otp } = req.body

        const user = await prisma.user.findUnique({
            where: { email }
        })

        if (!user || user.otp !== otp) {
            return res.status(400).json({
                error: 'Wrong otp!',
            })
        }

        if (user.otpExpiry < new Date()) {
            return res.status(400).json({
                error: 'Otp expired!'
            })
        }

        next()
    } catch (error) {
        next(error)
    }
}

module.exports = verifyOtp