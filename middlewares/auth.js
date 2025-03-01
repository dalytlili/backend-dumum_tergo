import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import Blacklist from '../models/blacklist.js'; // Assurez-vous que le chemin est correct

// Charge les variables d'environnement
config();

const VerifyToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(403).json({
            success: false,
            msg: 'A token is required for authentication'
        });
    }

    try {
        const bearerToken = token.split(' ')[1];
        if (!bearerToken) {
            return res.status(403).json({
                success: false,
                msg: 'Token format is incorrect'
            });
        }

        // Vérifiez si le jeton est dans la liste noire
        const blacklistedToken = await Blacklist.findOne({ token: bearerToken });
        if (blacklistedToken) {
            return res.status(400).json({
                success: false,
                msg: 'This session has expired, please try again!'
            });
        }

        // Vérifiez et décodez le jeton
        const decodedData = jwt.verify(bearerToken, process.env.ACCESS_TOKEN_SECRET);
        req.user = decodedData.user; // Assurez-vous que 'user' est la propriété correcte

        next();
    } catch (error) {
        console.error('Error verifying token:', error); // Log d'erreur pour débogage
        return res.status(401).json({
            success: false,
            msg: 'Invalid token'
        });
    }
};

export { VerifyToken };
