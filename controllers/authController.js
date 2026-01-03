const bcrypt = require('bcryptjs');
const util = require('util');
const logger = require('../utils/logger');
const userDb = require('../models/userModel');
const { asyncHandler } = require('../middlewares/errorHandler');

const findUser = util.promisify(userDb.findOne).bind(userDb);
const insertUser = util.promisify(userDb.insert).bind(userDb);

const redirectWithError = (req, res, path, msg) => {
  req.flash('error_msg', msg);
  res.redirect(path);
};

exports.register = asyncHandler(async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const existingUser = await findUser({ username });
    if (existingUser) {
      logger.warn('Registration attempt with existing username', { username });
      return redirectWithError(req, res, '/auth/register', 'Username already exists.');
    }

    const hash = await bcrypt.hash(password, 10);
    await insertUser({ username, password: hash, role });

    logger.info('User registered successfully', { username, role });
    req.flash('success_msg', 'User registered successfully');
    res.redirect('/auth/login');
  } catch (err) {
    logger.error('Registration error', { error: err.message, username });
    redirectWithError(req, res, '/auth/register', 'Server error during registration');
    throw err;
  }
});

exports.login = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await findUser({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      logger.warn('Failed login attempt', { username });
      return redirectWithError(req, res, '/auth/login', 'Invalid credentials');
    }

    req.session.user = user;
    logger.info('User logged in successfully', { username, role: user.role });
    res.redirect('/');
  } catch (err) {
    logger.error('Login error', { error: err.message, username });
    redirectWithError(req, res, '/auth/login', 'Server error during login');
    throw err;
  }
});

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};