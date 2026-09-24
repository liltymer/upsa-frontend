import { useCallback, useEffect, useState } from "react";
import Icon from "../components/landing/Icon";
import { Dialog, Menu, Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/admin/admin.css";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../services/api";
import { deleteUser, getUsers, setUserRole } from "../services/admin";

// "today", "3 days ago", "12 Mar 2026"
function ago(iso) {
  if (!iso) return "Never";
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [programme, setProgramme] = useState("");
  const [role, setRole] = useState("all");
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
  if (!users) return <div className="db db-loading"><div className="db-spinner" /><p>Loading accounts...</p></div>;

  const programmes = [...new Set(users.map((u) => u.programme).filter(Boolean))].sort();
  const q = query.trim().toLowerCase();
  const shown = users.filter((u) => {
    if (role !== "all" && u.role !== role) return false;
    if (programme && u.programme !== programme) return false;
    if (!q) return true;
    return [u.name, u.email, ...u.programmes.map((p) => p.index_number)].some((v) => v && v.toLowerCase().includes(q));
  });
  const admins = users.filter((u) => u.role === "admin").length;

  const act = async (fn) => {
    try {
      const res = await fn();
      setDialog(null);
      await load();
      setToast({ msg: res.message });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "That did not work."), type: "error" });
    }
  };

  return (
    <div className="db rs ad">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Admin</p>
          <h1 className="db-title">Students and admins</h1>
          <p className="db-meta">{users.length - admins} students, {admins} admin{admins === 1 ? "" : "s"}. Grades are never shown here.</p>
        </div>
      </header>

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
          <div className="ad-tabs" role="group" aria-label="Filter by role">
            {[["all", "All"], ["student", "Students"], ["admin", "Admins"]].map(([key, label]) => (
              <button key={key} type="button" aria-pressed={role === key} className={role === key ? "on" : ""} onClick={() => setRole(key)}>{label}</button>
            ))}
          </div>
        </div>

        <div className="ad-table-wrap">
          <table className="ad-table">
            <thead>
              <tr>
                <th scope="col">Name</th>
                <th scope="col">Programmes</th>
                <th scope="col" className="ad-hide-sm">Joined</th>
                <th scope="col" className="ad-hide-sm">Last active</th>
                <th scope="col" className="ad-num ad-hide-sm">Results</th>
                <th scope="col"><span className="db-sr">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {shown.map((u) => (
                <tr key={u.id}>
                  <td>
                    <strong>{u.name}</strong> {u.role === "admin" && <span className="ad-pill ad-pill-navy">Admin</span>}
                    <small>{u.email}</small>
                  </td>
                  <td>
                    {u.programmes.length ? u.programmes.map((p) => (
                      <small key={`${p.programme}-${p.index_number}`}>
                        {p.programme} · {p.index_number || "no index"}{p.is_current ? "" : " · completed"}
                      </small>
                    )) : <small>No programme</small>}
                  </td>
                  <td className="ad-hide-sm">{u.joined ? ago(u.joined) : "-"}</td>
                  <td className="ad-hide-sm">{ago(u.last_active)}</td>
                  <td className="ad-num ad-hide-sm">{u.results_count}</td>
                  <td className="ad-actions">
                    {!(u.index_number === me?.index_number && u.name === me?.name) && (
                      <Menu label={`Options for ${u.name}`} items={[
                        u.role === "admin"
                          ? { label: "Remove admin rights", icon: "shield", onClick: () => setDialog({ type: "role", user: u, role: "student" }) }
                          : { label: "Make admin", icon: "shield", onClick: () => setDialog({ type: "role", user: u, role: "admin" }) },
                        u.role === "student" && { label: "Delete account", icon: "trash", danger: true, onClick: () => setDialog({ type: "delete", user: u }) },
                      ]} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="ad-count">{shown.length === users.length ? `${users.length} accounts` : `${shown.length} of ${users.length} accounts`}</p>
      </section>

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
