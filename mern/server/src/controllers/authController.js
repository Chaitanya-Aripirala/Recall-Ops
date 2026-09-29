const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Send token as HTTP-only cookie + JSON
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user._id);

  const cookieOptions = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };

  res
    .status(statusCode)
    .cookie('recallops_token', token, cookieOptions)
    .json({
      success: true,
      message,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        createdAt: user.createdAt,
      },
    });
};

// ─── POST /api/auth/register ─────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Basic field validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password',
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    // Create user (password hashing is handled by the pre-save hook)
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
    });

    sendTokenResponse(user, 201, res, 'Account created successfully');
  } catch (error) {
    // Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    console.error('[register]', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Explicitly include password (select: false in schema)
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Contact support.',
      });
    }

    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    sendTokenResponse(user, 200, res, 'Login successful');
  } catch (error) {
    console.error('[login]', error);
    res.status(500).json({ success: false, message: 'Server error. Please try again.' });
  }
};

// ─── POST /api/auth/logout ────────────────────────────────────────────────────
exports.logout = async (_req, res) => {
  res
    .cookie('recallops_token', '', { expires: new Date(0), httpOnly: true })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
};

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('[getMe]', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
