const express = require('express');
const router = express.Router();
const {
  viewSignIn,
} = require('./controller');

/* GET home page. */
router.get('/', viewSignIn);
// router.get('/create', viewCreate);
// router.post('/create', actionCreate);
// router.get('/edit/:id', viewEdit);
// router.put('/edit/:id', actionEdit);
// router.delete('/delete/:id', actionDelete);
// router.put('/status/:id', actionStatus);

module.exports = router;
