import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_university_expense_key_2026_xyz');
      req.user = await User.findById(decoded.id).select('-password').populate('departmentId');
      if (!req.user) {
        return res.status(401).json({ message: 'User not found or deactivated' });
      }
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Token is invalid or expired', error: error.message });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Role [${req.user ? req.user.role : 'unauthenticated'}] is not authorized to access this resource`,
      });
    }
    next();
  };
};
