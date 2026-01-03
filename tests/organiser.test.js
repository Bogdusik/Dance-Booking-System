const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');
const bcrypt = require('bcryptjs');
const userDb = require('../models/userModel');
const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const util = require('util');

const findUser = util.promisify(userDb.findOne).bind(userDb);
const insertUser = util.promisify(userDb.insert).bind(userDb);
const findCourse = util.promisify(courseDb.findOne).bind(courseDb);
const insertCourse = util.promisify(courseDb.insert).bind(courseDb);
const findClasses = util.promisify(classDb.find).bind(classDb);
const insertClass = util.promisify(classDb.insert).bind(classDb);
const removeUser = userDb.remove;
const removeCourse = courseDb.remove;
const removeClass = classDb.remove;

describe('Organiser Routes Tests', function () {
  let organiserUser;
  let testCourse;
  let testClass;
  let agent;

  before(async function () {
    // Create organiser user
    const hash = await bcrypt.hash('password123', 10);
    organiserUser = await insertUser({
      username: 'testorganiser',
      password: hash,
      role: 'organiser'
    });

    // Create test course
    testCourse = await insertCourse({
      name: 'Test Course',
      description: 'Test Description',
      duration: '60 minutes'
    });
  });

  after(async function () {
    // Clean up
    if (organiserUser?._id) await removeUser({ _id: organiserUser._id }, {});
    if (testCourse?._id) await removeCourse({ _id: testCourse._id }, {});
    if (testClass?._id) await removeClass({ _id: testClass._id }, {});
  });

  beforeEach(function () {
    agent = request.agent(app);
  });

  describe('Authentication Required', function () {
    it('should redirect to login when accessing dashboard without auth', function (done) {
      request(app)
        .get('/organiser/dashboard')
        .expect(302)
        .expect('Location', '/auth/login')
        .end(done);
    });

    it('should redirect to login when accessing users without auth', function (done) {
      request(app)
        .get('/organiser/users')
        .expect(302)
        .expect('Location', '/auth/login')
        .end(done);
    });
  });

  describe('Dashboard Access', function () {
    it('should access dashboard after login', function (done) {
      agent
        .post('/auth/login')
        .type('form')
        .send({
          username: 'testorganiser',
          password: 'password123'
        })
        .expect(302)
        .end(function (err) {
          if (err) return done(err);
          
          agent
            .get('/organiser/dashboard')
            .expect(200)
            .expect('Content-Type', /html/)
            .end(done);
        });
    });
  });

  describe('Course Management', function () {
    beforeEach(async function () {
      // Login as organiser
      await agent
        .post('/auth/login')
        .type('form')
        .send({
          username: 'testorganiser',
          password: 'password123'
        });
    });

    it('should add a new course', function (done) {
      agent
        .post('/organiser/course/add')
        .type('form')
        .send({
          name: 'New Test Course',
          description: 'New Description',
          duration: '90 minutes'
        })
        .expect(302)
        .expect('Location', '/organiser/dashboard')
        .end(async function (err) {
          if (err) return done(err);
          
          // Verify course was created
          const course = await findCourse({ name: 'New Test Course' });
          expect(course).to.exist;
          expect(course.description).to.equal('New Description');
          
          // Clean up
          if (course?._id) await removeCourse({ _id: course._id }, {});
          done();
        });
    });

    it('should reject course creation with missing fields', function (done) {
      agent
        .post('/organiser/course/add')
        .type('form')
        .send({
          name: '',
          description: '',
          duration: ''
        })
        .expect(302)
        .expect('Location', '/organiser/dashboard')
        .end(done);
    });
  });

  describe('Class Management', function () {
    beforeEach(async function () {
      // Login as organiser
      await agent
        .post('/auth/login')
        .type('form')
        .send({
          username: 'testorganiser',
          password: 'password123'
        });
    });

    it('should add a new class', function (done) {
      agent
        .post('/organiser/class/add')
        .type('form')
        .send({
          courseId: testCourse._id,
          date: '2024-12-25',
          time: '19:00',
          location: 'New Location',
          price: '75',
          description: 'New Class'
        })
        .expect(302)
        .expect('Location', '/organiser/dashboard')
        .end(async function (err) {
          if (err) return done(err);
          
          // Verify class was created
          const classes = await findClasses({ courseId: testCourse._id });
          const newClass = classes.find(c => c.location === 'New Location');
          expect(newClass).to.exist;
          
          // Clean up
          if (newClass?._id) await removeClass({ _id: newClass._id }, {});
          done();
        });
    });

    it('should reject class creation with missing fields', function (done) {
      agent
        .post('/organiser/class/add')
        .type('form')
        .send({
          courseId: '',
          date: '',
          time: '',
          location: '',
          price: ''
        })
        .expect(302)
        .expect('Location', '/organiser/dashboard')
        .end(done);
    });
  });
});

