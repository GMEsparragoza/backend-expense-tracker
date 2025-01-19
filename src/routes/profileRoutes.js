const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController')
const verifyToken = require('../middleware/AuthMiddleware');
const upload = require('../config/multer');

router.post('/changepassword', verifyToken, ProfileController.changePassword);
router.post('/reset-password', ProfileController.ResetPassword)
router.post('/updateinfo', verifyToken, ProfileController.updateInfo);
router.post('/upload-image', verifyToken, upload.single('image'), ProfileController.uploadImage)
router.post('/activate-2fa', verifyToken, ProfileController.enable2FA)
router.post('/disable-2fa', verifyToken, ProfileController.disable2FA)
router.post('/confirm-change-password', verifyToken, ProfileController.confirmChangePassword2FA)

module.exports = router;