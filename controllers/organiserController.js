const bcrypt = require('bcryptjs');
const util = require('util');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/errorHandler');

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
const removeCourse = courseDb.remove;
const removeClass = classDb.remove;
const removeUser = userDb.remove;
const removeEnrolments = enrolmentDb.remove;

exports.dashboard = asyncHandler(async (req, res) => {
  try {
    const [courses, classes] = await Promise.all([
      findCourses({}),
      findClasses({})
    ]);
    logger.debug('Dashboard loaded', { coursesCount: courses.length, classesCount: classes.length });
    res.render('dashboard', { courses, classes });
  } catch (err) {
    logger.error('Failed to load dashboard', { error: err.message });
    req.flash('error_msg', 'Failed to load dashboard.');
    res.redirect('/');
    throw err;
  }
});

exports.addCourse = asyncHandler(async (req, res) => {
  const { name, description, duration } = req.body;
  try {
    const course = await insertCourse({ name, description, duration });
    logger.info('Course added', { courseId: course._id, name });
    req.flash('success_msg', 'Course added successfully.');
    res.redirect('/organiser/dashboard');
  } catch (err) {
    logger.error('Failed to add course', { error: err.message, name });
    req.flash('error_msg', 'Failed to add course.');
    res.redirect('/organiser/dashboard');
    throw err;
  }
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await removeCourse({ _id: id }, {});
    logger.info('Course deleted', { courseId: id });
    req.flash('success_msg', 'Course deleted successfully.');
    res.redirect('/organiser/dashboard');
  } catch (err) {
    logger.error('Failed to delete course', { error: err.message, courseId: id });
    req.flash('error_msg', 'Failed to delete course.');
    res.redirect('/organiser/dashboard');
    throw err;
  }
});

exports.addClass = asyncHandler(async (req, res) => {
  const { courseId, date, time, location, price, description } = req.body;
  try {
    const course = await findCourseById({ _id: courseId });
    if (!course) {
      logger.warn('Attempt to add class to non-existent course', { courseId });
      throw new Error('Course not found');
    }

    const newClass = await insertClass({ courseId: course._id, date, time, location, price, description });
    logger.info('Class added', { classId: newClass._id, courseId, date, time });
    req.flash('success_msg', 'Class added successfully.');
    res.redirect('/organiser/dashboard');
  } catch (err) {
    logger.error('Failed to add class', { error: err.message, courseId });
    req.flash('error_msg', err.message || 'Failed to add class.');
    res.redirect('/organiser/dashboard');
    throw err;
  }
});

exports.editClassForm = asyncHandler(async (req, res) => {
  try {
    const cls = await findClassById({ _id: req.params.id });
    if (!cls) {
      req.flash('error_msg', 'Class not found');
      return res.redirect('/organiser/dashboard');
    }
    res.render('edit_class', { cls });
  } catch (err) {
    logger.error('Failed to load class for editing', { error: err.message, classId: req.params.id });
    throw err;
  }
});

exports.updateClass = asyncHandler(async (req, res) => {
  const { date, time, location, price, description } = req.body;
  try {
    await updateClass({ _id: req.params.id }, {
      $set: { date, time, location, price, description }
    });
    logger.info('Class updated', { classId: req.params.id });
    req.flash('success_msg', 'Class updated successfully.');
    res.redirect('/organiser/dashboard');
  } catch (err) {
    logger.error('Failed to update class', { error: err.message, classId: req.params.id });
    req.flash('error_msg', 'Failed to update class.');
    res.redirect('/organiser/dashboard');
    throw err;
  }
});

exports.listParticipants = asyncHandler(async (req, res) => {
  try {
    const cls = await findClassById({ _id: req.params.classId });
    if (!cls) {
      const error = new Error('Class not found');
      error.statusCode = 404;
      throw error;
    }

    const course = await findCourseById({ _id: cls.courseId });
    res.render('manage_course', {
      cls,
      duration: course?.duration || 'N/A',
      courseName: course?.name || 'Unknown Course'
    });
  } catch (err) {
    logger.error('Failed to load participants', { error: err.message, classId: req.params.classId });
    throw err;
  }
});

const findEnrolments = util.promisify(enrolmentDb.find).bind(enrolmentDb);

exports.fullClassList = asyncHandler(async (req, res) => {
  try {
    const classes = await findClasses({});
    const enriched = await Promise.all(classes.map(async cls => {
      const course = await findCourseById({ _id: cls.courseId });
      const enrolments = await findEnrolments({ classId: cls._id });

      return {
        ...cls,
        courseName: course?.name || 'Unknown',
        participants: enrolments.map(({ name, email, phone }) => ({ name, email, phone }))
      };
    }));

    res.render('class_list', { classes: enriched });
  } catch (err) {
    logger.error('Failed to load class list', { error: err.message });
    throw err;
  }
});

exports.manageUsers = asyncHandler(async (req, res) => {
  try {
    const allUsers = await findAllUsers({});
    const organisers = allUsers.filter(u => u.role === 'organiser').map(u => ({
      ...u,
      isSelf: req.session.user?._id === u._id
    }));
    const users = allUsers.filter(u => u.role === 'user');
    res.render('manage_users', { organisers, users });
  } catch (err) {
    logger.error('Failed to load users', { error: err.message });
    req.flash('error_msg', 'Failed to load users');
    res.redirect('/organiser/dashboard');
    throw err;
  }
});

const findEnrolmentsByEmail = util.promisify(enrolmentDb.find).bind(enrolmentDb);
const removeEnrolment = util.promisify(enrolmentDb.remove).bind(enrolmentDb);

exports.deleteUser = asyncHandler(async (req, res) => {
  try {
    const user = await findUserById({ _id: req.params.id });
    if (!user) {
      throw new Error('User not found');
    }

    await removeUser({ _id: req.params.id }, {});

    if (user.email) {
      const enrolments = await findEnrolmentsByEmail({ email: user.email });
      await Promise.all(enrolments.map(e => removeEnrolment({ _id: e._id }, {})));
    }

    logger.info('User deleted', { userId: req.params.id });
    req.flash('success_msg', 'User deleted successfully.');
    res.redirect('/organiser/users');
  } catch (err) {
    logger.error('Failed to delete user', { error: err.message, userId: req.params.id });
    req.flash('error_msg', err.message || 'Failed to delete user.');
    res.redirect('/organiser/users');
    throw err;
  }
});