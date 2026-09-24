import { useCallback, useEffect, useMemo, useState } from "react";
import Icon from "../components/landing/Icon";
import AddSemester from "../components/results/AddSemester";
import CourseDialog from "../components/results/CourseDialog";
import { Dialog, Menu, Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import { useProgrammes } from "../context/ProgrammeContext";
import useReferenceData from "../hooks/useReferenceData";
import {
  addResult, addSemester, deleteResult, getCourses, getErrorMessage, getMyResults, moveResults,
} from "../services/api";
import { nextTerm, semesterTitle, yearsFrom } from "../utils/academic";

const FILTERS = [
  { key: "all", label: "All grades", grades: null },
  { key: "A", label: "A", grades: ["A"] },
  { key: "B", label: "B range", grades: ["B+", "B", "B-"] },
  { key: "C", label: "C range", grades: ["C+", "C", "C-"] },
  { key: "DF", label: "D or F", grades: ["D", "F"] },
];

const termKey = (s) => `${s.academic_year}-${s.semester}`;
const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;

export default function Results() {
  const { selectedEnrollmentId, enrollments, refresh: refreshProgrammes } = useProgrammes();
  const { academic_years: academicYears, grade_scale: gradeScale } = useReferenceData();
  const [data, setData] = useState(null);
  const [catalogue, setCatalogue] = useState([]);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [openKeys, setOpenKeys] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  const load = useCallback(async () => {
    try {
      const res = await getMyResults(selectedEnrollmentId);
      setData(res);
      setLoadError("");
    } catch (err) {
      setLoadError(getErrorMessage(err, "Could not load your results."));
    }
  }, [selectedEnrollmentId]);

  useEffect(() => {
    let active = true;
    getMyResults(selectedEnrollmentId)
      .then((res) => active && setData(res))
      .catch((err) => active && setLoadError(getErrorMessage(err, "Could not load your results.")));
    return () => { active = false; };
  }, [selectedEnrollmentId]);
  useEffect(() => {
    getCourses().then(setCatalogue).catch(() => {
      // The course list only powers suggestions; typing still works without it
    });
  }, []);

  const semesters = useMemo(() => data?.semesters || [], [data]);
  const enrollment = data?.enrollment;
  const gradePoints = useMemo(
    () => Object.fromEntries((gradeScale || []).map((g) => [g.grade, g.grade_point])), [gradeScale]);
  const years = yearsFrom(enrollment?.start_academic_year, academicYears);

  // Courses this student typed before also appear in the code suggestions
  const courseOptions = useMemo(() => {
    const byCode = new Map(catalogue.map((c) => [c.code, c]));
    (data?.results || []).forEach((r) => {
      if (!byCode.has(r.course_code)) byCode.set(r.course_code, { code: r.course_code, name: r.course_name, credit_hours: r.credit_hours });
    });
    return [...byCode.values()];
  }, [catalogue, data]);

  const afterChange = async (msg, action) => {
    setDialog(null);
    await load();
    refreshProgrammes();
    setToast({ msg, action });
  };

  const removeCourse = async (r) => {
    try {
      await deleteResult(r.result_id);
      await afterChange(`${r.course_code} deleted.`, {
        label: "Undo",
        onClick: async () => {
          try {
            await addResult({
              course_code: r.course_code, course_name: r.course_name, credit_hours: r.credit_hours,
              grade: r.grade, academic_year: r.academic_year, semester: r.semester, enrollment_id: enrollment?.id,
            });
            await afterChange(`${r.course_code} restored.`);
          } catch (err) {
            setToast({ msg: getErrorMessage(err, "Could not restore it."), type: "error" });
          }
        },
      });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "Could not delete it."), type: "error" });
    }
  };

  const removeSemester = async (s) => {
    try {
      await Promise.all(s.results.map((r) => deleteResult(r.result_id)));
      await afterChange(`${semesterTitle(s.academic_year, s.semester)} deleted.`, {
        label: "Undo",
        onClick: async () => {
          try {
            await addSemester({
              academic_year: s.academic_year, semester: s.semester, enrollment_id: enrollment?.id,
              courses: s.results.map(({ course_code, course_name, credit_hours, grade }) => ({ course_code, course_name, credit_hours, grade })),
            });
            await afterChange(`${semesterTitle(s.academic_year, s.semester)} restored.`);
          } catch (err) {
            setToast({ msg: getErrorMessage(err, "Could not restore it."), type: "error" });
          }
        },
      });
    } catch (err) {
      setDialog(null);
      await load();
      setToast({ msg: getErrorMessage(err, "Could not delete the semester."), type: "error" });
    }
  };

  if (loadError && !data) {
    return (
      <div className="db rs">
        <div className="db-card rs-empty">
          <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {loadError}</p>
          <button type="button" className="db-btn" onClick={load}>Try again</button>
        </div>
      </div>
    );
  }
  if (!data) {
    return <div className="db db-loading"><div className="db-spinner" /><p>Loading your results...</p></div>;
  }

  // Search and grade filter
  const q = query.trim().toLowerCase();
  const allowed = FILTERS.find((f) => f.key === filter)?.grades;
  const filtering = Boolean(q || allowed);
  const matches = (r) => (!q || r.course_code.toLowerCase().includes(q) || r.course_name.toLowerCase().includes(q))
    && (!allowed || allowed.includes(r.grade));

  const newestFirst = [...semesters].reverse();
  const shown = newestFirst
    .map((s) => ({ ...s, visible: filtering ? s.results.filter(matches) : s.results }))
    .filter((s) => s.visible.length);
  const opened = openKeys || new Set(newestFirst.slice(0, 1).map(termKey));
  const toggle = (key) => {
    const next = new Set(opened);
    if (next.has(key)) next.delete(key); else next.add(key);
    setOpenKeys(next);
  };

    const others = enrollments.filter((e) => e.id !== enrollment?.id);
  const defaultTerm = nextTerm(semesters, enrollment?.start_academic_year, years);
  const matchCount = shown.reduce((n, s) => n + s.visible.length, 0);

  return (
    <div className="db rs">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Results</p>
          <h1 className="db-title">Your results</h1>
          <p className="db-meta">
            {enrollment?.programme} · {enrollment?.level_label}
            {enrollment?.status === "completed" && " · You can still correct results"}
          </p>
        </div>
        <div className="rs-head-actions">
          <button type="button" className="db-btn db-btn-ghost" onClick={() => setDialog({ type: "course", term: defaultTerm })}>
            <Icon name="plus" size={18} /> Add one course
          </button>
          <button type="button" className="db-btn" onClick={() => setDialog({ type: "semester" })}>
            <Icon name="results" size={18} /> Add a semester
          </button>
        </div>
      </header>

      {semesters.length === 0 ? (
        <section className="db-card rs-empty">
          <span className="rs-empty-icon"><Icon name="results" size={28} /></span>
          <h2 className="db-h2">Add your first semester</h2>
          <ol className="rs-steps">
            <li><strong>Get your result slip</strong> from the UPSA student portal.</li>
            <li><strong>Pick the semester.</strong> We fill in its usual courses for your programme.</li>
            <li><strong>Tap a grade on each course</strong> and save. Your GPA and CGPA appear straight away.</li>
          </ol>
          <button type="button" className="db-btn" onClick={() => setDialog({ type: "semester" })}>
            <Icon name="plus" size={18} /> Add a semester
          </button>
        </section>
      ) : (
        <>
          <section className="rs-summary" aria-label="Summary">
            <div className="rs-sum rs-sum-main">
              <span className="rs-sum-icon"><Icon name="target" size={22} /></span>
              <div>
                <p>CGPA</p>
                <strong>{enrollment.cgpa.toFixed(2)}</strong>
                {enrollment.classification && <span className="rs-sum-pill">{enrollment.classification}</span>}
              </div>
            </div>
            <div className="rs-sum">
              <span className="rs-sum-icon"><Icon name="layers" size={22} /></span>
              <div><p>Credits</p><strong>{enrollment.total_credits}</strong></div>
            </div>
            <div className="rs-sum">
              <span className="rs-sum-icon"><Icon name="chart" size={22} /></span>
              <div><p>Semesters</p><strong>{semesters.length}</strong></div>
            </div>
            <div className="rs-sum">
              <span className="rs-sum-icon"><Icon name="results" size={22} /></span>
              <div><p>Courses</p><strong>{data.total_results}</strong></div>
            </div>
          </section>

          <div className="rs-toolbar">
            <label className="rs-search">
              <Icon name="search" size={18} />
              <span className="db-sr">Search your courses</span>
              <input type="search" placeholder="Search by code or title" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <div className="rs-filters" role="group" aria-label="Filter by grade">
              {FILTERS.map((f) => (
                <button key={f.key} type="button" aria-pressed={filter === f.key}
                  className={filter === f.key ? "on" : ""} onClick={() => setFilter(f.key)}>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          {filtering && (
            <p className="rs-filter-note" aria-live="polite">
              {matchCount ? `${plural(matchCount, "course")} found.` : "No courses match."}{" "}
              <button type="button" className="db-link" onClick={() => { setQuery(""); setFilter("all"); }}>Clear</button>
            </p>
          )}

          <div className="rs-semesters">
            {shown.map((s) => {
              const key = termKey(s);
              const isOpen = filtering || opened.has(key);
              const index = semesters.findIndex((x) => termKey(x) === key);
              const previous = semesters[index - 1];
              const change = previous ? s.gpa - previous.gpa : null;
              const below = s.visible.filter((r) => r.grade_point < s.gpa);
              return (
                <section key={key} className={`db-card rs-sem${isOpen ? " open" : ""}`}>
                  <div className="rs-sem-head">
                    <button type="button" className="rs-sem-toggle" aria-expanded={isOpen} onClick={() => toggle(key)}>
                      <span className="rs-chevron"><Icon name="chevronDown" size={18} /></span>
                      <span className="rs-sem-title">
                        <strong>{semesterTitle(s.academic_year, s.semester)}</strong>
                        <span>Level {s.level} · {plural(s.results.length, "course")} · {s.total_credits} credits</span>
                        <GradeStrip results={s.results} />
                      </span>
                      <span className="rs-sem-figures">
                        <span className="rs-sem-gpa">
                          <small>Semester GPA</small>
                          <strong>{s.gpa.toFixed(2)}</strong>
                        </span>
                        {(change === null || Math.abs(change) < 0.005) && <span className="rs-change rs-change-none" aria-hidden="true" />}
                        {change !== null && Math.abs(change) >= 0.005 && (
                          <span className={`rs-change ${change > 0 ? "up" : "down"}`}>
                            <Icon name={change > 0 ? "arrowUp" : "arrowDownRight"} size={14} strokeWidth={2.4} />
                            {Math.abs(change).toFixed(2)}
                            <span className="db-sr">{change > 0 ? "higher" : "lower"} than the semester before</span>
                          </span>
                        )}
                        <span className="rs-sem-cgpa">CGPA after <strong>{s.cgpa.toFixed(2)}</strong></span>
                      </span>
                    </button>
                    <Menu label={`Options for ${semesterTitle(s.academic_year, s.semester)}`} items={[
                      { label: "Add a course here", icon: "plus",
                        onClick: () => setDialog({ type: "course", term: { year: s.academic_year, semester: s.semester } }) },
                      others.length > 0 && { label: "Move to another programme", icon: "swap", onClick: () => setDialog({ type: "move", sem: s }) },
                      { label: "Delete semester", icon: "trash", danger: true, onClick: () => setDialog({ type: "deleteSemester", sem: s }) },
                    ]} />
                  </div>

                  {isOpen && (
                    <div className="rs-sem-body">
                      <div className="rs-table" role="table" aria-label={`Courses in ${semesterTitle(s.academic_year, s.semester)}`}>
                        <div className="rs-tr rs-th" role="row">
                          <span role="columnheader">Code</span>
                          <span role="columnheader">Course</span>
                          <span role="columnheader">Credits</span>
                          <span role="columnheader">Grade</span>
                          <span role="columnheader">Points</span>
                          <span role="columnheader"><span className="db-sr">Actions</span></span>
                        </div>
                        {s.visible.map((r) => {
                          const low = r.grade_point < s.gpa;
                          return (
                            <div key={r.result_id} className={`rs-tr${low ? " rs-low" : ""}`} role="row">
                              <span role="cell" className="rs-td-code">
                                {low && <span className="rs-low-dot" title="Below this semester's GPA" />}
                                {r.course_code}
                              </span>
                              <span role="cell" className="rs-td-name">{r.course_name}</span>
                              <span role="cell" className="rs-td-cr">{r.credit_hours}<span className="rs-cr-word"> credits</span></span>
                              <span role="cell"><span className={`rs-grade-chip rs-g-${r.grade.replace("+", "p").replace("-", "m")}`}>{r.grade}</span></span>
                              <span role="cell" className="rs-td-gp">{r.grade_point.toFixed(1)}</span>
                              <span role="cell" className="rs-td-act">
                                <Menu label={`Options for ${r.course_code}`} items={[
                                  { label: "Edit", icon: "pencil", onClick: () => setDialog({ type: "course", result: r }) },
                                  { label: "Delete", icon: "trash", danger: true, onClick: () => removeCourse(r) },
                                ]} />
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      {below.length > 0 && (
                        <p className="rs-legend"><span className="rs-low-dot" aria-hidden="true" /> Graded below this semester's GPA ({s.gpa.toFixed(2)})</p>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </>
      )}

      {dialog?.type === "semester" && (
        <AddSemester
          enrollment={enrollment}
          enrollmentId={selectedEnrollmentId}
          semesters={semesters}
          catalogue={courseOptions}
          gradePoints={gradePoints}
          years={years}
          initialTerm={defaultTerm}
          onClose={() => setDialog(null)}
          onSaved={(msg) => {
            setOpenKeys(null);
            afterChange(msg);
          }}
        />
      )}
      {dialog?.type === "course" && (
        <CourseDialog
          result={dialog.result}
          initialTerm={dialog.term || defaultTerm}
          years={years}
          catalogue={courseOptions}
          enrollment={enrollment}
          onClose={() => setDialog(null)}
          onSaved={(msg) => afterChange(msg)}
        />
      )}
      {dialog?.type === "deleteSemester" && (
        <Dialog
          title={`Delete ${semesterTitle(dialog.sem.academic_year, dialog.sem.semester)}?`}
          subtitle={`All ${plural(dialog.sem.results.length, "course")} in this semester will be removed. You can undo straight after.`}
          onClose={() => setDialog(null)}
          footer={(
            <>
              <button type="button" className="db-btn db-btn-ghost" onClick={() => setDialog(null)}>Keep it</button>
              <button type="button" className="db-btn rs-btn-danger" onClick={() => removeSemester(dialog.sem)}>
                <Icon name="trash" size={18} /> Delete semester
              </button>
            </>
          )}
        />
      )}
      {dialog?.type === "move" && (
        <MoveDialog sem={dialog.sem} programmes={others} onClose={() => setDialog(null)}
          onMoved={(msg) => afterChange(msg)} />
      )}

      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}

const GRADE_ORDER = ["A", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];
const gradeFamily = (g) => (g === "A" ? "a" : g.startsWith("B") ? "b" : g === "C-" ? "cm" : g.startsWith("C") ? "c" : "df");

/** A semester's grades at a glance: one bar per course, widths by credits, best grades first. */
function GradeStrip({ results }) {
  const sorted = [...results].sort((x, y) => GRADE_ORDER.indexOf(x.grade) - GRADE_ORDER.indexOf(y.grade));
  const counts = GRADE_ORDER.map((g) => [g, results.filter((r) => r.grade === g).length]).filter(([, n]) => n);
  return (
    <span className="rs-strip" role="img" aria-label={`Grades: ${counts.map(([g, n]) => `${n} ${g}`).join(", ")}`}>
      {sorted.map((r) => (
        <span key={r.result_id} className={`rs-strip-${gradeFamily(r.grade)}`} style={{ flexGrow: r.credit_hours }} title={`${r.course_code}: ${r.grade}`} />
      ))}
    </span>
  );
}

/** Top-up students: move a semester typed into the wrong programme. */
function MoveDialog({ sem, programmes, onClose, onMoved }) {
  const [target, setTarget] = useState(String(programmes[0]?.id || ""));
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const move = async () => {
    setSaving(true);
    try {
      const res = await moveResults(sem.results.map((r) => r.result_id), Number(target));
      onMoved(res.message);
    } catch (err) {
      setError(getErrorMessage(err, "Could not move the semester."));
      setSaving(false);
    }
  };
  return (
    <Dialog
      title="Move to another programme"
      subtitle={`${semesterTitle(sem.academic_year, sem.semester)}, ${plural(sem.results.length, "course")}`}
      onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="button" className="db-btn" onClick={move} disabled={saving || !target}>{saving ? "Moving..." : "Move semester"}</button>
        </>
      )}
    >
      <div className="rs-field">
        <label className="rs-label" htmlFor="rs-move">Move to</label>
        <select id="rs-move" className="rs-input" value={target} onChange={(e) => setTarget(e.target.value)}>
          {programmes.map((p) => <option key={p.id} value={p.id}>{p.programme}</option>)}
        </select>
      </div>
      <p className="rs-note"><Icon name="info" size={18} /> Use this if diploma results were added to your degree, or the other way round.</p>
      {error && <p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p>}
    </Dialog>
  );
}
