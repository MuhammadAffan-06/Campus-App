const express = require('express')
const adminRouter = require('./admin.route')
const companyRouter = require('./company.route')
const studentRouter = require('./student.route')
const { verifyToken } = require('../../middlewares/middleware')
const privateRouter = express.Router()

privateRouter
    .use('/admin', adminRouter)
    .use(verifyToken)
    .use('/company', companyRouter)
    .use('/student', studentRouter)

module.exports = privateRouter;