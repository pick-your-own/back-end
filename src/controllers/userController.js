'use strict';

const express = require('express');
const router = express.Router();
const userModel = require('../models/User');

router.get('/users', async (req, res, next) => {
  try {
    let users = await userModel.findAll();

    res.status(200).send(users);
  } catch (error) {
    next(error);
  }
});

router.post('/user', async (req, res, next) => {
  try {
    let newUser = await userModel.create(req.body);

    res.status(200).send(newUser);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    res.status(200).send(req.user);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
