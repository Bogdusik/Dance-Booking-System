const Datastore = require('nedb');
const db = new Datastore({ filename: './db/courses.db', autoload: true });

const isValidCourse = course =>
  course?.name && course?.description && course?.duration;

module.exports = {
  insert(course, callback) {
    if (!isValidCourse(course)) return callback(new Error('Invalid course data'));
    db.insert(course, callback);
  },

  find(query, callback) {
    db.find(query, callback);
  },

  findOne(query, callback) {
    db.findOne(query, callback);
  },

  remove(query, options, callback) {
    db.remove(query, options, callback);
  }
};