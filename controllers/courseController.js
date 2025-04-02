const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');

const handleError = (res, message, status = 500) =>
  res.status(status).send(message);

exports.getCourses = (req, res) => {
  courseDb.find({}, (err, courses) => {
    if (err) return handleError(res, 'Database error');
    res.render('courses', { courses });
  });
};

exports.getCourseDetail = (req, res) => {
  const { id } = req.params;

  courseDb.findOne({ _id: id }, (err, course) => {
    if (err || !course) return handleError(res, 'Course not found', 404);

    classDb.find({ courseId: id }, (err, classes) => {
      if (err) return handleError(res, 'Class loading error');

      classes.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });

      enrolmentDb.find({ courseId: id }, (err, enrolments) => {
        if (err) return handleError(res, 'Enrolment loading error');

        const participants = enrolments.map(({ name, email, phone }) => ({
          name,
          email,
          phone
        }));

        res.render('course_detail', {
          course,
          classes,
          participants
        });
      });
    });
  });
};