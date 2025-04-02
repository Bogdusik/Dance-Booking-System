const express = require('express');
const router = express.Router();
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const courseController = require('../controllers/courseController');
const { isValidId } = require('../utils/validation');

router.get('/', (req, res) => {
  const isOrganiser = req.session?.user?.role === 'organiser';
  res.render('index', { isOrganiser });
});

router.get('/courses', courseController.getCourses);

router.get('/course/:id', (req, res) => {
  if (!isValidId(req.params.id)) return res.redirect('/');
  courseController.getCourseDetail(req, res);
});

router.get('/enrol/:id', (req, res) => {
  const courseId = req.params.id;
  if (!isValidId(courseId)) return res.redirect('/courses');

  classDb.find({ courseId }, (err, classes) => {
    if (err) return res.status(500).send('Error fetching class data');
    res.render('enrol', { course: { _id: courseId }, classes });
  });
});

router.post('/enrol/:id', (req, res) => {
  const courseId = req.params.id;
  const { name, email, phone, classId } = req.body;

  if (!isValidId(courseId) || !isValidId(classId)) {
    req.flash('error_msg', 'Invalid course or class ID');
    return res.redirect('/courses');
  }

  enrolmentDb.findOne({ classId, email }, (err, existing) => {
    if (err) {
      req.flash('error_msg', 'Error checking enrolments');
      return res.redirect(`/enrol/${courseId}`);
    }

    if (existing) {
      req.flash('error_msg', 'You are already enrolled in this class.');
      return res.redirect(`/enrol/${courseId}`);
    }

    enrolmentDb.insert({ courseId, classId, name, email, phone }, err => {
      if (err) {
        req.flash('error_msg', 'Failed to enrol');
        return res.redirect(`/enrol/${courseId}`);
      }

      req.flash('success_msg', 'You have successfully enrolled!');
      res.redirect(`/course/${courseId}`);
    });
  });
});

module.exports = router;