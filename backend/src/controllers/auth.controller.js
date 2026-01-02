const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { signToken, verifyToken, blacklistToken } = require("../utils/jwt");
const { sendEmail } = require("../utils/sendEmail");

function isStrongPassword(pw) {
  if (typeof pw !== "string") return false;
  // min 8, at least 1 upper, 1 lower, 1 digit, 1 special
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
}

// ================= SIGNUP =================
async function signup(req, res) {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields required" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (exists.length) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES (?, ?, ?)`,
      [name, email, password_hash]
    );

    const token = signToken({
      id: result.insertId,
      email: email,
      name: name,
    });

    return res.status(201).json({
      message: "Account created successfully",
      token,
      user: {
        id: result.insertId,
        name: name,
        email: email,
      },
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ================= LOGIN =================
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email & password required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔑 IMPORTANT: include `id` explicitly
    const token = signToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ================= VERIFY EMAIL =================
async function verifyEmail(req, res) {
  const { token } = req.query;
  if (!token) {
    return res.status(400).json({ message: "Invalid token" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id FROM users WHERE email_verify_token = ? LIMIT 1",
      [token]
    );

    if (!rows.length) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    await pool.query(
      `UPDATE users
       SET is_verified = true, email_verify_token = NULL
       WHERE id = ?`,
      [rows[0].id]
    );

    return res.json({ message: "Email verified successfully" });
  } catch (err) {
    console.error("Verify email error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ================= FORGOT PASSWORD =================
async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const resetToken = crypto.randomBytes(32).toString("hex");

    await pool.query(
      "UPDATE users SET reset_password_token = ? WHERE email = ?",
      [resetToken, email]
    );

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    await sendEmail({
      to: email,
      subject: "Reset your ChatZ password",
      html: `<a href="${resetLink}">${resetLink}</a>`,
    });

    return res.json({ message: "If email exists, reset link sent" });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.json({ message: "If email exists, reset link sent" });
  }
}

// ================= RESET PASSWORD =================
async function resetPassword(req, res) {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json({ message: "Invalid request" });
  }

  if (!isStrongPassword(password)) {
    return res.status(400).json({
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    });
  }

  try {
    const hash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `UPDATE users
       SET password_hash = ?, reset_password_token = NULL
       WHERE reset_password_token = ?`,
      [hash, token]
    );

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ message: "Server error" });
  }
}

// ================= PROFILE =================
async function profile(req, res) {
  return res.json({ user: req.user });
}

// ================= LOGOUT =================
async function logout(req, res) {
  const token = req.headers.authorization?.replace(/^Bearer\s*/i, "");
  if (!token) {
    return res.json({ message: "Logged out" });
  }

  try {
    const decoded = verifyToken(token);
    blacklistToken(token, decoded.exp);
  } catch (err) {
    console.error("Logout error:", err);
  }

  return res.json({ message: "Logged out" });
}

module.exports = {
  signup,
  login,
  profile,
  logout,
  verifyEmail,
  forgotPassword,
  resetPassword,
};

