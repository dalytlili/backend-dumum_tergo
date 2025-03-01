import express from 'express';
import {
    mailVerification,
    resetPassword,
    updatePassword,
    restSuccess
} from '../controllers/userController.js';
import bodyParser from 'body-parser';

const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}))

router.get('/mail-verif/:id', mailVerification); 
router.get('/reset-password', resetPassword); 
router.post('/reset-password', updatePassword); 
router.get('/reset-success', restSuccess)

export default router;
