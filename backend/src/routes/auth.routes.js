const express = require("express");
const router = express.Router();

const {
  signup,
  login,
  logout,
  profile,
  verifyEmail,
  forgotPassword,
  resetPassword,
} = require("../controllers/auth.controller");

const { verifyToken, isTokenBlacklisted } = require("../utils/jwt");

// ================= AUTH MIDDLEWARE =================
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: "Missing token" });

  const token = auth.replace(/^Bearer\s*/i, "");
  try {
    if (isTokenBlacklisted(token)) {
      return res.status(401).json({ message: "Token revoked" });
    }

    const payload = verifyToken(token);
    const id = payload.id || payload.sub; // normalize
    req.user = {
      id,
      email: payload.email,
      name: payload.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ================= ROUTES =================

// auth
router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

// profile
router.get("/profile", authMiddleware, profile);

// password & verification
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/verify-email", verifyEmail);

module.exports = router;
