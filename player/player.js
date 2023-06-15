'use strict';

require('dotenv').config();
const colors = require('colors');
const prompt = require('prompt-sync')();
// const axios = require('axios');
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const { Configuration, OpenAIApi } = require('openai');

const eventPool = require('../eventPool');
const Chance = require('chance');
const chance = new Chance();
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const socket = io(SERVER_URL);

let user = {
  name: chance.animal(),
  id: 1,
  score: 0,
  defaultCharacter: null,
  characters: [],
  username: null,
  password: null,
  token: null, // Added token field to store JWT
};

socket.on('connect', () => {
  console.log(colors.green('Connected to the server.'));
});

socket.on(eventPool.eventPool.USER_CHECK_ACCOUNT, () => {
  console.log('Do you have an account?');
  const hasAccount = prompt('Enter Y for Yes or N for No: ');
  socket.emit(
    eventPool.eventPool.USER_CHECK_ACCOUNT_RESPONSE,
    hasAccount && hasAccount.toUpperCase() === 'Y',
  );
});

socket.on(eventPool.eventPool.USER_CREATE_ACCOUNT, async () => {
  const newUsername = prompt('Enter a new username: ');
  const newPassword = prompt('Enter a new password: ');
  const newEmail = prompt('Enter a new email: ');

  try {
    await socket.emit(
      eventPool.eventPool.USER_CREATE_ACCOUNT_RESPONSE,
      newUsername,
      newPassword,
      newEmail,
    );
  } catch (error) {
    console.error('Error creating account:', error.message);
  }
  // Add a closing brace here
});

socket.on(eventPool.eventPool.USER_LOGIN, async () => {
  const username = prompt('Enter your username: ');
  const password = prompt('Enter your password: ');

  try {
    socket.emit(eventPool.eventPool.USER_AUTHENTICATE, username, password);
  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
});

socket.on(
  eventPool.eventPool.USER_AUTHENTICATE_SUCCESS,
  async (user, token) => {
    console.log('User authenticated:', user.user.username);
    console.log('token:', token);
    // user.token = data.token; // Store the received JWT
    await handleGameLogic(user, token);
  },
);

async function handleGameLogic(user) {
  console.log('User joined the game:', user.user);

  // Check if the user has a default character
  if (user.user.defaultCharacter) {
    console.log(
      'Default character already exists:',
      user.user.defaultCharacter.name,
    );
    // Proceed with the game using the existing default character
    startGameWithCharacter(user.user.defaultCharacter);
  } else {
    // Prompt the user to create a character
    console.log(
      'No default character exists for the user:',
      user.user.username,
    );
    const character = await promptCharacterCreation(user.user);
    // Update the user's default character
    user.defaultCharacter = character; // Store the default character by its name
    // Join the user to the created character
    console.log('Joining the user to the created character:', character);
    socket.emit(eventPool.eventPool.CHARACTER_JOIN, character); // Pass the character name
    // Proceed with the game using the created character
    startGameWithCharacter(character); // Pass the character name
  }
}

function promptCharacterCreation(user) {
  let currentUser = { user };
  console.log('Creating a new character for', user.user);
  const name = prompt('Enter a character name: ');
  const description = prompt('Enter a character description: ');

  socket.emit(eventPool.eventPool.CHARACTER_CREATE, currentUser, {
    name,
    description,
  });

  // socket.once(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
  //   console.log('Character created:', data.character);
  //   // Update the user's default character
  //   user.defaultCharacter = data.character;
  //   // Join the user to the created character
  //   socket.emit(eventPool.eventPool.CHARACTER_JOIN, data.character.name); // Pass the character name
  //   // Proceed with the game using the created character
  //   startGameWithCharacter(data.character); // Pass the character name
  // });

  socket.once(eventPool.eventPool.CHARACTER_CREATE_ERROR, (error) => {
    console.error('Error creating character:', error.message);
  });
}

socket.on(eventPool.eventPool.USER_AUTHENTICATE_ERROR, (error) => {
  console.error('Authentication failed:', error.message);
});

function createCharacter(username) {
  console.log('Creating a new character for', username);
  console.log('username.username', username.username);
  console.log('user', username.user);
  console.log('name', username.defaultCharacter.name);
  console.log('description', username.defaultCharacter.description);
  console.log('Character id', username.defaultCharacter._id);

  const name = prompt('Enter a character name: ');
  const description = prompt('Enter a character description: ');

  socket.emit(eventPool.eventPool.CHARACTER_CREATE, username, {
    name,
    description,
  });
}

socket.on(eventPool.eventPool.USER_JOIN_SUCCESS, (data) => {
  console.log('User joined the game:', data.user.username);

  if (data.user.defaultCharacter) {
    console.log(
      'Default character already exists:',
      data.user.defaultCharacter,
    );
  } else {
    console.log(data);
    createCharacter(data.user.username); // Prompt the user to create a character
  }
});

const roomName = prompt('Enter a room name to create or join: ');
socket.emit('create_room', { roomName: roomName });
// or
socket.emit('join_room', { roomName: roomName });

socket.on('room_creation_failed', (data) => {
  // Display error message to the user
  alert(data.message);
});

socket.on('join_room_success', (data) => {
  // Switch to the chat interface for the room
  showChatInterface(data.roomName);
});
function showChatInterface(roomName) {
  console.log(`You are now in the room: ${roomName}`);
  console.log('Here, you can send messages or read new ones.');

  // Listen to new messages
  socket.on('new_message', (data) => {
    console.log(`${data.sender}: ${data.message}`);
  });

  // Infinitely prompt for new messages
  // const intervalId = setInterval(() => {
  //   const message = prompt('Enter a message (type "exit" to leave the chat):');
  //   if (message === 'exit') {
  //     clearInterval(intervalId);
  //   } else {
  //     socket.emit('send_message', { roomName, message });
  //   }
  // }, 1000);
}

socket.on(eventPool.eventPool.USER_JOIN_ERROR, (error) => {
  console.error('Error joining the game:', error.message);
});

// socket.on(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
//   console.log('Character created:', data.character);
//   // Update the user's default character
//   user.defaultCharacter = data.character.id;
//   // Join the user to the created character
//   socket.emit(eventPool.eventPool.CHARACTER_JOIN, data.character.id);
// });
socket.on(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
  console.log('Character created:', data.character);

  // Update the user's default character
  user.defaultCharacter = data.character;

  // Join the user to the created character
  // socket.emit(eventPool.eventPool.CHARACTER_JOIN, data.character.name); // Pass the character name
  socket.emit(eventPool.eventPool.CHARACTER_JOIN, data.character._id); // Pass the character ID

  // Proceed with the game using the created character
  startGameWithCharacter(data.character); // Pass the character name
});

