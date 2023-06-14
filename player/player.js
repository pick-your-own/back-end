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
  username: null,
  password: null,
  token: null, // Added token field to store JWT
};

socket.on('connect', () => {
  console.log(colors.green('Connected to the server.'));
});

const registerUser = async (username, password, email) => {
  try {
    const response = await axios.post('http://localhost:3001/register', {
      username,
      password,
      email,
    });

    localStorage.setItem('token', response.data.token);
    user.token = response.data.token;

  } catch (error) {
    console.error(error.message);
  }
};

const loginUser = async (username, password) => {
  try {
    const response = await axios.post('http://localhost:3001/login', {
      username,
      password,
    });

    // localStorage.setItem('token', response.data.token);
    user.token = response.data.token;

  } catch (error) {
    console.error(error.message);
  }
};

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
    await registerUser(newUsername, newPassword, newEmail);
  } catch (error) {
    console.error('Error creating account:', error.message);
  }
});

// socket.on(eventPool.eventPool.USER_LOGIN, async (data) => { // Update the parameter to receive the data object
//   console.log('User login', data);
//   const username = data.username; // Get the username from the data object
//   const password = data.password; // Get the password from the data object
//   try {
//     await loginUser(username, password); // Pass the username and password to the loginUser function

//   } catch (error) {
//     console.error('Authentication failed:', error.message);
//   }
// });

socket.on(eventPool.eventPool.USER_LOGIN, async () => {
  const username = prompt('Enter your username: ');
  const password = prompt('Enter your password: ');

  try {
    socket.emit(eventPool.eventPool.USER_AUTHENTICATE, username, password);
  } catch (error) {
    console.error('Authentication failed:', error.message);
  }
});


// socket.on(eventPool.eventPool.USER_LOGIN, async () => {
//   const username = prompt('Enter your username: ');
//   const password = prompt('Enter your password: ');

//   try {
//     await loginUser(username, password);
//   } catch (error) {
//     console.error('Authentication failed:', error.message);
//   }
// });



socket.on(eventPool.eventPool.USER_AUTHENTICATE_SUCCESS, (data) => {
  console.log('User authenticated:', data.user);
  user.token = data.token; // Store the received JWT
});


socket.on(eventPool.eventPool.USER_AUTHENTICATE_ERROR, (error) => {
  console.error('Authentication failed:', error.message);
});

socket.on(eventPool.eventPool.USER_JOIN_SUCCESS, (data) => {
  
  console.log('User joined the game:', data.user);
});

socket.on(eventPool.eventPool.USER_JOIN_ERROR, (error) => {
  console.error('Error joining the game:', error.message);
});

// socket.on(eventPool.eventPool.USER_JOIN, (user) => {
//   console.log(`User ${user.username} has joined the game.`);
//   socket.emit(eventPool.eventPool.USER_JOIN, {username, token: user.token});
// });

socket.on(eventPool.eventPool.USER_LEAVE, (data) => {
  console.log(`User ${data.username} has left the game.`);
});

socket.on(eventPool.eventPool.USER_LEAVE_ERROR, (error) => {
  console.error('Error leaving the game:', error.message);
});

socket.on(eventPool.eventPool.CHARACTER_CREATE_SUCCESS, (data) => {
  console.log('Character created:', data.character);
});

socket.on(eventPool.eventPool.CHARACTER_CREATE_ERROR, (error) => {
  console.error('Error creating character:', error.message);
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

socket.on('disconnect', () => {
  console.log(colors.yellow('Disconnected from the server.'));
});

const username = prompt('Choose a username: '.yellow);
if (username !== '') {
  user.name = username;
  socket.emit(eventPool.eventPool.USER_JOIN, username);
}

const shouldLeaveGame = prompt('Would you like to leave the game? (Y/N): '.yellow);
if (shouldLeaveGame.toUpperCase() === 'Y') {
  socket.emit(eventPool.eventPool.USER_LEAVE, username);
  console.log('You have left the game.');
} else {
  console.log('You have chosen to stay in the game.');
}
