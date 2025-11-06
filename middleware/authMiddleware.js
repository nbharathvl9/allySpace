const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET ;

const authMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Access denied. No token provided.');

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // Add user info to request
    next();
  } catch (err) {
    res.status(400).send('Invalid token');
  }
};

module.exports = authMiddleware;
