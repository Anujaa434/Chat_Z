// backend/src/utils/jwt.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const tokenBlacklist = new Map();

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET);
}

function blacklistToken(token, expSec) {
  try {
    if (!expSec) {
      const decoded = jwt.decode(token);
      if (decoded && decoded.exp) expSec = decoded.exp;
    }
    if (!expSec) return;
    tokenBlacklist.set(token, expSec * 1000);
  } catch (e) { /* ignore */ }
}

function isTokenBlacklisted(token) {
  const expiry = tokenBlacklist.get(token);
  if (!expiry) return false;
  if (Date.now() > expiry) {
    tokenBlacklist.delete(token);
    return false;
  }
  return true;
}

module.exports = {
  signToken,
  verifyToken,
  blacklistToken,
  isTokenBlacklisted,
};
