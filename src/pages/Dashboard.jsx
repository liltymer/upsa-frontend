import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../components/dashboard/dashboard.css";
import Icon from "../components/landing/Icon";
import Help from "../components/dashboard/Help";
import { GradeSpreadChart, TrendChart } from "../components/dashboard/charts";
import { useAuth } from "../context/AuthContext";
import { useProgrammes } from "../context/ProgrammeContext";
import useCached from "../hooks/useCached";
import { PageSkeleton } from "../components/ui/Loading";
import { downloadTranscript, getActiveAnnouncements, getDashboard, getInsights, setAreaLabel } from "../services/api";
import { classStyle } from "../utils/academic";
import campusPhoto from "../assets/landing/campus-13-800.webp";

const ACTION_ICONS = { start: "results", urgent: "alert", target: "target", trend: "chart", area: "layers", course: "results", update: "results", topup: "layers" };
const TABS = [
  { id: "overview", label: "Overview" },
  { id: "strengths", label: "Strengths and weaknesses" },
];

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const storageGet = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const storageSet = (key, value) => { try { localStorage.setItem(key, value); } catch { /* not remembered */ } };

/** "JOSHH" -> "Joshh"; names typed normally are left alone. */
function niceName(name) {
  if (!name) return "";
  return name === name.toUpperCase()
    ? name.toLowerCase().replace(/(^|[\s-])\S/g, (c) => c.toUpperCase())
    : name;
}

/** CGPA as a gold ring out of 4.00. */
function CgpaRing({ value }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(value / 4, 0), 1);
  return (
    <div className="db-ring" role="img" aria-label={`CGPA ${value.toFixed(2)} out of 4.00`}>
      <svg viewBox="0 0 128 128" width="128" height="128" aria-hidden="true">
        <circle cx="64" cy="64" r={r} className="db-ring-track" />
        <circle cx="64" cy="64" r={r} className="db-ring-fill" strokeDasharray={`${c * pct} ${c}`} />
      </svg>
      <div className="db-ring-text">
        <strong>{value.toFixed(2)}</strong>
        <span>of 4.00</span>
      </div>
    </div>
  );
}

/** One plain sentence that answers "how am I doing?" */
function headline(s, overview) {
  if (overview?.completed) {
    const award = overview.award_type === "diploma" ? "diploma" : "degree";
    return { main: `You finished your ${award} with ${s.classification}.`, sub: `Final CGPA ${s.cgpa.toFixed(2)} across ${s.credits_completed} credits.` };
  }
  if (!s.next_class) return { main: `You're in ${s.classification}, the highest class.`, sub: "Keep your semester GPAs at this level to hold it." };
  const main = `You're in ${s.classification}, ${s.gap_to_next_class.toFixed(2)} away from ${s.next_class}.`;
  let sub = "";
  if (s.best_semester && s.latest_title === s.best_semester.title && s.semesters_completed > 1) sub = `Your latest semester (${s.latest_gpa.toFixed(2)}) was your best so far.`;
  else if (s.direction === "improving") sub = `Your GPA went up last semester, from ${s.previous_gpa.toFixed(2)} to ${s.latest_gpa.toFixed(2)}.`;
  else if (s.direction === "declining") sub = `Your GPA went down last semester, from ${s.previous_gpa.toFixed(2)} to ${s.latest_gpa.toFixed(2)}.`;
  return { main, sub };
}

function Effect({ value }) {
  const n = Math.abs(value).toFixed(2);
  const sign = value < 0 ? "-" : value > 0 ? "+" : "";
  const sentence = value < 0 ? `Lowered your CGPA by ${n}` : value > 0 ? `Raised your CGPA by ${n}` : "No effect on your CGPA";
  return (
    <span className={`db-effect ${value < 0 ? "db-effect-down" : "db-effect-up"}`} title={sentence}>
      <span aria-hidden="true"><b>{sign}{n}</b> CGPA</span>
      <span className="db-sr">{sentence}</span>
    </span>
  );
}

