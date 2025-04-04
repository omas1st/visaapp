require('dotenv').config();
const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();

// Database connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET_KEY,
  resave: false,
  saveUninitialized: true
}));

// Routes
app.use('/', require('./routes/visa'));

const countries = require('countries-list').countries;
const countryNames = Object.values(countries).map(c => c.name);

router.get('/', (req, res) => res.render('page1', { countries: countryNames }));
router.get('/page2', (req, res) => res.render('page2', { 
    data: req.session.page1,
    countries: countryNames
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));