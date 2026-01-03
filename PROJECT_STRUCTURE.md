# Project Structure

## Directory Organization

```
Dance-Booking-System/
├── app.js                    # Main application entry point
├── package.json              # Dependencies and scripts
├── Dockerfile                # Docker configuration
├── docker-compose.yml        # Docker Compose setup
├── .env.example              # Environment variables template
│
├── controllers/              # Request handlers (business logic)
│   ├── authController.js    # Authentication operations
│   ├── courseController.js  # Course-related operations
│   └── organiserController.js # Organiser/admin operations
│
├── models/                   # Data models (NeDB)
│   ├── userModel.js
│   ├── courseModel.js
│   ├── classModel.js
│   └── enrolmentModel.js
│
├── routes/                   # Route definitions
│   ├── index.js             # Public routes (home, courses, enrolment)
│   ├── auth.js              # Authentication routes
│   └── organiser.js         # Organiser/admin routes
│
├── middlewares/              # Custom middleware
│   ├── authMiddleware.js    # Authentication & authorization
│   └── errorHandler.js      # Centralized error handling
│
├── utils/                    # Utility functions
│   ├── logger.js            # Winston logger configuration
│   ├── validation.js        # ID validation helpers
│   └── validators.js        # Express-validator rules
│
├── views/                    # Mustache templates
│   ├── index.mustache
│   ├── login.mustache
│   ├── register.mustache
│   ├── courses.mustache
│   ├── course_detail.mustache
│   ├── enrol.mustache
│   ├── dashboard.mustache
│   ├── edit_class.mustache
│   ├── manage_course.mustache
│   ├── manage_users.mustache
│   └── class_list.mustache
│
├── public/                   # Static assets
│   └── css/
│       └── style.css
│
├── db/                       # NeDB database files (auto-generated)
│   ├── users.db
│   ├── courses.db
│   ├── classes.db
│   └── enrolments.db
│
├── logs/                     # Log files (auto-generated)
│   ├── error.log
│   ├── combined.log
│   ├── exceptions.log
│   └── rejections.log
│
├── tests/                    # Test files
│   ├── auth.test.js
│   ├── course.test.js
│   ├── courseController.test.js
│   └── organiser.test.js
│
└── .github/                  # GitHub configuration
    └── workflows/
        └── ci.yml           # CI/CD pipeline
```

## Code Organization Principles

1. **Separation of Concerns:**
   - Controllers handle business logic
   - Models handle data access
   - Routes define endpoints
   - Middlewares handle cross-cutting concerns

2. **Error Handling:**
   - Centralized error handler in `middlewares/errorHandler.js`
   - All async routes use `asyncHandler` wrapper
   - Errors are logged using Winston logger

3. **Validation:**
   - Centralized validation rules in `utils/validators.js`
   - Input validation using express-validator
   - ID validation using custom helpers

4. **Logging:**
   - Structured logging with Winston
   - Different log levels for dev/prod
   - Log files in `logs/` directory

5. **Testing:**
   - Test files in `tests/` directory
   - Unit and integration tests
   - Uses Mocha, Chai, and Supertest

## Key Features

- ✅ Clean code structure
- ✅ Centralized error handling
- ✅ Comprehensive logging
- ✅ Input validation
- ✅ Authentication & authorization
- ✅ Docker support
- ✅ CI/CD pipeline
- ✅ Comprehensive testing

