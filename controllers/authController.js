const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const util = require('util');
const userDb = require('../models/userModel');

const findUser = util.promisify(userDb.findOne).bind(userDb);
const insertUser = util.promisify(userDb.insert).bind(userDb);

const redirectWithError = (req, res, path, msg) => {
  req.flash('error_msg', msg);
  res.redirect(path);
};

const handleValidation = (req, res, path) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return redirectWithError(req, res, path, errors.array()[0].msg);
  }
  return null;
};

exports.validateRegister = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
  body('role').isIn(['user', 'organiser']).withMessage('Invalid role selected'),
];

exports.validateLogin = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.register = async (req, res) => {
  if (handleValidation(req, res, '/auth/register')) return;

  const { username, password, role } = req.body;

  try {
    const existingUser = await findUser({ username });
    if (existingUser) return redirectWithError(req, res, '/auth/register', 'Username already exists.');

    const hash = await bcrypt.hash(password, 10);
    await insertUser({ username, password: hash, role });

    req.flash('success_msg', 'User registered successfully');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    redirectWithError(req, res, '/auth/register', 'Server error');
  }
};

exports.login = async (req, res) => {
  if (handleValidation(req, res, '/auth/login')) return;

  const { username, password } = req.body;

  try {
    const user = await findUser({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return redirectWithError(req, res, '/auth/login', 'Invalid credentials');
    }

    req.session.user = user;
    res.redirect('/');
  } catch (err) {
    console.error(err);
    redirectWithError(req, res, '/auth/login', 'Server error');
  }
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect('/'));
};