const Datastore = require('@seald-io/nedb');
const path = require('path');
const dbFile = process.env.NODE_ENV === 'test' ? 'test-users.db' : 'users.db';
const db = new Datastore({ filename: path.join(__dirname, '../db', dbFile), autoload: true });

const isValidUser = user =>
  user?.username && user?.password && user?.role;

module.exports = {
  insert(user, callback) {
    if (!isValidUser(user)) return callback(new Error('Invalid user data'));
    db.insert(user, callback);
  },

  findOne(query, callback) {
    db.findOne(query, callback);
  },

  find(query, callback) {
    db.find(query, callback);
  },

  remove(query, options) {
    return new Promise((resolve, reject) => {
      db.remove(query, options, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
  }
};