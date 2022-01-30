const express = require('express');
const multer = require('multer');
const os = require('os');
const router = express.Router();
const { signup } = require('./controller');

router.post('/signup', multer({ dest: os.tmpdir() }).single('image'), signup);

module.exports = router;
