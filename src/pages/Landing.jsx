import React from "react";
import { Link } from "react-router-dom";

const classifications = [
  { label: "First Class", range: "3.6 - 4.0", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" },
  { label: "Second Class Upper", range: "3.0 - 3.59", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
  { label: "Second Class Lower", range: "2.5 - 2.99", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" },
  { label: "Third Class", range: "2.0 - 2.49", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" },
  { label: "Pass", range: "1.0 - 1.99", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" },
  { label: "Fail / Probation", range: "Below 1.0", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" },
];

const steps = [
  { num: "01", title: "Create your account", desc: "Register with your index number, email and programme in under two minutes. No approval needed." },
  { num: "02", title: "Enter your results", desc: "Add your semester results using the grade letters from your official UPSA result sheet. No scores required." },
  { num: "03", title: "Track everything", desc: "Your CGPA, risk level, GPA trends and transcript are all calculated and updated instantly." },
];

const faqs = [
  { q: "Is GradeIQ UPSA free to use?", a: "Yes, completely free for all UPSA students. No subscription or payment is required." },
  { q: "Do I need my score to use this platform?", a: "No. GradeIQ only requires your grade letters exactly as shown on your result sheet." },
  { q: "Is my data private and secure?", a: "Your results and CGPA are private to your account only. Admins see anonymous analytics, never individual grades." },
  { q: "What if my course is not in the catalogue?", a: "You can always enter your course manually. The catalogue is a convenience feature, not a requirement." },
  { q: "Can I reset my password if I forget it?", a: "Yes. Use the Forgot Password link on the login page. Reset emails work for Gmail addresses." },
];

const features = [
  { abbr: "GPA", title: "CGPA Tracker", desc: "Track your cumulative GPA across every semester with real-time updates and visual progress.", color: "var(--blue-bg)", border: "var(--blue-border)", iconColor: "var(--blue)" },
  { abbr: "RISK", title: "Risk Analysis", desc: "Get instant alerts when your academic standing is at risk before it is too late to act.", color: "var(--amber-bg)", border: "var(--amber-border)", iconColor: "var(--amber)" },
  { abbr: "PDF", title: "PDF Transcript", desc: "Generate and download a formatted academic transcript of all your results at any time.", color: "var(--green-bg)", border: "var(--green-border)", iconColor: "var(--green)" },
  { abbr: "SIM", title: "CGPA Simulator", desc: "Simulate future grades and calculate exactly what you need to hit your target classification.", color: "#FDF4FF", border: "#E9D5FF", iconColor: "#7C3AED" },
  { abbr: "TREND", title: "GPA Trends", desc: "Visualise your academic performance over time with an interactive semester-by-semester chart.", color: "var(--orange-bg)", border: "var(--orange-border)", iconColor: "var(--orange)" },
  { abbr: "CLASS", title: "Classification Ladder", desc: "See exactly where you stand on the UPSA classification scale and how far you are from First Class.", color: "var(--red-bg)", border: "var(--red-border)", iconColor: "var(--red)" },
];

function LandingHelpButton() {
  const [open, setOpen] = React.useState(false);
  return (
    <div>
      {open && (
        <div style={{
          position: "fixed", bottom: 88, right: 28, zIndex: 998,
          background: "var(--bg-card)", border: "1.5px solid var(--border)",
          borderRadius: "var(--radius-xl)", padding: "24px", width: 300,
          boxShadow: "0 8px 40px rgba(8,28,70,0.2)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 15, color: "var(--navy)", marginBottom: 2 }}>Help and Support</p>
              <p style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "var(--font-heading)" }}>GradeIQ UPSA Support</p>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: "var(--bg-page)", border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px", cursor: "pointer", color: "var(--text-muted)", fontWeight: 700, fontSize: 14 }}>x</button>
          </div>
          <div style={{ height: 1, background: "var(--border)", marginBottom: 16 }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, marginBottom: 16 }}>Having trouble? Contact support directly:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <a href="mailto:ahenkorajoshuaowusu@outlook.com" style={{ display: "block", padding: "12px 14px", background: "var(--bg-page)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 1 }}>Email</p>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "var(--navy)" }}>ahenkorajoshuaowusu@outlook.com</p>
            </a>
            <a href="tel:+233537041324" style={{ display: "block", padding: "12px 14px", background: "var(--bg-page)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", textDecoration: "none" }}>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 10, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 1 }}>Phone / WhatsApp</p>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "var(--navy)" }}>+233 537 041 324</p>
            </a>
          </div>
          <p style={{ fontSize: 11, color: "var(--text-muted)", textAlign: "center", marginTop: 16, fontFamily: "var(--font-heading)" }}>GradeIQ UPSA - University of Professional Studies, Accra</p>
        </div>
      )}
      <button onClick={() => setOpen(!open)} style={{
        position: "fixed", bottom: 28, right: 28, zIndex: 999,
        display: "flex", alignItems: "center", gap: 8,
        background: open ? "var(--gold)" : "var(--navy)",
        color: open ? "var(--navy)" : "var(--gold)",
        border: open ? "1.5px solid var(--gold)" : "1.5px solid rgba(255,192,5,0.3)",
        borderRadius: "var(--radius-full)", padding: "12px 20px",
        fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13,
        cursor: "pointer", boxShadow: "0 4px 20px rgba(8,28,70,0.25)",
        transition: "var(--transition)",
      }}>
        {open ? "Close" : "Help and Support"}
      </button>
    </div>
  );
}

function LandingNav() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  return (
    <>
      <nav style={{ background: "var(--navy)", position: "sticky", top: 0, zIndex: 100, boxShadow: "0 2px 12px rgba(8,28,70,0.2)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,192,5,0.12)", border: "1.5px solid rgba(255,192,5,0.3)", display: "flex", alignItems: "center", justifyContent: "center", padding: 5, overflow: "hidden" }}>
              <img src="/upsa-logo.png" alt="UPSA" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(1.2)" }} onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: "var(--gold)", lineHeight: 1.1 }}>GradeIQ UPSA</p>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-heading)", letterSpacing: "0.08em" }}>Smart Academic Platform</p>
            </div>
          </div>

          <div className="landing-desktop-nav" style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <a href="#how-it-works" style={{ padding: "7px 14px", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>How it Works</a>
            <a href="#support" style={{ padding: "7px 14px", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.5)", textDecoration: "none" }}>Support</a>
            <Link to="/login" style={{ padding: "7px 16px", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 13, color: "rgba(255,255,255,0.7)", textDecoration: "none" }}>Sign In</Link>
            <Link to="/register" className="btn btn-gold btn-sm">Get Started</Link>
          </div>

          <button
            className="landing-mobile-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", padding: 6, cursor: "pointer" }}
          >
            <span style={{ display: "block", width: 22, height: 2, background: "var(--gold)", borderRadius: 999, transition: "all 0.3s", transform: menuOpen ? "rotate(45deg) translate(5px, 5px)" : "none" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "var(--gold)", borderRadius: 999, transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }} />
            <span style={{ display: "block", width: 22, height: 2, background: "var(--gold)", borderRadius: 999, transition: "all 0.3s", transform: menuOpen ? "rotate(-45deg) translate(5px, -5px)" : "none" }} />
          </button>

        </div>
      </nav>

      {menuOpen && (
        <div className="landing-mobile-hamburger" style={{
          display: "flex", position: "fixed",
          top: 64, left: 0, right: 0,
          background: "#0f2d6e",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          flexDirection: "column",
          padding: "16px", gap: 4, zIndex: 99,
          boxShadow: "0 8px 32px rgba(8,28,70,0.4)",
        }}>
          <a href="#how-it-works" onClick={() => setMenuOpen(false)} style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-heading)", textDecoration: "none", color: "rgba(255,255,255,0.7)" }}>How it Works</a>
          <a href="#support" onClick={() => setMenuOpen(false)} style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-heading)", textDecoration: "none", color: "rgba(255,255,255,0.7)" }}>Support</a>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 12, marginTop: 8, display: "flex", flexDirection: "column", gap: 8 }}>
            <Link to="/login" onClick={() => setMenuOpen(false)} style={{ padding: "12px 16px", borderRadius: "var(--radius-sm)", fontSize: 14, fontWeight: 600, fontFamily: "var(--font-heading)", textDecoration: "none", color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.05)", textAlign: "center" }}>Sign In</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)} className="btn btn-gold" style={{ textAlign: "center", borderRadius: "var(--radius-sm)", padding: "12px 16px", fontSize: 14 }}>Create Free Account</Link>
          </div>
        </div>
      )}

      {menuOpen && (
        <div className="landing-mobile-hamburger" onClick={() => setMenuOpen(false)} style={{ display: "block", position: "fixed", inset: 0, top: 64, background: "rgba(0,0,0,0.4)", zIndex: 98 }} />
      )}
    </>
  );
}

