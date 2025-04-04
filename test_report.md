# ✅ Dance Booking System – Test Report

## 📦 Overview
This report describes the automated tests created using **Mocha**, **Chai**, and **Supertest** to validate the core functionality of the Dance Booking System web application.

- **Test Frameworks:** Mocha, Chai
- **HTTP Assertions:** Supertest
- **Test Location:** `/tests/app.test.js`
- **Number of Tests:** 10
- **Coverage:** Routes, redirects, error handling, validation

---

## ✅ Test Cases Summary

| Test Description                                                | Result  |
|-----------------------------------------------------------------|---------|
| GET `/courses` returns course list (HTML 200)                   | Passed  |
| GET `/` returns homepage                                        | Passed  |
| GET `/auth/login` displays login form                           | Passed  |
| GET `/auth/register` displays registration form                 | Passed  |
| POST `/auth/register` fails with invalid form input             | Passed  |
| GET `/organiser/dashboard` redirects unauthenticated users      | Passed  |
| GET `/non-existent` returns 404                                 | Passed  |
| GET `/enrol/123` handles non-existent enrolment gracefully      | Passed  |
| GET `/organiser/users` redirects when not authorised            | Passed  |
| GET `/courses/:id` with invalid ID returns error safely         | Passed  |

---

## 🧪 Sample Output

```bash
> npm test

10 passing (148ms)