import { useState } from "react";
import Icon from "../landing/Icon";
import { addResult, getErrorMessage, updateResult } from "../../services/api";
import { SEMESTER_NAMES } from "../../utils/academic";
import { CourseCodeInput, Dialog, GradePicker } from "./ui";

/** Add a single course, or correct any detail of one already recorded. */
export default function CourseDialog({ result, initialTerm, years, catalogue, enrollment, onClose, onSaved }) {
  const editing = Boolean(result);
  const [form, setForm] = useState({
    course_code: result?.course_code || "",
    course_name: result?.course_name || "",
    credit_hours: result?.credit_hours || 3,
    grade: result?.grade || "",
    academic_year: result?.academic_year || initialTerm.year,
    semester: result?.semester || initialTerm.semester,
  });
  const [checked, setChecked] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const set = (patch) => setForm((f) => ({ ...f, ...patch }));

  const missing = {
    code: !form.course_code.trim(),
    name: !form.course_name.trim(),
    grade: !form.grade,
  };

  const save = async (e) => {
    e.preventDefault();
    setChecked(true);
    setError("");
    if (Object.values(missing).some(Boolean)) {
      setError("Fill in the code, title and grade.");
      return;
    }
    const body = {
      course_code: form.course_code.trim().toUpperCase(),
      course_name: form.course_name.trim(),
      credit_hours: Number(form.credit_hours),
      grade: form.grade,
      academic_year: form.academic_year,
      semester: Number(form.semester),
    };
    setSaving(true);
    try {
      if (editing) {
        // Send only what changed
        const changes = Object.fromEntries(Object.entries(body).filter(([k, v]) => v !== result[k]));
        if (Object.keys(changes).length) await updateResult(result.result_id, changes);
        onSaved(`${body.course_code} updated.`);
      } else {
        await addResult({ ...body, enrollment_id: enrollment?.id });
        onSaved(`${body.course_code} added.`);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Could not save. Try again."));
      setSaving(false);
    }
  };

  return (
    <Dialog
      title={editing ? `Edit ${result.course_code}` : "Add one course"}
      subtitle={editing ? "Fix anything that does not match your result slip." : "For a single course, such as a resit or a late result."}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="rs-course-form" className="db-btn" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save changes" : "Add course"}
          </button>
        </>
      )}
    >
      <form id="rs-course-form" className="rs-form" onSubmit={save} noValidate>
        <div className="rs-form-grid">
          <div className="rs-field">
            <label className="rs-label" htmlFor="rs-c-code">Course code</label>
            <CourseCodeInput id="rs-c-code" value={form.course_code} catalogue={catalogue}
              invalid={checked && missing.code}
              onChange={(v) => set({ course_code: v })}
              onPick={(c) => set({ course_code: c.code, course_name: c.name, credit_hours: c.credit_hours })} />
          </div>
          <div className="rs-field rs-credits">
            <label className="rs-label" htmlFor="rs-c-credits">Credits</label>
            <select id="rs-c-credits" className="rs-input" value={form.credit_hours}
              onChange={(e) => set({ credit_hours: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
        <div className="rs-field">
          <label className="rs-label" htmlFor="rs-c-name">Course title</label>
          <input id="rs-c-name" className={`rs-input${checked && missing.name ? " rs-invalid" : ""}`}
            value={form.course_name} maxLength={200} onChange={(e) => set({ course_name: e.target.value })} />
        </div>
        <div className="rs-field">
          <span className="rs-label">Grade</span>
          <GradePicker value={form.grade} onChange={(g) => set({ grade: g })} label="Grade" invalid={checked && missing.grade} />
        </div>
        <div className="rs-form-grid">
          <div className="rs-field">
            <label className="rs-label" htmlFor="rs-c-year">Academic year</label>
            <select id="rs-c-year" className="rs-input" value={form.academic_year}
              onChange={(e) => set({ academic_year: e.target.value })}>
              {years.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div className="rs-field">
            <label className="rs-label" htmlFor="rs-c-sem">Semester</label>
            <select id="rs-c-sem" className="rs-input" value={form.semester}
              onChange={(e) => set({ semester: Number(e.target.value) })}>
              {[1, 2].map((s) => <option key={s} value={s}>{SEMESTER_NAMES[s]}</option>)}
            </select>
          </div>
        </div>
        {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
      </form>
    </Dialog>
  );
}
