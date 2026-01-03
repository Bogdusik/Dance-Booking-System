const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const util = require('util');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/errorHandler');

const findCourse = util.promisify(courseDb.findOne).bind(courseDb);
const findCourses = util.promisify(courseDb.find).bind(courseDb);
const findClasses = util.promisify(classDb.find).bind(classDb);
const findEnrolments = util.promisify(enrolmentDb.find).bind(enrolmentDb);

exports.getCourses = asyncHandler(async (req, res) => {
  try {
    const courses = await findCourses({});
    res.render('courses', { courses });
  } catch (err) {
    logger.error('Failed to fetch courses', { error: err.message });
    throw err;
  }
});

exports.getCourseDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.session.user?.role === 'organiser';

  try {
    const course = await findCourse({ _id: id });
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const classes = await findClasses({ courseId: id });
    classes.sort((a, b) => {
      const dateA = new Date(`${a.date} ${a.time}`);
      const dateB = new Date(`${b.date} ${b.time}`);
      return dateA - dateB;
    });

    const enrolments = await findEnrolments({ courseId: id });
    const participants = enrolments.map(({ name, email, phone }) =>
      isAdmin ? { name, email, phone } : { name }
    );

    res.render('course_detail', {
      course,
      classes,
      participants
    });
  } catch (err) {
    logger.error('Failed to load course details', { error: err.message, courseId: id });
    throw err;
  }
});