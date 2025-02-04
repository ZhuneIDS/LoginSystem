const fs = require('fs');
require('dotenv').config();

module.exports = {
  BNET_ID: process.env.BNET_ID,
  BNET_SECRET: process.env.BNET_SECRET,
  EVE_ID: process.env.EVE_ID,
  EVE_SECRET: process.env.EVE_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your_secret_key',
  SSL_OPTIONS: {
    key: fs.readFileSync('server.key'),
    cert: fs.readFileSync('server.cert')
  }
};