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
      fontFamily: "'Inter', sans-serif",
      background: "#060f2e",
    }}>

      {/* ================================
          LEFT PANEL
      ================================ */}
      <div style={{
        width: "50%",
        minHeight: "100vh",
        background: "linear-gradient(160deg, #060f2e 0%, #081C46 50%, #0a2050 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 56px",
        position: "relative",
        overflow: "hidden",
      }}
        className="left-panel"
      >

        {/* Background orbs */}
        <div style={{
          position: "absolute",
          top: -200, right: -200,
          width: 500, height: 500,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,192,5,0.07) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: -150, left: -150,
          width: 400, height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(26,58,122,0.8) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          top: "35%", left: -80,
          width: 220, height: 220,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,192,5,0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Gold top accent line */}
        <div style={{
          position: "absolute",
          top: 0, left: 0, right: 0,
          height: 3,
          background: "linear-gradient(90deg, transparent, #FFC005, transparent)",
        }} />

        {/* Content */}
        <div style={{
          position: "relative",
          zIndex: 10,
          textAlign: "center",
          width: "100%",
          maxWidth: 380,
        }}>

          {/* Logo — pure circular, no white bg */}
          <div style={{
            width: 110, height: 110,
            borderRadius: "50%",
            background: "rgba(255,192,5,0.08)",
            border: "1.5px solid rgba(255,192,5,0.2)",
            boxShadow: `
              0 0 0 6px rgba(255,192,5,0.05),
              0 0 0 12px rgba(255,192,5,0.02),
              0 20px 60px rgba(0,0,0,0.4)
            `,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 32px",
            padding: 18,
          }}>
            <img
              src="/upsa-logo.png"
              alt="UPSA"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: "brightness(1.2) contrast(1.05)",
              }}
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>

          {/* GradeIQ badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "rgba(255,192,5,0.1)",
            border: "1px solid rgba(255,192,5,0.2)",
            borderRadius: 999,
            padding: "5px 14px",
            marginBottom: 16,
          }}>
            <div style={{
              width: 5, height: 5,
              borderRadius: "50%",
              background: "#FFC005",
            }} />
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 11,
              color: "#FFC005",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>
              GradeIQ UPSA
            </span>
          </div>

          {/* University name */}
          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600,
            fontSize: 18,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 28,
            lineHeight: 1.4,
          }}>
            University of Professional
            <br />Studies, Accra
          </h2>

          {/* Main tagline */}
          <div style={{ marginBottom: 12 }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 38,
              color: "#FFC005",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              marginBottom: 0,
            }}>
              Know Your Grade.
            </h1>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900,
              fontSize: 38,
              color: "#ffffff",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}>
              Own Your Future.
            </h1>
          </div>

          {/* Divider */}
          <div style={{
            width: 40, height: 3,
            background: "linear-gradient(90deg, #FFC005, #C8920A)",
            borderRadius: 999,
            margin: "20px auto 20px",
          }} />

          <p style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 13,
            lineHeight: 1.8,
            maxWidth: 300,
            margin: "0 auto 40px",
          }}>
            Track your CGPA, simulate future grades,
            analyze risk and download your transcript
            — all in one intelligent platform.
          </p>

          {/* Feature grid */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 48,
          }}>
            {[
              { icon: "📊", label: "GPA Tracker", desc: "Every semester" },
              { icon: "⚡", label: "Risk Alerts", desc: "Live analysis" },
              { icon: "📄", label: "PDF Transcript", desc: "Download anytime" },
              { icon: "🎯", label: "CGPA Simulator", desc: "Plan ahead" },
            ].map((f) => (
              <div key={f.label} style={{
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 12,
                padding: "14px 16px",
                textAlign: "left",
                transition: "all 0.2s",
              }}>
                <div style={{
                  fontSize: 18, marginBottom: 6,
                }}>
                  {f.icon}
                </div>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 12,
                  color: "rgba(255,255,255,0.8)",
                  marginBottom: 2,
                }}>
                  {f.label}
                </p>
                <p style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div style={{
            borderTop: "1px solid rgba(255,255,255,0.06)",
            paddingTop: 20,
          }}>
            <p style={{
              color: "rgba(255,255,255,0.15)",
              fontSize: 9,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 5,
            }}>
              Scholarship with Professionalism
            </p>
            <p style={{
              color: "rgba(255,192,5,0.25)",
              fontSize: 9,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Developed by Ahenkora Joshua Owusu
            </p>
          </div>

        </div>
      </div>

      {/* ================================
          RIGHT PANEL — Form
      ================================ */}
      <div style={{
        flex: 1,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F7FF",
        padding: "48px 32px",
        position: "relative",
      }}>

        {/* Subtle bg texture */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            radial-gradient(circle at 15% 15%, rgba(8,28,70,0.04) 0%, transparent 50%),
            radial-gradient(circle at 85% 85%, rgba(255,192,5,0.05) 0%, transparent 50%)
          `,
          pointerEvents: "none",
        }} />

        {/* Mobile header */}
        <div
          className="mobile-header"
          style={{
            display: "none",
            alignItems: "center",
            gap: 10,
            marginBottom: 36,
            alignSelf: "flex-start",
          }}
        >
          <div style={{
            width: 36, height: 36,
            background: "#081C46",
            borderRadius: 9,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 5,
          }}>
            <img
              src="/upsa-logo.png"
              alt="UPSA"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: 13,
              color: "#081C46",
            }}>GradeIQ UPSA</p>
            <p style={{
              fontSize: 10, color: "#9CA3AF",
            }}>Smart Academic Platform</p>
          </div>
        </div>

        {/* Form container */}
        <div style={{
          width: "100%",
          maxWidth: 420,
          position: "relative",
          zIndex: 10,
        }}>

          {/* Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: "44px 40px",
            boxShadow: `
              0 0 0 1px rgba(8,28,70,0.06),
              0 4px 6px rgba(8,28,70,0.04),
              0 20px 60px rgba(8,28,70,0.08)
            `,
          }}>

            {/* Top accent */}
            <div style={{
              width: 40, height: 3,
              background: "linear-gradient(90deg, #081C46, #FFC005)",
              borderRadius: 999,
              marginBottom: 28,
            }} />

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: "#081C46",
              marginBottom: 6,
              letterSpacing: "-0.02em",
            }}>
              Welcome back 👋
            </h2>
            <p style={{
              color: "#9CA3AF", fontSize: 14,
              marginBottom: 32, lineHeight: 1.5,
            }}>
              Sign in to your academic dashboard
            </p>

            {/* Error */}
            {error && (
              <div style={{
                background: "#FEF2F2",
                borderLeft: "3px solid #EF4444",
                color: "#B91C1C",
                padding: "11px 14px",
                borderRadius: "0 10px 10px 0",
                fontSize: 13, fontWeight: 500,
                marginBottom: 20,
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}>
                <span>⚠️</span>{error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit}>

              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 11,
                  color: "#6B7280",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  <span>✉️</span> Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@upsa.edu.gh"
                  value={form.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "1.5px solid #EAECF0",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    color: "#081C46",
                    background: "#FAFBFF",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#081C46";
                    e.target.style.background = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(8,28,70,0.07)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#EAECF0";
                    e.target.style.background = "#FAFBFF";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 28 }}>
                <label style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 11,
                  color: "#6B7280",
                  marginBottom: 8,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}>
                  <span>🔒</span> Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{
                    width: "100%",
                    padding: "14px 16px",
                    border: "1.5px solid #EAECF0",
                    borderRadius: 12,
                    fontSize: 14,
                    fontFamily: "'Inter', sans-serif",
                    color: "#081C46",
                    background: "#FAFBFF",
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "all 0.2s",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#081C46";
                    e.target.style.background = "#ffffff";
                    e.target.style.boxShadow = "0 0 0 3px rgba(8,28,70,0.07)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#EAECF0";
                    e.target.style.background = "#FAFBFF";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  width: "100%",
                  padding: "15px",
                  background: "linear-gradient(135deg, #081C46 0%, #0f2d6e 100%)",
                  color: "#FFC005",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  fontSize: 15,
                  borderRadius: 12,
                  border: "none",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.75 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.25s",
                  boxShadow: "0 4px 20px rgba(8,28,70,0.25)",
                  letterSpacing: "0.02em",
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(8,28,70,0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(8,28,70,0.25)";
                  }
                }}
              >
                {loading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,192,5,0.3)",
                      borderTop: "2px solid #FFC005",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Signing in...
                  </>
                ) : "Sign In →"}
              </button>

            </form>

            {/* Divider */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px 0",
            }}>
              <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
              <span style={{
                color: "#D1D5DB", fontSize: 12,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>or</span>
              <div style={{ flex: 1, height: 1, background: "#F3F4F6" }} />
            </div>

            {/* Register */}
            <p style={{
              textAlign: "center",
              fontSize: 14, color: "#6B7280",
            }}>
              No account yet?{" "}
              <Link to="/register" style={{
                color: "#081C46",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800,
                textDecoration: "none",
                borderBottom: "2px solid #FFC005",
                paddingBottom: 1,
              }}>
                Create one here →
              </Link>
            </p>

          </div>

          {/* Below card */}
          <p style={{
            textAlign: "center",
            fontSize: 11,
            color: "#C8C9D0",
            marginTop: 24,
            lineHeight: 1.7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            University of Professional Studies, Accra
            <br />
            © 2026 GradeIQ UPSA · Developed by Ahenkora Joshua Owusu
          </p>

        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 900px) {
          .left-panel { display: none !important; }
          .mobile-header { display: flex !important; }
        }
        @media (min-width: 901px) {
          .left-panel { display: flex !important; }
          .mobile-header { display: none !important; }
        }
      `}</style>

    </div>
  );
}