/** Position within the current class band. */
function BandMeter({ summary }) {
  const { cgpa, band_min: min, band_max: max, next_class: next, classification } = summary;
  const pct = Math.min(Math.max(((cgpa - min) / Math.max(max - min, 0.01)) * 100, 0), 100);
  return (
    <div className="db-meter">
      <div className="db-meter-track" role="img"
        aria-label={next ? `${cgpa.toFixed(2)} within ${classification}, ${(max - cgpa).toFixed(2)} below ${next}` : `${cgpa.toFixed(2)}, top class`}>
        <span className="db-meter-fill" style={{ width: `${pct}%` }} />
        <span className="db-meter-dot" style={{ left: `${pct}%` }} />
      </div>
      <div className="db-meter-scale">
        <span>{classification} starts at {min.toFixed(2)}</span>
        <span>{next ? `${next} at ${max.toFixed(2)}` : "4.00"}</span>
      </div>
    </div>
  );
}

const STAGE_ICONS = { not_started: "results", top_up_start: "layers", early: "chart", middle: "chart", final: "target", complete: "check", completed_programme: "check" };

const shortSem = (h) => `${h.academic_year.slice(2, 4)}/${h.academic_year.slice(7, 9)} S${h.semester}`;

/** Where the student is in the programme, drawn as a semester timeline. */
function StageCard({ stage, history = [], topUpLink }) {
  if (!stage?.key) return null;
  const range = stage.finish || stage.next_semester;
  const steps = Array.from({ length: stage.total_semesters }, (_, i) => ({
    done: i < stage.semesters_done,
    next: i === stage.semesters_done,
    label: history[i] ? shortSem(history[i]) : `Sem ${i + 1}`,
  }));
  return (
    <section className="db-card db-stage db-rise" aria-labelledby="db-stage-title">
      <div className="db-stage-head">
        <span className="db-stage-icon"><Icon name={STAGE_ICONS[stage.key] || "chart"} size={22} /></span>
        <div>
          <p className="db-label">Where you are</p>
          <h2 id="db-stage-title" className="db-h2">{stage.title}</h2>
        </div>
        <span className="db-stage-count">{stage.label}</span>
      </div>

      <ol className="db-timeline" aria-label={stage.label}>
        {steps.map((st, i) => (
          <li key={i} className={st.done ? "done" : st.next ? "next" : ""}>
            <span className="db-timeline-dot">{st.done ? <Icon name="check" size={13} strokeWidth={3} /> : i + 1}</span>
            <span className="db-timeline-label">{st.label}</span>
          </li>
        ))}
      </ol>

      <div className={`db-stage-body${range ? "" : " db-stage-body-single"}`}>
        <div className="db-stage-text">
          {stage.messages.map((m, i) => <p key={m} className={`db-stage-msg${i === 0 ? " db-stage-lead" : ""}`}>{m}</p>)}
          {topUpLink && <Link to="/profile" className="db-btn db-btn-sm db-stage-cta">Add my top-up <Icon name="arrowRight" size={16} /></Link>}
        </div>
        {range && (
          <div className="db-stage-range">
            <p className="db-label">{stage.finish ? `Where you can finish (${stage.finish.remaining_credits} credits left)` : "Next semester could leave you at"}</p>
            <div className="db-range-row">
              <div className="db-range-cell">
                <small>Averaging C</small>
                <strong>{range.with_c.toFixed(2)}</strong>
                <span>{range.with_c_class}</span>
              </div>
              <span className="db-range-to" aria-hidden="true">to</span>
              <div className="db-range-cell db-range-best">
                <small>Straight A's</small>
                <strong>{range.best.toFixed(2)}</strong>
                <span>{range.best_class}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Checklist({ items, onDismiss }) {
  const done = items.filter((i) => i.done).length;
  return (
    <section className="db-card db-checklist" aria-labelledby="db-start">
      <div className="db-card-head">
        <div>
          <h2 id="db-start" className="db-h2">Get set up</h2>
          <p className="db-note db-note-tight">{done} of {items.length} done</p>
        </div>
        <button type="button" className="db-link" onClick={onDismiss}>Hide</button>
      </div>
      <div className="db-checklist-bar"><span style={{ width: `${(done / items.length) * 100}%` }} /></div>
      <ul className="db-checklist-items">
        {items.map((item) => (
          <li key={item.label} className={item.done ? "done" : ""}>
            <span className="db-check" aria-hidden="true">{item.done && <Icon name="check" size={14} strokeWidth={3} />}</span>
            <span className="db-check-text">{item.label}<span className="db-sr">{item.done ? " (done)" : " (to do)"}</span></span>
            {!item.done && <Link to={item.link} className="db-link">{item.cta}</Link>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function TargetEditor({ target, estimate, onChange }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState("");
  const credits = target?.remaining_credits ?? estimate.remaining_credits;
  const custom = target?.remaining_credits_estimated === false;

  const save = (e) => {
    e.preventDefault();
    const n = Number(value);
    if (n >= 1 && n <= 300) { onChange(n); setEditing(false); }
  };

  if (editing) {
    return (
      <form onSubmit={save} className="db-target-credits db-inline-form">
        <label htmlFor="remaining">Credits you still have to take</label>
        <input id="remaining" type="number" min="1" max="300" inputMode="numeric" autoFocus
          value={value} onChange={(e) => setValue(e.target.value)} placeholder="e.g. 36" />
        <button type="submit" className="db-btn db-btn-sm">Update</button>
        <button type="button" className="db-link" onClick={() => setEditing(false)}>Cancel</button>
      </form>
    );
  }
  return (
    <div className="db-target-credits">
      {credits === 0 && !custom ? (
        <p>Still taking courses on this programme? <button type="button" className="db-link" onClick={() => { setValue(""); setEditing(true); }}>Enter the credits you have left</button></p>
      ) : (
        <p>
          Worked out for <strong>{credits} credits</strong> still to take{custom ? "" : " (our estimate)"}.{" "}
          <button type="button" className="db-link" onClick={() => { setValue(String(credits)); setEditing(true); }}>Change</button>
          {custom && <>{" "}<button type="button" className="db-link" onClick={() => onChange(null)}>Use estimate</button></>}
        </p>
      )}
    </div>
  );
}

function AreaRow({ area, cgpa, enrollmentId, onSaved }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(area.label);
  const [saving, setSaving] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setAreaLabel(enrollmentId, area.area, name.trim());
      setEditing(false);
      onSaved();
    } finally {
      setSaving(false);
    }
  };

  const diff = area.gpa - cgpa;
  return (
    <li>
      {editing ? (
        <form className="db-inline-form db-area-form" onSubmit={save}>
          <label htmlFor={`area-${area.area}`} className="db-sr">Name for {area.area} courses</label>
          <input id={`area-${area.area}`} value={name} maxLength={40} autoFocus onChange={(e) => setName(e.target.value)} placeholder={area.area} />
          <button type="submit" className="db-btn db-btn-sm" disabled={saving}>Save</button>
          {area.custom_label && (
            <button type="button" className="db-link" onClick={() => setName("")}>Reset</button>
          )}
          <button type="button" className="db-link" onClick={() => { setName(area.label); setEditing(false); }}>Cancel</button>
        </form>
      ) : (
        <div className="db-area-head">
          <div className="db-area-name">
            <strong>{area.label}</strong>
            <span>{area.area} · {area.courses} course{area.courses === 1 ? "" : "s"} · {area.credits} credits</span>
          </div>
          <button type="button" className="db-icon-btn" aria-label={`Rename ${area.label}`} title="Rename" onClick={() => setEditing(true)}>
            <Icon name="pencil" size={15} />
          </button>
          <b>{area.gpa.toFixed(2)}</b>
        </div>
      )}
      <div className="db-area-track" role="img" aria-label={`Average ${area.gpa.toFixed(2)} out of 4, your CGPA is ${cgpa.toFixed(2)}`}>
        <span className="db-area-fill" style={{ width: `${(area.gpa / 4) * 100}%` }} />
        <span className="db-area-cgpa" style={{ left: `${(cgpa / 4) * 100}%` }} />
      </div>
      <p className={`db-area-verdict ${diff >= 0 ? "up" : "down"}`}>
        {Math.abs(diff) < 0.05 ? "About the same as your CGPA" : diff > 0 ? `${diff.toFixed(2)} above your CGPA` : `${Math.abs(diff).toFixed(2)} below your CGPA`}
      </p>
    </li>
  );
}

/** Shown instead of the next-class target once a programme is finished. */
function FinalResultCard({ summary: s, overview, enrollmentId, target, estimate, onCredits }) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const cls = classStyle(s.classification);
  const award = overview.award_type === "diploma" ? "diploma" : "degree";

  const download = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await downloadTranscript(overview.status === "completed" ? enrollmentId : undefined,
        `transcript_${overview.index_number || "programme"}.pdf`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="db-card db-final" aria-labelledby="db-final">
      <div className="db-card-head">
        <h2 id="db-final" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="check" size={16} /></span>Your final result</h2>
      </div>
      <div className="db-final-score">
        <strong>{s.cgpa.toFixed(2)}</strong>
        <span className="db-pill" style={{ color: cls.color, background: cls.bg, borderColor: cls.border }}>{s.classification}</span>
      </div>
      <dl className="db-final-facts">
        <div><dt>Credits</dt><dd>{s.credits_completed}</dd></div>
        <div><dt>Courses</dt><dd>{s.courses_completed}</dd></div>
        <div><dt>Best semester</dt><dd>{s.best_semester.gpa.toFixed(2)}</dd></div>
      </dl>
      <p className="db-body">Your {award} CGPA is final unless a result changes.</p>
      <button type="button" className="db-btn" onClick={download} disabled={busy}>
        <Icon name="document" size={18} /> {busy ? "Preparing PDF..." : "Download transcript"}
      </button>
      {failed && <p className="db-note" role="alert">The transcript could not be downloaded. Please try again.</p>}
      <TargetEditor target={target} estimate={estimate} onChange={onCredits} />
    </section>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { selectedEnrollmentId, setSelectedId } = useProgrammes();
  const [announcements, setAnnouncements] = useState([]);
  const [remainingCredits, setRemainingCredits] = useState(null);
  const [tab, setTab] = useState("overview");
  const checklistKey = `gradeiq.checklistHidden.${user?.index_number || "me"}`;
  const [checklistHidden, setChecklistHidden] = useState(() => storageGet(checklistKey) === "1");

  // Shown instantly on a return visit, then refreshed in the background
  const { data, error: loadError, reload } = useCached(
    `dashboard:${selectedEnrollmentId || "current"}:${remainingCredits || ""}`,
    () => Promise.all([getDashboard(selectedEnrollmentId), getInsights(selectedEnrollmentId, remainingCredits)]),
    { keepPrevious: true },
  );
  const [overview, insights] = data || [];
  const error = loadError ? "We could not load your dashboard. Check your connection and refresh the page." : "";
  useEffect(() => {
    getActiveAnnouncements().then(setAnnouncements).catch(() => setAnnouncements([]));
  }, []);

  if (!data && !error) return <PageSkeleton variant="dashboard" label="Loading your dashboard" />;

  if (error || !overview || !insights) {
    return (
      <div className="db">
        <div className="db-card db-error" role="alert">
          <Icon name="alert" size={22} />
          <p>{error || "Something went wrong."}</p>
          <button type="button" className="db-btn" onClick={() => reload().catch(() => {})}>Try again</button>
        </div>
      </div>
    );
  }

  const s = insights.summary;
  const displayName = niceName(overview.preferred_name || overview.name);
  const offerTopUp = insights.stage?.key === "complete" && insights.award_type === "diploma"
    && !(overview.other_programmes || []).some((p) => p.award_type === "degree");
  const cls = classStyle(s.classification || "No results yet");
  const openProgramme = (id, path) => { setSelectedId(id); navigate(path); };

  const checklist = [
    { label: "Add your semester results", done: insights.has_results, link: "/results", cta: "Add results" },
    { label: "Tell us what to call you", done: Boolean(overview.preferred_name), link: "/profile", cta: "Set name" },
    ...(overview.needs_review ? [{ label: "Confirm your programme details", done: false, link: "/profile", cta: "Review" }] : []),
  ];
  const showChecklist = !checklistHidden && checklist.some((i) => !i.done);
  const head = insights.has_results ? headline(s, overview) : null;

  return (
    <div className="db">
      {/* ---------- Hero ---------- */}
      <section className="db-hero db-rise" aria-label="Summary">
        <img className="db-hero-photo" src={campusPhoto} alt="" aria-hidden="true" />
        <div className="db-hero-top">
          <div>
            <p className="db-hero-greet">{greeting()}, {displayName}</p>
            <h1 className="db-hero-title">Your academic overview</h1>
            <ul className="db-hero-chips" aria-label="Programme details">
              <li><Icon name="layers" size={14} />{overview.programme}</li>
              <li className={overview.completed ? "db-chip-done" : ""}>
                {overview.completed && <Icon name="check" size={14} strokeWidth={2.6} />}
                {overview.level_label || `Level ${overview.level}`}
              </li>
              <li><Icon name="user" size={14} />{overview.index_number || "No index number"}</li>
            </ul>
          </div>
          <Link to="/results" className="db-btn"><Icon name="results" size={18} /> Add results</Link>
        </div>

        {insights.has_results && (
          <div className="db-hero-score">
            <div className="db-hero-ring">
              <CgpaRing value={s.cgpa} />
              <div className="db-hero-ring-side">
                <p className="db-label">
                  Your CGPA
                  <Help label="CGPA" tone="dark">
                    Your Cumulative Grade Point Average: the average of every grade you have earned on this programme,
                    weighted by credit hours. It decides your final class.
                  </Help>
                </p>
                <span className="db-pill" style={{ color: cls.color, background: cls.bg, borderColor: cls.border }}>{s.classification}</span>
              </div>
            </div>
            <div className="db-hero-text">
              <p className="db-headline-main">{head.main}</p>
              {head.sub && <p className="db-headline-sub">{head.sub}</p>}
              <BandMeter summary={s} />
            </div>
          </div>
        )}
      </section>

      {announcements.map((a) => (
        <div key={a.id} className={`db-banner db-banner-${a.priority === "urgent" ? "urgent" : "info"}`}>
          <Icon name="bell" size={20} />
          <p><strong>{a.title}.</strong> {a.message}</p>
        </div>
      ))}

      {showChecklist && (
        <Checklist items={checklist} onDismiss={() => { storageSet(checklistKey, "1"); setChecklistHidden(true); }} />
      )}

      {!insights.has_results && <StageCard stage={insights.stage} history={insights.history} />}

      {!insights.has_results ? (
        <section className="db-card db-empty">
          <div className="db-empty-icon"><Icon name="results" size={30} /></div>
          <h2>Start with your result slip</h2>
          <p>Add each course with its credit hours and grade. Your GPA, CGPA, class, strengths and weaknesses will appear here straight away.</p>
          <Link to="/results" className="db-btn">Add your first results</Link>
        </section>
      ) : (
        <>
          <StageCard stage={insights.stage} history={insights.history} topUpLink={offerTopUp} />

          {/* ---------- Tabs ---------- */}
          <div className="db-tabs" role="tablist" aria-label="Dashboard sections">
            {TABS.map((t) => (
              <button key={t.id} type="button" role="tab" id={`tab-${t.id}`} aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`} className="db-tab" onClick={() => setTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div role="tabpanel" id="panel-overview" aria-labelledby="tab-overview" className="db-panel">
              <section className="db-stats" aria-label="Quick figures">
                <article className="db-card db-stat db-rise">
                  <span className="db-stat-icon db-stat-icon-blue"><Icon name="chart" size={20} /></span>
                  <p className="db-label">Latest semester GPA
                    <Help label="Semester GPA">The average of your grades in one semester only. Your CGPA combines all of them.</Help>
                  </p>
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
                <article className="db-card db-stat db-rise">
                  <span className="db-stat-icon db-stat-icon-gold"><Icon name="layers" size={20} /></span>
                  <p className="db-label">Credits completed
                    <Help label="Credits">Each course is worth credit hours (usually 2 to 4). Courses with more credits count more towards your CGPA.</Help>
                  </p>
                  <strong className="db-stat-value">{s.credits_completed}</strong>
                  <p className="db-stat-sub">from {s.courses_completed} courses</p>
                  <div className="db-progress" aria-hidden="true">
                    {Array.from({ length: insights.estimate.total_semesters }, (_, i) => (
                      <span key={i} className={i < insights.estimate.semesters_done ? "on" : ""} />
                    ))}
                  </div>
                  <p className="db-note">{insights.estimate.semesters_done} of {insights.estimate.total_semesters} semesters recorded</p>
                </article>
                <article className="db-card db-stat db-rise">
                  <span className="db-stat-icon db-stat-icon-green"><Icon name="target" size={20} /></span>
                  <p className="db-label">Best semester</p>
                  <strong className="db-stat-value">{s.best_semester.gpa.toFixed(2)}</strong>
                  <p className="db-stat-sub">{s.best_semester.title}</p>
                  {s.semesters_completed > 1 && (
                    <p className="db-note">Lowest: {s.weakest_semester.gpa.toFixed(2)} in {s.weakest_semester.title}</p>
                  )}
                </article>
              </section>

              {insights.actions.length > 0 && (
                <section className="db-card" aria-labelledby="db-next">
                  <div className="db-card-head"><h2 id="db-next" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="arrowRight" size={16} /></span>What to do next</h2></div>
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

              <div className="db-grid db-grid-wide">
                <section className="db-card" aria-labelledby="db-trend">
                  <div className="db-card-head">
                    <h2 id="db-trend" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="chart" size={16} /></span>GPA over time</h2>
                    <Link to="/gpa" className="db-link">Details</Link>
                  </div>
                  <TrendChart history={insights.history} bands={insights.classification_bands} />
                </section>

                {overview.completed && !insights.target ? (
                  <FinalResultCard summary={s} overview={overview} enrollmentId={insights.enrollment_id}
                    target={insights.target} estimate={insights.estimate} onCredits={setRemainingCredits} />
                ) : (
                <section className="db-card db-target" aria-labelledby="db-target">
                    <div className="db-card-head">
                      <h2 id="db-target" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="target" size={16} /></span>Reaching {s.next_class || "the top"}</h2>
                    </div>
                    {!s.next_class ? (
                      <p className="db-body">You are already in the highest class. Keep your semester GPAs at this level to hold it.</p>
                    ) : insights.target ? (
                      insights.target.achievable ? (
                        <>
                          <p className="db-target-lead">Average this grade in your remaining courses:</p>
                          <p className="db-target-grade"><strong>{insights.target.required_grade}</strong><span>or better</span></p>
                        </>
                      ) : (
                        <>
                          <p className="db-target-lead"><strong>{insights.target.target_class}</strong> is out of reach with the credits left.</p>
                          <p className="db-body">The highest CGPA still possible is <strong>{insights.target.max_possible_cgpa.toFixed(2)}</strong>. Focus on holding your {s.classification}.</p>
                        </>
                      )
                    ) : (
                      <p className="db-body">Every semester of this programme is recorded, so your CGPA is final unless a result changes.</p>
                    )}
                    {s.next_class && <TargetEditor target={insights.target} estimate={insights.estimate} onChange={setRemainingCredits} />}
                    <Link to="/planner" className="db-btn db-btn-ghost">Try different grades in the planner</Link>
                </section>
                )}
              </div>
            </div>
          )}

          {tab === "strengths" && (
            <div role="tabpanel" id="panel-strengths" aria-labelledby="tab-strengths" className="db-panel">
              <div className="db-grid">
                <section className="db-card" aria-labelledby="db-down">
                  <div className="db-card-head">
                    <h2 id="db-down" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="arrowDownRight" size={16} /></span>Courses that lowered your CGPA</h2>
                    <Help label="Lowered your CGPA">
                      How much higher your CGPA would be without that course. Low grades in courses with more credits cost the most.
                    </Help>
                  </div>
                  {insights.pulling_down.length ? (
                    <ul className="db-courses">
                      {insights.pulling_down.map((c) => (
                        <li key={c.result_id}>
                          <span className="db-grade db-grade-low">{c.grade}</span>
                          <div><strong>{c.course_name}</strong><small>{c.course_code} · {c.credit_hours} credits · {c.academic_year} S{c.semester}</small></div>
                          <Effect value={c.cgpa_effect} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="db-body">No course is below your CGPA. That is a strong, even record.</p>}
                </section>

                <section className="db-card" aria-labelledby="db-up">
                  <div className="db-card-head"><h2 id="db-up" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="arrowUp" size={16} /></span>Courses that raised your CGPA</h2></div>
                  {insights.strongest.length ? (
                    <ul className="db-courses">
                      {insights.strongest.map((c) => (
                        <li key={c.result_id}>
                          <span className="db-grade db-grade-high">{c.grade}</span>
                          <div><strong>{c.course_name}</strong><small>{c.course_code} · {c.credit_hours} credits · {c.academic_year} S{c.semester}</small></div>
                          <Effect value={c.cgpa_effect} />
                        </li>
                      ))}
                    </ul>
                  ) : <p className="db-body">No A or B+ grades yet. Your first ones will show here.</p>}
                </section>
              </div>

              <div className="db-grid">
                <section className="db-card" aria-labelledby="db-areas">
                  <div className="db-card-head">
                    <h2 id="db-areas" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="layers" size={16} /></span>By subject area</h2>
                    <Help label="Subject areas">
                      Courses grouped by the letters at the start of their code. Rename an area with the pencil if the name does not fit.
                    </Help>
                  </div>
                  <ul className="db-areas">
                    {insights.areas.map((a) => (
                      <AreaRow key={a.area} area={a} cgpa={s.cgpa} enrollmentId={insights.enrollment_id} onSaved={() => reload().catch(() => {})} />
                    ))}
                  </ul>
                  <p className="db-note"><span className="db-cgpa-mark" aria-hidden="true" /> marks your CGPA.</p>
                </section>

                <section className="db-card" aria-labelledby="db-spread">
                  <div className="db-card-head"><h2 id="db-spread" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="results" size={16} /></span>How many of each grade</h2></div>
                  <GradeSpreadChart distribution={insights.grade_distribution} />
                </section>
              </div>
            </div>
          )}
        </>
      )}

      {/* ---------- Academic history ---------- */}
      {overview.other_programmes?.length > 0 && (
        <section className="db-card" aria-labelledby="db-history">
          <div className="db-card-head"><h2 id="db-history" className="db-h2"><span className="db-h2-icon" aria-hidden="true"><Icon name="document" size={16} /></span>Academic history</h2></div>
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
