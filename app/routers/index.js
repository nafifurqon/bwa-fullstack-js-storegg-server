const express = require('express');
const router = express.Router();

const categoryRouter = require('./category_router')

/* GET home page. */
router.get('/', categoryRouter);

module.exports = router;
