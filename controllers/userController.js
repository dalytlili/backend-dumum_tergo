import User from '../models/userModel.js';
import bcrypt from 'bcrypt';
import { validationResult } from 'express-validator';
import { sendMail } from '../helpers/mailer.js';
import randomstring from 'randomstring';
import PasswordReset from '../models/passwordReset.js';
import { deletefile } from '../helpers/delteFile.js';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import Blacklist from '../models/blacklist.js';
import Otp from '../models/opt.js';
import { oneMinuteExpiry, threeMinuteExpiry } from '../helpers/otpValidate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export {
    userRegister,
    mailVerification,
    sendMailVerification,
    forgotPassword,
    resetPassword,
    updatePassword,
    restSuccess,
    loginUser,
    userProfile,
    updateProfile,
    refreshToken,
    logout,
    sendOpt,
    verifyOpt
};

// Function to handle user registration
const userRegister = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { name, genre, mobile, email, password } = req.body;

        // Check if the user already exists
        const isExists = await User.findOne({ email });
        if (isExists) {
            return res.status(400).json({
                success: false,
                msg: 'Email déjà utilisé'
            });
        }

        // Hash the password
        const hashPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const newUser = new User({
            name,
            genre,
            email,
            mobile,
            password: hashPassword,
            image: req.file ? `/images/${req.file.filename}` : '/images/default.png'
        });

        // Save the user to the database
        const userData = await newUser.save();

        // Prepare email content for verification
        const subject = 'Vérifiez votre email';
        const content = `<p>Bonjour ${name}, veuillez <a href="http://127.0.0.1:9098/mail-verif/${userData._id}">cliquer ici</a> pour vérifier votre adresse email.</p>`;

        // Send verification email
        await sendMail(email, subject, content);

        return res.status(200).json({
            success: true,
            msg: 'Inscription réussie !',
            user: userData
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription de l\'utilisateur :', error);
        return res.status(500).json({
            success: false,
            msg: 'Échec de l\'inscription de l\'utilisateur ou d\'envoi de l\'email.'
        });
    }
};

// Function to handle email verification
const mailVerification = async (req, res) => {
    try {
        const userId = req.params.id; // Récupère le paramètre ID depuis l'URL

        // Trouver l'utilisateur par userId
        const userData = await User.findOne({ _id: userId });

        if (!userData) {
            // Si l'utilisateur n'est pas trouvé, rendre une vue avec le message "Utilisateur non trouvé !"
            return res.render('mail-verification', { message: 'Utilisateur non trouvé !' });
        }

        // Mettre à jour le champ is_verified de l'utilisateur à 1
        await User.findByIdAndUpdate(userId, { $set: { is_verified: 1 } });

        // Rendre une vue avec le message "Email vérifié avec succès !"
        return res.render('mail-verification', { message: 'Email vérifié avec succès !' });

    } catch (error) {
        console.error('Erreur lors de la vérification de l\'email :', error);
        return res.render('404'); // Rendre une page 404 pour d'autres erreurs
    }
};

// Function to handle sending email verification link again
const sendMailVerification = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Check if the user exists
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email n'existe pas"
            });
        }

        if (userData.is_verified === 1) {
            return res.status(400).json({
                success: false,
                msg: `${userData.email} Email est déjà vérifié!`
            });
        }

        // Prepare email content for verification
        const subject = 'Vérifiez votre email';
        const content = `<p>Bonjour ${userData.name}, veuillez <a href="http://127.0.0.1:9098/mail-verif/${userData._id}">cliquer ici</a> pour vérifier votre adresse email.</p>`;

        // Send verification email
        await sendMail(email, subject, content);

        return res.status(200).json({
            success: true,
            msg: 'Lien de vérification envoyé à votre email, veuillez vérifier!'
        });

    } catch (error) {
        console.error('Erreur lors de l\'envoi du lien de vérification par email :', error);
        return res.status(500).json({
            success: false,
            msg: 'Échec de l\'envoi du lien de vérification par email.'
        });
    }
};

