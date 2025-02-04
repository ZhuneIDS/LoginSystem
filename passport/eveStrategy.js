const OAuth2Strategy = require('passport-oauth2');
const { EVE_ID, EVE_SECRET } = require('../config/config'); // Correct path to config.js


module.exports = new OAuth2Strategy({
  authorizationURL: 'https://login.eveonline.com/oauth/authorize',
  tokenURL: 'https://login.eveonline.com/oauth/token',
  clientID: EVE_ID,
  clientSecret: EVE_SECRET,
  callbackURL: "https://localhost:3000/auth/eve/callback",
  scope: [
    'publicData',
    'esi-location.read_location.v1',
    // Add other scopes here
  ]
}, async (accessToken, refreshToken, params, profile, done) => {
  profile.accessToken = accessToken;
  console.log("EVE Online accessToken:", accessToken);
  console.log("EVE Online refreshToken:", refreshToken);
  console.log("EVE Online params:", params);
  console.log("Granted Scopes:", params.scope);
  try {
    const response = await axios.get('https://login.eveonline.com/oauth/verify', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    profile = response.data;
    profile.accessToken = accessToken;
    console.log("EVE Online profile:", profile);
    return done(null, profile);
  } catch (error) {
    console.error("Error fetching EVE Online profile:", error);
    return done(error);
  }
});