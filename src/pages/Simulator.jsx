import { useState } from "react";
import { simulateCGPA, getTargetGrade } from "../services/api";

const GRADE_OPTIONS = [
  { label: "A — 4.0", value: 4.0 },
  { label: "B+ — 3.5", value: 3.5 },
  { label: "B — 3.0", value: 3.0 },
  { label: "B- — 2.5", value: 2.5 },
  { label: "C+ — 2.0", value: 2.0 },
  { label: "C — 1.5", value: 1.5 },
  { label: "C- — 1.0", value: 1.0 },
  { label: "D — 0.5", value: 0.5 },
  { label: "F — 0.0", value: 0.0 },
];

export default function Simulator() {
  // Simulation state
  const [courses, setCourses] = useState([
    { credit_hours: 3, grade_point: 4.0 },
  ]);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState("");

  // Target calculator state
  const [targetCgpa, setTargetCgpa] = useState("");
  const [remainingCredits, setRemainingCredits] = useState("");
  const [targetResult, setTargetResult] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState("");

  // ================================
  // SIMULATION HANDLERS
  // ================================

  const addCourse = () => {
    setCourses([...courses, { credit_hours: 3, grade_point: 4.0 }]);
  };

  const removeCourse = (index) => {
    if (courses.length === 1) return;
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (index, field, value) => {
    const updated = [...courses];
    updated[index][field] = Number(value);
    setCourses(updated);
  };

  const handleSimulate = async () => {
    setSimLoading(true);
    setSimError("");
    setSimResult(null);
    try {
      const data = await simulateCGPA(courses);
      setSimResult(data);
    } catch (err) {
      setSimError(
        err.response?.data?.detail || "Simulation failed. Try again."
      );
    } finally {
      setSimLoading(false);
    }
  };

  // ================================
  // TARGET HANDLERS
  // ================================

  const handleTargetCalculate = async () => {
    if (!targetCgpa || !remainingCredits) {
      setTargetError("Please fill in both fields.");
      return;
    }
    setTargetLoading(true);
    setTargetError("");
    setTargetResult(null);
    try {
      const data = await getTargetGrade(
        Number(targetCgpa),
        Number(remainingCredits)
      );
      setTargetResult(data);
    } catch (err) {
      setTargetError(
        err.response?.data?.detail || "Calculation failed. Try again."
      );
    } finally {
      setTargetLoading(false);
    }
  };

  const getClassification = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "#166534", bg: "#F0FDF4", border: "#BBF7D0" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "#1e40af", bg: "#EFF6FF", border: "#BFDBFE" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "#92400E", bg: "#FFFBEB", border: "#FDE68A" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "#9a3412", bg: "#FFF7ED", border: "#FED7AA" };
    if (cgpa >= 1.0) return { label: "Pass", color: "#6B7280", bg: "#F9FAFB", border: "#E5E7EB" };
    return { label: "Fail", color: "#B91C1C", bg: "#FEF2F2", border: "#FECACA" };
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #E5E7EB",
    borderRadius: 10,
    fontSize: 14,
    fontFamily: "'Inter', sans-serif",
    color: "#081C46",
    background: "#ffffff",
    outline: "none",
    boxSizing: "border-box",
  };

  const labelStyle = {
    display: "block",
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: 600, fontSize: 12,
    color: "#081C46", marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
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
              Academic Planning
            </p>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: "#ffffff", marginBottom: 8,
            }}>
              GPA Simulator
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14, maxWidth: 480, lineHeight: 1.6,
            }}>
              Simulate your future CGPA with hypothetical courses,
              or calculate the exact grade you need to reach your target.
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

        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 24,
        }}>

          {/* ================================
              LEFT — CGPA SIMULATOR
          ================================ */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>

            {/* Simulator card */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
              animation: "fadeUp 0.5s ease 0.1s forwards",
              opacity: 0,
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 24,
              }}>
                <div>
                  <h2 style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: 18,
                    color: "#081C46", marginBottom: 4,
                  }}>
                    🔮 CGPA Simulator
                  </h2>
                  <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                    Add hypothetical courses to see your projected CGPA
                  </p>
                </div>
                <button
                  onClick={addCourse}
                  style={{
                    background: "#F5F7FF",
                    color: "#081C46",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: 13,
                    padding: "9px 16px",
                    borderRadius: 9,
                    border: "1.5px solid #E5E7EB",
                    cursor: "pointer",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
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
                  + Add Course
                </button>
              </div>

              {/* Course rows */}
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                marginBottom: 24,
              }}>
                {courses.map((course, i) => (
                  <div
                    key={i}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: 12,
                      padding: "16px",
                      background: "#F5F7FF",
                      borderRadius: 12,
                      border: "1.5px solid #E5E7EB",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label style={labelStyle}>Credit Hours</label>
                      <select
                        value={course.credit_hours}
                        onChange={(e) =>
                          updateCourse(i, "credit_hours", e.target.value)
                        }
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "#081C46"}
                        onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                      >
                        {[1, 2, 3, 4, 5, 6].map((c) => (
                          <option key={c} value={c}>
                            {c} Credit{c !== 1 ? "s" : ""}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label style={labelStyle}>Expected Grade</label>
                      <select
                        value={course.grade_point}
                        onChange={(e) =>
                          updateCourse(i, "grade_point", e.target.value)
                        }
                        style={inputStyle}
                        onFocus={(e) => e.target.style.borderColor = "#081C46"}
                        onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      onClick={() => removeCourse(i)}
                      disabled={courses.length === 1}
                      style={{
                        width: 36, height: 36,
                        background: courses.length === 1
                          ? "#F5F7FF" : "#FEF2F2",
                        color: courses.length === 1 ? "#D1D5DB" : "#B91C1C",
                        border: `1px solid ${courses.length === 1 ? "#E5E7EB" : "#FECACA"}`,
                        borderRadius: 8,
                        cursor: courses.length === 1
                          ? "not-allowed" : "pointer",
                        fontSize: 16,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.2s",
                        marginBottom: 2,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Summary row */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 16px",
                background: "#F5F7FF",
                borderRadius: 10,
                marginBottom: 20,
                border: "1px solid #E5E7EB",
              }}>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 600, fontSize: 13,
                  color: "#6B7280",
                }}>
                  {courses.length} course{courses.length !== 1 ? "s" : ""} ·{" "}
                  {courses.reduce((s, c) => s + c.credit_hours, 0)} total credits
                </span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 13,
                  color: "#081C46",
                }}>
                  Avg grade point:{" "}
                  {(
                    courses.reduce((s, c) => s + c.grade_point, 0) /
                    courses.length
                  ).toFixed(2)}
                </span>
              </div>

              {simError && (
                <div style={{
                  background: "#FEF2F2",
                  borderLeft: "3px solid #EF4444",
                  padding: "10px 14px",
                  borderRadius: "0 8px 8px 0",
                  fontSize: 13, color: "#B91C1C",
                  fontWeight: 500, marginBottom: 16,
                }}>
                  {simError}
                </div>
              )}

              <button
                onClick={handleSimulate}
                disabled={simLoading}
                style={{
                  width: "100%",
                  padding: "14px",
                  background: "#081C46",
                  color: "#FFC005",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 15,
                  borderRadius: 10,
                  border: "none",
                  cursor: simLoading ? "not-allowed" : "pointer",
                  opacity: simLoading ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!simLoading) e.currentTarget.style.background = "#1a3a7a";
                }}
                onMouseLeave={(e) => {
                  if (!simLoading) e.currentTarget.style.background = "#081C46";
                }}
              >
                {simLoading ? (
                  <>
                    <span style={{
                      width: 16, height: 16,
                      border: "2px solid rgba(255,192,5,0.3)",
                      borderTop: "2px solid #FFC005",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Simulating...
                  </>
                ) : "Run Simulation →"}
              </button>
            </div>

            {/* Simulation result */}
            {simResult && (
              <div style={{
                background: "#081C46",
                borderRadius: 16, padding: "28px",
                boxShadow: "0 8px 32px rgba(8,28,70,0.25)",
                animation: "fadeUp 0.4s ease forwards",
                position: "relative",
                overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", top: -30, right: -30,
                  width: 120, height: 120, borderRadius: "50%",
                  background: "rgba(255,192,5,0.08)",
                }} />
                <p style={{
                  fontSize: 11, fontWeight: 700,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  marginBottom: 8,
                }}>
                  Projected CGPA
                </p>
                <p style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 900, fontSize: 64,
                  color: "#FFC005", lineHeight: 1,
                  marginBottom: 12,
                }}>
                  {simResult.projected_cgpa?.toFixed(2)}
                </p>

                {(() => {
                  const cls = getClassification(simResult.projected_cgpa);
                  return (
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      background: cls.bg,
                      border: `1px solid ${cls.border}`,
                      borderRadius: 999,
                      padding: "7px 16px",
                      marginBottom: 16,
                    }}>
                      <span style={{
                        width: 7, height: 7,
                        borderRadius: "50%",
                        background: cls.color,
                      }} />
                      <span style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 13,
                        color: cls.color,
                      }}>
                        {cls.label}
                      </span>
                    </div>
                  );
                })()}

                <p style={{
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 12,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Based on {simResult.projected_courses} hypothetical course
                  {simResult.projected_courses !== 1 ? "s" : ""} —
                  no data has been saved
                </p>

                {/* Progress bar */}
                <div style={{ marginTop: 20 }}>
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}>
                    <span style={{
                      fontSize: 11, color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                    }}>
                      0.0
                    </span>
                    <span style={{
                      fontSize: 11, color: "rgba(255,255,255,0.4)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 600,
                    }}>
                      4.0
                    </span>
                  </div>
                  <div style={{
                    height: 8, background: "rgba(255,255,255,0.1)",
                    borderRadius: 999, overflow: "hidden",
                  }}>
                    <div style={{
                      height: "100%",
                      width: `${(simResult.projected_cgpa / 4.0) * 100}%`,
                      background: "linear-gradient(90deg, #FFC005, #C8920A)",
                      borderRadius: 999,
                      transition: "width 1s ease",
                    }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================================
              RIGHT — TARGET GRADE CALCULATOR
          ================================ */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>

            {/* Calculator card */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
              animation: "fadeUp 0.5s ease 0.2s forwards",
              opacity: 0,
            }}>
              <div style={{ marginBottom: 24 }}>
                <h2 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 18,
                  color: "#081C46", marginBottom: 4,
                }}>
                  🎯 Target Grade Calculator
                </h2>
                <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                  Find out exactly what grade you need to hit your target CGPA
                </p>
              </div>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 20,
              }}>

                {/* Target CGPA */}
                <div>
                  <label style={labelStyle}>Target CGPA</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type="number"
                      min="0" max="4" step="0.1"
                      placeholder="e.g. 3.6 for First Class"
                      value={targetCgpa}
                      onChange={(e) => {
                        setTargetCgpa(e.target.value);
                        setTargetError("");
                        setTargetResult(null);
                      }}
                      style={inputStyle}
                      onFocus={(e) => e.target.style.borderColor = "#081C46"}
                      onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                    />
                  </div>

                  {/* Quick target buttons */}
                  <div style={{
                    display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap",
                  }}>
                    {[
                      { label: "First Class", value: "3.6" },
                      { label: "2nd Upper", value: "3.0" },
                      { label: "2nd Lower", value: "2.5" },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => {
                          setTargetCgpa(t.value);
                          setTargetResult(null);
                        }}
                        style={{
                          background: targetCgpa === t.value
                            ? "#081C46" : "#F5F7FF",
                          color: targetCgpa === t.value
                            ? "#FFC005" : "#6B7280",
                          border: `1px solid ${targetCgpa === t.value
                            ? "#081C46" : "#E5E7EB"}`,
                          borderRadius: 8,
                          padding: "6px 12px",
                          fontSize: 12,
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        {t.label} ({t.value})
                      </button>
                    ))}
                  </div>
                </div>

                {/* Remaining Credits */}
                <div>
                  <label style={labelStyle}>Remaining Credit Hours</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    value={remainingCredits}
                    onChange={(e) => {
                      setRemainingCredits(e.target.value);
                      setTargetError("");
                      setTargetResult(null);
                    }}
                    style={inputStyle}
                    onFocus={(e) => e.target.style.borderColor = "#081C46"}
                    onBlur={(e) => e.target.style.borderColor = "#E5E7EB"}
                  />
                  <p style={{
                    fontSize: 11, color: "#9CA3AF",
                    marginTop: 6,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}>
                    Total credits remaining in your program
                  </p>
                </div>

                {targetError && (
                  <div style={{
                    background: "#FEF2F2",
                    borderLeft: "3px solid #EF4444",
                    padding: "10px 14px",
                    borderRadius: "0 8px 8px 0",
                    fontSize: 13, color: "#B91C1C",
                    fontWeight: 500,
                  }}>
                    {targetError}
                  </div>
                )}

                <button
                  onClick={handleTargetCalculate}
                  disabled={targetLoading}
                  style={{
                    width: "100%",
                    padding: "14px",
                    background: "#C8920A",
                    color: "#ffffff",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 700, fontSize: 15,
                    borderRadius: 10,
                    border: "none",
                    cursor: targetLoading ? "not-allowed" : "pointer",
                    opacity: targetLoading ? 0.7 : 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    if (!targetLoading)
                      e.currentTarget.style.background = "#a07508";
                  }}
                  onMouseLeave={(e) => {
                    if (!targetLoading)
                      e.currentTarget.style.background = "#C8920A";
                  }}
                >
                  {targetLoading ? (
                    <>
                      <span style={{
                        width: 16, height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid #ffffff",
                        borderRadius: "50%",
                        display: "inline-block",
                        animation: "spin 0.8s linear infinite",
                      }} />
                      Calculating...
                    </>
                  ) : "Calculate Target →"}
                </button>

              </div>
            </div>

            {/* Target result */}
            {targetResult && (
              <div style={{
                background: "#ffffff",
                borderRadius: 16, padding: "28px",
                border: "1.5px solid #E5E7EB",
                boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
                animation: "fadeUp 0.4s ease forwards",
              }}>
                <h3 style={{
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 16,
                  color: "#081C46", marginBottom: 20,
                }}>
                  Calculation Result
                </h3>

                {/* Achievable / not */}
                <div style={{
                  background: targetResult.achievable ? "#F0FDF4" : "#FEF2F2",
                  border: `1.5px solid ${targetResult.achievable ? "#BBF7D0" : "#FECACA"}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}>
                  <span style={{ fontSize: 20 }}>
                    {targetResult.achievable ? "✅" : "❌"}
                  </span>
                  <p style={{
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 600, fontSize: 14,
                    color: targetResult.achievable ? "#166534" : "#B91C1C",
                    lineHeight: 1.5,
                  }}>
                    {targetResult.message}
                  </p>
                </div>

                {/* Stats grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}>
                  {[
                    {
                      label: "Current CGPA",
                      value: targetResult.current_cgpa?.toFixed(2),
                      color: "#081C46",
                      bg: "#F5F7FF",
                    },
                    {
                      label: "Target CGPA",
                      value: targetResult.target_cgpa?.toFixed(2),
                      color: "#C8920A",
                      bg: "#FFF7ED",
                    },
                    {
                      label: "Credits Earned",
                      value: targetResult.current_credits_earned,
                      color: "#1e40af",
                      bg: "#EFF6FF",
                    },
                    {
                      label: "Remaining Credits",
                      value: targetResult.remaining_credits,
                      color: "#6B7280",
                      bg: "#F9FAFB",
                    },
                  ].map((stat) => (
                    <div key={stat.label} style={{
                      background: stat.bg,
                      borderRadius: 10,
                      padding: "14px 16px",
                      textAlign: "center",
                    }}>
                      <p style={{
                        fontSize: 10, fontWeight: 700,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        marginBottom: 6,
                      }}>
                        {stat.label}
                      </p>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 900, fontSize: 24,
                        color: stat.color,
                      }}>
                        {stat.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Required grade highlight */}
                {targetResult.achievable &&
                  targetResult.required_grade_point_average !== null && (
                  <div style={{
                    marginTop: 16,
                    background: "#081C46",
                    borderRadius: 12,
                    padding: "20px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                  }}>
                    <div style={{
                      position: "absolute", top: -20, right: -20,
                      width: 80, height: 80, borderRadius: "50%",
                      background: "rgba(255,192,5,0.1)",
                    }} />
                    <div>
                      <p style={{
                        fontSize: 11, fontWeight: 700,
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        marginBottom: 4,
                      }}>
                        Required Grade Per Credit
                      </p>
                      <p style={{
                        fontSize: 13, color: "rgba(255,255,255,0.6)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        Across remaining {targetResult.remaining_credits} credits
                      </p>
                    </div>
                    <div style={{ textAlign: "right", position: "relative", zIndex: 2 }}>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 900, fontSize: 40,
                        color: "#FFC005", lineHeight: 1,
                      }}>
                        {targetResult.required_grade}
                      </p>
                      <p style={{
                        fontSize: 13,
                        color: "rgba(255,255,255,0.5)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        ({targetResult.required_grade_point_average} GP)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Info card */}
            <div style={{
              background: "#ffffff",
              borderRadius: 16, padding: "24px 28px",
              border: "1.5px solid #E5E7EB",
              boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
              animation: "fadeUp 0.5s ease 0.3s forwards",
              opacity: 0,
            }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 14,
                color: "#081C46", marginBottom: 14,
              }}>
                💡 How These Tools Work
              </h3>
              <div style={{
                display: "flex", flexDirection: "column", gap: 10,
              }}>
                {[
                  {
                    icon: "🔮",
                    title: "CGPA Simulator",
                    desc: "Adds hypothetical courses to your existing results to project a future CGPA. No data is saved.",
                  },
                  {
                    icon: "🎯",
                    title: "Target Calculator",
                    desc: "Works backwards from your target CGPA to tell you the exact grade point average you need per credit.",
                  },
                ].map((item) => (
                  <div key={item.title} style={{
                    display: "flex", gap: 12,
                    padding: "12px 14px",
                    background: "#F5F7FF",
                    borderRadius: 10,
                  }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    <div>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 13,
                        color: "#081C46", marginBottom: 2,
                      }}>
                        {item.title}
                      </p>
                      <p style={{
                        fontSize: 12, color: "#9CA3AF",
                        lineHeight: 1.5,
                      }}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
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
        @media (max-width: 900px) {
          .sim-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}