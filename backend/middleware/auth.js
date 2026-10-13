const crypto = require('crypto');

const sessions = new Map();
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'btech-course-registration-system-secret-key-2025';

const signToken = (payload) => {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${hmac}`;
};

const verifyToken = (token) => {
  if (!token || typeof token !== 'string' || !token.includes('.')) return null;
  const [data, hmac] = token.split('.');
  if (!data || !hmac) return null;

  const expectedHmac = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  if (hmac !== expectedHmac) return null;

  try {
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (payload.expiresAt && payload.expiresAt < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

const createSession = (role, userId = null, extra = {}) => {
  const sessionData = {
    role,
    userId,
    ...extra,
    expiresAt: Date.now() + SESSION_DURATION_MS,
  };

  const token = signToken(sessionData);
  sessions.set(token, sessionData);
  return token;
};

const getSession = (token) => {
  if (!token) return null;

  // 1. Check in-memory map first
  const memorySession = sessions.get(token);
  if (memorySession) {
    if (memorySession.expiresAt < Date.now()) {
      sessions.delete(token);
      return null;
    }
    return memorySession;
  }

  // 2. Cryptographic token verification (persists seamlessly across server/nodemon restarts)
  const decoded = verifyToken(token);
  if (decoded) {
    sessions.set(token, decoded);
    return decoded;
  }

  return null;
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
