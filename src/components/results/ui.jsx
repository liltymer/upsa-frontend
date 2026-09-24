import { useEffect, useId, useRef, useState } from "react";
import Icon from "../landing/Icon";

const GRADES = ["A", "B+", "B", "B-", "C+", "C", "C-", "D", "F"];

/** A "…" button with a small list of actions. */
export function Menu({ label, items, align = "right" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === "keydown" ? e.key === "Escape" : !ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  return (
    <div className={`rs-menu rs-menu-${align}`} ref={ref}>
      <button type="button" className="rs-icon-btn" aria-label={label} aria-haspopup="menu" aria-expanded={open}
        onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
        <Icon name="more" size={20} />
      </button>
      {open && (
        <ul className="rs-menu-list" role="menu">
          {items.filter(Boolean).map((item) => (
            <li key={item.label} role="none">
              <button type="button" role="menuitem" className={item.danger ? "rs-danger" : ""}
                onClick={(e) => { e.stopPropagation(); setOpen(false); item.onClick(); }}>
                <Icon name={item.icon} size={17} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Centred panel on desktop, full screen on phones. Escape or the backdrop closes it. */
export function Dialog({ title, subtitle, onClose, children, footer, wide = false }) {
  const titleId = useId();
  const panel = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.activeElement;
    panel.current?.querySelector("input, select, button:not(.rs-dialog-close)")?.focus();
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      previous?.focus?.();
    };
    // Focus once when the dialog opens
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rs-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`rs-dialog${wide ? " rs-dialog-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby={titleId} ref={panel}>
        <header className="rs-dialog-head">
          <div>
            <h2 id={titleId}>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="rs-icon-btn rs-dialog-close" aria-label="Close" onClick={onClose}>
            <Icon name="close" size={20} />
          </button>
        </header>
        <div className="rs-dialog-body">{children}</div>
        {footer && <footer className="rs-dialog-foot">{footer}</footer>}
      </div>
    </div>
  );
}

/** Short message at the bottom of the screen, with an optional Undo. */
export function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(onDone, toast.action ? 7000 : 3500);
    return () => clearTimeout(t);
  }, [toast, onDone]);
  if (!toast) return null;
  return (
    <div className={`rs-toast${toast.type === "error" ? " rs-toast-error" : ""}`} role="status">
      <Icon name={toast.type === "error" ? "alert" : "check"} size={18} />
      <span>{toast.msg}</span>
      {toast.action && (
        <button type="button" onClick={() => { toast.action.onClick(); onDone(); }}>{toast.action.label}</button>
      )}
    </div>
  );
}

/** One tap per grade instead of a dropdown. */
export function GradePicker({ value, onChange, label, invalid }) {
  return (
    <div className={`rs-grades${invalid ? " rs-grades-invalid" : ""}`} role="radiogroup" aria-label={label}>
      {GRADES.map((g) => (
        <button key={g} type="button" role="radio" aria-checked={value === g}
          className={`rs-grade rs-g-${g.replace("+", "p").replace("-", "m")}${value === g ? " on" : ""}`}
          onClick={() => onChange(g)}>
          {g}
        </button>
      ))}
    </div>
  );
}

/**
 * Course code field that suggests matching courses (by code or title) and fills
 * in the title and credits when one is picked. Anything can still be typed.
 */
export function CourseCodeInput({ value, onChange, onPick, catalogue, id, invalid }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const q = value.trim().toUpperCase();
  const matches = q.length < 2 ? [] : catalogue
    .filter((c) => c.code.startsWith(q.replace(/\s/g, "")) || c.name.toUpperCase().includes(q))
    .slice(0, 6);
  const showList = open && matches.length > 0 && !(matches.length === 1 && matches[0].code === q);

  const pick = (course) => {
    onPick(course);
    setOpen(false);
  };

  return (
    <div className="rs-combo">
      <input
        id={id}
        className={`rs-input rs-code${invalid ? " rs-invalid" : ""}`}
        value={value}
        placeholder="e.g. BSIT301"
        autoComplete="off"
        spellCheck={false}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        maxLength={20}
        onChange={(e) => { onChange(e.target.value.toUpperCase()); setOpen(true); setActive(0); }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (!showList) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((active + 1) % matches.length); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((active - 1 + matches.length) % matches.length); }
          if (e.key === "Enter") { e.preventDefault(); pick(matches[active]); }
        }}
      />
      {showList && (
        <ul className="rs-combo-list" id={listId} role="listbox">
          {matches.map((c, i) => (
            <li key={c.code} role="option" aria-selected={i === active}
              className={i === active ? "on" : ""}
              onMouseDown={(e) => { e.preventDefault(); pick(c); }}>
              <strong>{c.code}</strong>
              <span>{c.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
