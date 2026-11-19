const express = require('express');
const router = express.Router();
const util = require('util');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const courseController = require('../controllers/courseController');
const { validateIdParam, validateEnrolment } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

const courseDb = require('../models/courseModel');
const { formatClass, byDateTime } = require('../utils/format');

const findCourse = util.promisify(courseDb.findOne).bind(courseDb);
const findClasses = util.promisify(classDb.find).bind(classDb);
const findEnrolment = util.promisify(enrolmentDb.findOne).bind(enrolmentDb);
const insertEnrolment = util.promisify(enrolmentDb.insert).bind(enrolmentDb);

router.get('/', courseController.home);

router.get('/courses', courseController.getCourses);

router.get('/course/:id', validateIdParam, courseController.getCourseDetail);

router.get('/enrol/:id', validateIdParam, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const course = await findCourse({ _id: courseId });
  if (!course) {
    const error = new Error('Course not found');
    error.statusCode = 404;
    throw error;
  }
  const selected = req.query.class;
  const classes = (await findClasses({ courseId }))
    .sort(byDateTime)
    .map(cls => ({ ...formatClass(cls), selected: cls._id === selected }));
  res.render('enrol', { course, classes, hasClasses: classes.length > 0 });
}));

router.post('/enrol/:id', validateIdParam, validateEnrolment, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const { name, email, phone, classId } = req.body;

  const existing = await findEnrolment({ classId, email });
  if (existing) {
    req.flash('error_msg', 'You are already enrolled in this class.');
    return res.redirect(`/enrol/${courseId}`);
  }

  await insertEnrolment({ courseId, classId, name, email, phone });
  logger.info('User enrolled successfully', { courseId, classId, email });
  req.flash('success_msg', 'You have successfully enrolled!');
  res.redirect(`/course/${courseId}`);
}));

module.exports = router;