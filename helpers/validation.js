import { check } from 'express-validator';

// Définir les validateurs pour l'enregistrement
export const registerValidator = [
   // check('name', 'Name is required!!!').notEmpty(),
  // check('name', 'name is required').not().isEmpty(),
    check('genre', 'genre is required').not().isEmpty(),
    check('email', 'Invalid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
    check('mobile', 'Mobile No. should contain exactly 8 digits').isLength({
        min: 8,
        max: 8
    }),
    check('password', 'Password must be greater than 6 characters, and contain at least one uppercase letter, one lowercase letter, one number, and one special character')
    .isStrongPassword({
        minLength: 6,
        minUppercase: 1,
        minLowercase: 1,
        minNumbers: 1,
        minSymbols: 1
    }),
    check('image').custom((value, { req }) => {
        if (!req.file) {
            return true; // L'image est optionnelle
        }
        const allowedTypes = ['image/jpeg', 'image/png'];
        if (allowedTypes.includes(req.file.mimetype)) {
            return true;
        } else {
            throw new Error("Si vous téléchargez une image, elle doit être au format JPEG ou PNG");
        }
    })
];



export const sendMailVerificationValidator = [
    check('email', 'Invalid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
];
export const passwordResetValidator = [
    check('email', 'Invalid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
];

export const loginValidator = [
    check('identifier')
        .custom((value) => {
            // Vérifie si c'est un email
            const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            // Vérifie si c'est un numéro de téléphone (8 chiffres)
            const isPhone = /^\d{8}$/.test(value);
            
            if (!isEmail && !isPhone) {
                throw new Error('Identifiant invalide. Utilisez un email ou un numéro de téléphone valide');
            }
            return true;
        }),
    check('password', 'Password is required').not().isEmpty(),
];

export const updateProfileValidator = [
    check('name', 'Name is required').not().isEmpty(),
    check('genre', 'genre is required').not().isEmpty(),
    
    check('mobile', 'Mobile No. should contain exactly 8 digits').isLength({
        min: 8,
        max: 8
    }),
    
    
];
export const optMailValidation = [
    check('email', 'Invalid email').isEmail().normalizeEmail({
        gmail_remove_dots: true
    }),
];
export const verifyOptValidator =[
    check('user_id', 'User Id is required').not().isEmail(),
    check('otp', 'Otp is required').not().isEmpty(),
];