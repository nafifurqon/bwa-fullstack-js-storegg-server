const express = require('express');
const router = express.Router();
const {
  viewSignIn,
  actionSignIn
} = require('./controller');

/* GET home page. */
router.get('/', viewSignIn);
router.post('/', actionSignIn);

module.exports = router;
