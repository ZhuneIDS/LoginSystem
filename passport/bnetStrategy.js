const BnetStrategy = require('passport-bnet').Strategy;
const { BNET_ID, BNET_SECRET } = require('../config');

module.exports = new BnetStrategy({
  clientID: BNET_ID,
  clientSecret: BNET_SECRET,
  callbackURL: "https://localhost:3000/auth/bnet/callback",
  region: "us",
  scope: ["openid", "wow.profile"]
}, (accessToken, refreshToken, profile, done) => {
  profile.token = accessToken;
  console.log("Battle.net profile:", profile);
  return done(null, profile);
});