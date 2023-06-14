const readline = require('readline');
const colors = require('colors');
const { eventPool } = require('./eventPool');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let characterId = '';

function promptAction(socket) {
  rl.question('Choose an action: ', (action) => {
    handleAction(action, socket);
  });
}

function handleAction(action, socket) {
  switch (action) {
  case 'Attack':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_ATTACK, characterId);
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Defend':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_DEFEND, characterId);
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Heal':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_HEAL, characterId);
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Flee':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_FLEE, characterId);
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Custom Action':
    if (characterId) {
      rl.question('Enter custom action: ', (customAction) => {
        socket.emit(eventPool.CHARACTER_ACTION_CUSTOM, characterId, customAction);
      });
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Quit':
    rl.close();
    console.log(colors.yellow('Game ended.'));
    return;
  default:
    console.log(colors.red('Invalid action. Please try again.'));
    break;
  }

  displayAvailableActions();
  promptAction(socket);
}

function displayAvailableActions() {
  console.log('Available actions:');
  console.log('- Attack');
  console.log('- Defend');
  console.log('- Heal');
  console.log('- Flee');
  console.log('- Custom Action');
  console.log('- Quit (to exit the game)');
}

function startGame(socket, character) {
  console.log(colors.green('Welcome to the game!'));
  console.log(`You have joined the game as ${character.name}`);
  characterId = character.id; // Assign the characterId to the global variable
  displayAvailableActions();
  promptAction(socket);
}

module.exports = {
  startGame,
};
