const readline = require('readline');
const colors = require('colors');
const { eventPool } = require('./eventPool');

let characterId = '';

// Creating readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

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
      rl.question(colors.yellow('Enter custom action:\n'), (customAction) => {
        socket.emit(
          eventPool.CHARACTER_ACTION_CUSTOM,
          characterId,
          customAction.trim(),
        );
      });
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  default:
    console.log(colors.red(`Invalid action: ${action}. Please try again.`));
    displayAvailableActions();
    break;
  }
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
  console.log(`You have joined the game as ${character}`);
  characterId = character;
  displayAvailableActions();

  rl.on('line', (input) => {
    handleAction(input.trim(), socket);
  });

  rl.on('close', () => {
    endGame();
  });
}

function endGame() {
  console.log(colors.yellow('Game ended.'));
  rl.close();
  process.exit(0);
}


module.exports = {
  startGame,
};
