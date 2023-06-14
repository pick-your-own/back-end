'use strict';

require('dotenv').config();

const { Server } = require('socket.io');
const mongoose = require('mongoose');
// const colors = require('colors');
const chalk = require('chalk');
const { UserQueue } = require('./src/lib/UserQueue');
const { CharacterQueue } = require('./src/lib/CharacterQueue');
const { eventPool } = require('./eventPool');
const axios = require('axios');
const { startGame } = require('./readline');

let userQueue = new UserQueue();
let characterQueue = new CharacterQueue();

const PORT = process.env.PORT || 3001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatApp';

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

io.on('connection', (socket) => {
  console.log('CLIENT CONNECTED TO SERVER: '.green + socket.id.yellow);
  // user joins the game
  socket.on(eventPool.USER_JOIN, async (username) => {
    console.log('connected');
    try {
      const user = await userQueue.createUser(username);
      socket.emit(eventPool.USER_JOIN, user);
    } catch (error) {
      console.error('Error creating user:', error);
      socket.emit(eventPool.USER_JOIN_ERROR, { message: 'Could not create user' });
    }
  });
  // user leaves the game
  socket.on(eventPool.USER_LEAVE, async (username) => {
    try {
      await userQueue.removeUser(username);
      socket.emit(eventPool.USER_LEAVE, { username });
    } catch (error) {
      console.error('Error removing user:', error);
      socket.emit(eventPool.USER_LEAVE_ERROR, { message: 'Could not remove user' });
    }
  });
  // User creates a character
  socket.on(eventPool.CHARACTER_CREATE, async (username, characterData) => {
    try {
      const character = characterQueue.addCharacter(characterData);
      console.log('character created');
      socket.emit(eventPool.CHARACTER_CREATE, { character });
    } catch (error) {
      console.error('Error creating character:', error);
      socket.emit(eventPool.CHARACTER_CREATE_ERROR, { message: 'Could not create character' });
    }
  });

  socket.on(eventPool.CHARACTER_JOIN, async (characterId) => {
    try {
      const character = characterQueue.getCharacter(characterId);
      console.log('character joined');
      socket.emit(eventPool.CHARACTER_JOIN, { character });
      startGame(socket, characterId); // Call the startGame function and pass the socket and characterId
    } catch (error) {
      console.error('Error joining character:', error);
      socket.emit(eventPool.CHARACTER_JOIN_ERROR, { message: 'Could not join character' });
    }
  });
  

  // Character leaves the game
  socket.on(eventPool.CHARACTER_LEAVE, async (characterId) => {
    try {
      characterQueue.removeCharacter(characterId);
      socket.emit(eventPool.CHARACTER_LEAVE, { characterId });
    } catch (error) {
      console.error('Error leaving character:', error);
      socket.emit(eventPool.CHARACTER_LEAVE_ERROR, { message: 'Could not leave character' });
    }
  });
  // Character attacks
  socket.on(eventPool.CHARACTER_ACTION_ATTACK, async (characterId) => {
    let character = characterQueue.read(characterId);
    let message = '';
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/engines/davinci-codex/completions',
        {
          prompt: `${character.name} attacks the dragon. What happens next?`,
          max_tokens: 100,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        },
      );

      message = response.data.choices[0].text;
    } catch (error) {
      console.error('Error interacting with OpenAI API:', error);
    }
    console.log(message);

    // Emit the event with the updated message
    io.emit(eventPool.CHARACTER_ACTION_ATTACK, { characterId, message });
  });

  // Character defends
  socket.on(eventPool.CHARACTER_ACTION_DEFEND, async (characterId) => {
    let character = characterQueue.read(characterId);
    // Character defends, increase defense temporarily

    // Generate storyline response with OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: `${character.name} defends. What happens next?`,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );
    const message = response.data.choices[0].text;
    console.log(message);

    io.emit(eventPool.CHARACTER_ACTION_DEFEND, { characterId, message });
  });

  // Character heals
  socket.on(eventPool.CHARACTER_ACTION_HEAL, async (characterId) => {
    let character = characterQueue.read(characterId);
    // Character heals, increase health

    // Generate storyline response with OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: `${character.name} heals. What happens next?`,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );
    const message = response.data.choices[0].text;
    console.log(message);

    io.emit(eventPool.CHARACTER_ACTION_HEAL, { characterId, message });
  });

  // Character flees
  socket.on(eventPool.CHARACTER_ACTION_FLEE, async (characterId) => {
    let character = characterQueue.read(characterId);
    // Character flees, set health to full and decrease experience

    // Generate storyline response with OpenAI API
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: `${character.name} flees. What happens next?`,
        max_tokens: 100,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      },
    );
    const message = response.data.choices[0].text;
    console.log(message);

    io.emit(eventPool.CHARACTER_ACTION_FLEE, { characterId, message });
  });

  // Character performs a custom action
  socket.on(
    eventPool.CHARACTER_ACTION_CUSTOM,
    async (characterId, customAction) => {
      let character = characterQueue.read(characterId);
      let message = '';
      try {
        const response = await axios.post(
          'https://api.openai.com/v1/engines/davinci-codex/completions',
          {
            prompt: `${character.name} ${customAction}. What happens next?`,
            max_tokens: 100,
          },
          {
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            },
          },
        );

        message = response.data.choices[0].text;
        console.log(message);
      } catch (error) {
        console.error('Error interacting with OpenAI API:', error);
      }

      // Emit the event with the updated message
      io.emit(eventPool.CHARACTER_ACTION_CUSTOM, { characterId, message });
    },
  );

  socket.on('disconnect', () => {
    console.log(chalk.yellow(`CLIENT DISCONNECTED FROM SERVER: ${socket.id}`));
  });
});
