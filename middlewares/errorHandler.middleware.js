const errorRoute = (req, res, next) => {
    return res.status(404).json({
        message: `Route ${req.url} not found`
    })
}

const globalError = (err, req, res, next) => {
    console.error(err.stack || err.message)

    if (err.name === 'MulterError') {
        return res.status(400).json({
            error: 'File upload error',
            message: err.message
        })
    }

    if (err.code === 'P2002') {
        const target = err.meta?.target ? ` (${err.meta.target})` : ''
        return res.status(409).json({
            error: 'Conflict',
            message: `Unique constraint failed${target}`
        })
    }

    if (err.code === 'P2025') {
        return res.status(404).json({
            error: 'Not Found',
            message: err.meta?.cause || 'Record not found'
        })
    }

    if (err.code === 'P2003') {
        return res.status(400).json({
            error: 'Foreign key constraint',
            message: 'Cannot perform operation due to related records'
        })
    }

    const status = err.status || 500
    res.status(status).json({
        error: status >= 500 ? 'Something went wrong!' : (err.name || 'Error'),
        message: err.message
    })
}

module.exports = {
    errorRoute,
    globalError
}