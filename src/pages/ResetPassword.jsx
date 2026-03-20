import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    password: "", confirm_password: "",
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Verify token on mount
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setError("Invalid reset link. Please request a new one.");
        setVerifying(false);
        return;
      }
      try {
        await API.get(`/auth/verify-reset-token/${token}`);
        setTokenValid(true);
      } catch (err) {
        setError(
          err.response?.data?.detail ||
          "This reset link is invalid or has expired."
        );
      } finally {
        setVerifying(false);
      }
    };
    verifyToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await API.post("/auth/reset-password", {
        token,
        new_password: form.password,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to reset password. Try again."
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
        <div style={{
          textAlign: "center", marginBottom: 32,
        }}>
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

          {/* VERIFYING */}
          {verifying && (
            <div style={{
              textAlign: "center", padding: "40px 0",
            }}>
              <div className="spinner spinner-dark spinner-lg"
                style={{ margin: "0 auto 16px" }}
              />
              <p style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600, fontSize: 14,
                color: "var(--navy)",
              }}>
                Verifying your reset link...
              </p>
            </div>
          )}

          {/* INVALID TOKEN */}
          {!verifying && !tokenValid && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--red-bg)",
                border: "2px solid var(--red-border)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px", fontSize: 28,
              }}>
                ❌
              </div>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 22,
                color: "var(--navy)", marginBottom: 12,
              }}>
                Invalid Reset Link
              </h2>
              <p style={{
                color: "var(--text-muted)",
                fontSize: 14, lineHeight: 1.7,
                marginBottom: 28,
              }}>
                {error}
              </p>
              <Link
                to="/forgot-password"
                className="btn btn-primary btn-lg btn-full"
                style={{ marginBottom: 12 }}
              >
                Request New Reset Link
              </Link>
              <Link
                to="/login"
                className="btn btn-outline btn-full"
              >
                ← Back to Login
              </Link>
            </div>
          )}

          {/* SUCCESS */}
          {!verifying && success && (
            <div style={{ textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "var(--green-bg)",
                border: "2px solid var(--green-border)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px", fontSize: 28,
              }}>
                
              </div>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 22,
                color: "var(--navy)", marginBottom: 12,
              }}>
                Password Reset! 
              </h2>
              <p style={{
                color: "var(--text-muted)",
                fontSize: 14, lineHeight: 1.7,
                marginBottom: 28,
              }}>
                Your password has been updated successfully.
                Redirecting you to login in 3 seconds...
              </p>
              <Link
                to="/login"
                className="btn btn-primary btn-lg btn-full"
              >
                Sign In Now →
              </Link>
            </div>
          )}

          {/* RESET FORM */}
          {!verifying && tokenValid && !success && (
            <>
              <h2 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 24,
                color: "var(--navy)", marginBottom: 8,
                letterSpacing: "-0.02em",
              }}>
                Set New Password 
              </h2>
              <p style={{
                color: "var(--text-muted)",
                fontSize: 14, marginBottom: 28,
                lineHeight: 1.6,
              }}>
                Choose a strong password for your GradeIQ UPSA account.
              </p>

              {error && (
                <div className="alert alert-red" style={{ marginBottom: 20 }}>
                  <span>⚠️</span>{error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 16, marginBottom: 24,
                }}>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={(e) => {
                        setForm({ ...form, password: e.target.value });
                        setError("");
                      }}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      placeholder="Re-enter your new password"
                      value={form.confirm_password}
                      onChange={(e) => {
                        setForm({ ...form, confirm_password: e.target.value });
                        setError("");
                      }}
                      required
                      className="form-input"
                    />
                  </div>

                  {/* Password strength indicator */}
                  {form.password && (
                    <div>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}>
                        <span style={{
                          fontSize: 11,
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                          color: "var(--text-muted)",
                        }}>
                          Password strength
                        </span>
                        <span style={{
                          fontSize: 11,
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700,
                          color: form.password.length >= 10 ? "var(--green)"
                            : form.password.length >= 6 ? "var(--amber)"
                            : "var(--red)",
                        }}>
                          {form.password.length >= 10 ? "Strong"
                            : form.password.length >= 6 ? "Good"
                            : "Too short"}
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min((form.password.length / 12) * 100, 100)}%`,
                            background: form.password.length >= 10
                              ? "var(--green)"
                              : form.password.length >= 6
                              ? "#F59E0B"
                              : "var(--red)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Match indicator */}
                  {form.confirm_password && (
                    <div className={`alert ${form.password === form.confirm_password
                      ? "alert-green" : "alert-red"}`}
                    >
                      <span>
                        {form.password === form.confirm_password ? "✅" : "❌"}
                      </span>
                      {form.password === form.confirm_password
                        ? "Passwords match"
                        : "Passwords do not match"}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary btn-lg btn-full"
                >
                  {loading ? (
                    <><span className="spinner" />Resetting password...</>
                  ) : "Reset Password →"}
                </button>
              </form>
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