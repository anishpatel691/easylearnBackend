import jwt from 'jsonwebtoken';
import User from '../Models/user.model.js';

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret_key');

    // Find user by id (excluding password)
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    // Add user info to request object
    req.user = user;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
  }
};

// Middleware to check if user is an admin
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.usertype === 'admin') {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
  }
};

// Middleware to check if user is an instructor or admin
export const isInstructor = (req, res, next) => {
  if (req.user && (req.user.usertype === 'instructor' || req.user.usertype === 'admin')) {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Instructor privileges required.',
    });
  }
};
