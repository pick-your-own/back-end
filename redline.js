const colors = require('colors');
const { eventPool } = require('./eventPool');

let characterId = '';

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
      console.log(colors.yellow('Enter custom action:'));
      process.stdin.once('data', (customAction) => {
        socket.emit(
          eventPool.CHARACTER_ACTION_CUSTOM,
          characterId,
          customAction.toString().trim(),
        );
      });
    } else {
      console.log(colors.red('Invalid action: Character not joined.'));
    }
    break;
  case 'Quit':
    endGame();
    break;
  default:
    console.log(colors.red('Invalid action. Please try again.'));
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
  console.log(`You have joined the game as ${character.name}`);
  characterId = character.id; // Assign the characterId to the global variable
  displayAvailableActions();

  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (data) => {
    const input = data.trim();
    handleAction(input, socket);
  });

  process.stdin.on('end', () => {
    endGame();
  });
}

function endGame() {
  console.log(colors.yellow('Game ended.'));
  process.stdin.removeAllListeners('data');
  process.exit(0);
}

module.exports = {
  startGame,
};
