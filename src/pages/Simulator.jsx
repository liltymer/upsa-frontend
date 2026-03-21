import { useState } from "react";
import { simulateCGPA, getTargetGrade } from "../services/api";

const GRADE_OPTIONS = [
  { label: "A — 4.0", value: 4.0 }, { label: "B+ — 3.5", value: 3.5 },
  { label: "B — 3.0", value: 3.0 }, { label: "B- — 2.5", value: 2.5 },
  { label: "C+ — 2.0", value: 2.0 }, { label: "C — 1.5", value: 1.5 },
  { label: "C- — 1.0", value: 1.0 }, { label: "D — 0.5", value: 0.5 },
  { label: "F — 0.0", value: 0.0 },
];

const QUICK_TARGETS = [
  { label: "First Class", value: "3.6", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" },
  { label: "2nd Upper", value: "3.0", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" },
  { label: "2nd Lower", value: "2.5", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" },
];

const IconSimulator = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const IconTarget = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

const IconInfo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconUp = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,6 13.5,15.5 8.5,10.5 1,18"/>
    <polyline points="17,6 23,6 23,12"/>
  </svg>
);

const IconDown = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23,18 13.5,8.5 8.5,13.5 1,6"/>
    <polyline points="17,18 23,18 23,12"/>
  </svg>
);

const IconCheck = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20,6 9,17 4,12"/>
  </svg>
);

const IconX = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--red)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

