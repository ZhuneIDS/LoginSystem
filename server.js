const https = require('https');
const app = require('./app'); // Your main Express app
const { SSL_OPTIONS } = require('./config/config'); // Correct path to config.js

https.createServer(SSL_OPTIONS, app).listen(3000, () => {
  console.log('Server started on port 3000');
});