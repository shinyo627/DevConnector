const jwt = require('jsonwebtoken');
const config = require('config');

// Middleware functions are just functions that has access in request/respond cycle and next is there to run once the middleware processing is done to exit
module.exports = (req, res, next) => {
  // Get token from header key x-auth-token that comes from global header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, config.get('jwtSecret'));

    // assigning req object an user object which holds key value of id: user.id
    req.user = decoded.user;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Token is not Valid' });
  }
};
