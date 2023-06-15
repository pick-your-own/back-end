const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// const { checkPassword } = require('../utils/authUtils');

const checkPassword = async (password, hashedPassword) => {
  console.log('checkPassword', password, hashedPassword);
  
  try {
    const isPasswordMatch = await bcrypt.compare(password, hashedPassword);
    return isPasswordMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    throw error;
  }
};

const register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Check if the username is already taken
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username is already taken' });
    }
    // Check if the email is provided
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }
    // Check if the password is provided
    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword, email, characters: [] });
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Exclude password from the user data sent back in the response
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({ message: 'User registered successfully', user: userResponse, token });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



const login = async (initialPassword, hashPassword, user) => {
  try {
    console.log('user', user);
    console.log('password', initialPassword);
    console.log('user.password', hashPassword);
    user = await User.findById(user._id).populate('characters').populate('defaultCharacter');
    // const updatedUser = await User.findById(user._id).populate('characters');

    if (!user) {
      throw new Error('Authentication failed');
    }

    // Compare passwords
    const isPasswordMatch = await checkPassword(initialPassword, hashPassword);
    if (!isPasswordMatch) {
      throw new Error('Authentication failed');
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Returns an object containing the user and token
    return { user, token };
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};


// const login = async (initialPassword, hashPassword, user) => {
//   try {
//     console.log('user', user);
//     console.log('password', initialPassword);
//     console.log('user.password', hashPassword);
//     // Compare passwords
//     const isPasswordMatch = await checkPassword(initialPassword, hashPassword);
//     return isPasswordMatch;
//   } catch (error) {
//     console.error('Error comparing passwords:', error);
//     throw error;
//   }
// };



const profile = async (req, res) => {
  try {
    const userId = req.userId;

    // Fetch the user data from the database
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  profile,
  checkPassword, // Add the checkPassword function
};
