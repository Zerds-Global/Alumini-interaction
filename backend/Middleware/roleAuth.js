/**
 * AuthN/AuthZ Middleware
 * - authenticate: verifies JWT and loads req.user from DB
 * - requireRoles: ensures req.user.role is one of allowed
 * - helpers for college scoping and self-access
 */
const jwt = require('jsonwebtoken');
const User = require('../Model/UserModel');

// Verify Bearer token and attach user to req
const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized: missing token' });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET || 'dev_change_me');
    const user = await User.findById(payload.sub || payload.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized: user not found' });
    }
    req.user = user; // attach sanitized user
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized: invalid or expired token', error: err.message });
  }
};

// Require certain roles
const requireRoles = (allowedRoles = []) => (req, res, next) => {
  try {
    if (!req.user?.role) return res.status(401).json({ message: 'Unauthorized' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: `Forbidden: requires ${allowedRoles.join(' or ')}` });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error checking role', error: err.message });
  }
};

// Allow if same user or has one of roles
const requireSelfOrRoles = (getTargetUserId) => (roles = []) => async (req, res, next) => {
  try {
    const targetId = getTargetUserId(req);
    if (req.user && targetId && String(req.user._id) === String(targetId)) return next();
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({ message: 'Forbidden' });
  } catch (err) {
    return res.status(500).json({ message: 'Error checking access', error: err.message });
  }
};

// Allow if same college or superadmin; admins restricted to their college
const requireSameCollegeOrSuper = (getTargetCollegeId) => async (req, res, next) => {
  try {
    if (req.user?.role === 'superadmin') return next();
    const targetCollegeId = getTargetCollegeId(req);
    if (!targetCollegeId || !req.user?.collegeId) return res.status(403).json({ message: 'Forbidden: college scope missing' });
    if (String(targetCollegeId) !== String(req.user.collegeId)) {
      return res.status(403).json({ message: 'Forbidden: cross-institution access denied' });
    }
    next();
  } catch (err) {
    return res.status(500).json({ message: 'Error checking college scope', error: err.message });
  }
};

// Convenience exports
const isAlumni = requireRoles(['alumni']);
const isStudent = requireRoles(['student']);
const isAdmin = requireRoles(['admin']);
const isSuperAdmin = requireRoles(['superadmin']);
module.exports = {
  authenticate,
  requireRoles,
  requireSelfOrRoles,
  requireSameCollegeOrSuper,
  // convenience (strict single-role helpers only)
  isAlumni,
  isStudent,
  isAdmin,
  isSuperAdmin,
};
