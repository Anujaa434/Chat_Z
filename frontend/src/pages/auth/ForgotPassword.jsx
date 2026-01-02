import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../api/auth.axios";
import { LampContainer } from "../../components/ui/lamp";
import { DottedGlowBackground } from "../../components/ui/DottedGlowBackground";
import AiLogoStrip from "../../components/ui/AiLogoStrip";
import "../../styles/auth.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await forgotPassword(email);
      setMsg(res?.message || "Reset link has been sent.");
    } catch {
      // intentionally generic (security best practice)
      setMsg("You’ll receive an email with reset instructions shortly.");
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
          {/* LEFT – AI STRIP (same as login/signup) */}
          <div className="illustration">
            <div className="illustration-card illustration-card--ai">
              <AiLogoStrip />
            </div>
          </div>

          {/* RIGHT – FORGOT PASSWORD FORM */}
          <div className="form">
            <div className="heading">Forgot Password</div>
            <p className="subheading">
              We’ll send a secure reset link to your email address.
            </p>

            {/* reserved message space – does NOT shift layout */}
            {msg && (
              <p className="subheading" style={{ fontSize: "0.82rem" }}>
                {msg}
              </p>
            )}

            <form onSubmit={handleSubmit}>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="primary-btn"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>

            <p className="switch-text">
              <Link to="/login" className="link-accent">
                Back to login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </LampContainer>
  );
}
