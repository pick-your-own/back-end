'use strict';

const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  level: Number,
  monster: Array,
  itemDrop: String,
  itemDropRate: Number,

});

const Game = mongoose.model('game', gameSchema);

module.exports = {
  Game,
};