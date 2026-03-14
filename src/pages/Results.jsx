import { useState, useEffect } from "react";
import { getMyResults, addResult, updateResult, deleteResult } from "../services/api";

const GRADE_OPTIONS = ["A", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

const GRADE_POINTS = {
  "A": 4.0, "B+": 3.5, "B": 3.0, "B-": 2.5,
  "C+": 2.0, "C": 1.5, "C-": 1.0, "D": 0.5, "F": 0.0,
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editGrade, setEditGrade] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    course_code: "",
    course_name: "",
    credit_hours: "3",
    grade: "",
    year: "",
    semester: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchResults = async () => {
    try {
      const data = await getMyResults();
      setResults(data.results || []);
      setStudentInfo({
        student: data.student,
        programme: data.programme,
        level: data.level,
      });
    } catch (err) {
      showToast("Failed to load results.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await addResult({
        course_code: form.course_code.trim().toUpperCase(),
        course_name: form.course_name.trim(),
        credit_hours: Number(form.credit_hours),
        grade: form.grade,
        year: Number(form.year),
        semester: Number(form.semester),
      });
      setForm({
        course_code: "", course_name: "",
        credit_hours: "3", grade: "",
        year: "", semester: "",
      });
      setShowForm(false);
      await fetchResults();
      showToast("Result added successfully!");
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to add result.", "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (resultId) => {
    if (!editGrade) return;
    try {
      await updateResult(resultId, { grade: editGrade });
      setEditingId(null);
      setEditGrade("");
      await fetchResults();
      showToast("Result updated successfully!");
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to update.", "error"
      );
    }
  };

  const handleDelete = async (resultId) => {
    if (!window.confirm("Delete this result? This cannot be undone.")) return;
    try {
      await deleteResult(resultId);
      await fetchResults();
      showToast("Result deleted.", "error");
    } catch (err) {
      showToast("Failed to delete result.", "error");
    }
  };

  const getGradeStyle = (grade) => {
    if (grade === "A") return { bg: "#DCFCE7", color: "#166534" };
    if (["B+", "B", "B-"].includes(grade)) return { bg: "#DBEAFE", color: "#1e40af" };
    if (["C+", "C"].includes(grade)) return { bg: "#FEF3C7", color: "#92400E" };
    if (grade === "C-") return { bg: "#FFEDD5", color: "#9a3412" };
    if (grade === "D") return { bg: "#FEE2E2", color: "#B91C1C" };
    return { bg: "#FEE2E2", color: "#7F1D1D" };
  };

  const grouped = results.reduce((acc, r) => {
    const key = `Year ${r.year} — Semester ${r.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    border: "1.5px solid #EAECF0",
    borderRadius: 10,
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
    color: "#6B7280", marginBottom: 7,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

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
        }}>Loading results...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

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
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 20,
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
              Academic Records
            </p>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800, fontSize: 28,
              color: "#ffffff", marginBottom: 6,
            }}>
              My Results
            </h1>
            {studentInfo && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexWrap: "wrap",
              }}>
                <span style={{
                  background: "rgba(255,192,5,0.12)",
                  border: "1px solid rgba(255,192,5,0.2)",
                  color: "#FFC005",
                  fontSize: 11, fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  {studentInfo.programme}
                </span>
                <span style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11, fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: 999,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                  Level {studentInfo.level}
                </span>
                <span style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 12,
                }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              background: showForm ? "rgba(255,255,255,0.08)" : "#FFC005",
              color: showForm ? "#ffffff" : "#081C46",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: 14,
              padding: "12px 24px",
              borderRadius: 12,
              border: showForm ? "1px solid rgba(255,255,255,0.15)" : "none",
              cursor: "pointer",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {showForm ? "✕ Cancel" : "+ Add Result"}
          </button>
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
            ADD RESULT FORM
        ================================ */}
        {showForm && (
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "28px",
            border: "1.5px solid #E5E7EB",
            boxShadow: "0 8px 32px rgba(8,28,70,0.08)",
            marginBottom: 24,
            animation: "fadeUp 0.3s ease forwards",
          }}>

            <div style={{ marginBottom: 20 }}>
              <h3 style={{
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 16,
                color: "#081C46", marginBottom: 4,
              }}>
                Add New Result
              </h3>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>
                Enter your course details exactly as shown on your result sheet
              </p>
            </div>

            <form onSubmit={handleAdd}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr 100px",
                gap: 16,
                marginBottom: 16,
              }}>
                {/* Course Code */}
                <div>
                  <label style={labelStyle}>Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. DIPC003"
                    value={form.course_code}
                    onChange={(e) => setForm({
                      ...form, course_code: e.target.value
                    })}
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

                {/* Course Name */}
                <div>
                  <label style={labelStyle}>Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Business Management"
                    value={form.course_name}
                    onChange={(e) => setForm({
                      ...form, course_name: e.target.value
                    })}
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

                {/* Credit Hours */}
                <div>
                  <label style={labelStyle}>Credits</label>
                  <select
                    value={form.credit_hours}
                    onChange={(e) => setForm({
                      ...form, credit_hours: e.target.value
                    })}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#081C46";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#EAECF0";
                      e.target.style.background = "#FAFBFF";
                    }}
                  >
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                marginBottom: 20,
              }}>
                {/* Grade */}
                <div>
                  <label style={labelStyle}>Grade</label>
                  <select
                    value={form.grade}
                    onChange={(e) => setForm({
                      ...form, grade: e.target.value
                    })}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#081C46";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#EAECF0";
                      e.target.style.background = "#FAFBFF";
                    }}
                  >
                    <option value="">Select grade...</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g} — {GRADE_POINTS[g].toFixed(1)} GP
                      </option>
                    ))}
                  </select>
                </div>

                {/* Year */}
                <div>
                  <label style={labelStyle}>Year</label>
                  <select
                    value={form.year}
                    onChange={(e) => setForm({
                      ...form, year: e.target.value
                    })}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#081C46";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#EAECF0";
                      e.target.style.background = "#FAFBFF";
                    }}
                  >
                    <option value="">Select year...</option>
                    {[1, 2, 3, 4].map((y) => (
                      <option key={y} value={y}>Year {y}</option>
                    ))}
                  </select>
                </div>

                {/* Semester */}
                <div>
                  <label style={labelStyle}>Semester</label>
                  <select
                    value={form.semester}
                    onChange={(e) => setForm({
                      ...form, semester: e.target.value
                    })}
                    required
                    style={{ ...inputStyle, cursor: "pointer" }}
                    onFocus={(e) => {
                      e.target.style.borderColor = "#081C46";
                      e.target.style.background = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "#EAECF0";
                      e.target.style.background = "#FAFBFF";
                    }}
                  >
                    <option value="">Select semester...</option>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                  </select>
                </div>
              </div>

              {/* Live preview */}
              {form.grade && form.course_code && (
                <div style={{
                  background: "#F5F7FF",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: 10,
                  padding: "12px 16px",
                  marginBottom: 20,
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}>
                  <span style={{ fontSize: 16 }}>👁️</span>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 800, fontSize: 13,
                      color: "#081C46",
                    }}>
                      {form.course_code.toUpperCase()}
                    </span>
                    {form.course_name && (
                      <span style={{ fontSize: 13, color: "#6B7280" }}>
                        {form.course_name}
                      </span>
                    )}
                    <span style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 36, height: 36,
                      borderRadius: 9,
                      background: getGradeStyle(form.grade).bg,
                      color: getGradeStyle(form.grade).color,
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 900, fontSize: 14,
                    }}>
                      {form.grade}
                    </span>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 13,
                      color: "#6B7280",
                    }}>
                      {GRADE_POINTS[form.grade]?.toFixed(1)} GP
                      · {form.credit_hours} cr
                    </span>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: "13px 28px",
                  background: "linear-gradient(135deg, #081C46, #0f2d6e)",
                  color: "#FFC005",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  fontWeight: 700, fontSize: 14,
                  borderRadius: 10, border: "none",
                  cursor: submitting ? "not-allowed" : "pointer",
                  opacity: submitting ? 0.7 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  boxShadow: "0 4px 16px rgba(8,28,70,0.2)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(8,28,70,0.3)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!submitting) {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(8,28,70,0.2)";
                  }
                }}
              >
                {submitting ? (
                  <>
                    <span style={{
                      width: 14, height: 14,
                      border: "2px solid rgba(255,192,5,0.3)",
                      borderTop: "2px solid #FFC005",
                      borderRadius: "50%",
                      display: "inline-block",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Saving...
                  </>
                ) : "Save Result →"}
              </button>
            </form>
          </div>
        )}

        {/* ================================
            RESULTS — grouped by semester
        ================================ */}
        {results.length === 0 ? (
          <div style={{
            background: "#ffffff",
            borderRadius: 16, padding: "60px 40px",
            border: "1.5px solid #E5E7EB",
            textAlign: "center",
            animation: "fadeUp 0.5s ease forwards",
            boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📋</p>
            <h3 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 700, fontSize: 18,
              color: "#081C46", marginBottom: 8,
            }}>
              No results yet
            </h3>
            <p style={{
              color: "#9CA3AF", fontSize: 14,
              marginBottom: 24, lineHeight: 1.6,
            }}>
              Add your results exactly as shown on your
              UPSA result sheet — course code, title,
              credit hours and grade.
            </p>
            <button
              onClick={() => setShowForm(true)}
              style={{
                background: "#081C46",
                color: "#FFC005",
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                fontWeight: 700, fontSize: 14,
                padding: "12px 24px",
                borderRadius: 10, border: "none",
                cursor: "pointer",
                boxShadow: "0 4px 16px rgba(8,28,70,0.2)",
              }}
            >
              + Add Your First Result
            </button>
          </div>
        ) : (
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>
            {Object.entries(grouped).map(([semester, semResults], gi) => {

              const semCredits = semResults.reduce(
                (s, r) => s + r.credit_hours, 0
              );
              const semPoints = semResults.reduce(
                (s, r) => s + r.grade_point * r.credit_hours, 0
              );
              const semGPA = semCredits > 0
                ? (semPoints / semCredits).toFixed(2) : "0.00";

              return (
                <div
                  key={semester}
                  style={{
                    background: "#ffffff",
                    borderRadius: 16,
                    border: "1.5px solid #E5E7EB",
                    overflow: "hidden",
                    boxShadow: "0 4px 16px rgba(8,28,70,0.06)",
                    animation: `fadeUp 0.5s ease ${gi * 0.08}s forwards`,
                    opacity: 0,
                  }}
                >
                  {/* Semester header */}
                  <div style={{
                    background: "linear-gradient(135deg, #081C46, #1a3a7a)",
                    padding: "16px 24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <div>
                      <h3 style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 15,
                        color: "#ffffff", marginBottom: 2,
                      }}>
                        {semester}
                      </h3>
                      <p style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.4)",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}>
                        {semResults.length} course
                        {semResults.length !== 1 ? "s" : ""} · {semCredits} credits
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{
                        fontSize: 10, fontWeight: 700,
                        color: "rgba(255,255,255,0.4)",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        marginBottom: 2,
                      }}>Semester GPA</p>
                      <p style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 900, fontSize: 24,
                        color: "#FFC005",
                      }}>
                        {semGPA}
                      </p>
                    </div>
                  </div>

                  {/* Table header */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 80px 70px 70px 130px",
                    padding: "10px 24px",
                    background: "#F5F7FF",
                    borderBottom: "1px solid #E5E7EB",
                  }}>
                    {["Code", "Course Title", "Credits", "Grade", "GP", "Actions"].map((h) => (
                      <span key={h} style={{
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                        fontWeight: 700, fontSize: 10,
                        color: "#9CA3AF",
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                      }}>
                        {h}
                      </span>
                    ))}
                  </div>

                  {/* Result rows */}
                  {semResults.map((r, ri) => {
                    const gradeStyle = getGradeStyle(r.grade);
                    const isEditing = editingId === r.result_id;

                    return (
                      <div
                        key={r.result_id}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "90px 1fr 80px 70px 70px 130px",
                          padding: "14px 24px",
                          borderBottom: ri < semResults.length - 1
                            ? "1px solid #F5F7FF" : "none",
                          alignItems: "center",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FAFBFF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {/* Code */}
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 800, fontSize: 12,
                          color: "#081C46",
                        }}>
                          {r.course_code}
                        </span>

                        {/* Name */}
                        <span style={{
                          fontSize: 13, color: "#374151",
                          fontWeight: 500, paddingRight: 12,
                        }}>
                          {r.course_name}
                        </span>

                        {/* Credits */}
                        <span style={{
                          fontSize: 13, color: "#9CA3AF",
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 600,
                        }}>
                          {r.credit_hours} cr
                        </span>

                        {/* Grade pill or edit dropdown */}
                        {isEditing ? (
                          <select
                            value={editGrade}
                            onChange={(e) => setEditGrade(e.target.value)}
                            autoFocus
                            style={{
                              width: 60,
                              padding: "5px 6px",
                              border: "1.5px solid #081C46",
                              borderRadius: 8,
                              fontSize: 12,
                              fontFamily: "'Plus Jakarta Sans', sans-serif",
                              fontWeight: 700,
                              color: "#081C46",
                              outline: "none",
                              cursor: "pointer",
                            }}
                          >
                            {GRADE_OPTIONS.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        ) : (
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 40, height: 40,
                            borderRadius: 10,
                            background: gradeStyle.bg,
                            color: gradeStyle.color,
                            fontFamily: "'Plus Jakarta Sans', sans-serif",
                            fontWeight: 900, fontSize: 13,
                          }}>
                            {r.grade}
                          </span>
                        )}

                        {/* Grade point */}
                        <span style={{
                          fontFamily: "'Plus Jakarta Sans', sans-serif",
                          fontWeight: 700, fontSize: 13,
                          color: "#6B7280",
                        }}>
                          {r.grade_point.toFixed(1)}
                        </span>

                        {/* Actions */}
                        <div style={{ display: "flex", gap: 6 }}>
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleUpdate(r.result_id)}
                                style={{
                                  background: "#081C46",
                                  color: "#FFC005",
                                  border: "none",
                                  borderRadius: 7,
                                  padding: "6px 12px",
                                  fontSize: 11,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingId(null);
                                  setEditGrade("");
                                }}
                                style={{
                                  background: "#F5F7FF",
                                  color: "#6B7280",
                                  border: "1px solid #E5E7EB",
                                  borderRadius: 7,
                                  padding: "6px 10px",
                                  fontSize: 11,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                }}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(r.result_id);
                                  setEditGrade(r.grade);
                                }}
                                style={{
                                  background: "#EFF6FF",
                                  color: "#1e40af",
                                  border: "1px solid #BFDBFE",
                                  borderRadius: 7,
                                  padding: "6px 12px",
                                  fontSize: 11,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(r.result_id)}
                                style={{
                                  background: "#FEF2F2",
                                  color: "#B91C1C",
                                  border: "1px solid #FECACA",
                                  borderRadius: 7,
                                  padding: "6px 10px",
                                  fontSize: 11,
                                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                                  fontWeight: 700,
                                  cursor: "pointer",
                                  transition: "all 0.15s",
                                }}
                              >
                                Del
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Semester footer */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "90px 1fr 80px 70px 70px 130px",
                    padding: "12px 24px",
                    background: "#F5F7FF",
                    borderTop: "2px solid #E5E7EB",
                  }}>
                    <span />
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 12,
                      color: "#081C46",
                    }}>
                      Semester Total
                    </span>
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 700, fontSize: 12,
                      color: "#081C46",
                    }}>
                      {semCredits} cr
                    </span>
                    <span />
                    <span style={{
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      fontWeight: 900, fontSize: 13,
                      color: "#FFC005",
                      background: "#081C46",
                      padding: "4px 8px",
                      borderRadius: 6,
                      textAlign: "center",
                    }}>
                      {semGPA}
                    </span>
                    <span />
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed",
          bottom: 28, right: 28,
          background: toast.type === "error" ? "#B91C1C" : "#081C46",
          color: "#ffffff",
          padding: "14px 22px",
          borderRadius: 12,
          borderLeft: `4px solid ${toast.type === "error" ? "#EF4444" : "#FFC005"}`,
          fontSize: 14, fontWeight: 500,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: "0 8px 32px rgba(8,28,70,0.2)",
          animation: "slideIn 0.3s ease forwards",
          zIndex: 1000,
          maxWidth: 340,
        }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

    </div>
  );
}