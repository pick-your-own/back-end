'use strict';

const { v4: uuidv4 } = require('uuid');

class UserQueue {
  constructor() {
    this.users = [];
  }

  addUser(user) {
    user.id = uuidv4();
    this.users.push(user);
    return user;
  }

  removeUser(userId) {
    this.users = this.users.filter(user => user.id !== userId);
  }

  read(turnId) {
    return this.users.find(user => user.id === turnId);
  }
}

module.exports = {UserQueue};
