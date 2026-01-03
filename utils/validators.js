const { body, param, validationResult } = require('express-validator');
const { isValidId } = require('./validation');

/**
 * Centralized validation result handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    req.flash('error_msg', firstError.msg);
    // Determine redirect path based on route
    let redirectPath = '/';
    const url = req.originalUrl || req.url;
    if (url.includes('/organiser/course/add') || url.includes('/course/add')) {
      redirectPath = '/organiser/dashboard';
    } else if (url.includes('/organiser/class/add') || url.includes('/class/add')) {
      redirectPath = '/organiser/dashboard';
    } else if (url.startsWith('/auth')) {
      redirectPath = url;
    } else if (req.get('Referer')) {
      redirectPath = req.get('Referer');
    }
    return res.redirect(redirectPath);
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 5 })
    .withMessage('Password must be at least 5 characters')
    .isLength({ max: 100 })
    .withMessage('Password must be less than 100 characters'),
  
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['user', 'organiser'])
    .withMessage('Invalid role selected'),
  
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for course creation
 */
const validateCourse = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Course name is required')
    .isLength({ min: 3, max: 100 })
    .withMessage('Course name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Description must be between 10 and 500 characters'),
  
  body('duration')
    .trim()
    .notEmpty()
    .withMessage('Duration is required')
    .matches(/^\d+\s*(minute|minutes|hour|hours|hr|hrs)$/i)
    .withMessage('Duration must be in format like "60 minutes" or "1 hour"'),
  
  handleValidationErrors
];

/**
 * Validation rules for class creation
 */
const validateClass = [
  body('courseId')
    .notEmpty()
    .withMessage('Course ID is required')
    .custom((value) => {
      if (!isValidId(value)) {
        throw new Error('Invalid course ID format');
      }
      return true;
    }),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in ISO format (YYYY-MM-DD)')
    .custom((value) => {
      const date = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (date < today) {
        throw new Error('Date cannot be in the past');
      }
      return true;
    }),
  
  body('time')
    .notEmpty()
    .withMessage('Time is required')
    .matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Time must be in format HH:MM (24-hour)'),
  
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Location must be between 3 and 200 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number')
    .toFloat(),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
  
  handleValidationErrors
];

/**
 * Validation rules for enrolment
 */
const validateEnrolment = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters')
    .matches(/^[a-zA-Z\s'-]+$/)
    .withMessage('Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Invalid phone number format')
    .isLength({ min: 10, max: 20 })
    .withMessage('Phone number must be between 10 and 20 characters'),
  
  body('classId')
    .notEmpty()
    .withMessage('Class ID is required')
    .custom((value) => {
      if (!isValidId(value)) {
        throw new Error('Invalid class ID format');
      }
      return true;
    }),
  
  handleValidationErrors
];

/**
 * Validation for MongoDB/ObjectId-like IDs in URL parameters
 */
const validateIdParam = [
  param('id')
    .notEmpty()
    .withMessage('ID is required')
    .custom((value) => {
      if (!isValidId(value)) {
        throw new Error('Invalid ID format');
      }
      return true;
    }),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateCourse,
  validateClass,
  validateEnrolment,
  validateIdParam,
  handleValidationErrors
};

