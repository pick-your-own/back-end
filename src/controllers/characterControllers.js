const Character = require('../models/Character');

exports.createPlayer = async (req, res) => {
  try {
    const character = new Character(req.body);
    await character.save();
    res.status(201).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getPlayer = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.updatePlayer = async (req, res) => {
  try {
    const character = await Character.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.deletePlayer = async (req, res) => {
  try {
    await Character.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Character deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.addAbility = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    character.abilities.push(req.body);
    await character.save();
    res.status(201).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.updateAbility = async (req, res) => {
  try {
    const character = await Character.findById(req.params.playerId);
    const ability = character.abilities.id(req.params.abilityId);
    Object.assign(ability, req.body);
    await character.save();
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.addItem = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    character.inventory.push(req.body);
    await character.save();
    res.status(201).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.updateItem = async (req, res) => {
  try {
    const character = await Character.findById(req.params.playerId);
    const item = character.inventory.id(req.params.itemId);
    Object.assign(item, req.body);
    await character.save();
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.updateFinances = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    character.finances = req.body;
    await character.save();
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};
