'use strict';

const mongoose = require('mongoose');

const characterSchema = new mongoose.Schema({
  strength: Number,
  appearance: String,
  dialogue: String,
});

const Character = mongoose.model('character', characterSchema);

module.exports = {
  Character,
};
