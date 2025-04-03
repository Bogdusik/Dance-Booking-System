const Datastore = require('nedb');
const db = new Datastore({ filename: './db/users.db', autoload: true });

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