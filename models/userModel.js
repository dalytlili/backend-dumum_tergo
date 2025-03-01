import mongoose from 'mongoose';

// Définir le schéma de l'utilisateur
const userSchema = new mongoose.Schema({
    name: {
        type: String,
       required: true
    },
    genre: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_verified: {
        type: Number,
        default: 0
    },
    image: {
        type: String,
        required: true
    }
});

// Exporter le modèle User
const User = mongoose.model('User', userSchema);
export default User;
