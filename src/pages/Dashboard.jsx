import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDashboard, getRisk, getTrends } from "../services/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [risk, setRisk] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [dashData, riskData, trendData] = await Promise.all([
          getDashboard(),
          getRisk(),
          getTrends(),
        ]);
        setDashboard(dashData);
        setRisk(riskData);
        setTrends(trendData);
      } catch (err) {
        setError("Failed to load dashboard. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#F5F7FF",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}>
        <div style={{
          width: 52, height: 52,
          border: "4px solid rgba(8,28,70,0.08)",
          borderTop: "4px solid #081C46",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, color: "#081C46", fontSize: 14,
        }}>Loading your dashboard...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F7FF",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 24,
      }}>
        <div style={{
          background: "#FEF2F2",
          borderLeft: "4px solid #EF4444",
          padding: "20px 28px",
          borderRadius: "0 16px 16px 0",
          color: "#B91C1C",
          fontWeight: 500, fontSize: 14,
          maxWidth: 400,
        }}>
          {error}
        </div>
      </div>
    );
  }

  const cgpa = dashboard?.cgpa ?? 0;

  const getMotivation = (cgpa, classification) => {
    if (cgpa >= 3.6) return { msg: "Outstanding! You're achieving First Class. Keep it up!", color: "#166534", bg: "#F0FDF4", border: "#22C55E" };
    if (cgpa >= 3.0) return { msg: `Only ${(3.6 - cgpa).toFixed(2)} points away from First Class. Push harder!`, color: "#92400E", bg: "#FFFBEB", border: "#FFC005" };
    if (cgpa >= 2.5) return { msg: `${(3.0 - cgpa).toFixed(2)} points to Second Class Upper. Stay focused!`, color: "#1e40af", bg: "#EFF6FF", border: "#3B82F6" };
    if (cgpa >= 2.0) return { msg: "You're in Third Class. Consistent effort will lift you up.", color: "#92400E", bg: "#FFFBEB", border: "#F59E0B" };
    if (cgpa >= 1.0) return { msg: "Keep going — every result counts toward your improvement.", color: "#92400E", bg: "#FFFBEB", border: "#F59E0B" };
    return { msg: "Critical: CGPA below 1.0. Please seek academic counseling immediately.", color: "#B91C1C", bg: "#FEF2F2", border: "#EF4444" };
  };

  const getRiskStyle = (level) => {
    if (level === "High") return { bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", badge: "#FEE2E2" };
    if (level === "Medium") return { bg: "#FFFBEB", color: "#92400E", dot: "#F59E0B", badge: "#FEF3C7" };
    return { bg: "#F0FDF4", color: "#166534", dot: "#22C55E", badge: "#DCFCE7" };
  };

  const getTrendStyle = (trend) => {
    if (trend === "Improving") return { color: "#166534", icon: "↑", bg: "#F0FDF4" };
    if (trend === "Declining") return { color: "#B91C1C", icon: "↓", bg: "#FEF2F2" };
    return { color: "#92400E", icon: "→", bg: "#FFFBEB" };
  };

  const motivation = getMotivation(cgpa, dashboard?.classification);
  const riskStyle = getRiskStyle(risk?.risk_analysis?.risk_level);
  const trendStyle = getTrendStyle(trends?.trend_analysis?.trend);

  const features = [
    {
      label: "My Results",
      sub: "Add, edit and manage your semester results",
      path: "/results",
      icon: "📋",
      color: "#EFF6FF",
      border: "#BFDBFE",
    },
    {
      label: "GPA Tracker",
      sub: "View your GPA history and semester breakdown",
      path: "/gpa",
      icon: "📊",
      color: "#F0FDF4",
      border: "#BBF7D0",
    },
    {
      label: "Transcript",
      sub: "View full academic record and download PDF",
      path: "/transcript",
      icon: "📄",
      color: "#FFF7ED",
      border: "#FED7AA",
    },
    {
      label: "GPA Simulator",
      sub: "Simulate future CGPA and calculate target grades",
      path: "/simulator",
      icon: "🎯",
      color: "#FDF4FF",
      border: "#E9D5FF",
    },
    {
      label: "Risk Analysis",
      sub: "Check your academic risk level and alerts",
      path: "/risk",
      icon: "⚡",
      color: "#FFFBEB",
      border: "#FDE68A",
    },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F7FF",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ================================
          HERO — Full width premium
      ================================ */}
      <div style={{
        background: "linear-gradient(135deg, #081C46 0%, #0f2d6e 50%, #1a3a7a 100%)",
        padding: "0 0 100px",
        position: "relative",
        overflow: "hidden",
      }}>

        {/* Background decoration */}
        <div style={{
          position: "absolute", top: -120, right: -120,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(255,192,5,0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -60, left: "20%",
          width: 300, height: 300, borderRadius: "50%",
          background: "rgba(255,192,5,0.04)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", left: -80,
          width: 200, height: 200, borderRadius: "50%",
          background: "rgba(255,255,255,0.02)",
          pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "52px 32px 0",
          position: "relative",
          zIndex: 10,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 32,
          alignItems: "center",
        }}>

          {/* Left — Greeting + CGPA */}
          <div style={{ animation: "fadeUp 0.6s ease forwards", opacity: 0 }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,192,5,0.12)",
              border: "1px solid rgba(255,192,5,0.2)",
              padding: "6px 14px",
              borderRadius: 999,
              marginBottom: 20,
            }}>
              <span style={{
                width: 6, height: 6,
                background: "#FFC005",
                borderRadius: "50%",
              }} />
              <span style={{
                color: "#FFC005",
                fontSize: 12, fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                letterSpacing: "0.05em",
              }}>
                Academic Year 2024/2025
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 36,
              color: "#ffffff",
              marginBottom: 6,
              lineHeight: 1.2,
            }}>
              {user?.name || dashboard?.name}
            </h1>

            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 14,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 28,
            }}>
              {user?.index_number || dashboard?.index_number}
            </p>

            {/* Motivational banner */}
            <div style={{
              background: motivation.bg,
              border: `1px solid ${motivation.border}`,
              borderRadius: 12,
              padding: "12px 18px",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
              maxWidth: 480,
            }}>
              <span style={{ fontSize: 16 }}>💡</span>
              <p style={{
                color: motivation.color,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                lineHeight: 1.5,
              }}>
                {motivation.msg}
              </p>
            </div>
          </div>

          {/* Right — Big CGPA display */}
          <div style={{
            textAlign: "center",
            animation: "fadeUp 0.6s ease 0.15s forwards",
            opacity: 0,
          }}>
            <div style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,192,5,0.2)",
              borderRadius: 24,
              padding: "32px 40px",
              backdropFilter: "blur(10px)",
            }}>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 8,
              }}>
                Cumulative GPA
              </p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900,
                fontSize: 72,
                color: "#FFC005",
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {cgpa.toFixed(2)}
              </p>
              <div style={{
                background: "rgba(255,192,5,0.15)",
                border: "1px solid rgba(255,192,5,0.3)",
                borderRadius: 999,
                padding: "6px 16px",
                display: "inline-block",
              }}>
                <span style={{
                  color: "#FFC005",
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {dashboard?.classification}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ================================
          STAT CARDS — overlaps hero
      ================================ */}
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 32px",
        marginTop: -52,
        position: "relative",
        zIndex: 20,
        boxSizing: "border-box",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
        }}>

          {/* Academic Standing */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: "24px 28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            animation: "fadeUp 0.5s ease 0.2s forwards",
            opacity: 0,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: dashboard?.academic_standing === "Good Standing"
                ? "#F0FDF4" : "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}>
              {dashboard?.academic_standing === "Good Standing" ? "✅" : "⚠️"}
            </div>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Academic Standing</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 18,
                color: dashboard?.academic_standing === "Good Standing"
                  ? "#166534" : "#B91C1C",
              }}>
                {dashboard?.academic_standing}
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                {dashboard?.academic_standing === "Good Standing"
                  ? "No issues detected"
                  : "Action required"}
              </p>
            </div>
          </div>

          {/* Gap to Next Class */}
          <div style={{
            background: "#081C46",
            borderRadius: 16,
            padding: "24px 28px",
            boxShadow: "0 8px 32px rgba(8,28,70,0.25)",
            animation: "fadeUp 0.5s ease 0.3s forwards",
            opacity: 0,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 100, height: 100, borderRadius: "50%",
              background: "rgba(255,192,5,0.1)",
            }} />
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: "rgba(255,192,5,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              position: "relative",
              zIndex: 2,
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: 20,
                color: "#FFC005",
              }}>🎯</span>
            </div>
            <div style={{ position: "relative", zIndex: 2 }}>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Gap to Next Class</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: 32,
                color: "#FFC005",
                lineHeight: 1,
              }}>
                {risk?.risk_analysis?.gap_to_next_class != null
                  ? `+${risk.risk_analysis.gap_to_next_class}`
                  : "—"}
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                Needed for {risk?.risk_analysis?.next_class || "Top Class"}
              </p>
            </div>
          </div>

          {/* GPA Trend */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16,
            padding: "24px 28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            animation: "fadeUp 0.5s ease 0.4s forwards",
            opacity: 0,
            boxSizing: "border-box",
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: trendStyle.bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              flexShrink: 0,
            }}>
              {trends?.trend_analysis?.trend === "Improving" ? "📈"
                : trends?.trend_analysis?.trend === "Declining" ? "📉" : "➡️"}
            </div>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>GPA Trend</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 18,
                color: trendStyle.color,
              }}>
                {trends?.trend_analysis?.trend || "Insufficient Data"}
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
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
      <div style={{
        maxWidth: 1200,
        margin: "28px auto",
        padding: "0 32px 60px",
        boxSizing: "border-box",
      }}>

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 24,
          alignItems: "start",
        }}>

          {/* LEFT COLUMN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Risk Analysis */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
              animation: "fadeUp 0.5s ease 0.5s forwards",
              opacity: 0,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 16,
                  color: "#081C46",
                }}>
                  Academic Risk Analysis
                </h3>
                <span style={{
                  background: riskStyle.badge,
                  color: riskStyle.color,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 12,
                  padding: "5px 12px",
                  borderRadius: 999,
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
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}>
                  {risk.risk_analysis.alerts.map((alert, i) => (
                    <div key={i} style={{
                      background: "#FFFBEB",
                      borderLeft: "3px solid #FFC005",
                      padding: "12px 16px",
                      borderRadius: "0 10px 10px 0",
                      fontSize: 13, color: "#081C46",
                      fontWeight: 500,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                    }}>
                      <span>⚡</span>
                      {alert}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: "#F0FDF4",
                  borderLeft: "3px solid #22C55E",
                  padding: "12px 16px",
                  borderRadius: "0 10px 10px 0",
                  fontSize: 13, color: "#166534",
                  fontWeight: 500,
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <span>✅</span>
                  No active alerts — you're in good academic standing!
                </div>
              )}

              <Link to="/risk" style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                marginTop: 20,
                color: "#081C46",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700,
                fontSize: 13,
                textDecoration: "none",
                padding: "10px 18px",
                background: "#F5F7FF",
                borderRadius: 8,
                border: "1.5px solid #E5E7EB",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#081C46";
                  e.currentTarget.style.color = "#FFC005";
                  e.currentTarget.style.borderColor = "#081C46";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#F5F7FF";
                  e.currentTarget.style.color = "#081C46";
                  e.currentTarget.style.borderColor = "#E5E7EB";
                }}
              >
                View full risk report →
              </Link>
            </div>

            {/* Feature Cards */}
            <div>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46",
                marginBottom: 16,
              }}>
                Platform Features
              </h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 12,
              }}>
                {features.map((item, i) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      background: "#ffffff",
                      borderRadius: 14,
                      padding: "20px",
                      border: `1.5px solid ${item.border}`,
                      textDecoration: "none",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 14,
                      boxShadow: "0 2px 8px rgba(8,28,70,0.04)",
                      animation: `fadeUp 0.5s ease ${0.6 + i * 0.08}s forwards`,
                      opacity: 0,
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-3px)";
                      e.currentTarget.style.boxShadow = "0 12px 28px rgba(8,28,70,0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 2px 8px rgba(8,28,70,0.04)";
                    }}
                  >
                    <div style={{
                      width: 44, height: 44,
                      borderRadius: 12,
                      background: item.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                      flexShrink: 0,
                    }}>
                      {item.icon}
                    </div>
                    <div>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 14,
                        color: "#081C46", marginBottom: 4,
                      }}>
                        {item.label}
                      </p>
                      <p style={{
                        fontSize: 12,
                        color: "#9CA3AF",
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
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
            animation: "fadeUp 0.5s ease 0.5s forwards",
            opacity: 0,
            position: "sticky",
            top: 88,
          }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46",
              }}>
                GPA History
              </h3>
              <Link to="/gpa" style={{
                color: "#081C46",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 600,
                fontSize: 12,
                textDecoration: "none",
                opacity: 0.5,
              }}>
                See all →
              </Link>
            </div>

            {trends?.trend_analysis?.history?.length > 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
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
                      padding: "14px 16px",
                      background: "#F5F7FF",
                      borderRadius: 12,
                      animation: `fadeUp 0.4s ease ${0.6 + i * 0.1}s forwards`,
                      opacity: 0,
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}>
                        <p style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 13,
                          color: "#081C46",
                        }}>
                          Year {item.year} — Sem {item.semester}
                        </p>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800, fontSize: 15,
                          color: barColor,
                        }}>
                          {item.gpa.toFixed(2)}
                        </span>
                      </div>
                      {/* Progress bar */}
                      <div style={{
                        height: 6,
                        background: "#E5E7EB",
                        borderRadius: 999,
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${pct}%`,
                          background: barColor,
                          borderRadius: 999,
                          transition: "width 0.8s ease",
                        }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{
                textAlign: "center",
                padding: "40px 20px",
              }}>
                <p style={{ fontSize: 40, marginBottom: 12 }}>📊</p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, fontSize: 14,
                  color: "#081C46", marginBottom: 6,
                }}>No results yet</p>
                <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 20 }}>
                  Add your semester results to start tracking your GPA
                </p>
                <Link to="/results" style={{
                  background: "#081C46",
                  color: "#FFC005",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 13,
                  padding: "10px 20px",
                  borderRadius: 8,
                  textDecoration: "none",
                  display: "inline-block",
                }}>
                  Add Results →
                </Link>
              </div>
            )}

            {/* CGPA Progress bar */}
            {trends?.trend_analysis?.history?.length > 0 && (
              <div style={{
                marginTop: 20,
                padding: "16px",
                background: "#081C46",
                borderRadius: 12,
              }}>
                <div style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}>
                  <span style={{
                    fontSize: 11, fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    CGPA Progress
                  </span>
                  <span style={{
                    fontSize: 13, fontWeight: 800,
                    color: "#FFC005",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    {cgpa.toFixed(2)} / 4.00
                  </span>
                </div>
                <div style={{
                  height: 8,
                  background: "rgba(255,255,255,0.1)",
                  borderRadius: 999,
                  overflow: "hidden",
                }}>
                  <div style={{
                    height: "100%",
                    width: `${(cgpa / 4.0) * 100}%`,
                    background: "linear-gradient(90deg, #FFC005, #C8920A)",
                    borderRadius: 999,
                    transition: "width 1s ease",
                  }} />
                </div>
              </div>
            )}

          </div>

        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .dash-main { grid-template-columns: 1fr !important; }
          .dash-hero { grid-template-columns: 1fr !important; }
          .dash-stats { grid-template-columns: repeat(2, 1fr) !important; }
          .dash-features { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .dash-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}