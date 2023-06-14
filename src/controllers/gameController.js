'use strict';

const {
  commonEnemySchema,
  mediumEnemySchema,
  bossEnemySchema,
} = require('../models/Enemies');
const {
  easyLevelSchema,
  mediumLevelSchema,
  hardLevelSchema,
} = require('../models/Levels');
const {
  easyRewardSchema,
  mediumRewardSchema,
  hardRewardSchema,
} = require('../models/Rewards');
const mongoose = require('mongoose');

exports.createEnemy = async (req, res) => {
  try {
    const { type, health, damage, effect } = req.body;
    let enemy;

    switch (type) {
    case 'common':
      enemy = new mongoose.model('CommonEnemy', commonEnemySchema);
      break;
    case 'medium':
      enemy = new mongoose.model('MediumEnemy', mediumEnemySchema);
      break;
    case 'boss':
      enemy = new mongoose.model('BossEnemy', bossEnemySchema);
      break;
    default:
      throw new Error('Invalid enemy type');
    }

    enemy.health = health;
    enemy.damage = damage;
    enemy.effect = effect;

    await enemy.save();

    res.status(201).json(enemy);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.createLevel = async (req, res) => {
  try {
    const { type, name, generalDesc, climate } = req.body;
    let level;

    switch (type) {
    case 'easy':
      level = new mongoose.model('EasyLevel', easyLevelSchema);
      break;
    case 'medium':
      level = new mongoose.model('MediumLevel', mediumLevelSchema);
      break;
    case 'hard':
      level = new mongoose.model('HardLevel', hardLevelSchema);
      break;
    default:
      throw new Error('Invalid level type');
    }

    level.name = name;
    level.generalDesc = generalDesc;
    level.climate = climate;

    await level.save();

    res.status(201).json(level);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.createReward = async (req, res) => {
  try {
    const { type, name, quantity } = req.body;
    let reward;

    switch (type) {
    case 'easy':
      reward = new mongoose.model('EasyLevel', easyRewardSchema);
      break;
    case 'medium':
      reward = new mongoose.model('MediumLevel', mediumRewardSchema);
      break;
    case 'hard':
      reward = new mongoose.model('HardLevel', hardRewardSchema);
      break;
    default:
      throw new Error('Invalid reqrd type');
    }

    reward.name = name;
    reward.quantity = quantity;

    await reward.save();

    res.status(201).json(reward);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
