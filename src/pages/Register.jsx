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
const ACADEMIC_YEARS = ["2021/2022", "2022/2023", "2023/2024", "2024/2025", "2025/2026"];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: "", index_number: "", email: "", password: "", confirm_password: "", programme: "", level: "", academic_year: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) return setError("Please enter your full name.");
    if (!form.index_number.trim()) return setError("Please enter your index number.");
    if (!form.email.trim()) return setError("Please enter your email.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters.");
    if (form.password !== form.confirm_password) return setError("Passwords do not match.");
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.programme) return setError("Please select your programme.");
    if (!form.level) return setError("Please select your level.");
    if (!form.academic_year) return setError("Please select your academic year.");
    setLoading(true);
    try {
      await registerStudent({ name: form.name, index_number: form.index_number, email: form.email, password: form.password, programme: form.programme, level: Number(form.level), academic_year: form.academic_year });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", fontFamily: "var(--font-body)", background: "var(--navy)" }}>

      <div className="login-left" style={{ width: "50%", minHeight: "100vh", background: "linear-gradient(160deg, #060f2e 0%, var(--navy) 50%, #0a2050 100%)", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 52px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -180, right: -180, width: 480, height: 480, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,192,5,0.08) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -120, left: -120, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(26,58,122,0.6) 0%, transparent 65%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        <div style={{ position: "relative", zIndex: 10, textAlign: "center", width: "100%", maxWidth: 380 }}>
          <div style={{ width: 100, height: 100, borderRadius: "50%", background: "rgba(255,192,5,0.08)", border: "1.5px solid rgba(255,192,5,0.2)", boxShadow: "0 0 0 8px rgba(255,192,5,0.04), 0 20px 60px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", padding: 14, overflow: "hidden" }}>
            <img src="/upsa-logo.png" alt="UPSA" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(1.15)" }} onError={(e) => { e.target.style.display = "none"; }} />
          </div>

          <div className="badge badge-navy" style={{ margin: "0 auto 12px", display: "inline-flex" }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--gold)" }} />
            GradeIQ UPSA
          </div>

          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 17, color: "rgba(255,255,255,0.6)", marginBottom: 20, lineHeight: 1.4 }}>
            University of Professional<br />Studies, Accra
          </h2>

          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 32, color: "var(--gold)", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 4 }}>Start Your</h1>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 32, color: "white", lineHeight: 1.2, letterSpacing: "-0.02em", marginBottom: 16 }}>Academic Journey.</h1>

          <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, var(--gold), var(--gold-deep))", borderRadius: 999, margin: "0 auto 16px" }} />

          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, lineHeight: 1.8, maxWidth: 300, margin: "0 auto 32px" }}>
            Create your account to start tracking your CGPA, monitoring academic risk, and planning your path to graduation.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 40 }}>
            {[
              { num: "01", text: "Create your account" },
              { num: "02", text: "Add your academic profile" },
              { num: "03", text: "Enter your semester results" },
              { num: "04", text: "Track your CGPA instantly" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: step === i + 1 ? "rgba(255,192,5,0.1)" : "rgba(255,255,255,0.03)", border: "1px solid " + (step === i + 1 ? "rgba(255,192,5,0.25)" : "rgba(255,255,255,0.06)"), borderRadius: "var(--radius-sm)", transition: "var(--transition)" }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: step > i ? "var(--gold)" : "rgba(255,192,5,0.1)", border: "1px solid " + (step > i ? "var(--gold)" : "rgba(255,192,5,0.25)"), display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 10, color: step > i ? "var(--navy)" : "var(--gold)", flexShrink: 0 }}>
                  {step > i ? "✓" : item.num}
                </span>
                <span style={{ color: step === i + 1 ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)", fontSize: 13, fontFamily: "var(--font-heading)", fontWeight: step === i + 1 ? 700 : 400 }}>
                  {item.text}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 16 }}>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 9, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "var(--font-heading)", marginBottom: 5 }}>Scholarship with Professionalism</p>
            <p style={{ color: "rgba(255,192,5,0.25)", fontSize: 9, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-heading)" }}>Developed by Ahenkora Joshua Owusu</p>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--bg-page)", padding: "32px 24px", position: "relative", overflowY: "auto" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 15% 15%, rgba(8,28,70,0.04) 0%, transparent 50%), radial-gradient(circle at 85% 85%, rgba(255,192,5,0.05) 0%, transparent 50%)", pointerEvents: "none" }} />

        <div className="mobile-header" style={{ display: "none", alignItems: "center", gap: 10, marginBottom: 24, alignSelf: "flex-start", position: "relative", zIndex: 1 }}>
          <div style={{ width: 36, height: 36, background: "var(--navy)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", padding: 5, overflow: "hidden" }}>
            <img src="/upsa-logo.png" alt="UPSA" style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { e.target.style.display = "none"; }} />
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 13, color: "var(--navy)" }}>GradeIQ UPSA</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>Smart Academic Platform</p>
          </div>
        </div>

        <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 20 }}>
            {[1, 2].map((s) => (
              <div key={s} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: "50%", background: step >= s ? "var(--navy)" : "var(--border)", color: step >= s ? "var(--gold)" : "var(--text-muted)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 12, transition: "all 0.3s", flexShrink: 0 }}>
                  {step > s ? "✓" : s}
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12, color: step >= s ? "var(--navy)" : "var(--text-muted)", whiteSpace: "nowrap" }}>
                  {s === 1 ? "Personal Info" : "Academic Profile"}
                </span>
                {s === 1 && (
                  <div style={{ width: 28, height: 2, background: step > 1 ? "var(--navy)" : "var(--border)", borderRadius: 999, transition: "all 0.3s" }} />
                )}
              </div>
            ))}
          </div>

          <div style={{ background: "var(--bg-card)", borderRadius: "var(--radius-xl)", padding: "36px 36px", boxShadow: "0 0 0 1px rgba(8,28,70,0.06), 0 4px 6px rgba(8,28,70,0.04), 0 20px 60px rgba(8,28,70,0.1)" }}>
            <div style={{ width: 40, height: 3, background: "linear-gradient(90deg, var(--navy), var(--gold))", borderRadius: 999, marginBottom: 24 }} />

            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 22, color: "var(--navy)", marginBottom: 6, letterSpacing: "-0.02em" }}>
              {step === 1 ? "Create your account" : "Your academic profile"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 13, marginBottom: 24 }}>
              {step === 1 ? "Fill in your personal details to get started." : "Tell us about your programme and current level."}
            </p>

            {error && <div className="alert alert-red" style={{ marginBottom: 20 }}>{error}</div>}
            {success && <div className="alert alert-green" style={{ marginBottom: 20 }}>{success}</div>}

            {step === 1 && (
              <form onSubmit={handleNextStep}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <label className="form-label">Full Name</label>
                    <input type="text" name="name" placeholder="e.g. Micheal Scofield" value={form.name} onChange={handleChange} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Index Number</label>
                    <input type="text" name="index_number" placeholder="e.g. 20260006" value={form.index_number} onChange={handleChange} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input type="email" name="email" placeholder="youraddress@gmail.com" value={form.email} onChange={handleChange} required className="form-input" />
                    <p style={{
                     fontSize: 11,
                     color: "var(--text-muted)",
                     marginTop: 4,
                     fontFamily: "var(--font-heading)",
                    }}>
                     Use a Gmail address to enable password reset via email.
                    </p>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <input type="password" name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} required className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm Password</label>
                    <input type="password" name="confirm_password" placeholder="Re-enter password" value={form.confirm_password} onChange={handleChange} required className="form-input" />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 24 }}>Continue</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit}>
                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  <div className="form-group">
                    <label className="form-label">Programme / Course of Study</label>
                    <select name="programme" value={form.programme} onChange={handleChange} required className="form-input form-select">
                      <option value="">Select your programme...</option>
                      {PROGRAMMES.map((p) => (<option key={p} value={p}>{p}</option>))}
                    </select>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div className="form-group">
                      <label className="form-label">Current Level</label>
                      <select name="level" value={form.level} onChange={handleChange} required className="form-input form-select">
                        <option value="">Select level...</option>
                        {LEVELS.map((l) => (<option key={l} value={l}>Level {l}</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Academic Year</label>
                      <select name="academic_year" value={form.academic_year} onChange={handleChange} required className="form-input form-select">
                        <option value="">Select year...</option>
                        {ACADEMIC_YEARS.map((y) => (<option key={y} value={y}>{y}</option>))}
                      </select>
                    </div>
                  </div>

                  {form.programme && form.level && form.academic_year && (
                    <div style={{ background: "var(--bg-page)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", padding: "14px 16px" }}>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "var(--navy)", marginBottom: 3 }}>{form.name}</p>
                      <p style={{ fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                        {form.programme}<br />Level {form.level} - {form.academic_year}
                      </p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button type="button" onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1 }}>Back</button>
                  <button type="submit" disabled={loading} className="btn btn-primary btn-lg" style={{ flex: 2 }}>
                    {loading ? (<><span className="spinner" />Creating account...</>) : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p style={{ textAlign: "center", fontSize: 12, color: "var(--text-muted)", marginTop: 20, lineHeight: 1.7 }}>
            Already have an account?{" "}
            <Link to="/login" style={{ color: "var(--navy)", fontFamily: "var(--font-heading)", fontWeight: 700, borderBottom: "1px solid var(--gold)", paddingBottom: 1 }}>
              Sign in here
            </Link>
            <br />
            <span style={{ fontSize: 11, color: "#C8C9D0", fontFamily: "var(--font-heading)" }}>
              2026 GradeIQ UPSA - Developed by Ahenkora Joshua Owusu
            </span>
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
