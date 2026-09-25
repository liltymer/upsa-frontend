import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/admin/admin.css";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { getAdminAnalytics, getAdminInsights, getAdminStats, getAnnouncements } from "../services/admin";

// Validated pair used across the app's charts
const SERIES = { signups: "#2f5bb7", results: "#b57f00" };
const LEVEL_ICON = { critical: "alert", warning: "alert", info: "info" };
const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);
const shortDate = (iso) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

/** Counts as labelled bars, largest first. */
function Bars({ rows, total, tone }) {
  if (!rows.length) return <p className="ad-muted">No data yet.</p>;
  return (
    <ul className="ad-bars">
      {rows.map(([label, count]) => (
        <li key={label}>
          <div className="ad-bar-head"><span>{label}</span><strong>{count} <small>({pct(count, total)}%)</small></strong></div>
          <span className="ad-track" aria-hidden="true"><span className={tone} style={{ width: `${pct(count, total)}%` }} /></span>
        </li>
      ))}
    </ul>
  );
}

function ActivityTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload;
  return (
    <div className="db-tooltip">
      <p className="db-tooltip-title">Week of {shortDate(label)}</p>
      <p><span className="db-key" style={{ background: SERIES.signups }} />Sign-ups <strong>{row.signups}</strong></p>
      <p><span className="db-key" style={{ background: SERIES.results }} />Results entered <strong>{row.results}</strong></p>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [insights, setInsights] = useState(null);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getAdminStats(), getAdminAnalytics(), getAdminInsights(), getAnnouncements()])
      .then(([s, a, i, n]) => {
        if (!active) return;
        setStats(s); setAnalytics(a); setInsights(i); setNotices(n.slice(0, 3));
      })
      .catch((err) => active && setError(getErrorMessage(err, "Could not load the overview.")));
    return () => { active = false; };
  }, []);

  if (error) return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  if (!stats || !analytics || !insights) return <PageSkeleton variant="summary" label="Loading the overview" />;

  const act = insights.activity;
  const withResults = analytics.total_analysed - analytics.standing.no_data;
  const classRows = (award) => Object.entries(analytics.classification_by_award_type?.[award] || {})
    .filter(([label, count]) => label !== "No Data" && count > 0);
  const diplomaTotal = classRows("diploma").reduce((s, [, c]) => s + c, 0);
  const degreeTotal = classRows("degree").reduce((s, [, c]) => s + c, 0);
  const programmes = [...stats.programme_distribution].sort((a, b) => b.count - a.count).map((p) => [p.programme, p.count]);
  const levels = stats.level_distribution.map((l) => [`Level ${l.level}`, l.count]);
  const students = stats.total_students;
  const topUp = insights.top_up;
  const diplomaStudents = topUp.topped_up + topUp.diploma_finished_not_topped_up + topUp.diploma_in_progress;

  return (
    <div className="db rs ad">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Admin</p>
          <h1 className="db-title">Platform overview</h1>
          <p className="db-meta">Welcome back, {user?.name}. Counts only: no student can be identified here.</p>
        </div>
      </header>

      {/* ---------- Needs attention ---------- */}
      <section className="db-card" aria-labelledby="ad-attn">
        <div className="db-card-head">
          <h2 id="ad-attn" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="bell" size={16} /></span>
            Needs your attention
          </h2>
          <span className={`ad-pill ${insights.attention.length ? "ad-pill-gold" : "ad-pill-green"}`}>
            {insights.attention.length ? `${insights.attention.length} item${insights.attention.length === 1 ? "" : "s"}` : "All clear"}
          </span>
        </div>
        {insights.attention.length ? (
          <ul className="ad-attn">
            {insights.attention.map((a) => (
              <li key={a.title} className={`ad-attn-${a.level}`}>
                <span className="ad-attn-icon"><Icon name={LEVEL_ICON[a.level]} size={18} /></span>
                <div>
                  <strong>{a.count != null && <span className="ad-attn-count">{a.count}</span>}{a.title}</strong>
                  <p>{a.body}</p>
                </div>
                {a.link && <Link to={a.link} className="db-btn db-btn-ghost db-btn-sm">Open <Icon name="arrowRight" size={14} /></Link>}
              </li>
            ))}
          </ul>
        ) : <p className="ad-muted">Nothing needs you right now.</p>}
      </section>

      {/* ---------- Summary ---------- */}
      <section className="rs-summary" aria-label="Summary">
        <div className="rs-sum rs-sum-main">
          <span className="rs-sum-icon"><Icon name="user" size={22} /></span>
          <div><p>Students</p><strong>{students}</strong><span className="ad-sum-sub">+{act.signups_7d} this week</span></div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="check" size={22} /></span>
          <div><p>Active this week</p><strong>{act.active_7d}</strong><span className="ad-sum-sub">{act.active_30d} in 30 days</span></div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="layers" size={22} /></span>
          <div><p>Results entered</p><strong>{stats.total_results}</strong><span className="ad-sum-sub">+{act.results_7d} this week</span></div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="arrowUp" size={22} /></span>
          <div><p>Top-up students</p><strong>{stats.top_up_students}</strong><span className="ad-sum-sub">diploma to degree</span></div>
        </div>
      </section>

      {/* ---------- Activity ---------- */}
      <section className="db-card" aria-labelledby="ad-activity">
        <div className="db-card-head">
          <h2 id="ad-activity" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="chart" size={16} /></span>
            Activity, last 8 weeks
          </h2>
        </div>
        <ul className="db-legend">
          <li><span className="db-key" style={{ background: SERIES.signups }} />Sign-ups <strong>{act.signups_30d}</strong><small className="ad-leg-sub"> in 30 days</small></li>
          <li><span className="db-key" style={{ background: SERIES.results }} />Results entered <strong>{act.results_30d}</strong><small className="ad-leg-sub"> in 30 days</small></li>
        </ul>
        <div className="ad-chart" role="img" aria-label={`Weekly sign-ups and results for the last 8 weeks. ${act.signups_30d} sign-ups and ${act.results_30d} results in the last 30 days.`}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={act.weekly} margin={{ top: 8, right: 8, bottom: 0, left: -16 }} barGap={3}>
              <CartesianGrid stroke="#e3e8f2" strokeDasharray="4 6" vertical={false} />
              <XAxis dataKey="week_start" tickFormatter={shortDate} tick={{ fill: "#6b7690", fontSize: 12 }} tickLine={false} axisLine={false} dy={6} />
              <YAxis allowDecimals={false} tick={{ fill: "#6b7690", fontSize: 12 }} tickLine={false} axisLine={false} />
              <Tooltip content={<ActivityTooltip />} cursor={{ fill: "rgba(8, 28, 70, 0.04)" }} />
              <Bar dataKey="signups" fill={SERIES.signups} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
              <Bar dataKey="results" fill={SERIES.results} radius={[4, 4, 0, 0]} maxBarSize={18} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* ---------- Standing ---------- */}
      <section className="db-card" aria-labelledby="ad-standing">
        <div className="db-card-head">
          <h2 id="ad-standing" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="shield" size={16} /></span>
            Standing, by UPSA's rules
          </h2>
          <span className="ad-pill ad-pill-soft">{withResults} students with results</span>
        </div>
        <div className="ad-standing">
          <div className="ad-s-bad"><strong>{analytics.standing.probation}</strong><span>On probation</span><small>CGPA below 1.00 (handbook 4.19)</small></div>
          <div className="ad-s-warn"><strong>{analytics.standing.failed_to_clear}</strong><span>Failed courses to clear</span><small>At least one F not yet re-taken</small></div>
          <div className="ad-s-good"><strong>{analytics.standing.clean}</strong><span>Clean record</span><small>No D or F on record</small></div>
        </div>
        <p className="ad-count">Average CGPA across current programmes: <strong>{analytics.average_cgpa.toFixed(2)}</strong></p>
      </section>

      <div className="ad-grid">
        <section className="db-card" aria-labelledby="ad-classes">
          <div className="db-card-head">
            <h2 id="ad-classes" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="target" size={16} /></span>
              Classes
            </h2>
          </div>
          <p className="ad-sub">Degree students ({degreeTotal})</p>
          <Bars rows={classRows("degree")} total={degreeTotal} />
          <p className="ad-sub">Diploma students ({diplomaTotal})</p>
          <Bars rows={classRows("diploma")} total={diplomaTotal} tone="gold" />
        </section>

        <section className="db-card" aria-labelledby="ad-prog">
          <div className="db-card-head">
            <h2 id="ad-prog" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="layers" size={16} /></span>
              Programmes and levels
            </h2>
          </div>
          <p className="ad-sub">Current programme</p>
          <Bars rows={programmes} total={students} />
          <p className="ad-sub">Current level</p>
          <Bars rows={levels} total={students} tone="gold" />
        </section>
      </div>

      <div className="ad-grid">
        {/* ---------- Hardest courses ---------- */}
        <section className="db-card" aria-labelledby="ad-hard">
          <div className="db-card-head">
            <h2 id="ad-hard" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="alert" size={16} /></span>
              Hardest courses
            </h2>
          </div>
          {insights.hardest_courses.length ? (
            <ol className="ad-hard">
              {insights.hardest_courses.map((c) => (
                <li key={c.course_code}>
                  <div>
                    <strong>{c.course_code}</strong> {c.course_name}
                    <small>{c.students} students · average grade point {c.average_grade_point.toFixed(2)}</small>
                  </div>
                  <span className="ad-hard-rate"><strong>{Math.round(c.fail_rate * 100)}%</strong><small>D or F</small></span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="ad-muted">Shown once a course has results from at least {insights.min_students_for_course_stats} students, so nobody can be singled out.</p>
          )}
        </section>

        {/* ---------- Top-up pipeline ---------- */}
        <section className="db-card" aria-labelledby="ad-topup">
          <div className="db-card-head">
            <h2 id="ad-topup" className="db-h2">
              <span className="db-h2-icon" aria-hidden="true"><Icon name="arrowUp" size={16} /></span>
              Diploma to degree
            </h2>
          </div>
          {diplomaStudents ? (
            <>
              <div className="ad-funnel">
                <div><strong>{topUp.diploma_in_progress}</strong><span>Diploma in progress</span></div>
                <Icon name="arrowRight" size={18} />
                <div className="ad-funnel-gold"><strong>{topUp.diploma_finished_not_topped_up}</strong><span>Finished, no degree added</span></div>
                <Icon name="arrowRight" size={18} />
                <div className="ad-funnel-green"><strong>{topUp.topped_up}</strong><span>Topped up</span></div>
              </div>
              {topUp.diploma_finished_not_topped_up > 0 && (
                <p className="ad-muted" style={{ marginTop: 12 }}>
                  Students who finished their diploma can add their degree from Profile. An announcement can remind them.
                </p>
              )}
            </>
          ) : <p className="ad-muted">No diploma students yet.</p>}
        </section>
      </div>

      {/* ---------- Announcements ---------- */}
      <section className="db-card" aria-labelledby="ad-notices">
        <div className="db-card-head">
          <h2 id="ad-notices" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="bell" size={16} /></span>
            Latest announcements
          </h2>
          <Link to="/admin/announcements" className="db-link">Manage</Link>
        </div>
        {notices.length ? (
          <ul className="ad-ann">
            {notices.map((n) => (
              <li key={n.id} className={n.is_active ? "" : "off"}>
                <div className="ad-ann-body">
                  <strong>{n.title}</strong>
                  <div className="ad-ann-meta">
                    <span className={`ad-pill ${n.is_active ? "ad-pill-green" : "ad-pill-soft"}`}>{n.is_active ? "Showing" : "Hidden"}</span>
                    <span>{new Date(n.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="ad-muted">No announcements yet. <Link to="/admin/announcements" className="db-link">Post the first one</Link></p>
        )}
      </section>
    </div>
  );
}
