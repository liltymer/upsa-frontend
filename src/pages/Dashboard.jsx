import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../components/dashboard/dashboard.css";
import Icon from "../components/landing/Icon";
import { GradeSpreadChart, TrendChart } from "../components/dashboard/charts";
import { useProgrammes } from "../context/ProgrammeContext";
import { getActiveAnnouncements, getDashboard, getInsights } from "../services/api";
import { classStyle } from "../utils/academic";

const ACTION_ICONS = { start: "results", urgent: "alert", target: "target", trend: "chart", area: "layers", course: "results", update: "results" };

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Position within the current class band, drawn as a simple track. */
function BandMeter({ summary }) {
  const { cgpa, band_min: min, band_max: max, next_class: next, classification } = summary;
  const span = Math.max(max - min, 0.01);
  const pct = Math.min(Math.max(((cgpa - min) / span) * 100, 0), 100);
  return (
    <div className="db-meter">
      <div className="db-meter-track" role="img"
        aria-label={next ? `${cgpa.toFixed(2)} within ${classification}, ${(max - cgpa).toFixed(2)} below ${next}` : `${cgpa.toFixed(2)}, top class`}>
        <span className="db-meter-fill" style={{ width: `${pct}%` }} />
        <span className="db-meter-dot" style={{ left: `${pct}%` }} />
      </div>
      <div className="db-meter-scale">
        <span>{classification} {min.toFixed(2)}</span>
        <span>{next ? `${next} ${max.toFixed(2)}` : "4.00"}</span>
      </div>
    </div>
  );
}

