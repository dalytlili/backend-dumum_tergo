import mongoose from 'mongoose';

// Définir le schéma de l'utilisateur
const userSchema = new mongoose.Schema({
    name: {
        type: String,
       required: true
    },
    genre: {
        type: String,
        required: false
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: false
    },
    googleId: { type: String, unique: true, sparse: true }, // sparse permet d'accepter null
    password: { 
        type: String, 
        required: function() { return !this.googleId; } // ✅ Le mot de passe est requis seulement si googleId est absent
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
