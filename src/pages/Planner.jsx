import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import useCached, { resultsKey } from "../hooks/useCached";
import { ProjectionChart } from "../components/dashboard/charts";
import { GradePicker } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/gpa/gpa.css";
import "../components/planner/planner.css";
import { useProgrammes } from "../context/ProgrammeContext";
import useReferenceData from "../hooks/useReferenceData";
import { getCourseSuggestions, getErrorMessage, getInsights, getMyResults } from "../services/api";
import { classifyWithBands, semesterTitle, shortSemester, truncateGpa } from "../utils/academic";

let nextKey = 1;
const row = (patch = {}) => ({ key: nextKey++, course_code: "", course_name: "", credit_hours: 3, grade: "", ...patch });
const up2 = (n) => Math.ceil(n * 100 - 1e-9) / 100;
const areaOf = (code) => (/^[A-Za-z]+/.exec(code || "")?.[0] || "").toUpperCase();

// ---------- Plan storage (this device only) ----------
const storageKey = (enrollmentId, term) => `gradeiq.plan.${enrollmentId}.${term.year}.${term.semester}`;
function loadPlan(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "null");
    const rows = Array.isArray(saved) ? saved : saved?.rows;
    if (!Array.isArray(rows) || !rows.length) return null;
    return { rows: rows.map((r) => row(r)), road: Array.isArray(saved?.road) ? saved.road : null, perSemester: saved?.perSemester || null };
  } catch {
    return null;
  }
}
function savePlan(key, plan) {
  try {
    localStorage.setItem(key, JSON.stringify({
      rows: plan.rows.map(({ course_code, course_name, credit_hours, grade }) => ({ course_code, course_name, credit_hours, grade })),
      road: plan.road,
      perSemester: plan.perSemester,
    }));
  } catch {
    // Remembering the plan is a convenience; the page works without it
  }
}

// ---------- Terms ----------
const followingTerm = (t) => {
  if (t.semester === 1) return { year: t.year, semester: 2 };
  const [a, b] = t.year.split("/").map(Number);
  return { year: `${a + 1}/${b + 1}`, semester: 1 };
};
function planTerm(semesters, startYear) {
  const last = semesters[semesters.length - 1];
  return last ? followingTerm({ year: last.academic_year, semester: last.semester }) : { year: startYear, semester: 1 };
}
const levelOf = (enrollment, year) =>
  enrollment.entry_level + 100 * Math.max(0, Number(year.slice(0, 4)) - Number(enrollment.start_academic_year.slice(0, 4)));

