import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LampContainer } from "../../components/ui/lamp";
import { DottedGlowBackground } from "../../components/ui/DottedGlowBackground";
import AiLogoStrip from "../../components/ui/AiLogoStrip";
import "../../styles/auth.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError("Invalid email or password");
    } finally {
      setLoading(false);
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
        <div className="wrapper auth-card">
          {/* LEFT – AI STRIP */}
          <div className="illustration">
            <div className="illustration-card illustration-card--ai">
              <AiLogoStrip />
            </div>
          </div>

          {/* RIGHT – LOGIN FORM */}
          <div className="form">
            <div className="heading">Login</div>
            <p className="subheading">
              Access your ChatZ account to manage AI chats, notes and projects.
            </p>

            {error && <p className="error-text small">{error}</p>}

            <form onSubmit={handleSubmit}>
              <div>
                <label>Email</label>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label>Password</label>
                <div className="input-with-icon">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={handleChange}
                    required
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
              </div>

              {/* forgot password */}
              <div
                style={{
                  textAlign: "right",
                  marginTop: "-0.2rem",
                  marginBottom: "0.6rem",
                }}
              >
                <Link
                  to="/forgot-password"
                  className="link-accent"
                  style={{ fontSize: "0.78rem" }}
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>

            <p className="switch-text">
              Don’t have an account?{" "}
              <Link to="/signup" className="link-accent">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LampContainer>
  );
}
