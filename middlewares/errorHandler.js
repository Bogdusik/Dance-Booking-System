/**
 * Centralized error handling middleware
 * Handles all errors in a consistent way
 */

const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  // Log error for debugging
  logger.error('Error occurred', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    statusCode: err.statusCode || 500,
    user: req.session?.user?.username || 'anonymous'
  });

  // Default error
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message || 'Validation Error';
  }

  if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    message = 'Unauthorized';
  }

  if (err.name === 'CastError' || err.name === 'ObjectIdError') {
    statusCode = 400;
    message = 'Invalid ID format';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  // Flash error message for form submissions
  if (req.flash) {
    req.flash('error_msg', message);
  }

  // Send response
  if (req.accepts('html')) {
    // For HTML requests, redirect or render error page
    const redirectPath = req.originalUrl.startsWith('/auth') 
      ? req.originalUrl 
      : '/';
    return res.status(statusCode).redirect(redirectPath);
  }

  // For API requests, send JSON
  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * 404 Not Found handler
 */
const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * Async handler wrapper to catch errors in async routes
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = {
  errorHandler,
  notFoundHandler,
  asyncHandler
};

