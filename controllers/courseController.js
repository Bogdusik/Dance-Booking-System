const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const util = require('util');

const findCourse = util.promisify(courseDb.findOne).bind(courseDb);
const findCourses = util.promisify(courseDb.find).bind(courseDb);
const findClasses = util.promisify(classDb.find).bind(classDb);
const findEnrolments = util.promisify(enrolmentDb.find).bind(enrolmentDb);

const handleError = (res, message, status = 500) => {
  res.status(status).send(message);
};

exports.getCourses = async (req, res) => {
  try {
    const courses = await findCourses({});
    res.render('courses', { courses });
  } catch (err) {
    console.error(err);
    handleError(res, 'Database error');
  }
};

exports.getCourseDetail = async (req, res) => {
  const { id } = req.params;
  const isAdmin = req.session.user?.role === 'organiser';

  try {
    const course = await findCourse({ _id: id });
    if (!course) return handleError(res, 'Course not found', 404);

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
    console.error(err);
    handleError(res, 'Failed to load course details');
  }
};