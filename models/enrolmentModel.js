const Datastore = require('nedb');
const path = require('path');

const db = new Datastore({
  filename: path.join(__dirname, '../db/enrolments.db'),
  autoload: true
});

module.exports = db;