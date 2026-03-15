import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginStudent, getDashboard } from "../services/api";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const tokenData = await loginStudent(form.email, form.password);
      localStorage.setItem("token", tokenData.access_token);
      const userData = await getDashboard();
      login(tokenData.access_token, {
        name: userData.name,
        index_number: userData.index_number,
        cgpa: userData.cgpa,
        classification: userData.classification,
      });
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "var(--font-body)",
      background: "var(--navy)",
    }}>

      {/* ================================
          LEFT PANEL
      ================================ */}
      <div className="login-left" style={{
        width: "50%",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #060f2e 0%, var(--navy) 50%, #0a2050 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 52px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background orbs */}
        <div style={{
          position: "absolute", top: -180, right: -180,
          width: 480, height: 480, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,192,5,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -120, left: -120,
          width: 360, height: 360, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,58,122,0.6) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Gold top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, var(--gold), transparent)",
        }} />

        {/* Content */}
        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center", width: "100%", maxWidth: 380,
        }} className="fade-up">

          {/* Logo — circular, no white box */}
          <div style={{
            width: 108, height: 108,
            borderRadius: "50%",
            background: "rgba(255,192,5,0.08)",
            border: "1.5px solid rgba(255,192,5,0.2)",
            boxShadow: "0 0 0 8px rgba(255,192,5,0.04), 0 20px 60px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px",
            padding: 16,
            overflow: "hidden",
          }}>
            <img
              src="/upsa-logo.png"
              alt="UPSA"
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                filter: "brightness(1.15)",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>

          {/* Badge */}
          <div className="badge badge-navy" style={{
            margin: "0 auto 14px",
            display: "inline-flex",
          }}>
            <span style={{
              width: 5, height: 5,
              borderRadius: "50%",
              background: "var(--gold)",
            }} />
            GradeIQ UPSA
          </div>

          <h2 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 600, fontSize: 17,
            color: "rgba(255,255,255,0.6)",
            marginBottom: 24, lineHeight: 1.4,
          }}>
            University of Professional
            <br />Studies, Accra
          </h2>

          {/* Tagline */}
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900, fontSize: 36,
            color: "var(--gold)",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: 4,
          }}>
            Know Your Grade.
          </h1>
          <h1 style={{
            fontFamily: "var(--font-heading)",
            fontWeight: 900, fontSize: 36,
            color: "white",
            lineHeight: 1.15,
            letterSpacing: "-0.02em",
            marginBottom: 20,
          }}>
            Own Your Future.
          </h1>

          {/* Divider */}
          <div style={{
            width: 40, height: 3,
            background: "linear-gradient(90deg, var(--gold), var(--gold-deep))",
            borderRadius: 999, margin: "0 auto 20px",
          }} />

          <p style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 13, lineHeight: 1.8,
            maxWidth: 300, margin: "0 auto 36px",
          }}>
            Track your CGPA, simulate future grades,
            analyze risk and download your transcript
            — all in one intelligent platform.
          </p>

          {/* Feature grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10, marginBottom: 40,
          }}>
            {[
              { icon: "📊", label: "GPA Tracker", desc: "Every semester" },
              { icon: "⚡", label: "Risk Alerts", desc: "Live analysis" },
              { icon: "📄", label: "PDF Transcript", desc: "Download anytime" },
              { icon: "🎯", label: "CGPA Simulator", desc: "Plan ahead" },
            ].map((f) => (
              <div key={f.label} style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "var(--radius-md)",
                padding: "12px 14px",
                textAlign: "left",
              }}>
                <div style={{ fontSize: 18, marginBottom: 5 }}>{f.icon}</div>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700, fontSize: 12,
                  color: "rgba(255,255,255,0.8)", marginBottom: 2,
                }}>{f.label}</p>
                <p style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            paddingTop: 18,
          }}>
            <p style={{
              color: "rgba(255,255,255,0.15)",
              fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "var(--font-heading)",
              marginBottom: 5,
            }}>Scholarship with Professionalism</p>
            <p style={{
              color: "rgba(255,192,5,0.25)",
              fontSize: 9, letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "var(--font-heading)",
            }}>Developed by Ahenkora Joshua Owusu</p>
          </div>

        </div>
      </div>

      {/* ================================
          RIGHT PANEL
      ================================ */}
      <div style={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--bg-page)",
        padding: "32px 24px",
        position: "relative",
        overflowY: "auto",
      }}>

        {/* Subtle bg */}
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(8,28,70,0.04) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(255,192,5,0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }} />

        {/* Mobile header */}
        <div className="mobile-header" style={{
          display: "none",
          alignItems: "center",
          gap: 10,
          marginBottom: 28,
          alignSelf: "flex-start",
          position: "relative", zIndex: 1,
        }}>
          <div style={{
            width: 36, height: 36,
            background: "var(--navy)",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
            overflow: "hidden",
          }}>
            <img
              src="/upsa-logo.png" alt="UPSA"
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <div>
            <p style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 900, fontSize: 13,
              color: "var(--navy)",
            }}>GradeIQ UPSA</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>
              Smart Academic Platform
            </p>
          </div>
        </div>

        {/* Form card */}
        <div style={{
          width: "100%", maxWidth: 420,
          position: "relative", zIndex: 1,
        }} className="fade-up">

          <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-xl)",
            padding: "40px 36px",
            boxShadow: `
              0 0 0 1px rgba(8,28,70,0.06),
              0 4px 6px rgba(8,28,70,0.04),
              0 20px 60px rgba(8,28,70,0.1)
            `,
          }}>

            {/* Top accent */}
            <div style={{
              width: 40, height: 3,
              background: "linear-gradient(90deg, var(--navy), var(--gold))",
              borderRadius: 999, marginBottom: 28,
            }} />

            <h2 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 800, fontSize: 26,
              color: "var(--navy)",
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}>
              Welcome back 👋
            </h2>
            <p style={{
              color: "var(--text-muted)",
              fontSize: 14, marginBottom: 28,
            }}>
              Sign in to your academic dashboard
            </p>

            {/* Error */}
            {error && (
              <div className="alert alert-red" style={{ marginBottom: 20 }}>
                <span>⚠️</span>{error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div className="form-group" style={{ marginBottom: 18 }}>
                <label className="form-label">
                  ✉️ Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@upsamail.edu.gh"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Password */}
              <div className="form-group" style={{ marginBottom: 28 }}>
                <label className="form-label">
                  🔒 Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary btn-lg btn-full"
              >
                {loading ? (
                  <>
                    <span className="spinner" />
                    Signing in...
                  </>
                ) : "Sign In →"}
              </button>

            </form>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center",
              gap: 12, margin: "24px 0",
            }}>
              <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
              <span style={{ color: "#D1D5DB", fontSize: 12 }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
            </div>

            <p style={{
              textAlign: "center",
              fontSize: 14, color: "var(--text-muted)",
            }}>
              No account yet?{" "}
              <Link to="/register" style={{
                color: "var(--navy)",
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                borderBottom: "2px solid var(--gold)",
                paddingBottom: 1,
              }}>
                Create one here →
              </Link>
            </p>

          </div>

          <p style={{
            textAlign: "center",
            fontSize: 11,
            color: "#C8C9D0",
            marginTop: 20,
            lineHeight: 1.7,
            fontFamily: "var(--font-heading)",
          }}>
            University of Professional Studies, Accra
            <br />
            © 2026 GradeIQ UPSA · Developed by Ahenkora Joshua Owusu
          </p>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .login-left { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 769px) {
          .login-left { display: flex !important; }
          .mobile-header { display: none !important; }
        }
      `}</style>

    </div>
  );
}