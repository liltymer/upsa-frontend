import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const PROGRAMMES = [
"Diploma in Accounting",
"Diploma in Marketing",
"Diploma in Management",
"Diploma in Public Relations",
"Diploma in Information Technology Management",
"Bachelor of Science in Data Science and Analytics",
"Bachelor of Laws (LLB)",
"Bachelor of Arts in Communication Studies",
"Bachelor of Science in Logistics and Transport Management",
"Bachelor of Arts in Public Relations Management",
"Bachelor of Science in Accounting",
"Bachelor of Science in Accounting and Finance",
"Bachelor of Science in Business Economics",
"Bachelor of Science in Actuarial Science",
"Bachelor of Science in Banking and Finance",
"Bachelor of Business Administration",
"Bachelor of Science in Information Technology",
"Bachelor of Science in Marketing",
"Bachelor of Science in Real Estate Management and Finance",
  "Other",
];

const LEVELS = [100, 200, 300, 400];

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

  // Multi-programme/level form state
  const [form, setForm] = useState({
    code: "",
    name: "",
    credit_hours: 3,
    programmes: [], // array of selected programmes
    levels: [],     // array of selected levels
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
      result = result.filter((c) => {
        if (c.programmes?.length > 0) {
          return c.programmes.includes(filterProgramme);
        }
        return c.programme === filterProgramme;
      });
    }
    if (filterLevel) {
      result = result.filter((c) => {
        if (c.levels?.length > 0) {
          return c.levels.includes(Number(filterLevel));
        }
        return String(c.level) === filterLevel;
      });
    }
    setFiltered(result);
  }, [search, filterProgramme, filterLevel, courses]);

  // Toggle programme selection
  const toggleProgramme = (programme) => {
    setForm((prev) => ({
      ...prev,
      programmes: prev.programmes.includes(programme)
        ? prev.programmes.filter((p) => p !== programme)
        : [...prev.programmes, programme],
    }));
  };

  // Toggle level selection
  const toggleLevel = (level) => {
    setForm((prev) => ({
      ...prev,
      levels: prev.levels.includes(level)
        ? prev.levels.filter((l) => l !== level)
        : [...prev.levels, level],
    }));
  };

  const resetForm = () => {
    setForm({ code: "", name: "", credit_hours: 3, programmes: [], levels: [] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.name.trim()) {
      showToast("Course code and name are required.", "error");
      return;
    }
    setSubmitting(true);

    // If multiple programmes/levels selected, create one entry per combination
    // If none selected, create one entry with null programme and level
    const programmesToUse = form.programmes.length > 0 ? form.programmes : [null];
    const levelsToUse = form.levels.length > 0 ? form.levels : [null];

    try {
      const promises = [];
      for (const prog of programmesToUse) {
        for (const lvl of levelsToUse) {
          promises.push(
            API.post("/admin/courses", {
              code: form.code.trim().toUpperCase(),
              name: form.name.trim(),
              credit_hours: Number(form.credit_hours),
              programme: prog,
              level: lvl,
            })
          );
        }
      }
      await Promise.all(promises);

      const total = programmesToUse.length * levelsToUse.length;
      resetForm();
      setShowForm(false);
      await fetchCourses();
      showToast(
        total > 1
          ? `Course added for ${total} programme/level combinations.`
          : "Course added to catalogue."
      );
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
              {courses.length} course{courses.length !== 1 ? "s" : ""} in the catalogue
            </p>
          </div>
          <div style={{
            display: "flex", gap: 10,
            flexShrink: 0, marginTop: 4,
          }}>
            <Link to="/admin" className="btn btn-ghost fade-up-1">
              Back to Overview
            </Link>
            <button
              onClick={() => {
                setShowForm(!showForm);
                resetForm();
              }}
              className={`btn ${showForm ? "btn-ghost" : "btn-gold"} fade-up-1`}
            >
              {showForm ? "Cancel" : "+ Add Course"}
            </button>
          </div>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section" style={{ paddingBottom: 60 }}>

        {/* ================================
            ADD COURSE FORM
        ================================ */}
        {showForm && (
          <div className="card fade-up" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 className="section-title" style={{ marginBottom: 4 }}>
                Add New Course
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                Add an official UPSA course to the reference catalogue.
                Select all programmes and levels that offer this course —
                the system will create separate entries for each combination.
              </p>
            </div>

            <form onSubmit={handleSubmit}>

              {/* Code, Name, Credits */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "160px 1fr 100px",
                gap: 16, marginBottom: 24,
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
                    onChange={(e) => setForm({ ...form, credit_hours: e.target.value })}
                    className="form-input form-select"
                  >
                    {[1, 2, 3, 4, 5, 6].map((c) => (
                      <option key={c} value={c}>{c} cr</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Level selector */}
              <div style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ marginBottom: 10, display: "block" }}>
                  Levels — Select all that apply
                  <span style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}>
                    (leave blank to apply to all levels)
                  </span>
                </label>
                <div style={{
                  display: "flex", gap: 10, flexWrap: "wrap",
                }}>
                  {LEVELS.map((l) => {
                    const selected = form.levels.includes(l);
                    return (
                      <button
                        key={l}
                        type="button"
                        onClick={() => toggleLevel(l)}
                        style={{
                          padding: "8px 20px",
                          borderRadius: "var(--radius-sm)",
                          border: `1.5px solid ${selected ? "var(--navy)" : "var(--border)"}`,
                          background: selected ? "var(--navy)" : "var(--bg-card)",
                          color: selected ? "var(--gold)" : "var(--text-secondary)",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 13,
                          cursor: "pointer",
                          transition: "var(--transition)",
                        }}
                      >
                        Level {l}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Programme selector */}
              <div style={{ marginBottom: 24 }}>
                <label className="form-label" style={{ marginBottom: 10, display: "block" }}>
                  Programmes — Select all that offer this course
                  <span style={{
                    marginLeft: 8,
                    fontSize: 11,
                    color: "var(--text-muted)",
                    fontWeight: 400,
                    textTransform: "none",
                    letterSpacing: 0,
                  }}>
                    (leave blank to apply to all programmes)
                  </span>
                </label>
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  gap: 8,
                  maxHeight: 260,
                  overflowY: "auto",
                  padding: "2px",
                }}>
                  {PROGRAMMES.map((p) => {
                    const selected = form.programmes.includes(p);
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => toggleProgramme(p)}
                        style={{
                          padding: "10px 14px",
                          borderRadius: "var(--radius-sm)",
                          border: `1.5px solid ${selected ? "var(--navy)" : "var(--border)"}`,
                          background: selected ? "var(--navy)" : "var(--bg-card)",
                          color: selected ? "var(--gold)" : "var(--text-secondary)",
                          fontFamily: "var(--font-heading)",
                          fontWeight: selected ? 700 : 500,
                          fontSize: 12,
                          cursor: "pointer",
                          transition: "var(--transition)",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        {/* Checkbox indicator */}
                        <span style={{
                          width: 16, height: 16,
                          borderRadius: 4,
                          border: `2px solid ${selected ? "var(--gold)" : "var(--border)"}`,
                          background: selected ? "var(--gold)" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          transition: "var(--transition)",
                        }}>
                          {selected && (
                            <svg width="10" height="10" viewBox="0 0 10 10"
                              fill="none" stroke="var(--navy)"
                              strokeWidth="2" strokeLinecap="round"
                              strokeLinejoin="round">
                              <polyline points="1.5,5 4,7.5 8.5,2"/>
                            </svg>
                          )}
                        </span>
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Select all / Clear */}
                <div style={{
                  display: "flex", gap: 10, marginTop: 10,
                }}>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, programmes: [...PROGRAMMES] })}
                    className="btn btn-outline btn-sm"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, programmes: [] })}
                    className="btn btn-outline btn-sm"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>

              {/* Summary */}
              {form.code && form.name && (
                <div style={{
                  background: "var(--bg-page)",
                  border: "1.5px solid var(--border)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  marginBottom: 20,
                }}>
                  <p style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 12,
                    color: "var(--navy)", marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                  }}>
                    Summary
                  </p>
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12, flexWrap: "wrap",
                    marginBottom: 8,
                  }}>
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
                      fontSize: 12, color: "var(--text-muted)",
                      fontFamily: "var(--font-heading)", fontWeight: 600,
                    }}>
                      {form.credit_hours} credits
                    </span>
                  </div>
                  <p style={{
                    fontSize: 12, color: "var(--text-muted)",
                    fontFamily: "var(--font-heading)",
                  }}>
                    {form.levels.length === 0
                      ? "All levels"
                      : form.levels.map((l) => `Level ${l}`).join(", ")}
                    {" — "}
                    {form.programmes.length === 0
                      ? "All programmes"
                      : `${form.programmes.length} programme${form.programmes.length !== 1 ? "s" : ""} selected`}
                  </p>
                  {form.programmes.length > 0 && form.levels.length > 0 && (
                    <p style={{
                      fontSize: 12,
                      color: "var(--navy)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      marginTop: 6,
                      padding: "6px 10px",
                      background: "var(--blue-bg)",
                      border: "1px solid var(--blue-border)",
                      borderRadius: "var(--radius-sm)",
                      display: "inline-block",
                    }}>
                      {form.programmes.length * form.levels.length} catalogue entries will be created
                    </p>
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

        {/* ================================
            FILTERS
        ================================ */}
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 200px 160px",
            gap: 16, alignItems: "end",
          }} className="filter-grid">

            <div className="form-group">
              <label className="form-label">Search Courses</label>
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
                {LEVELS.map((l) => (
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

        {/* ================================
            COURSE LIST
        ================================ */}
        {filtered.length === 0 ? (
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
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
              </svg>
            </div>
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
                ? "Add official UPSA courses so students can select them when entering results."
                : "Try adjusting your search or filters."}
            </p>
            {courses.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="btn btn-primary"
              >
                Add First Course
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
                gridTemplateColumns: "100px 1fr 80px 1fr 80px 90px",
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
                    gridTemplateColumns: "100px 1fr 80px 1fr 80px 90px",
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
                    fontWeight: 500, paddingRight: 12,
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
                    color: "var(--text-secondary)",
                    paddingRight: 8,
                    lineHeight: 1.5,
                  }}>
                    {course.programme || (
                      <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>
                        All programmes
                      </span>
                    )}
                  </span>

                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600, fontSize: 12,
                    color: course.level ? "var(--blue)" : "var(--text-muted)",
                    fontStyle: course.level ? "normal" : "italic",
                  }}>
                    {course.level ? `Level ${course.level}` : "All"}
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
                        marginBottom: 4, lineHeight: 1.4,
                      }}>
                        {course.name}
                      </p>
                      <div style={{
                        display: "flex", gap: 8, flexWrap: "wrap",
                      }}>
                        <span style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          fontFamily: "var(--font-heading)",
                          fontWeight: 600,
                        }}>
                          {course.credit_hours} credits
                        </span>
                        <span style={{
                          fontSize: 11,
                          color: course.level ? "var(--blue)" : "var(--text-muted)",
                          fontStyle: course.level ? "normal" : "italic",
                        }}>
                          {course.level ? `Level ${course.level}` : "All levels"}
                        </span>
                      </div>
                      {course.programme && (
                        <p style={{
                          fontSize: 11,
                          color: "var(--text-muted)",
                          marginTop: 4,
                        }}>
                          {course.programme}
                        </p>
                      )}
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
                {filtered.length} course {filtered.length !== 1 ? "entries" : "entry"} shown
              </span>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 12,
                color: "var(--navy)",
              }}>
                Official UPSA Course Catalogue
              </span>
            </div>

          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .course-table-header { display: none !important; }
          .course-table-row { display: none !important; }
          .course-mobile-card { display: block !important; }
          .course-form-row1 { grid-template-columns: 1fr !important; }
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