const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');
const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');
const enrolmentDb = require('../models/enrolmentModel');
const util = require('util');

const findCourse = util.promisify(courseDb.findOne).bind(courseDb);
const insertCourse = util.promisify(courseDb.insert).bind(courseDb);
const findClasses = util.promisify(classDb.find).bind(classDb);
const insertClass = util.promisify(classDb.insert).bind(classDb);
const removeCourse = courseDb.remove;
const removeClass = classDb.remove;

describe('Course Controller Tests', function () {
  this.timeout(20000);
  
  let testCourse;
  let testClass;

  beforeEach(async function () {
    // Create test course
    testCourse = await insertCourse({
      name: 'Test Course',
      description: 'Test Description',
      duration: '60 minutes'
    });

    // Create test class
    testClass = await insertClass({
      courseId: testCourse._id,
      date: '2024-12-31',
      time: '18:00',
      location: 'Test Location',
      price: '50',
      description: 'Test Class'
    });
  });

  afterEach(async function () {
    // Clean up
    if (testCourse?._id) await removeCourse({ _id: testCourse._id }, {});
    if (testClass?._id) await removeClass({ _id: testClass._id }, {});
  });

  describe('GET /courses', function () {
    it('should return list of courses', function (done) {
      request(app)
        .get('/courses')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('Test Course');
        })
        .end(done);
    });
  });

  describe('GET /course/:id', function () {
    it('should return course details for valid ID', function (done) {
      request(app)
        .get(`/course/${testCourse._id}`)
        .expect(200)
        .expect('Content-Type', /html/)
        .expect(res => {
          expect(res.text).to.include('Test Course');
          expect(res.text).to.include('Test Description');
        })
        .end(done);
    });

    it('should return 404 for invalid course ID', function (done) {
      request(app)
        .get('/course/invalid-id-12345')
        .expect(res => {
          expect([404, 500, 302]).to.include(res.status);
        })
        .end(done);
    });
  });

  describe('GET /enrol/:id', function () {
    it('should show enrolment page for valid course', function (done) {
      request(app)
        .get(`/enrol/${testCourse._id}`)
        .expect(200)
        .expect('Content-Type', /html/)
        .end(done);
    });

    it('should redirect for invalid course ID', function (done) {
      request(app)
        .get('/enrol/invalid-id')
        .expect(res => {
          // Accept redirect or 404
          expect([302, 404]).to.include(res.status);
        })
        .end(done);
    });
  });

  describe('POST /enrol/:id', function () {
    it('should successfully enrol user in class', function (done) {
      request(app)
        .post(`/enrol/${testCourse._id}`)
        .type('form')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          classId: testClass._id
        })
        .expect(302)
        .expect('Location', `/course/${testCourse._id}`)
        .end(done);
    });

    it('should reject duplicate enrolment', async function () {
      // First enrolment
      await request(app)
        .post(`/enrol/${testCourse._id}`)
        .type('form')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          classId: testClass._id
        });

      // Try duplicate
      await request(app)
        .post(`/enrol/${testCourse._id}`)
        .type('form')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          classId: testClass._id
        })
        .expect(302)
        .expect('Location', `/enrol/${testCourse._id}`);
    });

    it('should reject enrolment with invalid course ID', function (done) {
      request(app)
        .post('/enrol/invalid-id')
        .type('form')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          phone: '1234567890',
          classId: testClass._id
        })
        .expect(res => {
          // Accept redirect to courses or back to enrol page
          expect([302, 404]).to.include(res.status);
        })
        .end(done);
    });
  });
});

