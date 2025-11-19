const jwt = require('jsonwebtoken');
const { readDB } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    
    const db = readDB();
    const user = (db.users || []).find(u => u.id === decoded.userId && u.email === decoded.email);
    
    if (!user || !user.isActive) {
      return res.status(403).json({ message: 'User not found or deactivated' });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to ensure user can only access their own data
const userDataAccess = (req, res, next) => {
  // This middleware ensures that all data operations are scoped to the authenticated user
  // We'll modify the database operations to include user filtering
  req.userId = req.user.id;
  next();
};

module.exports = {
  authenticateToken,
  userDataAccess
};
