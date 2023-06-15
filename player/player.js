'use strict';

require('dotenv').config();
const colors = require('colors');
const prompt = require('prompt-sync')();
// const axios = require('axios');
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';
const { Configuration, OpenAIApi } = require('openai');
const characterUpdates = require('./characterUpdates');

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

let character = {
  health: 100,
  dfspts: 10,
  atkpts: 10,
};

socket.on('connect', () => {
  console.log(colors.green('Connected to the server.'));
});

socket.on(eventPool.eventPool.USER_CHECK_ACCOUNT, () => {
  console.log('Do you have an account?');
  const hasAccount =
    prompt('Enter Y for Yes or N for No: ').toUpperCase() === 'Y';
  socket.emit(eventPool.eventPool.USER_CHECK_ACCOUNT_RESPONSE, hasAccount);
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
    token = user.token;
    await handleGameLogic(user, token);
  },
);

async function handleGameLogic(user, token) {
  console.log('User joined the game:', user.user);
  console.log('token:', token);
  if (user.user.defaultCharacter) {
    console.log(
      'Default character already exists:',
      user.user.defaultCharacter.name,
    );
    startGameWithCharacter(user.user.defaultCharacter);
  } else {
    console.log(
      'No default character exists for the user:',
      user.user.username,
    );
    const character = await promptCharacterCreation(user);
    user.defaultCharacter = character;
    console.log('Joining the user to the created character:', character);
    socket.emit(eventPool.eventPool.CHARACTER_JOIN, character);
    startGameWithCharacter(character);
  }
}

function promptCharacterCreation(user) {
  let currentUser = { user };
  console.log('Creating a new character for', currentUser.user);
  const name = prompt('Enter a character name: ');
  const description = prompt('Enter a character description: ');

  socket.emit(eventPool.eventPool.CHARACTER_CREATE, currentUser, {
    name,
    description,
  });
  socket.once(eventPool.eventPool.CHARACTER_CREATE_ERROR, (error) => {
    console.error('Error creating character:', error.message);
  });
}

socket.on(eventPool.eventPool.USER_AUTHENTICATE_ERROR, (error) => {
  console.error('Authentication failed:', error.message);
});

function createCharacter(username) {
  console.log('createCharacter: Creating a new character for', username);
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
    createCharacter(data.user.username);
  }
});

const roomName = prompt('Enter a room name to create or join: ');
socket.emit('create_room', { roomName });
// or
socket.emit('join_room', { roomName });

socket.on('room_creation_failed', (data) => {
  alert(data.message);
});

socket.on('join_room_success', (data) => {
  showChatInterface(data.roomName);
});

function showChatInterface(roomName) {
  console.log(`You are now in the room: ${roomName}`);
  console.log('Here, you can send messages or read new ones.');

  socket.on('new_message', (data) => {
    console.log(`${data.sender}: ${data.message}`);
  });
}

socket.on(eventPool.eventPool.USER_JOIN_ERROR, (error) => {
  console.error('Error joining the game:', error.message);
});

socket.on(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
  console.log('Character created:', data.character);
  user.defaultCharacter = data.character;
  socket.emit(eventPool.eventPool.CHARACTER_JOIN, data.character._id);
  startGameWithCharacter(data.character);
});

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
      max_tokens: 100,
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
    character = characterUpdates.parseResponseForStats(message, character); // Updated character stats
    displayStorylineAndPrompt(message, character); // Pass both message and character as parameters
  } catch (error) {
    console.error('Error generating storyline:', error);
  }
}

// Revised function to display storyline and prompt for action
function displayStorylineAndPrompt(storyline) {
  console.log('Storyline:', storyline);

  const suggestedActions = suggestActionsBasedOnStoryline(storyline);

  console.log('Suggested actions:', suggestedActions.join(', '));

  promptAction(suggestedActions);
}

// Function to suggest actions based on storyline
function suggestActionsBasedOnStoryline(storyline) {
  let suggestedActions = [
    'Attack',
    'Defend',
    'Heal',
    'Flee',
    'Custom Action',
    'Quit',
  ];

  // Adjust the order of suggested actions based on the situation
  if (storyline.includes('dragon')) {
    suggestedActions = [
      'Defend',
      'Flee',
      'Attack',
      'Heal',
      'Custom Action',
      'Quit',
    ];
  } else if (storyline.includes('treasure')) {
    suggestedActions = [
      'Collect Treasure',
      'Defend',
      'Heal',
      'Flee',
      'Attack',
      'Custom Action',
      'Quit',
    ];
  }

  return suggestedActions;
}

// Revised function to prompt for action
function promptAction(suggestedActions) {
  const action = prompt('Choose an action or enter a custom action: ');

  // Check if the action is a suggested one or custom
  if (suggestedActions.includes(action)) {
    handleAction(action);
  } else {
    handleAction('Custom Action', action);
  }
}

function handleAction(action) {
  let methodDescription;
  
  switch (action) {
  case 'Attack': {
    methodDescription = prompt('How exactly do you attack? ');
    socket.emit(eventPool.eventPool.CHARACTER_ACTION_ATTACK, user.defaultCharacter, methodDescription);
    break;
  }
  case 'Defend': {
    methodDescription = prompt('How exactly do you defend? ');
    socket.emit(eventPool.eventPool.CHARACTER_ACTION_DEFEND, user.defaultCharacter, methodDescription);
    break;
  }
  case 'Heal': {
    methodDescription = prompt('How exactly do you heal? ');
    socket.emit(eventPool.eventPool.CHARACTER_ACTION_HEAL, user.defaultCharacter, methodDescription);
    break;
  }
  case 'Flee': {
    methodDescription = prompt('How exactly do you flee? ');
    socket.emit(eventPool.eventPool.CHARACTER_ACTION_FLEE, user.defaultCharacter, methodDescription);
    break;
  }
  case 'Custom Action': {
    methodDescription = prompt('Enter custom action: ');
    socket.emit(
      eventPool.eventPool.CHARACTER_ACTION_CUSTOM,
      user.defaultCharacter.id,
      methodDescription,
    );
    break;
  }
  case 'Quit': {
    console.log(colors.yellow('Game ended.'));
    return;
  }
  default: {
    console.log(colors.red('Invalid action. Please try again.'));
    break;
  }
  }
}


// let character = user.defaultCharacter;

socket.on(eventPool.eventPool.CHARACTER_ACTION_ATTACK, (data) => {
  console.log(`Character ${data.characterId} attacks: ${data.message}`);
  promptAction(); // Prompt for the next action
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_DEFEND, (data) => {
  console.log(`Character ${data.characterId} defends: ${data.message}`);
  promptAction(); // Prompt for the next action
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_HEAL, (data) => {
  console.log(`Character ${data.characterId} heals: ${data.message}`);
  promptAction(); // Prompt for the next action
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_FLEE, (data) => {
  console.log(`Character ${data.characterId} flees: ${data.message}`);
  promptAction(); // Prompt for the next action
});

socket.on(eventPool.eventPool.CHARACTER_ACTION_CUSTOM, (data) => {
  console.log(
    `Character ${data.characterId} performs a custom action: ${data.message}`,
  );
  promptAction(); // Prompt for the next action
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
