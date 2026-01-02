// frontend/src/pages/auth/Signup.jsx
import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { LampContainer } from "../../components/ui/lamp";
import { DottedGlowBackground } from "../../components/ui/DottedGlowBackground";
import AiLogoStrip from "../../components/ui/AiLogoStrip";
import "../../styles/auth.css";
import { signup } from "../../api/auth.axios";


export default function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("Anuja"); // optional default
  const [email, setEmail] = useState("anuja@test.com");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (pw) => {
    if (!pw) return "";
    const ok = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(pw);
    return ok
      ? ""
      : "Min 8 chars, include upper, lower, number, special";
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name || !email || !password) {
      setError("Please fill all fields");
      return;
    }

    const pErr = validatePassword(password);
    if (pErr) {
      setError("Password does not meet requirements");
      return;
    }

    setBusy(true);
    try {
      // call frontend/api -> which calls backend
      const data = await signup({ name, email, password });

      // adapt depending on backend response:
      // some backends return { message: "...", user: {...} }
      // some return { token, user } (auto-login).
      if (data.token) {
        // if backend returned token automatically, store it and go to /app
        localStorage.setItem("token", data.token);
        // setAuthToken is used in your AuthContext when token changes,
        // but if you want immediate axios header here you can import and set it.
        navigate("/dashboard");
      } else {
        // otherwise show success and navigate to login
        setSuccessMsg(data.message || "Account created. Please login.");
        setTimeout(() => {
          navigate("/login");
        }, 900);
      }
    } catch (err) {
      console.error("signup error:", err);
      // axios network error
      const msg = err?.response?.data?.message || err?.message || "Network Error";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <LampContainer>
      <DottedGlowBackground
        className="auth-dotted-bg"
        opacity={0.7}
        gap={16}
        radius={1.4}
        color="rgba(37, 99, 235, 0.85)"
        glowColor="rgba(56, 189, 248, 0.9)"
        backgroundOpacity={0.12}
        speedMin={0.4}
        speedMax={1.1}
        speedScale={0.9}
      />

      <div className="signup-page">
        <div className="wrapper signUp auth-card">
          {/* LEFT – AI STRIP */}
          <div className="illustration">
            <div className="illustration-card illustration-card--ai">
              <AiLogoStrip />
            </div>
          </div>

          {/* RIGHT – SIGNUP FORM */}
          <div className="form">
            <div className="heading">Create Account</div>
            <p className="subheading">
              Set up your ChatZ account to start organizing your AI chats, notes
              and projects.
            </p>

            {error && <div style={{ color: "tomato", marginBottom: 8 }}>{error}</div>}
            {successMsg && <div style={{ color: "limegreen", marginBottom: 8 }}>{successMsg}</div>}

            <form onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <div className="input-with-icon">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Choose a password"
                    value={password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setPassword(v);
                      setPasswordError(validatePassword(v));
                    }}
                  />
                  <button
                    type="button"
                    className="input-icon-toggle"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff size={18} aria-hidden="true" />
                    ) : (
                      <Eye size={18} aria-hidden="true" />
                    )}
                  </button>
                </div>
                {password && passwordError && (
                  <div className="error-text small" style={{ marginTop: 4 }}>{passwordError}</div>
                )}
              </div>

              <button type="submit" className="primary-btn" disabled={busy || !!passwordError}>
                {busy ? "Creating..." : "Sign Up"}
              </button>
            </form>

            <p className="switch-text">
              Already have an account?{" "}
              <Link to="/login" className="link-accent">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LampContainer>
  );
}
