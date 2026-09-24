import { useCallback, useEffect, useState } from "react";
import Icon from "../components/landing/Icon";
import { CourseCodeInput, Dialog, Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/admin/admin.css";
import useReferenceData from "../hooks/useReferenceData";
import { getErrorMessage } from "../services/api";
import { addOffering, getAdminCourses, getOfferings, setOfferingHidden, updateCourse } from "../services/admin";
import { SEMESTER_NAMES } from "../utils/academic";

export default function AdminCourses() {
  const [tab, setTab] = useState("lists");
  const [catalogue, setCatalogue] = useState([]);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);
  const reloadCatalogue = useCallback(() => getAdminCourses().then((d) => setCatalogue(d.courses)).catch(() => {}), []);

  useEffect(() => {
    let active = true;
    getAdminCourses().then((d) => active && setCatalogue(d.courses)).catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="db rs ad">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Admin</p>
          <h1 className="db-title">Courses</h1>
          <p className="db-meta">What students get pre-filled when they add a semester, and the catalogue behind it.</p>
        </div>
      </header>

      <div className="ad-tabs" role="tablist" aria-label="Course tools">
        {[["lists", "Programme course lists"], ["catalogue", `Catalogue (${catalogue.length})`]].map(([key, label]) => (
          <button key={key} type="button" role="tab" aria-selected={tab === key} className={tab === key ? "on" : ""} onClick={() => setTab(key)}>{label}</button>
        ))}
      </div>

      {tab === "lists"
        ? <CourseLists catalogue={catalogue} onChange={reloadCatalogue} notify={setToast} />
        : <Catalogue catalogue={catalogue} onChange={reloadCatalogue} notify={setToast} />}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}

// ---------- Programme course lists ----------

function CourseLists({ catalogue, onChange, notify }) {
  const { programmes } = useReferenceData();
  const [programme, setProgramme] = useState("Bachelor of Science in Information Technology");
  const [level, setLevel] = useState(300);
  const [semester, setSemester] = useState(1);
  const [data, setData] = useState(null);
  const [adding, setAdding] = useState(false);
  const isDiploma = programme.toLowerCase().startsWith("diploma");
  const levels = isDiploma ? [100, 200] : [100, 200, 300, 400];
  const safeLevel = levels.includes(level) ? level : levels[0];

  const load = useCallback(() => getOfferings(programme, safeLevel, semester)
    .then(setData)
    .catch((err) => notify({ msg: getErrorMessage(err, "Could not load the list."), type: "error" })), [programme, safeLevel, semester, notify]);

  useEffect(() => {
    let active = true;
    getOfferings(programme, safeLevel, semester)
      .then((d) => active && setData(d))
      .catch((err) => active && notify({ msg: getErrorMessage(err, "Could not load the list."), type: "error" }));
    return () => { active = false; };
  }, [programme, safeLevel, semester, notify]);

  const act = async (fn) => {
    try {
      const res = await fn();
      await load();
      onChange();
      notify({ msg: res.message });
    } catch (err) {
      notify({ msg: getErrorMessage(err, "That did not work."), type: "error" });
    }
  };
  const where = { programme, level: safeLevel, semester };
  const visible = data?.listed.filter((o) => !o.hidden) || [];
  const hidden = data?.listed.filter((o) => o.hidden) || [];

  return (
    <>
      <section className="db-card">
        <div className="ad-picker">
          <div className="rs-field">
            <label className="rs-label" htmlFor="ad-prog">Programme</label>
            <select id="ad-prog" className="rs-input" value={programme} onChange={(e) => setProgramme(e.target.value)}>
              {programmes.map((p) => <option key={p.name} value={p.name}>{p.name}</option>)}
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="ad-level">Level</label>
            <select id="ad-level" className="rs-input" value={safeLevel} onChange={(e) => setLevel(Number(e.target.value))}>
              {levels.map((l) => <option key={l} value={l}>Level {l}</option>)}
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="ad-sem">Semester</label>
            <select id="ad-sem" className="rs-input" value={semester} onChange={(e) => setSemester(Number(e.target.value))}>
              {[1, 2].map((s) => <option key={s} value={s}>{SEMESTER_NAMES[s]}</option>)}
            </select>
          </div>
        </div>

        <div className="db-card-head">
          <h2 className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="layers" size={16} /></span>
            Pre-filled for students ({visible.length})
          </h2>
          <button type="button" className="db-btn db-btn-sm" onClick={() => setAdding(true)}><Icon name="plus" size={16} /> Add a course</button>
        </div>
        {!data ? <p className="ad-muted">Loading...</p> : visible.length ? (
          <ul className="ad-list">
            {visible.map((o) => (
              <li key={o.id}>
                <div>
                  <strong>{o.course_code}</strong> {o.course_name}
                  <small>
                    {o.credit_hours ?? "?"} credits{!o.credits_confirmed && " (not confirmed)"}
                    {o.students > 0 && ` · entered by ${o.students} student${o.students === 1 ? "" : "s"}`}
                    {` · from ${o.source === "timetable" ? "UPSA timetable" : "an admin"}`}
                  </small>
                </div>
                <button type="button" className="db-btn db-btn-ghost db-btn-sm" onClick={() => act(() => setOfferingHidden(o.id, true))}>Hide</button>
              </li>
            ))}
          </ul>
        ) : <p className="ad-muted">Nothing is pre-filled for this semester yet. Students type their courses, and what they enter appears below.</p>}
      </section>

      <section className="db-card">
        <div className="db-card-head">
          <h2 className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="user" size={16} /></span>
            Entered by students, not on the list ({data?.from_students.length ?? 0})
          </h2>
        </div>
        <p className="ad-muted" style={{ marginBottom: 12 }}>Courses become suggestions on their own once two students enter them. Add one now, or ignore it so it is never suggested.</p>
        {data?.from_students.length ? (
          <ul className="ad-list">
            {data.from_students.map((c) => (
              <li key={c.course_code}>
                <div>
                  <strong>{c.course_code}</strong> {c.name}
                  <small>{c.credit_hours} credits · entered by {c.students} student{c.students === 1 ? "" : "s"}</small>
                </div>
                <button type="button" className="db-btn db-btn-ghost db-btn-sm"
                  onClick={() => act(() => addOffering({ ...where, course_code: c.course_code, hidden: true }))}>Ignore</button>
                <button type="button" className="db-btn db-btn-sm"
                  onClick={() => act(() => addOffering({ ...where, course_code: c.course_code, course_name: c.name, credit_hours: c.credit_hours }))}>Add</button>
              </li>
            ))}
          </ul>
        ) : <p className="ad-muted">Nothing new from students for this semester.</p>}
      </section>

      {hidden.length > 0 && (
        <section className="db-card">
          <div className="db-card-head">
            <h2 className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="eyeOff" size={16} /></span>
              Hidden ({hidden.length})
            </h2>
          </div>
          <ul className="ad-list">
            {hidden.map((o) => (
              <li key={o.id} className="hidden">
                <div><strong>{o.course_code}</strong> {o.course_name}<small>Not suggested to students</small></div>
                <button type="button" className="db-btn db-btn-ghost db-btn-sm" onClick={() => act(() => setOfferingHidden(o.id, false))}>Show again</button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {adding && (
        <AddCourseDialog catalogue={catalogue} where={where} onClose={() => setAdding(false)}
          onDone={async (msg) => { setAdding(false); await load(); onChange(); notify({ msg }); }} />
      )}
    </>
  );
}

function AddCourseDialog({ catalogue, where, onClose, onDone }) {
  const [form, setForm] = useState({ course_code: "", course_name: "", credit_hours: 3 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const known = catalogue.some((c) => c.code === form.course_code.trim().toUpperCase());
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await addOffering({ ...where, course_code: form.course_code.trim(), ...(known ? {} : { course_name: form.course_name.trim(), credit_hours: Number(form.credit_hours) }) });
      onDone(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not add the course."));
      setBusy(false);
    }
  };
  return (
    <Dialog title="Add a course to this list" subtitle={`${where.programme}, Level ${where.level}, ${SEMESTER_NAMES[where.semester]}`} onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="ad-add" className="db-btn" disabled={busy || !form.course_code.trim()}>{busy ? "Adding..." : "Add course"}</button>
        </>
      )}>
      <form id="ad-add" className="rs-form" onSubmit={submit}>
        <div className="rs-field">
          <label className="rs-label" htmlFor="ad-code">Course code</label>
          <CourseCodeInput id="ad-code" value={form.course_code} catalogue={catalogue}
            onChange={(v) => setForm({ ...form, course_code: v })}
            onPick={(c) => setForm({ course_code: c.code, course_name: c.name, credit_hours: c.credit_hours })} />
        </div>
        {!known && form.course_code.trim().length >= 3 && (
          <>
            <p className="rs-note"><Icon name="info" size={18} /><span>This code is not in the catalogue yet, so it will be added with the title and credits below.</span></p>
            <div className="rs-field">
              <label className="rs-label" htmlFor="ad-name">Course title</label>
              <input id="ad-name" className="rs-input" required value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} />
            </div>
            <div className="rs-field">
              <label className="rs-label" htmlFor="ad-cr">Credits</label>
              <select id="ad-cr" className="rs-input" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: e.target.value })}>
                {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </>
        )}
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}

// ---------- Catalogue ----------

function Catalogue({ catalogue, onChange, notify }) {
  const [query, setQuery] = useState("");
  const [onlyUnconfirmed, setOnlyUnconfirmed] = useState(false);
  const [editing, setEditing] = useState(null);
  const q = query.trim().toLowerCase();
  const shown = catalogue.filter((c) => (!onlyUnconfirmed || c.source === "timetable")
    && (!q || c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)));
  const unconfirmed = catalogue.filter((c) => c.source === "timetable").length;

  return (
    <section className="db-card">
      <div className="ad-toolbar">
        <label className="rs-search">
          <Icon name="search" size={18} />
          <span className="db-sr">Search courses</span>
          <input type="search" placeholder="Search by code or title" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
        <div className="ad-tabs" role="group" aria-label="Filter">
          <button type="button" aria-pressed={!onlyUnconfirmed} className={!onlyUnconfirmed ? "on" : ""} onClick={() => setOnlyUnconfirmed(false)}>All</button>
          <button type="button" aria-pressed={onlyUnconfirmed} className={onlyUnconfirmed ? "on" : ""} onClick={() => setOnlyUnconfirmed(true)}>Credits not confirmed ({unconfirmed})</button>
        </div>
      </div>
      <div className="ad-table-wrap">
        <table className="ad-table">
          <thead>
            <tr>
              <th scope="col">Course</th>
              <th scope="col" className="ad-hide-sm">Level</th>
              <th scope="col" className="ad-num">Credits</th>
              <th scope="col"><span className="db-sr">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {shown.slice(0, 200).map((c) => (
              <tr key={c.id}>
                <td><strong>{c.code}</strong><small>{c.name}</small></td>
                <td className="ad-hide-sm">{c.level ? `${c.level}${c.semester ? `, ${SEMESTER_NAMES[c.semester]}` : ""}` : "-"}</td>
                <td className="ad-num">
                  {c.credit_hours}{" "}
                  {c.source === "timetable" && <span className="ad-pill ad-pill-gold" title="From the timetable, which does not list credits">check</span>}
                </td>
                <td className="ad-actions">
                  <button type="button" className="db-btn db-btn-ghost db-btn-sm" onClick={() => setEditing(c)}><Icon name="pencil" size={16} /> Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="ad-count">{shown.length > 200 ? `Showing 200 of ${shown.length}. Search to narrow it down.` : `${shown.length} course${shown.length === 1 ? "" : "s"}`}</p>
      {editing && (
        <EditCourseDialog course={editing} onClose={() => setEditing(null)}
          onDone={async (msg) => { setEditing(null); await onChange(); notify({ msg }); }} />
      )}
    </section>
  );
}

function EditCourseDialog({ course, onClose, onDone }) {
  const [form, setForm] = useState({ name: course.name, credit_hours: course.credit_hours, level: course.level || 100, semester: course.semester || 1 });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await updateCourse(course.id, { ...form, name: form.name.trim(), credit_hours: Number(form.credit_hours), level: Number(form.level), semester: Number(form.semester) });
      onDone(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save the course."));
      setBusy(false);
    }
  };
  return (
    <Dialog title={`Edit ${course.code}`} subtitle="Saving confirms the credits, so students see them as checked." onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="ad-edit" className="db-btn" disabled={busy}>{busy ? "Saving..." : "Save and confirm"}</button>
        </>
      )}>
      <form id="ad-edit" className="rs-form" onSubmit={submit}>
        <div className="rs-field">
          <label className="rs-label" htmlFor="ad-e-name">Course title</label>
          <input id="ad-e-name" className="rs-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="rs-form-grid" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
          <div className="rs-field">
            <label className="rs-label" htmlFor="ad-e-cr">Credits</label>
            <select id="ad-e-cr" className="rs-input" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: e.target.value })}>
              {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="ad-e-lv">Level</label>
            <select id="ad-e-lv" className="rs-input" value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
              {[100, 200, 300, 400].map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="ad-e-sem">Semester</label>
            <select id="ad-e-sem" className="rs-input" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })}>
              {[1, 2].map((s) => <option key={s} value={s}>{SEMESTER_NAMES[s]}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}
