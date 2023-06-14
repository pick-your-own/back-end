'use strict';

require('dotenv').config();
const colors = require('colors');
const prompt = require('prompt-sync')();
const axios = require('axios');
const { io } = require('socket.io-client');
const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3001';

const eventPool = require('../eventPool');
const Chance = require('chance');
const chance = new Chance();


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
  socket.emit(eventPool.eventPool.USER_CHECK_ACCOUNT_RESPONSE, hasAccount.toUpperCase() === 'Y');
});

socket.on(eventPool.eventPool.USER_CREATE_ACCOUNT, async () => {
  const newUsername = prompt('Enter a new username: ');
  const newPassword = prompt('Enter a new password: ');
  const newEmail = prompt('Enter a new email: ');

  try {
    await socket.emit(eventPool.eventPool.USER_CREATE_ACCOUNT_RESPONSE, newUsername, newPassword, newEmail);
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

socket.on(eventPool.eventPool.USER_AUTHENTICATE_SUCCESS, async (data) => {
  console.log('User authenticated:', data.user);
  user.token = data.token; // Store the received JWT

  // After authentication, proceed with the game logic
  await handleGameLogic(data.user);
});

async function handleGameLogic(user) {
  console.log('User joined the game:', user);

  // Check if the user has a default character
  if (user.defaultCharacter) {
    console.log('Default character already exists:', user.defaultCharacter);
    // Proceed with the game using the existing default character
    startGameWithCharacter(user.defaultCharacter);
  } else {
    // Prompt the user to create a character
    const character = await promptCharacterCreation(user.username);
    // Update the user's default character
    user.defaultCharacter = character.name; // Store the default character by its name
    // Join the user to the created character
    socket.emit(eventPool.eventPool.CHARACTER_JOIN, character.name); // Pass the character name
    // Proceed with the game using the created character
    startGameWithCharacter(character.name); // Pass the character name
  }
}


function promptCharacterCreation(username) {
  return new Promise((resolve, reject) => {
    console.log('Creating a new character for', username);
    const name = prompt('Enter a character name: ');
    const description = prompt('Enter a character description: ');

    socket.emit(eventPool.eventPool.CHARACTER_CREATE, username, { name, description });

    socket.on(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
      console.log('Character created:', data.character);
      resolve(data.character);
    });

    socket.on(eventPool.eventPool.CHARACTER_CREATE_ERROR, (error) => {
      console.error('Error creating character:', error.message);
      reject(error);
    });
  });
}

socket.on(eventPool.eventPool.USER_AUTHENTICATE_ERROR, (error) => {
  console.error('Authentication failed:', error.message);
});

function createCharacter(username) {
  console.log('Creating a new character for', username);
  const name = prompt('Enter a character name: ');
  const description = prompt('Enter a character description: ');

  socket.emit(eventPool.eventPool.CHARACTER_CREATE, username, { name, description });
}

socket.on(eventPool.eventPool.USER_JOIN_SUCCESS, (data) => {
  console.log('User joined the game:', data.user);

  if (data.user.defaultCharacter) {
    console.log('Default character already exists:', data.user.defaultCharacter);
  } else {
    createCharacter(data.user.username); // Prompt the user to create a character
  }
});

socket.on(eventPool.eventPool.USER_JOIN_ERROR, (error) => {
  console.error('Error joining the game:', error.message);
});

socket.on(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
  console.log('Character created:', data.character);
  // Update the user's default character
  user.defaultCharacter = data.character.id;
  // Join the user to the created character
  socket.emit(eventPool.eventPool.CHARACTER_JOIN, data.character.id);
});

function startGameWithCharacter(characterName) {
  // Implement your game logic here
  console.log('Starting game with character:', characterName);
  // ...
  socket.on(eventPool.eventPool.CHARACTER_ACTION_ATTACK, (data) => {
    console.log(`Character ${data.characterId} attacks: ${data.message}`);
  });
  
  socket.on(eventPool.eventPool.CHARACTER_ACTION_DEFEND, (data) => {
    console.log(`Character ${data.characterId} defends: ${data.message}`);
  });
  
  socket.on(eventPool.eventPool.CHARACTER_ACTION_HEAL, data => {
    console.log(`Character ${data.characterId} heals: ${data.message}`);
  });
  
  socket.on(eventPool.eventPool.CHARACTER_ACTION_FLEE, data => {
    console.log(`Character ${data.characterId} flees: ${data.message}`);
  });
  
  socket.on(eventPool.eventPool.CHARACTER_ACTION_CUSTOM, data => {
    console.log(`Character ${data.characterId} performs a custom action: ${data.message}`);
  });
  socket.on(eventPool.eventPool.CHARACTER_JOIN_SUCCESS, (data) => {
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
}

socket.on('disconnect', () => {
  console.log(colors.yellow('Disconnected from the server.'));
});