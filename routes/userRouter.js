import express from 'express';
import path from 'path';
import multer from 'multer';
import { fileURLToPath } from 'url';
import {
    userRegister,
    sendMailVerification,
    forgotPassword,
    loginUser,
    userProfile,
    updateProfile,
    refreshToken,
    logout,
    sendOpt,
    verifyOpt
} from '../controllers/userController.js';
import {
    registerValidator,
    sendMailVerificationValidator,
    passwordResetValidator,
    loginValidator,
    updateProfileValidator,
    optMailValidation,
    verifyOptValidator
} from '../helpers/validation.js';
import { VerifyToken } from '../middlewares/auth.js';

// Create an Express router
const router = express.Router();

// Get the current file's directory path (__dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
            cb(null, path.join(__dirname, '../public/images'));
        } else {
            cb(new Error('Unsupported file type'), false);
        }
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type'), false);
    }
};

const upload = multer({
    storage,
    fileFilter
});

// Route handlers
router.post('/register', upload.single('image'), registerValidator, userRegister);
router.post('/send-mail-verification', sendMailVerificationValidator, sendMailVerification);
router.post('/forgot-password', passwordResetValidator, forgotPassword);
router.post('/login', loginValidator, loginUser);
router.get('/profile', VerifyToken, userProfile);
router.post('/update-profile', VerifyToken, upload.single('image'), updateProfileValidator, updateProfile);
router.get('/refresh-token', VerifyToken, refreshToken)
router.get('/logout', VerifyToken, logout)
router.post('/send-opt', optMailValidation, sendOpt)
router.post('/verify-opt', verifyOptValidator, verifyOpt)

export default router;
