import { useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await API.post("/auth/forgot-password", { email });
      setSent(true);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Something went wrong. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "var(--navy)",
      fontFamily: "var(--font-body)",
      padding: "32px 24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background orbs */}
      <div style={{
        position: "absolute", top: -200, right: -200,
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(255,192,5,0.07) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: -150, left: -150,
        width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(26,58,122,0.6) 0%, transparent 65%)",
        pointerEvents: "none",
      }} />

      {/* Gold top accent */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, height: 3,
        background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
      }} />

      <div style={{
        width: "100%", maxWidth: 420,
        position: "relative", zIndex: 10,
      }} className="fade-up">

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%",
            background: "rgba(255,192,5,0.08)",
            border: "1.5px solid rgba(255,192,5,0.2)",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            padding: 12, overflow: "hidden",
          }}>
            <img
              src="/upsa-logo.png" alt="UPSA"
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                filter: "brightness(1.15)",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <p style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 800, fontSize: 14,
            color: "var(--gold)",
          }}>
            GradeIQ UPSA
          </p>
        </div>

        {/* Card */}
        <div style={{
          background: "var(--bg-card)",
          borderRadius: "var(--radius-xl)",
          padding: "40px 36px",
          boxShadow: `
            0 0 0 1px rgba(8,28,70,0.06),
            0 4px 6px rgba(8,28,70,0.04),
            0 20px 60px rgba(8,28,70,0.15)
          `,
        }}>

          {/* Top accent */}
          <div style={{
            width: 40, height: 3,
            background: "linear-gradient(90deg, var(--navy), var(--gold))",
            borderRadius: 999, marginBottom: 28,
          }} />

          {sent ? (
            // ================================
            // SUCCESS STATE
            // ================================
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64,
                borderRadius: "50%",
                background: "var(--green-bg)",
                border: "2px solid var(--green-border)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                fontSize: 28,
              }}>
                ✅
              </div>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 22,
                color: "var(--navy)", marginBottom: 12,
                letterSpacing: "-0.02em",
              }}>
                Check your email
              </h2>
              <p style={{
                color: "var(--text-muted)",
                fontSize: 14, lineHeight: 1.7,
                marginBottom: 20,
              }}>
                If <strong style={{ color: "var(--navy)" }}>{email}</strong> is
                registered on GradeIQ UPSA, you will receive a password
                reset link shortly. Check your inbox and spam folder.
              </p>
              <p style={{
                color: "var(--text-muted)",
                fontSize: 13, lineHeight: 1.6,
                marginBottom: 28,
                padding: "12px 16px",
                background: "var(--bg-page)",
                borderRadius: "var(--radius-md)",
              }}>
                The link expires in <strong>1 hour</strong>.
                If you don't receive it, check your spam folder or try again.
              </p>
              <Link
                to="/login"
                className="btn btn-primary btn-lg btn-full"
              >
                ← Back to Login
              </Link>
            </div>
          ) : (
            // ================================
            // FORM STATE
            // ================================
            <>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 24,
                color: "var(--navy)", marginBottom: 8,
                letterSpacing: "-0.02em",
              }}>
                Forgot your password? 🔐
              </h2>

              <p style={{
                color: "var(--text-muted)",
                fontSize: 14, marginBottom: 16,
                lineHeight: 1.6,
              }}>
                Enter your email address and we'll send you a link
                to reset your password.
              </p>

              {/* Gmail notice */}
              <div style={{
                background: "var(--amber-bg)",
                border: "1px solid var(--amber-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 14px",
                marginBottom: 24,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
              }}>
                <span style={{ fontSize: 14, flexShrink: 0 }}>⚠️</span>
                <p style={{
                  fontSize: 12,
                  color: "var(--amber)",
                  lineHeight: 1.7,
                  margin: 0,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 500,
                }}>
                  Reset emails currently only work for{" "}
                  <strong>Gmail addresses</strong>.
                  If you registered with a different email, contact support:
                  <br />
                  📧 <strong>ahenkorajoshuaowusu@outlook.com</strong>
                  <br />
                  📞 <strong>+233 537 041 324</strong>
                </p>
              </div>

              {error && (
                <div className="alert alert-red" style={{ marginBottom: 20 }}>
                  <span>⚠️</span>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="form-group" style={{ marginBottom: 24 }}>
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    placeholder="you@gmail.com"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    required
                    className="form-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg btn-full"
                  style={{ marginBottom: 20 }}
                >
                  {loading ? (
                    <><span className="spinner" />Sending reset link...</>
                  ) : "Send Reset Link →"}
                </button>
              </form>

              <p style={{
                textAlign: "center",
                fontSize: 14,
                color: "var(--text-muted)",
              }}>
                Remember your password?{" "}
                <Link to="/login" style={{
                  color: "var(--navy)",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  borderBottom: "2px solid var(--gold)",
                  paddingBottom: 1,
                }}>
                  Sign in →
                </Link>
              </p>
            </>
          )}

        </div>

        <p style={{
          textAlign: "center",
          fontSize: 11, color: "rgba(255,255,255,0.2)",
          marginTop: 20, lineHeight: 1.7,
          fontFamily: "var(--font-heading)",
        }}>
          University of Professional Studies, Accra
          <br />
          © 2026 GradeIQ UPSA · Developed by Ahenkora Joshua Owusu
        </p>

      </div>

    </div>
  );
}