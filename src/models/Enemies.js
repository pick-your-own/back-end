const mongoose = require('mongoose');

const { Schema } = mongoose;

console.log('enemy schema accessed');

const commonEnemySchema = new Schema({
  health: Number,
  damage: Number,
  effect: String,
});

const mediumEnemySchema = new Schema({
  health: Number,
  damage: Number,
  effect: String,
});

const bossEnemySchema = new Schema({
  health: Number,
  damage: Number,
  effect: String,
});

const Enemy = new Schema({
  grunts: [commonEnemySchema],
  midLev: [mediumEnemySchema],
  boss: [bossEnemySchema],
});

module.exports = mongoose.model('EnemySchema', Enemy);

