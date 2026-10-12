const env = require('../config/env.config')

const MINIO_PUBLIC_URL = env.MINIO_PUBLIC_URL
const MINIO_BUCKET = env.MINIO_BUCKET

const buildMinioUrl = (objectName, bucket = MINIO_BUCKET) => {
    if (!objectName) {
        return null
    }

    if (objectName.startsWith('http://') || objectName.startsWith('https://') || objectName.startsWith('/')) {
        return objectName
    }

    if (MINIO_PUBLIC_URL && !MINIO_PUBLIC_URL.includes('localhost:9000')) {
        return `${MINIO_PUBLIC_URL}/${bucket}/${objectName}`
    }

    return `http://localhost:5000/uploads/${objectName}`
}

module.exports = buildMinioUrl