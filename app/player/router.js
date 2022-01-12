const express = require('express');
const router = express.Router();
const { landingPage } = require('./controller')

router.get('/landingpage', landingPage);

module.exports = router;
