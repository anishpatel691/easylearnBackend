import jwt from 'jsonwebtoken';

import User from '../Models/user.model.js';

// Register User
export const registerUser = async (req, res) => {
  try {

    const { name, email, password ,role } = req.body;
    console.log("Incoming Data:", req.body);
    console.log("Incoming Data:", req.name); // Debugging
     // Debugging

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const user = new User({ name, email, password ,role });
    await user.save();

    res.status(201).json({ message: 'User registered successfully', user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
//LOGIN CONTROLLER
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user ) {
      return res.status(401).json({ message: 'Invalid Email address' });
    }
    if ( user.password !== password) {
      return res.status(401).json({ message: 'Invalid Password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '1d' } // Token validity: 1 day
    );

    // Set the token in an HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true, // Prevent client-side JS access
      secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
      maxAge: 3600000, // 1 hour in milliseconds
    });

    res.json({ message: 'Login successful' ,user,LoginSataus:true,token});
    console.log('Generated JWT Token:', token);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password'); // Avoid sending password

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};


// Controller method to update user password - without password hashing
export const updatePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;

    // Validate input
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password (direct comparison instead of bcrypt)
    if (currentPassword !== user.password) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }


    // Update user's password without hashing
    user.password = newPassword;
    user.passwordUpdatedAt = new Date();
    await user.save();

    // Send success response
    return res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password update error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
