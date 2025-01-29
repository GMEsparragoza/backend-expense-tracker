const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController')
const { generateFinancialReport } = require('../services/excelService')
const verifyToken = require('../middleware/AuthMiddleware');
const upload = require('../config/multer');

router.post('/changepassword', verifyToken, ProfileController.changePassword);
router.post('/reset-password', ProfileController.ResetPassword)
router.post('/updateinfo', verifyToken, ProfileController.updateInfo);
router.post('/upload-image', verifyToken, upload.single('image'), ProfileController.uploadImage)
router.post('/activate-2fa', verifyToken, ProfileController.enable2FA)
router.post('/disable-2fa', verifyToken, ProfileController.disable2FA)
router.post('/confirm-change-password', verifyToken, ProfileController.confirmChangePassword2FA)
router.post('/delete-account', verifyToken, ProfileController.deleteAccount)
router.post('/confirm-delete-account', verifyToken, ProfileController.confirmDeleteAccount)
router.get('/generate-excel-data', verifyToken, generateFinancialReport)

module.exports = router;