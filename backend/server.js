const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
const cors = require('cors');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Connect to database
connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
// Allow both your local environment and your production Vercel URL
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'https://your-app-name.vercel.app' // Replace with your actual Vercel URL
    ],
    credentials: true
}));