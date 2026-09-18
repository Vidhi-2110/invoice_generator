const jwt = require('jsonwebtoken');

/**
 * Middleware: Verifies JWT from Authorization header.
 * Attaches decoded user payload to req.user on success.
 * Returns 401 if token is missing or invalid.
 */
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
};

module.exports = { protect };
