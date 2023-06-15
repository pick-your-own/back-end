'use strict';

require('dotenv').config();
const { startGame } = require('./redline.js');

const { Server } = require('socket.io');
const mongoose = require('mongoose');
const colors = require('colors');
const { UserQueue } = require('./src/lib/UserQueue');
const { CharacterQueue } = require('./src/lib/CharacterQueue');
const { eventPool } = require('./eventPool');
const User = require('./src/models/User');
const { Configuration, OpenAIApi } = require('openai');
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const Character = require('./src/models/Character');
// const characterController = require('./src/controllers/characterController');
const userController = require('./src/controllers/userController');
// const jwt = require('jsonwebtoken');

// const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/chatApp';
// const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const io = new Server(parseInt(process.env.PORT), {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let userQueue = new UserQueue();
let characterQueue = new CharacterQueue();

mongoose.connect(MONGODB_URI, {useNewUrlParser: true, useUnifiedTopology: true})
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('MongoDB connection error:', error));

// io.on('connection', handleEvents);

// initializeGame();

const authenticateUser = async (username, password) => {
  // Finds the user based on username
  const user = await User.findOne({ username });

  // Compares the password with the user's hashed password
  const { user: loggedInUser, token } = await userController.login(password, user.password, user);
  
  return {
    user: {
      username: loggedInUser.username,
      email: loggedInUser.email,
      characters: loggedInUser.characters,
      defaultCharacter: loggedInUser.defaultCharacter,
    },
    token,
  };
};

