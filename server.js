'use strict';

require('dotenv').config();
const chalk = require('chalk');

const { Server } = require('socket.io');
const mongoose = require('mongoose');
const { UserQueue } = require('./src/lib/UserQueue');
const { eventPool } = require('./eventPool');

const PORT = process.env.PORT || 3001;
const MONGODB_URI =
  process.env.MONGODB_URI || 'mongodb://localhost:27017/chatApp';

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

let userQueue = new UserQueue();
let turnId = 1;


mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

io.on('connection', (socket) => {
  socket.on(eventPool.USER_JOIN, user => {
    console.log('Received PLAYER_JOIN event:', user);

    const updatedUser = { ...user, score: 0 }; // Initialize score property to 0
    const addedUser = userQueue.addUser(updatedUser);

    socket.emit(eventPool.UPDATE_USER, addedUser);
    console.log('Sent UPDATE_USER event:', addedUser);

    socket.join('gameRoom');
    console.log(`User ${user.name} joined the game`);

    io.emit(eventPool.USER_JOIN, userQueue.users);

    const clientsInRoom = socket.adapter.rooms.get('dungeonRoom');

    if (clientsInRoom.size >= 2) {
      const payload = {
        turnId: turnId,
        characterStats: user.character.statistics,
      };

      socket.to('dungeonRoom').emit(eventPool.START_GAME, payload);
    }
  });

  socket.on('disconnect', () => {
    console.log(`CLIENT DISCONNECTED FROM SERVER: ${socket.id}`);
  });
});
