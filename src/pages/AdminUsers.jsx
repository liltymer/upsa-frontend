import { useCallback, useEffect, useState } from "react";
import Icon from "../components/landing/Icon";
import { PageSkeleton } from "../components/ui/Loading";
import { Dialog, Menu, Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/admin/admin.css";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { deleteUser, getUsers, setUserRole } from "../services/admin";

const DAY = 86400000;
const daysSince = (iso) => (iso ? Math.floor((Date.now() - new Date(iso).getTime()) / DAY) : null);

// "Today", "3 days ago", "12 Mar 2026"
function ago(iso) {
  const days = daysSince(iso);
  if (days === null) return "Never";
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

// Green: this week. Amber: this month. Grey: longer or never.
function activity(iso) {
  const days = daysSince(iso);
  if (days === null) return { tone: "none", label: "Not signed in since tracking began" };
  if (days < 7) return { tone: "live", label: "Active this week" };
  if (days < 30) return { tone: "recent", label: "Active this month" };
  return { tone: "idle", label: "Inactive for over a month" };
}

const initials = (name = "") => name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("") || "?";
const shortProgramme = (name) => name
  .replace(/^Bachelor of (Science|Arts) in /, "")
  .replace(/^Bachelor of /, "")
  .replace(/^Diploma in /, "");

const SORTS = {
  recent: { label: "Newest first", fn: (a, b) => (b.joined || "").localeCompare(a.joined || "") },
  active: { label: "Recently active", fn: (a, b) => (b.last_active || "").localeCompare(a.last_active || "") },
  name: { label: "Name A to Z", fn: (a, b) => a.name.localeCompare(b.name) },
  results: { label: "Most results", fn: (a, b) => b.results_count - a.results_count },
};

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [programme, setProgramme] = useState("");
  const [role, setRole] = useState("all");
  const [sort, setSort] = useState("recent");
  const [open, setOpen] = useState(null);
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  const load = useCallback(() => getUsers()
    .then((d) => { setUsers(d.students); setError(""); })
    .catch((err) => setError(getErrorMessage(err, "Could not load the accounts."))), []);

  useEffect(() => {
    let active = true;
    getUsers()
      .then((d) => active && setUsers(d.students))
      .catch((err) => active && setError(getErrorMessage(err, "Could not load the accounts.")));
    return () => { active = false; };
  }, []);

  if (error && !users) return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  if (!users) return <PageSkeleton variant="list" label="Loading accounts" />;

  const isMe = (u) => u.index_number === me?.index_number && u.name === me?.name;
  const students = users.filter((u) => u.role === "student");
  const admins = users.length - students.length;
  const activeWeek = students.filter((u) => (daysSince(u.last_active) ?? 99) < 7).length;
  const newMonth = students.filter((u) => (daysSince(u.joined) ?? 99) < 30).length;
  const topUps = students.filter((u) => u.programmes.length > 1).length;

  const programmes = [...new Set(users.flatMap((u) => u.programmes.map((p) => p.programme)))].sort();
  const q = query.trim().toLowerCase();
  const shown = users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (programme && !u.programmes.some((p) => p.programme === programme)) return false;
    if (!q) return true;
    return [u.name, u.email, ...u.programmes.map((p) => p.index_number)].some((v) => v && v.toLowerCase().includes(q));
  }).sort(SORTS[sort].fn);

  const act = async (fn) => {
    try {
      const res = await fn();
      setDialog(null);
      setOpen(null);
      await load();
      setToast({ msg: res.message });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "That did not work."), type: "error" });
    }
  };
  const menuFor = (u) => [
    { label: "View details", icon: "user", onClick: () => setOpen(u) },
    u.role === "admin"
      ? { label: "Remove admin rights", icon: "shield", onClick: () => setDialog({ type: "role", user: u, role: "student" }) }
      : { label: "Make admin", icon: "shield", onClick: () => setDialog({ type: "role", user: u, role: "admin" }) },
    u.role === "student" && { label: "Delete account", icon: "trash", danger: true, onClick: () => setDialog({ type: "delete", user: u }) },
  ];

  return (
    <div className="db rs ad">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Admin</p>
          <h1 className="db-title">Students and admins</h1>
          <p className="db-meta">Every account on GradeIQ. Grades are never shown here.</p>
        </div>
      </header>

      <section className="ad-tiles" aria-label="Summary">
        <div><span className="ad-tile-icon"><Icon name="user" size={20} /></span><strong>{students.length}</strong><small>Students</small></div>
        <div><span className="ad-tile-icon ad-t-green"><Icon name="check" size={20} /></span><strong>{activeWeek}</strong><small>Active this week</small></div>
        <div><span className="ad-tile-icon ad-t-blue"><Icon name="plus" size={20} /></span><strong>{newMonth}</strong><small>Joined in 30 days</small></div>
        <div><span className="ad-tile-icon ad-t-gold"><Icon name="arrowUp" size={20} /></span><strong>{topUps}</strong><small>Diploma to degree</small></div>
        <div><span className="ad-tile-icon ad-t-navy"><Icon name="shield" size={20} /></span><strong>{admins}</strong><small>Admin{admins === 1 ? "" : "s"}</small></div>
      </section>

      <section className="db-card">
        <div className="ad-toolbar">
          <label className="rs-search">
            <Icon name="search" size={18} />
            <span className="db-sr">Search accounts</span>
            <input type="search" placeholder="Search by name, email or index number" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
          <select className="rs-input" aria-label="Filter by programme" value={programme} onChange={(e) => setProgramme(e.target.value)}>
            <option value="">All programmes</option>
            {programmes.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <select className="rs-input" aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value)}>
            {Object.entries(SORTS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}
          </select>
          <div className="ad-tabs" role="group" aria-label="Filter by role">
            {[["all", "All"], ["student", "Students"], ["admin", "Admins"]].map(([key, label]) => (
              <button key={key} type="button" aria-pressed={role === key} className={role === key ? "on" : ""} onClick={() => setRole(key)}>{label}</button>
            ))}
          </div>
        </div>

        {shown.length === 0 ? (
          <p className="ad-empty"><Icon name="search" size={20} /> No accounts match. <button type="button" className="db-link" onClick={() => { setQuery(""); setProgramme(""); setRole("all"); }}>Clear filters</button></p>
        ) : (
          <div className="ad-table-wrap">
            <table className="ad-table ad-users">
              <thead>
                <tr>
                  <th scope="col">Person</th>
                  <th scope="col">Programmes</th>
                  <th scope="col" className="ad-hide-sm">Activity</th>
                  <th scope="col" className="ad-num ad-hide-sm">Results</th>
                  <th scope="col"><span className="db-sr">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {shown.map((u) => {
                  const a = activity(u.last_active);
                  return (
                    <tr key={u.id} className="ad-row" onClick={() => setOpen(u)}>
                      <td>
                        <div className="ad-person">
                          <span className={`ad-avatar${u.role === "admin" ? " admin" : ""}`} aria-hidden="true">{initials(u.name)}</span>
                          <div>
                            <strong>{u.name}{u.role === "admin" && <span className="ad-pill ad-pill-navy">Admin</span>}{isMe(u) && <span className="ad-you">You</span>}</strong>
                            <small>{u.email}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="ad-progs">
                          {u.programmes.map((p) => (
                            <span key={`${p.programme}-${p.index_number}`} className={`ad-prog ${p.award_type}${p.is_current ? "" : " done"}`}
                              title={`${p.programme} · ${p.index_number || "no index"}${p.is_current ? "" : " · completed"}`}>
                              <b>{p.award_type === "diploma" ? "Diploma" : "Degree"}</b>
                              <span>{shortProgramme(p.programme)}</span>
                              <em>{p.index_number || "no index"}</em>
                              {!p.is_current && <i>Completed</i>}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="ad-hide-sm">
                        <span className="ad-active"><span className={`ad-dot ${a.tone}`} title={a.label} />{ago(u.last_active)}</span>
                        <small>Joined {ago(u.joined).toLowerCase()}</small>
                      </td>
                      <td className="ad-num ad-hide-sm"><strong>{u.results_count}</strong></td>
                      <td className="ad-actions" onClick={(e) => e.stopPropagation()}>
                        {!isMe(u) && <Menu label={`Options for ${u.name}`} items={menuFor(u)} />}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="ad-foot">
          <p className="ad-count">{shown.length === users.length ? `${users.length} accounts` : `${shown.length} of ${users.length} accounts`}</p>
          <p className="ad-legend-dots">
            <span><span className="ad-dot live" /> This week</span>
            <span><span className="ad-dot recent" /> This month</span>
            <span><span className="ad-dot idle" /> Longer</span>
            <span><span className="ad-dot none" /> Not yet tracked</span>
          </p>
        </div>
      </section>

      {open && (
        <Dialog title={open.name} subtitle={open.email} onClose={() => setOpen(null)}
          footer={!isMe(open) && (
            <>
              {open.role === "student" && (
                <button type="button" className="db-btn db-btn-ghost pf-danger-text" onClick={() => setDialog({ type: "delete", user: open })}>
                  <Icon name="trash" size={16} /> Delete
                </button>
              )}
              <button type="button" className="db-btn" onClick={() => setDialog({ type: "role", user: open, role: open.role === "admin" ? "student" : "admin" })}>
                <Icon name="shield" size={16} /> {open.role === "admin" ? "Remove admin rights" : "Make admin"}
              </button>
            </>
          )}>
          <dl className="ad-facts">
            <div><dt>Role</dt><dd>{open.role === "admin" ? "Admin" : "Student"}</dd></div>
            <div><dt>Joined</dt><dd>{ago(open.joined)}</dd></div>
            <div><dt>Last active</dt><dd>{ago(open.last_active)}</dd></div>
            <div><dt>Results entered</dt><dd>{open.results_count}</dd></div>
          </dl>
          <p className="rs-label">Programmes</p>
          <ul className="ad-list">
            {open.programmes.length ? open.programmes.map((p) => (
              <li key={`${p.programme}-${p.index_number}`}>
                <div>
                  <strong>{p.programme}</strong>
                  <small>{p.award_type === "diploma" ? "Diploma" : "Degree"} · {p.index_number || "No index number"} · {p.is_current ? "Current" : "Completed"}</small>
                </div>
              </li>
            )) : <li><div><small>No programme yet</small></div></li>}
          </ul>
        </Dialog>
      )}

      {dialog?.type === "role" && (
        <Dialog
          title={dialog.role === "admin" ? `Make ${dialog.user.name} an admin?` : `Remove admin rights from ${dialog.user.name}?`}
          subtitle={dialog.role === "admin"
            ? "Admins can see platform counts, manage courses and announcements, and manage other accounts."
            : "They keep their account and results but lose access to the admin pages."}
          onClose={() => setDialog(null)}
          footer={(
            <>
              <button type="button" className="db-btn db-btn-ghost" onClick={() => setDialog(null)}>Cancel</button>
              <button type="button" className="db-btn" onClick={() => act(() => setUserRole(dialog.user.id, dialog.role))}>
                {dialog.role === "admin" ? "Make admin" : "Remove rights"}
              </button>
            </>
          )}
        />
      )}
      {dialog?.type === "delete" && (
        <Dialog
          title={`Delete ${dialog.user.name}?`}
          subtitle={`Their account, programmes and ${dialog.user.results_count} result${dialog.user.results_count === 1 ? "" : "s"} are removed for good.`}
          onClose={() => setDialog(null)}
          footer={(
            <>
              <button type="button" className="db-btn db-btn-ghost" onClick={() => setDialog(null)}>Keep account</button>
              <button type="button" className="db-btn rs-btn-danger" onClick={() => act(() => deleteUser(dialog.user.id))}>
                <Icon name="trash" size={18} /> Delete account
              </button>
            </>
          )}
        />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}
