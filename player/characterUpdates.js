function parseResponseForStats(response, character) {
  // Breaking down the text into sentences or phrases
  const phrases = response.split(/\.(?=\s|$)/g);

  phrases.forEach(handlePhrase.bind(null, character));

  return character;
}

function handlePhrase(character, phrase) {
  if (phrase.includes('experience')) {
    const exp = extractValueFromPhrase(phrase);
    character.experience += exp;
  } else if (phrase.includes('health')) {
    const health = extractValueFromPhrase(phrase);
    character.health += health;
  } else if (phrase.includes('level')) {
    const level = extractValueFromPhrase(phrase);
    character.level = level;
  } else if (phrase.includes('gold')) {
    const gold = extractValueFromPhrase(phrase);
    character.finances.gold += gold;
  } else if (phrase.includes('silver')) {
    const silver = extractValueFromPhrase(phrase);
    character.finances.silver += silver;
  } else if (phrase.includes('copper')) {
    const copper = extractValueFromPhrase(phrase);
    character.finances.copper += copper;
  } else if (phrase.includes('inventory')) {
    const item = extractItemFromPhrase(phrase);
    character.inventory.push(item);
  } else if (phrase.includes('ability')) {
    const ability = extractAbilityFromPhrase(phrase);
    character.abilities.push(ability);
  } else if (phrase.includes('status effect')) {
    const effect = extractEffectFromPhrase(phrase);
    character.statusEffects.push(effect);
  } // Continue with more else if branches for other attributes as needed
}

function extractValueFromPhrase(phrase) {
  const matches = phrase.match(/-?\b(\d+)\b/); // matches the first group of digits, allows for negative
  return matches ? parseInt(matches[1]) : 0;
}

function extractItemFromPhrase(phrase) {
  const matches = phrase.match(/item:\s*(.*?),\s*quantity:\s*(\d+),\s*description:\s*(.*)/i);
  return matches ? {name: matches[1], quantity: parseInt(matches[2]), description: matches[3]} : null;
}

function extractAbilityFromPhrase(phrase) {
  const matches = phrase.match(/ability:\s*(.*?),\s*power:\s*(\d+),\s*description:\s*(.*)/i);
  return matches ? {name: matches[1], power: parseInt(matches[2]), description: matches[3]} : null;
}

function extractEffectFromPhrase(phrase) {
  const matches = phrase.match(/effect:\s*(.*?),\s*duration:\s*(\d+),\s*description:\s*(.*)/i);
  return matches ? {name: matches[1], duration: parseInt(matches[2]), description: matches[3]} : null;
}

module.exports = {
  parseResponseForStats,
  extractValueFromPhrase,
  extractAbilityFromPhrase,
  extractItemFromPhrase,
  extractEffectFromPhrase,
};
