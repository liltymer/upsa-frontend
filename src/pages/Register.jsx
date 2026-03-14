import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerStudent } from "../services/api";

const PROGRAMMES = [
"Diploma in Accounting",
"Diploma in Marketing",
"Diploma in Management",
"Diploma in Public Relations",
"Diploma in Information Technology Management",
"Bachelor of Science in Data Science and Analytics",
"Bachelor of Laws (LLB)",
"Bachelor of Arts in Communication Studies",
"Bachelor of Science in Logistics and Transport Management",
"Bachelor of Arts in Public Relations Management",
"Bachelor of Science in Accounting",
"Bachelor of Science in Accounting and Finance",
"Bachelor of Science in Business Economics",
"Bachelor of Science in Actuarial Science",
"Bachelor of Science in Banking and Finance",
"Bachelor of Business Administration",
"Bachelor of Science in Information Technology",
"Bachelor of Science in Marketing",
"Bachelor of Science in Real Estate Management and Finance",
  "Other",
];

const LEVELS = [100, 200, 300, 400];

const ACADEMIC_YEARS = [
  "2021/2022",
  "2022/2023",
  "2023/2024",
  "2024/2025",
  "2025/2026",
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    index_number: "",
    email: "",
    password: "",
    confirm_password: "",
    programme: "",
    level: "",
    academic_year: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 2-step form

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!form.index_number.trim()) {
      setError("Please enter your index number.");
      return;
    }
    if (!form.email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.programme) {
      setError("Please select your programme.");
      return;
    }
    if (!form.level) {
      setError("Please select your level.");
      return;
    }
    if (!form.academic_year) {
      setError("Please select your academic year.");
      return;
    }

    setLoading(true);

    try {
      await registerStudent({
        name: form.name,
        index_number: form.index_number,
        email: form.email,
        password: form.password,
        programme: form.programme,
        level: Number(form.level),
        academic_year: form.academic_year,
      });

      setSuccess("Account created successfully! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setError(
        err.response?.data?.detail || "Registration failed. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%",
    padding: "13px 16px",
    border: "1.5px solid #EAECF0",
    borderRadius: 12,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: "#081C46",
    background: "#FAFBFF",
    outline: "none",
    boxSizing: "border-box",
    transition: "all 0.2s",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 700, fontSize: 11,
    color: "#6B7280",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.1em",
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
      <div
        className="left-panel"
        style={{
          width: "50%",
          minHeight: "100vh",
          background: "linear-gradient(160deg, #060f2e 0%, #081C46 50%, #0a2050 100%)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 56px",
          position: "relative",
          overflow: "hidden",
          display: "none",
        }}
      >
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
          background: "radial-gradient(circle, rgba(26,58,122,0.8) 0%, transparent 65%)",
          pointerEvents: "none",
        }} />

        {/* Gold top accent */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: 3,
          background: "linear-gradient(90deg, transparent, #FFC005, transparent)",
        }} />

        <div style={{
          position: "relative", zIndex: 10,
          textAlign: "center", width: "100%", maxWidth: 380,
        }}>

          {/* Logo */}
          <div style={{
            width: 100, height: 100, borderRadius: "50%",
            background: "rgba(255,192,5,0.08)",
            border: "1.5px solid rgba(255,192,5,0.2)",
            boxShadow: "0 0 0 6px rgba(255,192,5,0.05), 0 0 0 12px rgba(255,192,5,0.02), 0 20px 60px rgba(0,0,0,0.4)",
            display: "flex", alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 28px", padding: 16,
          }}>
            <img
              src="/upsa-logo.png"
              alt="UPSA"
              style={{
                width: "100%", height: "100%",
                objectFit: "contain",
                filter: "brightness(1.2) contrast(1.05)",
              }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>

          {/* Badge */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "rgba(255,192,5,0.1)",
            border: "1px solid rgba(255,192,5,0.2)",
            borderRadius: 999, padding: "5px 14px", marginBottom: 16,
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#FFC005",
            }} />
            <span style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 11,
              color: "#FFC005", letterSpacing: "0.2em",
              textTransform: "uppercase",
            }}>GradeIQ UPSA</span>
          </div>

          <h2 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 600, fontSize: 18,
            color: "rgba(255,255,255,0.65)",
            marginBottom: 28, lineHeight: 1.4,
          }}>
            University of Professional
            <br />Studies, Accra
          </h2>

          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: 32,
            color: "#FFC005", lineHeight: 1.2,
            letterSpacing: "-0.02em", marginBottom: 4,
          }}>
            Start Your
          </h1>
          <h1 style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontWeight: 900, fontSize: 32,
            color: "#ffffff", lineHeight: 1.2,
            letterSpacing: "-0.02em", marginBottom: 20,
          }}>
            Academic Journey.
          </h1>

          <div style={{
            width: 40, height: 3,
            background: "linear-gradient(90deg, #FFC005, #C8920A)",
            borderRadius: 999, margin: "0 auto 20px",
          }} />

          <p style={{
            color: "rgba(255,255,255,0.35)",
            fontSize: 13, lineHeight: 1.8,
            maxWidth: 300, margin: "0 auto 40px",
          }}>
            Create your account to start tracking
            your CGPA, monitoring your academic risk,
            and planning your path to graduation.
          </p>

          {/* Steps */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            textAlign: "left",
            marginBottom: 48,
          }}>
            {[
              { num: "01", text: "Create your account" },
              { num: "02", text: "Add your academic profile" },
              { num: "03", text: "Enter your semester results" },
              { num: "04", text: "Track your CGPA instantly" },
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "10px 14px",
                background: step === i + 1
                  ? "rgba(255,192,5,0.1)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${step === i + 1
                  ? "rgba(255,192,5,0.25)"
                  : "rgba(255,255,255,0.05)"}`,
                borderRadius: 10,
              }}>
                <span style={{
                  width: 28, height: 28,
                  background: step > i
                    ? "#FFC005"
                    : "rgba(255,192,5,0.1)",
                  border: `1px solid ${step > i
                    ? "#FFC005"
                    : "rgba(255,192,5,0.25)"}`,
                  borderRadius: 8,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900, fontSize: 10,
                  color: step > i ? "#081C46" : "#FFC005",
                  flexShrink: 0,
                }}>
                  {step > i ? "✓" : item.num}
                </span>
                <span style={{
                  color: step === i + 1
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.35)",
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: step === i + 1 ? 700 : 400,
                }}>
                  {item.text}
                </span>
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
              fontSize: 9, letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 5,
            }}>
              Scholarship with Professionalism
            </p>
            <p style={{
              color: "rgba(255,192,5,0.25)",
              fontSize: 9, letterSpacing: "0.12em",
              textTransform: "uppercase",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              Developed by JOSH
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

        <div style={{
          position: "absolute", inset: 0,
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
            marginBottom: 32,
            alignSelf: "flex-start",
          }}
        >
          <div style={{
            width: 36, height: 36,
            background: "#081C46", borderRadius: 9,
            display: "flex", alignItems: "center",
            justifyContent: "center", padding: 5,
          }}>
            <img
              src="/upsa-logo.png" alt="UPSA"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
              onError={(e) => { e.target.style.display = "none"; }}
            />
          </div>
          <div>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: 13, color: "#081C46",
            }}>GradeIQ UPSA</p>
            <p style={{ fontSize: 10, color: "#9CA3AF" }}>
              Smart Academic Platform
            </p>
          </div>
        </div>

        <div style={{
          width: "100%", maxWidth: 480,
          position: "relative", zIndex: 10,
        }}>

          {/* Step indicator */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 24,
          }}>
            {[1, 2].map((s) => (
              <div key={s} style={{
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <div style={{
                  width: 28, height: 28,
                  borderRadius: "50%",
                  background: step >= s ? "#081C46" : "#E5E7EB",
                  color: step >= s ? "#FFC005" : "#9CA3AF",
                  display: "flex",
                  alignItems: "center", justifyContent: "center",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: 12,
                  transition: "all 0.3s",
                }}>
                  {step > s ? "✓" : s}
                </div>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, fontSize: 12,
                  color: step >= s ? "#081C46" : "#9CA3AF",
                }}>
                  {s === 1 ? "Personal Info" : "Academic Profile"}
                </span>
                {s === 1 && (
                  <div style={{
                    width: 32, height: 2,
                    background: step > 1 ? "#081C46" : "#E5E7EB",
                    borderRadius: 999,
                    transition: "all 0.3s",
                  }} />
                )}
              </div>
            ))}
          </div>

          {/* Card */}
          <div style={{
            background: "#ffffff",
            borderRadius: 24,
            padding: "40px 40px",
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
              borderRadius: 999, marginBottom: 28,
            }} />

            {/* Heading */}
            <h2 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 24,
              color: "#081C46", marginBottom: 6,
              letterSpacing: "-0.02em",
            }}>
              {step === 1 ? "Create your account ✨" : "Your academic profile 🎓"}
            </h2>
            <p style={{
              color: "#9CA3AF", fontSize: 13,
              marginBottom: 28, lineHeight: 1.5,
            }}>
              {step === 1
                ? "Fill in your personal details to get started"
                : "Tell us about your programme and current level"}
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
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>⚠️</span>{error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                background: "#F0FDF4",
                borderLeft: "3px solid #22C55E",
                color: "#166534",
                padding: "11px 14px",
                borderRadius: "0 10px 10px 0",
                fontSize: 13, fontWeight: 500,
                marginBottom: 20,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <span>✅</span>{success}
              </div>
            )}

            {/* STEP 1 — Personal Info */}
            {step === 1 && (
              <form onSubmit={handleNextStep}>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                  marginBottom: 16,
                }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Full Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="e.g. Joshua Owusu"
                      value={form.name}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  <div>
                    <label style={labelStyle}>Index Number</label>
                    <input
                      type="text"
                      name="index_number"
                      placeholder="e.g. UPS/IT/23/0001"
                      value={form.index_number}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  <div>
                    <label style={labelStyle}>Email Address</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="you@upsa.edu.gh"
                      value={form.email}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  <div>
                    <label style={labelStyle}>Password</label>
                    <input
                      type="password"
                      name="password"
                      placeholder="Min. 6 characters"
                      value={form.password}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label style={labelStyle}>Confirm Password</label>
                    <input
                      type="password"
                      name="confirm_password"
                      placeholder="Re-enter your password"
                      value={form.confirm_password}
                      onChange={handleChange}
                      required
                      style={inputStyle}
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
                </div>

                <button
                  type="submit"
                  style={{
                    width: "100%",
                    padding: "15px",
                    background: "linear-gradient(135deg, #081C46 0%, #0f2d6e 100%)",
                    color: "#FFC005",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 800, fontSize: 15,
                    borderRadius: 12, border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(8,28,70,0.25)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 8px 28px rgba(8,28,70,0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 20px rgba(8,28,70,0.25)";
                  }}
                >
                  Continue →
                </button>
              </form>
            )}

            {/* STEP 2 — Academic Profile */}
            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  marginBottom: 24,
                }}>

                  {/* Programme */}
                  <div>
                    <label style={labelStyle}>
                      🎓 Programme / Course of Study
                    </label>
                    <select
                      name="programme"
                      value={form.programme}
                      onChange={handleChange}
                      required
                      style={{
                        ...inputStyle,
                        cursor: "pointer",
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
                    >
                      <option value="">Select your programme...</option>
                      {PROGRAMMES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Level + Academic Year side by side */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}>
                    <div>
                      <label style={labelStyle}>📚 Current Level</label>
                      <select
                        name="level"
                        value={form.level}
                        onChange={handleChange}
                        required
                        style={{
                          ...inputStyle,
                          cursor: "pointer",
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
                      >
                        <option value="">Select level...</option>
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>Level {l}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>📅 Academic Year</label>
                      <select
                        name="academic_year"
                        value={form.academic_year}
                        onChange={handleChange}
                        required
                        style={{
                          ...inputStyle,
                          cursor: "pointer",
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
                      >
                        <option value="">Select year...</option>
                        {ACADEMIC_YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Profile preview */}
                  {form.programme && form.level && form.academic_year && (
                    <div style={{
                      background: "#F5F7FF",
                      border: "1.5px solid #E5E7EB",
                      borderRadius: 12,
                      padding: "14px 16px",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                    }}>
                      <span style={{ fontSize: 20 }}>👤</span>
                      <div>
                        <p style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 13,
                          color: "#081C46", marginBottom: 2,
                        }}>
                          {form.name}
                        </p>
                        <p style={{
                          fontSize: 12, color: "#6B7280",
                          lineHeight: 1.5,
                        }}>
                          {form.programme}
                          <br />
                          Level {form.level} · {form.academic_year}
                        </p>
                      </div>
                    </div>
                  )}

                </div>

                <div style={{
                  display: "flex", gap: 12,
                }}>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    style={{
                      flex: 1,
                      padding: "15px",
                      background: "#F5F7FF",
                      color: "#081C46",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 14,
                      borderRadius: 12,
                      border: "1.5px solid #E5E7EB",
                      cursor: "pointer",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#E5E7EB";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#F5F7FF";
                    }}
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      flex: 2,
                      padding: "15px",
                      background: "linear-gradient(135deg, #081C46 0%, #0f2d6e 100%)",
                      color: "#FFC005",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800, fontSize: 15,
                      borderRadius: 12, border: "none",
                      cursor: loading ? "not-allowed" : "pointer",
                      opacity: loading ? 0.75 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      boxShadow: "0 4px 20px rgba(8,28,70,0.25)",
                      transition: "all 0.2s",
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
                        Creating account...
                      </>
                    ) : "Create Account →"}
                  </button>
                </div>

              </form>
            )}

          </div>

          {/* Below card */}
          <p style={{
            textAlign: "center", fontSize: 11,
            color: "#C8C9D0", marginTop: 24,
            lineHeight: 1.7,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
            Already have an account?{" "}
            <Link to="/login" style={{
              color: "#081C46", fontWeight: 700,
              textDecoration: "none",
              borderBottom: "1px solid #FFC005",
              paddingBottom: 1,
            }}>
              Sign in here →
            </Link>
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