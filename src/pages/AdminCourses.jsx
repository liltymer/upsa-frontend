import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const PROGRAMMES = [
  "Diploma in Information Technology Management",
  "Diploma in Accounting",
  "Diploma in Marketing",
  "Diploma in Human Resource Management",
  "Diploma in Logistics and Supply Chain Management",
  "BSc Information Technology Management",
  "BSc Accounting",
  "BSc Marketing",
  "BSc Human Resource Management",
  "BSc Logistics and Supply Chain Management",
  "BSc Banking and Finance",
  "BSc Business Administration",
  "BSc Public Administration",
  "BSc Procurement and Supply Chain Management",
  "BSc Internal Auditing",
  "BSc Secretaryship and Management Studies",
  "MBA",
  "MSc Information Technology Management",
  "Other",
];

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [form, setForm] = useState({
    code: "",
    name: "",
    credit_hours: 3,
    programme: "",
    level: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchCourses = async () => {
    try {
      const res = await API.get("/admin/courses");
      setCourses(res.data.courses);
      setFiltered(res.data.courses);
    } catch {
      showToast("Failed to load courses.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // Filter logic
  useEffect(() => {
    let result = [...courses];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
      );
    }
    if (filterProgramme) {
      result = result.filter((c) => c.programme === filterProgramme);
    }
    if (filterLevel) {
      result = result.filter((c) => String(c.level) === filterLevel);
    }
    setFiltered(result);
  }, [search, filterProgramme, filterLevel, courses]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      showToast("Course code and name are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      await API.post("/admin/courses", {
        code: form.code.trim().toUpperCase(),
        name: form.name.trim(),
        credit_hours: Number(form.credit_hours),
        programme: form.programme || null,
        level: form.level ? Number(form.level) : null,
      });
      setForm({ code: "", name: "", credit_hours: 3, programme: "", level: "" });
      setShowForm(false);
      await fetchCourses();
      showToast("Course added to catalogue!");
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to add course.", "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (course) => {
    if (!window.confirm(
      `Remove ${course.code} — ${course.name} from the catalogue?`
    )) return;
    try {
      await API.delete(`/admin/courses/${course.id}`);
      await fetchCourses();
      showToast("Course removed from catalogue.");
    } catch {
      showToast("Failed to delete course.", "error");
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading course catalogue...</p>
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
            <p className="page-eyebrow">Admin Panel</p>
            <h1 className="page-title">Course Catalogue</h1>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: 13,
            }}>
              {courses.length} course{courses.length !== 1 ? "s" : ""} in the
              catalogue · Official UPSA reference courses
            </p>
          </div>
          <div style={{
            display: "flex", gap: 10,
            flexShrink: 0, marginTop: 4,
          }}>
            <Link
              to="/admin"
              className="btn btn-ghost fade-up-1"
            >
              ← Overview
            </Link>
            <button
              onClick={() => setShowForm(!showForm)}
              className={`btn ${showForm ? "btn-ghost" : "btn-gold"} fade-up-1`}
            >
              {showForm ? "✕ Cancel" : "+ Add Course"}
            </button>
          </div>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section" style={{ paddingBottom: 60 }}>

        {/* Add Course Form */}
        {showForm && (
          <div className="card fade-up" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 className="section-title" style={{ marginBottom: 4 }}>
                📚 Add New Course
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Add an official UPSA course to the reference catalogue.
                Students will be able to select it when entering results.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 100px",
                gap: 16, marginBottom: 16,
              }} className="course-form-row1">

                <div className="form-group">
                  <label className="form-label">Course Code</label>
                  <input
                    type="text"
                    placeholder="e.g. DIPT003"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Course Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Programming I"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Credits</label>
                  <select
                    value={form.credit_hours}
                    onChange={(e) => setForm({
                      ...form, credit_hours: e.target.value,
                    })}
                    className="form-input form-select"
                  >
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <option key={c} value={c}>{c} cr</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16, marginBottom: 20,
              }} className="course-form-row2">

                <div className="form-group">
                  <label className="form-label">Programme (Optional)</label>
                  <select
                    value={form.programme}
                    onChange={(e) => setForm({
                      ...form, programme: e.target.value,
                    })}
                    className="form-input form-select"
                  >
                    <option value="">All Programmes</option>
                    {PROGRAMMES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Level (Optional)</label>
                  <select
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="form-input form-select"
                  >
                    <option value="">All Levels</option>
                    {[100, 200, 300, 400].map((l) => (
                      <option key={l} value={l}>Level {l}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live preview */}
              {form.code && form.name && (
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
                  <span style={{ fontSize: 16 }}>👁️</span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800, fontSize: 13,
                    color: "var(--navy)",
                  }}>
                    {form.code.toUpperCase()}
                  </span>
                  <span style={{
                    fontSize: 13, color: "var(--text-secondary)",
                  }}>
                    {form.name}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600, fontSize: 12,
                    color: "var(--text-muted)",
                  }}>
                    {form.credit_hours} cr
                  </span>
                  {form.programme && (
                    <span style={{
                      fontSize: 11,
                      color: "var(--blue)",
                      background: "var(--blue-bg)",
                      border: "1px solid var(--blue-border)",
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                    }}>
                      {form.programme}
                    </span>
                  )}
                  {form.level && (
                    <span style={{
                      fontSize: 11,
                      color: "var(--amber)",
                      background: "var(--amber-bg)",
                      border: "1px solid var(--amber-border)",
                      padding: "3px 10px",
                      borderRadius: "var(--radius-full)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                    }}>
                      Level {form.level}
                    </span>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="btn btn-primary"
              >
                {submitting ? (
                  <><span className="spinner" />Adding...</>
                ) : "Add to Catalogue →"}
              </button>
            </form>
          </div>
        )}

        {/* Filters */}
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px 160px",
            gap: 16,
            alignItems: "end",
          }} className="filter-grid">

            <div className="form-group">
              <label className="form-label">🔍 Search Courses</label>
              <input
                type="text"
                placeholder="Search by code or title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Programme</label>
              <select
                value={filterProgramme}
                onChange={(e) => setFilterProgramme(e.target.value)}
                className="form-input form-select"
              >
                <option value="">All Programmes</option>
                {PROGRAMMES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Level</label>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="form-input form-select"
              >
                <option value="">All Levels</option>
                {[100, 200, 300, 400].map((l) => (
                  <option key={l} value={l}>Level {l}</option>
                ))}
              </select>
            </div>
          </div>

          {(search || filterProgramme || filterLevel) && (
            <div style={{
              marginTop: 12,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <p style={{
                fontSize: 13, color: "var(--text-muted)",
                fontFamily: "var(--font-heading)", fontWeight: 500,
              }}>
                Showing {filtered.length} of {courses.length} courses
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilterProgramme("");
                  setFilterLevel("");
                }}
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Course List */}
        {filtered.length === 0 ? (
          <div className="card" style={{
            textAlign: "center", padding: "60px 40px",
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📚</p>
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700, fontSize: 18,
              color: "var(--navy)", marginBottom: 8,
            }}>
              {courses.length === 0
                ? "No courses in catalogue yet"
                : "No courses match your search"}
            </h3>
            <p style={{
              color: "var(--text-muted)", fontSize: 14,
              marginBottom: 24, lineHeight: 1.6,
            }}>
              {courses.length === 0
                ? "Add official UPSA courses so students can reference them when entering results."
                : "Try adjusting your search or filters."}
            </p>
            {courses.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                + Add First Course
              </button>
            )}
          </div>
        ) : (
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1.5px solid var(--border)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
          }}>

            {/* Table header */}
            <div
              className="course-table-header"
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 80px 200px 80px 80px",
                padding: "12px 24px",
                background: "var(--bg-page)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["Code", "Course Title", "Credits", "Programme", "Level", "Action"].map((h) => (
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
            {filtered.map((course, i) => (
              <div key={course.id}>

                {/* Desktop row */}
                <div
                  className="course-table-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "100px 1fr 80px 200px 80px 80px",
                    padding: "14px 24px",
                    alignItems: "center",
                    borderBottom: i < filtered.length - 1
                      ? "1px solid #F5F7FF" : "none",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#FAFBFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 800, fontSize: 12,
                    color: "var(--navy)",
                  }}>
                    {course.code}
                  </span>

                  <span style={{
                    fontSize: 13,
                    color: "var(--text-secondary)",
                    fontWeight: 500,
                    paddingRight: 12,
                  }}>
                    {course.name}
                  </span>

                  <span style={{
                    fontSize: 13,
                    color: "var(--text-muted)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                  }}>
                    {course.credit_hours} cr
                  </span>

                  <span style={{
                    fontSize: 11,
                    color: "var(--text-muted)",
                    paddingRight: 8,
                  }}>
                    {course.programme || "—"}
                  </span>

                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600, fontSize: 12,
                    color: course.level ? "var(--blue)" : "var(--text-muted)",
                  }}>
                    {course.level ? `L${course.level}` : "—"}
                  </span>

                  <button
                    onClick={() => handleDelete(course)}
                    className="btn btn-danger btn-sm"
                    style={{ width: "fit-content" }}
                  >
                    Remove
                  </button>
                </div>

                {/* Mobile card */}
                <div
                  className="course-mobile-card"
                  style={{
                    display: "none",
                    padding: "14px 16px",
                    borderBottom: i < filtered.length - 1
                      ? "1px solid var(--border)" : "none",
                  }}
                >
                  <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}>
                    <div style={{ flex: 1, paddingRight: 12 }}>
                      <p style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 800, fontSize: 13,
                        color: "var(--navy)", marginBottom: 2,
                      }}>
                        {course.code}
                      </p>
                      <p style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        marginBottom: 4,
                      }}>
                        {course.name}
                      </p>
                      <div style={{
                        display: "flex", gap: 8,
                        flexWrap: "wrap",
                      }}>
                        <span style={{
                          fontSize: 11, color: "var(--text-muted)",
                          fontFamily: "var(--font-heading)", fontWeight: 600,
                        }}>
                          {course.credit_hours} credits
                        </span>
                        {course.level && (
                          <span style={{
                            fontSize: 11, color: "var(--blue)",
                          }}>
                            Level {course.level}
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(course)}
                      className="btn btn-danger btn-sm"
                    >
                      Remove
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {/* Footer */}
            <div style={{
              padding: "12px 24px",
              background: "var(--bg-page)",
              borderTop: "2px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 600, fontSize: 12,
                color: "var(--text-muted)",
              }}>
                {filtered.length} course{filtered.length !== 1 ? "s" : ""} shown
              </span>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 12,
                color: "var(--navy)",
              }}>
                📚 Official UPSA Course Catalogue
              </span>
            </div>

          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .course-table-header { display: none !important; }
          .course-table-row { display: none !important; }
          .course-mobile-card { display: block !important; }
          .course-form-row1 { grid-template-columns: 1fr !important; }
          .course-form-row2 { grid-template-columns: 1fr !important; }
          .filter-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .course-table-row { display: grid !important; }
          .course-mobile-card { display: none !important; }
        }
      `}</style>

    </div>
  );
}