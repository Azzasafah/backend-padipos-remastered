const multer = require('multer')
const path = require('path')
const crypto = require('crypto')
const fs = require('fs')

const uploadDir = path.join(process.cwd(), 'uploads')
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, uploadDir)
    },
    filename: function (req, file, callback) {
        // hash unik untuk file
        const fileHash = crypto.randomBytes(16).toString('hex')
        // ambil ekstensi file dari original file
        const ext = path.extname(file.originalname).toLowerCase()
        // susun nama file baru = hash + extension
        callback(null, `${fileHash}${ext}`)
    }
})

const allowedExtension = ['.jpg', '.jpeg', '.png', '.gif', '.webp']

const fileFilter = (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedExtension.includes(ext)) {
        callback(null, true)
    } else {
        callback(new Error('Extension image are not valid!'))
    }
}

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }
})

module.exports = upload