export default function Landing() {
  return (
    <div style={{ minHeight: "100vh", fontFamily: "var(--font-body)", background: "var(--bg-page)", overflowX: "hidden" }}>

      <LandingNav />

      <div style={{ background: "linear-gradient(160deg, #060f2e 0%, var(--navy) 60%, #0a2050 100%)", padding: "100px 32px 120px", position: "relative", overflow: "hidden", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 760, margin: "0 auto" }} className="fade-up">
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(255,192,5,0.08)", border: "1px solid rgba(255,192,5,0.2)", borderRadius: "var(--radius-full)", padding: "6px 16px", marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--gold)" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 12, color: "rgba(255,255,255,0.7)" }}>University of Professional Studies, Accra</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(40px, 7vw, 72px)", lineHeight: 1.05, letterSpacing: "-0.03em", marginBottom: 24 }}>
            <span style={{ color: "var(--gold)" }}>Know Your Grade.</span><br />
            <span style={{ color: "white" }}>Own Your Future.</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "clamp(15px, 2vw, 18px)", lineHeight: 1.8, maxWidth: 580, margin: "0 auto 44px" }}>
            The smart academic intelligence platform built exclusively for UPSA students. Track your CGPA, analyse your risk and plan your path to First Class.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
            <Link to="/register" className="btn btn-gold btn-lg" style={{ minWidth: 200, fontSize: 15 }}>Create Free Account</Link>
            <Link to="/login" className="btn btn-ghost btn-lg" style={{ minWidth: 140 }}>Sign In</Link>
          </div>
          <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 40 }}>
            {[
              { value: "100%", label: "Free Forever" },
              { value: "6", label: "Smart Tools" },
              { value: "9", label: "Grade Types" },
              { value: "UPSA", label: "Official Scale" },
            ].map((stat, i) => (
              <div key={stat.label} style={{ textAlign: "center", padding: "0 24px", borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(24px, 3vw, 32px)", color: "var(--gold)", lineHeight: 1, marginBottom: 6 }}>{stat.value}</p>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-heading)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>Platform Features</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--navy)", marginBottom: 16, letterSpacing: "-0.02em", lineHeight: 1.15 }}>
            Built for UPSA students,<br />by a UPSA student.
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: 16, lineHeight: 1.8, maxWidth: 520, margin: "0 auto" }}>
            Every feature was designed around the way UPSA calculates grades, classifies students and measures academic performance.
          </p>
        </div>
        <div className="grid-3" style={{ gap: 20 }}>
          {features.map((f, i) => (
            <div key={f.title} className={"card fade-up-" + Math.min(i + 1, 5)}
              style={{ border: "1.5px solid " + f.border, cursor: "default", transition: "var(--transition)" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-sm)"; }}
            >
              <div style={{ width: 52, height: 52, borderRadius: "var(--radius-md)", background: f.color, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 11, color: f.iconColor, letterSpacing: "0.05em" }}>{f.abbr}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: "var(--navy)", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.7 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #060f2e 0%, var(--navy) 100%)", padding: "96px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "rgba(255,192,5,0.5)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>Official UPSA Grading System</p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 44px)", color: "white", marginBottom: 12, letterSpacing: "-0.02em" }}>Classification Scale</h2>
            <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}>GradeIQ uses the official UPSA grading system. Know exactly where you stand and what it takes to move up.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16 }}>
            {classifications.map((c, i) => (
              <div key={c.label}
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "var(--radius-lg)", padding: "28px 20px", textAlign: "center", transition: "all 0.2s ease", cursor: "default" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = c.bg; e.currentTarget.style.borderColor = c.border; e.currentTarget.style.transform = "translateY(-4px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <div style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                  <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 12, color: c.color }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "white", marginBottom: 8, lineHeight: 1.3 }}>{c.label}</p>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 20, color: c.color }}>{c.range}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div id="how-it-works" style={{ maxWidth: 1200, margin: "0 auto", padding: "96px 32px" }}>
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>Simple to Use</p>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(28px, 4vw, 44px)", color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 16 }}>Up and running in 3 steps.</h2>
          <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>No technical knowledge required. If you have your result sheet, you are ready.</p>
        </div>
        <div className="grid-3" style={{ gap: 24 }}>
          {steps.map((step) => (
            <div key={step.num}
              style={{ padding: "44px 32px", background: "var(--bg-card)", borderRadius: "var(--radius-xl)", border: "1.5px solid var(--border)", boxShadow: "var(--shadow-md)", position: "relative", transition: "var(--transition)", overflow: "hidden" }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "var(--shadow-lg)"; e.currentTarget.style.borderColor = "var(--navy)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-md)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >
              <div style={{ position: "absolute", top: -10, right: 16, fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 80, color: "rgba(8,28,70,0.04)", lineHeight: 1, pointerEvents: "none", userSelect: "none" }}>{step.num}</div>
              <div style={{ width: 48, height: 48, borderRadius: "var(--radius-md)", background: "var(--navy)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 13, color: "var(--gold)" }}>{step.num}</span>
              </div>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 18, color: "var(--navy)", marginBottom: 12 }}>{step.title}</h3>
              <p style={{ fontSize: 14, color: "var(--text-muted)", lineHeight: 1.8 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div id="support" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)", padding: "96px 32px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "start" }} className="support-grid">
          <div>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 16 }}>Help and Support</p>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(24px, 3vw, 36px)", color: "var(--navy)", letterSpacing: "-0.02em", lineHeight: 1.15, marginBottom: 16 }}>We are here to help.</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 15, lineHeight: 1.8, marginBottom: 28, maxWidth: 400 }}>Experiencing an issue with your account, results or any feature? Reach out directly and we will respond as quickly as possible.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <a href="mailto:ahenkorajoshuaowusu@outlook.com" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "var(--bg-page)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", textDecoration: "none", transition: "var(--transition)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.background = "var(--navy)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-page)"; }}
              >
                <div>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Email Support</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>ahenkorajoshuaowusu@outlook.com</p>
                </div>
              </a>
              <a href="tel:+233537041324" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 20px", background: "var(--bg-page)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", textDecoration: "none", transition: "var(--transition)" }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.background = "var(--navy)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-page)"; }}
              >
                <div>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 2 }}>Phone / WhatsApp</p>
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, color: "var(--navy)" }}>+233 537 041 324</p>
                </div>
              </a>
            </div>
          </div>
          <div>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 20 }}>Frequently Asked Questions</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {faqs.map((faq, i) => (
                <div key={i} style={{ padding: "14px 16px", background: "var(--bg-page)", border: "1.5px solid var(--border)", borderRadius: "var(--radius-md)", transition: "var(--transition)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.background = "white"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-page)"; }}
                >
                  <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "var(--navy)", marginBottom: 4 }}>{faq.q}</p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: "linear-gradient(135deg, #060f2e 0%, var(--navy) 100%)", padding: "96px 32px", textAlign: "center" }}>
        <div style={{ position: "relative", zIndex: 10, maxWidth: 600, margin: "0 auto" }} className="fade-up">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: "clamp(32px, 5vw, 52px)", color: "white", marginBottom: 16, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Start tracking your<br /><span style={{ color: "var(--gold)" }}>CGPA today.</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 16, lineHeight: 1.8, marginBottom: 40 }}>Free forever. No scores needed. Just your grades, your goals and your growth.</p>
          <Link to="/register" className="btn btn-gold btn-lg" style={{ minWidth: 240, fontSize: 15 }}>Create Free Account</Link>
        </div>
      </div>

      <div style={{ background: "#060f2e", padding: "48px 32px 32px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 40, marginBottom: 48, paddingBottom: 40, borderBottom: "1px solid rgba(255,255,255,0.06)" }} className="footer-grid">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,192,5,0.1)", border: "1px solid rgba(255,192,5,0.2)", display: "flex", alignItems: "center", justifyContent: "center", padding: 5, overflow: "hidden" }}>
                  <img src="/upsa-logo.png" alt="UPSA" style={{ width: "100%", height: "100%", objectFit: "contain", filter: "brightness(1.2)" }} onError={(e) => { e.target.style.display = "none"; }} />
                </div>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: "var(--gold)" }}>GradeIQ UPSA</span>
              </div>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", lineHeight: 1.7, maxWidth: 240 }}>The smart academic intelligence platform for University of Professional Studies, Accra students.</p>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Quick Links</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <Link to="/register" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 500 }}>Create Account</Link>
                <Link to="/login" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 500 }}>Sign In</Link>
                <a href="#how-it-works" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 500 }}>How It Works</a>
                <a href="#support" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 500 }}>Support</a>
              </div>
            </div>
            <div>
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.15em", marginBottom: 16 }}>Contact</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <a href="mailto:ahenkorajoshuaowusu@outlook.com" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 500 }}>ahenkorajoshuaowusu@outlook.com</a>
                <a href="tel:+233537041324" style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 500 }}>+233 537 041 324</a>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "var(--font-heading)", marginTop: 4 }}>University of Professional Studies, Accra</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <p style={{ color: "rgba(255,255,255,0.15)", fontSize: 12, fontFamily: "var(--font-heading)" }}>2026 GradeIQ UPSA - Developed by Ahenkora Joshua Owusu</p>
            <p style={{ color: "rgba(255,255,255,0.1)", fontSize: 11, fontFamily: "var(--font-heading)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Scholarship with Professionalism</p>
          </div>
        </div>
      </div>

      <LandingHelpButton />

      <style>{`
        @media (min-width: 769px) {
          .landing-desktop-nav { display: flex !important; }
          .landing-mobile-hamburger { display: none !important; }
        }
        @media (max-width: 768px) {
          .landing-desktop-nav { display: none !important; }
          .landing-mobile-hamburger { display: flex !important; }
          .support-grid { grid-template-columns: 1fr !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          nav > div { padding: 0 16px !important; }
        }
      `}</style>
    </div>
  );
}
