const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const util = require('util');

const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const userDb = require('../models/userModel');
const enrolmentDb = require('../models/enrolmentModel');

const find = util.promisify;
const findCourses = find(courseDb.find).bind(courseDb);
const findClasses = find(classDb.find).bind(classDb);
const insertCourse = find(courseDb.insert).bind(courseDb);
const insertClass = find(classDb.insert).bind(classDb);
const findCourseById = find(courseDb.findOne).bind(courseDb);
const findClassById = find(classDb.findOne).bind(classDb);
const updateClass = find(classDb.update).bind(classDb);
const findUserById = find(userDb.findOne).bind(userDb);
const findAllUsers = find(userDb.find).bind(userDb);
const insertUser = find(userDb.insert).bind(userDb);

const removeUser = userDb.remove;
const removeEnrolments = enrolmentDb.remove;

exports.validateCourse = [
  body('name').trim().notEmpty().withMessage('Course name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('duration').notEmpty().withMessage('Duration is required'),
];

exports.validateClass = [
  body('courseId').notEmpty().withMessage('Course ID is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('price').notEmpty().withMessage('Price is required'),
];

exports.validateRegister = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 5 }).withMessage('Password must be at least 5 characters'),
  body('role').isIn(['user', 'organiser']).withMessage('Invalid role selected'),
];

const handleValidation = (req, res, redirectPath) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    req.flash('error_msg', errors.array()[0].msg);
    res.redirect(redirectPath);
    return true;
  }
  return false;
};

exports.dashboard = async (req, res) => {
  try {
    const [courses, classes] = await Promise.all([
      findCourses({}),
      findClasses({})
    ]);
    res.render('dashboard', { courses, classes });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load dashboard.');
    res.redirect('/');
  }
};

exports.addCourse = async (req, res) => {
  if (handleValidation(req, res, '/organiser/dashboard')) return;
  const { name, description, duration } = req.body;
  try {
    await insertCourse({ name, description, duration });
    res.redirect('/organiser/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add course.');
    res.redirect('/organiser/dashboard');
  }
};

exports.addClass = async (req, res) => {
  if (handleValidation(req, res, '/organiser/dashboard')) return;
  const { courseId, date, time, location, price, description } = req.body;
  try {
    const course = await findCourseById({ _id: courseId });
    if (!course) throw new Error('Course not found');

    await insertClass({ courseId: course._id, date, time, location, price, description });
    res.redirect('/organiser/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', err.message || 'Failed to add class.');
    res.redirect('/organiser/dashboard');
  }
};

exports.editClassForm = async (req, res) => {
  try {
    const cls = await findClassById({ _id: req.params.id });
    if (!cls) return res.redirect('/organiser/dashboard');
    res.render('edit_class', { cls });
  } catch (err) {
    console.error(err);
    res.redirect('/organiser/dashboard');
  }
};

exports.updateClass = async (req, res) => {
  if (handleValidation(req, res, '/organiser/dashboard')) return;
  const { date, time, location, price, description } = req.body;
  try {
    await updateClass({ _id: req.params.id }, {
      $set: { date, time, location, price, description }
    });
    res.redirect('/organiser/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to update class.');
    res.redirect('/organiser/dashboard');
  }
};

exports.listParticipants = async (req, res) => {
  try {
    const cls = await findClassById({ _id: req.params.classId });
    if (!cls) return res.status(404).send('Class not found');

    const course = await findCourseById({ _id: cls.courseId });
    res.render('manage_course', {
      cls,
      duration: course?.duration || 'N/A',
      courseName: course?.name || 'Unknown Course'
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading participants');
  }
};

exports.fullClassList = async (req, res) => {
  try {
    const classes = await findClasses({});
    const enriched = await Promise.all(classes.map(async cls => {
      const course = await findCourseById({ _id: cls.courseId });
      const enrolments = await util.promisify(enrolmentDb.find).bind(enrolmentDb)({ classId: cls._id });

      return {
        ...cls,
        courseName: course?.name || 'Unknown',
        participants: enrolments.map(({ name, email, phone }) => ({ name, email, phone }))
      };
    }));

    res.render('class_list', { classes: enriched });
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to load class list');
  }
};

exports.manageUsers = async (req, res) => {
  try {
    const allUsers = await findAllUsers({});
    const organisers = allUsers.filter(u => u.role === 'organiser').map(u => ({
      ...u,
      isSelf: req.session.user?._id === u._id
    }));
    const users = allUsers.filter(u => u.role === 'user');
    res.render('manage_users', { organisers, users });
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to load users');
    res.redirect('/organiser/dashboard');
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const user = await findUserById({ _id: req.params.id });
    if (!user) throw new Error('User not found');

    await removeUser({ _id: req.params.id }, {});

    if (user.email) {
      const enrolments = await util.promisify(enrolmentDb.find).bind(enrolmentDb)({ email: user.email });
      await Promise.all(enrolments.map(e =>
        util.promisify(enrolmentDb.remove).bind(enrolmentDb)({ _id: e._id }, {})
      ));
    }

    req.flash('success_msg', 'User deleted successfully.');
    res.redirect('/organiser/users');
  } catch (err) {
    console.error('Delete user failed:', err);
    req.flash('error_msg', err.message || 'Failed to delete user.');
    res.redirect('/organiser/users');
  }
};

exports.register = async (req, res) => {
  if (handleValidation(req, res, '/auth/register')) return;
  const { username, password, role } = req.body;
  try {
    const existingUser = await userDb.findOne({ username });
    if (existingUser) {
      req.flash('error_msg', 'Username already exists.');
      return res.redirect('/auth/register');
    }

    const hash = await bcrypt.hash(password, 10);
    await insertUser({ username, password: hash, role });

    req.flash('success_msg', 'User registered');
    res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Registration failed.');
    res.redirect('/auth/register');
  }
};