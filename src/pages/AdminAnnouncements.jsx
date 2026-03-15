import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const PRIORITY_OPTIONS = [
  { value: "normal", label: "Normal", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
  { value: "important", label: "Important", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" },
  { value: "urgent", label: "Urgent", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" },
];

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    title: "", message: "", priority: "normal", is_active: true,
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchAnnouncements = async () => {
    try {
      const res = await API.get("/admin/announcements");
      setAnnouncements(res.data);
    } catch {
      showToast("Failed to load announcements.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  const resetForm = () => {
    setForm({ title: "", message: "", priority: "normal", is_active: true });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      showToast("Title and message are required.", "error");
      return;
    }
    setSubmitting(true);
    try {
      if (editingId) {
        await API.put(`/admin/announcements/${editingId}`, form);
        showToast("Announcement updated successfully!");
      } else {
        await API.post("/admin/announcements", form);
        showToast("Announcement posted successfully!");
      }
      resetForm();
      await fetchAnnouncements();
    } catch {
      showToast("Failed to save announcement.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (ann) => {
    setForm({
      title: ann.title,
      message: ann.message,
      priority: ann.priority,
      is_active: ann.is_active,
    });
    setEditingId(ann.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleActive = async (ann) => {
    try {
      await API.put(`/admin/announcements/${ann.id}`, {
        is_active: !ann.is_active,
      });
      await fetchAnnouncements();
      showToast(
        ann.is_active ? "Announcement deactivated." : "Announcement activated!"
      );
    } catch {
      showToast("Failed to update announcement.", "error");
    }
  };

  const handleDelete = async (ann) => {
    if (!window.confirm(`Delete "${ann.title}"? This cannot be undone.`)) return;
    try {
      await API.delete(`/admin/announcements/${ann.id}`);
      await fetchAnnouncements();
      showToast("Announcement deleted.", "error");
    } catch {
      showToast("Failed to delete announcement.", "error");
    }
  };

  const getPriorityStyle = (priority) => {
    return PRIORITY_OPTIONS.find((p) => p.value === priority) || PRIORITY_OPTIONS[0];
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading announcements...</p>
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
            <h1 className="page-title">Announcements</h1>
            <p style={{
              color: "rgba(255,255,255,0.4)", fontSize: 13,
            }}>
              Post notices that all students see on their dashboard.
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
              onClick={() => {
                resetForm();
                setShowForm(!showForm);
              }}
              className={`btn ${showForm && !editingId ? "btn-ghost" : "btn-gold"} fade-up-1`}
            >
              {showForm && !editingId ? "✕ Cancel" : "+ New Announcement"}
            </button>
          </div>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section" style={{ paddingBottom: 60 }}>

        {/* Form */}
        {showForm && (
          <div className="card fade-up" style={{ marginBottom: 24 }}>
            <div style={{ marginBottom: 20 }}>
              <h3 className="section-title" style={{ marginBottom: 4 }}>
                {editingId ? "✏️ Edit Announcement" : "📣 New Announcement"}
              </h3>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {editingId
                  ? "Update the announcement details below."
                  : "This will be visible to all students on their dashboard immediately."}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{
                display: "flex", flexDirection: "column", gap: 16,
              }}>

                {/* Title */}
                <div className="form-group">
                  <label className="form-label">Announcement Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Semester 2 Results Released"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                    className="form-input"
                  />
                </div>

                {/* Message */}
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    placeholder="Write your announcement message here..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={4}
                    className="form-input"
                    style={{ resize: "vertical", minHeight: 100 }}
                  />
                </div>

                {/* Priority + Active */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 16,
                }}>

                  <div className="form-group">
                    <label className="form-label">Priority Level</label>
                    <div style={{
                      display: "flex", gap: 8, flexWrap: "wrap",
                    }}>
                      {PRIORITY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm({ ...form, priority: opt.value })}
                          style={{
                            padding: "8px 16px",
                            borderRadius: "var(--radius-full)",
                            border: `1.5px solid ${form.priority === opt.value ? opt.border : "var(--border)"}`,
                            background: form.priority === opt.value ? opt.bg : "var(--bg-card)",
                            color: form.priority === opt.value ? opt.color : "var(--text-muted)",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700, fontSize: 12,
                            cursor: "pointer",
                            transition: "var(--transition)",
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Visibility</label>
                    <div style={{
                      display: "flex", gap: 8,
                    }}>
                      {[
                        { label: "Active — visible to students", value: true },
                        { label: "Hidden — draft only", value: false },
                      ].map((opt) => (
                        <button
                          key={String(opt.value)}
                          type="button"
                          onClick={() => setForm({ ...form, is_active: opt.value })}
                          style={{
                            padding: "8px 14px",
                            borderRadius: "var(--radius-full)",
                            border: `1.5px solid ${form.is_active === opt.value ? "var(--green-border)" : "var(--border)"}`,
                            background: form.is_active === opt.value ? "var(--green-bg)" : "var(--bg-card)",
                            color: form.is_active === opt.value ? "var(--green)" : "var(--text-muted)",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700, fontSize: 11,
                            cursor: "pointer",
                            transition: "var(--transition)",
                            flex: 1,
                          }}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Preview */}
                {form.title && form.message && (
                  <div>
                    <p className="form-label" style={{ marginBottom: 8 }}>
                      Preview — how students will see this:
                    </p>
                    <div style={{
                      padding: "14px 16px",
                      background: getPriorityStyle(form.priority).bg,
                      border: `1.5px solid ${getPriorityStyle(form.priority).border}`,
                      borderLeft: `4px solid ${getPriorityStyle(form.priority).color}`,
                      borderRadius: "var(--radius-md)",
                    }}>
                      <p style={{
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700, fontSize: 14,
                        color: getPriorityStyle(form.priority).color,
                        marginBottom: 4,
                      }}>
                        📣 {form.title}
                      </p>
                      <p style={{
                        fontSize: 13,
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                      }}>
                        {form.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: "flex", gap: 12 }}>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="btn btn-outline"
                      style={{ flex: 1 }}
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn btn-primary btn-lg"
                    style={{ flex: 2 }}
                  >
                    {submitting ? (
                      <><span className="spinner" />Saving...</>
                    ) : editingId ? "Update Announcement →" : "Post Announcement →"}
                  </button>
                </div>

              </div>
            </form>
          </div>
        )}

        {/* Announcements list */}
        {announcements.length === 0 ? (
          <div className="card" style={{
            textAlign: "center", padding: "60px 40px",
          }}>
            <p style={{ fontSize: 48, marginBottom: 16 }}>📣</p>
            <h3 style={{
              fontFamily: "var(--font-heading)",
              fontWeight: 700, fontSize: 18,
              color: "var(--navy)", marginBottom: 8,
            }}>
              No announcements yet
            </h3>
            <p style={{
              color: "var(--text-muted)", fontSize: 14,
              marginBottom: 24, lineHeight: 1.6,
            }}>
              Post your first announcement and all students
              will see it on their dashboard instantly.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="btn btn-primary"
            >
              + Post First Announcement
            </button>
          </div>
        ) : (
          <div style={{
            display: "flex", flexDirection: "column", gap: 16,
          }}>

            {/* Summary bar */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap", gap: 12,
            }}>
              <p style={{
                fontSize: 13, color: "var(--text-muted)",
                fontFamily: "var(--font-heading)", fontWeight: 500,
              }}>
                {announcements.length} announcement{announcements.length !== 1 ? "s" : ""} total
                · {announcements.filter((a) => a.is_active).length} active
              </p>
            </div>

            {announcements.map((ann, i) => {
              const ps = getPriorityStyle(ann.priority);
              return (
                <div
                  key={ann.id}
                  className={`card fade-up-${Math.min(i + 1, 5)}`}
                  style={{
                    border: `1.5px solid ${ann.is_active ? ps.border : "var(--border)"}`,
                    opacity: ann.is_active ? 1 : 0.6,
                  }}
                >
                  <div style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 16,
                    flexWrap: "wrap",
                  }}>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 8,
                        flexWrap: "wrap",
                      }}>
                        <h3 style={{
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 16,
                          color: "var(--navy)",
                        }}>
                          {ann.title}
                        </h3>
                        <span style={{
                          background: ps.bg,
                          border: `1px solid ${ps.border}`,
                          color: ps.color,
                          fontFamily: "var(--font-heading)",
                          fontWeight: 700, fontSize: 10,
                          padding: "3px 10px",
                          borderRadius: "var(--radius-full)",
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}>
                          {ann.priority}
                        </span>
                        {!ann.is_active && (
                          <span style={{
                            background: "#F9FAFB",
                            border: "1px solid var(--border)",
                            color: "var(--text-muted)",
                            fontFamily: "var(--font-heading)",
                            fontWeight: 700, fontSize: 10,
                            padding: "3px 10px",
                            borderRadius: "var(--radius-full)",
                            textTransform: "uppercase",
                          }}>
                            Hidden
                          </span>
                        )}
                      </div>

                      <p style={{
                        fontSize: 14,
                        color: "var(--text-secondary)",
                        lineHeight: 1.6,
                        marginBottom: 10,
                      }}>
                        {ann.message}
                      </p>

                      <p style={{
                        fontSize: 11,
                        color: "var(--text-muted)",
                        fontFamily: "var(--font-heading)",
                      }}>
                        Posted {formatDate(ann.created_at)}
                        {ann.updated_at && ` · Updated ${formatDate(ann.updated_at)}`}
                      </p>
                    </div>

                    {/* Actions */}
                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      flexShrink: 0,
                    }}>
                      <button
                        onClick={() => handleEdit(ann)}
                        className="btn btn-sm"
                        style={{
                          background: "var(--blue-bg)",
                          color: "var(--blue)",
                          border: "1px solid var(--blue-border)",
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleToggleActive(ann)}
                        className="btn btn-sm"
                        style={{
                          background: ann.is_active ? "var(--amber-bg)" : "var(--green-bg)",
                          color: ann.is_active ? "var(--amber)" : "var(--green)",
                          border: `1px solid ${ann.is_active ? "var(--amber-border)" : "var(--green-border)"}`,
                        }}
                      >
                        {ann.is_active ? "🙈 Hide" : "👁 Show"}
                      </button>
                      <button
                        onClick={() => handleDelete(ann)}
                        className="btn btn-danger btn-sm"
                      >
                        🗑 Delete
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}

          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "❌" : "✅"} {toast.msg}
        </div>
      )}

    </div>
  );
}