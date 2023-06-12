'use strict';

const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  strength: Number,
  description: String,
  rarity: String,
  value: Number,
  abilities: String,

});

const Item = mongoose.model('items', itemSchema);

module.exports = {
  Item,
};