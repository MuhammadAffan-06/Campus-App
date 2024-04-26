const express = require('express')
const authRouter = require('./auth.route')
const { verifyToken } = require('../../middlewares/middleware')
const publicRouter = express.Router()

publicRouter
    .use('/auth', authRouter)

module.exports = publicRouter;