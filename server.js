import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";
import cors from "cors";
import { notFoundError, errorHandler } from "./middlewares/error-handler.js";
import userRoute from "./routes/userRouter.js";
import authRoute from "./routes/authRouter.js";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9098;
const databaseName = 'dumum_tergo';

mongoose.set('debug', true);
mongoose.Promise = global.Promise;

mongoose.connect(`mongodb+srv://mohammedalitlili:mwxWZME8ju5chsDN@cluster0.xfhzvke.mongodb.net/${databaseName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log(`Connected to MongoDB database: ${databaseName}`);
})
.catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

app.set('view engine','ejs');
app.set('views',)

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/img', express.static('public/images'));
app.use('/api', userRoute);
app.use('/', authRoute);

app.get('/oauth2callback', (req, res) => {
 
  res.send('OAuth2 callback received!');
});

app.use(notFoundError);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
