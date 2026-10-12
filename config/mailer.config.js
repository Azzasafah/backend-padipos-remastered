const nodemailer = require('nodemailer')
const env = require('./env.config')

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASS,
    }
})

const sendEmailOtp = async (email, otp) => {
    await transporter.sendMail({
        from: env.EMAIL_USER,
        to: email,
        subject: 'OTP Reset Password',
        text: `Kode OTP kamu : ${otp}`
    })
}

module.exports = sendEmailOtp
