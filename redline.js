const readline = require('readline');
const chalk = require('chalk');
const { eventPool } = require('./eventPool');
// const { characterQueue } = require('./characterQueue');

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
      console.log(chalk.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Defend':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_DEFEND, characterId);
    } else {
      console.log(chalk.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Heal':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_HEAL, characterId);
    } else {
      console.log(chalk.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Flee':
    if (characterId) {
      socket.emit(eventPool.CHARACTER_ACTION_FLEE, characterId);
    } else {
      console.log(chalk.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Custom Action':
    if (characterId) {
      rl.question('Enter custom action: ', (customAction) => {
        socket.emit(eventPool.CHARACTER_ACTION_CUSTOM, characterId, customAction);
      });
    } else {
      console.log(chalk.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Quit':
    rl.close();
    console.log(chalk.yellow('Game ended.'));
    return;
  default:
    console.log(chalk.red('Invalid action. Please try again.'));
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

function startGame(socket, charId) {
  characterId = charId; // Assign the characterId to the global variable
  console.log(chalk.green('Welcome to the game!'));
  displayAvailableActions();
  promptAction(socket);
}

module.exports = {
  startGame,
};
