const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  defaultCharacter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character', // Reference to the Character model
    required: false,  // Set to false because a user might not have a default character initially
  },
  defaultCharacterName: {
    type: String,
  },
  characters: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Character', // Reference to the Character model
  }],
});

const User = mongoose.model('User', userSchema);

module.exports = User;
