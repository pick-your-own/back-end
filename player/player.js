'use strict';

require('dotenv').config();
const colors = require('colors');
const prompt = require('prompt-sync')();

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
};

socket.on('connect', () => {
  console.log(colors.green('Connected to the server.'));
});

// socket.on(eventPool.eventPool.USER_CHECK_ACCOUNT_RESPONSE, (hasAccount) => {
//   const hasAccount = prompt('Would you like to leave the game? (Y/N): '.yellow);
//   if (hasAccount.toUpperCase() === 'N') {
//     socket.emit(eventPool.eventPool.USER_LOGIN);
//   } else {
//     socket.emit(eventPool.eventPool.USER_CREATE_ACCOUNT);
//   }
// });
socket.on(eventPool.eventPool.USER_CHECK_ACCOUNT, () => {
  console.log('Do you have an account?');
  const hasAccount = prompt('Enter Y for Yes or N for No: ');
  socket.emit(eventPool.eventPool.USER_CHECK_ACCOUNT_RESPONSE, hasAccount.toUpperCase() === 'Y');
});

socket.on(eventPool.eventPool.USER_LOGIN, () => {
  const username = prompt('Enter your username: ');
  const password = prompt('Enter your password: ');
  const token = prompt('Enter your token: ');
  socket.emit(eventPool.eventPool.USER_AUTHENTICATE, token);
});

socket.on(eventPool.eventPool.USER_CREATE_ACCOUNT, (message) => {
  const newUsername = prompt('Enter a new username: ');
  const newPassword = prompt('Enter a new password: ');
  const newEmail = prompt('Enter a new email: ');
  console.log(message);
  socket.emit(eventPool.eventPool.USER_CREATE_ACCOUNT_RESPONSE, newUsername, newPassword, newEmail);
});

socket.on(eventPool.eventPool.USER_AUTHENTICATE_SUCCESS, (data) => {
  console.log('User authenticated:', data.user);
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

socket.on(eventPool.eventPool.USER_JOIN, (user) => {
  console.log(`User ${user.username} has joined the game.`);
});

socket.on(eventPool.eventPool.USER_JOIN_ERROR, (error) => {
  console.error('Error joining the game:', error.message);
});

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

// User joins the game
const username = prompt('Choose a username: '.yellow);
if (username !== '') {
  user.name = username;
  socket.emit(eventPool.eventPool.USER_JOIN, username);
}

// User leaves the game
const shouldLeaveGame = prompt('Would you like to leave the game? (Y/N): '.yellow);
if (shouldLeaveGame.toUpperCase() === 'Y') {
  socket.emit(eventPool.eventPool.USER_LEAVE, username);
  console.log('You have left the game.');
} else {
  // Handle the case when the player chooses not to leave the game
  console.log('You have chosen to stay in the game.');
}
