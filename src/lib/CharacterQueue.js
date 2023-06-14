'use strict';

const { v4: uuidv4 } = require('uuid');

class CharacterQueue {
  constructor() {
    this.characters = [];
  }

  addCharacter(character) {
    character.id = uuidv4();
    this.characters.push(character);
    return character;
  }

  removeCharacter(characterId) {
    const characterIndex = this.characters.findIndex(character => character.id === characterId);
    if (characterIndex !== -1) {
      return this.characters.splice(characterIndex, 1)[0];
    }
    return null;
  }

  getCharacter(characterId) {
    return this.characters.find(character => character.id === characterId);
  }

  updateUser(characterId, changes) {
    const character = this.getCharacter(characterId);
    if (character) {
      Object.assign(character, changes);
      return character;
    }
    return null;
  }
}

module.exports = {CharacterQueue};
