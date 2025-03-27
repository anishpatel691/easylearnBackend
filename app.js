import express from 'express';
import cookieParser from 'cookie-parser';
import routes from './Routes/index.js';
import ConectDb from './database.js'; // Import the connectDB function
import authRoutes from './Routes/auth.routes.js';
import Crouter from './Routes/course.routes.js';
import cors from 'cors';
import Forgrtrouter from './Routes/forgotPasswordRoutes.js';
// Load environment variables from .env file
import dotenv from 'dotenv';
import Paymenrouter from './Routes/paymentRoutes.js';
import emailrouter from './Routes/emailRoutes.js';
import Prorouter from './Routes/progressRoutes.js';
import paymentRoutes from './Routes/payment.routes.js';
import getuserrouter from './Routes/getusers.js';
dotenv.config({
    path: './.env'
})

const app = express();


app.use(cors({
  origin: 'https://easylearn-wine.vercel.app/',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));



// Connect to MongoDB
ConectDb();
app.use('/api/payments',Paymenrouter)
app.use('/api/auth',Forgrtrouter);
app.use('/api', routes);
app.use('/api/auth', authRoutes);// for logout user
app.use("/api/courses", Crouter); 
app.use("/api/courses/:id", Crouter);
app.use('/api/email', emailrouter);
app.use('/api/payments', paymentRoutes);
app.use('/api',Prorouter);
app.use('/api', getuserrouter);

app.get('/', (req, res) => {
  res.send('Online Course Platform Backend');
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started...`);
  console.log(`http://localhost:${PORT}`);
});