// Function to handle password reset request
const forgotPassword = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        const { email } = req.body;
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email doesn't exist!"
            });
        }

        const token = randomstring.generate();
        const msg = `<p>Hi ${userData.name}, Please click <a href="http://127.0.0.1:9098/reset-password?token=${token}">here</a> to Reset your Password!</p>`;

        await PasswordReset.deleteMany({ user_id: userData._id });
        const passwordReset = new PasswordReset({
            user_id: userData._id,
            token: token
        });
        await passwordReset.save();
        await sendMail(userData.email, 'Reset Password', msg);

        return res.status(201).json({
            success: true,
            msg: 'Reset Password Link sent to your mail, Please check!'
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

// Function to render reset password page
const resetPassword = async (req, res) => {
    try {
        if (req.query.token === undefined) {
            return res.render('404');
        }

        const resetData = await PasswordReset.findOne({ token: req.query.token });

        if (!resetData) {
            return res.render('404');
        }

        return res.render('reset-password', { resetData });

    } catch (error) {
        return res.render('404');
    }
};

// Function to update the password
const updatePassword = async (req, res) => {
    try {
        const { user_id, password, c_password } = req.body;
        const resetData = await PasswordReset.find({ user_id });

        // Check if passwords match
        if (password !== c_password) {
            return res.render('reset-password', { resetData, error: 'Confirm password does not match!' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(c_password, 10);

        // Update the user's password in the database
        await User.findByIdAndUpdate(user_id, {
            $set: {
                password: hashedPassword
            }
        });

        // Delete all password reset tokens for this user
        await PasswordReset.deleteMany({ user_id });

        // Redirect to reset success page
        return res.redirect('/reset-success');

    } catch (error) {
        console.error('Error updating password:', error);
        return res.render('404');
    }
};

// Function to render reset success page
const restSuccess = async (req, res) => {
    try {
        return res.render('reset-success');

    } catch (error) {
        return res.render('404');
    }
};

// Function to generate an access token
const generateAccessToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "2h" });
    return token;
};

const generateRefreshToken = async (user) => {
    const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "4h" });
    return token;
};

// Function to handle user login
const loginUser = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        let { identifier, password } = req.body;

        // Afficher l'identifiant pour vérifier la valeur de "identifier"
        console.log("Identifier:", identifier);

        // Si l'identifier est un email, le convertir en minuscules
        if (identifier.includes('@')) {
            identifier = identifier.toLowerCase();
        }

        console.log("Normalized Identifier:", identifier); // Vérifier après la conversion

        // Recherche de l'utilisateur avec l'identifier modifié
        const userData = await User.findOne({
            $or: [
                { email: identifier },
                { mobile: identifier }
            ]
        });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: 'Utilisateur non trouvé'
            });
        }

        const passwordMatch = await bcrypt.compare(password, userData.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                msg: 'Email et mot de passe incorrects !'
            });
        }

        if (!userData.is_verified) {
            return res.status(403).json({
                success: false,
                msg: 'Veuillez vérifier votre compte avant de vous connecter'
            });
        }

        const accessToken = await generateAccessToken({ user: userData });
        const refreshToken = await generateRefreshToken({ user: userData });

        return res.status(200).json({
            success: true,
            msg: 'Login Successfully!!',
            user: userData,
            accessToken: accessToken,
            refreshToken:refreshToken,
            tokenType: 'Bearer'
        });

    } catch (error) {
        console.error('Erreur de connexion:', error);
        return res.status(500).json({
            success: false,
            msg: 'Une erreur est survenue, veuillez réessayer plus tard.'
        });
    }
};


