const express = require('express');
const router = express.Router();
const ProfileController = require('../controllers/profileController')
const verifyToken = require('../middleware/AuthMiddleware');
const upload = require('../config/multer');

router.post('/changepassword', verifyToken, ProfileController.changePassword);
router.post('/updateinfo', verifyToken, ProfileController.updateInfo);
router.post('/upload-image', verifyToken, upload.single('image'), ProfileController.uploadImage)

module.exports = router;