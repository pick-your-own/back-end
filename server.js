'use strict';

require('dotenv').config();

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

let UserQ = new UserQueue();

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

io.on('connection', (socket) => {
  socket.on(eventPool.USER_JOIN, user => {
    console.log('connected');

  });

  socket.on('disconnect', () => {
    console.log(`CLIENT DISCONNECTED FROM SERVER: ${socket.id}`);
  });
});
