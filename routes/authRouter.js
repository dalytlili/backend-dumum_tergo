import express from 'express';
import passport from "../config/passport.js"; // تأكد من أن المسار صحيح

import {
    mailVerification,
    resetPassword,
    updatePassword,
    restSuccess
} from '../controllers/userController.js';
import bodyParser from 'body-parser';

const router = express.Router();
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:true}))
router.get(
    "/google/callback",
    passport.authenticate("google", { failureRedirect: "/login" }),
    (req, res) => {
        res.redirect("/"); // Redirige l'utilisateur après connexion
    }
);

router.get('/mail-verif/:id', mailVerification); 
router.get('/reset-password', resetPassword); 
router.post('/reset-password', updatePassword); 
router.get('/reset-success', restSuccess)

export default router;
