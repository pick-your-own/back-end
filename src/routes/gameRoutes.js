'use strict';

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
// const auth = require('../middleware/auth');

router.post('/game', gameController.createEnemy);
router.get('/level', gameController.createLevel);
router.get('/rewards', gameController.create);

module.exports = router;
