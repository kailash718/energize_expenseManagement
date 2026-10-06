import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_university_expense_key_2026_xyz', {
    expiresIn: '30d',
  });
};

// @desc Login user & get token
// @route POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email }).populate('departmentId');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.departmentId,
        designation: user.designation,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login', error: error.message });
  }
};

// @desc Quick demo login by role
// @route POST /api/auth/demo-login
export const demoLogin = async (req, res) => {
  try {
    const { role } = req.body;
    let query = { role };
    if (role === 'faculty') {
      // Find Dr. Arun Kumar
      query = { email: 'arun.kumar@university.edu' };
    } else if (role === 'hod') {
      // Find CS HOD
      query = { email: 'hod.cs@university.edu' };
    } else if (role === 'finance') {
      query = { email: 'finance@university.edu' };
    } else if (role === 'registrar') {
      query = { email: 'registrar@university.edu' };
    } else if (role === 'admin') {
      query = { email: 'admin@university.edu' };
    }

    let user = await User.findOne(query).populate('departmentId');
    if (!user) {
      user = await User.findOne({ role }).populate('departmentId');
    }

    if (!user) {
      return res.status(404).json({ message: `No user found for role ${role}` });
    }

    const token = generateToken(user._id);
    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        employeeId: user.employeeId,
        department: user.departmentId,
        designation: user.designation,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Demo login failed', error: error.message });
  }
};

// @desc Get current user profile
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password').populate('departmentId');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// @desc Get all users (for assignment & admin)
// @route GET /api/auth/users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').populate('departmentId');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};
