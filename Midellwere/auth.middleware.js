import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

export const verifyToken = (req, res, next) => {
  // Get token from Authorization header or cookies
  const token = req.header('Authorization')?.split(' ')[1] || req.cookies?.token;

  if (!token) {
    return res.status(401).json({ message: 'Access denied.  No token provided.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Attach user info to request object
    next();
  } catch (err) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};
export const verifyInstructor = (req, res, next) => {
    if (req.user.role === 'instructor') {
      return res.status(403).json({ message: 'Access denied. Instructor only.' });
    }
    try {
        const verified = jwt.verify(token, JWT_SECRET);
        req.instructor = verified; // Attach user info to request object
        next();
      } catch (err) {
        res.status(400).json({ message: 'Invalid token.' });
      }    
  };
  