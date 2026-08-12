import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Generate a signed JWT for a given user ID.
 * Reads JWT_SECRET from the environment — no insecure fallback.
 * Tokens expire after 30 days.
 */
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('Server misconfiguration: JWT_SECRET is not defined');
  }
  return jwt.sign({ id }, secret, { expiresIn: '30d' });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Please add all fields');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const user = await User.create({ name, email, password });

  if (user) {
    // toAuthJSON is an instance method on the User model (schema modeling demo)
    res.status(201).json(user.toAuthJSON(generateToken(user._id)));
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Explicitly select password back in (it has select:false on the schema)
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.matchPassword(password))) {
    res.json(user.toAuthJSON(generateToken(user._id)));
  } else {
    res.status(401);
    throw new Error('Invalid credentials');
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  res.status(200).json(req.user.toAuthJSON(generateToken(req.user._id)));
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.name = req.body.name || user.name;
  user.theme = req.body.theme || user.theme;
  if (req.body.monthlyBudget !== undefined) {
    user.monthlyBudget = req.body.monthlyBudget;
  }
  // Update nested preferences sub-document fields if provided
  if (req.body.preferences) {
    user.preferences = { ...user.preferences.toObject(), ...req.body.preferences };
  }

  const updatedUser = await user.save();
  res.json(updatedUser.toAuthJSON(generateToken(updatedUser._id)));
};

// @desc    Delete user profile
// @route   DELETE /api/auth/profile
// @access  Private
export const deleteUser = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    await User.findByIdAndDelete(req.user._id);
    res.status(200).json({ message: 'User deleted successfully' });
  } else {
    res.status(404);
    throw new Error('User not found');
  }
};
