// backend/src/middlewares/auth.middleware.js
const { verifyToken, isTokenBlacklisted } = require("../utils/jwt");

async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Missing Authorization header" });
    }
    const token = authHeader.split(" ")[1];

    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ error: "Token revoked" });
    }

    const payload = verifyToken(token);
    // normalize `id` for tokens that may have `sub`
    const normalized = { ...payload };
    if (!normalized.id && normalized.sub) normalized.id = normalized.sub;
    // attach user id/email etc.
    req.user = normalized;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports = {
  requireAuth,
};
