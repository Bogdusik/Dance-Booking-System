const express = require('express');
const router = express.Router();
const organiserController = require('../controllers/organiserController');
const { isAuthenticated, isOrganiser } = require('../middlewares/authMiddleware');

const courseDb = require('../models/courseModel');
const classDb = require('../models/classModel');

router.get('/dashboard', isAuthenticated, isOrganiser, organiserController.dashboard);

router.post(
  '/add-course',
  isAuthenticated,
  isOrganiser,
  organiserController.validateCourse,
  organiserController.addCourse
);

router.post(
  '/delete-course/:id',
  isAuthenticated,
  isOrganiser,
  (req, res) => {
    courseDb.remove({ _id: req.params.id }, {}, () => res.redirect('/organiser/dashboard'));
  }
);

router.post(
  '/add-class',
  isAuthenticated,
  isOrganiser,
  organiserController.validateClass,
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
  organiserController.validateClass,
  organiserController.updateClass
);

router.post(
  '/delete-class/:id',
  isAuthenticated,
  isOrganiser,
  (req, res) => {
    classDb.remove({ _id: req.params.id }, {}, () => res.redirect('/organiser/dashboard'));
  }
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