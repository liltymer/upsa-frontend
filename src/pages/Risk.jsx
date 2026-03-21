import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getRisk } from "../services/api";

const IconChart = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/>
    <line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const IconTarget = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconRiskLow = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22,4 12,14.01 9,11.01"/>
  </svg>
);

const IconRiskMedium = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconRiskHigh = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const classBandsData = [
  { label: "First Class", range: "3.6 - 4.0", min: 3.6, color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" },
  { label: "Second Class Upper", range: "3.0 - 3.59", min: 3.0, color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
  { label: "Second Class Lower", range: "2.5 - 2.99", min: 2.5, color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" },
  { label: "Third Class", range: "2.0 - 2.49", min: 2.0, color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" },
  { label: "Pass", range: "1.0 - 1.99", min: 1.0, color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" },
  { label: "Fail", range: "0.0 - 0.99", min: 0, color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" },
];

const bandIcons = [
  <svg key="0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  <svg key="1" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--blue)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>,
  <svg key="2" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--amber)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>,
  <svg key="3" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--orange)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  <svg key="4" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
  <svg key="5" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
];

export default function Risk() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const data = await getRisk();
        setRisk(data.risk_analysis);
      } catch { setError("Failed to load risk analysis. Please refresh."); }
      finally { setLoading(false); }
    };
    fetchRisk();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Analysing your academic risk...</p>
    </div>
  );

  if (error) return (
    <div className="loading-screen">
      <div className="alert alert-red" style={{ maxWidth: 400 }}>{error}</div>
    </div>
  );

  const cgpa = risk?.cgpa ?? 0;
  const riskLevel = risk?.risk_level ?? "Low";
  const gap = risk?.gap_to_next_class;
  const nextClass = risk?.next_class;
  const alerts = risk?.alerts ?? [];
  const actions = risk?.recommended_actions ?? [];

  const getRiskStyle = (level) => {
    if (level === "High") return { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)", dot: "#EF4444", label: "High Risk", desc: "Immediate action required.", Icon: IconRiskHigh };
    if (level === "Medium") return { color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)", dot: "#F59E0B", label: "Medium Risk", desc: "Your performance needs attention.", Icon: IconRiskMedium };
    return { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)", dot: "#22C55E", label: "Low Risk", desc: "You are in good academic standing.", Icon: IconRiskLow };
  };

  const getClassStyle = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" };
    if (cgpa >= 1.0) return { label: "Pass", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" };
    return { label: "Fail", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" };
  };

  const riskStyle = getRiskStyle(riskLevel);
  const classStyle = getClassStyle(cgpa);
  const currentBandIdx = classBandsData.findIndex((b) => cgpa >= b.min);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", fontFamily: "var(--font-body)" }}>

      <div className="page-header">
        <div className="header-inner" style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
          <div className="fade-up">
            <p className="page-eyebrow">Academic Intelligence</p>
            <h1 className="page-title">Risk Analysis</h1>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, maxWidth: 420, lineHeight: 1.6 }}>
              A full breakdown of your academic risk level, classification gap, and recommended actions.
            </p>
          </div>
          <div className="fade-up-1" style={{ background: riskStyle.bg, border: "1.5px solid " + riskStyle.border, borderRadius: "var(--radius-lg)", padding: "20px 28px", textAlign: "center", flexShrink: 0 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}><riskStyle.Icon /></div>
            <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 18, color: riskStyle.color, marginBottom: 4 }}>{riskStyle.label}</p>
            <p style={{ fontSize: 12, color: riskStyle.color, opacity: 0.7, fontFamily: "var(--font-heading)" }}>Current Status</p>
          </div>
        </div>
      </div>

      <div className="overlap-section">
        <div className="grid-3">
          <div className="card-dark stat-card fade-up-1" style={{ borderRadius: "var(--radius-lg)" }}>
            <div className="stat-icon" style={{ background: "rgba(255,192,5,0.15)" }}><IconChart /></div>
            <div>
              <p className="stat-label" style={{ color: "rgba(255,255,255,0.4)" }}>Current CGPA</p>
              <p className="stat-value" style={{ fontSize: 36, color: "var(--gold)" }}>{cgpa.toFixed(2)}</p>
              <p className="stat-sub" style={{ color: "rgba(255,255,255,0.4)" }}>{classStyle.label}</p>
            </div>
          </div>

          <div className="stat-card card fade-up-2">
            <div className="stat-icon" style={{ background: "var(--blue-bg)" }}><IconTarget /></div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>Gap to Next Class</p>
              <p className="stat-value" style={{ fontSize: 32, color: gap != null && gap <= 0 ? "var(--green)" : "var(--navy)" }}>{gap != null ? "+" + gap : "—"}</p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>{gap != null && gap <= 0 ? "Already at top class" : "To reach " + (nextClass || "next class")}</p>
            </div>
          </div>

          <div className="stat-card card fade-up-3">
            <div style={{ width: "100%" }}>
              <p className="stat-label" style={{ color: "var(--text-muted)", marginBottom: 12 }}>CGPA Progress to 4.0</p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 10 }}>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, color: "var(--navy)" }}>{cgpa.toFixed(2)}</span>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: 14, color: "var(--text-muted)" }}>4.00</span>
              </div>
              <div className="progress-track" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: ((cgpa / 4.0) * 100) + "%", background: "linear-gradient(90deg, " + (cgpa >= 3.6 ? "#22C55E, #16a34a" : cgpa >= 3.0 ? "#3B82F6, #1d4ed8" : cgpa >= 2.5 ? "#F59E0B, #d97706" : "#EF4444, #dc2626") + ")" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                {[1.0, 2.0, 2.5, 3.0, 3.6].map((v) => (
                  <span key={v} style={{ fontSize: 9, color: "var(--text-muted)", fontFamily: "var(--font-heading)", fontWeight: 600 }}>{v}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: 28 }}>
        <div className="grid-main">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            <div className="card fade-up" style={{ border: "1.5px solid " + riskStyle.border, background: riskStyle.bg }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flexShrink: 0, marginTop: 2 }}><riskStyle.Icon /></div>
                <div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 16, color: riskStyle.color, marginBottom: 4 }}>{riskStyle.label}</h3>
                  <p style={{ fontSize: 14, color: riskStyle.color, opacity: 0.8, lineHeight: 1.5 }}>
                    {riskStyle.desc}{" "}
                    {riskLevel === "High" && "Visit your academic advisor immediately."}
                    {riskLevel === "Medium" && "Take action before it worsens."}
                    {riskLevel === "Low" && "Keep up the excellent work."}
                  </p>
                </div>
              </div>
            </div>

            {alerts.length > 0 && (
              <div className="card fade-up-1">
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                  <IconAlert />
                  <h3 className="section-title" style={{ marginBottom: 0 }}>Active Alerts</h3>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {alerts.map((alert, i) => (
                    <div key={i} className="alert alert-gold">
                      <span>{alert}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="card fade-up-2">
              <h3 className="section-title">Recommended Actions</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {actions.length > 0 ? actions.map((action, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 14, padding: "14px 16px", background: "var(--bg-page)", borderRadius: "var(--radius-md)", border: "1px solid var(--border)", transition: "var(--transition)" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--navy)"; e.currentTarget.style.background = "white"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.background = "var(--bg-page)"; }}
                  >
                    <span style={{ width: 28, height: 28, borderRadius: "var(--radius-sm)", background: "var(--navy)", color: "var(--gold)", fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
                    <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.5, paddingTop: 3 }}>{action}</p>
                  </div>
                )) : (
                  <div className="alert alert-green">
                    <span style={{ marginRight: 8 }}><IconCheck /></span>
                    No specific actions needed — you are performing well.
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Link to="/simulator" className="btn btn-primary">Calculate Target Grade</Link>
              <Link to="/gpa" className="btn btn-outline">View GPA History</Link>
            </div>
          </div>

          <div className="card fade-up-3" style={{ position: "sticky", top: "calc(var(--navbar-height) + 16px)" }}>
            <h3 className="section-title">Classification Ladder</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {classBandsData.map((band, i) => {
                const isYou = i === currentBandIdx;
                return (
                  <div key={band.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 16px", background: isYou ? band.bg : "var(--bg-page)", border: "1.5px solid " + (isYou ? band.border : "var(--border)"), borderRadius: "var(--radius-md)", transition: "var(--transition)", position: "relative" }}>
                    <span style={{ flexShrink: 0 }}>{bandIcons[i]}</span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: isYou ? 800 : 600, fontSize: 13, color: isYou ? band.color : "var(--text-secondary)", marginBottom: 2 }}>{band.label}</p>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: isYou ? band.color : "var(--text-muted)", opacity: isYou ? 1 : 0.7 }}>{band.range}</p>
                    </div>
                    {isYou && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {gap != null && gap > 0 && (
                          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 11, color: band.color, background: "rgba(255,255,255,0.6)", padding: "3px 8px", borderRadius: "var(--radius-full)" }}>+{gap}</span>
                        )}
                        <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 10, color: "white", background: band.color, padding: "3px 10px", borderRadius: "var(--radius-full)", letterSpacing: "0.05em" }}>YOU</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: 20, padding: "16px", background: "var(--navy)", borderRadius: "var(--radius-md)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-heading)" }}>Your CGPA</span>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 14, color: "var(--gold)" }}>{cgpa.toFixed(2)} / 4.00</span>
              </div>
              <div style={{ height: 8, background: "rgba(255,255,255,0.1)", borderRadius: "var(--radius-full)", overflow: "hidden" }}>
                <div style={{ height: "100%", width: ((cgpa / 4.0) * 100) + "%", background: "linear-gradient(90deg, var(--gold), var(--gold-deep))", borderRadius: "var(--radius-full)", transition: "width 1s ease" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
