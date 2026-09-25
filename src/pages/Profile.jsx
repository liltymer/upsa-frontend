import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import { PasswordField, PasswordStrength } from "../components/auth/fields";
import { Dialog, Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/auth/auth.css";
import "../components/profile/profile.css";
import { useAuth } from "../context/AuthContext";
import { useProgrammes } from "../context/ProgrammeContext";
import useReferenceData from "../hooks/useReferenceData";
import API, {
  addPreviousProgramme, changePassword, deleteEnrollment, deleteMyAccount, getErrorMessage, getMyResults,
  linkOldAccount, startTopUp, updateEnrollment,
} from "../services/api";
import { isStrongPassword, passwordChecks, passwordScore } from "../utils/password";
import { topUpLevel } from "../utils/upsaRules";

const LEVELS = [100, 200, 300, 400];
const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
const awardLabel = (e) => (e.award_type === "diploma" ? "Diploma" : e.is_top_up ? "Degree (top-up)" : "Degree");

// ---------- Download my results (CSV) ----------
const csvCell = (v) => {
  const text = v == null ? "" : String(v);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};
async function downloadResultsCsv(enrollments, fileLabel) {
  const header = ["Programme", "Award", "Index number", "Academic year", "Semester", "Level", "Course code", "Course title", "Credits", "Grade", "Grade point"];
  const rows = [header];
  for (const e of enrollments) {
    const data = await getMyResults(e.id);
    (data.results || []).forEach((r) => rows.push([
      e.programme, awardLabel(e), e.index_number, r.academic_year, r.semester, r.level,
      r.course_code, r.course_name, r.credit_hours, r.grade, r.grade_point,
    ]));
  }
  const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `gradeiq-results-${fileLabel}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Correct a programme's details. */
function ProgrammeDialog({ enrollment, programmes, academicYears, onClose, onDone }) {
  const [form, setForm] = useState({
    index_number: enrollment.index_number || "",
    programme: enrollment.programme,
    current_level: String(enrollment.current_level),
    start_academic_year: enrollment.start_academic_year,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const isDiploma = form.programme.toLowerCase().startsWith("diploma");
  const known = programmes.some((p) => p.name === form.programme);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { programme: form.programme, current_level: Number(form.current_level), start_academic_year: form.start_academic_year };
      if (form.index_number.trim()) body.index_number = form.index_number.trim();
      const data = await updateEnrollment(enrollment.id, body);
      onDone(data.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the changes."));
      setSaving(false);
    }
  };

  return (
    <Dialog title="Correct programme details" subtitle={enrollment.programme} onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="pf-prog-form" className="db-btn" disabled={saving}>{saving ? "Saving..." : "Save changes"}</button>
        </>
      )}>
      <form id="pf-prog-form" className="rs-form" onSubmit={save}>
        <div className="rs-field">
          <label className="rs-label" htmlFor="pf-prog">Programme</label>
          <select id="pf-prog" className="rs-input" value={known ? form.programme : ""} required
            onChange={(e) => setForm({ ...form, programme: e.target.value })}>
            {!known && <option value="">{form.programme} (choose the exact programme)</option>}
            {programmes.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="pf-form-grid">
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-index">Index number</label>
            <input id="pf-index" className="rs-input" value={form.index_number} placeholder="e.g. 10324631"
              onChange={(e) => setForm({ ...form, index_number: e.target.value })} />
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-level">{enrollment.is_current ? "Current level" : "Final level"}</label>
            <select id="pf-level" className="rs-input" value={form.current_level} onChange={(e) => setForm({ ...form, current_level: e.target.value })}>
              {LEVELS.filter((l) => l >= enrollment.entry_level && (!isDiploma || l <= 200)).map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-start">Started</label>
            <select id="pf-start" className="rs-input" value={form.start_academic_year} onChange={(e) => setForm({ ...form, start_academic_year: e.target.value })}>
              {[...new Set([form.start_academic_year, ...academicYears])].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, login, logout, token } = useAuth();
  const { enrollments, current, refresh } = useProgrammes();
  const { programmes, academic_years: academicYears, current_academic_year: currentYear } = useReferenceData();

  const [profile, setProfile] = useState(null);
  const [details, setDetails] = useState({ name: "", preferred_name: "" });
  const [savingDetails, setSavingDetails] = useState(false);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let active = true;
    API.get("/students/me")
      .then((res) => {
        if (!active) return;
        setProfile(res.data);
        setDetails({ name: res.data.name || "", preferred_name: res.data.preferred_name || "" });
      })
      .catch(() => active && setToast({ msg: "Could not load your profile.", type: "error" }));
    return () => { active = false; };
  }, []);

  const done = async (msg) => {
    setDialog(null);
    await refresh();
    setToast({ msg });
  };

  const saveDetails = async (e) => {
    e.preventDefault();
    setSavingDetails(true);
    try {
      const res = await API.put("/students/me", details);
      login(token, { ...user, name: res.data.name });
      setProfile(res.data);
      setToast({ msg: "Details saved." });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "Could not save your details."), type: "error" });
    } finally {
      setSavingDetails(false);
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      await downloadResultsCsv(enrollments, current?.index_number || "student");
      setToast({ msg: "Your results were downloaded." });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "Could not prepare the download."), type: "error" });
    } finally {
      setDownloading(false);
    }
  };

  if (!profile) {
    return <PageSkeleton variant="form" label="Loading your profile" />;
  }

  const journey = [...enrollments].sort((a, b) => a.start_academic_year.localeCompare(b.start_academic_year) || a.entry_level - b.entry_level);
  const canTopUp = current?.award_type === "diploma" && !enrollments.some((e) => e.award_type === "degree");

  return (
    <div className="db rs pf">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Profile</p>
          <h1 className="db-title">Your account</h1>
          <p className="db-meta">Your details, your UPSA programmes, and control over your data.</p>
        </div>
      </header>

      {/* ---------- Identity ---------- */}
      <section className="pf-hero" aria-label="Account summary">
        <span className="pf-avatar" aria-hidden="true">{initials(profile.name)}</span>
        <div className="pf-hero-text">
          <h2>{profile.name}</h2>
          <p>{profile.email}</p>
          <div className="pf-chips">
            {current && <span>{current.programme}</span>}
            <span>{enrollments.length} programme{enrollments.length === 1 ? "" : "s"} on record</span>
            {profile.role === "admin" && <span className="pf-chip-gold">Admin</span>}
          </div>
        </div>
      </section>

      <div className="pf-grid">
        {/* ---------- Personal details ---------- */}
        <section className="db-card" aria-labelledby="pf-details">
          <div className="db-card-head">
            <h2 id="pf-details" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="user" size={16} /></span>
              Personal details
            </h2>
          </div>
          <form className="rs-form" onSubmit={saveDetails}>
            <div className="rs-field">
              <label className="rs-label" htmlFor="pf-name">Full name</label>
              <input id="pf-name" className="rs-input" required minLength={2} maxLength={120} value={details.name}
                onChange={(e) => setDetails({ ...details, name: e.target.value })} />
            </div>
            <div className="rs-field">
              <label className="rs-label" htmlFor="pf-pref">What should we call you?</label>
              <input id="pf-pref" className="rs-input" maxLength={60} placeholder="e.g. Joshua" value={details.preferred_name}
                onChange={(e) => setDetails({ ...details, preferred_name: e.target.value })} />
              <p className="pf-hint">Used in your dashboard greeting.</p>
            </div>
            <div className="rs-field">
              <label className="rs-label" htmlFor="pf-email">Email</label>
              <input id="pf-email" className="rs-input" value={profile.email} disabled />
            </div>
            <div><button type="submit" className="db-btn" disabled={savingDetails}>{savingDetails ? "Saving..." : "Save details"}</button></div>
          </form>
        </section>

        {/* ---------- Security ---------- */}
        <SecurityCard email={profile.email} name={profile.name} onDone={(msg) => setToast({ msg })} />
      </div>

      {/* ---------- UPSA journey ---------- */}
      <section className="db-card" aria-labelledby="pf-journey">
        <div className="db-card-head">
          <h2 id="pf-journey" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="layers" size={16} /></span>
            Your UPSA journey
          </h2>
        </div>
        <p className="pf-lead">Each programme has its own index number and its own CGPA. Diploma and degree results are never mixed.</p>
        <ol className="pf-timeline">
          {journey.map((e) => (
            <li key={e.id} className={`pf-step${e.is_current ? " current" : ""}${e.needs_review ? " review" : ""}`}>
              <span className="pf-dot" aria-hidden="true">{e.is_current ? <Icon name="dot" size={14} /> : <Icon name="check" size={14} strokeWidth={3} />}</span>
              <div className="pf-step-card">
                <div className="pf-step-top">
                  <div className="pf-step-name">
                    <span className="pf-step-kicker">{awardLabel(e)} · {e.is_current && !e.completed ? "Current" : "Completed"}</span>
                    <strong>{e.programme}</strong>
                    <span>{e.index_number || "Index number not added"} · {e.level_label || `Level ${e.current_level}`} · from {e.start_academic_year}</span>
                  </div>
                  <div className="pf-step-score">
                    <strong>{e.cgpa.toFixed(2)}</strong>
                    {e.classification && <span>{e.classification}</span>}
                  </div>
                </div>
                {e.needs_review && (
                  <p className="rs-note rs-note-gold"><Icon name="alert" size={18} /><span>We created this record when separating your diploma and degree results. Confirm the programme and add its index number.</span></p>
                )}
                <div className="pf-step-actions">
                  <button type="button" className="db-btn db-btn-ghost db-btn-sm" onClick={() => setDialog({ type: "programme", enrollment: e })}>
                    <Icon name="pencil" size={16} /> Correct details
                  </button>
                  {enrollments.length > 1 && e.total_results === 0 && (
                    <button type="button" className="db-btn db-btn-ghost db-btn-sm pf-danger-text" onClick={() => setDialog({ type: "remove", enrollment: e })}>
                      <Icon name="trash" size={16} /> Remove
                    </button>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ol>
        <div className="pf-journey-actions">
          {canTopUp && (
            <button type="button" className="pf-action pf-action-main" onClick={() => setDialog({ type: "topup" })}>
              <Icon name="arrowUp" size={20} />
              <span><strong>I've started my top-up</strong><small>Add your degree with its new index number</small></span>
            </button>
          )}
          <button type="button" className="pf-action" onClick={() => setDialog({ type: "previous" })}>
            <Icon name="plus" size={20} />
            <span><strong>Add a previous programme</strong><small>For example the diploma you finished</small></span>
          </button>
          <button type="button" className="pf-action" onClick={() => setDialog({ type: "link" })}>
            <Icon name="swap" size={20} />
            <span><strong>Link my old account</strong><small>Bring a second GradeIQ account into this one</small></span>
          </button>
        </div>
      </section>

      {/* ---------- Your data ---------- */}
      <section className="db-card" aria-labelledby="pf-data">
        <div className="db-card-head">
          <h2 id="pf-data" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="shield" size={16} /></span>
            Your data
          </h2>
        </div>
        <div className="pf-data">
          <div className="pf-data-row">
            <span className="pf-data-icon"><Icon name="arrowDown" size={20} /></span>
            <div>
              <strong>Download my results</strong>
              <p>Every programme and course in one CSV file. Opens in Excel or Google Sheets.</p>
            </div>
            <button type="button" className="db-btn db-btn-ghost" onClick={download} disabled={downloading}>{downloading ? "Preparing..." : "Download CSV"}</button>
          </div>
          {profile.role !== "admin" && (
            <div className="pf-data-row pf-data-danger">
              <span className="pf-data-icon"><Icon name="trash" size={20} /></span>
              <div>
                <strong>Delete my account</strong>
                <p>Permanently removes your account, programmes and results. This cannot be undone.</p>
              </div>
              <button type="button" className="db-btn rs-btn-danger" onClick={() => setDialog({ type: "delete" })}>Delete account</button>
            </div>
          )}
        </div>
      </section>

      {/* ---------- Dialogs ---------- */}
      {dialog?.type === "programme" && (
        <ProgrammeDialog enrollment={dialog.enrollment} programmes={programmes} academicYears={academicYears}
          onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog?.type === "remove" && (
        <ConfirmDialog title={`Remove ${dialog.enrollment.programme}?`} danger
          text="This programme has no results, so nothing else is lost."
          action="Remove programme" onClose={() => setDialog(null)}
          onConfirm={async () => done((await deleteEnrollment(dialog.enrollment.id)).message)} />
      )}
      {dialog?.type === "topup" && (
        <TopUpDialog diploma={current} programmes={programmes.filter((p) => p.award_type === "degree")}
          academicYears={academicYears} currentYear={currentYear} onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog?.type === "previous" && (
        <PreviousDialog programmes={programmes} academicYears={academicYears} onClose={() => setDialog(null)} onDone={done} />
      )}
      {dialog?.type === "link" && <LinkDialog onClose={() => setDialog(null)} onDone={done} />}
      {dialog?.type === "delete" && (
        <DeleteDialog onClose={() => setDialog(null)} onDeleted={() => { logout(); navigate("/", { replace: true }); }} />
      )}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}

/** Change the password while signed in. */
function SecurityCard({ email, name, onDone }) {
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const checks = passwordChecks(form.next, { email, name });
  const mismatch = form.confirm && form.confirm !== form.next;

  const save = async (e) => {
    e.preventDefault();
    setError("");
    if (!isStrongPassword(form.next, { email, name })) { setError("Your new password does not meet all the rules yet."); return; }
    if (form.next !== form.confirm) { setError("The two new passwords do not match."); return; }
    setSaving(true);
    try {
      const res = await changePassword(form.current, form.next);
      setForm({ current: "", next: "", confirm: "" });
      onDone(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not change your password."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="db-card pf-security" aria-labelledby="pf-sec">
      <div className="db-card-head">
        <h2 id="pf-sec" className="db-h2">
          <span className="db-h2-icon" aria-hidden="true"><Icon name="shield" size={16} /></span>
          Password and sign-in
        </h2>
      </div>
      <p className="pf-hint pf-signin"><Icon name="info" size={16} /> You can sign in with your email or any of your index numbers.</p>
      <form className="rs-form" onSubmit={save} noValidate>
        <PasswordField id="pf-cur" label="Current password" autoComplete="current-password" value={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.value })} required />
        <PasswordField id="pf-new" label="New password" autoComplete="new-password" value={form.next}
          onChange={(e) => setForm({ ...form, next: e.target.value })} required>
          {form.next && <PasswordStrength checks={checks} score={passwordScore(form.next, { email, name })} />}
        </PasswordField>
        <PasswordField id="pf-conf" label="Repeat new password" autoComplete="new-password" value={form.confirm}
          error={mismatch ? "The passwords do not match." : ""} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
        <div><button type="submit" className="db-btn" disabled={saving || !form.current}>{saving ? "Changing..." : "Change password"}</button></div>
      </form>
    </section>
  );
}

function ConfirmDialog({ title, text, action, danger, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <Dialog title={title} subtitle={text} onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className={`db-btn${danger ? " rs-btn-danger" : ""}`} disabled={busy}
            onClick={async () => { setBusy(true); try { await onConfirm(); } catch (err) { setError(getErrorMessage(err, "That did not work.")); setBusy(false); } }}>
            {busy ? "Working..." : action}
          </button>
        </>
      )}>
      {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
    </Dialog>
  );
}

/** Start the degree top-up. The entry level is suggested from the diploma FCGPA (handbook 2.24). */
function TopUpDialog({ diploma, programmes, academicYears, currentYear, onClose, onDone }) {
  const suggested = topUpLevel(diploma?.cgpa ?? 0) || 200;
  const [form, setForm] = useState({ index_number: "", programme: "", academic_year: currentYear, entry_level: String(suggested) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await startTopUp({ ...form, index_number: form.index_number.trim(), entry_level: Number(form.entry_level) });
      onDone(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not start the top-up."));
      setBusy(false);
    }
  };
  return (
    <Dialog title="Start your top-up" subtitle={`${diploma?.programme} will be marked completed and kept, with its own CGPA.`} onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="pf-topup" className="db-btn" disabled={busy}>{busy ? "Starting..." : "Start top-up"}</button>
        </>
      )}>
      <form id="pf-topup" className="rs-form" onSubmit={submit}>
        <p className="rs-note"><Icon name="info" size={18} /><span>
          With a diploma FCGPA of <strong>{diploma?.cgpa?.toFixed(2)}</strong>, UPSA's rule (handbook 2.24) places you at <strong>Level {suggested}</strong>. Change it if your admission letter says otherwise.
        </span></p>
        <div className="rs-field">
          <label className="rs-label" htmlFor="pf-t-prog">Degree programme</label>
          <select id="pf-t-prog" className="rs-input" required value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })}>
            <option value="">Select your degree...</option>
            {programmes.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="pf-form-grid">
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-t-index">New index number</label>
            <input id="pf-t-index" className="rs-input" required value={form.index_number} onChange={(e) => setForm({ ...form, index_number: e.target.value })} />
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-t-level">Joined at</label>
            <select id="pf-t-level" className="rs-input" value={form.entry_level} onChange={(e) => setForm({ ...form, entry_level: e.target.value })}>
              <option value="300">Level 300</option>
              <option value="200">Level 200</option>
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-t-year">Started</label>
            <select id="pf-t-year" className="rs-input" value={form.academic_year} onChange={(e) => setForm({ ...form, academic_year: e.target.value })}>
              {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}

function PreviousDialog({ programmes, academicYears, onClose, onDone }) {
  const [form, setForm] = useState({ programme: "", index_number: "", start_academic_year: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await addPreviousProgramme({ ...form, index_number: form.index_number.trim() || null });
      onDone(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not add the programme."));
      setBusy(false);
    }
  };
  return (
    <Dialog title="Add a previous programme" subtitle="Already on your degree? Add the diploma you completed, then enter its results by choosing it in the sidebar." onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="pf-prev" className="db-btn" disabled={busy}>{busy ? "Adding..." : "Add programme"}</button>
        </>
      )}>
      <form id="pf-prev" className="rs-form" onSubmit={submit}>
        <div className="rs-field">
          <label className="rs-label" htmlFor="pf-p-prog">Programme</label>
          <select id="pf-p-prog" className="rs-input" required value={form.programme} onChange={(e) => setForm({ ...form, programme: e.target.value })}>
            <option value="">Select programme...</option>
            {programmes.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="pf-form-grid">
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-p-index">Index number</label>
            <input id="pf-p-index" className="rs-input" placeholder="Optional" value={form.index_number} onChange={(e) => setForm({ ...form, index_number: e.target.value })} />
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="pf-p-start">Started</label>
            <select id="pf-p-start" className="rs-input" required value={form.start_academic_year} onChange={(e) => setForm({ ...form, start_academic_year: e.target.value })}>
              <option value="">Select year...</option>
              {academicYears.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}

function LinkDialog({ onClose, onDone }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await linkOldAccount(form.email.trim(), form.password);
      onDone(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not link that account."));
      setBusy(false);
    }
  };
  return (
    <Dialog title="Link my old account" subtitle="Created a second GradeIQ account for your top-up? Sign in to it here. Its programmes and results move into this account, and the other account is closed." onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="pf-link" className="db-btn" disabled={busy}>{busy ? "Linking..." : "Link account"}</button>
        </>
      )}>
      <form id="pf-link" className="rs-form" onSubmit={submit}>
        <div className="rs-field">
          <label className="rs-label" htmlFor="pf-l-email">Other account email</label>
          <input id="pf-l-email" type="email" className="rs-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </div>
        <PasswordField id="pf-l-pass" label="Other account password" autoComplete="off" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}

function DeleteDialog({ onClose, onDeleted }) {
  const [password, setPassword] = useState("");
  const [word, setWord] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ready = password && word === "DELETE";
  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    setError("");
    try {
      await deleteMyAccount(password);
      onDeleted();
    } catch (err) {
      setError(getErrorMessage(err, "Could not delete your account."));
      setBusy(false);
    }
  };
  return (
    <Dialog title="Delete your account?" subtitle="Your account, every programme and every result are removed for good. Download your results first if you want a copy." onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Keep my account</button>
          <button type="submit" form="pf-del" className="db-btn rs-btn-danger" disabled={!ready || busy}>{busy ? "Deleting..." : "Delete forever"}</button>
        </>
      )}>
      <form id="pf-del" className="rs-form" onSubmit={submit}>
        <PasswordField id="pf-d-pass" label="Your password" autoComplete="current-password" value={password}
          onChange={(e) => setPassword(e.target.value)} required />
        <div className="rs-field">
          <label className="rs-label" htmlFor="pf-d-word">Type DELETE to confirm</label>
          <input id="pf-d-word" className="rs-input" autoComplete="off" value={word} onChange={(e) => setWord(e.target.value)} />
        </div>
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}