function TargetEditor({ target, estimate, onChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const credits = target?.remaining_credits ?? estimate.remaining_credits;

  const save = (e) => {
    e.preventDefault();
    const n = Number(value);
    if (n >= 1 && n <= 300) {
      onChange(n);
      setEditing(false);
    }
  };

  return (
    <div className="db-target-credits">
      {editing ? (
        <form onSubmit={save} className="db-inline-form">
          <label htmlFor="remaining" className="db-sr">Credits left to take</label>
          <input id="remaining" type="number" min="1" max="300" inputMode="numeric" autoFocus
            value={value} onChange={(e) => setValue(e.target.value)} placeholder={String(credits)} />
          <button type="submit" className="db-btn db-btn-sm">Update</button>
          <button type="button" className="db-link" onClick={() => setEditing(false)}>Cancel</button>
        </form>
      ) : credits === 0 && target?.remaining_credits_estimated !== false ? (
        <p>
          Still taking courses on this programme?{" "}
          <button type="button" className="db-link" onClick={() => { setValue(""); setEditing(true); }}>
            Enter the credits you have left
          </button>
        </p>
      ) : (
        <p>
          Based on <strong>{credits} credits</strong> left
          {target?.remaining_credits_estimated !== false ? " (estimated from your programme)" : ""}.{" "}
          <button type="button" className="db-link" onClick={() => { setValue(String(credits)); setEditing(true); }}>
            Change
          </button>
          {target?.remaining_credits_estimated === false && (
            <>
              {" "}
              <button type="button" className="db-link" onClick={() => onChange(null)}>Use estimate</button>
            </>
          )}
        </p>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { selectedEnrollmentId, setSelectedId } = useProgrammes();
  const [overview, setOverview] = useState(null);
  const [insights, setInsights] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setError("");
    try {
      const [dash, ins] = await Promise.all([
        getDashboard(selectedEnrollmentId),
        getInsights(selectedEnrollmentId, remainingCredits),
      ]);
      setOverview(dash);
      setInsights(ins);
    } catch {
      setError("We could not load your dashboard. Check your connection and refresh the page.");
    } finally {
      setLoading(false);
    }
  }, [selectedEnrollmentId, remainingCredits]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    getActiveAnnouncements().then(setAnnouncements).catch(() => setAnnouncements([]));
  }, []);

  if (loading) {
    return (
      <div className="db db-loading" role="status">
        <span className="db-spinner" aria-hidden="true" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (error || !overview || !insights) {
    return (
      <div className="db">
        <div className="db-card db-error" role="alert">
          <Icon name="alert" size={22} />
          <p>{error || "Something went wrong."}</p>
          <button type="button" className="db-btn" onClick={() => { setLoading(true); load(); }}>Try again</button>
        </div>
      </div>
    );
  }

  const s = insights.summary;
  const firstName = (overview.name || "").split(/\s+/)[0];
  const cls = classStyle(s.classification || "No results yet");
  const openProgramme = (id, path) => { setSelectedId(id); navigate(path); };

  return (
    <div className="db">
      {/* ---------- Header ---------- */}
      <header className="db-header">
        <div>
          <p className="db-eyebrow">{greeting()}, {firstName}</p>
          <h1 className="db-title">Your academic overview</h1>
          <p className="db-meta">
            {overview.programme} · Level {overview.level} · {overview.index_number || "No index number"}
            {overview.status === "completed" ? " · Completed programme" : ""}
          </p>
        </div>
        <Link to="/results" className="db-btn"><Icon name="results" size={18} /> Add results</Link>
      </header>

      {overview.needs_review && (
        <div className="db-banner db-banner-warn">
          <Icon name="alert" size={20} />
          <p>We separated your diploma results from your degree so each has its own CGPA. Please confirm your programme details.</p>
          <Link to="/profile" className="db-link">Review programmes</Link>
        </div>
      )}

      {announcements.map((a) => (
        <div key={a.id} className={`db-banner db-banner-${a.priority === "urgent" ? "urgent" : "info"}`}>
          <Icon name="bell" size={20} />
          <p><strong>{a.title}.</strong> {a.message}</p>
        </div>
      ))}

      {!insights.has_results ? (
        <section className="db-card db-empty">
          <div className="db-empty-icon"><Icon name="results" size={30} /></div>
          <h2>Start with your result slip</h2>
          <p>Add each course with its credit hours and grade. Your GPA, CGPA, class, strengths and weaknesses will appear here straight away.</p>
          <Link to="/results" className="db-btn">Add your first results</Link>
        </section>
      ) : (
        <>
          {/* ---------- Where you stand ---------- */}
          <section className="db-stats" aria-label="Where you stand">
            <article className="db-card db-standing">
              <p className="db-label">Cumulative GPA</p>
              <div className="db-cgpa-row">
                <strong className="db-cgpa">{s.cgpa.toFixed(2)}</strong>
                <span className="db-pill" style={{ color: cls.color, background: cls.bg, borderColor: cls.border }}>{s.classification}</span>
              </div>
              <BandMeter summary={s} />
              <p className="db-note">
                {s.next_class
                  ? <><strong>{s.gap_to_next_class.toFixed(2)}</strong> to {s.next_class}</>
                  : "You are in the top class. Keep it steady."}
              </p>
            </article>

            <article className="db-card db-stat">
              <p className="db-label">Latest semester</p>
              <strong className="db-stat-value">{s.latest_gpa.toFixed(2)}</strong>
              <p className="db-stat-sub">{s.latest_title}</p>
              {s.direction && (
                <p className={`db-trend db-trend-${s.direction}`}>
                  <Icon name={s.direction === "declining" ? "arrowDownRight" : s.direction === "improving" ? "arrowUp" : "arrowRight"} size={16} strokeWidth={2.4} />
                  {s.direction === "improving" && `Up from ${s.previous_gpa.toFixed(2)}`}
                  {s.direction === "declining" && `Down from ${s.previous_gpa.toFixed(2)}`}
                  {s.direction === "steady" && "Same as the semester before"}
                </p>
              )}
            </article>

            <article className="db-card db-stat">
              <p className="db-label">Progress</p>
              <strong className="db-stat-value">{s.credits_completed}</strong>
              <p className="db-stat-sub">credits from {s.courses_completed} courses</p>
              <div className="db-progress" aria-label={`${insights.estimate.semesters_done} of ${insights.estimate.total_semesters} semesters recorded`}>
                {Array.from({ length: insights.estimate.total_semesters }, (_, i) => (
                  <span key={i} className={i < insights.estimate.semesters_done ? "on" : ""} />
                ))}
              </div>
              <p className="db-note">{insights.estimate.semesters_done} of {insights.estimate.total_semesters} semesters recorded</p>
            </article>
          </section>

          {/* ---------- Next steps ---------- */}
          {insights.actions.length > 0 && (
            <section className="db-card" aria-labelledby="db-next">
              <div className="db-card-head">
                <h2 id="db-next" className="db-h2">What to do next</h2>
              </div>
              <ol className="db-actions">
                {insights.actions.map((a) => (
                  <li key={a.title} className={`db-action db-action-${a.kind}`}>
                    <span className="db-action-icon"><Icon name={ACTION_ICONS[a.kind] || "arrowRight"} size={20} /></span>
                    <div>
                      <h3>{a.title}</h3>
                      <p>{a.body}</p>
                    </div>
                    <Link to={a.link} className="db-action-link" aria-label={`Open: ${a.title}`}><Icon name="arrowRight" size={18} /></Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* ---------- Trend and target ---------- */}
          <div className="db-grid db-grid-wide">
            <section className="db-card" aria-labelledby="db-trend">
              <div className="db-card-head">
                <h2 id="db-trend" className="db-h2">GPA over time</h2>
                <Link to="/gpa" className="db-link">Details</Link>
              </div>
              <TrendChart history={insights.history} bands={insights.classification_bands} />
            </section>

            <section className="db-card db-target" aria-labelledby="db-target">
              <div className="db-card-head">
                <h2 id="db-target" className="db-h2">Your next class</h2>
              </div>
              {!s.next_class ? (
                <p className="db-body">You are already in the highest class. Keep your semester GPAs at this level to hold it.</p>
              ) : insights.target ? (
                insights.target.achievable ? (
                  <>
                    <p className="db-target-lead">To reach <strong>{insights.target.target_class}</strong> ({insights.target.target_cgpa.toFixed(2)}), aim for an average of</p>
                    <p className="db-target-grade"><strong>{insights.target.required_grade}</strong><span>{insights.target.required_average.toFixed(2)} grade points per credit</span></p>
                  </>
                ) : (
                  <>
                    <p className="db-target-lead"><strong>{insights.target.target_class}</strong> is out of reach with the credits left.</p>
                    <p className="db-body">The highest CGPA still possible is <strong>{insights.target.max_possible_cgpa.toFixed(2)}</strong>. Focus on holding your {s.classification}.</p>
                  </>
                )
              ) : (
                <p className="db-body">All the semesters for this programme are recorded, so your CGPA is final unless a result changes.</p>
              )}
              {s.next_class && (
                <TargetEditor target={insights.target} estimate={insights.estimate} onChange={setRemainingCredits} />
              )}
              <Link to="/planner" className="db-btn db-btn-ghost">Open the planner</Link>
            </section>
          </div>

          {/* ---------- Strengths and weaknesses ---------- */}
          <div className="db-grid">
            <section className="db-card" aria-labelledby="db-down">
              <div className="db-card-head">
                <h2 id="db-down" className="db-h2">Pulling your CGPA down</h2>
              </div>
              {insights.pulling_down.length ? (
                <ul className="db-courses">
                  {insights.pulling_down.map((c) => (
                    <li key={c.result_id}>
                      <span className="db-grade db-grade-low">{c.grade}</span>
                      <div><strong>{c.course_code}</strong> {c.course_name}<small>{c.credit_hours} credits · {c.academic_year} S{c.semester}</small></div>
                      <span className="db-impact">{c.impact.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              ) : <p className="db-body">No course is below your CGPA. That is a strong, even record.</p>}
              <p className="db-note">Impact is how far each course sits below your CGPA, multiplied by its credits.</p>
            </section>

            <section className="db-card" aria-labelledby="db-up">
              <div className="db-card-head">
                <h2 id="db-up" className="db-h2">Your strongest courses</h2>
              </div>
              {insights.strongest.length ? (
                <ul className="db-courses">
                  {insights.strongest.map((c) => (
                    <li key={c.result_id}>
                      <span className="db-grade db-grade-high">{c.grade}</span>
                      <div><strong>{c.course_code}</strong> {c.course_name}<small>{c.credit_hours} credits · {c.academic_year} S{c.semester}</small></div>
                    </li>
                  ))}
                </ul>
              ) : <p className="db-body">No A or B+ grades yet. Your first ones will show here.</p>}
            </section>
          </div>

          <div className="db-grid">
            <section className="db-card" aria-labelledby="db-areas">
              <div className="db-card-head">
                <h2 id="db-areas" className="db-h2">By subject area</h2>
              </div>
              <ul className="db-areas">
                {insights.areas.map((a) => (
                  <li key={a.area}>
                    <div className="db-area-head">
                      <strong>{a.area}</strong>
                      <span>{a.courses} courses · {a.credits} credits</span>
                      <b>{a.gpa.toFixed(2)}</b>
                    </div>
                    <div className="db-area-track" role="img" aria-label={`${a.area} average ${a.gpa.toFixed(2)} out of 4, CGPA ${s.cgpa.toFixed(2)}`}>
                      <span className="db-area-fill" style={{ width: `${(a.gpa / 4) * 100}%` }} />
                      <span className="db-area-cgpa" style={{ left: `${(s.cgpa / 4) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <p className="db-note"><span className="db-cgpa-mark" aria-hidden="true" /> marks your CGPA. Areas are grouped by course code.</p>
            </section>

            <section className="db-card" aria-labelledby="db-spread">
              <div className="db-card-head">
                <h2 id="db-spread" className="db-h2">Grade spread</h2>
              </div>
              <GradeSpreadChart distribution={insights.grade_distribution} />
            </section>
          </div>
        </>
      )}

      {/* ---------- Academic history ---------- */}
      {overview.other_programmes?.length > 0 && (
        <section className="db-card" aria-labelledby="db-history">
          <div className="db-card-head">
            <h2 id="db-history" className="db-h2">Academic history</h2>
          </div>
          <div className="db-history">
            {overview.other_programmes.map((p) => {
              const pc = classStyle(p.classification);
              return (
                <article key={p.id} className="db-history-item">
                  <div>
                    <h3>{p.programme}</h3>
                    <p>{p.index_number || "Index number not added"} · {p.status === "completed" ? "Completed" : "Active"}</p>
                  </div>
                  <div className="db-history-score">
                    <strong>{p.cgpa.toFixed(2)}</strong>
                    {p.classification && <span className="db-pill" style={{ color: pc.color, background: pc.bg, borderColor: pc.border }}>{p.classification}</span>}
                  </div>
                  <div className="db-history-links">
                    <button type="button" className="db-link" onClick={() => openProgramme(p.id, "/dashboard")}>View dashboard</button>
                    <button type="button" className="db-link" onClick={() => openProgramme(p.id, "/transcript")}>Transcript</button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
