import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import userRoute from "./routes/userRouter.js";
import authRoute from "./routes/authRouter.js";
import dotenv from 'dotenv';
import passport from "./config/passport.js";
import session from "express-session";
import path from 'path'; // تم إضافة هذا السطر

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9098;
const databaseName = 'dumum_tergo';

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

mongoose.connect(`mongodb+srv://mohammedalitlili:mwxWZME8ju5chsDN@cluster0.xfhzvke.mongodb.net/${databaseName}`, {
  // يمكنك إزالة هذه الخيارات إن كنت تستخدم MongoDB Driver 4.0+
  // useNewUrlParser: true,
  // useUnifiedTopology: true,
})
.then(() => {
  console.log(`Connected to MongoDB database: ${databaseName}`);
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

app.use(
  session({
      secret: "WZAhWqMl2k",
      resave: false,
      saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

// تعيين المسار للقوالب
app.set('view engine', 'ejs');

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/images'));
app.use('/api', userRoute);
app.use('/', authRoute);


// route pour l'authentification
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// callback après l'authentification
app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // succès de l'authentification, redirection vers /dashboard
    res.redirect('/dashboard');
  });



app.use(notFoundError);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
