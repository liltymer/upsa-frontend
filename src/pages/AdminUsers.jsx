import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("");
  const [filterProgramme, setFilterProgramme] = useState("");
  const [toast, setToast] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data.students);
      setFiltered(res.data.students);
    } catch {
      showToast("Failed to load users.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  // Filter logic
  useEffect(() => {
    let result = [...users];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((u) =>
        u.name.toLowerCase().includes(q) ||
        u.index_number.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
      );
    }
    if (filterLevel) {
      result = result.filter((u) => String(u.level) === filterLevel);
    }
    if (filterProgramme) {
      result = result.filter((u) => u.programme === filterProgramme);
    }
    setFiltered(result);
  }, [search, filterLevel, filterProgramme, users]);

  const handleDelete = async (student) => {
    if (!window.confirm(
      `Delete ${student.name} (${student.index_number})? This will permanently remove their account and all their results.`
    )) return;

    setDeleting(student.id);
    try {
      await API.delete(`/admin/users/${student.id}`);
      await fetchUsers();
      showToast(`${student.name} deleted successfully.`);
    } catch {
      showToast("Failed to delete user.", "error");
    } finally {
      setDeleting(null);
    }
  };

  // Unique programmes for filter
  const programmes = [...new Set(users.map((u) => u.programme))].sort();

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading users...</p>
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
            <h1 className="page-title">User Management</h1>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: 13,
            }}>
              {users.length} registered student{users.length !== 1 ? "s" : ""} —
              names and index numbers only. No grades visible.
            </p>
          </div>
          <Link
            to="/admin"
            className="btn btn-ghost fade-up-1"
            style={{ flexShrink: 0, marginTop: 4 }}
          >
            ← Back to Overview
          </Link>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section" style={{ paddingBottom: 60 }}>

        {/* Filters */}
        <div className="card fade-up" style={{ marginBottom: 20 }}>
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 160px 200px",
            gap: 16,
            alignItems: "end",
          }} className="filter-grid">

            <div className="form-group">
              <label className="form-label">🔍 Search</label>
              <input
                type="text"
                placeholder="Search by name, index number or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="form-input"
              />
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

            <div className="form-group">
              <label className="form-label">Programme</label>
              <select
                value={filterProgramme}
                onChange={(e) => setFilterProgramme(e.target.value)}
                className="form-input form-select"
              >
                <option value="">All Programmes</option>
                {programmes.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>

          </div>

          {(search || filterLevel || filterProgramme) && (
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
                Showing {filtered.length} of {users.length} students
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilterLevel("");
                  setFilterProgramme("");
                }}
                className="btn btn-outline btn-sm"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Users Table */}
        {filtered.length === 0 ? (
          <div className="card" style={{
            textAlign: "center", padding: "60px 40px",
          }}>
            <p style={{ fontSize: 40, marginBottom: 16 }}>👥</p>
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700, fontSize: 18,
              color: "var(--navy)", marginBottom: 8,
            }}>
              {users.length === 0 ? "No students yet" : "No results found"}
            </h3>
            <p style={{
              color: "var(--text-muted)", fontSize: 14,
            }}>
              {users.length === 0
                ? "Students will appear here once they register on the platform."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <div style={{
            background: "var(--bg-card)",
            borderRadius: "var(--radius-lg)",
            border: "1.5px solid var(--border)",
            overflow: "hidden",
            boxShadow: "var(--shadow-md)",
          }}>

            {/* Table header — desktop */}
            <div
              className="users-table-header"
              style={{
                display: "grid",
                gridTemplateColumns: "40px 1fr 140px 200px 80px 100px",
                padding: "12px 24px",
                background: "var(--bg-page)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              {["#", "Student", "Index Number", "Programme", "Level", "Action"].map((h) => (
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
            {filtered.map((student, i) => (
              <div key={student.id}>

                {/* Desktop row */}
                <div
                  className="users-table-row"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 1fr 140px 200px 80px 100px",
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
                  {/* Row number */}
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 12,
                    color: "var(--text-muted)",
                  }}>
                    {i + 1}
                  </span>

                  {/* Name + email */}
                  <div>
                    <p style={{
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700, fontSize: 13,
                      color: "var(--navy)", marginBottom: 2,
                    }}>
                      {student.name}
                    </p>
                    <p style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                    }}>
                      {student.email}
                    </p>
                  </div>

                  {/* Index number */}
                  <span style={{
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600, fontSize: 12,
                    color: "var(--text-secondary)",
                  }}>
                    {student.index_number}
                  </span>

                  {/* Programme */}
                  <span style={{
                    fontSize: 12,
                    color: "var(--text-secondary)",
                    paddingRight: 8,
                  }}>
                    {student.programme}
                  </span>

                  {/* Level */}
                  <span style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 52, height: 28,
                    background: "var(--blue-bg)",
                    border: "1px solid var(--blue-border)",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700, fontSize: 11,
                    color: "var(--blue)",
                  }}>
                    L{student.level}
                  </span>

                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(student)}
                    disabled={deleting === student.id}
                    className="btn btn-danger btn-sm"
                    style={{ width: "fit-content" }}
                  >
                    {deleting === student.id ? (
                      <span className="spinner spinner-dark" style={{
                        width: 12, height: 12,
                        border: "2px solid rgba(185,28,28,0.3)",
                        borderTop: "2px solid var(--red)",
                      }} />
                    ) : "Delete"}
                  </button>
                </div>

                {/* Mobile card */}
                <div
                  className="users-mobile-card"
                  style={{
                    display: "none",
                    padding: "16px",
                    borderBottom: i < filtered.length - 1
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
                        fontWeight: 700, fontSize: 14,
                        color: "var(--navy)", marginBottom: 2,
                      }}>
                        {student.name}
                      </p>
                      <p style={{
                        fontSize: 12, color: "var(--text-muted)",
                        marginBottom: 2,
                      }}>
                        {student.index_number}
                      </p>
                      <p style={{
                        fontSize: 11, color: "var(--text-muted)",
                      }}>
                        {student.programme} · Level {student.level}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(student)}
                      disabled={deleting === student.id}
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>

              </div>
            ))}

            {/* Table footer */}
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
                Showing {filtered.length} student{filtered.length !== 1 ? "s" : ""}
              </span>
              <span style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 700, fontSize: 12,
                color: "var(--navy)",
              }}>
                🔒 No grades or results are visible here
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
          .users-table-header { display: none !important; }
          .users-table-row { display: none !important; }
          .users-mobile-card { display: block !important; }
          .filter-grid { grid-template-columns: 1fr !important; }
        }
        @media (min-width: 641px) {
          .users-table-row { display: grid !important; }
          .users-mobile-card { display: none !important; }
        }
      `}</style>

    </div>
  );
}