const request = require('supertest');
const app = require('../app');
const { expect } = require('chai');

describe('Dance Booking System – Basic Routes', function () {

  it('GET /courses → should return 200 and HTML', function (done) {
    request(app)
      .get('/courses')
      .expect('Content-Type', /html/)
      .expect(200, done);
  });

  it('GET / → homepage should return 200', function (done) {
    request(app)
      .get('/')
      .expect(200, done);
  });

  it('GET /auth/login → should show login page', function (done) {
    request(app)
      .get('/auth/login')
      .expect('Content-Type', /html/)
      .expect(200)
      .expect(res => {
        expect(res.text).to.include('Login');
      })
      .end(done);
  });

  it('GET /auth/register → should show register page', function (done) {
    request(app)
      .get('/auth/register')
      .expect(200)
      .expect(res => {
        expect(res.text).to.include('Register');
      })
      .end(done);
  });

  it('POST /auth/register → should fail with missing fields', function (done) {
    request(app)
      .post('/auth/register')
      .type('form')
      .send({ username: '', password: '', role: '' })
      .expect(302)
      .expect('Location', '/auth/register')
      .end(done);
  });

  it('GET /organiser/dashboard → should redirect when not logged in', function (done) {
    request(app)
      .get('/organiser/dashboard')
      .expect(302)
      .expect('Location', '/auth/login')
      .end(done);
  });

  it('GET /non-existent → should return 404', function (done) {
    request(app)
      .get('/non-existent')
      .expect(404, done);
  });

  it('GET /enrol/123 → should redirect or fail gracefully', function (done) {
    request(app)
      .get('/enrol/123')
      .expect(res => {
        expect([200, 302, 404]).to.include(res.status);
      })
      .end(done);
  });

  it('GET /organiser/users → should redirect when not authorised', function (done) {
    request(app)
      .get('/organiser/users')
      .expect(302)
      .expect('Location', '/auth/login')
      .end(done);
  });

  it('GET /courses/:id with dummy ID → should not crash', function (done) {
    request(app)
      .get('/courses/invalid-id')
      .expect(res => {
        expect([404, 500]).to.include(res.status);
      })
      .end(done);
  });

});