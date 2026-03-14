import { useState, useEffect } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine, Area, AreaChart,
} from "recharts";
import { getCGPA, getGPAHistory, getTrends } from "../services/api";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const gpa = payload[0].value;
    const color = gpa >= 3.6 ? "#22C55E"
      : gpa >= 3.0 ? "#3B82F6"
      : gpa >= 2.5 ? "#F59E0B"
      : gpa >= 2.0 ? "#F97316"
      : "#EF4444";
    return (
      <div style={{
        background: "#081C46",
        border: "1px solid rgba(255,192,5,0.2)",
        borderRadius: 12,
        padding: "12px 16px",
        boxShadow: "0 8px 24px rgba(8,28,70,0.3)",
      }}>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 600, fontSize: 12,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 4,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          fontWeight: 800, fontSize: 22,
          color,
        }}>
          {gpa.toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export default function GPA() {
  const [cgpa, setCgpa] = useState(null);
  const [history, setHistory] = useState([]);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cgpaData, historyData, trendData] = await Promise.all([
          getCGPA(),
          getGPAHistory(),
          getTrends(),
        ]);
        setCgpa(cgpaData.cgpa);
        setHistory(historyData.gpa_history || []);
        setTrends(trendData.trend_analysis);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
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
        }}>Loading GPA data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const chartData = history.map((h) => ({
    name: `Y${h.year}S${h.semester}`,
    label: `Year ${h.year} — Sem ${h.semester}`,
    gpa: h.gpa,
  }));

  const getClassification = (gpa) => {
    if (gpa >= 3.6) return { label: "First Class", color: "#166534", bg: "#F0FDF4" };
    if (gpa >= 3.0) return { label: "Second Class Upper", color: "#1e40af", bg: "#EFF6FF" };
    if (gpa >= 2.5) return { label: "Second Class Lower", color: "#92400E", bg: "#FFFBEB" };
    if (gpa >= 2.0) return { label: "Third Class", color: "#9a3412", bg: "#FFF7ED" };
    if (gpa >= 1.0) return { label: "Pass", color: "#6B7280", bg: "#F9FAFB" };
    return { label: "Fail", color: "#B91C1C", bg: "#FEF2F2" };
  };

  const getTrendStyle = (trend) => {
    if (trend === "Improving") return { color: "#166534", icon: "📈", bg: "#F0FDF4", border: "#BBF7D0" };
    if (trend === "Declining") return { color: "#B91C1C", icon: "📉", bg: "#FEF2F2", border: "#FECACA" };
    return { color: "#92400E", icon: "➡️", bg: "#FFFBEB", border: "#FDE68A" };
  };

  const classification = getClassification(cgpa ?? 0);
  const trendStyle = getTrendStyle(trends?.trend);

  const gradeScale = [
    { grade: "A", range: "80–100", points: "4.0", color: "#166534", bg: "#DCFCE7" },
    { grade: "B+", range: "75–79", points: "3.5", color: "#1e40af", bg: "#DBEAFE" },
    { grade: "B", range: "70–74", points: "3.0", color: "#1e40af", bg: "#DBEAFE" },
    { grade: "B-", range: "65–69", points: "2.5", color: "#1e40af", bg: "#DBEAFE" },
    { grade: "C+", range: "60–64", points: "2.0", color: "#92400E", bg: "#FEF3C7" },
    { grade: "C", range: "55–59", points: "1.5", color: "#92400E", bg: "#FEF3C7" },
    { grade: "C-", range: "50–54", points: "1.0", color: "#9a3412", bg: "#FFEDD5" },
    { grade: "D", range: "45–49", points: "0.5", color: "#B91C1C", bg: "#FEE2E2" },
    { grade: "F", range: "0–44", points: "0.0", color: "#7F1D1D", bg: "#FEE2E2" },
  ];

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
          maxWidth: 1200, margin: "0 auto",
          position: "relative", zIndex: 10,
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 24,
          alignItems: "center",
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
              Academic Performance
            </p>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: "#ffffff", marginBottom: 4,
            }}>
              GPA Tracker
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: 13,
            }}>
              {history.length} semester{history.length !== 1 ? "s" : ""} of data
            </p>
          </div>

          {/* CGPA hero badge */}
          <div style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,192,5,0.2)",
            borderRadius: 20,
            padding: "24px 36px",
            textAlign: "center",
            animation: "fadeUp 0.5s ease 0.1s forwards",
            opacity: 0,
            backdropFilter: "blur(10px)",
          }}>
            <p style={{
              fontSize: 11, fontWeight: 700,
              color: "rgba(255,255,255,0.4)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              marginBottom: 6,
            }}>
              Cumulative GPA
            </p>
            <p style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 900, fontSize: 60,
              color: "#FFC005", lineHeight: 1,
              marginBottom: 8,
            }}>
              {cgpa?.toFixed(2) ?? "—"}
            </p>
            <span style={{
              background: classification.bg,
              color: classification.color,
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: 12,
              padding: "5px 14px",
              borderRadius: 999,
            }}>
              {classification.label}
            </span>
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
            TREND CARDS ROW
        ================================ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          marginBottom: 28,
        }}>

          {/* Trend */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "22px 24px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            animation: "fadeUp 0.5s ease 0.1s forwards",
            opacity: 0,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: trendStyle.bg,
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22,
              flexShrink: 0,
            }}>
              {trendStyle.icon}
            </div>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Current Trend</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 18,
                color: trendStyle.color,
              }}>
                {trends?.trend || "No Data"}
              </p>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                {trends?.message || "Add more semesters"}
              </p>
            </div>
          </div>

          {/* Latest GPA */}
          <div style={{
            background: "#081C46",
            borderRadius: 16, padding: "22px 24px",
            boxShadow: "0 8px 32px rgba(8,28,70,0.2)",
            animation: "fadeUp 0.5s ease 0.2s forwards",
            opacity: 0,
            display: "flex", alignItems: "center", gap: 16,
            position: "relative", overflow: "hidden",
          }}>
            <div style={{
              position: "absolute", top: -20, right: -20,
              width: 90, height: 90, borderRadius: "50%",
              background: "rgba(255,192,5,0.1)",
            }} />
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: "rgba(255,192,5,0.15)",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22,
              flexShrink: 0, position: "relative", zIndex: 2,
            }}>
              🏆
            </div>
            <div style={{ position: "relative", zIndex: 2 }}>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Latest Semester GPA</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 900, fontSize: 32,
                color: "#FFC005", lineHeight: 1,
              }}>
                {trends?.latest_gpa?.toFixed(2) ?? "—"}
              </p>
            </div>
          </div>

          {/* Previous GPA */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "22px 24px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            animation: "fadeUp 0.5s ease 0.3s forwards",
            opacity: 0,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <div style={{
              width: 48, height: 48,
              borderRadius: 12,
              background: "#F5F7FF",
              display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 22,
              flexShrink: 0,
            }}>
              📅
            </div>
            <div>
              <p style={{
                fontSize: 11, fontWeight: 700,
                color: "#9CA3AF",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                marginBottom: 4,
              }}>Previous Semester GPA</p>
              <p style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 800, fontSize: 28,
                color: "#081C46",
              }}>
                {trends?.previous_gpa?.toFixed(2) ?? "—"}
              </p>
            </div>
          </div>

        </div>

        {/* ================================
            CHART + HISTORY
        ================================ */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 24,
          marginBottom: 28,
        }}>

          {/* GPA Chart */}
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
            animation: "fadeUp 0.5s ease 0.3s forwards",
            opacity: 0,
          }}>
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46",
              }}>
                GPA Trend Chart
              </h3>
              <div style={{
                display: "flex", gap: 16,
                alignItems: "center",
              }}>
                {[
                  { label: "First Class", color: "#22C55E" },
                  { label: "2nd Upper", color: "#3B82F6" },
                  { label: "2nd Lower", color: "#F59E0B" },
                ].map((l) => (
                  <div key={l.label} style={{
                    display: "flex", alignItems: "center", gap: 5,
                  }}>
                    <div style={{
                      width: 8, height: 8,
                      borderRadius: "50%",
                      background: l.color,
                    }} />
                    <span style={{
                      fontSize: 11, color: "#9CA3AF",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 500,
                    }}>
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC005" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FFC005" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F5F7FF"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 12, fill: "#9CA3AF", fontWeight: 600,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 4]}
                    ticks={[0, 1, 2, 3, 4]}
                    tick={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontSize: 11, fill: "#9CA3AF",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* Classification reference lines */}
                  <ReferenceLine y={3.6} stroke="#22C55E"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "3.6", fill: "#22C55E", fontSize: 10, fontWeight: 700 }}
                  />
                  <ReferenceLine y={3.0} stroke="#3B82F6"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "3.0", fill: "#3B82F6", fontSize: 10, fontWeight: 700 }}
                  />
                  <ReferenceLine y={2.5} stroke="#F59E0B"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "2.5", fill: "#F59E0B", fontSize: 10, fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gpa"
                    stroke="#FFC005"
                    strokeWidth={3}
                    fill="url(#gpaGradient)"
                    dot={{
                      fill: "#081C46",
                      stroke: "#FFC005",
                      strokeWidth: 2,
                      r: 5,
                    }}
                    activeDot={{
                      fill: "#FFC005",
                      stroke: "#081C46",
                      strokeWidth: 2,
                      r: 7,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                height: 280,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}>
                <p style={{ fontSize: 40 }}>📊</p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, fontSize: 14,
                  color: "#081C46",
                }}>
                  Not enough data for chart
                </p>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                  At least 2 semesters needed to plot a trend
                </p>
              </div>
            )}
          </div>

          {/* GPA History list */}
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
              Semester Breakdown
            </h3>

            {history.length > 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                {history.map((item, i) => {
                  const cls = getClassification(item.gpa);
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
                      animation: `fadeUp 0.4s ease ${0.4 + i * 0.08}s forwards`,
                      opacity: 0,
                    }}>
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}>
                        <div>
                          <p style={{
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 700, fontSize: 13,
                            color: "#081C46",
                          }}>
                            Year {item.year} — Sem {item.semester}
                          </p>
                          <p style={{
                            fontSize: 11,
                            color: cls.color,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 600,
                            marginTop: 2,
                          }}>
                            {cls.label}
                          </p>
                        </div>
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 900, fontSize: 20,
                          color: barColor,
                        }}>
                          {item.gpa.toFixed(2)}
                        </span>
                      </div>
                      <div style={{
                        height: 6, background: "#E5E7EB",
                        borderRadius: 999, overflow: "hidden",
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
                textAlign: "center", padding: "40px 0",
              }}>
                <p style={{ fontSize: 36, marginBottom: 8 }}>📊</p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, fontSize: 14,
                  color: "#081C46", marginBottom: 4,
                }}>No GPA history yet</p>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                  Add semester results to start tracking
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ================================
            UPSA GRADING SCALE
        ================================ */}
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
            UPSA Official Grading Scale
          </h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: 8,
          }}>
            {gradeScale.map((g) => (
              <div key={g.grade} style={{
                textAlign: "center",
                padding: "16px 8px",
                background: g.bg,
                borderRadius: 12,
                transition: "transform 0.2s",
                cursor: "default",
              }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900, fontSize: 20,
                  color: g.color, marginBottom: 6,
                }}>
                  {g.grade}
                </p>
                <p style={{
                  fontSize: 10, color: g.color,
                  fontWeight: 700, marginBottom: 4,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  opacity: 0.8,
                }}>
                  {g.range}%
                </p>
                <p style={{
                  fontSize: 13,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800,
                  color: g.color,
                }}>
                  {g.points}
                </p>
              </div>
            ))}
          </div>

          {/* Classification bands */}
          <div style={{
            marginTop: 24,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }}>
            {[
              { label: "First Class", range: "3.6 – 4.0", color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" },
              { label: "2nd Class Upper", range: "3.0 – 3.59", color: "#1e40af", bg: "#EFF6FF", border: "#BFDBFE" },
              { label: "2nd Class Lower", range: "2.5 – 2.99", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" },
              { label: "Third Class", range: "2.0 – 2.49", color: "#9a3412", bg: "#FFF7ED", border: "#FED7AA" },
              { label: "Pass", range: "1.0 – 1.99", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" },
            ].map((band) => (
              <div key={band.label} style={{
                background: band.bg,
                border: `1.5px solid ${band.border}`,
                borderRadius: 10,
                padding: "12px 14px",
                textAlign: "center",
              }}>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 12,
                  color: band.color, marginBottom: 4,
                }}>
                  {band.label}
                </p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 800, fontSize: 14,
                  color: band.color,
                }}>
                  {band.range}
                </p>
              </div>
            ))}
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
          .gpa-chart-grid { grid-template-columns: 1fr !important; }
          .gpa-scale-grid { grid-template-columns: repeat(5, 1fr) !important; }
          .gpa-bands { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 640px) {
          .gpa-trend-cards { grid-template-columns: 1fr !important; }
          .gpa-scale-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .gpa-bands { grid-template-columns: 1fr 1fr !important; }
        }
      `}</style>

    </div>
  );
}