import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/userModel.js";
import dotenv from "dotenv";

dotenv.config();

passport.use(
    new GoogleStrategy(
        {
            clientID: '92724250243-rr490mem3lnoprpmhdgpgjj9fbbftpgg.apps.googleusercontent.com',
            clientSecret: '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',
            callbackURL: "http://localhost:9098/auth/google/callback",
            scope: ["profile", "email"] 
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // Ajoutez cette ligne pour afficher le profil de l'utilisateur
                console.log('Google Profile:', profile);

                let user = await User.findOne({ googleId: profile.id });

                if (!user) {
                    user = new User({
                        name: profile.displayName,
                        email: profile.emails[0].value,
                        googleId: profile.id,
                        image: profile.photos[0].value,
                        is_verified: 1,
                    });

                    await user.save();
                }

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    const user = await User.findById(id);
    done(null, user);
});


export default passport;
