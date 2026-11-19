const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const util = require('util');
const logger = require('../utils/logger');
const { asyncHandler } = require('../middlewares/errorHandler');
const { formatClass, byDateTime, initials, summariseCourse } = require('../utils/format');

const findCourse = util.promisify(courseDb.findOne).bind(courseDb);
const findCourses = util.promisify(courseDb.find).bind(courseDb);
const findClasses = util.promisify(classDb.find).bind(classDb);
const findEnrolments = util.promisify(enrolmentDb.find).bind(enrolmentDb);

const loadCatalogue = async () => {
  const [courses, classes] = await Promise.all([findCourses({}), findClasses({})]);
  courses.sort((a, b) => a.name.localeCompare(b.name));
  return { courses: courses.map((course, i) => summariseCourse(course, classes, i)), classes };
};

exports.loadCatalogue = loadCatalogue;

exports.home = asyncHandler(async (req, res) => {
  const { courses, classes } = await loadCatalogue();
  const names = new Map(courses.map(c => [c._id, c.name]));
  const upcoming = classes
    .filter(cls => names.has(cls.courseId))
    .sort(byDateTime)
    .slice(0, 4)
    .map(cls => ({ ...formatClass(cls), courseName: names.get(cls.courseId) }));

  res.render('index', {
    featured: courses.slice(0, 3),
    upcoming,
    stats: { courses: courses.length, classes: classes.length }
  });
});

exports.getCourses = asyncHandler(async (req, res) => {
  try {
    const { courses } = await loadCatalogue();
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
    const { courses } = await loadCatalogue();
    const course = courses.find(c => c._id === id) || (await findCourse({ _id: id }));
    if (!course) {
      const error = new Error('Course not found');
      error.statusCode = 404;
      throw error;
    }

    const classes = (await findClasses({ courseId: id })).sort(byDateTime).map(formatClass);
    const enrolments = await findEnrolments({ courseId: id });
    const participants = enrolments.map(({ name, email, phone }) => ({
      name,
      initials: initials(name),
      ...(isAdmin ? { email, phone } : {})
    }));

    res.render('course_detail', {
      course,
      classes,
      participants,
      hasParticipants: participants.length > 0,
      participantCount: participants.length
    });
  } catch (err) {
    logger.error('Failed to load course details', { error: err.message, courseId: id });
    throw err;
  }
});
