const express = require('express');
const router = express.Router();
const util = require('util');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const courseController = require('../controllers/courseController');
const { validateIdParam, validateEnrolment } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

const findClasses = util.promisify(classDb.find).bind(classDb);
const findEnrolment = util.promisify(enrolmentDb.findOne).bind(enrolmentDb);
const insertEnrolment = util.promisify(enrolmentDb.insert).bind(enrolmentDb);

router.get('/', (req, res) => {
  const isOrganiser = req.session?.user?.role === 'organiser';
  res.render('index', { isOrganiser });
});

router.get('/courses', courseController.getCourses);

router.get('/course/:id', validateIdParam, courseController.getCourseDetail);

router.get('/enrol/:id', validateIdParam, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  try {
    const classes = await findClasses({ courseId });
    res.render('enrol', { course: { _id: courseId }, classes });
  } catch (err) {
    logger.error('Failed to fetch classes for enrolment', { error: err.message, courseId });
    throw err;
  }
}));

router.post('/enrol/:id', validateIdParam, validateEnrolment, asyncHandler(async (req, res) => {
  const courseId = req.params.id;
  const { name, email, phone, classId } = req.body;

  try {
    const existing = await findEnrolment({ classId, email });
    if (existing) {
      req.flash('error_msg', 'You are already enrolled in this class.');
      return res.redirect(`/enrol/${courseId}`);
    }

    await insertEnrolment({ courseId, classId, name, email, phone });
    logger.info('User enrolled successfully', { courseId, classId, email });
    req.flash('success_msg', 'You have successfully enrolled!');
    res.redirect(`/course/${courseId}`);
  } catch (err) {
    logger.error('Enrolment error', { error: err.message, courseId, classId });
    req.flash('error_msg', 'Failed to enrol. Please try again.');
    res.redirect(`/enrol/${courseId}`);
    throw err;
  }
}));

module.exports = router;