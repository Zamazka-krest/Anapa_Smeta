// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey-anapa-smeta';

module.exports = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.redirect('/');
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, full_name, role }
    next();
  } catch (err) {
    res.clearCookie('token');
    return res.redirect('/');
  }
};