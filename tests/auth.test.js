const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const userDb = require('../models/userModel');
const util = require('util');

const findUser = util.promisify(userDb.findOne).bind(userDb);
const insertUser = util.promisify(userDb.insert).bind(userDb);
const removeUser = userDb.remove;

describe('Authentication Tests', function () {
  this.timeout(20000);

  beforeEach(function (done) {
    // Clean up test users - use callback style with error handling
    removeUser({ username: 'testuser' }, { multi: true }, (err1) => {
      removeUser({ username: 'testorganiser' }, { multi: true }, (err2) => {
        // Ignore errors and continue
        done();
      });
    });
  });

  afterEach(function (done) {
    // Clean up after tests
    removeUser({ username: 'testuser' }, { multi: true }, (err1) => {
      removeUser({ username: 'testorganiser' }, { multi: true }, (err2) => {
        // Ignore errors and continue
        done();
      });
    });
  });

  describe('POST /auth/register', function () {
    it('should register a new user successfully', function (done) {
      request(app)
        .post('/auth/register')
        .type('form')
        .send({
          username: 'testuser',
          password: 'password123',
          role: 'user'
        })
        .expect(302)
        .expect('Location', '/auth/login')
        .end(async (err, res) => {
          if (err) return done(err);
          
          // Verify user was created
          const user = await findUser({ username: 'testuser' });
          expect(user).to.exist;
          expect(user.username).to.equal('testuser');
          expect(user.role).to.equal('user');
          expect(user.password).to.not.equal('password123'); // Should be hashed
          
          done();
        });
    });

    it('should reject registration with missing username', function (done) {
      request(app)
        .post('/auth/register')
        .type('form')
        .send({
          username: '',
          password: 'password123',
          role: 'user'
        })
        .expect(302)
        .expect('Location', '/auth/register')
        .end(done);
    });

    it('should reject registration with short password', function (done) {
      request(app)
        .post('/auth/register')
        .type('form')
        .send({
          username: 'testuser',
          password: '1234',
          role: 'user'
        })
        .expect(302)
        .expect('Location', '/auth/register')
        .end(done);
    });

    it('should reject duplicate username', async function () {
      // Create user first
      const hash = await bcrypt.hash('password123', 10);
      await insertUser({ username: 'testuser', password: hash, role: 'user' });

      // Try to register same username
      await request(app)
        .post('/auth/register')
        .type('form')
        .send({
          username: 'testuser',
          password: 'password123',
          role: 'user'
        })
        .expect(302)
        .expect('Location', '/auth/register');
    });
  });

  describe('POST /auth/login', function () {
    beforeEach(async function () {
      // Create test user
      const hash = await bcrypt.hash('password123', 10);
      await insertUser({ username: 'testuser', password: hash, role: 'user' });
    });

    it('should login with correct credentials', function (done) {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({
          username: 'testuser',
          password: 'password123'
        })
        .expect(302)
        .expect('Location', '/')
        .end((err, res) => {
          if (err) return done(err);
          // Check if session cookie is set
          expect(res.headers['set-cookie']).to.exist;
          done();
        });
    });

    it('should reject login with wrong password', function (done) {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({
          username: 'testuser',
          password: 'wrongpassword'
        })
        .expect(302)
        .expect('Location', '/auth/login')
        .end(done);
    });

    it('should reject login with non-existent user', function (done) {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({
          username: 'nonexistent',
          password: 'password123'
        })
        .expect(302)
        .expect('Location', '/auth/login')
        .end(done);
    });

    it('should reject login with missing fields', function (done) {
      request(app)
        .post('/auth/login')
        .type('form')
        .send({
          username: '',
          password: ''
        })
        .expect(302)
        .expect('Location', '/auth/login')
        .end(done);
    });
  });

  describe('POST /auth/logout', function () {
    it('should logout successfully', function (done) {
      request(app)
        .post('/auth/logout')
        .expect(302)
        .expect('Location', '/')
        .end(done);
    });
  });
});

