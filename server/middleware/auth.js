const jwt = require('jsonwebtoken');

// Security guard: only lets requests through if they have a valid token
module.exports = function protect(req, res, next) {
  const header = req.headers.authorization;


  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not logged in' });
  }

  // Check the token is real and not expired
  try {
    const token = header.split(' ')[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next(); // token is good, let them through
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};