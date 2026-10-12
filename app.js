const env = require('./config/env.config')
const express = require('express')
const compression = require('compression')
const cors = require('cors')
const { globalLimiter } = require('./utils/rateLimiter')
const routes = require('./routes/index')
const { errorRoute, globalError } = require('./middlewares/errorHandler.middleware')
const { swaggerUi, swaggerDocument } = require('./config/swagger.config')

const app = express()
const PORT = env.PORT

// Middlewares
app.use(cors())
app.use(express.json())
app.use(compression())
app.use(globalLimiter)
app.use(express.urlencoded({ extended: false }))

const path = require('path')

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Swagger UI documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'POS API Documentation'
}))
app.get('/docs', (req, res) => res.redirect('/api-docs'))

// Routes
app.use('/api', routes)

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is running'
    })
})

// Error handling middleware
app.use(globalError)

// 404 handler
app.use(errorRoute)

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
    console.log(`Swagger documentation available at http://localhost:${PORT}/api-docs`)
})