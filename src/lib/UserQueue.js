const { v4: uuidv4 } = require('uuid');

class UserQueue {
  constructor() {
    this.users = [];
  }

  findUserByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  createUser(username) {
    const existingUser = this.findUserByUsername(username);
    if (existingUser) {
      return existingUser; // Return the existing user if found
    }

    const user = {
      id: uuidv4(),
      username: username,
    };
    this.users.push(user);
    return user;
  }

  removeUser(username) {
    const index = this.users.findIndex(user => user.username === username);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }
}

module.exports = { UserQueue };
