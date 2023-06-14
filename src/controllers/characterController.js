const Character = require('../models/Character');

// Helper function to update character properties
async function updateCharacterProperty(
  characterId,
  property,
  newValue,
  isSingleValue,
) {
  try {
    const character = await Character.findById(characterId);

    if (isSingleValue) {
      character[property] = newValue;
    } else {
      // Array case
      character[property].push(newValue);
    }

    await character.save();
    return character;
  } catch (error) {
    console.error(error);
    throw new Error('Server Error');
  }
}

exports.createCharacter = async (req, res) => {
  try {
    // Create character with default stats
    const character = new Character({
      ...req.body,
      health: 100,
      attackPoints: 10,
      experienceLevel: 1,
    });
    await character.save();
    res.status(201).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.getCharacter = async (req, res) => {
  try {
    const character = await Character.findById(req.params.id);
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.updateCharacter = async (req, res) => {
  try {
    const character = await Character.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

exports.deleteCharacter = async (req, res) => {
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


// Methods for Armor
exports.updateArmor = async (req, res) => {
  try {
    const character = await updateCharacterProperty(req.params.id, 'armor', req.body.armor, true);
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Methods for Attack Speed
exports.updateAttackSpeed = async (req, res) => {
  try {
    const character = await updateCharacterProperty(req.params.id, 'attackSpeed', req.body.attackSpeed, true);
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Methods for Magic Points
exports.updateMagicPoints = async (req, res) => {
  try {
    const character = await updateCharacterProperty(req.params.id, 'magicPoints', req.body.magicPoints, true);
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Methods for Resistances
exports.updateResistances = async (req, res) => {
  try {
    const character = await updateCharacterProperty(req.params.id, 'resistances', req.body.resistances, true);
    res.status(200).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Methods for Status Effects
exports.addStatusEffect = async (req, res) => {
  try {
    const character = await updateCharacterProperty(req.params.id, 'statusEffects', req.body, false);
    res.status(201).json(character);
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
};

// Methods for Skill Points
exports.updateSkillPoints = async (req, res) => {
  try {
    const character = await updateCharacterProperty(req.params.id, 'skillPoints', req.body.skillPoints, true);
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
