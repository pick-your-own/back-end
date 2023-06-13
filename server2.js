'use strict';

require('dotenv').config();

const { Server } = require('socket.io');
const { eventPool } = require('./eventPool');

const mongoose = require('mongoose');
const UserQueue = require('./lib/UserQueue');

const PORT = process.env.PORT || 3002;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chatApp';

const io = new Server(PORT, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const userQueue = new UserQueue();

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

io.on('connection', (socket) => {
  socket.on('simple_message', (message) => {
    console.log(`Message received from user ${userId}: ${message}`);
  });

  socket.on(eventPool.USER_JOINED, user => {

    io.emit(eventPool.USER_JOINED, userQueue.users);
  });

  socket.on(eventPool.USER_LEFT, userId => {
    try {
      socket.leave(userId);
      socket.emit('USER_LEFT', userId);
      console.log(`User left room ${userId}`);
    } catch (error) {
      console.error('Error leaving chat room:', error);
      socket.emit('leave room error', 'Error leaving chat room');
    }
  });

  socket.on(eventPool.ROOM_CREATED, async (newRoom) => {
    try {
      const newChatRoom = new ChatRoom({
        name: newRoom.name,
        description: newRoom.description,
        color: newRoom.color,
      });

      const savedChatRoom = await newChatRoom.save();
      const newRoomId = savedChatRoom._id;
      socket.join(newRoomId);
      io.emit('ROOM_CREATED', newRoomId);

      console.log(`New room ${newRoomId} created and user joined`);
    } catch (error) {
      console.error('Error creating new chat room:', error);
      socket.emit('create room error', 'Error creating new chat room');
    }
  });

  socket.on(eventPool.SEND_MESSAGE, (roomId, message) => {
    try {
      io.to(roomId).emit('message', message);
      console.log(`New message in room ${roomId}: ${message}`);
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('send message error', 'Error sending message');
    }
  });

  socket.on('disconnect', () => {
    console.log(`CLIENT DISCONNECTED FROM SERVER: ${socket.id}`);
  });
});

console.log(`Server is running on port ${PORT}`);
