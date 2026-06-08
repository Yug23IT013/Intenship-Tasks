/**
 * Middleware factory: Restrict access to specific roles.
 * Must be used AFTER verifyToken middleware.
 * 
 * Usage: router.get('/admin', verifyToken, requireRole('admin'), handler)
 *        router.get('/both', verifyToken, requireRole('admin', 'user'), handler)
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access forbidden. Required role: ${roles.join(' or ')}.`,
        yourRole: req.user.role,
      });
    }

    next();
  };
};

module.exports = { requireRole };
