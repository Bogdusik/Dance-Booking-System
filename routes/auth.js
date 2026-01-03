const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../utils/validators');

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);
router.get('/logout', authController.logout);

module.exports = router;