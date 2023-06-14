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

const statusEffectSchema = new Schema({
  name: String,
  description: String,
  duration: Number,
});

const questSchema = new Schema({
  name: String,
  description: String,
  progress: String,
  completed: Boolean,
});

const companionSchema = new Schema({
  name: String,
  health: Number,
  abilities: [abilitySchema],
});

const craftingSkillSchema = new Schema({
  name: String,
  level: Number,
});

const characterSchema = new Schema({
=======

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
  armor: Number,
  attackSpeed: Number,
  magicPoints: Number,
  resistances: {
    fire: Number,
    ice: Number,
    poison: Number,
  },
  statusEffects: [statusEffectSchema],
  skillPoints: Number,
  quests: [questSchema],
  reputation: {
    faction1: Number,
    faction2: Number,
    // add as many factions as your game has
  },
  companions: [companionSchema],
  achievements: [String], // or you could define a more complex achievement schema
  craftingSkills: [craftingSkillSchema],
  storage: [inventoryItemSchema],
});

module.exports = mongoose.model('Character', characterSchema);
