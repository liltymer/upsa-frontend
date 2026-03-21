import { useState, useEffect } from "react";
import { getMyResults, addResult, updateResult, deleteResult } from "../services/api";
import API from "../services/api";

const GRADE_OPTIONS = ["A", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
const GRADE_POINTS = {
  "A": 4.0, "B+": 3.5, "B": 3.0, "B-": 2.5,
  "C+": 2.0, "C": 1.5, "C-": 1.0, "D": 0.5, "F": 0.0,
};

const gradeClass = (grade) => {
  if (grade === "A") return "grade-A";
  if (["B+", "B", "B-"].includes(grade)) return "grade-B";
  if (["C+", "C"].includes(grade)) return "grade-C";
  if (grade === "C-") return "grade-C-";
  if (grade === "D") return "grade-D";
  return "grade-F";
};

export default function Results() {
  const [results, setResults] = useState([]);
  const [catalogue, setCatalogue] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [editGrade, setEditGrade] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [inputMode, setInputMode] = useState("manual"); // "catalogue" or "manual"
  const [form, setForm] = useState({
    course_code: "", course_name: "",
    credit_hours: "3", grade: "",
    year: "", semester: "",
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
    } catch {
      showToast("Failed to load results.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogue = async () => {
    try {
      const res = await API.get("/courses/");
      setCatalogue(res.data || []);
    } catch {
      // Catalogue is optional — fail silently
    }
  };

  useEffect(() => {
    fetchResults();
    fetchCatalogue();
  }, []);

  const handleCatalogueSelect = (e) => {
    const courseId = e.target.value;
    if (!courseId) {
      setForm({ ...form, course_code: "", course_name: "", credit_hours: "3" });
      return;
    }
    const selected = catalogue.find((c) => String(c.id) === courseId);
    if (selected) {
      setForm({
        ...form,
        course_code: selected.code,
        course_name: selected.name,
        credit_hours: String(selected.credit_hours),
      });
    }
  };

  const resetForm = () => {
    setForm({
      course_code: "", course_name: "",
      credit_hours: "3", grade: "", year: "", semester: "",
    });
  };

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
      resetForm();
      setShowForm(false);
      await fetchResults();
      showToast("Result added successfully.");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to add result.", "error");
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
      showToast("Result updated successfully.");
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to update.", "error");
    }
  };

  const handleDelete = async (resultId) => {
    if (!window.confirm("Delete this result? This cannot be undone.")) return;
    try {
      await deleteResult(resultId);
      await fetchResults();
      showToast("Result deleted.");
    } catch {
      showToast("Failed to delete result.", "error");
    }
  };

  const grouped = results.reduce((acc, r) => {
    const key = `Year ${r.year} — Semester ${r.semester}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(r);
    return acc;
  }, {});

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading results...</p>
    </div>
  );

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
        <div className="header-inner" style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 16, flexWrap: "wrap",
        }}>
          <div className="fade-up">
            <p className="page-eyebrow">Academic Records</p>
            <h1 className="page-title">My Results</h1>
            {studentInfo && (
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 8, flexWrap: "wrap",
                marginTop: 8,
              }}>
                <span className="badge badge-navy">
                  {studentInfo.programme}
                </span>
                <span style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.6)",
                  fontSize: 11, fontWeight: 600,
                  padding: "4px 12px",
                  borderRadius: "var(--radius-full)",
                  fontFamily: "var(--font-heading)",
                }}>
                  Level {studentInfo.level}
                </span>
                <span style={{
                  color: "rgba(255,255,255,0.3)", fontSize: 12,
                }}>
                  {results.length} result{results.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setShowForm(!showForm);
              resetForm();
            }}
            className={`btn ${showForm ? "btn-ghost" : "btn-gold"}`}
            style={{ flexShrink: 0, marginTop: 4 }}
          >
            {showForm ? "Cancel" : "+ Add Result"}
          </button>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section">
        <div style={{ paddingBottom: 60 }}>

          {/* ADD FORM */}
          {showForm && (
            <div className="card fade-up" style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 20 }}>
                <h3 className="section-title" style={{ marginBottom: 4 }}>
                  Add New Result
                </h3>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                  Enter your course details exactly as shown on your result sheet.
                </p>
              </div>

              {/* Input mode toggle */}
              <div style={{
                display: "flex",
                gap: 8,
                marginBottom: 20,
                padding: "4px",
                background: "var(--bg-page)",
                borderRadius: "var(--radius-md)",
                width: "fit-content",
              }}>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("manual");
                    resetForm();
                  }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 12,
                    cursor: "pointer",
                    transition: "var(--transition)",
                    background: inputMode === "manual" ? "var(--navy)" : "transparent",
                    color: inputMode === "manual" ? "var(--gold)" : "var(--text-muted)",
                    boxShadow: inputMode === "manual" ? "var(--shadow-sm)" : "none",
                  }}
                >
                  Enter Manually
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setInputMode("catalogue");
                    resetForm();
                  }}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "var(--radius-sm)",
                    border: "none",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 12,
                    cursor: "pointer",
                    transition: "var(--transition)",
                    background: inputMode === "catalogue" ? "var(--navy)" : "transparent",
                    color: inputMode === "catalogue" ? "var(--gold)" : "var(--text-muted)",
                    boxShadow: inputMode === "catalogue" ? "var(--shadow-sm)" : "none",
                  }}
                >
                  Select from Catalogue
                  {catalogue.length > 0 && (
                    <span style={{
                      marginLeft: 6,
                      background: "var(--gold)",
                      color: "var(--navy)",
                      fontSize: 10,
                      fontWeight: 900,
                      padding: "1px 6px",
                      borderRadius: "var(--radius-full)",
                    }}>
                      {catalogue.length}
                    </span>
                  )}
                </button>
              </div>

              <form onSubmit={handleAdd}>

                {/* CATALOGUE MODE */}
                {inputMode === "catalogue" && (
                  <div style={{ marginBottom: 16 }}>
                    {catalogue.length === 0 ? (
                      <div style={{
                        padding: "20px",
                        background: "var(--bg-page)",
                        border: "1.5px solid var(--border)",
                        borderRadius: "var(--radius-md)",
                        textAlign: "center",
                      }}>
                        <p style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600, fontSize: 14,
                          color: "var(--navy)", marginBottom: 6,
                        }}>
                          No courses in catalogue yet
                        </p>
                        <p style={{
                          fontSize: 13, color: "var(--text-muted)",
                        }}>
                          The system administrator has not added any courses yet.
                          Please use manual entry below.
                        </p>
                      </div>
                    ) : (
                      <div className="form-group">
                        <label className="form-label">
                          Select Course from Catalogue
                        </label>
                        <select
                          onChange={handleCatalogueSelect}
                          className="form-input form-select"
                          defaultValue=""
                        >
                          <option value="">
                            Select a course...
                          </option>
                          {catalogue.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.code} — {c.name} ({c.credit_hours} cr)
                            </option>
                          ))}
                        </select>
                        <p style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 6,
                          fontFamily: "var(--font-heading)",
                        }}>
                          Course code, title and credits will be filled
                          automatically. You can still edit them below.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Row 1 — Code, Name, Credits */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "140px 1fr 100px",
                  gap: 16, marginBottom: 16,
                }} className="form-row-1">

                  <div className="form-group">
                    <label className="form-label">Course Code</label>
                    <input
                      type="text"
                      placeholder="e.g. DIPC003"
                      value={form.course_code}
                      onChange={(e) => setForm({ ...form, course_code: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Course Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Business Management"
                      value={form.course_name}
                      onChange={(e) => setForm({ ...form, course_name: e.target.value })}
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Credits</label>
                    <select
                      value={form.credit_hours}
                      onChange={(e) => setForm({ ...form, credit_hours: e.target.value })}
                      required
                      className="form-input form-select"
                    >
                      {[1, 2, 3, 4, 5, 6].map((c) => (
                        <option key={c} value={c}>{c} cr</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 2 — Grade, Year, Semester */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: 16, marginBottom: 20,
                }} className="form-row-2">

                  <div className="form-group">
                    <label className="form-label">Grade</label>
                    <select
                      value={form.grade}
                      onChange={(e) => setForm({ ...form, grade: e.target.value })}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Select grade...</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g} — {GRADE_POINTS[g].toFixed(1)} GP
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <select
                      value={form.year}
                      onChange={(e) => setForm({ ...form, year: e.target.value })}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Select year...</option>
                      {[1, 2, 3, 4].map((y) => (
                        <option key={y} value={y}>Year {y}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Semester</label>
                    <select
                      value={form.semester}
                      onChange={(e) => setForm({ ...form, semester: e.target.value })}
                      required
                      className="form-input form-select"
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
                    background: "var(--bg-page)",
                    border: "1.5px solid var(--border)",
                    borderRadius: "var(--radius-md)",
                    padding: "12px 16px",
                    marginBottom: 20,
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                    flexWrap: "wrap",
                  }}>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 800, fontSize: 13,
                      color: "var(--navy)",
                    }}>
                      {form.course_code.toUpperCase()}
                    </span>
                    {form.course_name && (
                      <span style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}>
                        {form.course_name}
                      </span>
                    )}
                    <span className={`grade-pill ${gradeClass(form.grade)}`}>
                      {form.grade}
                    </span>
                    <span style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: 13,
                      color: "var(--text-muted)",
                    }}>
                      {GRADE_POINTS[form.grade]?.toFixed(1)} GP
                      · {form.credit_hours} cr
                    </span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn btn-primary"
                >
                  {submitting ? (
                    <><span className="spinner" />Saving...</>
                  ) : "Save Result →"}
                </button>
              </form>
            </div>
          )}

          {/* RESULTS LIST */}
          {results.length === 0 ? (
            <div className="card" style={{
              textAlign: "center", padding: "60px 40px",
            }}>
              <div style={{
                width: 56, height: 56,
                borderRadius: "var(--radius-md)",
                background: "var(--blue-bg)",
                border: "1.5px solid var(--blue-border)",
                display: "flex", alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                  stroke="var(--blue)" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <h3 style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 18,
                color: "var(--navy)", marginBottom: 8,
              }}>
                No results yet
              </h3>
              <p style={{
                color: "var(--text-muted)", fontSize: 14,
                marginBottom: 24, lineHeight: 1.6,
              }}>
                Add your results exactly as shown on your UPSA result sheet.
                Enter the course code, title, credit hours and your grade.
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Add Your First Result
              </button>
            </div>
          ) : (
            <div style={{
              display: "flex", flexDirection: "column", gap: 20,
            }}>
              {Object.entries(grouped).map(([semester, semResults], gi) => {
                const semCredits = semResults.reduce((s, r) => s + r.credit_hours, 0);
                const semPoints = semResults.reduce((s, r) => s + r.grade_point * r.credit_hours, 0);
                const semGPA = semCredits > 0
                  ? (semPoints / semCredits).toFixed(2) : "0.00";

                return (
                  <div
                    key={semester}
                    className={`fade-up-${Math.min(gi + 1, 5)}`}
                    style={{
                      background: "var(--bg-card)",
                      borderRadius: "var(--radius-lg)",
                      border: "1.5px solid var(--border)",
                      overflow: "hidden",
                      boxShadow: "var(--shadow-md)",
                    }}
                  >
                    {/* Semester header */}
                    <div style={{
                      background: "linear-gradient(135deg, var(--navy), var(--navy-mid))",
                      padding: "16px 24px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap", gap: 8,
                    }}>
                      <div>
                        <h3 style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 15,
                          color: "white", marginBottom: 2,
                        }}>
                          {semester}
                        </h3>
                        <p style={{
                          fontSize: 11,
                          color: "rgba(255,255,255,0.4)",
                          fontFamily: "var(--font-heading)",
                        }}>
                          {semResults.length} course{semResults.length !== 1 ? "s" : ""} · {semCredits} credits
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{
                          fontSize: 10, fontWeight: 700,
                          color: "rgba(255,255,255,0.4)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                          fontFamily: "var(--font-heading)",
                          marginBottom: 2,
                        }}>
                          Semester GPA
                        </p>
                        <p style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 900, fontSize: 24,
                          color: "var(--gold)",
                        }}>
                          {semGPA}
                        </p>
                      </div>
                    </div>

                    {/* Desktop table header */}
                    <div
                      className="result-table-header"
                      style={{
                        gridTemplateColumns: "90px 1fr 80px 70px 70px 130px",
                      }}
                    >
                      {["Code", "Course Title", "Credits", "Grade", "GP", "Actions"].map((h) => (
                        <span key={h} style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 10,
                          color: "var(--text-muted)",
                          textTransform: "uppercase",
                          letterSpacing: "0.1em",
                        }}>
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Rows */}
                    {semResults.map((r, ri) => {
                      const isEditing = editingId === r.result_id;
                      return (
                        <div key={r.result_id}>

                          {/* Desktop row */}
                          <div
                            className="result-table-row desktop-row"
                            style={{
                              gridTemplateColumns: "90px 1fr 80px 70px 70px 130px",
                              borderBottom: ri < semResults.length - 1
                                ? "1px solid #F5F7FF" : "none",
                            }}
                          >
                            <span style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 800, fontSize: 12,
                              color: "var(--navy)",
                            }}>
                              {r.course_code}
                            </span>
                            <span style={{
                              fontSize: 13,
                              color: "var(--text-secondary)",
                              fontWeight: 500, paddingRight: 12,
                            }}>
                              {r.course_name}
                            </span>
                            <span style={{
                              fontSize: 13,
                              color: "var(--text-muted)",
                              fontFamily: "var(--font-heading)",
                              fontWeight: 600,
                            }}>
                              {r.credit_hours} cr
                            </span>

                            {isEditing ? (
                              <select
                                value={editGrade}
                                onChange={(e) => setEditGrade(e.target.value)}
                                autoFocus
                                className="form-input form-select"
                                style={{ width: 70, padding: "5px 8px", fontSize: 12 }}
                              >
                                {GRADE_OPTIONS.map((g) => (
                                  <option key={g} value={g}>{g}</option>
                                ))}
                              </select>
                            ) : (
                              <span className={`grade-pill ${gradeClass(r.grade)}`}>
                                {r.grade}
                              </span>
                            )}

                            <span style={{
                              fontFamily: "var(--font-heading)",
                              fontWeight: 700, fontSize: 13,
                              color: "var(--text-muted)",
                            }}>
                              {r.grade_point.toFixed(1)}
                            </span>

                            <div style={{ display: "flex", gap: 6 }}>
                              {isEditing ? (
                                <>
                                  <button
                                    onClick={() => handleUpdate(r.result_id)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingId(null); setEditGrade(""); }}
                                    className="btn btn-outline btn-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => { setEditingId(r.result_id); setEditGrade(r.grade); }}
                                    className="btn btn-sm"
                                    style={{
                                      background: "var(--blue-bg)",
                                      color: "var(--blue)",
                                      border: "1px solid var(--blue-border)",
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r.result_id)}
                                    className="btn btn-danger btn-sm"
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Mobile card */}
                          <div
                            className="mobile-result-card"
                            style={{
                              display: "none",
                              padding: "16px",
                              borderBottom: ri < semResults.length - 1
                                ? "1px solid var(--border)" : "none",
                            }}
                          >
                            <div style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: 10,
                            }}>
                              <div>
                                <p style={{
                                  fontFamily: "var(--font-heading)",
                                  fontWeight: 800, fontSize: 13,
                                  color: "var(--navy)",
                                }}>
                                  {r.course_code}
                                </p>
                                <p style={{
                                  fontSize: 13,
                                  color: "var(--text-secondary)",
                                  marginTop: 2,
                                }}>
                                  {r.course_name}
                                </p>
                                <p style={{
                                  fontSize: 11,
                                  color: "var(--text-muted)",
                                  marginTop: 2,
                                }}>
                                  {r.credit_hours} credit hours
                                </p>
                              </div>
                              <div style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "flex-end",
                                gap: 4,
                              }}>
                                <span className={`grade-pill ${gradeClass(r.grade)}`}>
                                  {r.grade}
                                </span>
                                <span style={{
                                  fontFamily: "var(--font-heading)",
                                  fontWeight: 700, fontSize: 12,
                                  color: "var(--text-muted)",
                                }}>
                                  {r.grade_point.toFixed(1)} GP
                                </span>
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: 8 }}>
                              {isEditing ? (
                                <>
                                  <select
                                    value={editGrade}
                                    onChange={(e) => setEditGrade(e.target.value)}
                                    className="form-input form-select"
                                    style={{ flex: 1, padding: "8px 12px", fontSize: 13 }}
                                  >
                                    {GRADE_OPTIONS.map((g) => (
                                      <option key={g} value={g}>{g}</option>
                                    ))}
                                  </select>
                                  <button
                                    onClick={() => handleUpdate(r.result_id)}
                                    className="btn btn-primary btn-sm"
                                  >
                                    Save
                                  </button>
                                  <button
                                    onClick={() => { setEditingId(null); setEditGrade(""); }}
                                    className="btn btn-outline btn-sm"
                                  >
                                    Cancel
                                  </button>
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => { setEditingId(r.result_id); setEditGrade(r.grade); }}
                                    className="btn btn-sm"
                                    style={{
                                      flex: 1,
                                      background: "var(--blue-bg)",
                                      color: "var(--blue)",
                                      border: "1px solid var(--blue-border)",
                                    }}
                                  >
                                    Edit Grade
                                  </button>
                                  <button
                                    onClick={() => handleDelete(r.result_id)}
                                    className="btn btn-danger btn-sm"
                                    style={{ flex: 1 }}
                                  >
                                    Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      );
                    })}

                    {/* Footer */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "90px 1fr 80px 70px 70px 130px",
                      padding: "12px 24px",
                      background: "var(--bg-page)",
                      borderTop: "2px solid var(--border)",
                    }} className="result-footer">
                      <span />
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 12,
                        color: "var(--navy)",
                      }}>
                        Semester Total
                      </span>
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 12,
                        color: "var(--navy)",
                      }}>
                        {semCredits} cr
                      </span>
                      <span />
                      <span style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 900, fontSize: 14,
                        color: "var(--gold)",
                        background: "var(--navy)",
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
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .desktop-row { display: none !important; }
          .result-table-header { display: none !important; }
          .result-footer { display: none !important; }
          .mobile-result-card { display: block !important; }
          .form-row-1 { grid-template-columns: 1fr !important; }
          .form-row-2 { grid-template-columns: 1fr 1fr !important; }
        }
        @media (min-width: 641px) {
          .desktop-row { display: grid !important; }
          .mobile-result-card { display: none !important; }
        }
      `}</style>

    </div>
  );
}