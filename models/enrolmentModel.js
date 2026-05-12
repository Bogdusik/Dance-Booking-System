const Datastore = require('@seald-io/nedb');
const path = require('path');
const dbFile = process.env.NODE_ENV === 'test' ? 'test-enrolments.db' : 'enrolments.db';

const db = new Datastore({
  filename: path.join(__dirname, '../db', dbFile),
  autoload: true
});

module.exports = db;