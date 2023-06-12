'use strict';

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  password: String,
  id: Number,
  
  
});

const User = mongoose.model('user', userSchema);

module.exports = {
  User,
};
