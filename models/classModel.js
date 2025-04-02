const Datastore = require('nedb');
const db = new Datastore({ filename: './db/classes.db', autoload: true });

const isValidClass = cls =>
  cls?.courseId && cls?.date && cls?.time && cls?.location && cls?.price;

module.exports = {
  insert(cls, callback) {
    if (!isValidClass(cls)) return callback(new Error('Invalid class data'));
    db.insert(cls, callback);
  },

  find(query, callback) {
    db.find(query, callback);
  },

  findOne(query, callback) {
    db.findOne(query, callback);
  },

  update(query, updateObj, options, callback) {
    db.update(query, updateObj, options, callback);
  },

  remove(query, options, callback) {
    db.remove(query, options, callback);
  }
};