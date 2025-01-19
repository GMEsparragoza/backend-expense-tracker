const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const verifyToken = require('../middleware/AuthMiddleware');
const { mailer } = require('../controllers/mailController');

router.post('/signup', AuthController.signup);
router.post('/signin', AuthController.signin);
router.post('/verify-2fa', AuthController.verify2FA)
router.get('/auth', verifyToken, AuthController.auth)
router.post('/mailer', mailer)
router.post('/delete-account', verifyToken, AuthController.deleteAccount)
router.post('/confirm-delete-account', verifyToken, AuthController.confirmDeleteAccount)
router.post('/verify-new-user', AuthController.verifyDataNewUser)

module.exports = router;