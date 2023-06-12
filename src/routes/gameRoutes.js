'use strict';

const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const auth = require('../middleware/auth');

router.post('/game', gameController.createEnemy);
router.get('/level', auth, gameController.createLevel);
router.get('/', auth, gameController.create);

module.exports = router;