io.on('connection', (socket) => {
  console.log(
    colors.green('CLIENT CONNECTED TO SERVER: ') + colors.yellow(socket.id),
  );

  socket.emit(eventPool.USER_CHECK_ACCOUNT);

  socket.on(eventPool.USER_CHECK_ACCOUNT_RESPONSE, (hasAccount) => {
    socket.emit(
      hasAccount ? eventPool.USER_LOGIN : eventPool.USER_CREATE_ACCOUNT,
    );
  });

  socket.on(
    eventPool.USER_CREATE_ACCOUNT_RESPONSE,
    async (newUsername, newPassword, newEmail) => {
      if (!newUsername || !newPassword || !newEmail) {
        socket.emit('account_creation_cancelled', {
          message: 'Account creation cancelled.',
        });
        return;
      }

      try {
        const existingUser = await User.findOne({ username: newUsername });
        if (existingUser) {
          socket.emit('account_creation_failed', {
            message: 'Username is already taken',
          });
          return;
        }

        await userController.register(
          {
            body: {
              username: newUsername,
              password: newPassword,
              email: newEmail,
            },
          },
          {
            status: (statusCode) => ({
              json: (responseBody) => {
                if (statusCode === 201) {
                  const token = responseBody.token;
                  const user = { username: newUsername, token };
                  socket.user = user;

                  socket.emit(eventPool.USER_AUTHENTICATE_SUCCESS, { user });
                  socket.emit('account_creation_success', {
                    message: 'Account created successfully!',
                  });
                } else {
                  socket.emit('account_creation_failed', {
                    message: responseBody.message,
                  });
                }
              },
            }),
          },
        );
      } catch (error) {
        console.error('Error creating user:', error);
        socket.emit('account_creation_failed', {
          message: 'Could not create user',
        });
      }
    },
  );

  socket.on(eventPool.USER_AUTHENTICATE, (username, password) => {
    console.log('User attempting to authenticate', username, password);
    authenticateUser(username, password)
      .then(({user, token}) => {
        console.log('User authenticated:', user);
        socket.user = user;
        socket.emit(eventPool.USER_AUTHENTICATE_SUCCESS, { user, token });
      })
      .catch(error => {
        console.error('Error authenticating user:', error);
        socket.emit(eventPool.USER_AUTHENTICATE_ERROR, {
          message: 'Authentication failed',
        });
      });
  });

  // Room handlers can be condensed
  ['ROOM_CREATE', 'ROOM_JOIN', 'ROOM_LEAVE'].forEach(event => {
    socket.on(event, async (roomName) => {
      try {
        if (!io.sockets.adapter.rooms[roomName] && event !== 'ROOM_CREATE') throw new Error('Room does not exist');
        if (io.sockets.adapter.rooms[roomName] && event === 'ROOM_CREATE') throw new Error('Room already exists');

        socket[event.toLowerCase()](roomName);
        socket.emit(`${event}_SUCCESS`, { roomName });
      } catch (error) {
        console.error(`Error handling room ${event.toLowerCase()}:`, error);
        socket.emit(`${event}_ERROR`, { message: `Could not ${event.toLowerCase()} room.` });
      }
    });
  });
    
  socket.on(eventPool.USER_LOGOUT, () => {
    socket.emit(eventPool.USER_LOGOUT_SUCCESS);
  });

  const handleUserAuthenticationSuccess = async (socket, user) => {
    const { username } = user;
    socket.join(username); // User joins a room with their username

    try {
      // Check if the user has a default character
      if (user.defaultCharacter) {
        const character = await Character.findById(user.defaultCharacter);
        if (!character) {
          throw new Error('Default character not found in the database');
        }
        console.log('User has a default character:', character);
        socket.emit(eventPool.CHARACTER_JOIN_SUCCESS, { character });
        startGame(socket, character._id.toString()); // Pass the character ID as a string
      } else {
        // User does not have a default character, prompt them to create one
        socket.emit(eventPool.CHARACTER_CREATE, username);
      }
    } catch (error) {
      console.error('Error joining default character:', error);
      socket.emit(eventPool.CHARACTER_JOIN_ERROR, {
        message: 'Could not join default character',
      });
    }    
  };

  socket.on(eventPool.USER_AUTHENTICATE_SUCCESS, async ({ user }) => {
    handleUserAuthenticationSuccess(socket, user);
  });

  // User leaves the game
  socket.on(eventPool.USER_LEAVE, async (username) => {
    try {
      await userQueue.removeUser(username);
      delete socket.user; // Remove user association with the socket
      socket.emit(eventPool.USER_LEAVE, { username });
      io.emit(eventPool.USER_LEAVE, { username });
    } catch (error) {
      console.error('Error removing user:', error);
      socket.emit(eventPool.USER_LEAVE_ERROR, {
        message: 'Could not remove user',
      });
    }
    socket.leave(username); // User leaves their room
  });

  // User creates a character
  socket.on(eventPool.CHARACTER_CREATE, async (currentUser, name, description) => {
    console.log('currentUser:', currentUser);
    console.log('currentUser.user:', currentUser.user);
    const { username } = currentUser.user;
    const characterData = { name, description };
    console.log('username:', username);
    const charName = characterData.name.name;
    const charDesc = characterData.name.description;
    const newCharData = { name: charName, description: charDesc };
    console.log('newChatData:', newCharData);
    try {
      // Save the character to the database
      const character = await Character.create(newCharData);
      const user = await User.findOneAndUpdate(
        { username },
        {
          $set: {
            defaultCharacter: character._id,
            defaultCharacterName: character.name,
          },
          $push: {
            characters: character._id,
          },
        },
        { new: true },
      );
      console.log(`Character ${character.name} created`);
      socket.emit(eventPool.CHARACTER_CREATE_SUCCESS, { character });
      socket.user = user; // Update the user object stored in the socket

      io.emit(eventPool.CHARACTER_CREATE, character);
    } catch (error) {
      console.error('Error creating character:', error);
      socket.emit(eventPool.CHARACTER_CREATE_ERROR, {
        message: 'Could not create character',
      });
    }
  });
  
  socket.on(eventPool.CHARACTER_JOIN, async (characterId) => {
    try {
      // Find the character in the database
      const character = await Character.findById(characterId);
      if (!character) {
        throw new Error('Character not found in the database');
      }
      console.log('Character joined');
      socket.emit(eventPool.CHARACTER_JOIN_SUCCESS, { character });
      startGame(socket, characterId); // Call the startGame function and pass the socket and characterId
    } catch (error) {
      console.error('Error joining character:', error);
      socket.emit(eventPool.CHARACTER_JOIN_ERROR, {
        message: 'Could not join character',
      });
    }
  });
  

  // Character leaves the game
  socket.on(eventPool.CHARACTER_LEAVE, async (characterId) => {
    try {
      // Remove the character from the database
      await Character.findByIdAndRemove(characterId);
      socket.emit(eventPool.CHARACTER_LEAVE_SUCCESS, { characterId });
      io.emit(eventPool.CHARACTER_LEAVE, { characterId });
    } catch (error) {
      console.error('Error leaving character:', error);
      socket.emit(eventPool.CHARACTER_LEAVE_ERROR, {
        message: 'Could not leave character',
      });
    }
  });

  const conversationHistories = new Map();

  const getOpenAIResponse = async (action, characterId) => {
    try {
      let conversationHistory = conversationHistories.get(characterId);
      if (!conversationHistory) {
        conversationHistory = [];
        conversationHistories.set(characterId, conversationHistory);
      }
      const prompt = `Action: ${action}`;
      conversationHistory.push(prompt);
  
      const fullPrompt = conversationHistory.join('\n');
  
      const response = await openai.createCompletion({
        model: 'text-davinci-003',
        prompt: fullPrompt,
        max_tokens: 10,
        temperature: 0,
      });
      const responseText = response.data.choices[0].text;
      conversationHistory.push(responseText);
  
      return responseText;
    } catch (error) {
      console.error('Error generating action:', error);
    }
  };
  
  
  // Character handlers
  ['ATTACK', 'DEFEND', 'HEAL', 'FLEE'].forEach(action => {
    socket.on(`CHARACTER_ACTION_${action}`, async (characterId) => {
      let character = characterQueue.read(characterId);
      const actionText = `${character.name} ${action.toLowerCase()}. What happens next?`;
      const message = await getOpenAIResponse(actionText);
      if (message) {
        io.emit(`CHARACTER_ACTION_${action}`, { characterId, message });
      } else {
        console.error(`Error performing ${action} action`);
      }
    });
  });

  // Character performs a custom action
  socket.on(eventPool.CHARACTER_ACTION_CUSTOM, async (characterId, customAction) => {
    let character = characterQueue.read(characterId);
    const actionText = `${character.name} ${customAction}. What happens next?`;
    const message = await getOpenAIResponse(actionText);
    if (message) {
      io.emit(eventPool.CHARACTER_ACTION_CUSTOM, { characterId, message });
    } else {
      console.error('Error performing custom action');
    }
  });


  socket.on('disconnect', () => {
    console.log(colors.yellow(`CLIENT DISCONNECTED FROM SERVER: ${socket.id}`));
    const rooms = Array.from(socket.rooms);
    rooms.forEach((roomName) => {
      if (roomName !== socket.id) {
        socket.leave(roomName);
        io.emit('ROOM_LEAVE', { roomName });
      }
    });
  
    if (socket.user) {
      const { username } = socket.user;
      socket.leave(username); // User leaves their room on disconnect
      userQueue.removeUser(username);
      io.emit(eventPool.USER_LEAVE, { username });
      conversationHistories.delete(username); // Clear the conversation history
    }
  });
});