export default function Simulator() {
  const [courses, setCourses] = useState([{ id: 1, credit_hours: 3, grade_point: 4.0 }]);
  const [simResult, setSimResult] = useState(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState("");
  const [targetCgpa, setTargetCgpa] = useState("");
  const [remainingCredits, setRemainingCredits] = useState("");
  const [targetResult, setTargetResult] = useState(null);
  const [targetLoading, setTargetLoading] = useState(false);
  const [targetError, setTargetError] = useState("");

  const addCourse = () => setCourses([...courses, { id: Date.now(), credit_hours: 3, grade_point: 4.0 }]);
  const removeCourse = (id) => { if (courses.length === 1) return; setCourses(courses.filter((c) => c.id !== id)); };
  const updateCourse = (id, field, value) => setCourses(courses.map((c) => c.id === id ? { ...c, [field]: value } : c));

  const totalCredits = courses.reduce((s, c) => s + Number(c.credit_hours), 0);
  const avgGP = totalCredits > 0 ? (courses.reduce((s, c) => s + c.grade_point * Number(c.credit_hours), 0) / totalCredits).toFixed(2) : "0.00";

  const handleSimulate = async () => {
    setSimLoading(true); setSimError(""); setSimResult(null);
    try {
      const payload = courses.map((c) => ({ credit_hours: Number(c.credit_hours), grade_point: Number(c.grade_point) }));
      const data = await simulateCGPA({ projected_courses: payload });
      setSimResult(data);
    } catch (err) { setSimError(err.response?.data?.detail || "Simulation failed. Try again."); }
    finally { setSimLoading(false); }
  };

  const handleCalculateTarget = async () => {
    if (!targetCgpa || !remainingCredits) { setTargetError("Please fill in both fields."); return; }
    setTargetLoading(true); setTargetError(""); setTargetResult(null);
    try {
      const data = await getTargetGrade(parseFloat(targetCgpa), parseInt(remainingCredits));
      setTargetResult(data);
    } catch (err) { setTargetError(err.response?.data?.detail || "Calculation failed. Try again."); }
    finally { setTargetLoading(false); }
  };

  const getSimResultStyle = (cgpa) => {
    if (cgpa >= 3.6) return { label: "First Class", color: "var(--green)", bg: "var(--green-bg)", border: "var(--green-border)" };
    if (cgpa >= 3.0) return { label: "Second Class Upper", color: "var(--blue)", bg: "var(--blue-bg)", border: "var(--blue-border)" };
    if (cgpa >= 2.5) return { label: "Second Class Lower", color: "var(--amber)", bg: "var(--amber-bg)", border: "var(--amber-border)" };
    if (cgpa >= 2.0) return { label: "Third Class", color: "var(--orange)", bg: "var(--orange-bg)", border: "var(--orange-border)" };
    if (cgpa >= 1.0) return { label: "Pass", color: "var(--text-muted)", bg: "#F9FAFB", border: "var(--border)" };
    return { label: "Fail", color: "var(--red)", bg: "var(--red-bg)", border: "var(--red-border)" };
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-page)", fontFamily: "var(--font-body)" }}>

      <div className="page-header">
        <div className="header-inner fade-up">
          <p className="page-eyebrow">Academic Planning</p>
          <h1 className="page-title">GPA Simulator</h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, maxWidth: 500, lineHeight: 1.6 }}>
            Simulate your future CGPA with hypothetical courses, or calculate the exact grade you need to reach your target.
          </p>
        </div>
      </div>

      <div className="overlap-section" style={{ paddingBottom: 60 }}>
        <div className="grid-2" style={{ gap: 24, alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card fade-up">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ color: "var(--navy)" }}><IconSimulator /></div>
                    <h3 className="section-title" style={{ marginBottom: 0 }}>CGPA Simulator</h3>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 20 }}>Add hypothetical courses to see your projected CGPA</p>
                </div>
                <button onClick={addCourse} className="btn btn-outline btn-sm" style={{ flexShrink: 0, alignSelf: "flex-start" }}>+ Add Course</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {courses.map((course) => (
                  <div key={course.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 36px", gap: 10, padding: "14px", background: "var(--bg-page)", borderRadius: "var(--radius-md)", border: "1.5px solid var(--border)", alignItems: "end" }}>
                    <div className="form-group">
                      <label className="form-label">Credit Hours</label>
                      <select value={course.credit_hours} onChange={(e) => updateCourse(course.id, "credit_hours", Number(e.target.value))} className="form-input form-select">
                        {[1, 2, 3, 4, 5, 6].map((c) => (<option key={c} value={c}>{c} Credits</option>))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Expected Grade</label>
                      <select value={course.grade_point} onChange={(e) => updateCourse(course.id, "grade_point", Number(e.target.value))} className="form-input form-select">
                        {GRADE_OPTIONS.map((g) => (<option key={g.value} value={g.value}>{g.label}</option>))}
                      </select>
                    </div>
                    <button onClick={() => removeCourse(course.id)} disabled={courses.length === 1} style={{ width: 36, height: 36, borderRadius: "var(--radius-sm)", background: courses.length === 1 ? "var(--bg-page)" : "var(--red-bg)", color: courses.length === 1 ? "var(--text-muted)" : "var(--red)", border: "1px solid " + (courses.length === 1 ? "var(--border)" : "var(--red-border)"), fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", cursor: courses.length === 1 ? "not-allowed" : "pointer" }}>x</button>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: "var(--bg-page)", borderRadius: "var(--radius-md)", marginBottom: 16 }}>
                <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-heading)", fontWeight: 500 }}>{courses.length} course{courses.length !== 1 ? "s" : ""} - {totalCredits} total credits</span>
                <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 13, color: "var(--navy)" }}>Avg GP: <strong style={{ color: "var(--gold-deep)" }}>{avgGP}</strong></span>
              </div>

              <button onClick={handleSimulate} disabled={simLoading} className="btn btn-primary btn-lg btn-full">
                {simLoading ? (<><span className="spinner" />Running simulation...</>) : "Run Simulation"}
              </button>

              {simError && <div className="alert alert-red" style={{ marginTop: 16 }}>{simError}</div>}
            </div>

            {simResult && (
              <div className="card-dark fade-up" style={{ borderRadius: "var(--radius-lg)" }}>
                {(() => {
                  const projected = simResult.projected_cgpa;
                  const current = simResult.current_cgpa;
                  const rs = getSimResultStyle(projected);
                  const diff = (projected - current).toFixed(2);
                  const isUp = projected > current;
                  const isSame = projected === current;
                  return (
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.15em", fontFamily: "var(--font-heading)", marginBottom: 16 }}>Simulation Result</p>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Current CGPA</p>
                          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 32, color: "rgba(255,255,255,0.7)" }}>{current?.toFixed(2)}</p>
                        </div>
                        <div style={{ background: "rgba(255,192,5,0.12)", border: "1px solid rgba(255,192,5,0.2)", borderRadius: "var(--radius-md)", padding: "16px" }}>
                          <p style={{ fontSize: 10, color: "rgba(255,192,5,0.6)", fontFamily: "var(--font-heading)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Projected CGPA</p>
                          <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 32, color: "var(--gold)" }}>{projected?.toFixed(2)}</p>
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          {isSame ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg> : isUp ? <IconUp /> : <IconDown />}
                          <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 15, color: isSame ? "rgba(255,255,255,0.7)" : isUp ? "#22C55E" : "#EF4444" }}>
                            {isSame ? "No change" : isUp ? "+" + diff + " improvement" : diff + " decrease"}
                          </span>
                        </div>
                        <span style={{ background: rs.bg, border: "1px solid " + rs.border, color: rs.color, fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 12, padding: "6px 14px", borderRadius: "var(--radius-full)" }}>{rs.label}</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div className="card fade-up-1">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <div style={{ color: "var(--navy)" }}><IconTarget /></div>
                <h3 className="section-title" style={{ marginBottom: 0 }}>Target Grade Calculator</h3>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 24 }}>Find out exactly what grade you need to hit your target CGPA</p>

              <div style={{ marginBottom: 20 }}>
                <p className="form-label" style={{ marginBottom: 10 }}>Quick Select Target</p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {QUICK_TARGETS.map((qt) => (
                    <button key={qt.label} onClick={() => setTargetCgpa(qt.value)} style={{ padding: "7px 14px", borderRadius: "var(--radius-full)", border: "1.5px solid " + (targetCgpa === qt.value ? qt.border : "var(--border)"), background: targetCgpa === qt.value ? qt.bg : "var(--bg-card)", color: targetCgpa === qt.value ? qt.color : "var(--text-secondary)", fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 12, cursor: "pointer", transition: "var(--transition)" }}>
                      {qt.label} ({qt.value})
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
                <div className="form-group">
                  <label className="form-label">Target CGPA</label>
                  <input type="number" min="0" max="4" step="0.01" placeholder="e.g. 3.6 for First Class" value={targetCgpa} onChange={(e) => { setTargetCgpa(e.target.value); setTargetResult(null); setTargetError(""); }} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Remaining Credit Hours</label>
                  <input type="number" min="1" placeholder="e.g. 30 credits remaining" value={remainingCredits} onChange={(e) => { setRemainingCredits(e.target.value); setTargetResult(null); setTargetError(""); }} className="form-input" />
                  <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>Total credits remaining in your programme</p>
                </div>
              </div>

              <button onClick={handleCalculateTarget} disabled={targetLoading} className="btn btn-gold btn-lg btn-full">
                {targetLoading ? (<><span className="spinner spinner-dark" />Calculating...</>) : "Calculate Target"}
              </button>

              {targetError && <div className="alert alert-red" style={{ marginTop: 16 }}>{targetError}</div>}
            </div>

            {targetResult && (
              <div className="card fade-up" style={{ border: "1.5px solid " + (targetResult.achievable ? "var(--green-border)" : "var(--red-border)"), background: targetResult.achievable ? "var(--green-bg)" : "var(--red-bg)" }}>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    {targetResult.achievable ? <IconCheck /> : <IconX />}
                    <p style={{ fontSize: 10, fontWeight: 700, color: targetResult.achievable ? "var(--green)" : "var(--red)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "var(--font-heading)" }}>
                      {targetResult.achievable ? "Target Achievable" : "Not Achievable"}
                    </p>
                  </div>
                  <p style={{ fontSize: 14, color: targetResult.achievable ? "var(--green)" : "var(--red)", lineHeight: 1.6, fontWeight: 500 }}>{targetResult.message}</p>
                </div>
                {targetResult.achievable && targetResult.required_grade_point_average != null && (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-heading)", marginBottom: 6 }}>Required Grade</p>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, color: "var(--navy)" }}>{targetResult.required_grade}</p>
                    </div>
                    <div style={{ background: "rgba(255,255,255,0.7)", borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center" }}>
                      <p style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-heading)", marginBottom: 6 }}>Required GP Average</p>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 900, fontSize: 28, color: "var(--navy)" }}>{targetResult.required_grade_point_average?.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="card fade-up-2">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ color: "var(--navy)" }}><IconInfo /></div>
                <h3 className="section-title" style={{ marginBottom: 0 }}>How These Tools Work</h3>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {[
                  { Icon: IconSimulator, title: "CGPA Simulator", desc: "Adds hypothetical courses to your existing results to project a future CGPA. No data is saved — purely for planning." },
                  { Icon: IconTarget, title: "Target Calculator", desc: "Works backwards from your target CGPA to tell you the exact grade point average you need per credit to get there." },
                ].map((item) => (
                  <div key={item.title} style={{ display: "flex", gap: 14, padding: "14px", background: "var(--bg-page)", borderRadius: "var(--radius-md)" }}>
                    <div style={{ color: "var(--navy)", flexShrink: 0, width: 44, height: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><item.Icon /></div>
                    <div>
                      <p style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: 14, color: "var(--navy)", marginBottom: 4 }}>{item.title}</p>
                      <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
