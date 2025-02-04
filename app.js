const express = require('express');
const passport = require('passport');
const session = require('express-session');
const path = require('path');
const config = require('./config/config');
const authRoutes = require('./routes/authRoutes');
const apiRoutes = require('./routes/apiRoutes');
const eveStrategy = require('./passport/eveStrategy'); // Import the EVE strategy

// Initialize Express app
const app = express();

// Session middleware
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Passport initialization
app.use(passport.initialize());
app.use(passport.session());

// Register the EVE strategy
passport.use('eve', eveStrategy); // Register the EVE strategy with Passport


// Serialize and deserialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Static files
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', authRoutes); // Authentication routes
app.use('/api', apiRoutes); // API routes

// Home route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Success route
app.get('/success', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'success.html'));
});

// Profile data route
app.get('/profile-data', (req, res) => {
  const profileData = {
    bnetProfile: req.session.bnetProfile || null,
    eveProfile: req.session.eveProfile || null
  };
  res.json(profileData);
});

// Export the app for use in server.js
module.exports = app;