const mongoose = require('mongoose');
const { Schema } = mongoose;

const abilitySchema = new Schema({
  name: String,
  description: String,
  power: Number,
});

const inventoryItemSchema = new Schema({
  name: String,
  description: String,
  quantity: Number,
});

const playerSchema = new Schema({
  name: String,
  health: Number,
  experience: Number,
  level: Number,
  abilities: [abilitySchema],
  finances: {
    gold: Number,
    silver: Number,
    copper: Number,
  },
  inventory: [inventoryItemSchema],
});

module.exports = mongoose.model('Player', playerSchema);
