const express = require('express');
const router = express.Router();
const { index, viewCreate, actionCreate } = require('./controller')

/* GET home page. */
router.get('/', index);
router.get('/create', viewCreate);
router.post('/create', actionCreate);

module.exports = router;
