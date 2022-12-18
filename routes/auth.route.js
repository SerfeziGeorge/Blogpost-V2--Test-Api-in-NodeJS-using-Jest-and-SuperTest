const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');

router.post(
	'/signup',

	authController.SignUp
);

router.post('/login', authController.Login);

//router.get('/logout', authController.logout);

module.exports = router;
