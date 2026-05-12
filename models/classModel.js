const Datastore = require('@seald-io/nedb');
const path = require('path');
const dbFile = process.env.NODE_ENV === 'test' ? 'test-classes.db' : 'classes.db';
const db = new Datastore({ filename: path.join(__dirname, '../db', dbFile), autoload: true });

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