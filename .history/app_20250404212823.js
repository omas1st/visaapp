// app.js
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Log environment info (avoid printing sensitive data, just verify they are set)
console.log('MONGO_URI set:', !!process.env.MONGO_URI);
console.log('SECRET_KEY set:', !!process.env.SECRET_KEY);
console.log('PORT:', process.env.PORT);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        ttl: 24 * 60 * 60,
        autoRemove: 'interval',
        autoRemoveInterval: 10 // Minutes
    }),
    cookie: { 
        // Only use secure cookies in production (HTTPS)
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
const visaRouter = require('./routes/visa');
app.use('/', visaRouter);


// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        title: 'Application Error',
        message: 'Something went wrong! Please try again later.'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
