import { useCallback, useEffect, useState } from "react";
import Icon from "../components/landing/Icon";
import { Dialog, Menu, Toast } from "../components/results/ui";
import "../components/dashboard/dashboard.css";
import "../components/results/results.css";
import "../components/admin/admin.css";
import { getErrorMessage } from "../services/api";
import { createAnnouncement, deleteAnnouncement, getAnnouncements, updateAnnouncement } from "../services/admin";

const PRIORITY = {
  normal: { label: "Normal", pill: "ad-pill-soft" },
  important: { label: "Important", pill: "ad-pill-gold" },
  urgent: { label: "Urgent", pill: "ad-pill-red" },
};
const when = (d) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

export default function AdminAnnouncements() {
  const [items, setItems] = useState(null);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const clearToast = useCallback(() => setToast(null), []);

  const load = useCallback(() => getAnnouncements().then(setItems)
    .catch((err) => setError(getErrorMessage(err, "Could not load announcements."))), []);

  useEffect(() => {
    let active = true;
    getAnnouncements().then((d) => active && setItems(d))
      .catch((err) => active && setError(getErrorMessage(err, "Could not load announcements.")));
    return () => { active = false; };
  }, []);

  const act = async (fn) => {
    try {
      const res = await fn();
      setDialog(null);
      await load();
      setToast({ msg: res?.message || "Saved." });
    } catch (err) {
      setToast({ msg: getErrorMessage(err, "That did not work."), type: "error" });
    }
  };

  if (error && !items) return <div className="db rs"><div className="db-card rs-empty"><p className="rs-error" role="alert"><Icon name="alert" size={18} /> {error}</p></div></div>;
  if (!items) return <div className="db db-loading"><div className="db-spinner" /><p>Loading announcements...</p></div>;

  const showing = items.filter((a) => a.is_active).length;

  return (
    <div className="db rs ad">
      <header className="db-header">
        <div>
          <p className="db-eyebrow">Admin</p>
          <h1 className="db-title">Announcements</h1>
          <p className="db-meta">Notices shown to every student on their dashboard. {showing} showing now.</p>
        </div>
        <div className="rs-head-actions">
          <button type="button" className="db-btn" onClick={() => setDialog({ type: "edit" })}><Icon name="plus" size={18} /> New announcement</button>
        </div>
      </header>

      {items.length === 0 ? (
        <section className="db-card rs-empty">
          <span className="rs-empty-icon"><Icon name="bell" size={28} /></span>
          <h2 className="db-h2">No announcements yet</h2>
          <p className="ad-muted">Post a notice, such as a registration deadline or a change to exam dates. Students see it on their dashboard.</p>
          <button type="button" className="db-btn" onClick={() => setDialog({ type: "edit" })}><Icon name="plus" size={18} /> New announcement</button>
        </section>
      ) : (
        <ul className="ad-ann">
          {items.map((a) => (
            <li key={a.id} className={a.is_active ? "" : "off"}>
              <div className="ad-ann-body">
                <div className="ad-ann-meta">
                  <span className={`ad-pill ${a.is_active ? "ad-pill-green" : "ad-pill-soft"}`}>{a.is_active ? "Showing" : "Hidden"}</span>
                  <span className={`ad-pill ${PRIORITY[a.priority]?.pill || "ad-pill-soft"}`}>{PRIORITY[a.priority]?.label || a.priority}</span>
                  <span>Posted {when(a.created_at)}{a.updated_at ? `, edited ${when(a.updated_at)}` : ""}</span>
                </div>
                <strong>{a.title}</strong>
                <p>{a.message}</p>
              </div>
              <Menu label={`Options for ${a.title}`} items={[
                { label: "Edit", icon: "pencil", onClick: () => setDialog({ type: "edit", item: a }) },
                { label: a.is_active ? "Hide from students" : "Show to students", icon: a.is_active ? "eyeOff" : "eye",
                  onClick: () => act(() => updateAnnouncement(a.id, { is_active: !a.is_active })) },
                { label: "Delete", icon: "trash", danger: true, onClick: () => setDialog({ type: "delete", item: a }) },
              ]} />
            </li>
          ))}
        </ul>
      )}

      {dialog?.type === "edit" && (
        <AnnouncementDialog item={dialog.item} onClose={() => setDialog(null)}
          onSave={(body) => act(() => (dialog.item ? updateAnnouncement(dialog.item.id, body) : createAnnouncement(body)))} />
      )}
      {dialog?.type === "delete" && (
        <Dialog title={`Delete "${dialog.item.title}"?`} subtitle="It disappears from every dashboard. To keep it for later, hide it instead."
          onClose={() => setDialog(null)}
          footer={(
            <>
              <button type="button" className="db-btn db-btn-ghost" onClick={() => setDialog(null)}>Cancel</button>
              <button type="button" className="db-btn rs-btn-danger" onClick={() => act(() => deleteAnnouncement(dialog.item.id))}>
                <Icon name="trash" size={18} /> Delete
              </button>
            </>
          )} />
      )}
      <Toast toast={toast} onDone={clearToast} />
    </div>
  );
}

function AnnouncementDialog({ item, onClose, onSave }) {
  const [form, setForm] = useState({
    title: item?.title || "",
    message: item?.message || "",
    priority: item?.priority || "normal",
    is_active: item?.is_active ?? true,
  });
  const [busy, setBusy] = useState(false);
  const ready = form.title.trim().length >= 3 && form.message.trim().length >= 3;
  const submit = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setBusy(true);
    await onSave({ ...form, title: form.title.trim(), message: form.message.trim() });
    setBusy(false);
  };
  return (
    <Dialog title={item ? "Edit announcement" : "New announcement"} subtitle="Shown on every student's dashboard while it is set to show." onClose={onClose}
      footer={(
        <>
          <button type="button" className="db-btn db-btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" form="ad-ann" className="db-btn" disabled={!ready || busy}>{busy ? "Saving..." : item ? "Save changes" : "Post announcement"}</button>
        </>
      )}>
      <form id="ad-ann" className="rs-form" onSubmit={submit}>
        <div className="rs-field">
          <label className="rs-label" htmlFor="ad-a-title">Title</label>
          <input id="ad-a-title" className="rs-input" maxLength={120} required value={form.title}
            placeholder="e.g. Registration closes on Friday" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="rs-field">
          <label className="rs-label" htmlFor="ad-a-msg">Message</label>
          <textarea id="ad-a-msg" className="rs-input ad-textarea" maxLength={2000} required value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </div>
        <div className="rs-field">
          <span className="rs-label" id="ad-a-pri">Priority</span>
          <div className="rs-segment" role="radiogroup" aria-labelledby="ad-a-pri" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
            {Object.entries(PRIORITY).map(([key, p]) => (
              <button key={key} type="button" role="radio" aria-checked={form.priority === key}
                className={form.priority === key ? "on" : ""} onClick={() => setForm({ ...form, priority: key })}>{p.label}</button>
            ))}
          </div>
        </div>
        <label className="ad-check">
          <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
          Show to students now
        </label>
      </form>
    </Dialog>
  );
}
