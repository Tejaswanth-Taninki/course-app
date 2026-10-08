const crypto = require('crypto');

const sessions = new Map();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;

const createSession = (role, userId = null, extra = {}) => {
  const token = crypto.randomBytes(48).toString('hex');

  sessions.set(token, {
    role,
    userId,
    ...extra,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  });

  return token;
};

const getSession = (token) => {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
};

const auth = (role) => (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace(/^Bearer\s+/i, '');

  const session = getSession(token);

  if (!session) {
    return res.status(401).json({
      message: 'Your session has expired or is invalid. Please sign in again.',
    });
  }

  if (role && session.role !== role) {
    return res.status(403).json({
      message: 'Access denied: You do not have permission for this action.',
    });
  }

  req.session = session;
  next();
};

module.exports = {
  auth,
  createSession,
  getSession,
  sessions,
};
