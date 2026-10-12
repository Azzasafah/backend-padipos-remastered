const { ZodError } = require('zod')

// middleware validasi basic zod
// schema : schema zod
// source : ambil data dari ? body | query | params

const validate = (schema, source = 'body') => {
    return async (req, res, next) => {
        try {
            // ambil data source
            const data = req[source]
            // validasi data
            const result = schema.parse(data)
            // replace data request dengan hasil validasi
            req[source] = result

            return next()
        } catch (error) {
            if (error instanceof ZodError) {
                return res.status(400).json({
                    message: 'Validation failed',
                    errors: error.issues.map(err => err.message)
                })
            }
            return res.status(500).json({
                message: 'Internal server error',
                error: error.message
            })
        }
    }
}

const validateBody = (schema) => validate(schema, 'body')
const validateQuery = (schema) => validate(schema, 'query')
const validateParams = (schema) => validate(schema, 'params')

module.exports = {
    validate,
    validateBody,
    validateQuery,
    validateParams
}