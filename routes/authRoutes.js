const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get('/auth/bnet', passport.authenticate('bnet'));

router.get('/auth/bnet/callback', passport.authenticate('bnet', { failureRedirect: '/' }), (req, res) => {
  req.session.bnetProfile = req.user;
  res.redirect("/success");
});

router.get('/auth/eve', passport.authenticate('eve'));

router.get('/auth/eve/callback', passport.authenticate('eve', { failureRedirect: '/' }), (req, res) => {
  req.session.eveProfile = req.user;
  res.redirect("https://localhost:3000/success");
});

module.exports = router;