function parseResponseForStats(response, character) {
  // Here, we'll parse the response for key phrases that tell us what happened.
  // This is a very basic example; you'll need to expand on this for a real game.
  if (response.includes('hit by a dragon')) {
    character.health -= 20;
    character.experience += 15;
    console.log(
      `Ouch! You were hit by a dragon. Your health is now ${character.health} and your experience is ${character.experience}.`,
    );
  } else if (response.includes('found treasure')) {
    character.wealth += 100;
    console.log(`You found treasure! Your wealth is now ${character.wealth}.`);
  }

  // Send the updated character stats back to the server
  socket.emit(eventPool.eventPool.CHARACTER_UPDATE_STATS, character);
}

// Now we'll add a call to this new function in our existing startGameWithCharacter function
async function startGameWithCharacter(character) {
  if (!character) {
    console.error('No character provided');
    return;
  }
  console.log('Starting game with character:', character);
  console.log(`${character.name}'s description: ${character.description}`);
  try {
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: `Once upon a time, there was a character named ${character.name}. ${character.description}. What happens next?`,
      max_tokens: 50,
      temperature: 0,
    });

    let message;
    if (
      response.data &&
      response.data.choices &&
      response.data.choices.length > 0
    ) {
      message = response.data.choices[0].text;
    } else {
      console.error('No choices available in the response');
    }
    console.log('Generated Storyline:', message);
    parseResponseForStats(message, character); // Here's where we add the call to our new function
    displayStorylineAndPrompt(character, message);
  } catch (error) {
    console.error('Error generating storyline:', error);
  }
}

function displayStorylineAndPrompt(character, storyline) {
  console.log('Storyline:', storyline);
  console.log('Available actions:');
  console.log('- Attack');
  console.log('- Defend');
  console.log('- Heal');
  console.log('- Flee');
  console.log('- Custom Action');
  console.log('- Quit (to exit the game)');

  promptAction(character);
}
function promptAction(character) {
  const action = prompt('Choose an action: ');
  handleAction(action, character);
}

function handleAction(action, character) {
  let customAction;

  switch (action) {
  case 'Attack':
    socket.emit(eventPool.CHARACTER_ACTION_ATTACK, character.id);
    break;
  case 'Defend':
    socket.emit(eventPool.CHARACTER_ACTION_DEFEND, character.id);
    break;
  case 'Heal':
    socket.emit(eventPool.CHARACTER_ACTION_HEAL, character.id);
    break;
  case 'Flee':
    socket.emit(eventPool.CHARACTER_ACTION_FLEE, character.id);
    break;
  case 'Custom Action':
    customAction = prompt('Enter custom action: ');
    socket.emit(
      eventPool.CHARACTER_ACTION_CUSTOM,
      character.id,
      customAction,
    );
    break;
  case 'Quit':
    console.log(colors.yellow('Game ended.'));
    return;
  default:
    console.log(colors.red('Invalid action. Please try again.'));
    break;
  }
  promptAction(character);
}
// ...
socket.on(eventPool.eventPool.CHARACTER_ACTION_ATTACK, (data) => {
  console.log(`Character ${data.characterId} attacks: ${data.message}`);
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_DEFEND, (data) => {
  console.log(`Character ${data.characterId} defends: ${data.message}`);
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_HEAL, (data) => {
  console.log(`Character ${data.characterId} heals: ${data.message}`);
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_FLEE, (data) => {
  console.log(`Character ${data.characterId} flees: ${data.message}`);
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_CUSTOM, (data) => {
  console.log(
    `Character ${data.characterId} performs a custom action: ${data.message}`,
  );
});
socket.on(eventPool.eventPool.CHARACTER_JOIN_SUCCESS, (data) => {
  console.log(`${data}`);
  console.log('Character joined:', data.character);
});

socket.on(eventPool.eventPool.CHARACTER_JOIN_ERROR, (error) => {
  console.error('Error joining character:', error.message);
});

socket.on(eventPool.eventPool.CHARACTER_LEAVE_SUCCESS, (data) => {
  console.log(`Character ${data.characterId} has left the game.`);
});

socket.on(eventPool.eventPool.CHARACTER_LEAVE_ERROR, (error) => {
  console.error('Error leaving character:', error.message);
});

socket.on('disconnect', () => {
  console.log(colors.yellow('Disconnected from the server.'));
});