// Function to get user profile
const userProfile = async (req, res) => {
    try {
        const userData = req.user;

        return res.status(200).json({
            success: true,
            msg: 'User Profile Data!',
            data: userData
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

// Function to update user profile
const updateProfile = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        const { name, mobile, genre } = req.body;
        const data = {
            name,
            mobile,
            genre
        };

        const user_id = req.user._id;

        if (req.file) {
            data.image = '/images/' + req.file.filename;

            // Fetch the current user to get the old image path
            const oldUser = await User.findOne({ _id: user_id });

            if (oldUser && oldUser.image) {
                const oldFilePath = path.join(__dirname, '../public', oldUser.image);

                console.log(`Attempting to delete old file: ${oldFilePath}`);
                
                await deletefile(oldFilePath); // Call to deletefile
            }
        }

        // Update the user with new data
        const userData = await User.findByIdAndUpdate(user_id, {
            $set: data
        }, { new: true });

        return res.status(200).json({
            success: true,
            msg: 'User Updated Successfully!',
            user: userData
        });

    } catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

const refreshToken = async(req,res)=>{
    try{
        const userId = req.user._id;
        const userData = await User.findOne({ _id:userId});

        const accessToken =await generateAccessToken({ user:userData})
        const refreshToken = await generateRefreshToken({ user:userData})

        return res.status(200).json({
            success: true,
            msg: 'Token Refreshed! ',
            accessToken:accessToken,
            refreshToken:refreshToken
        });
    }catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
}

const logout = async(req,res)=>{
    try{

        const token = req.body.token || req.query.token || req.headers['authorization']
        const bearer = token.split(' ');
        const bearerToken = bearer[1];

        const newBlacklist = new Blacklist({
            token:bearerToken
        })

        await newBlacklist.save();
        res.setHeader('Clear-Site-Data', '"cookies","storage"');
        return res.status(200).json({
            success: true,
            msg: 'You are logged out!'
        });

    }catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }

}


const generateRandom4Digit = async()=>{
    return Math.floor(1000 + Math.random() * 9000); 
}


const sendOpt = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                msg: 'Erreurs de validation',
                errors: errors.array()
            });
        }

        const { email } = req.body;

        // Check if the user exists
        const userData = await User.findOne({ email });

        if (!userData) {
            return res.status(400).json({
                success: false,
                msg: "Email n'existe pas"
            });
        }

        if (userData.is_verified === 1) {
            return res.status(400).json({
                success: false,
                msg: `${userData.email} Email est déjà vérifié!`
            });
        }

        // Prepare email content for verification
        const subject = 'Verification Otp';
        const g_otp = await generateRandom4Digit();

        const oldOtpData = await Otp.findOne({ user_id: userData._id });

        if (oldOtpData) {
            console.log('Existing OTP timestamp:', oldOtpData.timestamp);
            if (oldOtpData.timestamp) {
                const isExpired = oneMinuteExpiry(oldOtpData.timestamp);
                if (!isExpired) {
                    return res.status(400).json({
                        success: false,
                        msg: 'Pls try after some time!'
                    });
                }
            } else {
                console.log('Timestamp is undefined.');
            }
        }

        const cDate = new Date(); // Current time

        // Ensure that the `upsert` option is correct and check the result
        const result = await Otp.findOneAndUpdate(
            { user_id: userData._id },
            { otp: g_otp, timestamp: cDate },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );

        console.log('OTP update result:', result); // Add this log to debug

        const content = `<p>Bonjour ${userData.name}, </br> <h4>${g_otp}</h4></p>`;

        // Send verification email
        await sendMail(email, subject, content);

        return res.status(200).json({
            success: true,
            msg: 'Otp envoyé à votre email, veuillez vérifier!'
        });

    } catch (error) {
        console.error('Error in sendOpt:', error);
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }
};

const verifyOpt = async (req, res)=>{
    try{
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                msg: 'Errors',
                errors: errors.array()
            });
        }

        const {user_id, otp } = req.body;

        const otpData = await Otp.findOne({
            user_id,
            otp
        });

        if(!otpData){
            return res.status(400).json({
                success: false,
                msg: ' You entered wrong OTP!'
            });
        }
       const isOtpExpired = await threeMinuteExpiry(otpData.timestamp)

       if (isOtpExpired){
        return res.status(400).json({
            success: false,
            msg: ' Your OTP has been Expierd !'
        });

       }

       await User.findByIdAndUpdate({ _id: user_id},{
        $set:{
            is_verified:1
        }
       })

       return res.status(200).json({
        success: true,
        msg: ' Account Verified Successfully!'
    });

    }catch (error) {
        return res.status(400).json({
            success: false,
            msg: error.message
        });
    }






 
}