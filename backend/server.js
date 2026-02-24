const express = require('express');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;
const cors = require('cors');

const app = express();

// CORS configuration
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
    process.env.FRONTEND_URL
].filter(Boolean).map(url => url.replace(/\/$/, "")); // Remove trailing slash

app.use(cors({
    origin: function (origin, callback) {
        // allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");

        // Match specific origins OR any vercel.app subdomain
        if (
            allowedOrigins.indexOf(cleanOrigin) !== -1 ||
            cleanOrigin.endsWith('.vercel.app') ||
            allowedOrigins.includes('*')
        ) {
            callback(null, true);
        } else {
            console.log("CORS blocked for origin:", origin);
            console.log("Allowed origins represent:", allowedOrigins);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));


app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Connect to database
connectDB();

app.get('/', (req, res) => res.send('Server is running'));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Error Handler
app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));