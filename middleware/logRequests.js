module.exports = (req, res, next) => {
    console.log(`Received a ${req.method} request for ${req.url}`);
    next();
  };