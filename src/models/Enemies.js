
const mongoose = require('mongoose');

const { Schema } = mongoose;

const EnemySchema = new Schema({
  type: String,
  health: Number,
  damage: Number,
});

const commonEnemySchema = mongoose.model('CommonEnemy', EnemySchema);
const mediumEnemySchema = mongoose.model('MediumEnemy', EnemySchema);
const bossEnemySchema = mongoose.model('BossEnemy', EnemySchema);

module.exports = { commonEnemySchema, mediumEnemySchema, bossEnemySchema };
