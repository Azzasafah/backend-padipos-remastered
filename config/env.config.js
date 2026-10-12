const dotenv = require("dotenv")

dotenv.config()

const env = {
    //F MySQL DATABASE
    DATABASE_URL: process.env.DATABASE_URL,
    //  JWT Key
    JWT_SECRET: process.env.JWT_SECRET,
    // PORT
    PORT: Number(process.env.PORT) || 5000,
    //EMAIL CONFIGURATION
    EMAIL_HOST: process.env.EMAIL_HOST,
    EMAIL_PORT: process.env.EMAIL_PORT,
    EMAIL_USER: process.env.EMAIL_USER,
    EMAIL_PASS: process.env.EMAIL_PASS,
    // MIDTRANS
    MIDTRANS_SERVER_KEY: process.env.MIDTRANS_SERVER_KEY,
    MIDTRANS_IS_PRODUCTION: false,
    // MINIO
    MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY,
    MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY,
    MINIO_PUBLIC_URL: process.env.MINIO_PUBLIC_URL,
    MINIO_BUCKET: process.env.MINIO_BUCKET
}

module.exports = env

