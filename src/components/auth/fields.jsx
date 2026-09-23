import { useState } from "react";
import Icon from "../landing/Icon";

// Form building blocks for the auth pages. Each field shows its hint, or its
// error when there is one, and wires up the right aria attributes.

function describedBy(id, error, hint) {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

function FieldMessage({ id, error, hint }) {
  if (error) return <p className="au-field-error" id={`${id}-error`}>{error}</p>;
  if (hint) return <p className="au-hint" id={`${id}-hint`}>{hint}</p>;
  return null;
}

export function TextField({ id, label, error, hint, labelAside, ...inputProps }) {
  return (
    <div className="au-field">
      <div className="au-label-row">
        <label className="au-label" htmlFor={id}>{label}</label>
        {labelAside}
      </div>
      <input
        id={id}
        name={id}
        className="au-input"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
      />
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function PasswordField({ id, label, error, hint, labelAside, children, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="au-field">
      <div className="au-label-row">
        <label className="au-label" htmlFor={id}>{label}</label>
        {labelAside}
      </div>
      <div className="au-input-wrap">
        <input
          id={id}
          name={id}
          type={visible ? "text" : "password"}
          className="au-input au-input-password"
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy(id, error, hint)}
          {...inputProps}
        />
        <button
          type="button"
          className="au-eye"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          title={visible ? "Hide password" : "Show password"}
        >
          <Icon name={visible ? "eyeOff" : "eye"} size={20} strokeWidth={1.9} />
        </button>
      </div>
      <FieldMessage id={id} error={error} hint={hint} />
      {children}
    </div>
  );
}

// Live list of password rules with a strength bar
export function PasswordStrength({ checks, score }) {
  const labels = ["", "Weak", "Fair", "Strong", "Very strong"];
  return (
    <div className="au-strength" aria-live="polite">
      <div className="au-strength-bar" data-score={score}>
        {[1, 2, 3, 4].map((i) => <span key={i} className={i <= score ? "on" : ""} />)}
      </div>
      {score > 0 && <p className="au-strength-label">Password strength: <strong>{labels[score]}</strong></p>}
      <ul className="au-rules">
        {checks.map((c) => (
          <li key={c.id} className={c.met ? "met" : ""}>
            <Icon name={c.met ? "check" : "dot"} size={14} strokeWidth={2.6} />
            <span>{c.label}</span>
            <span className="au-sr">{c.met ? " (done)" : " (still needed)"}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

// Text input with suggestions: students can pick from the list or type their own value
export function ComboField({ id, label, error, hint, options, ...inputProps }) {
  const listId = `${id}-options`;
  return (
    <div className="au-field">
      <label className="au-label" htmlFor={id}>{label}</label>
      <input
        id={id}
        name={id}
        list={listId}
        className="au-input au-combo"
        autoComplete="off"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...inputProps}
      />
      <datalist id={listId}>
        {options.map((opt) => <option key={opt} value={opt} />)}
      </datalist>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function SelectField({ id, label, error, hint, placeholder, options, ...selectProps }) {
  return (
    <div className="au-field">
      <label className="au-label" htmlFor={id}>{label}</label>
      <select
        id={id}
        name={id}
        className="au-input au-select"
        aria-invalid={Boolean(error)}
        aria-describedby={describedBy(id, error, hint)}
        {...selectProps}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => {
          const value = typeof opt === "object" ? opt.value : opt;
          const text = typeof opt === "object" ? opt.label : opt;
          return <option key={value} value={value}>{text}</option>;
        })}
      </select>
      <FieldMessage id={id} error={error} hint={hint} />
    </div>
  );
}

export function Alert({ tone = "error", children }) {
  return (
    <div className={`au-alert au-alert-${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "error" ? "alert" : tone === "success" ? "check" : "info"} size={18} strokeWidth={2} />
      <span>{children}</span>
    </div>
  );
}
