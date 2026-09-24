import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/landing/Icon";
import { GradePicker } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/gpa/gpa.css";
import "../components/planner/planner.css";
import { useProgrammes } from "../context/ProgrammeContext";
import useReferenceData from "../hooks/useReferenceData";
import { getCourseSuggestions, getErrorMessage, getMyResults } from "../services/api";
import { classifyWithBands, semesterTitle, truncateGpa } from "../utils/academic";

let nextKey = 1;
const row = (patch = {}) => ({ key: nextKey++, course_code: "", course_name: "", credit_hours: 3, grade: "", ...patch });
const up2 = (n) => Math.ceil(n * 100 - 1e-9) / 100;

const storageKey = (enrollmentId, term) => `gradeiq.plan.${enrollmentId}.${term.year}.${term.semester}`;
function loadPlan(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    return Array.isArray(saved) && saved.length ? saved.map((r) => row(r)) : null;
  } catch {
    return null;
  }
}
function savePlan(key, rows) {
  try {
    localStorage.setItem(key, JSON.stringify(rows.map(({ course_code, course_name, credit_hours, grade }) => ({ course_code, course_name, credit_hours, grade }))));
  } catch {
    // Remembering the plan is a convenience; the page works without it
  }
}

/** The semester after the latest one recorded (planning ahead may go past the current year). */
function planTerm(semesters, startYear) {
  const last = semesters[semesters.length - 1];
  if (!last) return { year: startYear, semester: 1 };
  if (last.semester === 1) return { year: last.academic_year, semester: 2 };
  const [a, b] = last.academic_year.split("/").map(Number);
  return { year: `${a + 1}/${b + 1}`, semester: 1 };
}

