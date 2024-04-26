const express = require('express');
const { postJob } = require('../../Controllers/companyControllers');
const { verifyToken } = require('../../middlewares/middleware');
const companyRouter = express.Router();

companyRouter.
    use(verifyToken)
    .post('/company/job-post', verifyToken, postJob);
module.exports = companyRouter;

