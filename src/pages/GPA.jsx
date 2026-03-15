import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
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
        background: "var(--navy)",
        border: "1px solid rgba(255,192,5,0.2)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        boxShadow: "var(--shadow-navy)",
      }}>
        <p style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 600, fontSize: 11,
          color: "rgba(255,255,255,0.5)",
          marginBottom: 4,
        }}>
          {label}
        </p>
        <p style={{
          fontFamily: "var(--font-heading)",
          fontWeight: 900, fontSize: 22,
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
          getCGPA(), getGPAHistory(), getTrends(),
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

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading GPA data...</p>
    </div>
  );

  const getClassStyle = (gpa) => {
    if (gpa >= 3.6) return { label: "First Class", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" };
    if (gpa >= 3.0) return { label: "Second Class Upper", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" };
    if (gpa >= 2.5) return { label: "Second Class Lower", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" };
    if (gpa >= 2.0) return { label: "Third Class", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" };
    if (gpa >= 1.0) return { label: "Pass", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" };
    return { label: "Fail", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" };
  };

  const getTrendStyle = (trend) => {
    if (trend === "Improving") return { color: "var(--green)", icon: "📈", bg: "var(--green-bg)", border: "var(--green-border)" };
    if (trend === "Declining") return { color: "var(--red)", icon: "📉", bg: "var(--red-bg)", border: "var(--red-border)" };
    return { color: "var(--amber)", icon: "➡️", bg: "var(--amber-bg)", border: "var(--amber-border)" };
  };

  const getBarColor = (gpa) => {
    if (gpa >= 3.6) return "#22C55E";
    if (gpa >= 3.0) return "#3B82F6";
    if (gpa >= 2.5) return "#F59E0B";
    if (gpa >= 2.0) return "#F97316";
    return "#EF4444";
  };

  const classStyle = getClassStyle(cgpa ?? 0);
  const trendStyle = getTrendStyle(trends?.trend);

  // Auto-scale Y axis based on data
  const gpas = history.map((h) => h.gpa);
  const minGpa = gpas.length > 0 ? Math.max(0, Math.floor(Math.min(...gpas) - 0.5)) : 0;
  const maxGpa = 4;

  const chartData = history.map((h) => ({
    name: `Y${h.year}S${h.semester}`,
    label: `Year ${h.year} — Sem ${h.semester}`,
    gpa: h.gpa,
  }));

  const gradeScale = [
    { grade: "A", range: "80–100%", points: "4.0", color: "var(--green)", bg: "var(--green-bg)" },
    { grade: "B+", range: "75–79%", points: "3.5", color: "var(--blue)", bg: "var(--blue-bg)" },
    { grade: "B", range: "70–74%", points: "3.0", color: "var(--blue)", bg: "var(--blue-bg)" },
    { grade: "B-", range: "65–69%", points: "2.5", color: "var(--blue)", bg: "var(--blue-bg)" },
    { grade: "C+", range: "60–64%", points: "2.0", color: "var(--amber)", bg: "var(--amber-bg)" },
    { grade: "C", range: "55–59%", points: "1.5", color: "var(--amber)", bg: "var(--amber-bg)" },
    { grade: "C-", range: "50–54%", points: "1.0", color: "var(--orange)", bg: "var(--orange-bg)" },
    { grade: "D", range: "45–49%", points: "0.5", color: "var(--red)", bg: "var(--red-bg)" },
    { grade: "F", range: "0–44%", points: "0.0", color: "var(--red)", bg: "var(--red-bg)" },
  ];

  const classBands = [
    { label: "First Class", range: "3.6 – 4.0", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" },
    { label: "2nd Class Upper", range: "3.0 – 3.59", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
    { label: "2nd Class Lower", range: "2.5 – 2.99", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" },
    { label: "Third Class", range: "2.0 – 2.49", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" },
    { label: "Pass", range: "1.0 – 1.99", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" },
  ];

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-page)",
      fontFamily: "var(--font-body)",
    }}>

      {/* ================================
          HEADER
      ================================ */}
      <div className="page-header">
        <div className="header-inner">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: 24,
            alignItems: "center",
          }} className="gpa-hero">

            <div className="fade-up">
              <p className="page-eyebrow">Academic Performance</p>
              <h1 className="page-title">GPA Tracker</h1>
              <p style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: 13,
              }}>
                {history.length} semester{history.length !== 1 ? "s" : ""} of data
              </p>
            </div>

            {/* CGPA badge */}
            <div className="fade-up-1 gpa-badge" style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,192,5,0.2)",
              borderRadius: "var(--radius-xl)",
              padding: "24px 36px",
              textAlign: "center",
              backdropFilter: "blur(10px)",
            }}>
              <p style={{
                fontSize: 10, fontWeight: 700,
                color: "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                fontFamily: "var(--font-heading)",
                marginBottom: 6,
              }}>
                Cumulative GPA
              </p>
              <p style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 900,
                fontSize: "clamp(44px, 5vw, 60px)",
                color: "var(--gold)",
                lineHeight: 1,
                marginBottom: 8,
              }}>
                {cgpa?.toFixed(2) ?? "—"}
              </p>
              <span style={{
                background: classStyle.bg,
                color: classStyle.color,
                border: `1px solid ${classStyle.border}`,
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 11,
                padding: "4px 12px",
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

          {/* Trend */}
          <div className="stat-card card fade-up-1">
            <div className="stat-icon" style={{ background: trendStyle.bg }}>
              {trendStyle.icon}
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                Current Trend
              </p>
              <p className="stat-value" style={{
                fontSize: 18, color: trendStyle.color,
              }}>
                {trends?.trend || "No Data"}
              </p>
              <p className="stat-sub" style={{ color: "var(--text-muted)" }}>
                {trends?.message || "Add more semesters"}
              </p>
            </div>
          </div>

          {/* Latest GPA */}
          <div className="card-dark stat-card fade-up-2" style={{
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-navy)",
          }}>
            <div className="stat-icon" style={{
              background: "rgba(255,192,5,0.15)",
            }}>
              🏆
            </div>
            <div>
              <p className="stat-label" style={{ color: "rgba(255,255,255,0.4)" }}>
                Latest Semester GPA
              </p>
              <p className="stat-value" style={{
                fontSize: 32, color: "var(--gold)",
              }}>
                {trends?.latest_gpa?.toFixed(2) ?? "—"}
              </p>
            </div>
          </div>

          {/* Previous GPA */}
          <div className="stat-card card fade-up-3">
            <div className="stat-icon" style={{ background: "var(--bg-page)" }}>
              📅
            </div>
            <div>
              <p className="stat-label" style={{ color: "var(--text-muted)" }}>
                Previous Semester GPA
              </p>
              <p className="stat-value" style={{
                fontSize: 28, color: "var(--navy)",
              }}>
                {trends?.previous_gpa?.toFixed(2) ?? "—"}
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ================================
          CHART + BREAKDOWN
      ================================ */}
      <div className="page-content" style={{ marginTop: 28 }}>

        <div className="grid-main" style={{ marginBottom: 28 }}>

          {/* Chart */}
          <div className="card fade-up-4">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 24,
              flexWrap: "wrap",
              gap: 12,
            }}>
              <h3 className="section-title" style={{ marginBottom: 0 }}>
                GPA Trend Chart
              </h3>
              <div style={{
                display: "flex", gap: 14, alignItems: "center",
                flexWrap: "wrap",
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
                      fontSize: 11, color: "var(--text-muted)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 500,
                    }}>
                      {l.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {chartData.length >= 2 ? (
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="gpaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FFC005" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#FFC005" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#F0F4FF"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 12,
                      fill: "#9CA3AF",
                      fontWeight: 600,
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[minGpa, maxGpa]}
                    ticks={[1, 2, 2.5, 3, 3.6, 4].filter((t) => t >= minGpa)}
                    tick={{
                      fontFamily: "var(--font-heading)",
                      fontSize: 11,
                      fill: "#9CA3AF",
                    }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <ReferenceLine
                    y={3.6} stroke="#22C55E"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "3.6", fill: "#22C55E", fontSize: 10, fontWeight: 700 }}
                  />
                  <ReferenceLine
                    y={3.0} stroke="#3B82F6"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "3.0", fill: "#3B82F6", fontSize: 10, fontWeight: 700 }}
                  />
                  <ReferenceLine
                    y={2.5} stroke="#F59E0B"
                    strokeDasharray="4 4" strokeWidth={1.5}
                    label={{ value: "2.5", fill: "#F59E0B", fontSize: 10, fontWeight: 700 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="gpa"
                    stroke="#FFC005"
                    strokeWidth={3}
                    fill="url(#gpaGrad)"
                    dot={{
                      fill: "var(--navy)",
                      stroke: "#FFC005",
                      strokeWidth: 2,
                      r: 5,
                    }}
                    activeDot={{
                      fill: "#FFC005",
                      stroke: "var(--navy)",
                      strokeWidth: 2,
                      r: 7,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div style={{
                height: 260,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
              }}>
                <p style={{ fontSize: 40 }}>📊</p>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600, fontSize: 14,
                  color: "var(--navy)",
                }}>
                  Not enough data for chart
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  At least 2 semesters needed to plot a trend
                </p>
              </div>
            )}
          </div>

          {/* Semester Breakdown */}
          <div className="card fade-up-4">
            <h3 className="section-title">Semester Breakdown</h3>

            {history.length > 0 ? (
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}>
                {history.map((item, i) => {
                  const cls = getClassStyle(item.gpa);
                  const barColor = getBarColor(item.gpa);
                  const pct = (item.gpa / 4.0) * 100;
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "14px 16px",
                        background: "var(--bg-page)",
                        borderRadius: "var(--radius-md)",
                      }}
                    >
                      <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 8,
                      }}>
                        <div>
                          <p style={{
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700, fontSize: 13,
                            color: "var(--navy)",
                          }}>
                            Year {item.year} — Sem {item.semester}
                          </p>
                          <p style={{
                            fontSize: 11,
                            color: cls.color,
                            fontFamily: "var(--font-heading)",
                            fontWeight: 600,
                            marginTop: 2,
                          }}>
                            {cls.label}
                          </p>
                        </div>
                        <span style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900, fontSize: 20,
                          color: barColor,
                        }}>
                          {item.gpa.toFixed(2)}
                        </span>
                      </div>
                      <div className="progress-track">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            background: barColor,
                          }}
                        />
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
                  fontFamily: "var(--font-heading)",
                  fontWeight: 600, fontSize: 14,
                  color: "var(--navy)", marginBottom: 4,
                }}>
                  No GPA history yet
                </p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Add semester results to start tracking
                </p>
              </div>
            )}
          </div>

        </div>

        {/* ================================
            GRADING SCALE
        ================================ */}
        <div className="card fade-up-5">
          <h3 className="section-title">UPSA Official Grading Scale</h3>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(9, 1fr)",
            gap: 8,
            marginBottom: 20,
          }} className="grade-scale-grid">
            {gradeScale.map((g) => (
              <div
                key={g.grade}
                style={{
                  textAlign: "center",
                  padding: "14px 8px",
                  background: g.bg,
                  borderRadius: "var(--radius-md)",
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
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900, fontSize: 18,
                  color: g.color, marginBottom: 4,
                }}>
                  {g.grade}
                </p>
                <p style={{
                  fontSize: 9, color: g.color,
                  fontWeight: 700, marginBottom: 3,
                  fontFamily: "var(--font-heading)",
                  opacity: 0.8,
                }}>
                  {g.range}
                </p>
                <p style={{
                  fontSize: 12,
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800, color: g.color,
                }}>
                  {g.points}
                </p>
              </div>
            ))}
          </div>

          {/* Classification bands */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 10,
          }} className="bands-grid">
            {classBands.map((band) => (
              <div key={band.label} style={{
                background: band.bg,
                border: `1.5px solid ${band.border}`,
                borderRadius: "var(--radius-sm)",
                padding: "12px 10px",
                textAlign: "center",
              }}>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700, fontSize: 11,
                  color: band.color, marginBottom: 4,
                }}>
                  {band.label}
                </p>
                <p style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800, fontSize: 13,
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
        @media (max-width: 768px) {
          .gpa-hero { grid-template-columns: 1fr !important; }
          .gpa-badge { display: none !important; }
          .grade-scale-grid { grid-template-columns: repeat(5, 1fr) !important; }
          .bands-grid { grid-template-columns: repeat(3, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .grade-scale-grid { grid-template-columns: repeat(3, 1fr) !important; }
          .bands-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
      `}</style>

    </div>
  );
}