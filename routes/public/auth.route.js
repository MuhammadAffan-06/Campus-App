const express = require('express');
const { login, registration} = require('../../Controllers/auth-controllers');
const authRouter = express.Router();

authRouter
    .post('/login', login)
    .post('/registration', registration)


module.exports = authRouter;