const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const verifyToken = require('../middleware/AuthMiddleware');

router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.get('/auth', verifyToken, AuthController.auth)

module.exports = router;