const prisma = require('../config/prisma.config')
const sendEmailOtp = require('../config/mailer.config')
const generateOtp = require('../utils/generateOTP')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const env = require('../config/env.config')

const register = async (req, res, next) => {
    const { email, username, password } = req.body

    try {
        const existingEmail = await prisma.user.findUnique({
            where: { email }
        })

        if (existingEmail) {
            const err = new Error('Email already exists')
            err.status = 400
            throw err
        }

        const existingUsername = await prisma.user.findUnique({
            where: { username }
        })

        if (existingUsername) {
            const err = new Error('Username already exists')
            err.status = 400
            throw err
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                role: 'cashier'
            }
        })

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            user: {
                id: newUser.id.toString(),
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            }
        })
    } catch (error) {
        next(error)
    }
}

const login = async (req, res, next) => {
    const { username, password } = req.body

    try {
        const existingUser = await prisma.user.findUnique({
            where: { username }
        })

        if (!existingUser) {
            const err = new Error('Invalid username')
            err.status = 400
            throw err
        }

        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
            const err = new Error('Invalid password')
            err.status = 400
            throw err
        }

        const token = jwt.sign(
            {
                id: existingUser.id.toString(),
                username: existingUser.username,
                email: existingUser.email,
                role: existingUser.role
            },
            env.JWT_SECRET,
            {
                expiresIn: '24h'
            }
        )

        return res.status(200).json({
            message: 'login successful',
            user: {
                id: existingUser.id.toString(),
                username: existingUser.username,
                role: existingUser.role,
            },
            token,
        })
    } catch (error) {
        next(error)
    }
}

const forgotPassword = async (req, res, next) => {
    const { email } = req.body

    try {
        const otp = generateOtp()

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            const err = new Error('Invalid email')
            err.status = 400
            throw err
        }

        await prisma.user.update({
            where: { email },
            data: {
                otp,
                otpExpiry: new Date(Date.now() + 5 * 60 * 1000)
            }
        })

        await sendEmailOtp(email, otp)

        return res.status(200).json({
            success: true,
            message: 'OTP sent successfully'
        })
    } catch (error) {
        next(error)
    }
}

const updatePassword = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            const err = new Error('User not found')
            err.status = 404
            throw err
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
            }
        })

        return res.status(200).json({
            success: true,
            message: 'Password updated'
        })
    } catch (error) {
        next(error)
    }
}

const resetPassword = async (req, res, next) => {
    const { email, password } = req.body

    try {
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!existingUser) {
            const err = new Error('User not found')
            err.status = 404
            throw err
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { email },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiry: null
            }
        })

        return res.status(200).json({
            success: true,
            message: 'Password updated'
        })
    } catch (error) {
        next(error)
    }
}

const getMe = async (req, res, next) => {
    const userId = req.user.id

    try {
        const user = await prisma.user.findUnique({
            where: { id: Number(userId) },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
            }
        })

        if (!user) {
            const err = new Error('User not found')
            err.status = 404
            throw err
        }

        return res.status(200).json({
            message: 'User found successfully',
            user: {
                id: user.id.toString(),
                username: user.username,
                email: user.email,
                role: user.role
            },
        })
    } catch (error) {
        next(error)
    }
}

const logout = async (req, res) => {
    return res.status(200).json({
        message: 'Logout successful'
    })
}

module.exports = {
    register,
    login,
    updatePassword,
    forgotPassword,
    resetPassword,
    getMe,
    logout
}