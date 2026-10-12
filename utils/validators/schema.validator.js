const { z } = require('zod')
const validator = require('validator')

// auth schema
const loginSchema = z.object({
    username: z.string().min(3)
        .refine(val => validator.matches(val, ['^[a-zA-Z0-9_.\\-]*$']), {
            message: 'Usernames can only be letters (a), numbers (1), periods (.), underscores and hyphens (-)'
        }),
    password: z.string().min(6)
})

const registerSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6).refine(val => validator.isStrongPassword(val, {
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }), {
        message: 'Password is not enough strong!. need min 6 word, min number 1, min symbol 1, min uppercase 1'
    }),
    confirmPassword: z.string(),
    email: z.string().email(),
}).refine((data) => data.password === data.confirmPassword, {
    message: 'Password must match',
    path: ['confirmPassword']
})

const forgotPasswordSchema = z.object({
    email: z.string().refine(validator.isEmail)
})

const updatePasswordSchema = z.object({
    email: z.string().refine(validator.isEmail),
    password: z.string().min(6).refine(val => validator.isStrongPassword(val, {
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }), {
        message: 'Password is not enough strong!. need min 6 word, min number 1, min symbol 1, min uppercase 1'
    }),

})

const resetPasswordSchema = z.object({
    otp: z.string(),
    email: z.string().refine(validator.isEmail),
    password: z.string().min(6).refine(val => validator.isStrongPassword(val, {
        minLength: 6,
        minUppercase: 1,
        minNumbers: 1,
        minSymbols: 0,
    }), {
        message: 'Password is not enough strong!. need min 6 word, min number 1, min symbol 1, min uppercase 1'
    }),
})

// category schema
const createCategorySchema = z.object({
    name: z.string().min(1, 'name is required'),
    icon: z.string().min(3).optional()
})

const updateCategorySchema = z.object({
    name: z.string().min(1).optional(),
    icon: z.string().min(3).optional()
})

// product schema
const createProductSchema = z.object({
    name: z.string().min(4, 'name minimum 4 character'),
    price: z.coerce.number().positive('price must be greater than 0'),
    categoryId: z.coerce.number().int('categoryId must be number'),
    description: z.string().optional(),
    stock: z.coerce.number().int().nonnegative('stock cant be negative'),
})

const updateProductSchema = z.object({
    name: z.string().min(4, 'name minimum 4 character').optional(),
    price: z.coerce.number().positive('price must be greater than 0').optional(),
    categoryId: z.coerce.number().int('categoryId must be number').optional(),
    description: z.string().optional(),
    stock: z.coerce.number().int().nonnegative('stock cant be negative').optional(),
})

// transaction schema

const transactionItemSchema = z.object({
    productId: z.number().int().positive(),
    qty: z.number().int().positive()
})
const createTransactionSchema = z.object({
    paid: z.number().int().positive().optional(),
    customerName: z.string().optional(),
    tableNumber: z.number().int().optional(),
    orderType: z.enum(['dine_in', 'take_away']),
    paymentMethod: z.enum(['cash', 'midtrans']),
    note: z.string().optional(),
    items: z.array(transactionItemSchema).min(1)
})

// query schema
const paginationSchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(10),
    offset: z.coerce.number().min(0).default(0)
})

// params schema
const idParamSchema = z.object({
    id: z.coerce.number()
})

module.exports = {
    loginSchema,
    registerSchema,
    updatePasswordSchema,
    forgotPasswordSchema,
    resetPasswordSchema,


    createCategorySchema,
    updateCategorySchema,

    createProductSchema,
    updateProductSchema,

    createTransactionSchema,

    paginationSchema,
    idParamSchema
}