const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'kiranago_super_secret_jwt_key_2026';

const protect = (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (req.headers.cookie) {
    const rawCookie = req.headers.cookie.split(';').find(c => c.trim().startsWith('token='));
    if (rawCookie) {
      token = rawCookie.split('=')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user ? req.user.role : 'GUEST'}) is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = { protect, authorize, JWT_SECRET };
