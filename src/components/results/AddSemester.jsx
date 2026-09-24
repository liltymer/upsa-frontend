import { useMemo, useState } from "react";
import Icon from "../landing/Icon";
import { addSemester, getCourseSuggestions, getErrorMessage } from "../../services/api";
import { SEMESTER_NAMES, classifyWithBands, semesterTitle, truncateGpa } from "../../utils/academic";
import { CourseCodeInput, Dialog, GradePicker } from "./ui";

let nextKey = 1;
const blankRow = () => ({ key: nextKey++, course_code: "", course_name: "", credit_hours: 3, grade: "", suggested: false });
const isBlank = (r) => !r.course_code.trim() && !r.course_name.trim() && !r.grade;

/**
 * Add every course from one result slip. The semester's usual courses are filled in
 * from UPSA's timetables and what other students on the programme recorded, so most
 * students only tap a grade per course.
 */
export default function AddSemester({
  enrollment, enrollmentId, semesters, catalogue, gradePoints, years, initialTerm, onClose, onSaved,
}) {
  const [step, setStep] = useState("pick");
  const [year, setYear] = useState(initialTerm.year);
  const [semester, setSemester] = useState(initialTerm.semester);
  const [loadedTerm, setLoadedTerm] = useState(null);
  const [rows, setRows] = useState([]);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [checked, setChecked] = useState(false);
  const [error, setError] = useState("");

  const existing = semesters.find((s) => s.academic_year === year && s.semester === Number(semester));
  const existingCodes = useMemo(() => new Set((existing?.results || []).map((r) => r.course_code)), [existing]);

  const loadCourses = async () => {
    const term = `${year}-${semester}`;
    setError("");
    if (loadedTerm === term) { setStep("rows"); return; }
    setLoading(true);
    try {
      const data = await getCourseSuggestions(year, Number(semester), enrollmentId);
      const suggested = data.courses
        .filter((c) => !c.recorded_before && !existingCodes.has(c.course_code))
        .map((c) => ({ ...blankRow(), ...c, grade: "", suggested: true }));
      setRows(suggested.length ? suggested : [blankRow(), blankRow()]);
      setInfo({ level: data.level, count: suggested.length, unconfirmed: suggested.some((c) => !c.credits_confirmed) });
    } catch {
      // Suggestions are a convenience: carry on with empty rows
      setRows([blankRow(), blankRow()]);
      setInfo({ level: null, count: 0, unconfirmed: false });
    } finally {
      setLoadedTerm(term);
      setLoading(false);
      setStep("rows");
    }
  };

  const update = (key, patch) => {
    setError("");
    setRows((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };
  const remove = (key) => setRows((rs) => rs.filter((r) => r.key !== key));

  const filled = rows.filter((r) => !isBlank(r));
  const problems = useMemo(() => {
    const seen = new Map();
    const out = {};
    filled.forEach((r) => {
      const code = r.course_code.trim().toUpperCase();
      const p = [];
      if (!code) p.push("code");
      if (!r.course_name.trim()) p.push("name");
      if (!r.grade) p.push("grade");
      if (code && (seen.has(code) || existingCodes.has(code))) p.push("duplicate");
      seen.set(code, r.key);
      if (p.length) out[r.key] = p;
    });
    return out;
  }, [filled, existingCodes]);

  // Live preview with UPSA truncation
  const graded = filled.filter((r) => r.grade && gradePoints[r.grade] !== undefined);
  const newPoints = graded.reduce((sum, r) => sum + gradePoints[r.grade] * Number(r.credit_hours), 0);
  const newCredits = graded.reduce((sum, r) => sum + Number(r.credit_hours), 0);
  const allPoints = semesters.reduce((sum, s) => sum + s.total_grade_points, 0);
  const allCredits = semesters.reduce((sum, s) => sum + s.total_credits, 0);
  const semGpa = truncateGpa(newPoints + (existing?.total_grade_points || 0), newCredits + (existing?.total_credits || 0));
  const before = truncateGpa(allPoints, allCredits);
  const after = truncateGpa(allPoints + newPoints, allCredits + newCredits);
  const bands = enrollment?.classification_bands || [];

  const save = async () => {
    setChecked(true);
    setError("");
    if (!filled.length) { setError("Add at least one course."); return; }
    if (Object.keys(problems).length) {
      const dup = Object.values(problems).some((p) => p.includes("duplicate"));
      setError(dup
        ? "A course is listed twice or is already recorded for this semester. Remove the extra one."
        : "Pick a grade for every course, or remove the courses you did not take.");
      // Bring the first course that needs attention into view
      setTimeout(() => document.querySelector(".rs-row-bad")?.scrollIntoView({ behavior: "smooth", block: "center" }), 0);
      return;
    }
    setSaving(true);
    try {
      const res = await addSemester({
        academic_year: year,
        semester: Number(semester),
        enrollment_id: enrollment?.id,
        courses: filled.map((r) => ({
          course_code: r.course_code.trim().toUpperCase(),
          course_name: r.course_name.trim(),
          credit_hours: Number(r.credit_hours),
          grade: r.grade,
        })),
      });
      onSaved(`${res.message.replace(".", "")} for ${semesterTitle(year, semester)}.`, res.results);
    } catch (err) {
      setError(getErrorMessage(err, "Could not save. Try again."));
      setSaving(false);
    }
  };

  if (step === "pick") {
    return (
      <Dialog
        title="Add a semester"
        subtitle="Pick the semester on your result slip. We will fill in its usual courses."
        onClose={onClose}
        footer={(
          <>
            <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
            <button type="button" className="db-btn" onClick={loadCourses} disabled={loading}>
              {loading ? "Finding your courses..." : "Continue"} {!loading && <Icon name="arrowRight" size={18} />}
            </button>
          </>
        )}
      >
        <div className="rs-field">
          <label className="rs-label" htmlFor="rs-year">Academic year</label>
          <select id="rs-year" className="rs-input" value={year} onChange={(e) => setYear(e.target.value)}>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div className="rs-field">
          <span className="rs-label" id="rs-sem-label">Semester</span>
          <div className="rs-segment" role="radiogroup" aria-labelledby="rs-sem-label">
            {[1, 2].map((s) => (
              <button key={s} type="button" role="radio" aria-checked={Number(semester) === s}
                className={Number(semester) === s ? "on" : ""} onClick={() => setSemester(s)}>
                {SEMESTER_NAMES[s]}
              </button>
            ))}
          </div>
        </div>
        {existing && (
          <p className="rs-note">
            <Icon name="info" size={18} />
            You already have {existing.results.length} course{existing.results.length !== 1 ? "s" : ""} for this semester.
            New ones will be added to it.
          </p>
        )}
      </Dialog>
    );
  }

  return (
    <Dialog
      wide
      title={semesterTitle(year, semester)}
      subtitle={info?.level ? `Level ${info.level} · ${enrollment?.programme || ""}` : enrollment?.programme}
      onClose={onClose}
      footer={(
        <>
          <div className="rs-preview" aria-live="polite">
            {error ? (
              <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>
            ) : newCredits > 0 ? (
              <>
                <span>Semester GPA <strong>{semGpa.toFixed(2)}</strong></span>
                <span>
                  CGPA {allCredits > 0 && <>{before.toFixed(2)} <Icon name="arrowRight" size={14} /> </>}
                  <strong>{after.toFixed(2)}</strong>
                  {bands.length > 0 && <em>{classifyWithBands(after, bands)}</em>}
                </span>
              </>
            ) : <span>Tap a grade on each course to see your GPA.</span>}
          </div>
          <div className="rs-foot-actions">
            <button type="button" className="db-btn db-btn-ghost" onClick={() => setStep("pick")}>Back</button>
            <button type="button" className="db-btn" onClick={save} disabled={saving}>
              {saving ? "Saving..." : `Save ${filled.length || ""} course${filled.length === 1 ? "" : "s"}`}
            </button>
          </div>
        </>
      )}
    >
      {info?.count > 0 ? (
        <p className="rs-note rs-note-gold">
          <Icon name="sparkle" size={18} />
          <span>
            We filled in {info.count} course{info.count !== 1 ? "s" : ""} usually taken in this semester.
            Tap a grade on each, remove any you did not take, and add electives below.
            {info.unconfirmed && " Credits show 3 where UPSA's timetable does not list them, so check them against your slip."}
          </span>
        </p>
      ) : (
        <p className="rs-note">
          <Icon name="info" size={18} />
          <span>Type a course code or title and pick it from the list. The title and credits fill in for you.</span>
        </p>
      )}

      <ol className="rs-rows">
        {rows.map((r, i) => {
          const bad = checked ? problems[r.key] || [] : [];
          return (
            <li key={r.key} className={`rs-row${bad.length ? " rs-row-bad" : ""}`}>
              <div className="rs-row-fields">
                <div className="rs-field">
                  <label className={i ? "db-sr" : "rs-label"} htmlFor={`code-${r.key}`}>Code</label>
                  <CourseCodeInput
                    id={`code-${r.key}`}
                    value={r.course_code}
                    catalogue={catalogue}
                    invalid={bad.includes("code") || bad.includes("duplicate")}
                    onChange={(v) => update(r.key, { course_code: v })}
                    onPick={(c) => update(r.key, { course_code: c.code, course_name: c.name, credit_hours: c.credit_hours })}
                  />
                </div>
                <div className="rs-field rs-grow">
                  <label className={i ? "db-sr" : "rs-label"} htmlFor={`name-${r.key}`}>Course title</label>
                  <input id={`name-${r.key}`} className={`rs-input${bad.includes("name") ? " rs-invalid" : ""}`}
                    value={r.course_name} maxLength={200} placeholder="e.g. Programming"
                    onChange={(e) => update(r.key, { course_name: e.target.value })} />
                </div>
                <div className="rs-field rs-credits">
                  <label className={i ? "db-sr" : "rs-label"} htmlFor={`cr-${r.key}`}>Credits</label>
                  <select id={`cr-${r.key}`} className="rs-input" value={r.credit_hours}
                    onChange={(e) => update(r.key, { credit_hours: Number(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <button type="button" className="rs-icon-btn rs-row-remove" onClick={() => remove(r.key)}
                  aria-label={`Remove ${r.course_code || `course ${i + 1}`}`}>
                  <Icon name="close" size={18} />
                </button>
              </div>
              <div className="rs-row-grade">
                <span className="rs-label">Grade{r.suggested && <span className="rs-tag">Suggested</span>}</span>
                <GradePicker value={r.grade} onChange={(g) => update(r.key, { grade: g })}
                  label={`Grade for ${r.course_code || `course ${i + 1}`}`} invalid={bad.includes("grade")} />
              </div>
              {bad.includes("duplicate") && <p className="rs-row-msg">This course is already listed for this semester.</p>}
            </li>
          );
        })}
      </ol>

      <button type="button" className="rs-add-row" onClick={() => setRows((rs) => [...rs, blankRow()])} disabled={rows.length >= 15}>
        <Icon name="plus" size={18} /> Add another course
      </button>
    </Dialog>
  );
}
