import { useState, useEffect } from "react";
import { getRisk } from "../services/api";
import { Link } from "react-router-dom";

export default function Risk() {
  const [risk, setRisk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRisk = async () => {
      try {
        const data = await getRisk();
        setRisk(data.risk_analysis);
      } catch (err) {
        setError("Failed to load risk analysis.");
      } finally {
        setLoading(false);
      }
    };
    fetchRisk();
  }, []);

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F7FF",
        display: "flex", alignItems: "center",
        justifyContent: "center", flexDirection: "column", gap: 16,
      }}>
        <div style={{
          width: 48, height: 48,
          border: "4px solid rgba(8,28,70,0.08)",
          borderTop: "4px solid #081C46",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, color: "#081C46", fontSize: 14,
        }}>Analyzing academic risk...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh", background: "#F5F7FF",
        display: "flex", alignItems: "center",
        justifyContent: "center", padding: 24,
      }}>
        <div style={{
          background: "#FEF2F2",
          borderLeft: "4px solid #EF4444",
          padding: "20px 28px",
          borderRadius: "0 16px 16px 0",
          color: "#B91C1C", fontWeight: 500, fontSize: 14,
        }}>
          {error}
        </div>
      </div>
    );
  }

  const getRiskConfig = (level) => {
    if (level === "High") return {
      color: "#B91C1C",
      bg: "#FEF2F2",
      border: "#FECACA",
      badge: "#FEE2E2",
      dot: "#EF4444",
      icon: "🚨",
      gradient: "linear-gradient(135deg, #B91C1C, #7F1D1D)",
      message: "Immediate action required. Your academic standing is at serious risk.",
    };
    if (level === "Medium") return {
      color: "#92400E",
      bg: "#FFFBEB",
      border: "#FDE68A",
      badge: "#FEF3C7",
      dot: "#F59E0B",
      icon: "⚠️",
      gradient: "linear-gradient(135deg, #92400E, #78350F)",
      message: "Your performance needs attention. Take action before it worsens.",
    };
    return {
      color: "#166534",
      bg: "#F0FDF4",
      border: "#BBF7D0",
      badge: "#DCFCE7",
      dot: "#22C55E",
      icon: "✅",
      gradient: "linear-gradient(135deg, #166534, #14532D)",
      message: "You are in good academic standing. Keep maintaining your performance.",
    };
  };

  const getClassification = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "#1e40af", bg: "#EFF6FF", border: "#BFDBFE" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "#9a3412", bg: "#FFF7ED", border: "#FED7AA" };
    if (cgpa >= 1.0) return { label: "Pass", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" };
    return { label: "Fail", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" };
  };

  const config = getRiskConfig(risk?.risk_level);
  const classification = getClassification(risk?.cgpa ?? 0);

  const classificationBands = [
    { label: "First Class", min: 3.6, max: 4.0, color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
    { label: "2nd Class Upper", min: 3.0, max: 3.59, color: "#1e40af", bg: "#EFF6FF", border: "#BFDBFE" },
    { label: "2nd Class Lower", min: 2.5, max: 2.99, color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
    { label: "Third Class", min: 2.0, max: 2.49, color: "#9a3412", bg: "#FFF7ED", border: "#FED7AA" },
    { label: "Pass", min: 1.0, max: 1.99, color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
    { label: "Fail", min: 0, max: 0.99, color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" },
  ];

  const recommendations = {
    High: [
      "Visit the academic affairs office immediately",
      "Speak with your academic advisor or lecturer",
      "Create a structured daily study plan",
      "Identify and retake any failed courses",
      "Reduce extracurricular commitments temporarily",
      "Form or join a serious study group",
    ],
    Medium: [
      "Review your weakest courses this week",
      "Set a minimum target GPA for next semester",
      "Use the GPA Simulator to plan your recovery",
      "Attend all lectures and tutorials consistently",
      "Seek extra help from lecturers during office hours",
    ],
    Low: [
      "Maintain your current study habits",
      "Use the simulator to plan for First Class",
      "Keep tracking your GPA every semester",
      "Stay consistent — don't relax too much",
      "Help peers who may be struggling",
    ],
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#F5F7FF",
      fontFamily: "'Inter', sans-serif",
    }}>

      {/* ================================
          HEADER
      ================================ */}
      <div style={{
        background: "linear-gradient(135deg, #081C46 0%, #1a3a7a 100%)",
        padding: "40px 32px 80px",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -60, right: -60,
          width: 220, height: 220, borderRadius: "50%",
          background: "rgba(255,192,5,0.06)",
        }} />
        <div style={{
          position: "absolute", bottom: -40, left: "30%",
          width: 160, height: 160, borderRadius: "50%",
          background: "rgba(255,192,5,0.04)",
        }} />
        <div style={{
          maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}>
          <div style={{ animation: "fadeUp 0.5s ease forwards", opacity: 0 }}>
            <p style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: 12, fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}>
              Academic Intelligence
            </p>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: "#ffffff", marginBottom: 8,
            }}>
              Risk Analysis
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14, maxWidth: 400, lineHeight: 1.6,
            }}>
              A full breakdown of your academic risk level,
              classification gap, and recommended actions.
            </p>
          </div>

          {/* Risk level badge in header */}
          <div style={{
            background: config.bg,
            border: `2px solid ${config.border}`,
            borderRadius: 16,
            padding: "20px 28px",
            textAlign: "center",
            animation: "fadeUp 0.5s ease 0.1s forwards",
            opacity: 0,
          }}>
            <p style={{ fontSize: 32, marginBottom: 6 }}>{config.icon}</p>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: 22,
              color: config.color,
            }}>
              {risk?.risk_level} Risk
            </p>
            <p style={{
              fontSize: 11, color: config.color,
              opacity: 0.7,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 600,
              marginTop: 2,
            }}>
              Current Status
            </p>
          </div>
        </div>
      </div>

      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 32px 60px",
        marginTop: -44,
        position: "relative",
        zIndex: 20,
        boxSizing: "border-box",
      }}>

        {/* ================================
            TOP STAT CARDS
        ================================ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}>

          {/* CGPA card */}
          <div style={{
            background: "#081C46",
            borderRadius: 16, padding: "24px 28px",
            boxShadow: "0 8px 32px rgba(8,28,70,0.25)",
            animation: "fadeUp 0.5s ease 0.1s forwards",
            opacity: 0,
            display: "flex", alignItems: "center", gap: 20,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 90, height: 90, borderRadius: "50%",
              background: "rgba(255,192,5,0.1)",
            }} />
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: "rgba(255,192,5,0.15)",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              flexShrink: 0, position: "relative", zIndex: 2,
              fontSize: 24,
            }}>
              📊
            </div>
            <div style={{ position: "relative", zIndex: 2 }}>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Current CGPA</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: 36,
                color: "#FFC005", lineHeight: 1,
              }}>
                {risk?.cgpa?.toFixed(2)}
              </p>
              <p style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.4)",
                marginTop: 4,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                {classification.label}
              </p>
            </div>
          </div>

          {/* Gap card */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "24px 28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            animation: "fadeUp 0.5s ease 0.2s forwards",
            opacity: 0,
            display: "flex", alignItems: "center", gap: 20,
          }}>
            <div style={{
              width: 52, height: 52,
              borderRadius: 14,
              background: "#FFF7ED",
              display: "flex", alignItems: "center",
              justifyContent: "center",
              flexShrink: 0, fontSize: 24,
            }}>
              🎯
            </div>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Gap to Next Class</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: 32,
                color: "#C8920A", lineHeight: 1,
              }}>
                {risk?.gap_to_next_class != null
                  ? `+${risk.gap_to_next_class}` : "—"}
              </p>
              <p style={{
                fontSize: 12, color: "#9CA3AF",
                marginTop: 4,
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                To reach {risk?.next_class || "Top Class"}
              </p>
            </div>
          </div>

          {/* CGPA progress card */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "24px 28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            animation: "fadeUp 0.5s ease 0.3s forwards",
            opacity: 0,
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              color: "#9CA3AF",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 16,
            }}>CGPA Progress to 4.0</p>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: 8,
            }}>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 13,
                color: "#081C46",
              }}>
                {risk?.cgpa?.toFixed(2)}
              </span>
              <span style={{
                fontSize: 12, color: "#9CA3AF",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                4.00
              </span>
            </div>
            <div style={{
              height: 10,
              background: "#F5F7FF",
              borderRadius: 999,
              overflow: "hidden",
              marginBottom: 12,
            }}>
              <div style={{
                height: "100%",
                width: `${((risk?.cgpa ?? 0) / 4.0) * 100}%`,
                background: "linear-gradient(90deg, #FFC005, #C8920A)",
                borderRadius: 999,
                transition: "width 1s ease",
              }} />
            </div>
            {/* Classification markers */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
            }}>
              {["1.0", "2.0", "2.5", "3.0", "3.6"].map((mark) => (
                <span key={mark} style={{
                  fontSize: 9,
                  color: "#D1D5DB",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600,
                }}>
                  {mark}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* ================================
            MAIN CONTENT
        ================================ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 24,
          alignItems: "start",
        }}>

          {/* LEFT — Alerts + Recommendations */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>

            {/* Risk summary */}
            <div style={{
              background: config.bg,
              borderRadius: 16,
              padding: "24px 28px",
              border: `1.5px solid ${config.border}`,
              animation: "fadeUp 0.5s ease 0.3s forwards",
              opacity: 0,
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>
                {config.icon}
              </span>
              <div>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 16,
                  color: config.color, marginBottom: 6,
                }}>
                  {risk?.risk_level} Risk Level
                </h3>
                <p style={{
                  fontSize: 14, color: config.color,
                  opacity: 0.8, lineHeight: 1.6,
                  fontWeight: 500,
                }}>
                  {config.message}
                </p>
              </div>
            </div>

            {/* Active alerts */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
              animation: "fadeUp 0.5s ease 0.4s forwards",
              opacity: 0,
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46", marginBottom: 20,
              }}>
                Active Alerts
              </h3>

              {risk?.alerts?.length > 0 ? (
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}>
                  {risk.alerts.map((alert, i) => (
                    <div key={i} style={{
                      background: "#FFFBEB",
                      borderLeft: "4px solid #FFC005",
                      padding: "14px 18px",
                      borderRadius: "0 12px 12px 0",
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      animation: `fadeUp 0.4s ease ${0.4 + i * 0.08}s forwards`,
                      opacity: 0,
                    }}>
                      <span style={{
                        fontSize: 16, flexShrink: 0, marginTop: 1,
                      }}>⚡</span>
                      <p style={{
                        fontSize: 14, color: "#081C46",
                        fontWeight: 500, lineHeight: 1.5,
                      }}>
                        {alert}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  background: "#F0FDF4",
                  borderLeft: "4px solid #22C55E",
                  padding: "14px 18px",
                  borderRadius: "0 12px 12px 0",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}>
                  <span style={{ fontSize: 18 }}>✅</span>
                  <p style={{
                    fontSize: 14, color: "#166534",
                    fontWeight: 500,
                  }}>
                    No active alerts — your academic performance is on track!
                  </p>
                </div>
              )}
            </div>

            {/* Recommendations */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
              animation: "fadeUp 0.5s ease 0.5s forwards",
              opacity: 0,
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46", marginBottom: 20,
              }}>
                Recommended Actions
              </h3>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {recommendations[risk?.risk_level || "Low"].map((rec, i) => (
                  <div key={i} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 12,
                    padding: "12px 16px",
                    background: "#F5F7FF",
                    borderRadius: 10,
                    animation: `fadeUp 0.4s ease ${0.5 + i * 0.06}s forwards`,
                    opacity: 0,
                  }}>
                    <div style={{
                      width: 24, height: 24,
                      background: "#081C46",
                      borderRadius: 6,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}>
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 900, fontSize: 10,
                        color: "#FFC005",
                      }}>
                        {i + 1}
                      </span>
                    </div>
                    <p style={{
                      fontSize: 13, color: "#374151",
                      fontWeight: 500, lineHeight: 1.5,
                    }}>
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — Classification ladder */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>

            {/* Classification ladder */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
              animation: "fadeUp 0.5s ease 0.4s forwards",
              opacity: 0,
              position: "sticky",
              top: 88,
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46", marginBottom: 20,
              }}>
                Classification Ladder
              </h3>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}>
                {classificationBands.map((band, i) => {
                  const isCurrent = risk?.cgpa >= band.min &&
                    risk?.cgpa < (band.max + 0.01);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 16px",
                        background: isCurrent ? band.bg : "#F5F7FF",
                        border: isCurrent
                          ? `2px solid ${band.border}`
                          : "1.5px solid transparent",
                        borderRadius: 12,
                        transition: "all 0.2s",
                        position: "relative",
                      }}
                    >
                      {/* Current indicator */}
                      {isCurrent && (
                        <div style={{
                          position: "absolute",
                          left: -4,
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: 8, height: 8,
                          borderRadius: "50%",
                          background: band.color,
                          boxShadow: `0 0 0 3px ${band.bg}`,
                        }} />
                      )}

                      <div style={{
                        width: 36, height: 36,
                        borderRadius: 10,
                        background: isCurrent ? band.bg : "#EEEFF3",
                        border: isCurrent
                          ? `1.5px solid ${band.border}` : "none",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}>
                        <span style={{
                          fontSize: isCurrent ? 16 : 12,
                        }}>
                          {i === 0 ? "🥇"
                            : i === 1 ? "🥈"
                            : i === 2 ? "🥉"
                            : i === 3 ? "📘"
                            : i === 4 ? "📗"
                            : "❌"}
                        </span>
                      </div>

                      <div style={{ flex: 1 }}>
                        <p style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: isCurrent ? 800 : 600,
                          fontSize: 13,
                          color: isCurrent ? band.color : "#374151",
                        }}>
                          {band.label}
                          {isCurrent && (
                            <span style={{
                              marginLeft: 8,
                              fontSize: 10,
                              background: band.color,
                              color: "#ffffff",
                              padding: "2px 7px",
                              borderRadius: 999,
                              fontWeight: 700,
                              verticalAlign: "middle",
                            }}>
                              YOU
                            </span>
                          )}
                        </p>
                        <p style={{
                          fontSize: 11,
                          color: isCurrent ? band.color : "#9CA3AF",
                          opacity: isCurrent ? 0.8 : 1,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600, marginTop: 2,
                        }}>
                          {band.min.toFixed(1)} – {band.max.toFixed(2)}
                        </p>
                      </div>

                      {/* Gap indicator for next class */}
                      {isCurrent && risk?.gap_to_next_class != null
                        && i > 0 && (
                        <div style={{
                          background: "#081C46",
                          color: "#FFC005",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800, fontSize: 11,
                          padding: "4px 10px",
                          borderRadius: 999,
                          whiteSpace: "nowrap",
                        }}>
                          +{risk.gap_to_next_class}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Action buttons */}
              <div style={{
                marginTop: 20,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                <Link to="/simulator" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px",
                  background: "#081C46",
                  color: "#FFC005",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 14,
                  borderRadius: 10,
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#1a3a7a";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#081C46";
                  }}
                >
                  🎯 Calculate Target Grade
                </Link>

                <Link to="/gpa" style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  padding: "13px",
                  background: "#F5F7FF",
                  color: "#081C46",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 14,
                  borderRadius: 10,
                  textDecoration: "none",
                  border: "1.5px solid #E5E7EB",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#E5E7EB";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#F5F7FF";
                  }}
                >
                  📊 View GPA History
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .risk-main { grid-template-columns: 1fr !important; }
          .risk-stats { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .risk-stats { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}