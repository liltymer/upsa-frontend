import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboard, getRisk, getTrends } from "../services/api";
import API from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [risk, setRisk] = useState(null);
  const [trends, setTrends] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashData, riskData, trendData, annData] = await Promise.all([
          getDashboard(),
          getRisk(),
          getTrends(),
          API.get("/announcements/active"),
        ]);
        setDashboard(dashData);
        setRisk(riskData);
        setTrends(trendData);
        setAnnouncements(annData.data || []);
      } catch {
        setError("Failed to load dashboard. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading your dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="loading-screen">
      <div className="alert alert-red" style={{ maxWidth: 400 }}>
        {error}
      </div>
    </div>
  );

  const cgpa = dashboard?.cgpa ?? 0;

  const getMotivation = (cgpa) => {
    if (cgpa >= 3.6) return { msg: "Outstanding! You are achieving First Class. Keep it up!", type: "green" };
    if (cgpa >= 3.0) return { msg: `Only ${(3.6 - cgpa).toFixed(2)} points from First Class. Push harder!`, type: "gold" };
    if (cgpa >= 2.5) return { msg: `${(3.0 - cgpa).toFixed(2)} points to Second Class Upper. Stay focused!`, type: "blue" };
    if (cgpa >= 2.0) return { msg: "You are in Third Class. Consistent effort will lift you.", type: "amber" };
    return { msg: "Critical: Please seek academic counseling immediately.", type: "red" };
  };

  const getRiskStyle = (level) => {
    if (level === "High") return { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)", dot: "#EF4444" };
    if (level === "Medium") return { color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)", dot: "#F59E0B" };
    return { color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)", dot: "#22C55E" };
  };

  const getTrendStyle = (trend) => {
    if (trend === "Improving") return { color: "var(--green)", bg: "var(--green-bg)" };
    if (trend === "Declining") return { color: "var(--red)", bg: "var(--red-bg)" };
    return { color: "var(--amber)", bg: "var(--amber-bg)" };
  };

  const getClassStyle = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" };
    if (cgpa >= 1.0) return { label: "Pass", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" };
    return { label: "Fail", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" };
  };

  const getPriorityStyle = (priority) => {
    if (priority === "urgent") return { color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)", label: "Urgent" };
    if (priority === "important") return { color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)", label: "Important" };
    return { color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)", label: "Notice" };
  };

  const motivation = getMotivation(cgpa);
  const riskStyle = getRiskStyle(risk?.risk_analysis?.risk_level);
  const trendStyle = getTrendStyle(trends?.trend_analysis?.trend);
  const classStyle = getClassStyle(cgpa);

  const alertTypeMap = {
    green: "alert-green", gold: "alert-gold",
    blue: "alert-gold", amber: "alert-gold", red: "alert-red",
  };

  const features = [
    { label: "My Results", sub: "Add, edit and manage your semester results", path: "/results", color: "var(--blue-bg)", border: "var(--blue-border)" },
    { label: "GPA Tracker", sub: "View your GPA history and semester breakdown", path: "/gpa", color: "var(--green-bg)", border: "var(--green-border)" },
    { label: "Transcript", sub: "View full academic record and download PDF", path: "/transcript", color: "var(--orange-bg)", border: "var(--orange-border)" },
    { label: "GPA Simulator", sub: "Simulate future CGPA and calculate target grades", path: "/simulator", color: "#FDF4FF", border: "#E9D5FF" },
    { label: "Risk Analysis", sub: "Check your academic risk level and alerts", path: "/risk", color: "var(--amber-bg)", border: "var(--amber-border)" },
  ];

  const featureIcons = {
    "/results": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14,2 14,8 20,8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10,9 9,9 8,9"/>
      </svg>
    ),
    "/gpa": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10"/>
        <line x1="12" y1="20" x2="12" y2="4"/>
        <line x1="6" y1="20" x2="6" y2="14"/>
      </svg>
    ),
    "/transcript": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
    ),
    "/simulator": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12,6 12,12 16,14"/>
      </svg>
    ),
    "/risk": (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: "var(--font-body)",
    }}>

      {/* ================================
          HERO HEADER
      ================================ */}
      <div className="page-header">
        <div className="header-inner">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "center",
          }} className="dash-hero">

            <div className="fade-up">
              <div className="badge badge-navy" style={{ marginBottom: 16 }}>
                <span style={{
                  width: 6, height: 6,
                  borderRadius: "50%",
                  background: "var(--gold)",
                }} />
                Academic Year {user?.academic_year || dashboard?.academic_year || "2024/2025"}
              </div>

              <h1 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800,
                fontSize: "clamp(22px, 3vw, 32px)",
                color: "white",
                marginBottom: 4,
                lineHeight: 1.2,
              }}>
                {user?.name || dashboard?.name}
              </h1>

              <p style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
                fontFamily: "var(--font-heading)",
                marginBottom: 20,
              }}>
                {user?.index_number || dashboard?.index_number}
              </p>

              <div
                className={`alert ${alertTypeMap[motivation.type]}`}
                style={{ maxWidth: 480, display: "inline-flex" }}
              >
                <span>{motivation.msg}</span>
              </div>
            </div>

            <div className="fade-up-1 dash-cgpa-badge" style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,192,5,0.2)",
              borderRadius: "var(--radius-xl)",
              padding: "28px 36px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
              minWidth: 180,
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-heading)",
                marginBottom: 8,
              }}>
                Cumulative GPA
              </p>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "clamp(48px, 6vw, 68px)",
                color: "var(--gold)",
                lineHeight: 1,
                marginBottom: 10,
              }}>
                {cgpa.toFixed(2)}
              </p>
              <span style={{
                background: classStyle.bg,
                color: classStyle.color,
                border: `1px solid ${classStyle.border}`,
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 12,
                padding: "5px 14px",
                borderRadius: "var(--radius-full)",
                display: "inline-block",
              }}>
                {classStyle.label}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* ================================
          STAT CARDS
      ================================ */}
      <div className="overlap-section">
        <div className="grid-3">

          <div className="stat-card card fade-up-1">
            <div className="stat-icon" style={{
              background: dashboard?.academic_standing === "Good Standing"
                ? "var(--green-bg)" : "var(--red-bg)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={dashboard?.academic_standing === "Good Standing" ? "var(--green)" : "var(--red)"}
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {dashboard?.academic_standing === "Good Standing"
                  ? <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></>
                  : <><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></>
                }
              </svg>
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                Academic Standing
              </p>
              <p className="stat-value" style={{
                fontSize: 18,
                color: dashboard?.academic_standing === "Good Standing"
                  ? "var(--green)" : "var(--red)",
              }}>
                {dashboard?.academic_standing}
              </p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>
                {dashboard?.academic_standing === "Good Standing"
                  ? "No issues detected" : "Action required"}
              </p>
            </div>
          </div>

          <div className="card-dark stat-card fade-up-2" style={{
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-navy)",
          }}>
            <div className="stat-icon" style={{
              background: "rgba(255,192,5,0.15)",
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
            </div>
            <div>
              <p className="stat-label" style={{ color: "rgba(255,255,255,0.4)" }}>
                Gap to Next Class
              </p>
              <p className="stat-value" style={{
                fontSize: 32, color: "var(--gold)",
              }}>
                {risk?.risk_analysis?.gap_to_next_class != null
                  ? `+${risk.risk_analysis.gap_to_next_class}`
                  : "—"}
              </p>
              <p className="stat-sub" style={{ color: "rgba(255,255,255,0.4)" }}>
                Needed for {risk?.risk_analysis?.next_class || "Top Class"}
              </p>
            </div>
          </div>

          <div className="stat-card card fade-up-3">
            <div className="stat-icon" style={{ background: trendStyle.bg }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                stroke={trendStyle.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {trends?.trend_analysis?.trend === "Improving"
                  ? <><polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/><polyline points="17,6 23,6 23,12"/></>
                  : trends?.trend_analysis?.trend === "Declining"
                  ? <><polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/><polyline points="17,18 23,18 23,12"/></>
                  : <line x1="5" y1="12" x2="19" y2="12"/>
                }
              </svg>
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                GPA Trend
              </p>
              <p className="stat-value" style={{
                fontSize: 18, color: trendStyle.color,
              }}>
                {trends?.trend_analysis?.trend || "No Data"}
              </p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>
                {trends?.trend_analysis?.latest_gpa
                  ? `Latest: ${trends.trend_analysis.latest_gpa.toFixed(2)}`
                  : "Add more results"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================================
          MAIN CONTENT
      ================================ */}
      <div className="page-content" style={{ marginTop: 28 }}>

        {/* ================================
            ANNOUNCEMENTS BANNER
        ================================ */}
        {announcements.length > 0 && (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            marginBottom: 28,
          }}>
            {announcements.map((ann) => {
              const ps = getPriorityStyle(ann.priority);
              return (
                <div
                  key={ann.id}
                  style={{
                    background: ps.bg,
                    border: `1px solid ${ps.border}`,
                    borderLeft: `4px solid ${ps.color}`,
                    borderRadius: "var(--radius-md)",
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 4,
                      flexWrap: "wrap",
                    }}>
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 14,
                        color: ps.color,
                      }}>
                        {ann.title}
                      </span>
                      <span style={{
                        background: ps.color,
                        color: "white",
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 9,
                        padding: "2px 8px",
                        borderRadius: "var(--radius-full)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}>
                        {ps.label}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {ann.message}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="grid-main">

          {/* LEFT COLUMN */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 24,
          }}>

            {/* Risk Analysis */}
            <div className="card fade-up-4">
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}>
                <h3 className="section-title" style={{ marginBottom: 0 }}>
                  Academic Risk Analysis
                </h3>
                <span style={{
                  background: riskStyle.bg,
                  border: `1px solid ${riskStyle.border}`,
                  color: riskStyle.color,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700, fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}>
                  <span style={{
                    width: 7, height: 7,
                    borderRadius: "50%",
                    background: riskStyle.dot,
                  }} />
                  {risk?.risk_analysis?.risk_level || "Low"} Risk
                </span>
              </div>

              {risk?.risk_analysis?.alerts?.length > 0 ? (
                <div style={{
                  display: "flex", flexDirection: "column", gap: 10,
                }}>
                  {risk.risk_analysis.alerts.map((alert, i) => (
                    <div key={i} className="alert alert-gold">
                      {alert}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="alert alert-green">
                  No active alerts — you are in good academic standing.
                </div>
              )}

              <Link to="/risk" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 18,
                color: "var(--navy)",
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 13,
                padding: "10px 16px",
                background: "var(--bg-page)",
                border: "1.5px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                transition: "var(--transition)",
                textDecoration: "none",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--navy)";
                  e.currentTarget.style.color = "var(--gold)";
                  e.currentTarget.style.borderColor = "var(--navy)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "var(--bg-page)";
                  e.currentTarget.style.color = "var(--navy)";
                  e.currentTarget.style.borderColor = "var(--border)";
                }}
              >
                View full risk report →
              </Link>
            </div>

            {/* Platform Features */}
            <div>
              <h3 className="section-title">Platform Features</h3>
              <div className="grid-2" style={{ gap: 12 }}>
                {features.map((item, i) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`fade-up-${Math.min(i + 1, 5)}`}
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: "var(--radius-md)",
                      padding: "18px",
                      border: `1.5px solid ${item.border}`,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      transition: "var(--transition)",
                      boxShadow: "var(--shadow-sm)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
                    }}
                  >
                    <div style={{
                      width: 42, height: 42,
                      borderRadius: "var(--radius-sm)",
                      background: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--navy)",
                      flexShrink: 0,
                    }}>
                      {featureIcons[item.path]}
                    </div>
                    <div>
                      <p style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 14,
                        color: "var(--navy)", marginBottom: 3,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: 12,
                        color: "var(--text-muted)",
                        lineHeight: 1.5,
                      }}>
                        {item.sub}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN — GPA History */}
          <div className="card fade-up-4" style={{
            position: "sticky",
            top: "calc(var(--navbar-height) + 16px)",
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                GPA History
              </h3>
              <Link to="/gpa" style={{
                color: "var(--text-muted)",
                fontFamily: "var(--font-heading)",
                fontWeight: 600, fontSize: 12,
                textDecoration: "none",
              }}>
                See all →
              </Link>
            </div>

            {trends?.trend_analysis?.history?.length > 0 ? (
              <div style={{
                display: "flex", flexDirection: "column", gap: 12,
              }}>
                {trends.trend_analysis.history.map((item, i) => {
                  const pct = (item.gpa / 4.0) * 100;
                  const barColor = item.gpa >= 3.6 ? "#22C55E"
                    : item.gpa >= 3.0 ? "#3B82F6"
                    : item.gpa >= 2.5 ? "#F59E0B"
                    : item.gpa >= 2.0 ? "#F97316"
                    : "#EF4444";
                  return (
                    <div key={i} style={{
                      padding: "12px 14px",
                      background: "var(--bg-page)",
                      borderRadius: "var(--radius-md)",
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}>
                        <p style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 13,
                          color: "var(--navy)",
                        }}>
                          Year {item.year} — Sem {item.semester}
                        </p>
                        <span style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900, fontSize: 18,
                          color: barColor,
                        }}>
                          {item.gpa.toFixed(2)}
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{ width: `${pct}%`, background: barColor }}
                        />
                      </div>
                    </div>
                  );
                })}

                <div style={{
                  background: "var(--navy)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px", marginTop: 4,
                }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      fontFamily: "var(--font-heading)",
                    }}>
                      CGPA Progress
                    </span>
                    <span style={{
                      fontSize: 13, fontWeight: 800,
                      color: "var(--gold)",
                      fontFamily: "var(--font-heading)",
                    }}>
                      {cgpa.toFixed(2)} / 4.00
                    </span>
                  </div>
                  <div style={{
                    height: 8,
                    background: "rgba(255,255,255,0.1)",
                    borderRadius: "var(--radius-full)",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(cgpa / 4.0) * 100}%`,
                      background: "linear-gradient(90deg, var(--gold), var(--gold-deep))",
                      borderRadius: "var(--radius-full)",
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600, fontSize: 14,
                  color: "var(--navy)", marginBottom: 6,
                }}>
                  No results yet
                </p>
                <p style={{
                  fontSize: 13, color: "var(--text-muted)",
                  marginBottom: 20,
                }}>
                  Add your semester results to start tracking
                </p>
                <Link to="/results" className="btn btn-primary btn-sm">
                  Add Results →
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dash-hero { grid-template-columns: 1fr !important; }
          .dash-cgpa-badge { display: none !important; }
        }
        @media (max-width: 480px) {
          .dash-hero h1 { font-size: 20px !important; }
        }
      `}</style>

    </div>
  );
}