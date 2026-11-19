const bcrypt = require('bcryptjs');
const util = require('util');
const logger = require('../utils/logger');
const { formatClass, byDateTime, initials, summariseCourse } = require('../utils/format');
const { asyncHandler } = require('../middlewares/errorHandler');

const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const userDb = require('../models/userModel');
const enrolmentDb = require('../models/enrolmentModel');

const promisify = util.promisify;
const findCourses = promisify(courseDb.find).bind(courseDb);
const findClasses = promisify(classDb.find).bind(classDb);
const insertCourse = promisify(courseDb.insert).bind(courseDb);
const insertClass = promisify(classDb.insert).bind(classDb);
const findCourseById = promisify(courseDb.findOne).bind(courseDb);
const findClassById = promisify(classDb.findOne).bind(classDb);
const updateClass = promisify(classDb.update).bind(classDb);
const findUserById = promisify(userDb.findOne).bind(userDb);
const findAllUsers = promisify(userDb.find).bind(userDb);
const insertUser = promisify(userDb.insert).bind(userDb);
const removeCourse = promisify(courseDb.remove).bind(courseDb);
const removeCourseClasses = promisify(classDb.remove).bind(classDb);
const removeUser = userDb.remove;
const findEnrolments = promisify(enrolmentDb.find).bind(enrolmentDb);
const removeClassEnrolments = promisify(enrolmentDb.remove).bind(enrolmentDb);

exports.dashboard = asyncHandler(async (req, res) => {
  const [courses, classes, enrolments] = await Promise.all([
    findCourses({}),
    findClasses({}),
    findEnrolments({})
  ]);
  courses.sort((a, b) => a.name.localeCompare(b.name));
  const names = new Map(courses.map(c => [c._id, c.name]));
  const counts = enrolments.reduce((acc, e) => acc.set(e.classId, (acc.get(e.classId) || 0) + 1), new Map());
  logger.debug('Dashboard loaded', { coursesCount: courses.length, classesCount: classes.length });
  res.render('dashboard', {
    courses: courses.map((course, i) => summariseCourse(course, classes, i)),
    classes: classes.sort(byDateTime).map(cls => ({
      ...formatClass(cls),
      courseName: names.get(cls.courseId) || 'Unknown course',
      enrolled: counts.get(cls._id) || 0
    })),
    stats: { courses: courses.length, classes: classes.length, enrolments: enrolments.length }
  });
});

exports.addCourse = asyncHandler(async (req, res) => {
  const { name, description, duration } = req.body;
  const course = await insertCourse({ name, description, duration });
  logger.info('Course added', { courseId: course._id, name });
  req.flash('success_msg', 'Course added successfully.');
  res.redirect('/organiser/dashboard');
});

exports.deleteCourse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const classes = await findClasses({ courseId: id });
  await Promise.all(classes.map(cls => removeClassEnrolments({ classId: cls._id }, { multi: true })));
  await removeCourseClasses({ courseId: id }, { multi: true });
  await removeCourse({ _id: id }, {});
  logger.info('Course deleted with cascade', { courseId: id, classesRemoved: classes.length });
  req.flash('success_msg', 'Course deleted successfully.');
  res.redirect('/organiser/dashboard');
});

exports.addClass = asyncHandler(async (req, res) => {
  const { courseId, date, time, location, price, description } = req.body;
  const course = await findCourseById({ _id: courseId });
  if (!course) {
    logger.warn('Attempt to add class to non-existent course', { courseId });
    req.flash('error_msg', 'Course not found.');
    return res.redirect('/organiser/dashboard');
  }
  const newClass = await insertClass({ courseId: course._id, date, time, location, price, description });
  logger.info('Class added', { classId: newClass._id, courseId, date, time });
  req.flash('success_msg', 'Class added successfully.');
  res.redirect('/organiser/dashboard');
});

exports.editClassForm = asyncHandler(async (req, res) => {
  try {
    const cls = await findClassById({ _id: req.params.id });
    if (!cls) {
      req.flash('error_msg', 'Class not found');
      return res.redirect('/organiser/dashboard');
    }
    const course = await findCourseById({ _id: cls.courseId });
    res.render('edit_class', { cls, courseName: course?.name || 'Unknown course' });
  } catch (err) {
    logger.error('Failed to load class for editing', { error: err.message, classId: req.params.id });
    throw err;
  }
});

exports.updateClass = asyncHandler(async (req, res) => {
  const { date, time, location, price, description } = req.body;
  await updateClass({ _id: req.params.id }, {
    $set: { date, time, location, price, description }
  });
  logger.info('Class updated', { classId: req.params.id });
  req.flash('success_msg', 'Class updated successfully.');
  res.redirect('/organiser/dashboard');
});

exports.listParticipants = asyncHandler(async (req, res) => {
  const cls = await findClassById({ _id: req.params.classId });
  if (!cls) {
    const error = new Error('Class not found');
    error.statusCode = 404;
    throw error;
  }

  const [course, enrolments] = await Promise.all([
    findCourseById({ _id: cls.courseId }),
    findEnrolments({ classId: cls._id })
  ]);

  const participants = enrolments.map(({ name, email, phone }) => ({ name, email, phone, initials: initials(name) }));
  res.render('manage_course', {
    cls: {
      ...formatClass(cls),
      participants
    },
    hasParticipants: participants.length > 0,
    duration: course?.duration || 'N/A',
    courseName: course?.name || 'Unknown Course'
  });
});


exports.fullClassList = asyncHandler(async (req, res) => {
  const [classes, allCourses, allEnrolments] = await Promise.all([
    findClasses({}),
    findCourses({}),
    findEnrolments({})
  ]);

  const courseMap = new Map(allCourses.map(c => [c._id, c]));
  const enrolmentsByClass = allEnrolments.reduce((acc, e) => {
    if (!acc[e.classId]) acc[e.classId] = [];
    acc[e.classId].push(e);
    return acc;
  }, {});

  const enriched = classes.sort(byDateTime).map(cls => {
    const participants = (enrolmentsByClass[cls._id] || []).map(({ name, email, phone }) => ({
      name, email, phone, initials: initials(name)
    }));
    return {
      ...formatClass(cls),
      courseName: courseMap.get(cls.courseId)?.name || 'Unknown',
      participants,
      hasParticipants: participants.length > 0,
      countLabel: participants.length === 1 ? '1 dancer' : `${participants.length} dancers`
    };
  });

  res.render('class_list', { classes: enriched });
});

exports.manageUsers = asyncHandler(async (req, res) => {
  const allUsers = await findAllUsers({});
  allUsers.sort((a, b) => a.username.localeCompare(b.username));
  const organisers = allUsers.filter(u => u.role === 'organiser').map(u => ({
    ...u,
    initials: initials(u.username),
    isSelf: req.session.user?._id === u._id
  }));
  const users = allUsers.filter(u => u.role === 'user').map(u => ({ ...u, initials: initials(u.username) }));
  res.render('manage_users', { organisers, users, hasUsers: users.length > 0 });
});

exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await findUserById({ _id: req.params.id });
  if (!user) {
    req.flash('error_msg', 'User not found.');
    return res.redirect('/organiser/users');
  }

  await removeUser({ _id: req.params.id }, {});
  logger.info('User deleted', { userId: req.params.id });
  req.flash('success_msg', 'User deleted successfully.');
  res.redirect('/organiser/users');
});