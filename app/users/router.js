const express = require('express');
const router = express.Router();
const { viewSignIn, actionSignIn, actionLogout } = require('./controller');

/* GET home page. */
router.get('/', viewSignIn);
router.post('/', actionSignIn);
router.get('/logout', actionLogout);

module.exports = router;