export default function Planner() {
  const { selectedEnrollmentId } = useProgrammes();
  const { grade_scale: gradeScale, max_level: maxLevel } = useReferenceData();
  const { data, error: fetchError } = useCached(resultsKey(selectedEnrollmentId), () => getMyResults(selectedEnrollmentId));
  const error = fetchError ? getErrorMessage(fetchError, "Could not load your results.") : "";
  const { data: areaData, error: areaError } = useCached(`areas:${selectedEnrollmentId || "current"}`,
    () => getInsights(selectedEnrollmentId).then((ins) => ins.areas || []));
  const areas = areaData || (areaError ? [] : null);
  const [plan, setPlan] = useState(null);
  const [target, setTarget] = useState(null);
  const [remaining, setRemaining] = useState("");

  const scale = useMemo(() => [...(gradeScale || [])].sort((a, b) => b.grade_point - a.grade_point), [gradeScale]);
  const points = useMemo(() => Object.fromEntries(scale.map((g) => [g.grade, g.grade_point])), [scale]);
  const nearest = (gp) => scale.reduce((best, g) => (Math.abs(g.grade_point - gp) < Math.abs(best.grade_point - gp) ? g : best), scale[0])?.grade;
  const stepDown = (g) => scale[Math.min(scale.findIndex((x) => x.grade === g) + 1, scale.length - 1)]?.grade || g;
  const stepUp = (g) => scale[Math.max(scale.findIndex((x) => x.grade === g) - 1, 0)]?.grade || g;
  const letterFor = (gp) => [...scale].reverse().find((g) => g.grade_point >= gp - 1e-9)?.grade;

  const semesters = useMemo(() => data?.semesters || [], [data]);
  const enrollment = data?.enrollment;
  const term = enrollment ? planTerm(semesters, enrollment.start_academic_year) : null;
  const key = enrollment && term ? storageKey(enrollment.id, term) : null;

  const allPoints = semesters.reduce((s, x) => s + x.total_grade_points, 0);
  const allCredits = semesters.reduce((s, x) => s + x.total_credits, 0);
  const cgpa = truncateGpa(allPoints, allCredits);
  const usual = allCredits && scale.length ? nearest(cgpa) : "B";

  // Predictions from history: the grade usually earned in the same subject area
  const areaMap = Object.fromEntries((areas || []).map((a) => [a.area, a]));
  const predict = (code) => {
    const a = areaMap[areaOf(code)];
    return a && a.courses >= 2 ? { grade: nearest(a.gpa), from: a } : { grade: usual, from: null };
  };
  const weakArea = (code) => {
    const a = areaMap[areaOf(code)];
    return a && a.courses >= 2 && a.vs_cgpa <= -0.3 ? a : null;
  };

  const levels = enrollment ? ((maxLevel?.[enrollment.award_type] ?? 400) - enrollment.entry_level) / 100 + 1 : 0;
  const semestersLeft = enrollment ? Math.max(levels * 2 - semesters.length, 0) : 0;
  const estimatePerSemester = semesters.length ? Math.round(allCredits / semesters.length) : 18;

  const current = plan?.key === key ? plan : null;
  const rows = current?.rows || null;
  const updatePlan = (patch) => setPlan((p) => ({ ...p, ...(typeof patch === "function" ? patch(p) : patch) }));
  const setRows = (next) => updatePlan((p) => ({ rows: typeof next === "function" ? next(p.rows) : next }));

  // Build the plan: remembered on this device, otherwise the semester's usual courses at predicted grades
  const ready = Boolean(key && data && areas && scale.length);
  useEffect(() => {
    if (!ready || rows) return undefined;
    let active = true;
    const saved = loadPlan(key);
    const road = Array.from({ length: Math.max(semestersLeft - 1, 0) }, () => usual);
    const source = saved
      ? Promise.resolve({ ...saved, road: saved.road?.length === road.length ? saved.road : road, suggested: false })
      : getCourseSuggestions(term.year, term.semester, selectedEnrollmentId)
        .then((res) => res.courses.filter((c) => !c.recorded_before))
        .catch(() => [])
        .then((courses) => ({
          suggested: courses.length > 0,
          road,
          perSemester: null,
          rows: courses.length
            ? courses.map((c) => row({ course_code: c.course_code, course_name: c.course_name, credit_hours: c.credit_hours, grade: predict(c.course_code).grade }))
            : [1, 2, 3, 4, 5].map(() => row({ grade: usual })),
        }));
    source.then((built) => active && setPlan({ key, ...built }));
    return () => { active = false; };
    // predict() reads areas, which may arrive a moment later; the plan is built once per term
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, key, rows]);

  useEffect(() => { if (key && current) savePlan(key, current); }, [key, current]);

  if (error && !data) {
    return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  }
  if (!data || !rows) {
    return <PageSkeleton variant="form" label="Preparing your plan" />;
  }

  const bands = enrollment.classification_bands || [];
  const classOf = (v) => classifyWithBands(v, bands);
  const update = (k, patch) => setRows((rs) => rs.map((r) => (r.key === k ? { ...r, ...patch } : r)));

  if (semestersLeft === 0 && allCredits > 0) {
    return (
      <div className="db rs pl">
        <header className="db-header"><div><p className="db-eyebrow">Planner</p><h1 className="db-title">Your programme is complete</h1></div></header>
        <section className="db-card rs-empty">
          <span className="rs-empty-icon"><Icon name="check" size={28} /></span>
          <p className="pl-muted">Every semester of {enrollment.programme} is recorded. You finished on {cgpa.toFixed(2)}, {classOf(cgpa)}.</p>
          {enrollment.award_type === "diploma" && (
            <p className="pl-muted">Topping up to a degree? Add it from your <Link to="/profile" className="db-link">Profile</Link> and plan it here. Your diploma result stays in your history.</p>
          )}
          <Link to="/gpa" className="db-btn">See how you got there</Link>
        </section>
      </div>
    );
  }

  // ---------- Next semester ----------
  const planned = rows.filter((r) => r.grade && points[r.grade] !== undefined);
  const sumPoints = (list, gradeOf = (r) => r.grade) => list.reduce((s, r) => s + points[gradeOf(r)] * Number(r.credit_hours), 0);
  const planPoints = sumPoints(planned);
  const planCredits = planned.reduce((s, r) => s + Number(r.credit_hours), 0);
  const semGpa = truncateGpa(planPoints, planCredits);
  const after = truncateGpa(allPoints + planPoints, allCredits + planCredits);
  const change = allCredits ? after - cgpa : null;
  const classNow = allCredits ? classOf(cgpa) : null;
  const classAfter = planCredits ? classOf(after) : null;
  const needFor = (min) => (min * (allCredits + planCredits) - allPoints) / planCredits;
  const afterIndex = bands.findIndex((b) => b.label === classAfter);
  const nextBand = afterIndex > 0 ? bands[afterIndex - 1] : null;
  const holdBand = classNow ? bands.find((b) => b.label === classNow) : null;

  const semScenario = (gradeOf) => {
    const p = sumPoints(planned, gradeOf);
    const cg = truncateGpa(allPoints + p, allCredits + planCredits);
    return { gpa: truncateGpa(p, planCredits), after: cg, cls: classOf(cg) };
  };
  const semScenarios = planCredits ? [
    { name: "All A's", ...semScenario(() => "A") },
    { name: "Your plan", ...semScenario((r) => r.grade), mine: true },
    { name: "One grade lower", ...semScenario((r) => stepDown(r.grade)) },
  ] : [];

  // Where one grade step moves the CGPA most (more credits, more weight)
  const effort = planned
    .map((r) => {
      const higher = stepUp(r.grade);
      const gain = ((points[higher] - points[r.grade]) * Number(r.credit_hours)) / (allCredits + planCredits);
      return { ...r, higher, gain };
    })
    .sort((a, b) => b.gain - a.gain || b.credit_hours - a.credit_hours);
  const maxGain = Math.max(0.001, ...effort.map((e) => e.gain));

  // ---------- Road to graduation ----------
  const perSemester = Number(current.perSemester) || estimatePerSemester;
  const road = current.road || [];
  const futureTerms = [];
  for (let i = 0, t = term; i < semestersLeft; i += 1, t = followingTerm(t)) futureTerms.push(t);
  const runRoad = (mode) => {
    let p = allPoints + (mode === "A" ? 4 * planCredits : mode === "down" ? sumPoints(planned, (r) => stepDown(r.grade)) : planPoints);
    let c = allCredits + planCredits;
    const out = [truncateGpa(p, c)];
    road.forEach((g) => {
      const grade = mode === "A" ? "A" : mode === "down" ? stepDown(g) : g;
      p += points[grade] * perSemester;
      c += perSemester;
      out.push(truncateGpa(p, c));
    });
    return out;
  };
  const path = runRoad("plan");
  const finalCgpa = path[path.length - 1];
  const crossing = path.findIndex((v, i) => i > 0 && v > path[i - 1] && classOf(v) !== classOf(path[i - 1]));
  // Starting point for the road is the CGPA before the next semester
  const startClass = allCredits ? classOf(cgpa) : null;
  const dropAt = path.findIndex((v, i) => classOf(v) !== (i ? classOf(path[i - 1]) : startClass) && v < (i ? path[i - 1] : cgpa));
  const roadScenarios = [
    { name: "All A's from now", final: runRoad("A").at(-1) },
    { name: "Your road", final: finalCgpa, mine: true },
    { name: "One grade lower", final: runRoad("down").at(-1) },
  ];
  const chartPoints = [
    ...semesters.map((s, i) => ({
      label: shortSemester(s.academic_year, s.semester),
      actual: s.cgpa,
      projected: i === semesters.length - 1 ? s.cgpa : null,
    })),
    ...futureTerms.map((t, i) => ({ label: shortSemester(t.year, t.semester), actual: null, projected: path[i] })),
  ];

  // ---------- Reach a class ----------
  const estimateRemaining = semestersLeft * perSemester;
  const remainingCredits = Number(remaining || estimateRemaining);
  const targets = bands.filter((b) => b.label !== "Fail" && b.min > 0);
  const chosen = targets.find((b) => b.label === target) || null;
  const required = chosen && remainingCredits > 0 ? (chosen.min * (allCredits + remainingCredits) - allPoints) / remainingCredits : null;
  const bestFinish = truncateGpa(allPoints + 4 * remainingCredits, allCredits + remainingCredits);

  return (
    <div className="db rs pl">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Planner</p>
          <h1 className="db-title">Plan your way to graduation</h1>
          <p className="db-meta">Expected grades start from your own history. Change them and everything updates. Nothing here changes your results.</p>
        </div>
      </header>

      <div className="pl-layout">
        {/* ---------- The plan ---------- */}
        <section className="db-card pl-plan" aria-labelledby="pl-term">
          <div className="pl-plan-head">
            <div>
              <p className="db-label">Next semester</p>
              <h2 id="pl-term" className="db-h2">{semesterTitle(term.year, term.semester)}</h2>
              <p className="pl-muted">Level {levelOf(enrollment, term.year)} · {enrollment.programme}</p>
            </div>
            <div className="pl-quick" role="group" aria-label="Set every grade">
              <button type="button" onClick={() => setRows((rs) => rs.map((r) => ({ ...r, grade: "A" })))}>All A</button>
              <button type="button" onClick={() => setRows((rs) => rs.map((r) => ({ ...r, grade: r.course_code ? predict(r.course_code).grade : usual })))}>Likely</button>
              <button type="button" onClick={() => setRows((rs) => rs.map((r) => ({ ...r, grade: "C" })))}>All C</button>
            </div>
          </div>

          {current.suggested && (
            <p className="rs-note rs-note-gold">
              <Icon name="sparkle" size={18} />
              <span>These are the courses usually taken this semester. Each starts at the grade you usually get in similar courses. Change any you expect to do better or worse in.</span>
            </p>
          )}

          <ol className="pl-rows">
            {rows.map((r, i) => {
              const guess = r.course_code ? predict(r.course_code) : null;
              const weak = r.course_code ? weakArea(r.course_code) : null;
              return (
                <li key={r.key} className={`pl-row${weak ? " pl-row-weak" : ""}`}>
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
                  {guess && (
                    <p className="pl-guess">
                      {weak && <span className="pl-watch"><Icon name="alert" size={13} /> Watch this one</span>}
                      {guess.from
                        ? <>Likely <strong>{guess.grade}</strong>: your {guess.from.label} courses average {guess.from.gpa.toFixed(2)}{weak ? `, below your CGPA of ${cgpa.toFixed(2)}` : ""}.</>
                        : <>Likely <strong>{guess.grade}</strong>, from your overall average.</>}
                    </p>
                  )}
                  <GradePicker value={r.grade} onChange={(g) => update(r.key, { grade: g })} label={`Expected grade for course ${i + 1}`} />
                </li>
              );
            })}
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
          <p className="pl-result-label">This semester's plan gives you</p>
          <div className="pl-figures">
            <div><small>Semester GPA</small><strong>{planCredits ? semGpa.toFixed(2) : "-"}</strong></div>
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

          {semScenarios.length > 0 && (
            <table className="pl-scen">
              <caption className="db-sr">This semester under three scenarios</caption>
              <thead><tr><th scope="col">If you get</th><th scope="col">GPA</th><th scope="col">CGPA</th></tr></thead>
              <tbody>
                {semScenarios.map((s) => (
                  <tr key={s.name} className={s.mine ? "mine" : ""}>
                    <th scope="row">{s.name}</th>
                    <td>{s.gpa.toFixed(2)}</td>
                    <td>{s.after.toFixed(2)} <span>{s.cls}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

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

      {/* ---------- Which courses matter most ---------- */}
      {effort.length > 0 && (
        <section className="db-card" aria-labelledby="pl-effort">
          <div className="db-card-head">
            <h2 id="pl-effort" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="layers" size={16} /></span>
              Where your effort counts most
            </h2>
          </div>
          <p className="pl-muted pl-lead">How much one grade higher in each course would add to your CGPA. Courses with more credits move it more.</p>
          <ol className="pl-effort">
            {effort.map((e) => (
              <li key={e.key}>
                <span className="pl-effort-name">
                  <strong>{e.course_code || e.course_name || "Course"}</strong>
                  <span>{e.credit_hours} credits · planned {e.grade}</span>
                </span>
                <span className="pl-effort-track" aria-hidden="true"><span style={{ width: `${(e.gain / maxGain) * 100}%` }} /></span>
                <span className="pl-effort-value">
                  {e.grade === "A" ? "Already A" : <>{e.grade} to {e.higher} <strong>+{e.gain.toFixed(2)}</strong></>}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* ---------- Road to graduation ---------- */}
      <section className="db-card pl-road" aria-labelledby="pl-road">
        <div className="db-card-head">
          <h2 id="pl-road" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="chart" size={16} /></span>
            Road to graduation
          </h2>
        </div>
        <div className="pl-road-grid">
          <div>
            <p className="pl-muted pl-lead">The next semester comes from your plan above. Pick the average you expect in each later semester.</p>
            <ol className="pl-terms">
              {futureTerms.map((t, i) => (
                <li key={`${t.year}-${t.semester}`} className={i === 0 ? "pl-term-first" : ""}>
                  <span className="pl-term-name">
                    <strong>{semesterTitle(t.year, t.semester)}</strong>
                    <span>Level {levelOf(enrollment, t.year)} · CGPA after <b>{path[i].toFixed(2)}</b></span>
                  </span>
                  {i === 0 ? (
                    <span className="pl-term-plan">From your plan: GPA {planCredits ? semGpa.toFixed(2) : "-"}</span>
                  ) : (
                    <GradePicker value={road[i - 1]} label={`Expected average for ${semesterTitle(t.year, t.semester)}`}
                      onChange={(g) => updatePlan((p) => ({ road: p.road.map((x, j) => (j === i - 1 ? g : x)) }))} />
                  )}
                </li>
              ))}
            </ol>
            {futureTerms.length > 1 && (
              <p className="pl-muted pl-small">
                Later semesters count{" "}
                <input type="number" min="6" max="30" className="rs-input pl-inline" value={current.perSemester || ""}
                  placeholder={String(estimatePerSemester)} aria-label="Credits per later semester"
                  onChange={(e) => updatePlan({ perSemester: e.target.value })} />
                {" "}credits each (your average so far is {estimatePerSemester}).
              </p>
            )}
          </div>
          <div className="pl-road-side">
            <div className="pl-finish">
              <p className="pl-answer-label">On this road you graduate with</p>
              <p className="pl-answer-big">{finalCgpa.toFixed(2)} <span>{classOf(finalCgpa)}</span></p>
              {crossing > 0 && (
                <p>You would move up to <strong>{classOf(path[crossing])}</strong> in {semesterTitle(futureTerms[crossing].year, futureTerms[crossing].semester)}.</p>
              )}
              {dropAt >= 0 && (
                <p className="pl-drop">
                  <Icon name="alert" size={16} />
                  <span>
                    Careful: you would slip to <strong>{classOf(path[dropAt])}</strong> in {semesterTitle(futureTerms[dropAt].year, futureTerms[dropAt].semester)}.
                    {" "}Raise that semester, or the ones before it, to stay in {dropAt ? classOf(path[dropAt - 1]) : startClass}.
                  </span>
                </p>
              )}
            </div>
            <table className="pl-scen pl-scen-light">
              <caption className="db-sr">Graduation under three scenarios</caption>
              <thead><tr><th scope="col">If you get</th><th scope="col">Final CGPA</th></tr></thead>
              <tbody>
                {roadScenarios.map((s) => (
                  <tr key={s.name} className={s.mine ? "mine" : ""}>
                    <th scope="row">{s.name}</th>
                    <td>{s.final.toFixed(2)} <span>{classOf(s.final)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {chartPoints.length >= 2 && <ProjectionChart points={chartPoints} bands={bands} />}
      </section>

      {/* ---------- Work backwards from a class ---------- */}
      <section className="db-card pl-target" aria-labelledby="pl-target">
        <div className="db-card-head">
          <h2 id="pl-target" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="target" size={16} /></span>
            Work backwards from a class
          </h2>
        </div>
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
              placeholder={String(estimateRemaining)} onChange={(e) => setRemaining(e.target.value)} />
            <p className="pl-muted pl-small">
              Our estimate: {semestersLeft} semester{semestersLeft === 1 ? "" : "s"} left × about {perSemester} credits = {estimateRemaining}. Change it if you know better.
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
                    {" "}({classOf(bestFinish)}), below {chosen.label} at {chosen.min.toFixed(2)}.
                  </p>
                </>
              )
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
