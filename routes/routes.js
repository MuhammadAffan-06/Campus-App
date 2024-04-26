
const express = require('express');
const router = express.Router();
const publicRouter = require('./public/index');
const privateRouter = require('./private/index');

router
    .use(publicRouter, privateRouter)

module.exports = router;
