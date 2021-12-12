const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category_controller')

/* GET home page. */
router.get('/', categoryController.index);

module.exports = router;
