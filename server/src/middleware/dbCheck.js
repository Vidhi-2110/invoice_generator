/**
 * Middleware: Guards any route that requires an active DB connection.
 * Returns 503 immediately if the MongoDB client is not available,
 * so controllers never need to repeat this check.
 */
function dbCheck(req, res, next) {
  if (!req.app.locals.dbClient) {
    return res.status(503).json({ error: 'Database not connected. Please try again later.' });
  }
  next();
}

module.exports = { dbCheck };
