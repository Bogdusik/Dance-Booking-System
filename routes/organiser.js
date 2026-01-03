const express = require('express');
const router = express.Router();
const util = require('util');
const organiserController = require('../controllers/organiserController');
const { isAuthenticated, isOrganiser } = require('../middlewares/authMiddleware');
const { validateCourse, validateClass, validateIdParam } = require('../utils/validators');
const { asyncHandler } = require('../middlewares/errorHandler');
const logger = require('../utils/logger');

const classDb = require('../models/classModel');
const removeClass = classDb.remove;

router.get('/dashboard', isAuthenticated, isOrganiser, organiserController.dashboard);

router.post(
  '/course/add',
  isAuthenticated,
  isOrganiser,
  validateCourse,
  organiserController.addCourse
);

router.post(
  '/course/delete/:id',
  isAuthenticated,
  isOrganiser,
  validateIdParam,
  organiserController.deleteCourse
);

router.post(
  '/class/add',
  isAuthenticated,
  isOrganiser,
  validateClass,
  organiserController.addClass
);

router.get(
  '/edit-class/:id',
  isAuthenticated,
  isOrganiser,
  organiserController.editClassForm
);

router.post(
  '/edit-class/:id',
  isAuthenticated,
  isOrganiser,
  validateIdParam,
  validateClass,
  organiserController.updateClass
);

router.post(
  '/delete-class/:id',
  isAuthenticated,
  isOrganiser,
  validateIdParam,
  asyncHandler(async (req, res) => {
    await new Promise((resolve, reject) => {
      removeClass({ _id: req.params.id }, {}, (err, numRemoved) => {
        if (err) reject(err);
        else resolve(numRemoved);
      });
    });
    logger.info('Class deleted', { classId: req.params.id });
    req.flash('success_msg', 'Class deleted successfully.');
    res.redirect('/organiser/dashboard');
  })
);

router.get(
  '/participants/:classId',
  isAuthenticated,
  isOrganiser,
  organiserController.listParticipants
);

router.get(
  '/class-list',
  isAuthenticated,
  isOrganiser,
  organiserController.fullClassList
);

router.get(
  '/users',
  isAuthenticated,
  isOrganiser,
  organiserController.manageUsers
);

router.post(
  '/delete-user/:id',
  isAuthenticated,
  isOrganiser,
  organiserController.deleteUser
);

module.exports = router;