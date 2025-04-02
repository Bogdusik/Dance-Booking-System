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
const removeUser = find(userDb.remove).bind(userDb);
const findAllUsers = find(userDb.find).bind(userDb);
const removeEnrolments = find(enrolmentDb.remove).bind(enrolmentDb);
const insertUser = find(userDb.insert).bind(userDb);

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
    if (!course) {
      req.flash('error_msg', 'Course not found.');
      return res.redirect('/organiser/dashboard');
    }

    await insertClass({ courseId: course._id, date, time, location, price, description });
    res.redirect('/organiser/dashboard');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to add class.');
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

exports.listParticipants = (req, res) => {
  const { classId } = req.params;

  classDb.findOne({ _id: classId }, (err, cls) => {
    if (!cls) return res.status(404).send('Class not found');

    courseDb.findOne({ _id: cls.courseId }, (err, course) => {
      const duration = course?.duration || 'N/A';
      const courseName = course?.name || 'Unknown Course';
      res.render('manage_course', { cls, duration, courseName });
    });
  });
};

exports.fullClassList = (req, res) => {
  classDb.find({}, async (err, classes) => {
    if (err) return res.status(500).send('Error fetching classes');
    if (!classes || classes.length === 0) return res.render('class_list', { classes: [] });

    try {
      const enriched = await Promise.all(
        classes.map(async cls => {
          const [course, enrolments] = await Promise.all([
            new Promise(resolve => courseDb.findOne({ _id: cls.courseId }, (e, c) => resolve(c))),
            new Promise(resolve => enrolmentDb.find({ classId: cls._id }, (e, r) => resolve(r)))
          ]);

          const participants = (enrolments || []).map(({ name, email, phone }) => ({ name, email, phone }));

          return {
            ...cls,
            courseName: course?.name || 'Unknown',
            participants
          };
        })
      );

      res.render('class_list', { classes: enriched });
    } catch (e) {
      console.error(e);
      res.status(500).send('Failed to load class list');
    }
  });
};

exports.manageUsers = async (req, res) => {
  try {
    const allUsers = await findAllUsers({});
    const organisers = allUsers
      .filter(u => u.role === 'organiser')
      .map(u => ({
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
    if (!user) {
      req.flash('error_msg', 'User not found.');
      return res.redirect('/organiser/users');
    }

    const userEmail = user.email;
    await removeUser({ _id: req.params.id });

    if (userEmail) {
      await removeEnrolments({ email: userEmail }, { multi: true });
      req.flash('success_msg', 'User and enrolments deleted.');
    } else {
      req.flash('success_msg', 'User deleted (no enrolments).');
    }

    res.redirect('/organiser/users');
  } catch (err) {
    console.error(err);
    req.flash('error_msg', 'Failed to delete user.');
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