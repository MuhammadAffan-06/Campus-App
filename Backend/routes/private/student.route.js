const express = require('express');
const { applyForJob } = require('../../Controllers/studentControllers');
const { verifyToken } = require('../../middlewares/middleware');

const studentRouter = express.Router();

studentRouter
    .use(verifyToken)
    .post('/students/apply', verifyToken, applyForJob);

module.exports = studentRouter; 