export default function Planner() {
  const { selectedEnrollmentId } = useProgrammes();
  const { grade_scale: gradeScale, max_level: maxLevel } = useReferenceData();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  // The plan belongs to one programme and semester, so a switch shows the right one
  const [plan, setPlan] = useState(null);
  const [target, setTarget] = useState(null);
  const [remaining, setRemaining] = useState("");

  const scale = useMemo(() => [...(gradeScale || [])].sort((a, b) => b.grade_point - a.grade_point), [gradeScale]);
  const points = useMemo(() => Object.fromEntries(scale.map((g) => [g.grade, g.grade_point])), [scale]);

  useEffect(() => {
    let active = true;
    getMyResults(selectedEnrollmentId)
      .then((res) => { if (active) { setData(res); setError(""); } })
      .catch((err) => active && setError(getErrorMessage(err, "Could not load your results.")));
    return () => { active = false; };
  }, [selectedEnrollmentId]);

  const semesters = useMemo(() => data?.semesters || [], [data]);
  const enrollment = data?.enrollment;
  const term = enrollment ? planTerm(semesters, enrollment.start_academic_year) : null;
  const key = enrollment && term ? storageKey(enrollment.id, term) : null;
  const rows = plan?.key === key ? plan.rows : null;
  const fromSuggestions = plan?.key === key && plan.suggested;
  const setRows = (next) => setPlan((p) => ({ ...p, rows: typeof next === "function" ? next(p.rows) : next }));

  const allPoints = semesters.reduce((s, x) => s + x.total_grade_points, 0);
  const allCredits = semesters.reduce((s, x) => s + x.total_credits, 0);
  const cgpa = truncateGpa(allPoints, allCredits);
  // "My usual": the grade closest to the student's CGPA (B if nothing is recorded yet)
  const usual = allCredits && scale.length
    ? scale.reduce((best, g) => (Math.abs(g.grade_point - cgpa) < Math.abs(best.grade_point - cgpa) ? g : best)).grade
    : "B";

  // Build the plan: remembered on this device, otherwise the semester's usual courses
  useEffect(() => {
    if (!key || rows) return undefined;
    let active = true;
    const saved = loadPlan(key);
    const source = saved
      ? Promise.resolve({ rows: saved, suggested: false })
      : getCourseSuggestions(term.year, term.semester, selectedEnrollmentId)
        .then((res) => res.courses.filter((c) => !c.recorded_before))
        .catch(() => [])
        .then((courses) => ({
          suggested: courses.length > 0,
          rows: courses.length
            ? courses.map((c) => row({ course_code: c.course_code, course_name: c.course_name, credit_hours: c.credit_hours, grade: usual }))
            : [1, 2, 3, 4, 5].map(() => row({ grade: usual })),
        }));
    source.then((built) => active && setPlan({ key, ...built }));
    return () => { active = false; };
  }, [key, rows, term?.year, term?.semester, selectedEnrollmentId, usual]);

  useEffect(() => { if (key && rows) savePlan(key, rows); }, [key, rows]);

  if (error && !data) {
    return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  }
  if (!data || !rows) {
    return <div className="db db-loading"><div className="db-spinner" /><p>Preparing your plan...</p></div>;
  }

  const bands = enrollment.classification_bands || [];
  const update = (k, patch) => setRows((rs) => rs.map((r) => (r.key === k ? { ...r, ...patch } : r)));
  const setAll = (grade) => setRows((rs) => rs.map((r) => ({ ...r, grade })));

  // This semester's plan, with UPSA truncation
  const planned = rows.filter((r) => r.grade && points[r.grade] !== undefined);
  const planPoints = planned.reduce((s, r) => s + points[r.grade] * Number(r.credit_hours), 0);
  const planCredits = planned.reduce((s, r) => s + Number(r.credit_hours), 0);
  const semGpa = truncateGpa(planPoints, planCredits);
  const after = truncateGpa(allPoints + planPoints, allCredits + planCredits);
  const change = allCredits ? after - cgpa : null;
  const classNow = allCredits ? classifyWithBands(cgpa, bands) : null;
  const classAfter = planCredits ? classifyWithBands(after, bands) : null;

  // What this semester needs to reach the next class, or to hold the current one
  const needFor = (min) => (min * (allCredits + planCredits) - allPoints) / planCredits;
  const afterIndex = bands.findIndex((b) => b.label === classAfter);
  const nextBand = afterIndex > 0 ? bands[afterIndex - 1] : null;
  const holdBand = classNow ? bands.find((b) => b.label === classNow) : null;
  const letterFor = (gp) => [...scale].reverse().find((g) => g.grade_point >= gp - 1e-9)?.grade;

  // Reach a class by graduation
  const levels = ((maxLevel?.[enrollment.award_type] ?? 400) - enrollment.entry_level) / 100 + 1;
  const semestersLeft = Math.max(levels * 2 - semesters.length, 0);
  const perSemester = semesters.length ? Math.round(allCredits / semesters.length) : 18;
  const estimate = semestersLeft * perSemester;
  const remainingCredits = Number(remaining || estimate);
  const targets = bands.filter((b) => b.label !== "Fail" && b.min > 0);
  const chosen = targets.find((b) => b.label === target) || null;
  const required = chosen && remainingCredits > 0
    ? (chosen.min * (allCredits + remainingCredits) - allPoints) / remainingCredits : null;
  const bestFinish = truncateGpa(allPoints + 4 * remainingCredits, allCredits + remainingCredits);

  return (
    <div className="db rs pl">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Planner</p>
          <h1 className="db-title">Plan your next semester</h1>
          <p className="db-meta">Pick the grades you expect and see where they take your CGPA. Nothing here changes your results.</p>
        </div>
      </header>

      <div className="pl-layout">
        {/* ---------- The plan ---------- */}
        <section className="db-card pl-plan" aria-labelledby="pl-term">
          <div className="pl-plan-head">
            <div>
              <p className="db-label">Next semester</p>
              <h2 id="pl-term" className="db-h2">{semesterTitle(term.year, term.semester)}</h2>
              <p className="pl-muted">{enrollment.programme}</p>
            </div>
            <div className="pl-quick" role="group" aria-label="Set every grade">
              <button type="button" onClick={() => setAll("A")}>All A</button>
              <button type="button" onClick={() => setAll(usual)}>My usual ({usual})</button>
              <button type="button" onClick={() => setAll("C")}>All C</button>
            </div>
          </div>

          {fromSuggestions && (
            <p className="rs-note rs-note-gold">
              <Icon name="sparkle" size={18} />
              <span>These are the courses usually taken this semester. Each starts at your usual grade, {usual}. Change any you expect to do better or worse in.</span>
            </p>
          )}

          <ol className="pl-rows">
            {rows.map((r, i) => (
              <li key={r.key} className="pl-row">
                <div className="pl-row-top">
                  {r.course_code ? (
                    <p className="pl-course"><strong>{r.course_code}</strong> {r.course_name}</p>
                  ) : (
                    <input className="rs-input" value={r.course_name} placeholder={`Course ${i + 1} (optional name)`}
                      aria-label={`Course ${i + 1} name`} onChange={(e) => update(r.key, { course_name: e.target.value })} />
                  )}
                  <select className="rs-input pl-credits" value={r.credit_hours} aria-label={`Credits for course ${i + 1}`}
                    onChange={(e) => update(r.key, { credit_hours: Number(e.target.value) })}>
                    {[1, 2, 3, 4, 5, 6].map((c) => <option key={c} value={c}>{c} cr</option>)}
                  </select>
                  <button type="button" className="rs-icon-btn" aria-label={`Remove course ${i + 1}`}
                    onClick={() => setRows((rs) => rs.filter((x) => x.key !== r.key))} disabled={rows.length === 1}>
                    <Icon name="close" size={18} />
                  </button>
                </div>
                <GradePicker value={r.grade} onChange={(g) => update(r.key, { grade: g })} label={`Expected grade for course ${i + 1}`} />
              </li>
            ))}
          </ol>
          <div className="pl-plan-foot">
            <button type="button" className="rs-add-row" onClick={() => setRows((rs) => [...rs, row({ grade: usual })])} disabled={rows.length >= 15}>
              <Icon name="plus" size={18} /> Add a course
            </button>
            <button type="button" className="db-link" onClick={() => { try { localStorage.removeItem(key); } catch { /* ignore */ } setPlan(null); }}>
              Start over
            </button>
          </div>
        </section>

        {/* ---------- Live result ---------- */}
        <aside className="pl-result" aria-live="polite" aria-label="Where this plan takes you">
          <p className="pl-result-label">This plan gives you</p>
          <div className="pl-figures">
            <div>
              <small>Semester GPA</small>
              <strong>{planCredits ? semGpa.toFixed(2) : "-"}</strong>
            </div>
            <div className="pl-cgpa">
              <small>CGPA</small>
              <strong>
                {allCredits > 0 && <span className="pl-before">{cgpa.toFixed(2)} <Icon name="arrowRight" size={16} /></span>}
                {planCredits ? after.toFixed(2) : "-"}
              </strong>
            </div>
          </div>
          <div className="pl-tags">
            {classAfter && <span className="rs-sum-pill">{classAfter}</span>}
            {change !== null && planCredits > 0 && Math.abs(change) >= 0.005 && (
              <span className={`gp-delta ${change > 0 ? "up" : "down"}`}>
                <Icon name={change > 0 ? "arrowUp" : "arrowDownRight"} size={13} strokeWidth={2.4} />
                {change > 0 ? "Up" : "Down"} {Math.abs(change).toFixed(2)}
              </span>
            )}
          </div>

          <ul className="pl-advice">
            {planCredits > 0 && nextBand && (() => {
              const need = up2(needFor(nextBand.min));
              return need <= 4
                ? <li><Icon name="arrowUp" size={16} strokeWidth={2.2} /><span>To reach <strong>{nextBand.label}</strong> this semester you need a semester GPA of <strong>{need.toFixed(2)}</strong> or more (about {letterFor(need)} in every course).</span></li>
                : <li><Icon name="info" size={16} /><span><strong>{nextBand.label}</strong> is out of reach this semester. Straight A's would take your CGPA to {truncateGpa(allPoints + 4 * planCredits, allCredits + planCredits).toFixed(2)}.</span></li>;
            })()}
            {planCredits > 0 && holdBand && holdBand.label !== "Fail" && (() => {
              const hold = up2(needFor(holdBand.min));
              return hold > 0 && (
                <li><Icon name="shield" size={16} /><span>You stay in <strong>{holdBand.label}</strong> as long as your semester GPA is <strong>{Math.min(hold, 4).toFixed(2)}</strong> or more.</span></li>
              );
            })()}
            {!planCredits && <li><Icon name="info" size={16} /><span>Pick an expected grade for at least one course.</span></li>}
          </ul>
          <p className="pl-note">Your plan is kept on this device so you can adjust it as the semester goes on.</p>
        </aside>
      </div>

      {/* ---------- Reach a class ---------- */}
      <section className="db-card pl-target" aria-labelledby="pl-target">
        <div className="db-card-head">
          <h2 id="pl-target" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="target" size={16} /></span>
            Reach a class by graduation
          </h2>
        </div>
        {semestersLeft === 0 && allCredits > 0 ? (
          <p className="pl-muted">Every semester of this programme is recorded, so your final class is {classNow}. <Link to="/gpa" className="db-link">See the details</Link></p>
        ) : (
          <div className="pl-target-grid">
            <div>
              <p className="rs-label" id="pl-classes">Which class are you aiming for?</p>
              <div className="rs-filters pl-classes" role="radiogroup" aria-labelledby="pl-classes">
                {targets.map((b) => (
                  <button key={b.label} type="button" role="radio" aria-checked={target === b.label}
                    className={target === b.label ? "on" : ""} onClick={() => setTarget(b.label)}>
                    {b.label} ({b.min.toFixed(2)})
                  </button>
                ))}
              </div>
              <label className="rs-label pl-rem-label" htmlFor="pl-rem">Credits still to take</label>
              <input id="pl-rem" type="number" min="1" max="200" className="rs-input pl-rem" value={remaining}
                placeholder={String(estimate)} onChange={(e) => setRemaining(e.target.value)} />
              <p className="pl-muted pl-small">
                Our estimate: {semestersLeft} semester{semestersLeft === 1 ? "" : "s"} left × about {perSemester} credits = {estimate}. Change it if you know better.
              </p>
            </div>
            <div className="pl-answer" aria-live="polite">
              {!chosen && <p className="pl-muted">Pick a class to see what it takes.</p>}
              {chosen && required !== null && (
                required <= 0 ? (
                  <>
                    <p className="pl-answer-big pl-ok"><Icon name="check" size={22} strokeWidth={2.4} /> Already secured</p>
                    <p>Your CGPA stays at or above {chosen.min.toFixed(2)} whatever you score in the remaining {remainingCredits} credits.</p>
                  </>
                ) : required <= 4 ? (
                  <>
                    <p className="pl-answer-label">You need an average of</p>
                    <p className="pl-answer-big">{up2(required).toFixed(2)} <span>about {letterFor(up2(required))} or better</span></p>
                    <p>in every one of your remaining {remainingCredits} credits to finish in <strong>{chosen.label}</strong>.</p>
                  </>
                ) : (
                  <>
                    <p className="pl-answer-big pl-no"><Icon name="alert" size={22} /> Out of reach</p>
                    <p>
                      Even straight A's in the remaining {remainingCredits} credits would finish at <strong>{bestFinish.toFixed(2)}</strong>
                      {" "}({classifyWithBands(bestFinish, bands)}), below {chosen.label} at {chosen.min.toFixed(2)}.
                    </p>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
