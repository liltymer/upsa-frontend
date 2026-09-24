import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/landing/Icon";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/admin/admin.css";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { getAdminAnalytics, getAdminStats, getAnnouncements } from "../services/admin";

const pct = (n, total) => (total ? Math.round((n / total) * 100) : 0);

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

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [notices, setNotices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    Promise.all([getAdminStats(), getAdminAnalytics(), getAnnouncements()])
      .then(([s, a, n]) => { if (active) { setStats(s); setAnalytics(a); setNotices(n.slice(0, 3)); } })
      .catch((err) => active && setError(getErrorMessage(err, "Could not load the overview.")));
    return () => { active = false; };
  }, []);

  if (error) return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  if (!stats || !analytics) return <div className="db db-loading"><div className="db-spinner" /><p>Loading the overview...</p></div>;

  const withResults = analytics.total_analysed - analytics.standing.no_data;
  const classRows = (award) => Object.entries(analytics.classification_by_award_type?.[award] || {})
    .filter(([label, count]) => label !== "No Data" && count > 0);
  const diplomaTotal = classRows("diploma").reduce((s, [, c]) => s + c, 0);
  const degreeTotal = classRows("degree").reduce((s, [, c]) => s + c, 0);
  const programmes = [...stats.programme_distribution].sort((a, b) => b.count - a.count).map((p) => [p.programme, p.count]);
  const levels = stats.level_distribution.map((l) => [`Level ${l.level}`, l.count]);
  const students = stats.total_students;

  return (
    <div className="db rs ad">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Admin</p>
          <h1 className="db-title">Platform overview</h1>
          <p className="db-meta">Welcome back, {user?.name}. Counts only: no student can be identified here.</p>
        </div>
      </header>

      <section className="rs-summary" aria-label="Summary">
        <div className="rs-sum rs-sum-main">
          <span className="rs-sum-icon"><Icon name="user" size={22} /></span>
          <div><p>Students</p><strong>{students}</strong></div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="results" size={22} /></span>
          <div><p>With results</p><strong>{stats.active_users}</strong></div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="layers" size={22} /></span>
          <div><p>Results entered</p><strong>{stats.total_results}</strong></div>
        </div>
        <div className="rs-sum">
          <span className="rs-sum-icon"><Icon name="arrowUp" size={22} /></span>
          <div><p>Top-up students</p><strong>{stats.top_up_students}</strong></div>
        </div>
      </section>

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

      <section className="db-card" aria-labelledby="ad-notices">
        <div className="db-card-head">
          <h2 id="ad-notices" className="db-h2">
            <span className="db-h2-icon" aria-hidden="true"><Icon name="bell" size={16} /></span>
            Announcements
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
