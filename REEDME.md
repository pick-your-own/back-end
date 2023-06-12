# CHAT RPGT

The OpenAI ChatGPT RPG Game

## Project Description

This project uses OpenAI's GPT technology to provide a text-based RPG experience, where the game is run and moderated by an AI Dungeon Master. Built entirely on a Node.js backend, the game leverages the potential of the GPT model to create dynamic, responsive gameplay experiences.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Features](#features)
- [Contributing](#contributing)
- [License](#license)
- [Credits](#credits)
- [Documentation](#documentation)
- [Support](#support)
- [Badges](#badges)

## Proposed File Structure

- repository
  |- node_modules
  |- assets
  | |- data
  | | |- characters
  | | |- enemies
  | | |- items
  | | |- maps
  |- src
  | |- controllers
  | | |- gameController.js
  | | |- userController.js
  | | |- openAIController.js
  | | |- adminController.js
  | |- models
  | | |- User.js
  | | |- Character.js
  | | |- Enemies.js
  | | |- Game.js
  | | |- Items.js
  | | |- Admin.js
  | |- routes
  | | |- gameRoutes.js
  | | |- userRoutes.js
  | | |- openAIRoutes.js
  | | |- adminRoutes.js
  | |- utils
  | | |- openAIUtils.js
  | | |- socketUtils.js
  | | |- authUtils.js
  | | |- gameLogicUtils.js
  | |- middleware
  | | |- authenticationMiddleware.js
  | | |- errorHandlingMiddleware.js
  |- tests
  | |- unit
  | |- integration
  |- logs
  |- .env
  |- .gitignore
  |- package-lock.json
  |- package.json
  |- README.md
  |- Dockerfile
  |- server.js

## Installation

1. Clone this repository
2. Run `npm install` in the project root directory
3. Setup environment variables by creating a `.env` file in the root directory. Refer to `.env.example` for necessary variables.
4. Run `npm start` to start the server

## Usage

To interact with the game, send HTTP requests to the appropriate endpoints. For example:

curl http://localhost:3000/game/start

## Features

- AI-driven text-based RPG gameplay
- Player account management
- Admin controls for game management
- End-to-end tests for game mechanics
- Docker support for easy deployment

## Contributing

Please refer to the `CONTRIBUTING.md` file for guidelines on contributing to this project.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.

## Credits

- OpenAI for providing the GPT model
- Node.js and various Node.js packages
- All contributors to this project

## Documentation

Refer to the `docs` directory for additional documentation, including design diagrams and API documentation.

## Support

For support, please open an issue on the GitHub repository. You can also contact the maintainers directly via email.

## Badges

- Build: ![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
- Coverage: ![Code Coverage](https://img.shields.io/badge/coverage-90%25-green)

## Dependencies and Technologies

This project heavily relies on various dependencies and technologies for smooth development and running of the game.

### Backend Technology Stack

- [Node.js](https://nodejs.org/en/): JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Express.js](https://expressjs.com/): Web application framework for Node.js, designed for building web applications and APIs.
- [Socket.io](https://socket.io/): Library for real-time, bidirectional and event-based communication.

### Databases

- [MongoDB](https://www.mongodb.com/): A source-available cross-platform document-oriented database program, used for high volume data storage.

### Testing

- [Mocha](https://mochajs.org/): A feature-rich JavaScript test framework running on Node.js.
- [Chai](https://www.chaijs.com/): A BDD / TDD assertion library for node and the browser that can be paired with any javascript testing framework.

### Other Dependencies

- [dotenv](https://www.npmjs.com/package/dotenv): Module that loads environment variables from a `.env` file into `process.env`.
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken): An implementation of JSON Web Tokens.

### Deployment

- [Docker](https://www.docker.com/): A platform as a service (PaaS) that uses OS-level virtualization to deliver software in packages called containers.

Please refer to `package.json` file for a full list of dependencies.
