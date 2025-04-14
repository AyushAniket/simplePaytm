const express = require('express');
const userRouter = require('./user.js');
const accountRouter = require('./account.js');

const router = express.Router();

// Example route
router.use('/user', userRouter);
router.use('/account', accountRouter);

module.exports = router;