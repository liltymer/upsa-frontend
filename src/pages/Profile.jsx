import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
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
const ACADEMIC_YEARS = [
  "2021/2022", "2022/2023", "2023/2024",
  "2024/2025", "2025/2026",
];

export default function Profile() {
  const { user, login, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    name: "",
    programme: "",
    level: "",
    academic_year: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/students/me");
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          programme: res.data.programme || "",
          level: res.data.level || "",
          academic_year: res.data.academic_year || "",
        });
      } catch {
        showToast("Failed to load profile.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/students/me", {
        name: form.name,
        programme: form.programme,
        level: Number(form.level),
        academic_year: form.academic_year,
      });

      // Update auth context with new name
      login(token, {
        ...user,
        name: res.data.name,
        programme: res.data.programme,
        level: res.data.level,
        academic_year: res.data.academic_year,
      });

      showToast("Profile updated successfully.");
    } catch (err) {
      showToast(
        err.response?.data?.detail || "Failed to update profile.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading your profile...</p>
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
        <div className="header-inner fade-up">
          <p className="page-eyebrow">Account Settings</p>
          <h1 className="page-title">My Profile</h1>
          <p style={{
            color: "rgba(255,255,255,0.4)", fontSize: 13,
          }}>
            Update your personal and academic information
          </p>
        </div>
      </div>

      {/* ================================
          CONTENT
      ================================ */}
      <div className="overlap-section" style={{ paddingBottom: 60 }}>
        <div className="grid-main">

          {/* LEFT — Edit Form */}
          <div style={{
            display: "flex", flexDirection: "column", gap: 24,
          }}>

            {/* Personal Information */}
            <div className="card fade-up">
              <h3 className="section-title">Personal Information</h3>

              <form onSubmit={handleSubmit}>
                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                }}>

                  {/* Full Name */}
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="form-input"
                      placeholder="Your full name"
                    />
                  </div>

                  {/* Index Number — read only */}
                  <div className="form-group">
                    <label className="form-label">Index Number</label>
                    <input
                      type="text"
                      value={profile?.index_number || ""}
                      disabled
                      className="form-input"
                      style={{
                        background: "#F9FAFB",
                        color: "var(--text-muted)",
                        cursor: "not-allowed",
                      }}
                    />
                    <p style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      fontFamily: "var(--font-heading)",
                    }}>
                      Index number cannot be changed.
                    </p>
                  </div>

                  {/* Email — read only */}
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      type="text"
                      value={profile?.email || ""}
                      disabled
                      className="form-input"
                      style={{
                        background: "#F9FAFB",
                        color: "var(--text-muted)",
                        cursor: "not-allowed",
                      }}
                    />
                    <p style={{
                      fontSize: 11,
                      color: "var(--text-muted)",
                      marginTop: 4,
                      fontFamily: "var(--font-heading)",
                    }}>
                      Email address cannot be changed. Contact support if needed.
                    </p>
                  </div>

                </div>

                <div style={{
                  height: 1,
                  background: "var(--border)",
                  margin: "24px 0",
                }} />

                <h3 className="section-title">Academic Information</h3>

                <div style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 18,
                  marginBottom: 28,
                }}>

                  {/* Programme */}
                  <div className="form-group">
                    <label className="form-label">Programme</label>
                    <select
                      value={form.programme}
                      onChange={(e) => setForm({ ...form, programme: e.target.value })}
                      required
                      className="form-input form-select"
                    >
                      <option value="">Select programme...</option>
                      {PROGRAMMES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  {/* Level + Academic Year */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }} className="profile-grid">

                    <div className="form-group">
                      <label className="form-label">Current Level</label>
                      <select
                        value={form.level}
                        onChange={(e) => setForm({ ...form, level: e.target.value })}
                        required
                        className="form-input form-select"
                      >
                        <option value="">Select level...</option>
                        {LEVELS.map((l) => (
                          <option key={l} value={l}>Level {l}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Academic Year</label>
                      <select
                        value={form.academic_year}
                        onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                        required
                        className="form-input form-select"
                      >
                        <option value="">Select year...</option>
                        {ACADEMIC_YEARS.map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>

                  </div>

                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn btn-primary btn-lg"
                >
                  {saving ? (
                    <><span className="spinner" />Saving changes...</>
                  ) : "Save Changes →"}
                </button>

              </form>
            </div>

          </div>

          {/* RIGHT — Profile Summary */}
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: 20,
            position: "sticky",
            top: "calc(var(--navbar-height) + 16px)",
          }}>

            {/* Profile Card */}
            <div className="card-dark fade-up-1"
              style={{ borderRadius: "var(--radius-lg)" }}
            >
              {/* Avatar */}
              <div style={{
                width: 72, height: 72,
                borderRadius: "50%",
                background: "rgba(255,192,5,0.12)",
                border: "2px solid rgba(255,192,5,0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
              }}>
                <span style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 900, fontSize: 28,
                  color: "var(--gold)",
                }}>
                  {(profile?.name || "?")[0].toUpperCase()}
                </span>
              </div>

              <p style={{
                fontFamily: "var(--font-heading)",
                fontWeight: 800, fontSize: 18,
                color: "white",
                textAlign: "center",
                marginBottom: 4,
              }}>
                {profile?.name}
              </p>

              <p style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.4)",
                textAlign: "center",
                marginBottom: 20,
                fontFamily: "var(--font-heading)",
              }}>
                {profile?.index_number}
              </p>

              <div style={{
                borderTop: "1px solid rgba(255,255,255,0.08)",
                paddingTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {[
                  { label: "Programme", value: profile?.programme },
                  { label: "Level", value: profile?.level ? `Level ${profile.level}` : "—" },
                  { label: "Academic Year", value: profile?.academic_year },
                  { label: "Role", value: profile?.role === "admin" ? "Administrator" : "Student" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 12,
                  }}>
                    <span style={{
                      fontSize: 11,
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      flexShrink: 0,
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.7)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 600,
                      textAlign: "right",
                    }}>
                      {item.value || "—"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Info box */}
            <div className="card fade-up-2">
              <h3 className="section-title" style={{ fontSize: 14 }}>
                What can I update?
              </h3>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}>
                {[
                  { label: "Full Name", editable: true },
                  { label: "Programme", editable: true },
                  { label: "Current Level", editable: true },
                  { label: "Academic Year", editable: true },
                  { label: "Index Number", editable: false },
                  { label: "Email Address", editable: false },
                  { label: "Password", editable: false, note: "Use forgot password" },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    background: "var(--bg-page)",
                    borderRadius: "var(--radius-sm)",
                  }}>
                    <span style={{
                      fontSize: 13,
                      color: "var(--text-secondary)",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 500,
                    }}>
                      {item.label}
                    </span>
                    <span style={{
                      fontSize: 11,
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      color: item.editable ? "var(--green)" : "var(--text-muted)",
                      background: item.editable ? "var(--green-bg)" : "#F9FAFB",
                      border: `1px solid ${item.editable ? "var(--green-border)" : "var(--border)"}`,
                      padding: "2px 10px",
                      borderRadius: "var(--radius-full)",
                    }}>
                      {item.note || (item.editable ? "Editable" : "Fixed")}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.type === "error" ? "Update failed" : "Profile updated"} — {toast.msg}
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .profile-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  );
}