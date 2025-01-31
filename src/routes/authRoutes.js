const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const verifyToken = require('../middleware/AuthMiddleware');

router.post('/verify-new-user', AuthController.verifyDataNewUser)
router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.post('/verify-2fa', AuthController.verify2FA)
router.post('/auth', verifyToken, AuthController.auth)
router.post('/logout', AuthController.logOut);

module.exports = router;