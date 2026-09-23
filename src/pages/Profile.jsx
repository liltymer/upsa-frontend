import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useProgrammes } from "../context/ProgrammeContext";
import useReferenceData from "../hooks/useReferenceData";
import API, {
  getErrorMessage,
  startTopUp,
  addPreviousProgramme,
  updateEnrollment,
  deleteEnrollment,
  linkOldAccount,
} from "../services/api";
import { classStyle } from "../utils/academic";

const LEVELS = [100, 200, 300, 400];

// ================================
// ONE PROGRAMME CARD (view + correct details)
// ================================

function ProgrammeCard({ enrollment, programmes, academicYears, canDelete, onSaved, onError }) {
  const [editing, setEditing] = useState(enrollment.needs_review);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    index_number: enrollment.index_number || "",
    programme: enrollment.programme,
    current_level: String(enrollment.current_level),
    start_academic_year: enrollment.start_academic_year,
  });
  const cls = classStyle(enrollment.classification);
  const isDiploma = form.programme.toLowerCase().startsWith("diploma");
  const knownProgramme = programmes.some((p) => p.name === form.programme);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        programme: form.programme,
        current_level: Number(form.current_level),
        start_academic_year: form.start_academic_year,
      };
      if (form.index_number.trim()) body.index_number = form.index_number.trim();
      const data = await updateEnrollment(enrollment.id, body);
      setEditing(false);
      onSaved(data.message);
    } catch (err) {
      onError(getErrorMessage(err, "Failed to update programme."));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm(`Remove ${enrollment.programme}? This only works for a programme with no results.`)) return;
    try {
      const data = await deleteEnrollment(enrollment.id);
      onSaved(data.message);
    } catch (err) {
      onError(getErrorMessage(err, "Failed to remove programme."));
    }
  };

  return (
    <div style={{
      border: `1.5px solid ${enrollment.needs_review ? "var(--amber-border)" : "var(--border)"}`,
      borderRadius: "var(--radius-md)",
      padding: 16,
      background: enrollment.is_current ? "var(--bg-card)" : "var(--bg-page)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 15, color: "var(--navy)" }}>
            {enrollment.programme}
          </p>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
            {enrollment.index_number || "Index number not added"} ·{" "}
            {enrollment.award_type === "diploma" ? "Diploma" : enrollment.is_top_up ? "Degree (Top-up)" : "Degree"} ·{" "}
            {enrollment.completed || !enrollment.is_current ? "Completed" : `Current · ${enrollment.level_label || `Level ${enrollment.current_level}`}`} · from {enrollment.start_academic_year}
          </p>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 22, color: "var(--navy)" }}>
            {enrollment.cgpa.toFixed(2)}
          </p>
          {enrollment.classification && (
            <span className="badge" style={{ background: cls.bg, color: cls.color, border: `1px solid ${cls.border}` }}>
              {enrollment.classification}
            </span>
          )}
        </div>
      </div>

      {enrollment.needs_review && (
        <div className="alert alert-gold" style={{ marginTop: 12 }}>
          We created this record when separating your diploma and degree results. Please confirm the
          programme and add the index number, then save.
        </div>
      )}

      {editing ? (
        <form onSubmit={save} style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          <div className="form-group" style={{ gridColumn: "1 / -1" }}>
            <label className="form-label">Programme</label>
            <select
              value={knownProgramme ? form.programme : ""}
              onChange={(e) => setForm({ ...form, programme: e.target.value })}
              required
              className="form-input form-select"
            >
              {!knownProgramme && <option value="">{form.programme} — choose the exact programme</option>}
              {programmes.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Index Number</label>
            <input className="form-input" value={form.index_number} onChange={(e) => setForm({ ...form, index_number: e.target.value })} placeholder="e.g. 10324631" />
          </div>
          <div className="form-group">
            <label className="form-label">{enrollment.is_current ? "Current Level" : "Final Level"}</label>
            <select className="form-input form-select" value={form.current_level} onChange={(e) => setForm({ ...form, current_level: e.target.value })}>
              {LEVELS.filter((l) => l >= enrollment.entry_level && (!isDiploma || l <= 200)).map((l) => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Started</label>
            <select className="form-input form-select" value={form.start_academic_year} onChange={(e) => setForm({ ...form, start_academic_year: e.target.value })}>
              {[...new Set([form.start_academic_year, ...academicYears])].map((y) => (<option key={y} value={y}>{y}</option>))}
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="submit" disabled={saving} className="btn btn-primary btn-sm">{saving ? "Saving..." : "Save"}</button>
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Correct details</button>
          {canDelete && enrollment.total_results === 0 && (
            <button type="button" className="btn btn-danger btn-sm" onClick={remove}>Remove</button>
          )}
        </div>
      )}
    </div>
  );
}

// ================================
// PAGE
// ================================

export default function Profile() {
  const { user, login, token } = useAuth();
  const { enrollments, current, refresh } = useProgrammes();
  const { programmes, academic_years: academicYears, current_academic_year: currentYear } = useReferenceData();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [preferredName, setPreferredName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [toast, setToast] = useState(null);
  const [panel, setPanel] = useState(""); // "topup" | "previous" | "link"
  const [topUp, setTopUp] = useState({ index_number: "", programme: "", academic_year: "", entry_level: "300" });
  const [previous, setPrevious] = useState({ index_number: "", programme: "", start_academic_year: "" });
  const [link, setLink] = useState({ email: "", password: "" });

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => {
    API.get("/students/me")
      .then((res) => {
        setProfile(res.data);
        setName(res.data.name || "");
        setPreferredName(res.data.preferred_name || "");
      })
      .catch(() => showToast("Failed to load profile.", "error"))
      .finally(() => setLoading(false));
  }, []);

  const afterProgrammeChange = async (message) => {
    await refresh();
    setPanel("");
    showToast(message);
  };

  const run = async (key, action, fallback) => {
    setBusy(key);
    try {
      const data = await action();
      await afterProgrammeChange(data.message);
      return true;
    } catch (err) {
      showToast(getErrorMessage(err, fallback), "error");
      return false;
    } finally {
      setBusy("");
    }
  };

  const saveName = async (e) => {
    e.preventDefault();
    setBusy("name");
    try {
      const res = await API.put("/students/me", { name, preferred_name: preferredName });
      login(token, { ...user, name: res.data.name });
      showToast("Profile updated successfully.");
    } catch (err) {
      showToast(getErrorMessage(err, "Failed to update profile."), "error");
    } finally {
      setBusy("");
    }
  };

  const submitTopUp = async (e) => {
    e.preventDefault();
    if (!window.confirm(
      `Start ${topUp.programme}? ${current?.programme || "Your current programme"} will be marked completed. ` +
      "Its results and CGPA are kept under Academic History."
    )) return;
    const ok = await run("topup", () => startTopUp({ ...topUp, entry_level: Number(topUp.entry_level), academic_year: topUp.academic_year || currentYear }), "Failed to start top-up.");
    if (ok) setTopUp({ index_number: "", programme: "", academic_year: "", entry_level: "300" });
  };

  const submitPrevious = async (e) => {
    e.preventDefault();
    const ok = await run("previous", () => addPreviousProgramme({
      ...previous,
      index_number: previous.index_number.trim() || null,
    }), "Failed to add programme.");
    if (ok) setPrevious({ index_number: "", programme: "", start_academic_year: "" });
  };

  const submitLink = async (e) => {
    e.preventDefault();
    if (!window.confirm(
      `Move everything from ${link.email} into this account? The other account will be closed.`
    )) return;
    const ok = await run("link", () => linkOldAccount(link.email, link.password), "Failed to link account.");
    if (ok) setLink({ email: "", password: "" });
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="spinner spinner-lg spinner-dark" />
      <p>Loading profile...</p>
    </div>
  );

  const degreeProgrammes = programmes.filter((p) => p.award_type === "degree");
  const canStartTopUp = current?.award_type === "diploma";
  const panelButton = (key, label) => (
    <button
      type="button"
      onClick={() => setPanel(panel === key ? "" : key)}
      className={`btn btn-sm ${panel === key ? "btn-primary" : "btn-outline"}`}
    >
      {label}
    </button>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", fontFamily: "var(--font-body)" }}>
      <div className="page-header">
        <div className="header-inner fade-up">
          <p className="page-eyebrow">Account</p>
          <h1 className="page-title">My Profile</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
            Your account and every UPSA programme you have been on
          </p>
        </div>
      </div>

      <div className="page-content" style={{ marginTop: 28, paddingBottom: 60, display: "flex", flexDirection: "column", gap: 24 }}>

        {/* PERSONAL */}
        <div className="card">
          <h3 className="section-title">Personal Information</h3>
          <form onSubmit={saveName} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, alignItems: "end" }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} required minLength={2} />
            </div>
            <div className="form-group">
              <label className="form-label">What should we call you?</label>
              <input className="form-input" value={preferredName} maxLength={60} onChange={(e) => setPreferredName(e.target.value)} placeholder="e.g. Joshua" />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" value={profile?.email || ""} disabled />
            </div>
            <div>
              <button type="submit" disabled={busy === "name"} className="btn btn-primary">
                {busy === "name" ? "Saving..." : "Save"}
              </button>
            </div>
          </form>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 12 }}>
            You can sign in with your email or any of your index numbers. To change your password, use "Forgot password" on the sign-in page.
          </p>
        </div>

        {/* PROGRAMMES */}
        <div className="card">
          <h3 className="section-title">My Programmes</h3>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
            Each programme has its own index number and its own CGPA. Diploma and degree results are never mixed.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {enrollments.map((e) => (
              <ProgrammeCard
                key={`${e.id}-${e.needs_review}`}
                enrollment={e}
                programmes={programmes}
                academicYears={academicYears}
                canDelete={enrollments.length > 1}
                onSaved={afterProgrammeChange}
                onError={(msg) => showToast(msg, "error")}
              />
            ))}
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 20 }}>
            {canStartTopUp && panelButton("topup", "I've started my top-up")}
            {panelButton("previous", "Add a previous programme")}
            {panelButton("link", "Link my old account")}
          </div>

          {panel === "topup" && (
            <form onSubmit={submitTopUp} style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <p style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--text-secondary)" }}>
                Enter your <strong>new</strong> index number. Your diploma will be marked completed and kept, with its own CGPA, under Academic History. Your degree starts at the level you joined (usually 300) with a fresh CGPA.
              </p>
              <div className="form-group">
                <label className="form-label">New Index Number</label>
                <input className="form-input" required value={topUp.index_number} onChange={(e) => setTopUp({ ...topUp, index_number: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Top-up Started</label>
                <select className="form-input form-select" value={topUp.academic_year || currentYear} onChange={(e) => setTopUp({ ...topUp, academic_year: e.target.value })}>
                  {academicYears.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Joined the Degree at</label>
                <select className="form-input form-select" value={topUp.entry_level} onChange={(e) => setTopUp({ ...topUp, entry_level: e.target.value })}>
                  <option value="300">Level 300</option>
                  <option value="200">Level 200</option>
                </select>
              </div>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Degree Programme</label>
                <select className="form-input form-select" required value={topUp.programme} onChange={(e) => setTopUp({ ...topUp, programme: e.target.value })}>
                  <option value="">Select degree...</option>
                  {degreeProgrammes.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                </select>
              </div>
              <div><button type="submit" disabled={busy === "topup"} className="btn btn-primary">{busy === "topup" ? "Starting..." : "Start Top-up"}</button></div>
            </form>
          )}

          {panel === "previous" && (
            <form onSubmit={submitPrevious} style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <p style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--text-secondary)" }}>
                Already on your degree? Add the diploma you completed, then enter its results on the Results page by choosing that programme.
              </p>
              <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                <label className="form-label">Programme</label>
                <select className="form-input form-select" required value={previous.programme} onChange={(e) => setPrevious({ ...previous, programme: e.target.value })}>
                  <option value="">Select programme...</option>
                  {programmes.map((p) => (<option key={p.name} value={p.name}>{p.name}</option>))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Index Number</label>
                <input className="form-input" value={previous.index_number} onChange={(e) => setPrevious({ ...previous, index_number: e.target.value })} placeholder="Optional" />
              </div>
              <div className="form-group">
                <label className="form-label">Started</label>
                <select className="form-input form-select" required value={previous.start_academic_year} onChange={(e) => setPrevious({ ...previous, start_academic_year: e.target.value })}>
                  <option value="">Select year...</option>
                  {academicYears.map((y) => (<option key={y} value={y}>{y}</option>))}
                </select>
              </div>
              <div><button type="submit" disabled={busy === "previous"} className="btn btn-primary">{busy === "previous" ? "Adding..." : "Add Programme"}</button></div>
            </form>
          )}

          {panel === "link" && (
            <form onSubmit={submitLink} style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
              <p style={{ gridColumn: "1 / -1", fontSize: 13, color: "var(--text-secondary)" }}>
                Created a second GradeIQ account for your top-up? Sign in to the other account here to move its programmes and results into this one. The other account is then closed.
              </p>
              <div className="form-group">
                <label className="form-label">Other Account Email</label>
                <input type="email" className="form-input" required value={link.email} onChange={(e) => setLink({ ...link, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Other Account Password</label>
                <input type="password" className="form-input" required autoComplete="off" value={link.password} onChange={(e) => setLink({ ...link, password: e.target.value })} />
              </div>
              <div><button type="submit" disabled={busy === "link"} className="btn btn-primary">{busy === "link" ? "Linking..." : "Link Account"}</button></div>
            </form>
          )}
        </div>
      </div>

      {toast && (
        <div className={`toast ${toast.type === "error" ? "toast-error" : "toast-success"}`}>
          {toast.msg}
        </div>
      )}
    </div>
  );
}
