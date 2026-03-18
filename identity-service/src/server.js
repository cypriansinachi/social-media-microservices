require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const helmet = require('helmet')
const { RateLimiterRedis } = require('rate-limiter-flexible')
const Redis = require('ioredis')
const logger = require('./utils/logger')
const errorHandler = require('./middleware/errorHandler')
const identityRoutes = require('./routes/identity-service')

const app = express()

const redisClient = new Redis(process.env.REDIS_URL)

app.use(express.json())

app.use(helmet())

app.use(cors())

app.use((req, res, next) => {
    logger.info(`Received ${req.method} request to ${req.url}`)
    logger.info(`Request Body, ${req.body}`)
    next()
})

// DDos protection and rate limiting
const rateLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'middleware',
    points: 10,
    duration: 1
})

app.use(async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip)
        next()
    } catch (error) {
        logger.error(error)
        res.status(429).send('Too many requests')
    }
})

app.use('/api/identity', identityRoutes)

app.use(errorHandler)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    logger.info(`Identity service running on port ${PORT}`)
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => logger.info('MongoDB connected'))
        .catch(err => logger.error(err))
})