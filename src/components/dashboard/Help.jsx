import { useEffect, useId, useRef, useState } from "react";
import Icon from "../landing/Icon";

/** Small "?" button that explains a term in one or two plain sentences. */
export default function Help({ label, children, tone = "light" }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <span className={`db-help db-help-${tone}`} ref={ref}>
      <button
        type="button"
        className="db-help-btn"
        aria-expanded={open}
        aria-controls={id}
        aria-label={`What is ${label}?`}
        onClick={() => setOpen(!open)}
      >
        <Icon name="help" size={16} strokeWidth={2} />
      </button>
      {open && (
        <span id={id} role="note" className="db-help-pop">
          <strong>{label}</strong>
          {children}
        </span>
      )}
    </span>
  );
}
